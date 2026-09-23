/**
 * PcxFile — PCX 位图解码与画布/导出。
 *
 * 构造时经 pcx-js 解码得到 RGBA 像素，再 fixAlpha 把“品红键色”
 * (255,0,255) 置 alpha=0。提供 toCanvas/toDataUrl/toPngBlob 导出。
 *
 * 由 data/PcxFile.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import Pcx from "pcx-js"; // 已转换
import * as CanvasUtilsModule from "engine/gfx/CanvasUtils"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
/** 画布工具（any-shim）。 */
const CanvasUtils: any = CanvasUtilsModule.CanvasUtils;
export class PcxFile {
  /** 底层源文件。 */
  readonly file: any;
  /** 解码后宽度。 */
  width: number;
  /** 解码后高度。 */
  height: number;
  /** RGBA 像素缓冲。 */
  data: Uint8Array;

  constructor(file: any) {
    this.file = file;
    const stream = this.file.stream;
    const decoder = new Pcx(new Uint8Array(stream.buffer, stream.byteOffset, stream.byteLength));
    const decoded = decoder.decode();
    const pixels = decoded.pixelArray;
    this.fixAlpha(pixels);
    this.width = decoded.width;
    this.height = decoded.height;
    this.data = pixels;
  }

  /** 导出为 PNG Blob。 */
  async toPngBlob(): Promise<Blob> {
    const canvas = this.toCanvas();
    return await CanvasUtils.canvasToBlob(canvas);
  }

  /** 导出为 data URL。 */
  toDataUrl(): string {
    return this.toCanvas().toDataURL();
  }

  /** 由 RGBA 数据构造画布。 */
  toCanvas(): any {
    return CanvasUtils.canvasFromRgbaImageData(this.data, this.width, this.height);
  }

  /** 将品红键色 (255,0,255) 的 alpha 置 0。 */
  fixAlpha(pixels: Uint8Array): void {
    for (let i = 0, n = pixels.length; i < n; i += 4) {
      if (pixels[i] === 255 && pixels[i + 1] === 0 && pixels[i + 2] === 255) pixels[i + 3] = 0;
    }
  }
}
