/**
 * Screen — 屏幕基类（type-only 空执行模块）。
 *
 * 孪生 execute 为空，运行时不导出任何值；原 TS 应为抽象/接口约定，
 * 由 RootController / Controller 以鸭子类型调用（setController / onEnter /
 * onLeave / onStack / onUnstack / onViewportChange 等）。
 *
 * 由 gui/screen/Screen.ts.js 重写为 TS（行为完全一致：空导出）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export {};
