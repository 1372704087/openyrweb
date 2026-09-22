/**
 * HospitalTrait — 医院治疗队列（healQueue + 5s 治疗 + 疏散）。
 *
 * 单位 addToHealQueue 后由外部 startHealing；tick 每 5 秒 healToFull、
 * 扣弹药、evacuate 到地基外可走格并 ScatterTask，派发
 * UnitRepairFinishEvent。医院自身被毁时连带摧毁治疗中单位。
 *
 * 由 game/gameobject/trait/HospitalTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */
import * as ObjectTypeModule from "engine/type/ObjectType"; // 已转换
import * as UnitRepairFinishEventModule from "game/event/UnitRepairFinishEvent"; // 未转换（any-shim）
import * as GameSpeedModule from "game/GameSpeed"; // 已转换
import * as RadialTileFinderModule from "game/map/tileFinder/RadialTileFinder"; // 未转换（any-shim）
import * as ScatterTaskModule from "game/gameobject/task/ScatterTask"; // 未转换（any-shim）
import * as NotifyDestroyModule from "game/gameobject/trait/interface/NotifyDestroy"; // 已转换
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class HospitalTrait {
  /** 等待治疗的单位队列。 */
  healQueue: any[];
  /** 当前治疗中的单位。 */
  unit: any;
  /** 治疗剩余 tick。 */
  healTicks: number | undefined;

  constructor() {
    this.healQueue = [];
  }

  /** 入队并返回索引。 */
  addToHealQueue(unit: any) {
    this.healQueue.push(unit);
    return this.healQueue.length - 1;
  }

  /** 是否队首。 */
  unitIsFirstInHealQueue(unit: any) {
    return this.healQueue[0] === unit;
  }

  /** 出队。 */
  removeFromHealQueue(unit: any) {
    const idx = this.healQueue.indexOf(unit);
    if (idx !== -1) this.healQueue.splice(idx, 1);
  }

  /**
   * 开始治疗指定单位（5 秒）。
   * @param unit 治疗目标
   */
  startHealing(unit: any) {
    if (this.unit) {
      throw new Error(`Already busy healing unit ${ObjectTypeModule.ObjectType[this.unit.type]}#${this.unit.id}}`);
    }
    this.unit = unit;
    this.healTicks = 5 * GameSpeedModule.GameSpeed.BASE_TICKS_PER_SECOND;
  }

  /** 每 tick：清理失效队列项；倒计时到 0 治满并疏散、发事件。 */
  [NotifyTickModule.NotifyTick.onTick](hospital: any, world: any) {
    this.healQueue = this.healQueue.filter((u: any) => !u.isDestroyed && !u.isCrashing);
    if (this.unit && this.healTicks !== undefined) {
      if (this.healTicks > 0) this.healTicks--;
      if (this.healTicks <= 0) {
        this.healTicks = undefined;
        this.removeFromHealQueue(this.unit);
        this.unit.healthTrait.healToFull(hospital, world);
        if (hospital.ammoTrait) hospital.ammoTrait.ammo--;
        this.evacuate(this.unit, hospital, world);
        const finished = this.unit;
        this.unit = undefined;
        world.events.dispatch(new UnitRepairFinishEventModule.UnitRepairFinishEvent(finished, hospital));
      }
    }
  }

  /** 医院被毁：连带摧毁治疗中单位。 */
  [NotifyDestroyModule.NotifyDestroy.onDestroy](object: any, world: any, attackerInfo: any) {
    if (this.unit) {
      this.unit.deathType = object.deathType;
      world.destroyObject(this.unit, attackerInfo, true);
      this.unit = undefined;
    }
  }

  /**
   * 把单位 unlimbo 到地基前/附近可走格并 ScatterTask；
   * 找不到落点则 destroyObject。
   */
  evacuate(unit: any, hospital: any, world: any) {
    let dest: any;
    const front = { x: hospital.tile.rx, y: hospital.tile.ry + hospital.art.foundation.height };
    const frontTile = world.map.tiles.getByMapCoords(front.x, front.y);
    if (frontTile && world.map.isWithinBounds(frontTile) && this.canEvacuateTo(frontTile, unit, hospital, world)) {
      dest = frontTile;
    }
    dest =
      dest ||
      new RadialTileFinderModule.RadialTileFinder(
        world.map.tiles,
        world.map.mapBounds,
        hospital.tile,
        hospital.art.foundation,
        1,
        1,
        (tile: any) => this.canEvacuateTo(tile, unit, hospital, world),
      ).getNextTile();
    if (dest) {
      world.unlimboObject(unit, dest);
      unit.unitOrderTrait.addTask(new ScatterTaskModule.ScatterTask(world));
    } else {
      world.destroyObject(unit, { player: unit.owner });
    }
  }

  /** 落点判定：可通过、高差 <2、无障碍。 */
  canEvacuateTo(tile: any, unit: any, hospital: any, world: any) {
    return (
      world.map.terrain.getPassableSpeed(tile, unit.rules.speedType, unit.isInfantry(), false) > 0 &&
      Math.abs(tile.z - hospital.tile.z) < 2 &&
      !world.map.terrain.findObstacles({ tile, onBridge: undefined }, unit).length
    );
  }
}
