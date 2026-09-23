/**
 * VoxelField — 三维体素场：sizeX×sizeY×sizeZ 线性数组。
 *
 * 由 data/vxl/VoxelField.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 下标：`x + y*sizeX + z*sizeX*sizeY`；get 越界返回 undefined。
 */

/** 至少含 x/y/z 的体素元素。 */
export type VoxelLike = { x: number; y: number; z: number; [key: string]: any };

/** 三维体素场。 */
export class VoxelField<T extends VoxelLike = VoxelLike> {
  sizeX: number;
  sizeY: number;
  sizeZ: number;
  arr: (T | undefined)[];

  constructor(sizeX: number, sizeY: number, sizeZ: number) {
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.sizeZ = sizeZ;
    this.arr = new Array(sizeX * sizeY * sizeZ);
  }

  add(voxel: T): void {
    this.arr[voxel.x + voxel.y * this.sizeX + voxel.z * this.sizeX * this.sizeY] = voxel;
  }

  get(x: number, y: number, z: number): T | undefined {
    if (x >= this.sizeX || y >= this.sizeY || z >= this.sizeZ) return undefined;
    return this.arr[x + y * this.sizeX + z * this.sizeX * this.sizeY];
  }
}
