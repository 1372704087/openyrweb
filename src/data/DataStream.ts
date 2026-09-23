/**
 * DataStream — 可增长字节流：DataView 封装 + 端序读写 + 数组 map/read/write。
 *
 * 由 data/DataStream.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：
 * - 默认 LITTLE_ENDIAN(true)；BIG_ENDIAN=false；构造接受 ArrayBuffer/DataView/长度。
 * - _realloc 仅在 dynamicSize 下 2 倍扩容；buffer setter 重建 DataView。
 * - readXxx 读后推进 position；writeXxx 先 _realloc 再写。
 * - VirtualFile 会覆写 _trimAlloc 为空操作，防止子视图收缩共享 buffer。
 */

/** 主机是否小端（static endianness 探测，与孪生一致）。 */
const nativeIsLE = new Int8Array(new Int16Array([1]).buffer)[0] > 0;

/** 可翻转端序的 TypedArray。 */
type PortableArray =
  | Int8Array
  | Uint8Array
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array;

/** 字节流。 */
export class DataStream {
  /** true=小端。 */
  endianness: boolean;
  position = 0;
  _dynamicSize = true;
  _byteLength = 0;
  _byteOffset: number;
  _buffer!: ArrayBuffer;
  _dataView!: DataView;
  /** 可被 VirtualFile 替换的收缩钩子。 */
  _trimAlloc: () => void;

  static readonly BIG_ENDIAN = false;
  static readonly LITTLE_ENDIAN = true;
  static readonly endianness: boolean = nativeIsLE;

  constructor(
    source?: ArrayBuffer | DataView | number,
    byteOffset = 0,
    endianness: boolean = DataStream.LITTLE_ENDIAN,
  ) {
    this.endianness = endianness;
    this.position = 0;
    this._dynamicSize = true;
    this._byteLength = 0;
    this._byteOffset = byteOffset || 0;
    this._trimAlloc = () => this.trimAllocImpl();

    if (source instanceof ArrayBuffer) {
      this.buffer = source;
    } else if (typeof source === "object" && source !== null) {
      this.dataView = source;
      if (byteOffset) this._byteOffset += byteOffset;
    } else {
      this.buffer = new ArrayBuffer((source as number) || 0);
    }
  }

  get dynamicSize(): boolean {
    return this._dynamicSize;
  }
  set dynamicSize(value: boolean) {
    if (!value) this._trimAlloc();
    this._dynamicSize = value;
  }

  get byteLength(): number {
    return this._byteLength - this._byteOffset;
  }

  get buffer(): ArrayBuffer {
    this._trimAlloc();
    return this._buffer;
  }
  set buffer(value: ArrayBuffer) {
    this._buffer = value;
    this._dataView = new DataView(this._buffer, this._byteOffset);
    this._byteLength = this._buffer.byteLength;
  }

  get byteOffset(): number {
    return this._byteOffset;
  }
  set byteOffset(value: number) {
    this._byteOffset = value;
    this._dataView = new DataView(this._buffer, this._byteOffset);
    this._byteLength = this._buffer.byteLength;
  }

  get dataView(): DataView {
    return this._dataView;
  }
  set dataView(value: DataView) {
    this._byteOffset = value.byteOffset;
    this._buffer = value.buffer as ArrayBuffer;
    this._dataView = new DataView(this._buffer, this._byteOffset);
    this._byteLength = this._byteOffset + value.byteLength;
  }

  bigEndian(): this {
    this.endianness = DataStream.BIG_ENDIAN;
    return this;
  }

  /** 确保 position+extra 可写；必要时 2 倍扩容。 */
  _realloc(extra: number): void {
    if (!this._dynamicSize) return;
    const needed = this._byteOffset + this.position + extra;
    let cap = this._buffer.byteLength;
    if (needed <= cap) {
      if (needed > this._byteLength) this._byteLength = needed;
      return;
    }
    if (cap < 1) cap = 1;
    while (needed > cap) cap *= 2;
    const grown = new ArrayBuffer(cap);
    const old = new Uint8Array(this._buffer);
    new Uint8Array(grown, 0, old.length).set(old);
    this.buffer = grown;
    this._byteLength = needed;
  }

