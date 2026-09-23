/**
 * MainMenuRoute — 主菜单路由载荷：screenType + params。
 *
 * 与根级 RootRoute 同构：rest + 解构仅取前两参。
 *
 * 由 gui/screen/mainMenu/MainMenuRoute.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import type { ScreenType } from "gui/screen/mainMenu/ScreenType"; // 孪生（本组内一并转换；仅类型）

export class MainMenuRoute {
  /** 目标主菜单屏幕类型。 */
  screenType: ScreenType;
  /** 屏幕参数。 */
  params: any;

  /** 孪生 ctor(...args)：仅解构前两参。 */
  constructor(...args: any[]) {
    const [screenType, params] = args;
    this.screenType = screenType;
    this.params = params;
  }
}
