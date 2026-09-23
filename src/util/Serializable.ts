/**
 * Serializable — 空占位模块。
 *
 * 由 util/Serializable.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 孪生 SystemJS 模块无任何导出（仅注册空 execute）；此处保持一致：
 * 只保留可被解析的模块体，不导出符号，以维持路径可解析且不引入运行时差异。
 */
export {};
