/**
 * PalDrawable — 将 256 色调色板画成一行 RgbaBitmap（alpha：索引 0 透明）。
 *
 * 由 engine/gfx/drawable/PalDrawable.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { RgbaBitmap } from "data/Bitmap"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 调色板最小形状。 */
export interface PaletteLike {
  size: number;
  getColor(index: number): { r: number; g: number; b: number };
}

/** PalDrawable：调色板 → 1×size 纹理位图。 */
export class PalDrawable {
  constructor(public readonly pal: PaletteLike) {}

  /** 生成宽 = pal.size、高 = 1 的 RgbaBitmap；索引 0 的 alpha=0，其余 255。 */
  draw(): RgbaBitmap {
    const size = this.pal.size;
    const bitmap = new RgbaBitmap(size, 1);
    let i = 0;
    for (let s = 0, a = size; s < a; ++s) {
      const color = this.pal.getColor(s);
      bitmap.data[i] = color.r;
      bitmap.data[i + 1] = color.g;
      bitmap.data[i + 2] = color.b;
      bitmap.data[i + 3] = s ? 255 : 0;
      i += 4;
    }
    return bitmap;
  }
}
