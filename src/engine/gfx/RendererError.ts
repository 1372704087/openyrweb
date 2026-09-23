/**
 * RendererError — WebGL/渲染器初始化失败时抛出的错误类型。
 *
 * 由 engine/gfx/RendererError.ts.js 重写为 TS（行为完全一致：
 * class extends Error，无额外字段/方法）。两个文件并存期间，本文件
 * 才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/** 渲染器相关错误（message/cause 由 Error 基类处理）。 */
export class RendererError extends Error {}
