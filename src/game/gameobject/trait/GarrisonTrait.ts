/**
 * GarrisonTrait — 建筑驻军 trait（要塞、碉堡等）。
 *
 * units 存驻军单位。摧毁且致死时连带杀死驻军；非致死则 evacuate。
 * evacuate 按 speedType 分组，在建筑 footprint 外找可通行相邻格 unlimbo
 * 并派 ScatterTask；找不到格子则（可选）销毁。完成后派发
 * BuildingEvacuateEvent。_afterEvacuate 供子类扩展。
 *
 * 由 game/gameobject/trait/GarrisonTrait.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as NotifyDestroyModule from "game/gameobject/trait/interface/NotifyDestroy"; // 已转换
import { RadialTileFinder } from "game/map/tileFinder/RadialTileFinder"; // 未转换（any-shim）
import * as NotifyDamageModule from "game/gameobject/trait/interface/NotifyDamage"; // 已转换
import * as NotifySellModule from "game/gameobject/trait/interface/NotifySell"; // 已转换
import { fnv32a } from "util/math"; // 已转换
import { BuildingEvacuateEvent } from "game/event/BuildingEvacuateEvent"; // 已转换
import { ScatterTask } from "game/gameobject/task/ScatterTask"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class GarrisonTrait {
  /** 宿主建筑。 */
  building: any;
  /** 最大驻军容量。 */
  maxOccupants: number;
  /** 当前驻军单位列表。 */
  units: any[];

  constructor(building: any, maxOccupants: number) {
    this.building = building;
    this.maxOccupants = maxOccupants;
    this.units = [];
  }

  /** 是否有驻军。 */
  isOccupied(): boolean {
    return !!this.units.length;
  }

  /** 是否可被驻入（本实现恒 true）。 */
  canBeOccupied(): boolean {
    return !0;
  }

  /** 受伤：驻军不因此被逐出（空实现与孪生一致）。 */
  [NotifyDamageModule.NotifyDamage.onDamage](): void {}

  /** 销毁：致死则连带杀驻军，否则 evacuate。 */
  [NotifyDestroyModule.NotifyDestroy.onDestroy](building: any, world: any, attackerInfo: any, lethal: boolean): void {
    if (lethal) {
      for (const unit of this.units) {
        unit.deathType = building.deathType;
        unit.garrisonedAt = void 0;
        world.destroyObject(unit, attackerInfo, !0);
      }
      this.units = [];
    } else {
      this.evacuate(world);
    }
  }

  /** 出售钩子：默认空（子类可覆写）。 */
  [NotifySellModule.NotifySell.onSell](): void {}

  /** 同步哈希：驻军 getHash 串联。 */
  getHash(): number {
    return fnv32a(this.units.map((unit) => unit.getHash()));
  }

  /** 调试状态：驻军 debugGetState 列表。 */
  debugGetState(): Record<string, unknown> {
    return { units: this.units.map((unit) => unit.debugGetState()) };
  }

  /** 释放宿主引用。 */
  dispose(): void {
    this.building = void 0;
  }

  /**
   * 驻军撤出：按 speedType 分组，在 footprint 外找通行格 unlimbo +
   * ScatterTask；找不到格子时（默认）销毁单位。最后派发撤离事件。
   */
  evacuate(world: any, destroyIfNoTile = false): void {
    const building = this.building;
    const units = this.units;
    if (!units.length) return;
    const bySpeed = new Map<any, any[]>();
    for (const unit of units) {
      bySpeed.set(unit.rules.speedType, (bySpeed.get(unit.rules.speedType) || []).concat(unit));
    }
    for (const [speedType, group] of bySpeed) {
      const finder = new RadialTileFinder(
        world.map.tiles,
        world.map.mapBounds,
        building.tile,
        building.art.foundation,
        1,
        1,
        (tile: any) =>
          0 < world.map.terrain.getPassableSpeed(tile, speedType, !0, !1) &&
          Math.abs(tile.z - building.tile.z) < 2 &&
          !world.map.terrain.findObstacles({ tile, onBridge: void 0 }, group[0]).length,
      );
      const dest = finder.getNextTile();
      for (const unit of group) {
        const idx = units.indexOf(unit);
        if (dest) {
          units.splice(idx, 1);
          world.unlimboObject(unit, dest);
          unit.garrisonedAt = void 0;
          unit.onBridge =
            world.map.tileOccupation.getBridgeOnTile(dest)?.isLowBridge() ?? !1;
          unit.position.tileElevation = 0;
          unit.unitOrderTrait.addTask(new ScatterTask(world));
        } else if (!destroyIfNoTile) {
          world.destroyObject(unit, { player: unit.owner });
          unit.garrisonedAt = void 0;
          units.splice(idx, 1);
        }
      }
    }
    const formerOwner = building.owner;
    this._afterEvacuate(world);
    world.events.dispatch(new BuildingEvacuateEvent(building, formerOwner));
  }

  /** 撤离后钩子（默认空，子类扩展）。 */
  protected _afterEvacuate(world: any): void {}
}
