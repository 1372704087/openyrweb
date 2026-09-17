/**
 * FacingUtil — 朝向工具（tick 旋转/地图坐标↔角度/炮塔指向）。
 *
 * 由 game/gameobject/unit/FacingUtil.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { Vector2 } from "game/math/Vector2"; // 已转换
import * as geometryModule from "game/math/geometry"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class FacingUtil {
  /** 朝向 tick：按最大速率向目标角度逼近（取最短弧方向）。 */
  static tick(facing: number, desired: number, maxRate: number): { facing: number; delta: number } {
    if (facing === desired) return { facing, delta: 0 };
    const cw = (facing - desired + 360) % 360;
    const ccw = (desired - facing + 360) % 360;
    if (Math.min(cw, ccw) < maxRate) return { facing: desired, delta: 0 };
    const delta = (ccw <= cw ? 1 : -1) * maxRate;
    return { facing: (facing + delta + 360) % 360, delta };
  }

  /** 地图坐标向量 → 朝向角度（度）。 */
  static fromMapCoords(vec: any): number {
    return (-geometryModule.angleDegFromVec2(vec) - 90 + 720) % 360;
  }

  /** 朝向角度 → 地图坐标方向的单位向量。 */
  static toMapCoords(facing: number): any {
    return geometryModule.rotateVec2(new Vector2(1000, 0), FacingUtil.toWorldDeg(facing)).round().normalize();
  }

  /** 朝向角度 → 世界角度（取负偏移 90°）。 */
  static toWorldDeg(facing: number): number {
    return -(facing + 90);
  }

  /** 炮塔指向目标（有 currentTarget 或 destinationLeptons 时更新 desiredFacing）。 */
  static pointTurretToTarget(unit: any, destinationLeptons?: any): void {
    if (unit.turretTrait) {
      let targetPos;
      if (unit.attackTrait?.currentTarget?.obj) {
        targetPos = unit.attackTrait.currentTarget.obj.position.getMapPosition();
      } else if (destinationLeptons) {
        targetPos = destinationLeptons;
      }
      if (targetPos) {
        const unitPos = unit.position.getMapPosition();
        const dir = targetPos.clone().sub(unitPos);
        if (dir.length()) unit.turretTrait.desiredFacing = FacingUtil.fromMapCoords(dir);
      }
    }
  }
}
