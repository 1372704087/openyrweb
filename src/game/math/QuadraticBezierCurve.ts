/**
 * QuadraticBezierCurve — 二次贝塞尔曲线（THREE 包装，补齐默认参数）。
 *
 * 构造与 getPoint 均允许省略控制点/目标向量，缺省时用新的 Vector2，
 * 便于游戏逻辑零参调用。由 game/math/QuadraticBezierCurve.ts.js 重写为
 * TS（行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Vector2 } from "game/math/Vector2"; // 已转换

// ambient THREE 中未声明 QuadraticBezierCurve，经 any 继承运行时类。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class QuadraticBezierCurve extends (THREE as any).QuadraticBezierCurve {
  /** 缺省控制点/目标均为原点 Vector2。 */
  constructor(v0?: THREE.Vector2, v1?: THREE.Vector2, v2?: THREE.Vector2) {
    super(v0 || new Vector2(), v1 || new Vector2(), v2 || new Vector2());
  }

  /** 取参数 t 处的点；target 省略时分配新的 Vector2。 */
  getPoint(t: number, target?: THREE.Vector2): THREE.Vector2 {
    return super.getPoint(t, target || new Vector2());
  }
}
