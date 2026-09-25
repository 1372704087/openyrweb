/**
 * Palette — 24 位调色板（.pal / JSON / VirtualFile）。
 *
 * 调色板条目经 Color.fromRgb 存储；VirtualFile 路径读 768 字节
 * （256×RGB，6-bit），fromJson 路径按每分量 ×4 放大到 8-bit。
 * hash 为颜色序列的 FNV-1a（fnv32a）。remap 按固定 6-bit 曲线
 * 把 16..31 索引映射到指定主色（铁锈/阴影等 palette remap 槽）。
 *
 * 由 data/Palette.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Color } from "util/Color"; // 已转换
import { fnv32a } from "util/math"; // 已转换
import { VirtualFile } from "data/vfs/VirtualFile"; // 孪生

/** remap 段起始索引（16）。 */
const REMAP_START_IDX = 16;

export class Palette {
  /** 颜色数组（顺序即索引）。 */
  colors: Color[];
  /** 颜色序列散列（setColors/fromJson/remap 后刷新）。 */
  _hash: number;

  constructor(input?: unknown) {
    // 孪生：仅在 fromJson 路径赋值 colors；无参构造不初始化
    if (input instanceof VirtualFile) this.fromVirtualFile(input);
    // 孪生无 null 守卫（typeof null === "object"，null 会进 fromJson 后抛错）
    else if (typeof input === "object") this.fromJson(input as ArrayLike<number>);
  }

  /** 从虚拟文件流读 768 字节调色板。 */
  fromVirtualFile(file: VirtualFile): void {
    const bytes = file.stream.readUint8Array(768);
    this.fromJson(bytes);
  }

  /**
   * 从字节序列载入：每 3 字节一组 RGB，每分量 ×4 放大到 8-bit。
   * 输入可为 Uint8Array 或普通数组。
   */
  fromJson(bytes: ArrayLike<number>): void {
    this.colors = [];
    for (let i = 0; i < bytes.length / 3; ++i) {
      this.colors.push(Color.fromRgb(4 * bytes[3 * i], 4 * bytes[3 * i + 1], 4 * bytes[3 * i + 2]));
    }
    this._hash = this.computeHash(this.colors);
  }

  /** 按索引取颜色。 */
  getColor(index: number): Color {
    return this.colors[index];
  }

  /** 按索引取 0xRRGGBB 整数（与孪生 asHex() 一致）。 */
  getColorAsHex(index: number): number {
    return this.getColor(index).asHex();
  }

  /** 整体替换颜色数组并重算 hash。 */
  setColors(colors: Color[]): void {
    this.colors = colors;
    this._hash = this.computeHash(this.colors);
  }

  /** 颜色数量。 */
  get size(): number {
    return this.colors.length;
  }

  /** 当前颜色序列散列。 */
  get hash(): number {
    return this._hash;
  }

  /** 将颜色序列打包为 RGB 字节后做 fnv32a。 */
  computeHash(colors: Color[]): number {
    const buf = new Uint8Array(3 * this.size);
    let i = 0;
    for (const c of colors) {
      buf[i] = c.r;
      buf[i + 1] = c.g;
      buf[i + 2] = c.b;
      i += 3;
    }
    return fnv32a(buf);
  }

  /** 浅克隆（颜色对象逐个 clone）。 */
  clone(): Palette {
    const p = new Palette();
    p.colors = this.colors.map((c) => c.clone());
    p._hash = this._hash;
    return p;
  }

  /**
   * 把索引 16..31 的 remap 槽按 fixed 曲线映射到 color 主色。
   * 固定 6-bit 曲线（与孪生一致），每分量 floor(curve * color/255 * 4)。
   */
  remap(color: Color): this {
    const curve = [63, 59, 55, 52, 48, 44, 41, 37, 33, 30, 26, 22, 19, 15, 11, 8];
    for (let i = REMAP_START_IDX; i < REMAP_START_IDX + curve.length; i++) {
      const t = curve[i - REMAP_START_IDX];
      this.colors[i].r = Math.floor((color.r / 255) * t * 4);
      this.colors[i].g = Math.floor((color.g / 255) * t * 4);
      this.colors[i].b = Math.floor((color.b / 255) * t * 4);
    }
    this._hash = this.computeHash(this.colors);
    return this;
  }
}

/** remap 段起始索引（静态，与孪生 a.REMAP_START_IDX 对齐）。 */
(Palette as any).REMAP_START_IDX = REMAP_START_IDX;
