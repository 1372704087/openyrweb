/**
 * BlowfishKey — Westwood RSA 公钥解密（MIX 封包密钥）。
 *
 * 孪生导出名 BlowfishKey，内部实为大数模幂：
 *  1. base64 风格硬编码公钥串 + 查表解码为二进制
 *  2. key_to_bignum 装入 pubkey.key1，key2 固定 65537
 *  3. process_predata 按 len_predata 分块 calc_a_key（模幂）
 *  4. decryptKey 返回前 56 字节明文
 *
 * 私有类 PubKey 仅承载 key1/key2 两个 64 词大数（不额外导出）。
 *
 * 由 data/encoding/BlowfishKey.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */

/** 公钥串（base64 变体，字符序查表解码）。 */
const PUBKEY_STR = 'AihRvNoIbTn85FZRYNZRcT+i6KpU+maCsEqr3Q5q+LDB5tH7Tz2qQ38V';

/** base64 风格字符 → 6bit 值；未用字符为 -1。 */
const B64 = new Int8Array([
          -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
          -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57,
          58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
          19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
          40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
          -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
          -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
          -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
          -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
          -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        ]);

/** 公钥对：两段 64 词大数。 */
class PubKey {
  key1 = new Uint32Array(64);
  key2 = new Uint32Array(64);
  len?: number;
}

export class BlowfishKey {
  pubkey = new PubKey();
  glob1 = new Uint32Array(64);
  glob2 = new Uint32Array(130);
  glob1_hi = new Uint32Array(4);
  glob1_hi_inv = new Uint32Array(4);
  glob1_bitlen = 0;
  glob1_len_x2 = 0;
  glob1_hi_bitlen = 0;
  glob1_hi_inv_lo = 0;
  glob1_hi_inv_hi = 0;

  init_bignum(a: Uint32Array, v: number, n: number): void {
    for (let i = 0; i < n; i++) a[i] = 0;
    a[0] = v;
  }

  move_key_to_big(dest: Uint32Array, key: Uint8Array, len: number, words: number): void {
    const fill = (key[0] & 128) !== 0 ? 255 : 0;
    const bytes = new Uint8Array(dest.buffer, dest.byteOffset);
    let n = 4 * words;
    for (; n > len; n--) bytes[n - 1] = fill;
    for (; n > 0; n--) bytes[n - 1] = key[len - n];
  }

  key_to_bignum(dest: Uint32Array, key: Uint8Array, words: number): void {
    let pos = 0;
    let len = 0;
    if (key[pos] !== 2) return;
    pos++;
    if (key[pos] & 128) {
      const n = key[pos] & 127;
      let acc = 0;
      for (let s = 0; s < n; s++) acc = (((acc << 8) >>> 0) | key[pos + s + 1]) >>> 0;
      len = acc;
      pos += 1 + n;
    } else {
      len = key[pos];
      pos++;
    }
    if (len <= 4 * words) this.move_key_to_big(dest, key.subarray(pos), len, words);
  }

  len_bignum(a: Uint32Array, n: number): number {
    let i = n - 1;
    while (i >= 0 && a[i] === 0) i--;
    return i + 1;
  }

  bitlen_bignum(a: Uint32Array, n: number): number {
    const len = this.len_bignum(a, n);
    if (len === 0) return 0;
    let bits = 32 * len;
    let mask = 2147483648;
    while ((a[len - 1] & mask) === 0) {
      mask >>>= 1;
      bits--;
    }
    return bits;
  }

  init_pubkey(): void {
    let si = 0;
    let ti = 0;
    const buf = new Uint8Array(256);
    this.init_bignum(this.pubkey.key2, 65537, 64);
    while (si < PUBKEY_STR.length) {
      // 与孪生逐运算符一致：每次 OR 后 >>>0，再 <<6 >>>0
      let v = B64[PUBKEY_STR.charCodeAt(si++)] >>> 0;
      v = ((v << 6) >>> 0) | (255 & B64[PUBKEY_STR.charCodeAt(si++)]);
      v = v >>> 0;
      v = ((v << 6) >>> 0) | (255 & B64[PUBKEY_STR.charCodeAt(si++)]);
      v = v >>> 0;
      v = ((v << 6) >>> 0) | (255 & B64[PUBKEY_STR.charCodeAt(si++)]);
      v = v >>> 0;
      buf[ti++] = (v >> 16) & 255;
      buf[ti++] = (v >> 8) & 255;
      buf[ti++] = 255 & v;
    }
    this.key_to_bignum(this.pubkey.key1, buf, 64);
    this.pubkey.len = this.bitlen_bignum(this.pubkey.key1, 64) - 1;
  }

