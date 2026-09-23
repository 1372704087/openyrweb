/**
 * WavFile — WAV 容器：原始字节持有 + IMA-ADPCM 惰性解码。
 *
 * 由 data/WavFile.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * getData() 首次调用时 decodeData 并清空 rawData；4bit 经 wavefile 还原 PCM。
 */

import { WaveFile } from "wavefile";
import { VirtualFile } from "data/vfs/VirtualFile"; // 本组已写

/** WAV 文件句柄。 */
export class WavFile {
  rawData?: Uint8Array;
  decodedData?: Uint8Array;

  constructor(source?: Uint8Array | VirtualFile) {
    if (source instanceof Uint8Array) this.fromRawData(source);
    else if (source instanceof VirtualFile) this.fromVirtualFile(source);
  }

  fromRawData(data: Uint8Array): this {
    this.rawData = data;
    return this;
  }

  fromVirtualFile(file: VirtualFile): this {
    const stream = file.stream;
    this.rawData = new Uint8Array(stream.buffer, stream.byteOffset, stream.byteLength);
    return this;
  }

  getRawData(): Uint8Array | undefined {
    return this.rawData;
  }

  getData(): Uint8Array | undefined {
    if (!this.decodedData) {
      if (!this.rawData) throw new Error("No data loaded");
      this.decodedData = this.decodeData(this.rawData);
      this.rawData = undefined;
    }
    return this.decodedData;
  }

  setData(data: Uint8Array): void {
    this.rawData = undefined;
    this.decodedData = data;
  }

  decodeData(data: Uint8Array): Uint8Array {
    const wav = new WaveFile(data);
    if (wav.bitDepth === "4") wav.fromIMAADPCM();
    return wav.toBuffer() as unknown as Uint8Array;
  }

  isRawImaAdpcm(): boolean | undefined {
    return this.rawData && new WaveFile(this.rawData).bitDepth === "4";
  }
}
