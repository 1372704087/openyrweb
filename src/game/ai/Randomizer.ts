/**
 * Randomizer — 原版 RA2/YR 表驱动 RNG 精确移植（ScenarioClass::Random 同步通道）。
 *
 * 依据 gamemd.exe 1.001 反编译：
 * - ctor        0x65C6D0（250 项表展开，K1/K2 常数 Feistel 4 轮混合）
 * - Random      0x65C780（Table[Next1] ^= Table[Next2]，取表值，双索引环绕）
 * - RandomRanged 0x65C7E0（位长掩码拒绝采样）
 * 布局：locked(bool) + Next1 + Next2 + Table[250]（与 Phobos YRpp Randomizer.h 一致）。
 * 常数表 @0x839644 / @0x839690（IDA 实测转储）；全局实例默认种子 0xA8ED94 = 0xFFFFFFFF。
 *
 * AI gameplay 相关随机全部走此通道（触发扫描/生产/选址），移植后 AI 层才具备
 * 逐帧 parity 的可能。JS 侧用 >>>0 / Math.imul 保证 32 位无符号语义。
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

// K1 = dword_839644[0..3]；K2 取 dword_839690[1..4]（ctor 内索引自增后使用）。
const K1 = [0xbaa96887, 0x1e17d32c, 0x03bcdc3c, 0x0f33d1b2];
const K2 = [0, 0x4b0f3b58, 0xe874f0c3, 0x6955c5a6, 0x55a7ca46];

export class Randomizer {
  locked = false;
  next1 = 0;
  next2 = 103;
  table: Int32Array;

  constructor(seed?: number) {
    this.table = new Int32Array(250);
    const s = seed === undefined ? -1 : seed | 0; // 原版默认 0xFFFFFFFF
    let counter = 0;
    for (let idx = 0; idx < 250; idx++) {
      // 4 轮 Feistel：初始 (a,b)=(seed, counter)，每轮 a'=b、b'=a^F(b)
      let a = s;
      let b = counter | 0;
      let ki = 0;
      let out = 0;
      do {
        const prev = b;
        const v7 = (b ^ K1[ki]) >>> 0;
        ki++;
        const lo = v7 & 0xffff;
        const hi = v7 >>> 16;
        const t = Math.imul(lo, hi) >>> 0;
        // w = (lo² + ~(hi²)) 的 16 位半字交换
        let w = (Math.imul(lo, lo) + ~(Math.imul(hi, hi) | 0)) >>> 0;
        w = ((w << 16) | (w >>> 16)) >>> 0;
        out = (a ^ ((t + (K2[ki] ^ w)) >>> 0)) >>> 0;
        b = out;
        a = prev;
      } while (ki < 4);
      this.table[idx] = out | 0;
      counter = idx + 1;
    }
  }

  /** Random 0x65C780。locked 时恒 0 且不推进索引。 */
  random(): number {
    if (this.locked) return 0;
    this.table[this.next1] = (this.table[this.next1] ^ this.table[this.next2]) | 0;
    const result = this.table[this.next1];
    this.next1++;
    this.next2++;
    if (this.next1 >= 250) this.next1 = 0;
    if (this.next2 >= 250) this.next2 = 0;
    return result;
  }

  /** RandomRanged 0x65C7E0：位长掩码 + 拒绝采样（原版怪癖原样保留：bit31 不参与探测）。 */
  randomRanged(min: number, max: number): number {
    let lo = min;
    let hi = max;
    if (lo === hi) return lo;
    if (lo > hi) {
      const tmp = lo;
      lo = hi;
      hi = tmp;
    }
    const range = (hi - lo) | 0;
    let bit = 31;
    if (range >= 0) {
      do {
        if (bit <= 0) break;
        bit--;
      } while (((1 << bit) & range) === 0);
    }
    const mask = ~(-1 << (bit + 1));
    let candidate = range + 1;
    while (candidate > range) {
      candidate = mask & this.draw();
    }
    return lo + candidate;
  }

  private draw(): number {
    if (this.locked) return 0;
    this.table[this.next1] = (this.table[this.next1] ^ this.table[this.next2]) | 0;
    const v = this.table[this.next1];
    this.next1++;
    this.next2++;
    if (this.next1 >= 250) this.next1 = 0;
    if (this.next2 >= 250) this.next2 = 0;
    return v;
  }
}
