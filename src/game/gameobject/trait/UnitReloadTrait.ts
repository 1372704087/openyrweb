/**
 * UnitReloadTrait — 建筑内停靠单位的弹药装填 trait。
 *
 * 挂在有 DockTrait 的建筑上（如修理厂/停机坪），按 ReloadRate 间隔
 * 为停靠的、需要手动装填（ManualReload=yes）且弹药未满的单位加 1 发。
 * 弹药为 0 的单位优先（只补第一发的应急补给）。
 *
 * 由 game/gameobject/trait/UnitReloadTrait.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包
 * 时优先采用 .ts 模块的编译产物。
 */
import { GameSpeed } from "game/GameSpeed";
import { ZoneType } from "game/gameobject/unit/ZoneType";
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class UnitReloadTrait {
  cooldownTicks: number;

  [NotifyTickModule.NotifyTick.onTick](building: any, world: any): void {
    if (
      building.dockTrait &&
      building.dockTrait.hasDockedUnits() &&
      !building.dockTrait.getDockedUnits().every((unit: any) => !this.canReloadUnit(unit))
    ) {
      if (this.cooldownTicks === undefined) {
        this.cooldownTicks = GameSpeed.BASE_TICKS_PER_SECOND * world.rules.general.repair.reloadRate * 60;
      }
      if (this.cooldownTicks <= 0) {
        this.cooldownTicks = GameSpeed.BASE_TICKS_PER_SECOND * world.rules.general.repair.reloadRate * 60;
        const docked = building.dockTrait.getDockedUnits();
        for (const unit of docked[0].ammo === 0 ? docked.slice(0, 1) : docked) {
          if (this.canReloadUnit(unit)) unit.ammoTrait.ammo++;
        }
      } else {
        this.cooldownTicks--;
      }
    }
  }

  canReloadUnit(unit: any): boolean {
    return !(!unit.ammoTrait || !unit.rules.manualReload || unit.ammoTrait.isFull() || unit.zone === ZoneType.Air);
  }
}
