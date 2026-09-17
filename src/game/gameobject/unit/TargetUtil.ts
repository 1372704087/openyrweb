/**
 * TargetUtil — 拦截点/转弯圆计算（武器瞄准辅助）。
 *
 * 由 game/gameobject/unit/TargetUtil.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { Vector3 } from "game/math/Vector3"; // 已转换
import * as geometryModule from "game/math/geometry"; // 未转换（any-shim）
import { GameMath } from "game/math/GameMath"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TargetUtil {
  /**
   * 计算拦截点：追击者以速度 speed 从 targetPos 沿 targetDir 移动，
   * 求最快相交的位置（二次方程解，无解时返回原点）。
   */
  static computeInterceptPoint(targetPos: Vector3, speed: number, shooterPos: Vector3, targetDir: Vector3): Vector3 {
    const relative = targetPos.clone().sub(shooterPos);
    const dirLength = targetDir.length();
    const b = speed * speed - dirLength * dirLength;
    const c = 2 * relative.dot(targetDir);
    const a = -relative.dot(relative);
    if (c * c - 4 * b * a < 0) return new Vector3();
    const t = (-c + GameMath.sqrt(c * c - 4 * b * a)) / (2 * b);
    return targetDir.clone().multiplyScalar(t).add(shooterPos);
  }

  /**
   * 转弯圆：以 pos 为圆心基准，将 dir 旋转 ±90° 后按 radius = turnRadius/degToRad(|turnRate|) 拉长。
   * 形参序与基线一致：(pos, dir, turnRate, turnRadius)。
   */
  static computeTurnCircle(pos: Vector3, dir: Vector3, turnRate: number, turnRadius: number): { center: Vector3; radius: number } {
    const radius = turnRadius / geometryModule.degToRad(Math.abs(turnRate));
    const center = geometryModule.rotateVec2(dir.clone(), 90 * -Math.sign(turnRate));
    return { center: isFinite(radius) ? center.setLength(radius).add(pos) : pos.clone(), radius };
  }
}
