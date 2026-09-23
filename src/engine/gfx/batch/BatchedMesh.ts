/**
 * BatchedMesh — 批处理网格基类（Instancing/Merging 模式标记 + 调色板/裁剪字段）。
 *
 * 由 engine/gfx/batch/BatchedMesh.ts.js 重写为 TS（行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

declare const THREE: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 批处理模式。 */
export enum BatchMode {
  Instancing = 0,
  Merging = 1,
}

/** BatchedMesh。 */
export class BatchedMesh extends THREE.Mesh {
  geometry: any;
  material: any;
  batchMode: number;
  isBatchedMesh: boolean = true;
  castShadow: boolean;
  opacity: number = 1;
  extraLight: any;
  lightDir: any;
  paletteIndex: number = 0;
  clippingPlanes: any[] = [];
  clippingPlanesHash: string = "";

  constructor(geometry: any, material: any, batchMode: number = BatchMode.Instancing) {
    super(geometry, material);
    this.geometry = geometry;
    this.material = material;
    this.batchMode = batchMode;
    this.castShadow = false;
    this.extraLight = new THREE.Vector3(0, 0, 0);
    this.lightDir = new THREE.Vector3(-1, 0, 0);
    this.layers.disable(0);
  }

  getOpacity(): number {
    return this.opacity;
  }
  setOpacity(v: number): void {
    this.opacity = v;
  }
  getExtraLight(): any {
    return this.extraLight;
  }
  setExtraLight(v: any): void {
    this.extraLight = v;
  }
  getPaletteIndex(): number {
    return this.paletteIndex;
  }
  setPaletteIndex(v: number): void {
    this.paletteIndex = v;
  }
  getLightDir(): any {
    return this.lightDir;
  }
  setLightDir(v: any): void {
    this.lightDir = v;
  }
  getClippingPlanes(): any[] {
    return this.clippingPlanes;
  }
  setClippingPlanes(v: any[]): void {
    this.clippingPlanes = v;
    this.updateClippingPlanesHash(v);
  }
  /** 展开 [nx,ny,nz,constant,...] 逗号串。 */
  updateClippingPlanesHash(planes: any[]): void {
    this.clippingPlanesHash = planes
      .map((plane) => [...plane.normal.toArray(), plane.constant])
      .flat()
      .join(",");
  }
  getClippingPlanesHash(): string {
    return this.clippingPlanesHash;
  }
}
