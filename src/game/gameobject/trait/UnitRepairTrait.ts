/**
 * UnitRepairTrait — 修理厂/停机坪的载具修理 trait。
 *
 * 每 tick 检查码头内的单位：
 *  - 空中单位 / 断电 → 修理暂停（Idle）；
 *  - 满血友军单位 → 出坞走向集结点 + 派发 RepairFinish；
 *  - 受损友军单位 → tickRepair 按费用/步长修复，首次修复派发
 *    UnitRepairStartEvent，状态切 Repairing。
 *
 * 修理费用：repairPercent>0 时按 purchaseValue 比例计算（从玩家扣费），
 * 否则按 repairStep 固定值。实际修复量不超过最大血量缺口。
 *
 * 由 game/gameobject/trait/UnitRepairTrait.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包
 * 时优先采用 .ts 模块的编译产物。
 */
import * as UnitRepairFinishEventModule from "game/event/UnitRepairFinishEvent"; // 未转换（any-shim）
import * as UnitRepairStartEventModule from "game/event/UnitRepairStartEvent"; // 未转换（any-shim）
import { GameSpeed } from "game/GameSpeed"; // 已转换
import { Vector2 } from "game/math/Vector2"; // 已转换
import * as MoveTaskModule from "game/gameobject/task/move/MoveTask"; // 未转换（any-shim）
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import * as NotifySpawnModule from "game/gameobject/trait/interface/NotifySpawn"; // 已转换
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换

/** 修理状态。 */
export enum RepairStatus {
  Idle = 0,
  Repairing = 1,
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export class UnitRepairTrait {
  status: RepairStatus = RepairStatus.Idle;
  cooldownTicks = 0;
  lastRepairTickSuccessful = false;

  [NotifySpawnModule.NotifySpawn.onSpawn](object: any, world: any): void {
    this.resetRallyPoint(object, world);
  }

  /** 非工厂建筑（无 factoryTrait）设缺省集结点（占位正下方）。 */
  resetRallyPoint(object: any, world: any): void {
    if (!object.factoryTrait) {
      const rally = this.computeDefaultRallyPoint(object, world.map);
      object.rallyTrait.changeRallyPoint(rally, object, world);
    }
  }

  [NotifyTickModule.NotifyTick.onTick](building: any, world: any): void {
    // 无码头 / 断电 / 有空中单位停靠 → 暂停。
    if (building.dockTrait && (!building.rules.needsEngineer || !building.owner.isNeutral)) {
      if (
        !building.dockTrait.hasDockedUnits() ||
        building.dockTrait.getDockedUnits().some((unit: any) => unit.zone === ZoneType.Air) ||
        (building.poweredTrait && !building.poweredTrait.isPoweredOn())
      ) {
        this.status = RepairStatus.Idle;
      } else if (this.cooldownTicks <= 0) {
        // 冷却到期：按 ReloadRate 或 URepairRate 计算 tick 间隔。
        let rate = world.rules.general.repair;
        rate = building.rules.unitReload ? rate.reloadRate : rate.uRepairRate;
        this.cooldownTicks += GameSpeed.BASE_TICKS_PER_SECOND * rate * 60;
        let anyRepaired = false;
        for (const unit of building.dockTrait.getDockedUnits()) {
          if (unit.zone === ZoneType.Air) continue;
          if (unit.healthTrait.health < 100 && world.areFriendly(unit, building)) {
            if (this.tickRepair(unit, world, building) && !anyRepaired) anyRepaired = true;
            if (anyRepaired && (this.status === RepairStatus.Idle || !this.lastRepairTickSuccessful)) {
              if (!building.helipadTrait) world.events.dispatch(new UnitRepairStartEventModule.UnitRepairStartEvent(unit));
            }
          } else {
            // 满血单位：出坞走向集结点。
            const rallyNode = building.rallyTrait.findRallyNodeForUnit(unit, world.map);
            if (rallyNode) {
              building.dockTrait.undockUnit(unit);
              unit.unitOrderTrait.addTask(
                new MoveTaskModule.MoveTask(world, rallyNode.tile, !!rallyNode.onBridge, {
                  closeEnoughTiles: world.rules.general.closeEnough,
                }),
              );
            }
            if (!building.helipadTrait) world.events.dispatch(new UnitRepairFinishEventModule.UnitRepairFinishEvent(unit, building));
          }
        }
        this.lastRepairTickSuccessful = anyRepaired;
        this.status = anyRepaired ? RepairStatus.Repairing : RepairStatus.Idle;
      } else {
        this.cooldownTicks--;
      }
    }
  }

  /**
   * 单 tick 修复：repairPercent>0 时按买断价比例扣费并修复，
   * 否则按 repairStep 固定修复量。修复量不超过血量缺口。
   * @returns 是否实际修复了至少 1 点
   */
  tickRepair(unit: any, world: any, building: any): boolean {
    const repairRules = world.rules.general.repair;
    const step = Math.floor(repairRules.repairStep);
    const percent = repairRules.repairPercent;
    let healAmount: number;
    if (percent) {
      const costPerHp = (percent * unit.purchaseValue) / unit.healthTrait.maxHitPoints;
      const cost = Math.min(unit.owner.credits, Math.max(1, Math.floor(costPerHp * step)));
      healAmount = costPerHp && cost ? Math.floor(cost / costPerHp) : step;
      if (!cost) return false;
      unit.owner.credits -= cost;
    } else {
      healAmount = step;
    }
    healAmount = Math.min(healAmount, unit.healthTrait.maxHitPoints - unit.healthTrait.getHitPoints());
    return !!healAmount && (unit.healthTrait.healBy(healAmount, building, world), true);
  }

  /** 修理厂缺省集结点：占位正下方一格。 */
  computeDefaultRallyPoint(object: any, map: any): any {
    const foundation = object.getFoundation();
    const pos = new Vector2(object.tile.rx, object.tile.ry + foundation.height);
    return map.tiles.getByMapCoords(pos.x, pos.y) ?? object.tile;
  }
}
