/**
 * array — 数组查找/比较小工具。
 *
 * findReverse / findIndexReverse 从尾部向前遍历；equals 做严格逐项相等。
 * 由 util/array.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，本文件
 * 才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/** 从尾部向前找到第一个满足谓词的元素；无命中返回 undefined。 */
export function findReverse<T>(
  arr: T[],
  predicate: (value: T, index: number, array: T[]) => unknown,
): T | undefined {
  for (let i = arr.length - 1; 0 <= i; i--) if (predicate(arr[i], i, arr)) return arr[i];
}

/** 从尾部向前找到第一个满足谓词的下标；无命中返回 -1。 */
export function findIndexReverse<T>(
  arr: T[],
  predicate: (value: T, index: number, array: T[]) => unknown,
): number {
  for (let i = arr.length - 1; 0 <= i; i--) if (predicate(arr[i], i, arr)) return i;
  return -1;
}

/** 两数组长度与每项严格相等（===）判定。 */
export function equals(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0, len = a.length; i < len; i++) if (a[i] !== b[i]) return false;
  return true;
}
