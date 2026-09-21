/**
 * EnterTransportTask — 单位进入运输载具 / 生物反应堆（InfantryAbsorb）。
 *
 * 状态机：
 *  - onStart：transportTrait.addToLoadQueue；有人在前 → MoveToQueueingTile，
 *    否则 MoveToTransport；
 *  - MoveToQueueingTile：径向找旁侧可通行等待格（含桥面判定），
 *    MoveTask + 失败取消回调；
 *  - WaitForTurn：等到自己是装载队首；
 *  - MoveToTransport：MoveInside 进入占地；
 *  - EnterTransport：limbo + EnterTransportEvent/EnterObjectEvent +
 *    transportTrait.units.push；infantryAbsorb 记 garrisonedAt 并广播
 *    BuildingGarrisonEvent，普通运输记 transport 反查。
 *
 * isAllowed：目标未毁未坠毁、双方友好、均非空中、能装下、目标 Idle、
 * 未相位、双方均非心灵控制中；InfantryAbsorb 走驻军容量/友好判定。
 *
 * 由 game/gameobject/task/EnterTransportTask.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标。
 */
import { Task } from "game/gameobject/task/system/Task"; // 已转换
import * as MoveOutsideTaskModule from "game/gameobject/task/move/MoveOutsideTask"; // 已转换
import * as MoveInsideTaskModule from "game/gameobject/task/move/MoveInsideTask"; // 已转换
import * as EnterTransportEventModule from "game/event/EnterTransportEvent"; // 未转换（any-shim）
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import { MoveState, MoveResult } from "game/gameobject/trait/MoveTrait"; // 已转换
import * as RadialTileFinderModule from "game/map/tileFinder/RadialTileFinder"; // 已转换
import * as MovePositionHelperModule from "game/gameobject/unit/MovePositionHelper"; // 未转换（any-shim）
import * as MoveTaskModule from "game/gameobject/task/move/MoveTask"; // 已转换
import * as CallbackTaskModule from "game/gameobject/task/system/CallbackTask"; // 已转换
import * as EnterObjectEventModule from "game/event/EnterObjectEvent"; // 未转换（any-shim）
import * as BuildingGarrisonEventModule from "game/event/BuildingGarrisonEvent"; // 未转换（any-shim）

/** 进入运输状态。 */
export const EnterTransportState = {
  MoveToQueueingTile: 0,
  WaitForTurn: 1,
  MoveToTransport: 2,
  EnterTransport: 3,
  ClearTransport: 4,
} as const;

/* eslint-disable @typescript-eslint/no-explicit-any */
export class EnterTransportTask extends Task {
  game: any;
  target: any;
  state: number;
  movePerformed: boolean;
  initialTargetTile: any;
  queueingNode: any;

  constructor(game: any, target: any) {
    super();
    this.game = game;
    this.target = target;
    this.movePerformed = false;
    this.preventOpportunityFire = false;
  }

  isAllowed(object: any): boolean {
    // InfantryAbsorb（生物反应堆）：驻军式进入判定。
    if (this.target.rules?.infantryAbsorb) {
      const building = this.target;
      if (building.isDestroyed || !building.garrisonTrait?.canBeOccupied()) return false;
      if (building.garrisonTrait.units.length >= building.garrisonTrait.maxOccupants) return false;
      if (!this.game.areFriendly(object, building)) return false;
      return true;
    }
    return (
      !this.target.isDestroyed &&
      !this.target.isCrashing &&
      this.game.areFriendly(this.target, object) &&
      object.zone !== ZoneType.Air &&
      this.target.zone !== ZoneType.Air &&
      this.target.transportTrait.unitFitsInside(object) &&
      (this.target.moveTrait?.moveState ?? MoveState.Idle) === MoveState.Idle &&
      !this.target.warpedOutTrait.isActive() &&
      !object.mindControllableTrait?.isActive() &&
      !object.mindControllerTrait?.isActive()
    );
  }

  onStart(object: any): void {
    if (!this.target.transportTrait) {
      throw new Error(`Unit ${this.target.name} is not a valid transport`);
    }
    this.initialTargetTile = this.target.tile;
    if (this.target.transportTrait.addToLoadQueue(object) > 0) {
      this.state = EnterTransportState.MoveToQueueingTile;
    } else {
      this.state = EnterTransportState.MoveToTransport;
    }
  }

