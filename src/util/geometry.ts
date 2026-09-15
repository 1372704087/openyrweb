/**
 * 几何判定工具（点/矩形/圆的相交、包含、距离）。
 *
 * 由 util/geometry.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { isBetween } from "util/math";

/** 两点相等（均 undefined 也视为相等）。 */
export function pointEquals(a: any, b: any): boolean {
  return (a && b && a.x === b.x && a.y === b.y) || (!a && !b);
}

/** 两矩形是否相交。 */
export function rectIntersect(a: any, b: any): boolean {
  return a.x <= b.x + b.width && b.x <= a.x + a.width && a.y <= b.y + b.height && b.y <= a.y + a.height;
}

/** 两矩形完全相同。 */
export function rectEquals(a: any, b: any): boolean {
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}

/** 两圆是否相交（外切/内切均算）。 */
export function circleIntersect(a: any, b: any): boolean {
  const ac = a.center;
  const bc = b.center;
  return isBetween(
    (ac.x - bc.x) * (ac.x - bc.x) + (ac.y - bc.y) * (ac.y - bc.y),
    (a.radius - b.radius) * (a.radius - b.radius),
    (a.radius + b.radius) * (a.radius + b.radius),
  );
}

/** 圆是否包含点。 */
export function circleContainsPoint(circle: any, point: any): boolean {
  const c = circle.center;
  return (c.x - point.x) * (c.x - point.x) + (c.y - point.y) * (c.y - point.y) <= circle.radius * circle.radius;
}

/** 矩形是否包含点。 */
export function rectContainsPoint(rect: any, point: any): boolean {
  const box = new (globalThis as any).THREE.Box2(
    new (globalThis as any).THREE.Vector2(rect.x, rect.y),
    new (globalThis as any).THREE.Vector2(rect.x + rect.width, rect.y + rect.height),
  );
  return box.containsPoint(new (globalThis as any).THREE.Vector2(point.x, point.y));
}

/** 矩形是否完全包含另一个矩形。 */
export function rectContainsRect(outer: any, inner: any): boolean {
  const box = new (globalThis as any).THREE.Box2(
    new (globalThis as any).THREE.Vector2(outer.x, outer.y),
    new (globalThis as any).THREE.Vector2(outer.x + outer.width, outer.y + outer.height),
  );
  const innerBox = new (globalThis as any).THREE.Box2(
    new (globalThis as any).THREE.Vector2(inner.x, inner.y),
    new (globalThis as any).THREE.Vector2(inner.x + inner.width, inner.y + inner.height),
  );
  return box.containsBox(innerBox);
}

/** 将点钳制到矩形内（越界时返回最近的边界点）。 */
export function rectClampPoint(rect: any, point: any): any {
  const box = new (globalThis as any).THREE.Box2(
    new (globalThis as any).THREE.Vector2(rect.x, rect.y),
    new (globalThis as any).THREE.Vector2(rect.x + rect.width, rect.y + rect.height),
  );
  return box.clampPoint(new (globalThis as any).THREE.Vector2(point.x, point.y), new (globalThis as any).THREE.Vector2());
}

/** 八方向距离（Octile distance）：可对角移动网格的启发式距离。 */
export function octileDistance(a: any, b: any): number {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy);
}
