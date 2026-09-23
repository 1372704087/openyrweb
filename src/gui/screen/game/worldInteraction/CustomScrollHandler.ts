/**
 * CustomScrollHandler — 可暂停的强制滚屏包装。
 *
 * 由 gui/screen/game/worldInteraction/CustomScrollHandler.ts.js
 * 重写为 TS（行为完全一致）。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 自定义滚屏请求器。 */
export class CustomScrollHandler {
  /** 底层地图滚屏处理器。 */
  mapScrollHandler: any;
  /** 是否暂停（暂停时 requestScroll 忽略）。 */
  isPaused = false;

  /**
   * @param mapScrollHandler 地图滚屏
   */
  constructor(mapScrollHandler: any) {
    this.mapScrollHandler = mapScrollHandler;
    this.isPaused = false;
  }

  /**
   * 请求强制滚动（未暂停时）。
   * @param dir 方向向量
   */
  requestScroll(dir: any): void {
    if (!this.isPaused) this.mapScrollHandler.requestForceScroll(dir);
  }

  /** 取消强制滚动（不受 pause 影响）。 */
  cancel(): void {
    this.mapScrollHandler.cancelForceScroll();
  }

  /** 暂停接受滚动请求。 */
  pause(): void {
    this.isPaused = true;
  }

  /** 恢复接受滚动请求。 */
  unpause(): void {
    this.isPaused = false;
  }
}