  onEnd(object: any): void {
    if (!this.target.isDestroyed) this.target.transportTrait?.removeFromLoadQueue(object);
  }

  onTick(object: any): boolean {
    if (
      (this.isCancelling() && this.state !== EnterTransportState.EnterTransport) ||
      this.state === EnterTransportState.ClearTransport ||
      object.moveTrait.isDisabled()
    ) {
      return true;
    }
    // 目标移动/换格后中止（装载目标已变）。
    if (
      this.target.tile !== this.initialTargetTile ||
      (this.target.moveTrait?.moveState ?? MoveState.Idle) !== MoveState.Idle
    ) {
      return true;
    }
    if (this.state === EnterTransportState.MoveToQueueingTile) {
      const helper = new MovePositionHelperModule.MovePositionHelper(this.game.map);
      const startBridge = this.target.onBridge
        ? this.game.map.tileOccupation.getBridgeOnTile(this.target.tile)
        : undefined;
      let foundBridge: any;
      const queueTile = new RadialTileFinderModule.RadialTileFinder(
        this.game.map.tiles,
        this.game.map.mapBounds,
        this.target.tile,
        this.target.getFoundation(),
        1,
        1,
        (tile: any) => {
          const bridges = [this.game.map.tileOccupation.getBridgeOnTile(tile)];
          if (bridges[0]) bridges.push(undefined);
          for (const bridge of bridges) {
            if (
              this.game.map.terrain.getPassableSpeed(
                tile,
                object.rules.speedType,
                object.isInfantry(),
                !!bridge,
              ) > 0 &&
              helper.isEligibleTile(tile, bridge, startBridge, this.target.tile)
            ) {
              foundBridge = bridge;
              return true;
            }
          }
          return false;
        },
      ).getNextTile();
      if (!queueTile) return true;
      this.children.push(
        new MoveTaskModule.MoveTask(this.game, queueTile, !!foundBridge, { closeEnoughTiles: 5 }),
      );
      this.children.push(
        new CallbackTaskModule.CallbackTask(() => {
          if (
            ![MoveResult.Success, MoveResult.CloseEnough].includes(object.moveTrait.lastMoveResult)
          ) {
            this.cancel();
          }
        }),
      );
      this.queueingNode = { tile: queueTile, onBridge: foundBridge };
      this.state = EnterTransportState.WaitForTurn;
      return false;
    }
    if (this.state === EnterTransportState.WaitForTurn) {
      if (!this.target.transportTrait.unitIsFirstInLoadQueue(object)) return false;
      this.queueingNode = undefined;
      this.state = EnterTransportState.MoveToTransport;
    }
    if (this.state === EnterTransportState.MoveToTransport) {
      if (!this.isAllowed(object)) return true;
      if (!this.game.map.tileOccupation.isTileOccupiedBy(object.tile, this.target)) {
        if (this.movePerformed) return true;
        this.children.push(new MoveInsideTaskModule.MoveInsideTask(this.game, this.target));
        this.movePerformed = true;
        this.preventOpportunityFire = true;
        return false;
      }
      this.state = EnterTransportState.EnterTransport;
    }
    if (this.state !== EnterTransportState.EnterTransport) return false;
    if (!this.isAllowed(object) || this.isCancelling()) {
      this.children.push(new MoveOutsideTaskModule.MoveOutsideTask(this.game, this.target));
      this.state = EnterTransportState.ClearTransport;
      return false;
    }
    const isAbsorb = !!this.target.rules?.infantryAbsorb;
    this.game.limboObject(object, {
      selected: false,
      controlGroup: this.game.getUnitSelection().getOrCreateSelectionModel(object).getControlGroupNumber(),
      inTransport: !isAbsorb,
    });
    this.game.events.dispatch(new EnterTransportEventModule.EnterTransportEvent(this.target));
    this.game.events.dispatch(new EnterObjectEventModule.EnterObjectEvent(this.target, object));
    this.target.transportTrait.units.push(object);
    if (isAbsorb) {
      object.garrisonedAt = this.target;
      this.game.events.dispatch(new BuildingGarrisonEventModule.BuildingGarrisonEvent(this.target));
    } else {
      object.transport = this.target;
    }
    return true;
  }

  getTargetLinesConfig(_world: any): any {
    return {
      target: this.queueingNode ? undefined : this.target,
      pathNodes: this.queueingNode ? [this.queueingNode] : [],
    };
  }
}
