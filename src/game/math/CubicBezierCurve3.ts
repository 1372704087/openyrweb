/**
 * CubicBezierCurve3 — 锁步友好的三次贝塞尔曲线包装。
 *
 * 由 game/math/CubicBezierCurve3.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 *
 * 构造缺省控制点为零向量；getPoint 的 target 缺省时每次新建 Vector3
 * （与孪生 super.getPoint(t, target || new Vector3()) 一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Vector3 } from "game/math/Vector3"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
/** three-global 未声明 CubicBezierCurve3，取运行时全局基类作 any。 */
const THREECubicBezierCurve3: any = (THREE as any).CubicBezierCurve3;

/**
 * 继承全局 THREE.CubicBezierCurve3（vendor three.min.js）。
 * 基类在求值时由 index.html 已加载的 vendor 提供。
 */
export class CubicBezierCurve3 extends THREECubicBezierCurve3 {
  constructor(v0?: Vector3, v1?: Vector3, v2?: Vector3, v3?: Vector3) {
    // || 短路：传入 undefined/null 时回退零向量
    super(v0 || new Vector3(), v1 || new Vector3(), v2 || new Vector3(), v3 || new Vector3());
  }

  /** 采样 t 处点；target 省略则分配新的 game/math Vector3。 */
  getPoint(t: number, target?: Vector3): Vector3 {
    return super.getPoint(t, target || new Vector3());
  }
}
