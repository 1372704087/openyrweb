/**
 * MeshMergingBatch — 合并批次包装：延迟创建 MergedSpriteMesh 并转发阴影/裁剪。
 *
 * 由 engine/gfx/batch/MeshMergingBatch.ts.js 重写为 TS（行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { MergedSpriteMesh } from "engine/gfx/batch/MergedSpriteMesh"; // 孪生（本批内一并转换）

declare const THREE: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** MeshMergingBatch。 */
export class MeshMergingBatch {
  maxInstances: number;
  target?: any;
  mergedGeoMesh?: any;
  private _castShadow: boolean;
  private _receiveShadow: boolean;
  private _clippingPlanes: any[];
  private _renderOrder: number;

  get castShadow(): boolean {
    return this._castShadow;
  }
  set castShadow(v: boolean) {
    this._castShadow = v;
    if (this.mergedGeoMesh) this.mergedGeoMesh.castShadow = v;
  }
  get receiveShadow(): boolean {
    return this._receiveShadow;
  }
  set receiveShadow(v: boolean) {
    this._receiveShadow = v;
    if (this.mergedGeoMesh) this.mergedGeoMesh.receiveShadow = v;
  }
  get clippingPlanes(): any[] {
    return this._clippingPlanes;
  }
  set clippingPlanes(v: any[]) {
    this._clippingPlanes = v;
    if (this.mergedGeoMesh) this.mergedGeoMesh.material.clippingPlanes = v;
  }
  get renderOrder(): number {
    return this._renderOrder;
  }
  set renderOrder(v: number) {
    this._renderOrder = v;
    if (this.mergedGeoMesh) this.mergedGeoMesh.renderOrder = v;
  }

  constructor(maxInstances: number) {
    this.maxInstances = maxInstances;
    this._castShadow = false;
    this._receiveShadow = false;
    this._clippingPlanes = [];
    this._renderOrder = 0;
  }

  get3DObject(): any {
    return this.target;
  }

  create3DObject(): void {
    if (!this.target) {
      const root = new THREE.Object3D();
      root.matrixAutoUpdate = false;
      this.target = root;
      if (this.mergedGeoMesh) root.add(this.mergedGeoMesh);
    }
  }

  /** 更新合并网格；空数组销毁，首次非空按首 mesh 几何/材质创建。 */
  setMeshes(meshes: any[]): void {
    if (meshes.length > this.maxInstances) {
      throw new RangeError("Meshes array exceeds max number of instances");
    }
    if (meshes.length) {
      if (!this.mergedGeoMesh) {
        this.mergedGeoMesh = new MergedSpriteMesh(
          meshes[0].geometry,
          meshes[0].material,
          this.maxInstances,
        );
        this.mergedGeoMesh.castShadow = this._castShadow;
        this.mergedGeoMesh.receiveShadow = this._receiveShadow;
        this.mergedGeoMesh.renderOrder = this._renderOrder;
        this.mergedGeoMesh.material.clippingPlanes = this._clippingPlanes;
        this.target?.add(this.mergedGeoMesh);
      }
      this.mergedGeoMesh.updateFromMeshes(meshes);
    } else if (this.mergedGeoMesh) {
      this.target?.remove(this.mergedGeoMesh);
      this.mergedGeoMesh.dispose();
      this.mergedGeoMesh = undefined;
    }
  }

  update(): void {}

  dispose(): void {
    this.mergedGeoMesh?.dispose();
  }
}
