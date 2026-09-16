/**
 * TurretTrait — 炮塔旋转 trait（独立于车身的炮塔朝向）。
 *
 * turretSpins=yes 的单位（如幻影坦克）炮塔持续自转（每 tick −12°）；
 * 其余单位炮塔按 rules.rot 逐 tick 向 desiredFacing 逼近。
 * 由 game/gameobject/trait/TurretTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as FacingUtilModule from "game/gameobject/unit/FacingUtil"; // 未转换（any-shim）
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as NotifySpawnModule from "game/gameobject/trait/interface/NotifySpawn"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TurretTrait {
  facing = 0;
  desiredFacing = 0;
  spinAngle = 0;

  isRotating(): boolean {
    return this.facing !== this.desiredFacing;
  }

  [NotifySpawnModule.NotifySpawn.onSpawn](object: any): void {
    if (object.isUnit()) {
      this.facing = this.desiredFacing = object.direction;
      this.spinAngle = object.direction;
    }
  }

  [NotifyTickModule.NotifyTick.onTick](object: any): void {
    if (object.rules.turretSpins) {
      // 自转炮塔：每 tick 逆时针转 12°，朝向同步。
      this.spinAngle = (this.spinAngle - 12 + 360) % 360;
      this.facing = this.spinAngle;
      this.desiredFacing = this.facing;
    } else if (this.desiredFacing !== this.facing) {
      const rot = object.rules.rot;
      this.facing = FacingUtilModule.FacingUtil.tick(this.facing, this.desiredFacing, rot || Number.POSITIVE_INFINITY).facing;
    }
  }
}
