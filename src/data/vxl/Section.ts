/**
 * Section — VXL 模型中的一个 section（体素切片段）。
 *
 * 持有 bounds / size / spans / 变换矩阵；提供 span/scale 计算、
 * 展平全部体素、按 normalsMode 取法线表、HVA 矩阵缩放以及
 * toPlain/fromPlain 序列化。
 *
 * 由 data/vxl/Section.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as NormalsModule from "data/vxl/normals"; // 未转换（any-shim）
import * as VoxelFieldModule from "data/vxl/VoxelField"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const THREE: any;
/** 法线表 1..4。 */
const normals1: any = NormalsModule.normals1;
const normals2: any = NormalsModule.normals2;
const normals3: any = NormalsModule.normals3;
const normals4: any = NormalsModule.normals4;
/** 体素场。 */
const VoxelField: any = VoxelFieldModule.VoxelField;

/** span 段（孪生结构：每段含体素列表）。 */
export interface SectionSpan {
  voxels: any[];
}

/** toPlain 输出的可序列化结构。 */
export interface SectionPlain {
  name: string;
  normalsMode: number;
  minBounds: number[];
  maxBounds: number[];
  sizeX: number;
  sizeY: number;
  sizeZ: number;
  hvaMultiplier: number;
  transfMatrix: number[];
  spans: SectionSpan[];
}

export class Section {
  /** section 名称。 */
  name: string;
  /** 法线模式 1..4。 */
  normalsMode: number;
  /** 最小包围盒角（THREE.Vector3）。 */
  minBounds: any;
  /** 最大包围盒角（THREE.Vector3）。 */
  maxBounds: any;
  /** X 方向体素数。 */
  sizeX: number;
  /** Y 方向体素数。 */
  sizeY: number;
  /** Z 方向体素数。 */
  sizeZ: number;
  /** HVA 缩放系数。 */
  hvaMultiplier: number;
  /** 变换矩阵（THREE.Matrix4）。 */
  transfMatrix: any;
  /** 体素 span 列表。 */
  spans: SectionSpan[];


  /** X 方向包围盒跨度。 */
  get spanX(): number {
    return this.maxBounds.x - this.minBounds.x;
  }

  /** Y 方向包围盒跨度。 */
  get spanY(): number {
    return this.maxBounds.y - this.minBounds.y;
  }

  /** Z 方向包围盒跨度。 */
  get spanZ(): number {
    return this.maxBounds.z - this.minBounds.z;
  }

  /** X 缩放 = spanX / sizeX。 */
  get scaleX(): number {
    return this.spanX / this.sizeX;
  }

  /** Y 缩放 = spanY / sizeY。 */
  get scaleY(): number {
    return this.spanY / this.sizeY;
  }

  /** Z 缩放 = spanZ / sizeZ。 */
  get scaleZ(): number {
    return this.spanZ / this.sizeZ;
  }

  /** 三维缩放向量。 */
  get scale(): any {
    return new THREE.Vector3(this.scaleX, this.scaleY, this.scaleZ);
  }

  /** 展平全部 span 中的体素，并构建 (size+1)^3 的 VoxelField。 */
  getAllVoxels(): { voxels: any[]; voxelField: any } {
    const voxels: any[] = [];
    const field = new VoxelField(this.sizeX + 1, this.sizeY + 1, this.sizeZ + 1);
    for (let i = 0, n = this.spans.length; i < n; i++) {
      const list = this.spans[i].voxels;
      for (let j = 0, m = list.length; j < m; j++) {
        const v = list[j];
        voxels.push(v);
        field.add(v);
      }
    }
    return { voxels, voxelField: field };
  }

  /** 按 normalsMode 返回对应法线表；非法 mode 抛错。 */
  getNormals(): any {
    switch (this.normalsMode) {
      case 1:
        return normals1;
      case 2:
        return normals2;
      case 3:
        return normals3;
      case 4:
        return normals4;
      default:
        throw new Error("Invalid normalsmode " + this.normalsMode);
    }
  }

  /** 克隆矩阵后按 hvaMultiplier 缩放平移分量 elements[12..14]。 */
  scaleHvaMatrix(matrix: any): any {
    const m = matrix.clone();
    m.elements[12] *= this.hvaMultiplier;
    m.elements[13] *= this.hvaMultiplier;
    m.elements[14] *= this.hvaMultiplier;
    return m;
  }

  /** 序列化为普通对象（向量/矩阵转数组）。 */
  toPlain(): SectionPlain {
    return {
      name: this.name,
      normalsMode: this.normalsMode,
      minBounds: this.minBounds.toArray(),
      maxBounds: this.maxBounds.toArray(),
      sizeX: this.sizeX,
      sizeY: this.sizeY,
      sizeZ: this.sizeZ,
      hvaMultiplier: this.hvaMultiplier,
      transfMatrix: this.transfMatrix.toArray(),
      spans: this.spans,
    };
  }

  /** 从普通对象反序列化（数组 → Vector3/Matrix4）。 */
  fromPlain(plain: SectionPlain): this {
    this.name = plain.name;
    this.normalsMode = plain.normalsMode;
    this.minBounds = new THREE.Vector3().fromArray(plain.minBounds);
    this.maxBounds = new THREE.Vector3().fromArray(plain.maxBounds);
    this.sizeX = plain.sizeX;
    this.sizeY = plain.sizeY;
    this.sizeZ = plain.sizeZ;
    this.hvaMultiplier = plain.hvaMultiplier;
    this.transfMatrix = new THREE.Matrix4().fromArray(plain.transfMatrix);
    this.spans = plain.spans;
    return this;
  }
}
