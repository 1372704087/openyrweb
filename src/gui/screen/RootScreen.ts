/**
 * RootScreen — 根屏幕基类。
 *
 * 持有 controller 引用与 preventUnload 标志；setController 供 Controller
 * 挂载/解绑。孪生 preventUnload 默认 false。
 *
 * 由 gui/screen/RootScreen.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export class RootScreen {
  /** 是否阻止 window unload（默认 false）。 */
  preventUnload = false;
  /** 所属根控制器（由 setController 注入）。 */
  controller: any;

  /** 由 Controller 调用，挂载或清空引用。 */
  setController(controller: any): void {
    this.controller = controller;
  }
}
