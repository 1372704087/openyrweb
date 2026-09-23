/**
 * Bitmap — 通用位图像素缓冲（Indexed / RGB / RGBA）。
 *
 * 由 data/Bitmap.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 要点：
 * - 每像素字节数由 PixelFormat 推导，未知格式抛错。
 * - drawIndexIndexed 把 8bit 调色板索引图 blit 到目标缓冲；索引 0 视为透明跳过。
 * - 派生类只固定 pixelFormat，RgbaBitmap 另提供整块 RGBA 拷贝。
 */

/** 像素格式（数值与 SystemJS 孪生一致，不可改）。 */
export enum PixelFormat {
  Rgb = 1,
  Rgba = 2,
  Indexed = 3,
}

/** 格式 → 每像素字节数；未支持格式抛 Error。 */
function bytesPerPixel(format: PixelFormat): number {
  switch (format) {
    case PixelFormat.Indexed:
      return 1;
    case PixelFormat.Rgb:
      return 3;
    case PixelFormat.Rgba:
      return 4;
    default:
      throw new Error(`Unsupported pixel format ${format}`);
  }
}

/** 位图数据载体：线性行主序像素缓冲。 */
export class Bitmap {
  /** 像素缓冲（length = bpp * width * height，或外部注入）。 */
  data: Uint8Array;
  /** 当前像素格式。 */
  pixelFormat: PixelFormat;
  /** 宽度（像素）。 */
  width: number;
  /** 高度（像素）。 */
  height: number;

  constructor(width: number, height: number, data?: Uint8Array, pixelFormat: PixelFormat = PixelFormat.Rgba) {
    const bpp = bytesPerPixel(pixelFormat);
    this.data = data || new Uint8Array(bpp * width * height);
    this.pixelFormat = pixelFormat;
    this.width = width;
    this.height = height;
  }

  /**
   * 把调色板索引源图 blit 到本缓冲的 (destX, destY)。
   * 索引 0 不写入（视为透明）；源图逐行推进，目标行尾按 stride 补齐。
   */
  drawIndexedImage(src: { width: number; height: number; data: Uint8Array }, destX: number, destY: number): void {
    const bpp = bytesPerPixel(this.pixelFormat);
    const dest = this.data;
    const width = this.width;
    const rowBytes = bpp * width;
    const total = bpp * width * this.height;
    let destIdx = 0 + rowBytes * destY + bpp * destX;
    let srcIdx = 0;
    for (let y = 0; y < src.height; y++) {
      for (let x = 0; x < src.width; x++) {
        const index = src.data[srcIdx];
        if (index !== 0 && destIdx >= 0 && destIdx < total) {
          dest[destIdx] = index;
          if (bpp >= 3) {
            dest[destIdx + 1] = 0;
            dest[destIdx + 2] = 0;
          }
          if (bpp === 4) dest[destIdx + 3] = 255;
        }
        destIdx += bpp;
        srcIdx++;
      }
      destIdx += rowBytes - src.width * bpp;
    }
  }
}

/** 8bit 索引位图（每像素 1 字节）。 */
export class IndexedBitmap extends Bitmap {
  constructor(width: number, height: number, data?: Uint8Array) {
    super(width, height, data, PixelFormat.Indexed);
  }
}

/** 24bit RGB 位图。 */
export class RgbBitmap extends Bitmap {
  constructor(width: number, height: number, data?: Uint8Array) {
    super(width, height, data, PixelFormat.Rgb);
  }
}

/** 32bit RGBA 位图；可整块拷贝另一张 RGBA 源。 */
export class RgbaBitmap extends Bitmap {
  constructor(width: number, height: number, data?: Uint8Array) {
    super(width, height, data, PixelFormat.Rgba);
  }

  /** 把 RGBA 源图整块 blit 到 (destX, destY)，每像素固定 4 字节。 */
  drawRgbaImage(src: { width: number; height: number; data: Uint8Array }, destX: number, destY: number): void {
    const dest = this.data;
    const width = this.width;
    const rowBytes = 4 * width;
    const total = 4 * width * this.height;
    let destIdx = 0 + rowBytes * destY + 4 * destX;
    let srcIdx = 0;
    for (let y = 0; y < src.height; y++) {
      for (let x = 0; x < src.width; x++) {
        if (destIdx >= 0 && destIdx < total) {
          dest[destIdx] = src.data[srcIdx];
          dest[destIdx + 1] = src.data[srcIdx + 1];
          dest[destIdx + 2] = src.data[srcIdx + 2];
          dest[destIdx + 3] = src.data[srcIdx + 3];
        }
        destIdx += 4;
        srcIdx += 4;
      }
      destIdx += rowBytes - 4 * src.width;
    }
  }
}
