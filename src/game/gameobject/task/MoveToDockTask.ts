/**
 * MoveToDockTask — 单位前往 dock（机场/船厂/矿厂泊位）入位任务。
 *
 * 状态机：
 *  - onStart：目标必须有 dockTrait；已有预留 → MoveToDock；
 *    有空位则 reserve 后 MoveToDock；直升机坪无位直接 cancel；
 *    否则去排队格 MoveToQueueingTile；
 *  - MoveToQueueingTile：找可达排队格，走到位后 WaitForTurn；
 *  - WaitForTurn：抢 dock 号（无空位挂 WaitMinutesTask 1/60）；
 *  - MoveToDock：严格走到 dock tile，失败 cancel；
 *  - Docking：unreserve + dockUnitAt，飞机+直升机坪记 preferredAirport；
 *  - onEnd：未 Docked 且目标仍存活时 undock/unreserve。
 *
 * 由 game/gameobject/task/MoveToDockTask.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { Task } from "game/gameobject/task/system/Task"; // 已转换
import { RadialTileFinder } from "game/map/tileFinder/RadialTileFinder"; // 已转换
import { MoveTask } from "game/gameobject/task/move/MoveTask"; // 已转换
import { WaitMinutesTask } from "game/gameobject/task/system/WaitMinutesTask"; // 已转换
import { CallbackTask } from "game/gameobject/task/system/CallbackTask"; // 已转换
import { MoveResult } from "game/gameobject/trait/MoveTrait"; // 已转换
import { MovementZone } from "game/type/MovementZone"; // 已转换
import { NotifyTick } from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import { Vector2 } from "game/math/Vector2"; // 已转换

/** 入位状态（模块私有，与孪生一致不对外导出）。 */
const DockingStatus = {
  Idle: 0,
  MoveToQueueingTile: 1,
  WaitForTurn: 2,
  MoveToDock: 3,
  Docking: 4,
  Docked: 5,
} as const;

/* eslint-disable @typescript-eslint/no-explicit-any */
export class MoveToDockTask extends Task {
  game: any;
  target: any;
  useChildTargetLines: boolean;
  preventOpportunityFire: boolean;
  dockingStatus: number;

  constructor(game: any, target: any) {
    super();
    this.game = game;
    this.target = target;
    this.useChildTargetLines = true;
    this.preventOpportunityFire = false;
    this.dockingStatus = DockingStatus.Idle;
  }

  onStart(object: any): void {
    if (!this.target.dockTrait) throw new Error(`Target object "${this.target.name}" is not a valid dock`);
    let dockNumber: number | undefined;
    if (this.target.dockTrait.hasReservedDockForUnit(object)) {
      this.dockingStatus = DockingStatus.MoveToDock;
    } else if (undefined !== (dockNumber = this.target.dockTrait.getFirstAvailableDockNumber())) {
      this.target.dockTrait.reserveDockAt(object, dockNumber);
      this.dockingStatus = DockingStatus.MoveToDock;
    } else if (this.target.helipadTrait) {
      this.cancel();
    } else {
      this.dockingStatus = DockingStatus.MoveToQueueingTile;
    }
  }

  onEnd(object: any): void {
    // 孪生：(status !== Docked && target.isSpawned && (undock, unreserve), status = Idle)
    if (this.dockingStatus !== DockingStatus.Docked && this.target.isSpawned) {
      this.target.dockTrait.undockUnit(object);
      this.target.dockTrait.unreserveDockForUnit(object);
    }
    this.dockingStatus = DockingStatus.Idle;
  }

