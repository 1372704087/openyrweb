/**
 * HvaFile — HVA（Hierarchical Voxel Animation）逐帧变换矩阵读取。
 *
 * 文件布局：16 字节文件名、int32 矩阵帧数、int32 段数，
 * 每段 16 字节名称 + 预分配 matrices 数组；随后按「帧优先」顺序
 * 写入全部 4×4 矩阵（行主序 12 个 float + 补 0,0,0,1 后转置）。
 *
 * 由 data/HvaFile.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 */
import { Section } from './hva/Section';
import { VirtualFile } from './vfs/VirtualFile';
import type { DataStream } from './DataStream';

declare const THREE: any;

export class HvaFile {
  filename?: string;
  sections?: Section[];

  constructor(src?: VirtualFile) {
    if (src instanceof VirtualFile) this.fromVirtualFile(src);
  }

  /** 从 VirtualFile 解析全部段与帧矩阵。 */
  fromVirtualFile(file: VirtualFile): this {
    this.filename = file.filename;
    const stream = file.stream;
    this.sections = [];
    stream.readCString(16); // 文件头名称，丢弃
    const frameCount = stream.readInt32();
    const sectionCount = stream.readInt32();

    // 第一遍：按段数创建 Section 占位并读段名
    for (let s = 0; s < sectionCount; ++s) {
      const sec = new Section();
      sec.name = stream.readCString(16);
      sec.matrices = new Array(frameCount);
      this.sections.push(sec);
    }
    // 第二遍：帧优先填充各段矩阵
    for (let f = 0; f < frameCount; ++f)
      for (let s = 0; s < sectionCount; ++s)
        this.sections![s].matrices[f] = this.readMatrix(stream);
    return this;
  }

  /** 读 12 个 float 组成的 3×4 矩阵，补齐为 4×4 后转置为列主序 Matrix4。 */
  private readMatrix(stream: DataStream): any {
    const data: number[] = [];
    for (let i = 0; i < 3; ++i)
      data.push(stream.readFloat32(), stream.readFloat32(), stream.readFloat32(), stream.readFloat32());
    data.push(0, 0, 0, 1);
    return new THREE.Matrix4().fromArray(data).transpose();
  }
}
