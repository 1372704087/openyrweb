/**
 * bresenham — Bresenham 直线算法（两格间逐步走线）。
 *
 * 由 util/bresenham.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/**
 * 从 (x0,y0) 到 (x1,y1) 逐格走线。
 * @param visit 可选回调（默认收集到数组返回）
 * @returns 走过的格子列表 [{x, y}, ...]
 */
export function bresenham(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  visit?: (x: number, y: number) => void,
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const emit = visit ?? ((x: number, y: number) => { points.push({ x, y }); });
  const dx = x1 - x0;
  const dy = y1 - y0;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  let error = 0;
  const stepX = dx > 0 ? 1 : -1;
  const stepY = dy > 0 ? 1 : -1;
  if (absDy < absDx) {
    for (let x = x0, y = y0; stepX < 0 ? x >= x1 : x <= x1; x += stepX) {
      emit(x, y);
      error += absDy;
      if ((error << 1) >= absDx) { y += stepY; error -= absDx; }
    }
  } else {
    for (let y = y0, x = x0; stepY < 0 ? y >= y1 : y <= y1; y += stepY) {
      emit(x, y);
      error += absDx;
      if ((error << 1) >= absDy) { x += stepX; error -= absDy; }
    }
  }
  return points;
}
