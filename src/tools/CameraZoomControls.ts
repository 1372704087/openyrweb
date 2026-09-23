/**
 * tools/CameraZoomControls — 画布滚轮缩放控制器。
 *
 * 监听 canvas 的 wheel：wheelDeltaY>0 时 applyStep(-0.1)（向上收），
 * 否则 applyStep(0.1)（向下放）。init 挂载、destroy 解绑同一 handler。
 *
 * 由 tools/CameraZoomControls.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/** 可注入的指针事件总线（鸭子类型）。 */
export interface PointerEventsLike {
  addEventListener(target: string, type: string, handler: (ev: any) => void): void;
  removeEventListener(target: string, type: string, handler: (ev: any) => void): void;
}

/** 可注入的相机缩放器（鸭子类型）。 */
export interface CameraZoomLike {
  /** 按步长调整缩放（正/负方向由实现定义）。 */
  applyStep(step: number): void;
}

export class CameraZoomControls {
  /** 指针事件总线（canvas 事件挂载点）。 */
  readonly pointerEvents: PointerEventsLike;
  /** 相机缩放器。 */
  readonly cameraZoom: CameraZoomLike;
  /** 滚轮回调：wheelDeltaY>0 → -0.1，否则 +0.1。 */
  readonly handleWheel: (ev: { wheelDeltaY?: number }) => void;

  /**
   * @param pointerEvents - 指针事件总线
   * @param cameraZoom - 相机缩放器
   */
  constructor(pointerEvents: PointerEventsLike, cameraZoom: CameraZoomLike) {
    (this.pointerEvents = pointerEvents),
      (this.cameraZoom = cameraZoom),
      (this.handleWheel = (ev) => {
        this.cameraZoom.applyStep(0 < (ev.wheelDeltaY ?? 0) ? -0.1 : 0.1);
      });
  }

  /** 挂载 canvas wheel 监听。 */
  init(): void {
    this.pointerEvents.addEventListener("canvas", "wheel", this.handleWheel);
  }

  /** 解绑 canvas wheel 监听。 */
  destroy(): void {
    this.pointerEvents.removeEventListener("canvas", "wheel", this.handleWheel);
  }
}
