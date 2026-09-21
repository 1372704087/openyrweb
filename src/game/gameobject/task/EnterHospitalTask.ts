/**
 * EnterHospitalTask — 步兵进入医院治疗排队任务。
 *
 * 状态机：
 *  - onStart：hospitalTrait.addToHealQueue；有人在前 → MoveToQueueingTile，
 *    否则直接 MoveToTarget；
 *  - MoveToQueueingTile：径向找医院旁可通行等待格，MoveTask + 失败取消回调；
 *  - WaitForTurn：等到自己是队首；
 *  - MoveToTarget：MoveInside 进入医院占地；
 *  - EnterTarget：limbo + hospitalTrait.startHealing + EnterObjectEvent；
 *    isAllowed 失败则 MoveOutside → ClearTarget。
 *
 * isAllowed：非飞行、血量 <100、目标是医院且未毁、友好、弹药充足。
 *
 * 由 game/gameobject/task/EnterHospitalTask.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标。
 */
import { Task } from "game/gameobject/task/system/Task"; // 已转换
import * as MoveOutsideTaskModule from "game/gameobject/task/move/MoveOutsideTask"; // 已转换
import * as MoveInsideTaskModule from "game/gameobject/task/move/MoveInsideTask"; // 已转换
import { MovementZone } from "game/type/MovementZone"; // 已转换
import * as MovePositionHelperModule from "game/gameobject/unit/MovePositionHelper"; // 未转换（any-shim）
import * as RadialTileFinderModule from "game/map/tileFinder/RadialTileFinder"; // 已转换
import * as MoveTaskModule from "game/gameobject/task/move/MoveTask"; // 已转换
import * as CallbackTaskModule from "game/gameobject/task/system/CallbackTask"; // 已转换
import { MoveResult } from "game/gameobject/trait/MoveTrait"; // 已转换
import * as EnterObjectEventModule from "game/event/EnterObjectEvent"; // 未转换（any-shim）

/** 医院进入状态。 */
export const EnterHospitalState = {
  MoveToQueueingTile: 0,
  WaitForTurn: 1,
  MoveToTarget: 2,
  EnterTarget: 3,
  ClearTarget: 4,
} as const;

/* eslint-disable @typescript-eslint/no-explicit-any */
export class EnterHospitalTask extends Task {
  game: any;
  target: any;
  state: number;
  movePerformed: boolean;
  queueingTile: any;
  lastOutsideTile: any;

  constructor(game: any, target: any) {
    super();
    this.game = game;
    this.target = target;
    this.movePerformed = false;
  }

  isAllowed(object: any): boolean {
    return (
      object.rules.movementZone !== MovementZone.Fly &&
      object.healthTrait.health < 100 &&
      !!this.target.hospitalTrait &&
      !this.target.isDestroyed &&
      !this.target.warpedOutTrait.isActive() &&
      this.game.areFriendly(object, this.target) &&
      (!this.target.ammoTrait || this.target.ammoTrait.ammo > 0)
    );
  }

  onStart(object: any): void {
    if (!this.target.hospitalTrait) {
      throw new Error(`Target ${this.target.name} is not a valid hospital`);
    }
    if (this.target.hospitalTrait.addToHealQueue(object) > 0) {
      this.state = EnterHospitalState.MoveToQueueingTile;
    } else {
      this.state = EnterHospitalState.MoveToTarget;
    }
  }

  onEnd(object: any): void {
    if (!this.target.isDestroyed && object.isSpawned) {
      this.target.hospitalTrait.removeFromHealQueue(object);
    }
  }

  onTick(object: any): boolean {
    if (
      (this.isCancelling() && this.state !== EnterHospitalState.EnterTarget) ||
      this.state === EnterHospitalState.ClearTarget ||
      object.moveTrait.isDisabled()
    ) {
      return true;
    }
    if (this.state === EnterHospitalState.MoveToQueueingTile) {
      const helper = new MovePositionHelperModule.MovePositionHelper(this.game.map);
      const queueTile = new RadialTileFinderModule.RadialTileFinder(
        this.game.map.tiles,
        this.game.map.mapBounds,
        this.target.tile,
        this.target.getFoundation(),
        1,
        1,
        (tile: any) =>
          this.game.map.terrain.getPassableSpeed(tile, object.rules.speedType, object.isInfantry(), false) > 0 &&
          helper.isEligibleTile(tile, undefined, undefined, this.target.tile),
      ).getNextTile();
      if (!queueTile) return true;
      this.children.push(
        new MoveTaskModule.MoveTask(this.game, queueTile, false, { closeEnoughTiles: 5 }),
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
      this.state = EnterHospitalState.WaitForTurn;
      this.queueingTile = queueTile;
      return false;
    }
    if (this.state === EnterHospitalState.WaitForTurn) {
      if (!this.target.hospitalTrait.unitIsFirstInHealQueue(object)) return false;
      this.queueingTile = undefined;
      this.state = EnterHospitalState.MoveToTarget;
    }
    if (this.state === EnterHospitalState.MoveToTarget) {
      if (this.movePerformed && this.children.length) {
        if (object.tile !== this.lastOutsideTile) {
          if (!this.game.map.tileOccupation.isTileOccupiedBy(object.tile, this.target)) {
            this.lastOutsideTile = object.tile;
          }
        }
        return false;
      }
      if (!this.isAllowed(object)) return true;
      if (!this.game.map.tileOccupation.isTileOccupiedBy(object.tile, this.target)) {
        if (this.movePerformed) return true;
        this.children.push(new MoveInsideTaskModule.MoveInsideTask(this.game, this.target).setBlocking(false));
        this.movePerformed = true;
        return false;
      }
      this.state = EnterHospitalState.EnterTarget;
    }
    if (this.state !== EnterHospitalState.EnterTarget) return false;
    if (!this.isAllowed(object) || this.isCancelling()) {
      this.children.push(
        new MoveOutsideTaskModule.MoveOutsideTask(this.game, this.target, this.lastOutsideTile),
      );
      this.state = EnterHospitalState.ClearTarget;
      return false;
    }
    this.game.limboObject(object, {
      selected: false,
      controlGroup: this.game.getUnitSelection().getOrCreateSelectionModel(object).getControlGroupNumber(),
    });
    this.target.hospitalTrait.startHealing(object);
    this.game.events.dispatch(new EnterObjectEventModule.EnterObjectEvent(this.target, object));
    return true;
  }

  getTargetLinesConfig(_world: any): any {
    return {
      target: this.queueingTile ? undefined : this.target,
      pathNodes: this.queueingTile ? [{ tile: this.queueingTile, onBridge: undefined }] : [],
    };
  }
}
