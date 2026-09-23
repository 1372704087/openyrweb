/**
 * TmpFile — TMP 瓦片帧容器：宽高 + 分块尺寸 + 偏移表 → TmpImage 列表。
 *
 * 文件头四个 int32：width, height, blockWidth, blockHeight；
 * 随后 width*height 个小端 uint32 偏移，每条指向一帧 TmpImage。
 *
 * 由 data/TmpFile.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 */
import { TmpImage } from './TmpImage';
import { VirtualFile } from './vfs/VirtualFile';

export class TmpFile {
  width?: number;
  height?: number;
  blockWidth?: number;
  blockHeight?: number;
  images: TmpImage[] = [];

  constructor(src?: VirtualFile) {
    this.images = [];
    if (src instanceof VirtualFile) this.fromVirtualFile(src);
  }

  /** 读头 + 偏移表，按偏移 seek 后逐帧构造 TmpImage。 */
  fromVirtualFile(file: VirtualFile): this {
    const stream = file.stream;
    this.width = stream.readInt32();
    this.height = stream.readInt32();
    this.blockWidth = stream.readInt32();
    this.blockHeight = stream.readInt32();

    const cellCount = this.width! * this.height!;
    // 偏移表以小端 uint32 紧跟头部；TypedArray 视图直接读底层字节
    const offsets = new Uint8Array(stream.buffer, stream.byteOffset + stream.position, 4 * cellCount);
    this.images = [];
    for (let i = 0; i < cellCount; i++) {
      const off =
        (offsets[4 * i + 3] << 24) | (offsets[4 * i + 2] << 16) | (offsets[4 * i + 1] << 8) | offsets[4 * i];
      stream.seek(off);
      this.images.push(new TmpImage(stream, this.blockWidth!, this.blockHeight!));
    }
    return this;
  }
}