  onTick(object: any): boolean {
    if (this.isCancelling()) return true;
    if (!this.isValidTarget(this.target, object)) return true;

    if (this.dockingStatus === DockingStatus.MoveToQueueingTile) {
      const queueTile = this.findReachableQueueingTile(object);
      if (!queueTile) return true;
      if (object.tile !== queueTile) {
        this.children.push(
          new MoveTask(this.game, queueTile, false, { closeEnoughTiles: 5 }),
          new CallbackTask(() => {
            // 孪生：Fail ? cancel : CloseEnough && (occupied || status = WaitForTurn)
            if (object.moveTrait.lastMoveResult === MoveResult.Fail) {
              this.cancel();
            } else if (object.moveTrait.lastMoveResult === MoveResult.CloseEnough) {
              if (!this.game.map.tileOccupation.isTileOccupiedBy(object.tile, this.target)) {
                this.dockingStatus = DockingStatus.WaitForTurn;
              }
            }
          }),
        );
        return false;
      }
      this.dockingStatus = DockingStatus.WaitForTurn;
    }

    if (this.dockingStatus === DockingStatus.WaitForTurn) {
      const freeDock = this.target.dockTrait.getFirstAvailableDockNumber();
      if (undefined === freeDock) {
        this.children.push(new WaitMinutesTask(1 / 60));
        return false;
      }
      this.target.dockTrait.reserveDockAt(object, freeDock);
      this.dockingStatus = DockingStatus.MoveToDock;
    }

    if (this.dockingStatus === DockingStatus.MoveToDock) {
      const reserved = this.target.dockTrait.getReservedDockForUnit(object);
      const dockTile = this.target.dockTrait.getDockTile(reserved);
      if (object.tile !== dockTile) {
        this.children.push(
          new MoveTask(this.game, dockTile, false, {
            targetOffset: undefined,
            closeEnoughTiles: 0,
            strictCloseEnough: true,
          }),
          new CallbackTask(() => {
            if (object.moveTrait.lastMoveResult === MoveResult.Fail) this.cancel();
          }),
        );
        this.game.afterTick(() => object.unitOrderTrait[NotifyTick.onTick](object, this.game));
        return false;
      }
      this.dockingStatus = DockingStatus.Docking;
    }

    if (this.dockingStatus !== DockingStatus.Docking) return false;

    const dockNumber = this.target.dockTrait.getReservedDockForUnit(object);
    this.target.dockTrait.unreserveDockForUnit(object);
    this.target.dockTrait.dockUnitAt(object, dockNumber);
    if (object.isAircraft() && object.airportBoundTrait && this.target.helipadTrait) {
      object.airportBoundTrait.preferredAirport = this.target;
    }
    this.dockingStatus = DockingStatus.Docked;
    return true;
  }

  isValidTarget(target: any, object: any): boolean {
    return target.isSpawned && this.game.areFriendly(target, object);
  }

  findReachableQueueingTile(object: any): any {
    const foundation = this.target.getFoundation();
    const mapCoords = new Vector2(this.target.tile.rx + foundation.width, this.target.tile.ry + foundation.height);
    const preferred = this.game.map.tiles.getByMapCoords(mapCoords.x, mapCoords.y);
    return preferred && this.isValidQueueingTile(preferred, object)
      ? preferred
      : new RadialTileFinder(
          this.game.map.tiles,
          this.game.map.mapBounds,
          this.target.tile,
          this.target.getFoundation(),
          1,
          1,
          (tile: any) => this.isValidQueueingTile(tile, object),
        ).getNextTile();
  }

  isValidQueueingTile(tile: any, object: any): boolean {
    const isFly = object.rules.movementZone === MovementZone.Fly;
    const speedType = object.rules.speedType;
    const isInfantry = object.isInfantry();
    let islandId: any =
      !isFly && this.game.map.terrain.getPassableSpeed(object.tile, speedType, isInfantry, object.onBridge)
        ? this.game.map.terrain.getIslandIdMap(speedType, isInfantry)
        : undefined;
    return (
      (isFly ||
        (islandId?.get(tile, false) === islandId?.get(object.tile, object.onBridge) &&
          Math.abs(tile.z - this.target.tile.z) < 2 &&
          !tile.onBridgeLandType &&
          !this.game.map.terrain.findObstacles({ tile, onBridge: undefined }, object).length)) &&
      !this.game.map.tileOccupation.isTileOccupiedBy(tile, this.target)
    );
  }
}
