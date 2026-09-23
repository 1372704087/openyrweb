/**
 * GameMenuScreen — 游戏内菜单屏基类。
 *
 * 由 gui/screen/game/GameMenuScreen.ts.js 重写为 TS。
 * 仅提供 setController 写入 controller 字段；无构造初始化。
 *
 * 由 gui/screen/game/GameMenuScreen.ts.js 重写为 TS（行为完全一致）。
 */

/** 游戏内菜单屏基类。 */
export class GameMenuScreen {
  /** 控制器（延迟赋值）。 */
  controller: any;

  /**
   * 注入菜单控制器。
   * @param controller 菜单控制器实例
   */
  setController(controller: any): void {
    this.controller = controller;
  }
}
