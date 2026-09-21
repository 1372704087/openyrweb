/**
 * OccupyOrder — 占领 / 进入建筑指令（碉堡驻军、医院、间谍潜入、回收站）。
 *
 * 目标必须是已 spawn 的建筑且源对象是单位。分支：
 *  - 同属 + cloning/grinding + 非工程师 → EnterRecyclerTask（回收退款）；
 *  - hospitalTrait → EnterHospitalTask（血量 <100 且非飞行）；
 *  - garrisonTrait → InfantryAbsorb 走 EnterTransportTask（生化反应堆），
 *    否则 GarrisonBuildingTask（普通碉堡/民房）；
 *  - 否则 spyable+infiltrate → InfiltrateBuildingTask。
 *
 * onAdd：已在同目标任务中且已在建筑旁时拒绝重复排队。
 *
 * 由 game/order/OccupyOrder.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as OrderModule from "game/order/Order"; // 未转换（any-shim）
import { OrderType } from "game/order/OrderType"; // 已转换
import * as PointerTypeModule from "engine/type/PointerType"; // 未转换（any-shim）
import { GarrisonBuildingTask } from "game/gameobject/task/GarrisonBuildingTask"; // 已转换
import * as RangeHelperModule from "game/gameobject/unit/RangeHelper"; // 未转换（any-shim）
import * as OrderFeedbackTypeModule from "game/order/OrderFeedbackType"; // 未转换（any-shim）
import { MovementZone } from "game/type/MovementZone"; // 已转换
import { LocomotorType } from "game/type/LocomotorType"; // 已转换
import { EnterRecyclerTask } from "game/gameobject/task/EnterRecyclerTask"; // 已转换
import { InfiltrateBuildingTask } from "game/gameobject/task/InfiltrateBuildingTask"; // 已转换
import { EnterHospitalTask } from "game/gameobject/task/EnterHospitalTask"; // 已转换
import { EnterTransportTask } from "game/gameobject/task/EnterTransportTask"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class OccupyOrder extends OrderModule.Order {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;

  constructor(game: any) {
    super(OrderType.Occupy);
    this.game = game;
    this.targetOptional = false;
    this.terminal = true;
    this.feedbackType = OrderFeedbackTypeModule.OrderFeedbackType.Capture;
  }

  getPointerType(isMini: any): any {
    return isMini
      ? this.isAllowed()
        ? PointerTypeModule.PointerType.OccupyMini
        : PointerTypeModule.PointerType.NoActionMini
      : this.isAllowed()
        ? PointerTypeModule.PointerType.Occupy
        : PointerTypeModule.PointerType.NoOccupy;
  }

  isValid(): boolean {
    return (
      !!(this.target.obj?.isSpawned && this.target.obj?.isBuilding() && this.sourceObject.isUnit()) &&
      (!!this.isUnitRecycle(this.sourceObject, this.target.obj) ||
        (!!this.sourceObject.isInfantry() &&
          (this.target.obj.isBuilding() && this.target.obj.hospitalTrait
            ? this.game.areFriendly(this.sourceObject, this.target.obj) && this.sourceObject.isInfantry()
            : this.target.obj.garrisonTrait
              ? this.target.obj.garrisonTrait.canBeOccupied() &&
                // InfantryAbsorb buildings (Bio Reactor) absorb ANY infantry
                // (vanilla YR Absorb has no Occupier requirement) — only regular garrison
                // buildings still require the Occupier=yes flag.
                (this.target.obj.rules.infantryAbsorb || this.sourceObject.rules.occupier) &&
                // InfantryAbsorb buildings (Bio Reactor): the entering unit
                // must be friendly to the building owner, and mind-controlled infantry
                // ARE allowed (vanilla YR — absorbed, controller freed, reverted owners
                // inside must not block further entries). Regular garrison buildings keep
                // the same-owner-occupants rule and block mind-controlled units.
                (this.target.obj.rules.infantryAbsorb
                  ? this.game.areFriendly(this.sourceObject, this.target.obj)
                  : !(
                      this.target.obj.garrisonTrait.units.length &&
                      this.target.obj.garrisonTrait.units[0].owner !== this.sourceObject.owner
                    ) && !this.sourceObject.mindControllableTrait?.isActive()) &&
                // military buildings (isBaseDefense=yes) owned by civilian cannot be garrisoned.
                (this.target.obj.rules.isBaseDefense && this.target.obj.owner === this.game.getCivilianPlayer()
                  ? false
                  : true) &&
                // neutral InfantryAbsorb buildings (Bio Reactor) cannot be garrisoned;
                // they must first be captured by an engineer.
                (this.target.obj.rules.infantryAbsorb && this.target.obj.owner === this.game.getCivilianPlayer()
                  ? false
                  : true) &&
                // empty player-owned garrison buildings cannot be entered by enemies.
                (!this.target.obj.garrisonTrait.units.length &&
                !this.game.areFriendly(this.sourceObject, this.target.obj) &&
                this.target.obj.owner !== this.game.getCivilianPlayer()
                  ? false
                  : true) &&
                !this.sourceObject.mindControllerTrait?.isActive()
              : !(
                  !this.target.obj.rules.spyable ||
                  !this.sourceObject.rules.infiltrate ||
                  this.game.areFriendly(this.sourceObject, this.target.obj)
                ))))
    );
  }

  isUnitRecycle(unit: any, building: any): boolean {
    return (
      unit.owner === building.owner &&
      ((unit.isInfantry() && building.rules.cloning) || building.rules.grinding) &&
      !unit.rules.engineer
    );
  }

  isAllowed(): boolean {
    const target = this.target.obj;
    const sourceObject = this.sourceObject;
    return this.isUnitRecycle(sourceObject, target)
      ? sourceObject.rules.movementZone !== MovementZone.Fly &&
          sourceObject.rules.locomotor !== LocomotorType.Chrono &&
          0 < this.game.sellTrait.computeRefundValue(sourceObject)
      : target.hospitalTrait
        ? sourceObject.healthTrait.health < 100 && sourceObject.rules.movementZone !== MovementZone.Fly
        : !target.garrisonTrait || target.garrisonTrait.units.length < target.rules.maxNumberOccupants;
  }

  process(): any[] {
    const target = this.target.obj;
    const sourceObject = this.sourceObject;
    return this.isUnitRecycle(sourceObject, target)
      ? [new EnterRecyclerTask(this.game, target)]
      : target.hospitalTrait
        ? [new EnterHospitalTask(this.game, target)]
        : target.garrisonTrait
          // bio-reactors (InfantryAbsorb=yes) reuse the Battle Fortress
          // transport entry mechanism (EnterTransportTask: queueing tile → wait for
          // turn → walk inside), so entry position/pathfinding match the transport
          // system instead of bespoke rally-point code.
          ? target.rules.infantryAbsorb
            ? [new EnterTransportTask(this.game, target)]
            : [new GarrisonBuildingTask(this.game, target)]
          : [new InfiltrateBuildingTask(this.game, target)];
  }

  onAdd(tasks: any, skip: any): boolean {
    if (!skip) {
      const existing = tasks.find(
        (task: any) =>
          task instanceof GarrisonBuildingTask ||
          task instanceof EnterTransportTask ||
          task instanceof InfiltrateBuildingTask,
      );
      if (this.isValid() && this.isAllowed() && existing && !existing.isCancelling() && existing.target === this.target.obj)
        if (
          new RangeHelperModule.RangeHelper(this.game.map.tileOccupation).isInTileRange(
            this.sourceObject,
            this.target.obj,
            0,
            Math.SQRT2,
          )
        )
          return false;
    }
    return true;
  }
}
