/**
 * LineCurve — 带默认端点的二维线段曲线。
 *
 * 构造与 getPoint 在省略目标向量时回退为 `new Vector2()`，避免 THREE
 * 基类对 undefined 的依赖。
 *
 * 由 game/math/LineCurve.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Vector2 } from "game/math/Vector2"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
const BaseLineCurve: any = (THREE as any).LineCurve;

export class LineCurve extends BaseLineCurve {
  /** 端点缺省为原点 Vector2，与孪生 `e || new Vector2()` 一致。 */
  constructor(e?: Vector2, t?: Vector2) {
    super(e || new Vector2(), t || new Vector2());
  }

  /** 取 t∈[0,1] 处的点；target 缺省时新建 Vector2。 */
  getPoint(e: number, t?: Vector2): Vector2 {
    return super.getPoint(e, t || new Vector2());
  }
}