  private trimAllocImpl(): void {
    if (this._byteLength === this._buffer.byteLength) return;
    const shrunk = new ArrayBuffer(this._byteLength);
    const dst = new Uint8Array(shrunk);
    dst.set(new Uint8Array(this._buffer, 0, dst.length));
    this.buffer = shrunk;
  }

  /** 钳制定位到 [0, byteLength]；NaN/∞ → 0。 */
  seek(pos: number): void {
    const clamped = Math.max(0, Math.min(this.byteLength, pos));
    this.position = isNaN(clamped) || !isFinite(clamped) ? 0 : clamped;
  }

  isEof(): boolean {
    return this.position >= this.byteLength;
  }

  // ---- map（在位映射，推进 position）----

  mapInt32Array(length: number, endianness?: boolean): Int32Array {
    this._realloc(4 * length);
    const arr = new Int32Array(this._buffer, this.byteOffset + this.position, length);
    DataStream.arrayToNative(arr, endianness === undefined ? this.endianness : endianness);
    this.position += 4 * length;
    return arr;
  }

  mapInt16Array(length: number, endianness?: boolean): Int16Array {
    this._realloc(2 * length);
    const arr = new Int16Array(this._buffer, this.byteOffset + this.position, length);
    DataStream.arrayToNative(arr, endianness === undefined ? this.endianness : endianness);
    this.position += 2 * length;
    return arr;
  }

  mapInt8Array(length: number): Int8Array {
    this._realloc(length);
    const arr = new Int8Array(this._buffer, this.byteOffset + this.position, length);
    this.position += length;
    return arr;
  }

  mapUint32Array(length: number, endianness?: boolean): Uint32Array {
    this._realloc(4 * length);
    const arr = new Uint32Array(this._buffer, this.byteOffset + this.position, length);
    DataStream.arrayToNative(arr, endianness === undefined ? this.endianness : endianness);
    this.position += 4 * length;
    return arr;
  }

  mapUint16Array(length: number, endianness?: boolean): Uint16Array {
    this._realloc(2 * length);
    const arr = new Uint16Array(this._buffer, this.byteOffset + this.position, length);
    DataStream.arrayToNative(arr, endianness === undefined ? this.endianness : endianness);
    this.position += 2 * length;
    return arr;
  }

  mapUint8Array(length: number): Uint8Array {
    this._realloc(length);
    const arr = new Uint8Array(this._buffer, this.byteOffset + this.position, length);
    this.position += length;
    return arr;
  }

  mapFloat64Array(length: number, endianness?: boolean): Float64Array {
    this._realloc(8 * length);
    const arr = new Float64Array(this._buffer, this.byteOffset + this.position, length);
    DataStream.arrayToNative(arr, endianness === undefined ? this.endianness : endianness);
    this.position += 8 * length;
    return arr;
  }

  mapFloat32Array(length: number, endianness?: boolean): Float32Array {
    this._realloc(4 * length);
    const arr = new Float32Array(this._buffer, this.byteOffset + this.position, length);
    DataStream.arrayToNative(arr, endianness === undefined ? this.endianness : endianness);
    this.position += 4 * length;
    return arr;
  }

  // ---- read（拷贝新数组）----

  readInt32Array(length?: number, endianness?: boolean): Int32Array {
    const n = length === undefined ? this.byteLength - this.position / 4 : length;
    const arr = new Int32Array(n);
    DataStream.memcpy(arr.buffer, 0, this.buffer, this.byteOffset + this.position, n * arr.BYTES_PER_ELEMENT);
    DataStream.arrayToNative(arr, endianness === undefined ? this.endianness : endianness);
    this.position += arr.byteLength;
    return arr;
  }

