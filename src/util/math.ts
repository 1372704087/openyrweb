/**
 * 通用数学工具函数。
 *
 * 由 util/math.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，本文件
 * 才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/** 返回 [min, max] 闭区间内的随机整数（基于 Math.random，非模拟用随机源）。 */
export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max + 1 - min)) + min;
}

/** 将 value 限制在 [min, max] 区间内。 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(value, min));
}

/** 判断 value 是否位于闭区间 [min, max] 内。 */
export function isBetween(value: number, min: number, max: number): boolean {
  return min <= value && value <= max;
}

/** 线性插值：t=0 返回 a，t=1 返回 b。 */
export function lerp(a: number, b: number, t: number): number {
  return (1 - t) * a + t * b;
}

/** 向零截断到指定小数位（正数向下取、负数向上取）。 */
export function truncToDecimals(value: number, decimals: number): number {
  if (!value) return value;
  const factor = 10 ** decimals;
  return value >= 0 ? Math.floor(value * factor) / factor : Math.ceil(value * factor) / factor;
}

/** 四舍五入到指定小数位。 */
export function roundToDecimals(value: number, decimals: number): number {
  if (!value) return value;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** 以 step 为步长向下取整（结果保持 step 的整数倍）。 */
export function floorTo(value: number, step: number): number {
  return Math.floor(value / step) * step;
}

/** FNV-1a 变体 32 位散列（对字节数组逐字节异乘）。 */
export function fnv32a(data: ArrayLike<number>): number {
  let hash = 2166136261;
  for (let i = 0, length = data.length; i < length; ++i) {
    hash ^= data[i];
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}
