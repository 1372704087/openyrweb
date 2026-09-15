/**
 * typeGuard — 通用类型守卫工具。
 *
 * 由 util/typeGuard.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/** 非 null/undefined 判定（常用于 Array.filter 的类型收窄）。 */
export function isNotNullOrUndefined(value: any): boolean {
  return value != null;
}
