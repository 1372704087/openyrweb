/**
 * ImageUtils — SHP 帧 → Bitmap / canvas / PNG blob 转换。
 *
 * 由 engine/gfx/ImageUtils.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { IndexedBitmap } from "data/Bitmap"; // 已转换
import { CanvasUtils } from "engine/gfx/CanvasUtils"; // 孪生（本批内一并转换）

/* eslint-disable @typescript-eslint/no-explicit-any */

/** SHP 图像最小形状。 */
export interface ShpImageLike {
  width: number;
  height: number;
  x: number;
  y: number;
  imageData: Uint8Array;
}

/** SHP 文件最小形状。 */
export interface ShpFileLike {
  width: number;
  height: number;
  numImages: number;
  getImage(index: number): ShpImageLike;
}

/** 调色板最小形状。 */
export interface PaletteLike {
  getColor(index: number): { r: number; g: number; b: number };
}

/** ImageUtils 静态工具。 */
export class ImageUtils {
  /** SHP → PNG Blob。 */
  static async convertShpToPng(shp: ShpFileLike, palette: PaletteLike): Promise<Blob | null> {
    const canvas = this.convertShpToCanvas(shp, palette);
    return await CanvasUtils.canvasToBlob(canvas);
  }

  /**
   * SHP 全帧拼合为单张 IndexedBitmap。
   * @param padSquare 为 true 且宽高不等时，把画布扩成正方形并居中较小维。
   */
  static convertShpToBitmap(shp: ShpFileLike, palette: PaletteLike, padSquare: boolean = false): IndexedBitmap {
    let ox = 0;
    let oy = 0;
    let cellW = shp.width;
    let cellH = shp.height;
    if (cellW !== cellH && padSquare) {
      ox = cellW > cellH ? 0 : Math.floor((cellH - cellW) / 2);
      oy = cellW > cellH ? Math.floor((cellW - cellH) / 2) : 0;
      cellW = cellH = Math.max(cellW, cellH);
    }
    const out = new IndexedBitmap(shp.numImages * cellW, cellH);
    for (let i = 0; i < shp.numImages; i++) {
      const frame = shp.getImage(i);
      const indexed = new IndexedBitmap(frame.width, frame.height, frame.imageData);
      out.drawIndexedImage(indexed, i * cellW + frame.x + ox, frame.y + oy);
    }
    return out;
  }

  /** SHP → canvas（经 convertShpToBitmap + palette）。 */
  static convertShpToCanvas(shp: ShpFileLike, palette: PaletteLike, padSquare: boolean = false): HTMLCanvasElement {
    const bitmap = this.convertShpToBitmap(shp, palette, padSquare);
    return CanvasUtils.canvasFromIndexedImageData(bitmap.data, bitmap.width, bitmap.height, palette);
  }
}
