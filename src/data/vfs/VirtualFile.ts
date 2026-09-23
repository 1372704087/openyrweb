/**
 * VirtualFile — 统一虚拟文件：DataStream + 文件名。
 *
 * 由 data/vfs/VirtualFile.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 视图工厂均把 _trimAlloc 置空：子视图不得收缩共享 ArrayBuffer。
 */

import { DataStream } from "data/DataStream"; // 本组已写
import { IOError } from "data/vfs/IOError"; // 本组已写

/** 虚拟文件。 */
export class VirtualFile {
  stream: DataStream;
  filename: string;

  /** 从 Blob/File 读入；DOMException 包为 IOError。 */
  static async fromRealFile(file: Blob & { name: string }): Promise<VirtualFile> {
    try {
      const stream = new DataStream(await file.arrayBuffer());
      stream._trimAlloc = () => {};
      return new this(stream, file.name);
    } catch (err) {
      if (err instanceof DOMException) {
        throw new IOError(`File "${file.name}" could not be read (${err.name})`, { cause: err });
      }
      throw err;
    }
  }

  /** 从已有字节建视图。 */
  static fromBytes(bytes: ArrayBuffer | ArrayBufferView, filename: string): VirtualFile {
    const stream = new DataStream(bytes as any);
    stream._trimAlloc = () => {};
    return new this(stream, filename);
  }

  /** 在父流上切 [start, start+length) 子视图。 */
  static factory(stream: DataStream, filename: string, start = 0, length?: number): VirtualFile {
    const len = length ?? stream.byteLength;
    const view = new DataView(stream.buffer, stream.byteOffset + start, len);
    const child = new DataStream(view);
    child._trimAlloc = () => {};
    return new this(child, filename);
  }

  constructor(stream: DataStream, filename: string) {
    this.stream = stream;
    this.filename = filename;
  }

  /** seek(0) 后读整段字符串。 */
  readAsString(encoding?: string): string {
    this.stream.seek(0);
    return this.stream.readString(this.stream.byteLength, encoding);
  }

  getBytes(): Uint8Array {
    return new Uint8Array(this.stream.buffer, this.stream.byteOffset, this.stream.byteLength);
  }

  getSize(): number {
    return this.stream.byteLength;
  }

  asFile(type?: string): File {
    return new File([this.getBytes() as unknown as BlobPart], this.filename, { type });
  }
}