  readInt16Array(length?: number, endianness?: boolean): Int16Array {
    const n = length === undefined ? this.byteLength - this.position / 2 : length;
    const arr = new Int16Array(n);
    DataStream.memcpy(arr.buffer, 0, this.buffer, this.byteOffset + this.position, n * arr.BYTES_PER_ELEMENT);
    DataStream.arrayToNative(arr, endianness === undefined ? this.endianness : endianness);
    this.position += arr.byteLength;
    return arr;
  }

  readInt8Array(length?: number): Int8Array {
    const n = length === undefined ? this.byteLength - this.position : length;
    const arr = new Int8Array(n);
    DataStream.memcpy(arr.buffer, 0, this.buffer, this.byteOffset + this.position, n * arr.BYTES_PER_ELEMENT);
    this.position += arr.byteLength;
    return arr;
  }

  readUint32Array(length?: number, endianness?: boolean): Uint32Array {
    const n = length === undefined ? this.byteLength - this.position / 4 : length;
    const arr = new Uint32Array(n);
    DataStream.memcpy(arr.buffer, 0, this.buffer, this.byteOffset + this.position, n * arr.BYTES_PER_ELEMENT);
    DataStream.arrayToNative(arr, endianness === undefined ? this.endianness : endianness);
    this.position += arr.byteLength;
    return arr;
  }

  readUint16Array(length?: number, endianness?: boolean): Uint16Array {
    const n = length === undefined ? this.byteLength - this.position / 2 : length;
    const arr = new Uint16Array(n);
    DataStream.memcpy(arr.buffer, 0, this.buffer, this.byteOffset + this.position, n * arr.BYTES_PER_ELEMENT);
    DataStream.arrayToNative(arr, endianness === undefined ? this.endianness : endianness);
    this.position += arr.byteLength;
    return arr;
  }

  readUint8Array(length?: number): Uint8Array {
    const n = length === undefined ? this.byteLength - this.position : length;
    const arr = new Uint8Array(n);
    DataStream.memcpy(arr.buffer, 0, this.buffer, this.byteOffset + this.position, n * arr.BYTES_PER_ELEMENT);
    this.position += arr.byteLength;
    return arr;
  }

  readFloat64Array(length?: number, endianness?: boolean): Float64Array {
    const n = length === undefined ? this.byteLength - this.position / 8 : length;
    const arr = new Float64Array(n);
    DataStream.memcpy(arr.buffer, 0, this.buffer, this.byteOffset + this.position, n * arr.BYTES_PER_ELEMENT);
    DataStream.arrayToNative(arr, endianness === undefined ? this.endianness : endianness);
    this.position += arr.byteLength;
    return arr;
  }

  readFloat32Array(length?: number, endianness?: boolean): Float32Array {
    const n = length === undefined ? this.byteLength - this.position / 4 : length;
    const arr = new Float32Array(n);
    DataStream.memcpy(arr.buffer, 0, this.buffer, this.byteOffset + this.position, n * arr.BYTES_PER_ELEMENT);
    DataStream.arrayToNative(arr, endianness === undefined ? this.endianness : endianness);
    this.position += arr.byteLength;
    return arr;
  }

  // ---- write ----

  writeInt32Array(arr: ArrayLike<number> | Int32Array, endianness?: boolean): this {
    this._realloc(4 * arr.length);
    if (arr instanceof Int32Array && (this.byteOffset + this.position) % arr.BYTES_PER_ELEMENT === 0) {
      DataStream.memcpy(
        this._buffer,
        this.byteOffset + this.position,
        arr.buffer as ArrayBuffer,
        arr.byteOffset,
        arr.byteLength,
      );
      this.mapInt32Array(arr.length, endianness);
    } else {
      for (let i = 0; i < arr.length; i++) this.writeInt32(arr[i], endianness);
    }
    return this;
  }

