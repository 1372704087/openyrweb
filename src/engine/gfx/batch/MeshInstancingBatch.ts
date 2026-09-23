/**
 * MeshInstancingBatch — Instancing 批次包装：延迟创建 InstancedMesh 并转发阴影/裁剪。
 *
 * 由 engine/gfx/batch/MeshInstancingBatch.ts.js 重写为 TS（行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */
import { InstancedMesh } from "engine/gfx/batch/InstancedMesh"; // 孪生（本批内一并转换）

declare const THREE: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** MeshInstancingBatch。 */
export class MeshInstancingBatch {
  maxInstances: number;
  target?: any;
  instancedMesh?: any;
  private _castShadow: boolean;
  private _receiveShadow: boolean;
  private _clippingPlanes: any[];
  private _renderOrder: number;

  get castShadow(): boolean {
    return this._castShadow;
  }
  set castShadow(v: boolean) {
    this._castShadow = v;
    if (this.instancedMesh) this.instancedMesh.castShadow = v;
  }
  get receiveShadow(): boolean {
    return this._receiveShadow;
  }
  set receiveShadow(v: boolean) {
    this._receiveShadow = v;
    if (this.instancedMesh) this.instancedMesh.receiveShadow = v;
  }
  get clippingPlanes(): any[] {
    return this._clippingPlanes;
  }
  set clippingPlanes(v: any[]) {
    this._clippingPlanes = v;
    if (this.instancedMesh) this.instancedMesh.material.clippingPlanes = v;
  }
  get renderOrder(): number {
    return this._renderOrder;
  }
  set renderOrder(v: number) {
    this._renderOrder = v;
    if (this.instancedMesh) this.instancedMesh.renderOrder = v;
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
      if (this.instancedMesh) root.add(this.instancedMesh);
    }
  }

  /** 更新实例集；空数组销毁 InstancedMesh，首次非空按首 mesh 几何/材质创建。 */
  setMeshes(meshes: any[]): void {
    if (meshes.length > this.maxInstances) {
      throw new RangeError("Meshes array exceeds max number of instances");
    }
    if (meshes.length) {
      const hasPalette = !!meshes[0].material.palette;
      if (!this.instancedMesh) {
        this.instancedMesh = new InstancedMesh(
          meshes[0].geometry,
          meshes[0].material,
          this.maxInstances,
          true,
        );
        this.instancedMesh.castShadow = this._castShadow;
        this.instancedMesh.renderOrder = this._renderOrder;
        this.instancedMesh.material.clippingPlanes = this._clippingPlanes;
        if (hasPalette) {
          this.instancedMesh.geometry.addAttribute(
            "instancePaletteOffset",
            new THREE.InstancedBufferAttribute(new Float32Array(this.maxInstances), 1),
          );
          this.instancedMesh.geometry.addAttribute(
            "instanceExtraLight",
            new THREE.InstancedBufferAttribute(new Float32Array(3 * this.maxInstances), 3),
          );
          this.instancedMesh.geometry.addAttribute(
            "instanceLightDir",
            new THREE.InstancedBufferAttribute(new Float32Array(3 * this.maxInstances), 3),
          );
        }
        this.target?.add(this.instancedMesh);
      }
      this.instancedMesh.updateFromMeshes(meshes);
    } else if (this.instancedMesh) {
      this.target?.remove(this.instancedMesh);
      this.instancedMesh.dispose();
      this.instancedMesh = undefined;
    }
  }

  update(): void {}

  dispose(): void {
    this.instancedMesh?.dispose();
  }
}
