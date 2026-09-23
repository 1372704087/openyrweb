/**
 * ReplayExistsError — 回放名冲突错误。
 *
 * 由 gui/replay/ReplayExistsError.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/** 回放已存在。 */
export class ReplayExistsError extends Error {}
