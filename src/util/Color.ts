/**
 * Color — 24 位 RGB 颜色，含 HSV → RGB 换算。
 *
 * 游戏中的用途：玩家阵营色（Player 构造时默认红色）、小地图/血条/
 * 选中框等着色。r/g/b 各 0-255。
 *
 * fromHsv 的取值约定比较特殊：三个输入分量都按 0-255 刻度传入（而不是
 * 常见的 0-360°/0-1），内部先换算 —— hue/255*360 得到角度，saturation
 * 与 value 除以 255 归一化；再按标准 HSV 六扇区算法转 RGB，最后向下
 * 取整到整数（注意：取整而非四舍五入，颜色会整体略偏暗一档）。
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

  /** 0xRRGGBB 整数形式（位运算拼接，分量超界时按位回绕——与原实现一致）。 */
  asHex(): number {
    return (this.r << 16) + (this.g << 8) + this.b;
  }

  /** "#rrggbb" 字符串形式（不足六位左侧补零，供 CSS/日志使用）。 */
  asHexString(): string {
    return "#" + pad(this.asHex().toString(16), "000000");
  }

  /** 独立副本（改副本不影响原色）。 */
  clone(): Color {
    return new Color(this.r, this.g, this.b);
  }
}
