/**
 * ChatApi — 聊天 API 占位（空运行时模块）。
 *
 * 由 game/api/ChatApi.ts.js 重写为 TS。孪生 SystemJS 注册后 execute
 * 为空（无依赖、无导出），编译后同样不产生运行时代码；本文件仅保留
 * 空模块导出，与孪生运行时导出面对齐。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export {};
