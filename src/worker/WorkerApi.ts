/**
 * worker/WorkerApi — 空占位模块（孪生 execute 为空、无导出）。
 *
 * 历史 SystemJS 模块骨架，仅保留模块 id 注册语义；
 * 译为 TS 后以 `export {}` 维持模块地位（与孪生「无导出」等价：
 * 命名空间 Object.keys 为空，类型侧可 import * as 后仅得空对象）。
 *
 * 由 worker/WorkerApi.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export {};
