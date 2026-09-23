/**
 * FullScreen — 全屏开关与快捷键（默认 Alt+…F）。
 *
 * init 注册 keydown 快捷键与 fullscreenchange 监听；
 * toggle → toggleAsync（requestFullscreen / exitFullscreen）；
 * isFullScreen / isAvailable 读 document 状态；dispose 解绑。
 *
 * 由 gui/FullScreen.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import * as FullScreenUtilModule from "util/fullScreen"; // 已转换
import { EventDispatcher } from "util/event"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

const setupFullScreenChangeListener: any = (FullScreenUtilModule as any).setupFullScreenChangeListener;

/** 全屏管理器。 */
export class FullScreen {
  /** 全屏快捷键（静态，可被调用方改写）。 */
  static hotKey = {
    altKey: true,
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    keyCode: "F".charCodeAt(0),
  };

  /** 宿主 document。 */
  document: any;
  /** 一次性回调集合。 */
  disposables: CompositeDisposable;
  /** 全屏状态变化派发器。 */
  private _onChange = new EventDispatcher();
  /** fullscreenchange 处理器（ctor 赋值）。 */
  handleFullScreenChange: (ev: any) => void;

  /**
   * 事件是否命中当前全屏快捷键。
   * @param ev - 键盘事件
   */
  static isFullScreenHotKey(ev: any): boolean {
    return (
      ev.keyCode === this.hotKey.keyCode &&
      ev.altKey === this.hotKey.altKey &&
      ev.shiftKey === this.hotKey.shiftKey &&
      ev.ctrlKey === this.hotKey.ctrlKey &&
      ev.metaKey === this.hotKey.metaKey
    );
  }

  /** 全屏状态变化事件。 */
  get onChange() {
    return this._onChange.asEvent();
  }

  /**
   * @param document - 宿主 document
   */
  constructor(document: any) {
    this.document = document;
    this.disposables = new CompositeDisposable();
    this._onChange = new EventDispatcher();
    this.handleFullScreenChange = (ev: any) => {
      this._onChange.dispatch(this, ev);
    };
  }

  /** 注册快捷键与 fullscreenchange 监听。 */
  init(): void {
    const onKey = (ev: any) => {
      if (FullScreen.isFullScreenHotKey(ev)) {
        ev.preventDefault();
        ev.stopPropagation();
        this.toggle();
      }
    };
    this.document.addEventListener("keydown", onKey);
    this.disposables.add(() => this.document.removeEventListener("keydown", onKey));
    const removeChange = setupFullScreenChangeListener(this.document, this.handleFullScreenChange);
    if (removeChange) this.disposables.add(removeChange);
  }

  /** 切换全屏（失败仅 console.error）。 */
  toggle(): void {
    this.toggleAsync().catch((e) => console.error(e));
  }

  /** 当前是否处于全屏。 */
  isFullScreen(): boolean {
    return !!this.document.fullscreenElement;
  }

  /** 浏览器是否支持全屏。 */
  isAvailable(): boolean {
    return this.document.fullscreenEnabled || this.document.webkitFullscreenEnabled;
  }

  /** 请求/退出全屏。 */
  async toggleAsync(): Promise<void> {
    if (this.document.fullscreenElement) {
      await this.document.exitFullscreen();
    } else {
      await this.document.documentElement.requestFullscreen();
    }
  }

  /** 解绑监听。 */
  dispose(): void {
    this.disposables.dispose();
  }
}
