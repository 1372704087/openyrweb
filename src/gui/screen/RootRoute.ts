/**
 * RootRoute — 根级路由载荷：目标屏幕类型 + 屏幕参数。
 *
 * 构造采用 rest + 解构，仅取前两参（screenType, params），多余实参丢弃，
 * 与孪生 minified 构造器一致。
 *
 * 由 gui/screen/RootRoute.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { ScreenType } from "gui/screen/ScreenType"; // 孪生（本组内一并转换）

export class RootRoute {
  /** 目标根屏幕类型。 */
  screenType: ScreenType;
  /** 传给目标屏幕的参数对象（原 JS 可为任意值）。 */
  params: any;

  /** 孪生 ctor(...args)：仅解构前两参。 */
  constructor(...args: any[]) {
    const [screenType, params] = args;
    this.screenType = screenType;
    this.params = params;
  }
}
