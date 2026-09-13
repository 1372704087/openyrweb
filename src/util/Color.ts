/**
 * Color — 24 位 RGB 颜色，含 HSV → RGB 换算。
 *
 * 由 util/Color.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，本文件
 * 才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { pad } from "util/string";

export class Color {
  static fromRgb(r: number, g: number, b: number): Color {
    return new Color(r, g, b);
  }

  /** HSV 输入各分量均为 0-255（hue 255 = 360°）。 */
  static fromHsv(hue: number, saturation: number, value: number): Color {
    let r = 0,
      g = 0,
      b = 0;
    hue = ((hue / 255) * 360) % 360;
    value /= 255;
    if ((saturation /= 255) === 0) {
      r = value;
      g = value;
      b = value;
    } else {
      const sector = hue / 60;
      const sectorIndex = Math.floor(sector);
      const frac = sector - sectorIndex;
      const p = value * (1 - saturation);
      const q = value * (1 - saturation * frac);
      const t = value * (1 - saturation * (1 - frac));
      switch (sectorIndex) {
        case 0:
          r = value;
          g = t;
          b = p;
          break;
        case 1:
          r = q;
          g = value;
          b = p;
          break;
        case 2:
          r = p;
          g = value;
          b = t;
          break;
        case 3:
          r = p;
          g = q;
          b = value;
          break;
        case 4:
          r = t;
          g = p;
          b = value;
          break;
        case 5:
          r = value;
          g = p;
          b = q;
          break;
      }
    }
    return Color.fromRgb(Math.floor(255 * r), Math.floor(255 * g), Math.floor(255 * b));
  }

  constructor(
    public r: number,
    public g: number,
    public b: number,
  ) {}

  /** 0xRRGGBB 整数形式。 */
  asHex(): number {
    return (this.r << 16) + (this.g << 8) + this.b;
  }

  /** "#rrggbb" 字符串形式。 */
  asHexString(): string {
    return "#" + pad(this.asHex().toString(16), "000000");
  }

  clone(): Color {
    return new Color(this.r, this.g, this.b);
  }
}
