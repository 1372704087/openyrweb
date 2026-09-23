/**
 * MainMenuScreen — 主菜单子屏幕基类。
 *
 * setController 挂控制器；backgroundImageName 固定返回 mnscrnl.shp。
 *
 * 由 gui/screen/mainMenu/MainMenuScreen.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export class MainMenuScreen {
  /** 所属主菜单控制器。 */
  controller: any;
  /** 屏幕标题（子类构造时按需赋值）。 */
  title?: string;

  /** 由控制器注册。 */
  setController(controller: any): void {
    this.controller = controller;
  }

  /** 侧栏背景图（固定）。 */
  get backgroundImageName(): string {
    return "mnscrnl.shp";
  }
}
