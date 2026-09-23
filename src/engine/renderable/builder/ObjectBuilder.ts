/**
 * ObjectBuilder — 对象构建器占位模块（type-only 空模块）。
 *
 * 由 engine/renderable/builder/ObjectBuilder.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 *
 * 孪生无运行时导出（setters 为空、execute 为空），仅作为类型/占位模块存在。
 */
export {};
