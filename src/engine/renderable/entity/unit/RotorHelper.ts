/**
 * RotorHelper — 旋翼旋转步进计算（Air 区/idleSpeed/idleRate 规则）。
 *
 * computeRotationStep 按 zone 是否空中、rules.idleRate 与传入 idleSpeed 推导
 * 每帧角度增量，并钳制到 [0, ±degToRad(speed)]。
 *
 * 由 engine/renderable/entity/unit/RotorHelper.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import { clamp } from "util/math"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 旋翼旋转辅助。 */
export class RotorHelper {
  /**
   * 计算本帧旋翼旋转步进。
   * @param gameObject - 需 zone / rules.idleRate
   * @param delta - 上帧已有角速度分量
   * @param opts - speed / idleSpeed 可选覆盖
   * @returns 钳制后的旋转步进
   */
  static computeRotationStep(gameObject: any, delta: number, opts: { speed?: number; idleSpeed?: number }): number {
    const isAir = gameObject.zone === ZoneType.Air;
    const idleRate = gameObject.rules.idleRate;
    const hasIdle = isAir || !!opts.idleSpeed || !!idleRate;
    let n = opts.speed ?? 67;
    if (!isAir) {
      if (opts.idleSpeed) n = opts.idleSpeed;
      else if (idleRate) n /= idleRate;
    }
    const sign = Math.sign(n);
    const maxAbs = Math.abs((THREE as any).Math.degToRad(n));
    const absDelta = Math.abs(delta);
    return sign * clamp(absDelta + 0.1 * (hasIdle ? 1 : (absDelta / maxAbs) * -0.5), 0, maxAbs);
  }
}
