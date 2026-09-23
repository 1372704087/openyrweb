/**
 * CanvasMetrics — 画布在页面中的位置与尺寸缓存。
 *
 * 记录 canvas 的 offsetLeft/Top 与 width/height，供指针坐标换算；
 * init 时挂 resize 监听，notifyViewportChange 手动刷新，dispose 解绑。
 *
 * 由 gui/CanvasMetrics.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { getOffset } from "util/dom"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 画布几何缓存。 */
export class CanvasMetrics {
  /** 目标画布。 */
  canvas: any;
  /** 所属 window。 */
  window: any;
  /** 画布左侧偏移。 */
  x = 0;
  /** 画布顶侧偏移。 */
  y = 0;
  /** 画布位图宽。 */
  width = 0;
  /** 画布位图高。 */
  height = 0;
  /** 一次性回调集合（resize 解绑等）。 */
  disposables: CompositeDisposable;
  /** 从 DOM 读取 offset/size 并写入字段。 */
  updateCanvasBoxMetrics: () => void;

  /**
   * @param canvas - 目标画布
   * @param win - 宿主 window
   */
  constructor(canvas: any, win: any) {
    this.canvas = canvas;
    this.window = win;
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.disposables = new CompositeDisposable();
    this.updateCanvasBoxMetrics = () => {
      const box = getOffset(this.canvas);
      this.x = box.left;
      this.y = box.top;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
    };
  }

  /** 首次采样并监听 window.resize。 */
  init(): void {
    this.updateCanvasBoxMetrics();
    this.window.addEventListener("resize", this.updateCanvasBoxMetrics);
    this.disposables.add(() => this.window.removeEventListener("resize", this.updateCanvasBoxMetrics));
  }

  /** 视口变化后手动刷新。 */
  notifyViewportChange(): void {
    this.updateCanvasBoxMetrics();
  }

  /** 解绑 resize 监听。 */
  dispose(): void {
    this.disposables.dispose();
  }
}
