/**
 * ArrowScrollHandler — 方向键滚屏（可暂停，组合键合成方向）。
 *
 * 由 gui/screen/game/worldInteraction/ArrowScrollHandler.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 方向键滚屏。 */
export class ArrowScrollHandler {
  /** 地图滚屏。 */
  mapScrollHandler: any;
  /** 是否暂停。 */
  isPaused = false;
  /** 当前合成方向。 */
  scrollDir = new THREE.Vector2();
  /** 当前按住的方向键。 */
  pressedKeys = new Set<string>();

  /**
   * @param mapScrollHandler 地图滚屏
   */
  constructor(mapScrollHandler: any) {
    this.mapScrollHandler = mapScrollHandler;
    this.isPaused = false;
    this.scrollDir = new THREE.Vector2();
    this.pressedKeys = new Set();
  }

  /**
   * 按下方向键：记录并请求强制滚动。
   * @param e 键盘事件
   */
  handleKeyDown(e: KeyboardEvent): void {
    if (this.isPaused) return;
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.repeat) return;
    this.pressedKeys.add(e.key);
    this.updateScrollDir();
    this.mapScrollHandler.requestForceScroll(this.scrollDir);
  }

  /**
   * 抬起方向键：移除；无方向则取消强制滚动。
   * @param e 键盘事件
   */
  handleKeyUp(e: KeyboardEvent): void {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
    e.preventDefault();
    e.stopPropagation();
    this.pressedKeys.delete(e.key);
    this.updateScrollDir();
    if (!this.scrollDir.length()) this.mapScrollHandler.cancelForceScroll();
  }

  /** 清空按键并在零方向时取消滚动。 */
  cancel(): void {
    this.pressedKeys.clear();
    this.updateScrollDir();
    if (!this.scrollDir.length()) this.mapScrollHandler.cancelForceScroll();
  }

  /** 按 pressedKeys 重算方向向量。 */
  updateScrollDir(): void {
    this.scrollDir.set(0, 0);
    for (const key of this.pressedKeys) {
      switch (key) {
        case "ArrowUp":
          --this.scrollDir.y;
          break;
        case "ArrowDown":
          this.scrollDir.y += 1;
          break;
        case "ArrowLeft":
          --this.scrollDir.x;
          break;
        case "ArrowRight":
          this.scrollDir.x += 1;
          break;
        default:
          throw new Error("Should never reach this line");
      }
    }
  }

  /** 暂停。 */
  pause(): void {
    this.isPaused = true;
  }

  /** 恢复。 */
  unpause(): void {
    this.isPaused = false;
  }
}