  writeInt16Array(arr: ArrayLike<number> | Int16Array, endianness?: boolean): this {
    this._realloc(2 * arr.length);
    if (arr instanceof Int16Array && (this.byteOffset + this.position) % arr.BYTES_PER_ELEMENT === 0) {
      DataStream.memcpy(
        this._buffer,
        this.byteOffset + this.position,
        arr.buffer as ArrayBuffer,
        arr.byteOffset,
        arr.byteLength,
      );
      this.mapInt16Array(arr.length, endianness);
    } else {
      for (let i = 0; i < arr.length; i++) this.writeInt16(arr[i], endianness);
    }
    return this;
  }

  writeInt8Array(arr: ArrayLike<number> | Int8Array): this {
    this._realloc(arr.length);
    if (arr instanceof Int8Array && (this.byteOffset + this.position) % arr.BYTES_PER_ELEMENT === 0) {
      DataStream.memcpy(
        this._buffer,
        this.byteOffset + this.position,
        arr.buffer as ArrayBuffer,
        arr.byteOffset,
        arr.byteLength,
      );
      this.mapInt8Array(arr.length);
    } else {
      for (let i = 0; i < arr.length; i++) this.writeInt8(arr[i]);
    }
    return this;
  }

  writeUint32Array(arr: ArrayLike<number> | Uint32Array, endianness?: boolean): this {
    this._realloc(4 * arr.length);
    if (arr instanceof Uint32Array && (this.byteOffset + this.position) % arr.BYTES_PER_ELEMENT === 0) {
      DataStream.memcpy(
        this._buffer,
        this.byteOffset + this.position,
        arr.buffer as ArrayBuffer,
        arr.byteOffset,
        arr.byteLength,
      );
      this.mapUint32Array(arr.length, endianness);
    } else {
      for (let i = 0; i < arr.length; i++) this.writeUint32(arr[i], endianness);
    }
    return this;
  }

  writeUint16Array(arr: ArrayLike<number> | Uint16Array, endianness?: boolean): this {
    this._realloc(2 * arr.length);
    if (arr instanceof Uint16Array && (this.byteOffset + this.position) % arr.BYTES_PER_ELEMENT === 0) {
      DataStream.memcpy(
        this._buffer,
        this.byteOffset + this.position,
        arr.buffer as ArrayBuffer,
        arr.byteOffset,
        arr.byteLength,
      );
      this.mapUint16Array(arr.length, endianness);
    } else {
      for (let i = 0; i < arr.length; i++) this.writeUint16(arr[i], endianness);
    }
    return this;
  }

  writeUint8Array(arr: ArrayLike<number> | Uint8Array): this {
    this._realloc(arr.length);
    if (arr instanceof Uint8Array && (this.byteOffset + this.position) % arr.BYTES_PER_ELEMENT === 0) {
      DataStream.memcpy(
        this._buffer,
        this.byteOffset + this.position,
        arr.buffer as ArrayBuffer,
        arr.byteOffset,
        arr.byteLength,
      );
      this.mapUint8Array(arr.length);
    } else {
      for (let i = 0; i < arr.length; i++) this.writeUint8(arr[i]);
    }
    return this;
  }

  writeFloat64Array(arr: ArrayLike<number> | Float64Array, endianness?: boolean): this {
    this._realloc(8 * arr.length);
    if (arr instanceof Float64Array && (this.byteOffset + this.position) % arr.BYTES_PER_ELEMENT === 0) {
      DataStream.memcpy(
        this._buffer,
        this.byteOffset + this.position,
        arr.buffer as ArrayBuffer,
        arr.byteOffset,
        arr.byteLength,
      );
      this.mapFloat64Array(arr.length, endianness);
    } else {
      for (let i = 0; i < arr.length; i++) this.writeFloat64(arr[i], endianness);
    }
    return this;
  }

  writeFloat32Array(arr: ArrayLike<number> | Float32Array, endianness?: boolean): this {
    this._realloc(4 * arr.length);
    if (arr instanceof Float32Array && (this.byteOffset + this.position) % arr.BYTES_PER_ELEMENT === 0) {
      DataStream.memcpy(
        this._buffer,
        this.byteOffset + this.position,
        arr.buffer as ArrayBuffer,
        arr.byteOffset,
        arr.byteLength,
      );
      this.mapFloat32Array(arr.length, endianness);
    } else {
      for (let i = 0; i < arr.length; i++) this.writeFloat32(arr[i], endianness);
    }
    return this;
  }

