/**
 * VxlFile — VXL 体素模型读取（头表 + 尾表 + 按 span 解码体素）。
 *
 * 布局：VxlHeader → 逐段 Section 头（名称）→ body 字节区 →
 * 逐段 tailer（span 偏移、包围盒、尺寸、法线模式）→ 回到 body
 * 起点按 startingSpanOffset 解码每段 span 中的体素。
 * 重复段名仅 console.warn，不中断。
 *
 * 由 data/VxlFile.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 */
import { VirtualFile } from './vfs/VirtualFile';
import { Section } from './vxl/Section';
import { VxlHeader } from './vxl/VxlHeader';
import type { DataStream } from './DataStream';

declare const THREE: any;

/** tailer 中记录的三处 span 偏移（相对 body 起点）。 */
interface SpanOffsets {
  startingSpanOffset: number;
  endingSpanOffset: number;
  dataSpanOffset: number;
}

/** 由普通 JSON 还原时的载荷。 */
export interface VxlPlain {
  sections: ReturnType<Section['toPlain']>[];
  voxelCount: number;
}

export class VxlFile {
  filename?: string;
  sections: Section[];
  voxelCount = 0;

  constructor(src?: VirtualFile) {
    this.voxelCount = 0;
    if (src instanceof VirtualFile) this.fromVirtualFile(src);
  }

  /** 完整解析 VXL；文件过短或头/尾计数不匹配时静默保留空 sections。 */
  fromVirtualFile(file: VirtualFile): this {
    this.filename = file.filename;
    const stream = file.stream;
    this.sections = [];
    if (stream.byteLength < VxlHeader.size) return this;

    const header = new VxlHeader();
    header.read(stream);
    if (!header.headerCount || !header.tailerCount || header.tailerCount !== header.headerCount) return this;

    // 第一遍：读各段头（名称）
    for (let i = 0; i < header.headerCount; ++i) {
      const sec = new Section();
      this.readSectionHeader(sec, stream);
      if (this.sections.find((s) => s.name === sec.name))
        console.warn(`Duplicate section name "${sec.name}" found in VXL "${this.filename}".`);
      this.sections.push(sec);
    }

    const bodyStart = stream.position;
    stream.seek(stream.position + header.bodySize);

    // 第二遍：读各段 tailer
    const offsets: SpanOffsets[] = [];
    for (let i = 0; i < header.tailerCount; ++i)
      offsets[i] = this.readSectionTailer(this.sections[i], stream);

    // 第三遍：回 body 按偏移解码 span，累计体素数
    let total = 0;
    for (let i = 0; i < header.headerCount; ++i) {
      stream.seek(bodyStart);
      total += this.readSectionBodySpans(this.sections[i], offsets[i], stream);
    }
    this.voxelCount = total;
    return this;
  }

  /** 读 16 字节段名 + 3 个跳过的 uint32。 */
  private readSectionHeader(sec: Section, stream: DataStream): void {
    sec.name = stream.readCString(16);
    stream.readUint32();
    stream.readUint32();
    stream.readUint32();
  }

  /** 读尾表并写回 Section 几何字段，返回 span 偏移三元组。 */
  private readSectionTailer(sec: Section, stream: DataStream): SpanOffsets {
    const startingSpanOffset = stream.readUint32();
    const endingSpanOffset = stream.readUint32();
    const dataSpanOffset = stream.readUint32();
    sec.hvaMultiplier = stream.readFloat32();
    sec.transfMatrix = this.readTransfMatrix(stream);
    sec.minBounds = new THREE.Vector3(stream.readFloat32(), stream.readFloat32(), stream.readFloat32());
    sec.maxBounds = new THREE.Vector3(stream.readFloat32(), stream.readFloat32(), stream.readFloat32());
    sec.sizeX = stream.readUint8();
    sec.sizeY = stream.readUint8();
    sec.sizeZ = stream.readUint8();
    sec.normalsMode = stream.readUint8();
    return { startingSpanOffset, endingSpanOffset, dataSpanOffset };
  }

  /** 12 float 行主序 → 补齐 4×4 → 转置为列主序 Matrix4。 */
  private readTransfMatrix(stream: DataStream): any {
    const data: number[] = [];
    for (let i = 0; i < 3; ++i)
      data.push(stream.readFloat32(), stream.readFloat32(), stream.readFloat32(), stream.readFloat32());
    data.push(0, 0, 0, 1);
    return new THREE.Matrix4().fromArray(data).transpose();
  }

  /** 从 startingSpanOffset 起读 y×x 两组 int32 偏移表，再逐格解码 span；返回体素数。 */
  private readSectionBodySpans(sec: Section, off: SpanOffsets, stream: DataStream): number {
    stream.seek(stream.position + off.startingSpanOffset);
    const { sizeX, sizeY, sizeZ } = sec;

    // 第一组：每格 span 起始偏移
    const starts: number[][] = new Array(sizeY);
    for (let y = 0; y < sizeY; ++y) {
      starts[y] = new Array(sizeX);
      for (let x = 0; x < sizeX; ++x) starts[y][x] = stream.readInt32();
    }
    // 第二组：每格 span 结束偏移（与起始配对使用）
    const ends: number[][] = new Array(sizeY);
    for (let y = 0; y < sizeY; ++y) {
      ends[y] = new Array(sizeX);
      for (let x = 0; x < sizeX; ++x) ends[y][x] = stream.readInt32();
    }

    sec.spans = [];
    let count = 0;
    for (let y = 0; y < sizeY; ++y)
      for (let x = 0; x < sizeX; ++x) {
        const voxels = this.readSpanVoxels(starts[y][x], ends[y][x], x, y, sizeZ, stream);
        const span = { x, y, voxels };
        sec.spans.push(span);
        count += voxels.length;
      }
    return count;
  }

  /** 起止均为 -1 则空；否则循环：跳过字节 → 计数字节 → 计数×(色,法线) → 分隔字节。 */
  private readSpanVoxels(
    start: number,
    end: number,
    x: number,
    y: number,
    sizeZ: number,
    stream: DataStream,
  ): Array<{ x: number; y: number; z: number; colorIndex: number; normalIndex: number }> {
    if (start === -1 || end === -1) return [];
    const voxels: Array<{ x: number; y: number; z: number; colorIndex: number; normalIndex: number }> = [];
    for (let z = 0; z < sizeZ; ) {
      z += stream.readUint8();
      const n = stream.readUint8();
      for (let i = 0; i < n; ++i) {
        voxels.push({
          x,
          y,
          z: z++,
          colorIndex: stream.readUint8(),
          normalIndex: stream.readUint8(),
        });
      }
      stream.readUint8(); // 段分隔
    }
    return voxels;
  }

  /** 从普通 JSON 还原（sections 逐个 fromPlain）。 */
  fromPlain(plain: VxlPlain): this {
    this.sections = plain.sections.map((s) => new Section().fromPlain(s));
    this.voxelCount = plain.voxelCount;
    return this;
  }

  /** 导出可序列化 JSON。 */
  toPlain(): VxlPlain {
    return { sections: this.sections.map((s) => s.toPlain()), voxelCount: this.voxelCount };
  }

  /** 按下标取段。 */
  getSection(index: number): Section | undefined {
    return this.sections[index];
  }
}
