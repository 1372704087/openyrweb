/**
 * TeleportMoveToRefineryTask — 超时空矿车传送到精炼厂旁的移动任务。
 *
 * 继承 MoveTask：目的地为 moveTile（缺省时用 teleportTile）。到达途经
 * 点或 super.onTick 返回完成时，尝试把单位直接传到 teleportTile
 * （条件：teleportCondition 未提供或返回非 false，且目标格无障碍）。
 * 空中单位传送落地后强制 zone=Ground、tileElevation=0。
 *
 * onStart 校验：必须是超时空矿车（harvesterTrait + locomotor=Chrono），
 * 否则抛错。
 *
 * 由 game/gameobject/task/harvester/TeleportMoveToRefineryTask.ts.js 重写
 * 为 TS（行为完全一致）。两个文件并存期间，本文件才是修改目标。
 */
import { MoveTask } from "game/gameobject/task/move/MoveTask"; // 已转换
import { LocomotorType } from "game/type/LocomotorType"; // 已转换
import { MoveState } from "game/gameobject/trait/MoveTrait"; // 已转换
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TeleportMoveToRefineryTask extends MoveTask {
  /** 传送目的地 tile（与行走目的地 moveTile 可分离）。 */
  teleportTile: any;
  /** 附加传送条件 (unit, teleportTile) => boolean；undefined 表示恒可传。 */
  teleportCondition: any;

  constructor(game: any, teleportTile: any, moveTile: any, teleportCondition: any) {
    super(game, moveTile ?? teleportTile, false, {
      closeEnoughTiles: moveTile ? undefined : 0,
      strictCloseEnough: !moveTile,
    });
    this.teleportTile = teleportTile;
    this.teleportCondition = teleportCondition;
  }

  onStart(object: any): void {
    super.onStart(object);
    if (!object.harvesterTrait || object.rules.locomotor !== LocomotorType.Chrono) {
      throw new Error(`Vehicle ${object.name} is not a chrono miner`);
    }
  }

  onTick(object: any): boolean {
    if (object.moveTrait.isDisabled()) return false;
    const tryShortCircuit = !(
      this.isCancelling() ||
      object.moveTrait.moveState !== MoveState.ReachedNextWaypoint ||
      object.tile === this.teleportTile ||
      !this.tryTeleportToRefinery(object)
    );
    if (tryShortCircuit) return true;
    if (super.onTick(object) === true) {
      this.isCancelling() || object.tile === this.teleportTile || this.tryTeleportToRefinery(object);
      return true;
    }
    return false;
  }

  /** 条件通过且目标格无障碍 → 传送并（若在空中）落地，返回 true。 */
  tryTeleportToRefinery(object: any): boolean {
    if (this.teleportCondition && this.teleportCondition(object, this.teleportTile) === false) return false;
    if (this.game.map.terrain.findObstacles({ tile: this.teleportTile, onBridge: undefined }, object).length) {
      return false;
    }
    object.moveTrait.teleportUnitToTile(this.teleportTile, undefined, true, true, this.game);
    if (object.zone === ZoneType.Air) {
      object.zone = ZoneType.Ground;
      object.position.tileElevation = 0;
    }
    return true;
  }
}
