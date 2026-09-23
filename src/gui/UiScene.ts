/**
 * UiScene — UI 场景（正交相机 + HtmlContainer + MeshBatchManager）。
 *
 * factory 造 Scene/正交相机/HtmlContainer；create3DObject 挂批管理器；
 * update 同步矩阵并 updateMeshes；menuViewport 居中 800×600。
 *
 * 由 gui/UiScene.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { UiObject } from "gui/UiObject"; // 孪生（本批内一并转换）
import { HtmlContainer } from "gui/HtmlContainer"; // 孪生（本批内一并转换）
import { MeshBatchManager } from "engine/gfx/batch/MeshBatchManager"; // 已转换

declare const THREE: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** UI 场景。 */
export class UiScene extends UiObject {
  /**
   * 按视口创建场景。
   * @param viewport - {x,y,width,height}
   */
  static factory(viewport: any): any {
    const scene = new THREE.Scene();
    scene.matrixAutoUpdate = false;
    const camera = UiScene.createCamera(viewport);
    const html = new HtmlContainer();
    return new (this as any)(scene, camera, viewport, html);
  }

  /**
   * 按视口造翻转的正交相机（绕 x 转 π，z=-1000）。
   * @param viewport - 视口
   */
  static createCamera(viewport: any): any {
    const halfH = viewport.height / 2;
    const aspect = viewport.width / viewport.height;
    const camera = new THREE.OrthographicCamera(-halfH * aspect, halfH * aspect, halfH, -halfH, -1e3, 1e3);
    camera.rotation.x = Math.PI;
    camera.position.x = -viewport.x + viewport.width / 2;
    camera.position.y = -viewport.y + viewport.height / 2;
    camera.position.z = -1e3;
    return camera;
  }

  /** THREE.Scene。 */
  scene: any;
  /** 正交相机。 */
  camera: any;
  /** 视口矩形。 */
  viewport: any;
  /** 网格批管理器（create3DObject 创建）。 */
  meshBatchManager?: any;

  /**
   * @param scene - Scene
   * @param camera - 相机
   * @param viewport - 视口
   * @param htmlContainer - HTML 容器
   */
  constructor(scene: any, camera: any, viewport: any, htmlContainer: any) {
    super(scene, htmlContainer);
    this.scene = scene;
    this.camera = camera;
    this.viewport = viewport;
  }

  /**
   * 替换相机。
   * @param camera - 相机
   */
  setCamera(camera: any): void {
    this.camera = camera;
  }

  /**
   * 替换视口。
   * @param viewport - 视口
   */
  setViewport(viewport: any): void {
    this.viewport = viewport;
  }

  /** 首次创建 MeshBatchManager 并关掉 scene 自动更新。 */
  create3DObject(): void {
    super.create3DObject();
    if (!this.meshBatchManager) {
      const mgr = (this.meshBatchManager = new MeshBatchManager(this.getRenderableContainer()));
      this.getRenderableContainer().add(mgr);
      this.scene.autoUpdate = false;
    }
  }

  /**
   * 推帧并刷新批网格。
   * @param tick - 帧时钟
   */
  update(tick?: any): void {
    super.update(tick);
    if (this.meshBatchManager) {
      this.scene.updateMatrixWorld(false);
      this.meshBatchManager.updateMeshes();
    }
  }

  /** 视口内居中的 800×600 菜单矩形。 */
  get menuViewport(): { x: number; y: number; width: number; height: number } {
    const w = 800;
    const h = 600;
    return {
      x: Math.max(0, (this.viewport.width - w) / 2),
      y: Math.max(0, (this.viewport.height - h) / 2),
      width: w,
      height: h,
    };
  }

  /** 销毁并释放批管理器。 */
  destroy(): void {
    super.destroy();
    this.meshBatchManager?.dispose();
  }
}