  len_predata(): number {
    const unit = ((this.pubkey.len - 1) / 8) | 0;
    return ((1 + ((55 / unit) | 0)) * (1 + unit)) >>> 0;
  }

  cmp_bignum(a: Uint32Array, b: Uint32Array, n: number): number {
    while (n > 0) {
      n--;
      if (a[n] < b[n]) return -1;
      if (a[n] > b[n]) return 1;
    }
    return 0;
  }

  mov_bignum(dst: Uint32Array, src: Uint32Array, n: number): void {
    for (let i = 0; i < n; i++) dst[i] = src[i];
  }

  shr_bignum(a: Uint32Array, bits: number, n: number): void {
    let i;
    const words = (bits / 32) | 0;
    if (words > 0) {
      for (i = 0; i < n - words; i++) a[i] = a[i + words];
      for (; i < n; i++) a[i] = 0;
      bits %= 32;
    }
    if (bits !== 0) {
      for (i = 0; i < n - 1; i++) a[i] = ((a[i] >>> bits) | ((a[i + 1] << (32 - bits)) >>> 0)) >>> 0;
      a[i] = a[i] >>> bits;
    }
  }

  shl_bignum(a: Uint32Array, bits: number, n: number): void {
    let i;
    const words = (bits / 32) | 0;
    if (words > 0) {
      for (i = n - 1; i > words; i--) a[i] = a[i - words];
      for (; i > 0; i--) a[i] = 0;
      bits %= 32;
    }
    if (bits !== 0) {
      for (i = n - 1; i > 0; i--) a[i] = (((a[i] << bits) >>> 0) | (a[i - 1] >>> (32 - bits))) >>> 0;
      a[0] = (a[0] << bits) >>> 0;
    }
  }

  sub_bignum(dst: Uint32Array, a: Uint32Array, b: Uint32Array, borrowIn: number, words: number): number {
    let borrow = borrowIn;
    words += words;
    const ha = new Uint16Array(a.buffer, a.byteOffset);
    const hb = new Uint16Array(b.buffer, b.byteOffset);
    const hd = new Uint16Array(dst.buffer, dst.byteOffset);
    let i = 0;
    while (--words !== -1) {
      const x = ha[i];
      const y = hb[i];
      const r = x - y - borrow;
      hd[i] = r & 65535;
      borrow = (r & 65536) !== 0 ? 1 : 0;
      i++;
    }
    return borrow;
  }

  sub_bignum_word(dst: Uint16Array, a: Uint16Array, b: Uint16Array, borrowIn: number, words: number): number {
    let borrow = borrowIn;
    let i = 0;
    while (--words !== -1) {
      const x = a[i];
      const y = b[i];
      const r = x - y - borrow;
      dst[i] = r & 65535;
      borrow = (r & 65536) !== 0 ? 1 : 0;
      i++;
    }
    return borrow;
  }

  inv_bignum(dst: Uint32Array, src: Uint32Array, n: number): void {
    const tmp = new Uint32Array(64);
    let bits, mask, word;
    this.init_bignum(tmp, 0, n);
    this.init_bignum(dst, 0, n);
    bits = this.bitlen_bignum(src, n);
    mask = (1 << (bits % 32)) >>> 0;
    word = (((bits + 32) / 32) | 0) - 1;
    const start = (4 * (((bits - 1) / 32) | 0)) >>> 0;
    tmp[(start / 4) | 0] = tmp[(start / 4) | 0] | ((1 << ((bits - 1) & 31)) >>> 0);
    while (bits > 0) {
      bits--;
      this.shl_bignum(tmp, 1, n);
      if (this.cmp_bignum(tmp, src, n) !== -1) {
        this.sub_bignum(tmp, tmp, src, 0, n);
        dst[word] = dst[word] | mask;
      }
      mask >>>= 1;
      if (mask === 0) {
        word--;
        mask = 2147483648;
      }
    }
    this.init_bignum(tmp, 0, n);
  }

