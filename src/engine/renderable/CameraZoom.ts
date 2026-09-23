/**
 * CameraZoom — 自由相机缩放步进（zoom 从 1 起，最小 0.1）。
 *
 * 由 engine/renderable/CameraZoom.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */

/** 持有 freeCamera 标志的最小形状（value 为真时允许缩放）。 */
export interface FreeCameraLike {
  value: boolean;
}

/**
 * 相机缩放控制器。
 * applyStep 仅在 freeCamera.value 为真时累加 zoom，并钳到 ≥0.1。
 */
export class CameraZoom {
  /** 当前缩放倍率（初始 1）。 */
  zoom: number;

  /**
   * @param freeCamera - 自由相机开关（value 为真才允许 applyStep）
   */
  constructor(private freeCamera: FreeCameraLike) {
    this.zoom = 1;
  }

  /** 读取当前 zoom。 */
  getZoom(): number {
    return this.zoom;
  }

  /**
   * 应用一步缩放增量。
   * @param e - 步进量（可正可负）
   */
  applyStep(e: number): void {
    if (this.freeCamera.value) this.zoom = Math.max(0.1, this.zoom + e);
  }
}
