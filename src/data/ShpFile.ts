/**
 * ShpFile — SHP 图集（帧头 + 压缩像素）解析。
 *
 * 由 data/ShpFile.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 读序：int16==0 → w/h/n → n×14B 帧头 → 按 offset 解压。
 * 压缩：0/1 原始、2 行前缀、3 Format3。
 */

import { Format3 } from "data/encoding/Format3"; // 未转换（any-shim）
import { ShpImage } from "data/ShpImage"; // 未转换（any-shim）
import { VirtualFile } from "data/vfs/VirtualFile"; // 本组已写

interface FrameHeader {
  x: number;
  y: number;
  width: number;
  height: number;
  compressionType: number;
  imageDataStartOffset: number;
}

/** SHP 图集。 */
export class ShpFile {
  height = 0;
  width = 0;
  numImages = 0;
  images: ShpImage[] = [];
  filename?: string;

  constructor(file?: any) {
    this.height = 0;
    this.width = 0;
    this.numImages = 0;
    this.images = [];
    if (file instanceof VirtualFile) this.fromVirtualFile(file);
  }

  fromVirtualFile(file: VirtualFile): void {
    this.filename = file.filename;
    const stream = file.stream;
    if (stream.readInt16() !== 0) return;

    this.width = stream.readInt16();
    this.height = stream.readInt16();
    this.numImages = stream.readInt16();

    const headers: FrameHeader[] = [];
    for (let i = 0; i < this.numImages; ++i) {
      headers.push(this.readFrameHeader(stream));
    }

    this.images = [];
    for (let i = 0; i < this.numImages; ++i) {
      const { compressionType, imageDataStartOffset, x, y, width, height } = headers[i];
      let end = i < this.numImages - 1 ? headers[i + 1].imageDataStartOffset : stream.byteLength;
      if (end < imageDataStartOffset) end = stream.byteLength;
      const available = end - imageDataStartOffset;
      stream.seek(imageDataStartOffset);
      const pixels = this.readImageData(stream, width, height, compressionType, available);
      const image = new ShpImage(pixels);
      image.x = x;
      image.y = y;
      image.width = width;
      image.height = height;
      this.images.push(image);
    }
  }

  /** 14 字节帧头。 */
  readFrameHeader(stream: any): FrameHeader {
    const x = stream.readInt16();
    const y = stream.readInt16();
    const width = stream.readInt16();
    const height = stream.readInt16();
    const compressionType = stream.readUint8();
    stream.readUint8();
    stream.readUint8();
    stream.readUint8();
    stream.readInt32();
    stream.readInt32();
    return { x, y, width, height, compressionType, imageDataStartOffset: stream.readInt32() };
  }

  readImageData(
    stream: any,
    width: number,
    height: number,
    compressionType: number,
    available: number,
  ): Uint8Array {
    const length = width * height;
    if (compressionType <= 1) {
      const view = new Uint8Array(stream.buffer, stream.byteOffset + stream.position, length);
      stream.position += length;
      return view;
    }
    if (compressionType === 2) {
      let outIdx = 0;
      const out = new Uint8Array(length);
      for (let row = 0; row < height; ++row) {
        const run = stream.readUint16() - 2;
        out.set(new Uint8Array(stream.buffer, stream.byteOffset + stream.position, run), outIdx);
        stream.position += run;
        outIdx += run;
      }
      return out;
    }
    if (compressionType !== 3) return new Uint8Array();
    const compressed = new Uint8Array(stream.buffer, stream.byteOffset + stream.position, available);
    stream.position += available;
    return Format3.decode(compressed, width, height);
  }

  getImage(index: number): ShpImage {
    if (index < 0 || this.images.length <= index) {
      throw new RangeError(
        `Image index out of bounds (file=${this.filename}, index=${index}, length=${this.images.length})`,
      );
    }
    return this.images[index];
  }

  addImage(image: ShpImage): void {
    this.images.push(image);
    this.numImages++;
  }

  clip(maxW: number, maxH: number): ShpFile {
    const copy = new ShpFile();
    copy.filename = this.filename;
    copy.width = Math.min(this.width, maxW);
    copy.height = Math.min(this.height, maxH);
    copy.images = this.images.map((image) => image.clip(copy.width, copy.height));
    copy.numImages = this.numImages;
    return copy;
  }
}