  inc_bignum(a: Uint32Array, n: number): void {
    let i = 0;
    while (++a[i] === 0 && --n > 0) i++;
  }

  init_two_dw(src: Uint32Array, n: number): void {
    this.mov_bignum(this.glob1, src, n);
    this.glob1_bitlen = this.bitlen_bignum(this.glob1, n);
    this.glob1_len_x2 = ((this.glob1_bitlen + 15) / 16) | 0;
    this.mov_bignum(this.glob1_hi, this.glob1.subarray(this.len_bignum(this.glob1, n) - 2), 2);
    this.glob1_hi_bitlen = (this.bitlen_bignum(this.glob1_hi, 2) - 32) >>> 0;
    this.shr_bignum(this.glob1_hi, this.glob1_hi_bitlen, 2);
    this.inv_bignum(this.glob1_hi_inv, this.glob1_hi, 2);
    this.shr_bignum(this.glob1_hi_inv, 1, 2);
    this.glob1_hi_bitlen = (((this.glob1_hi_bitlen + 15) % 16) + 1) >>> 0;
    this.inc_bignum(this.glob1_hi_inv, 2);
    if (this.bitlen_bignum(this.glob1_hi_inv, 2) > 32) {
      this.shr_bignum(this.glob1_hi_inv, 1, 2);
      this.glob1_hi_bitlen--;
    }
    this.glob1_hi_inv_lo = 65535 & this.glob1_hi_inv[0];
    this.glob1_hi_inv_hi = (this.glob1_hi_inv[0] >>> 16) & 65535;
  }

  mul_bignum_word(acc: Uint32Array, b: Uint32Array, mul: number, words: number): void {
    const bh = new Uint16Array(b.buffer, b.byteOffset);
    let i = 0;
    let carry = 0;
    for (let s = 0; s < words; s++) {
      carry = mul * bh[i] + acc[i] + carry;
      acc[i] = 65535 & carry;
      i++;
      carry >>>= 16;
    }
    acc[i] += 65535 & carry;
  }

  mul_bignum(dst: Uint32Array, a: Uint32Array, b: Uint32Array, words: number): void {
    const bh = new Uint16Array(b.buffer, b.byteOffset);
    const dh = new Uint16Array(dst.buffer, dst.byteOffset);
    this.init_bignum(dst, 0, 2 * words);
    let o = 0;
    for (let s = 0; s < 2 * words; s++) {
      this.mul_bignum_word(dh.subarray(o) as unknown as Uint32Array, a, bh[o], 2 * words);
      o++;
    }
  }

  not_bignum(a: Uint32Array, n: number): void {
    for (let i = 0; i < n; i++) a[i] = ~a[i] >>> 0;
  }

  neg_bignum(a: Uint32Array, n: number): void {
    this.not_bignum(a, n);
    this.inc_bignum(a, n);
  }

  get_mulword(e: Uint16Array, t: number): number {
    let q =
      (((((((((65535 & (65535 ^ e[t - 1])) * this.glob1_hi_inv_lo + 65536) >>> 1) +
        (((65535 ^ e[t - 2]) * this.glob1_hi_inv_hi + this.glob1_hi_inv_hi) >>> 1) +
        1) >>> 16) +
        (((65535 & (65535 ^ e[t - 1])) * this.glob1_hi_inv_hi) >>> 1) +
        (((65535 ^ e[t]) * this.glob1_hi_inv_lo) >>> 1) +
        1) >>> 14) +
        this.glob1_hi_inv_hi * (65535 ^ e[t]) * 2) >>>
        this.glob1_hi_bitlen) >>>
      0;
    if (q > 65535) q = 65535;
    return 65535 & q;
  }

  dec_bignum(a: Uint32Array, n: number): void {
    let i = 0;
    while (--a[i] >>> 0 === 4294967295 && --n > 0) i++;
  }

