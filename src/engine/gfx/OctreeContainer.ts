/**
 * OctreeContainer — 八叉树 RenderableContainer：相机移动时做视锥剔除，
 * 投影矩阵按 3 tile 边距放大以降低裁切误伤。
 *
 * 由 engine/gfx/OctreeContainer.ts.js 重写为 TS（行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { RenderableContainer } from "engine/gfx/RenderableContainer"; // 孪生（本批内一并转换）
import { FrustumCuller } from "engine/gfx/FrustumCuller"; // 孪生（本批内一并转换）
import { Coords } from "game/Coords"; // 已转换

declare const THREE: any;
/** 全局 Octree 构造（vendor，window 挂载）。 */
declare const Octree: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** factory 的 near/far 参数（视距范围）。 */
export interface OctreeContainerParams {
  near: number;
  far: number;
}

/** 投影边距扩大的 tile 数（孪生模块级常量 n=3）。 */
const PROJECTION_MARGIN_TILES = 3;

/** 复用的投影相机副本（computeProjectionMatrix 模块级缓存 s）。 */
let projectionCamera: any;

/** OctreeContainer。 */
export class OctreeContainer extends RenderableContainer {
  autoCull: boolean = true;
  lastCameraPosition: any = new THREE.Vector3();
  tree: any;
  frustumCuller: FrustumCuller;
  camera: any;

  /** 用 near/far 建 Box3 八叉树 + FrustumCuller + camera 包装。 */
  static factory(params: OctreeContainerParams): OctreeContainer {
    const { near, far } = params;
    const box = new THREE.Box3(
      new THREE.Vector3(2 * near, 2 * near, 2 * near),
      new THREE.Vector3(2 * far, 2 * far, 2 * far),
    );
    const tree = new Octree(box, {
      maxDepth: Math.ceil(Math.log2((2 * (far - near)) / 128)),
      splitThreshold: 10,
      joinThreshold: 5,
      skipInvisMatrixUpdate: true,
    });
    tree.name = "octree";
    const culler = new FrustumCuller();
    return new OctreeContainer(tree, culler, params as any);
  }

  constructor(tree: any, frustumCuller: FrustumCuller, camera: any) {
    super(tree);
    this.tree = tree;
    this.frustumCuller = frustumCuller;
    this.camera = camera;
  }

  update(delta?: any, time?: any): void {
    super.update(delta, time);
    if (this.autoCull) this.cullChildren();
  }

  /** 相机位置变化时重算放大投影并 cull 树。 */
  cullChildren(): void {
    if (!this.camera.position.equals(this.lastCameraPosition)) {
      this.lastCameraPosition.copy(this.camera.position);
      const proj = this.computeProjectionMatrix();
      this.camera.updateMatrixWorld(false);
      (this.camera.matrixWorldInverse as any).getInverse(this.camera.matrixWorld);
      const viewProj = new THREE.Matrix4().multiplyMatrices(proj, this.camera.matrixWorldInverse);
      const frustum = new THREE.Frustum();
      frustum.setFromMatrix(viewProj);
      this.frustumCuller.cull(this.tree, frustum);
    }
  }

  /** 克隆/复用相机并按 3 tile 扩大 frustum 后 updateProjectionMatrix。 */
  computeProjectionMatrix(): any {
    if (projectionCamera) projectionCamera.copy(this.camera);
    else projectionCamera = this.camera.clone();
    projectionCamera.top += PROJECTION_MARGIN_TILES * Coords.LEPTONS_PER_TILE * Coords.COS_ISO_CAMERA_BETA;
    projectionCamera.bottom -= PROJECTION_MARGIN_TILES * Coords.LEPTONS_PER_TILE * Coords.COS_ISO_CAMERA_BETA;
    projectionCamera.left -= PROJECTION_MARGIN_TILES * (2 * Coords.LEPTONS_PER_TILE) * Coords.COS_ISO_CAMERA_BETA;
    projectionCamera.right += PROJECTION_MARGIN_TILES * (2 * Coords.LEPTONS_PER_TILE) * Coords.COS_ISO_CAMERA_BETA;
    projectionCamera.updateProjectionMatrix();
    return projectionCamera.projectionMatrix;
  }

  /** 子项 3D 对象变更后通知树更新其包围盒。 */
  updateChild(child: any): void {
    const obj = child.get3DObject();
    if (obj && obj.parent) this.tree.updateObject(obj);
  }
}
