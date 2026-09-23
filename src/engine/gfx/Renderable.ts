/**
 * Renderable — 可渲染对象接口占位模块（孪生无运行时导出）。
 *
 * 由 engine/gfx/Renderable.ts.js 重写为 TS（行为完全一致：空 execute，
 * 无 setter、无导出）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

export {};