  // ---- 标量 ----

  readInt32(endianness?: boolean): number {
    const v = this._dataView.getInt32(this.position, endianness === undefined ? this.endianness : endianness);
    this.position += 4;
    return v;
  }

  readInt16(endianness?: boolean): number {
    const v = this._dataView.getInt16(this.position, endianness === undefined ? this.endianness : endianness);
    this.position += 2;
    return v;
  }

  readInt8(): number {
    const v = this._dataView.getInt8(this.position);
    this.position += 1;
    return v;
  }

  readUint32(endianness?: boolean): number {
    const v = this._dataView.getUint32(this.position, endianness === undefined ? this.endianness : endianness);
    this.position += 4;
    return v;
  }

  readUint16(endianness?: boolean): number {
    const v = this._dataView.getUint16(this.position, endianness === undefined ? this.endianness : endianness);
    this.position += 2;
    return v;
  }

  readUint8(): number {
    const v = this._dataView.getUint8(this.position);
    this.position += 1;
    return v;
  }

  readFloat32(endianness?: boolean): number {
    const v = this._dataView.getFloat32(this.position, endianness === undefined ? this.endianness : endianness);
    this.position += 4;
    return v;
  }

  readFloat64(endianness?: boolean): number {
    const v = this._dataView.getFloat64(this.position, endianness === undefined ? this.endianness : endianness);
    this.position += 8;
    return v;
  }

  writeInt32(value: number, endianness?: boolean): this {
    this._realloc(4);
    this._dataView.setInt32(this.position, value, endianness === undefined ? this.endianness : endianness);
    this.position += 4;
    return this;
  }

  writeInt16(value: number, endianness?: boolean): this {
    this._realloc(2);
    this._dataView.setInt16(this.position, value, endianness === undefined ? this.endianness : endianness);
    this.position += 2;
    return this;
  }

  writeInt8(value: number): this {
    this._realloc(1);
    this._dataView.setInt8(this.position, value);
    this.position += 1;
    return this;
  }

  writeUint32(value: number, endianness?: boolean): this {
    this._realloc(4);
    this._dataView.setUint32(this.position, value, endianness === undefined ? this.endianness : endianness);
    this.position += 4;
    return this;
  }

  writeUint16(value: number, endianness?: boolean): this {
    this._realloc(2);
    this._dataView.setUint16(this.position, value, endianness === undefined ? this.endianness : endianness);
    this.position += 2;
    return this;
  }

  writeUint8(value: number): this {
    this._realloc(1);
    this._dataView.setUint8(this.position, value);
    this.position += 1;
    return this;
  }

  writeFloat32(value: number, endianness?: boolean): this {
    this._realloc(4);
    this._dataView.setFloat32(this.position, value, endianness === undefined ? this.endianness : endianness);
    this.position += 4;
    return this;
  }

  writeFloat64(value: number, endianness?: boolean): this {
    this._realloc(8);
    this._dataView.setFloat64(this.position, value, endianness === undefined ? this.endianness : endianness);
    this.position += 8;
    return this;
  }

  // ---- 静态工具 ----

  static memcpy(dst: ArrayBuffer, dstOffset: number, src: ArrayBuffer, srcOffset: number, length: number): void {
    new Uint8Array(dst, dstOffset, length).set(new Uint8Array(src, srcOffset, length));
  }

  /**
   * 目标端序与主机序不一致则原地翻转。
   * 孪生比较的是 `this.endianness`（类静态字段，主机 LE 探测）。
   */
  static arrayToNative<T extends PortableArray>(arr: T, endianness: boolean): T {
    return endianness === DataStream.endianness ? arr : DataStream.flipArrayEndianness(arr);
  }

  static nativeToEndian<T extends PortableArray>(arr: T, endianness: boolean): T {
    return DataStream.endianness === endianness ? arr : DataStream.flipArrayEndianness(arr);
  }