  calc_a_bignum(dst: Uint32Array, mul: Uint32Array, src: Uint32Array, words: number): void {
    const n = this.glob1;
    const o = this.glob2;
    this.mul_bignum(this.glob2, mul, src, words);
    this.glob2[2 * words] = 0;
    let s = 2 * this.len_bignum(this.glob2, 2 * words + 1);
    if (s >= this.glob1_len_x2) {
      this.inc_bignum(this.glob2, 2 * words + 1);
      this.neg_bignum(this.glob2, 2 * words + 1);
      let a = 1 + s - this.glob1_len_x2;
      const e = new Uint16Array(o.buffer);
      let t = a;
      let i = 1 + s;
      while (a !== 0) {
        i--;
        const l = this.get_mulword(e, i);
        t--;
        const c = e.subarray(t);
        if (l > 0) {
          this.mul_bignum_word(c as unknown as Uint32Array, this.glob1, l, 2 * words);
          if ((e[i] & 32768) === 0 && this.sub_bignum_word(c, c, new Uint16Array(n.buffer), 0, 2 * words) !== 0)
            e[i]--;
        }
        a--;
      }
      this.neg_bignum(this.glob2, words);
      this.dec_bignum(this.glob2, words);
    }
    this.mov_bignum(dst, this.glob2, words);
  }

  clear_tmp_vars(n: number): void {
    this.init_bignum(this.glob1, 0, n);
    this.init_bignum(this.glob2, 0, n);
    this.init_bignum(this.glob1_hi_inv, 0, 4);
    this.init_bignum(this.glob1_hi, 0, 4);
    this.glob1_bitlen = 0;
    this.glob1_hi_bitlen = 0;
    this.glob1_len_x2 = 0;
    this.glob1_hi_inv_lo = 0;
    this.glob1_hi_inv_hi = 0;
  }

  calc_a_key(dst: Uint32Array, base: Uint32Array, exp: Uint32Array, mod: Uint32Array, words: number): void {
    const o = new Uint32Array(64);
    let bits, mask, word;
    this.init_bignum(dst, 1, words);
    const n = this.len_bignum(mod, words);
    this.init_two_dw(mod, n);
    bits = (this.bitlen_bignum(exp, n) << 24) >> 24;
    word = (((bits + 31) / 32) | 0) >>> 0;
    mask = (1 << ((bits - 1) % 32)) >>> 1;
    let h = word - 1;
    bits--;
    this.mov_bignum(dst, base, n);
    while (--bits !== -1) {
      if (mask === 0) {
        mask = 2147483648;
        h--;
      }
      this.calc_a_bignum(o, dst, dst, n);
      if ((exp[h] & mask) !== 0) this.calc_a_bignum(dst, o, base, n);
      else this.mov_bignum(dst, o, n);
      mask >>>= 1;
    }
    this.init_bignum(o, 0, n);
    this.clear_tmp_vars(words);
  }

  memcpy(dst: Uint8Array, src: Uint8Array, n: number): void {
    let i = 0;
    while (n-- !== 0) {
      dst[i] = src[i];
      i++;
    }
  }

  process_predata(pre: Uint8Array, preLen: number, out: Uint8Array): void {
    const r = new Uint32Array(64);
    const s = new Uint32Array(64);
    let a = 0;
    let n = 0;
    const unit = ((this.pubkey.len - 1) / 8) | 0;
    let left = preLen;
    while (1 + unit <= left) {
      this.init_bignum(r, 0, 64);
      this.memcpy(new Uint8Array(r.buffer), pre.subarray(a), 1 + unit);
      this.calc_a_key(s, r, this.pubkey.key2, this.pubkey.key1, 64);
      this.memcpy(out.subarray(n), new Uint8Array(s.buffer), unit);
      left -= 1 + unit;
      a += 1 + unit;
      n += unit;
    }
  }

  decryptKey(enc: Uint8Array): Uint8Array {
    this.init_pubkey();
    const plain = new Uint8Array(256);
    this.process_predata(enc, this.len_predata(), plain);
    return plain.subarray(0, 56);
  }
}