  static flipArrayEndianness<T extends PortableArray>(arr: T): T {
    const bytes = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
    for (let i = 0; i < arr.byteLength; i += arr.BYTES_PER_ELEMENT) {
      for (let left = i + arr.BYTES_PER_ELEMENT - 1, right = i; left > right; left--, right++) {
        const tmp = bytes[right];
        bytes[right] = bytes[left];
        bytes[left] = tmp;
      }
    }
    return arr;
  }

  /** 分块（32768）从类数组码元拼字符串。 */
  static createStringFromArray(arr: ArrayLike<number>): string {
    const parts: string[] = [];
    for (let i = 0; i < arr.length; i += 32768) {
      const slice = Array.prototype.slice.call(arr, i, i + 32768);
      parts.push(String.fromCharCode.apply(undefined, slice));
    }
    return parts.join("");
  }

  // ---- 字符串 ----

  readUCS2String(length: number, endianness?: boolean): string {
    return DataStream.createStringFromArray(this.readUint16Array(length, endianness) as any);
  }

  writeUCS2String(str: string, endianness?: boolean, maxLength?: number): this {
    let limit = maxLength;
    if (limit === undefined) limit = str.length;
    let i = 0;
    for (; i < str.length && i < limit; i++) this.writeUint16(str.charCodeAt(i), endianness);
    for (; i < limit; i++) this.writeUint16(0);
    return this;
  }

  readString(length?: number, encoding?: string): string {
    if (encoding === undefined || encoding === "ASCII") {
      const n = length === undefined ? this.byteLength - this.position : length;
      return DataStream.createStringFromArray(this.mapUint8Array(n) as any);
    }
    return new TextDecoder(encoding).decode(this.mapUint8Array(length as number));
  }

  writeString(str: string, encoding?: string, maxLength?: number): this {
    if (encoding === undefined || encoding === "ASCII") {
      if (maxLength !== undefined) {
        const n = Math.min(str.length, maxLength);
        let i = 0;
        for (; i < n; i++) this.writeUint8(str.charCodeAt(i));
        for (; i < maxLength; i++) this.writeUint8(0);
      } else {
        for (let i = 0; i < str.length; i++) this.writeUint8(str.charCodeAt(i));
      }
    } else {
      this.writeUint8Array(new TextEncoder().encode(str.substring(0, maxLength)));
    }
    return this;
  }

  writeUtf8WithLen(str: string): this {
    const bytes = new TextEncoder().encode(str);
    return this.writeUint16(bytes.length).writeUint8Array(bytes);
  }

  readUtf8WithLen(): string {
    const len = this.readUint16();
    return new TextDecoder().decode(this.mapUint8Array(len));
  }

  /**
   * 读 C 字符串。有 max：在 min(max,剩余) 找 0，再 position += max-i；
   * 无 max：找到 0 或末尾，未到末尾则跳过 1 字节终止符。
   */
  readCString(maxLength?: number): string {
    const remaining = this.byteLength - this.position;
    const view = new Uint8Array(this._buffer, this._byteOffset + this.position);
    let limit = remaining;
    if (maxLength !== undefined) limit = Math.min(maxLength, remaining);
    let i = 0;
    for (; i < limit && view[i] !== 0; i++);
    const str = DataStream.createStringFromArray(this.mapUint8Array(i) as any);
    if (maxLength !== undefined) this.position += limit - i;
    else if (i !== remaining) this.position += 1;
    return str;
  }

  writeCString(str: string, maxLength?: number): this {
    if (maxLength !== undefined) {
      const n = Math.min(str.length, maxLength);
      let i = 0;
      for (; i < n; i++) this.writeUint8(str.charCodeAt(i));
      for (; i < maxLength; i++) this.writeUint8(0);
    } else {
      for (let i = 0; i < str.length; i++) this.writeUint8(str.charCodeAt(i));
      this.writeUint8(0);
    }
    return this;
  }

  toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer, this.byteOffset, this.byteLength);
  }
}
