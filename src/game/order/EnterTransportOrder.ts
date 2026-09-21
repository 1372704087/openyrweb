/**
 * EnterTransportOrder — 进入运输载具指令。
 *
 * 目标须为友方未毁运输载具（transportTrait），源对象为步兵/载具且非
 * 自身。isAllowed：双方均非空中、unitFitsInside、载具 Idle、未被
 * warp/mind-control。process：可通行 → EnterTransportTask；否则先让
 * 载具驶近再挂入舱任务。
 *
 * onAdd：已在同目标任务中且已在载具旁时拒绝重复排队。
 *
 * 由 game/order/EnterTransportOrder.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as OrderModule from "game/order/Order"; // 已转换
import { OrderType } from "game/order/OrderType"; // 已转换
import * as PointerTypeModule from "engine/type/PointerType"; // 未转换（any-shim）
import * as RangeHelperModule from "game/gameobject/unit/RangeHelper"; // 未转换（any-shim）
import { OrderFeedbackType } from "game/order/OrderFeedbackType"; // 已转换
import { EnterTransportTask } from "game/gameobject/task/EnterTransportTask"; // 已转换
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import { MoveState } from "game/gameobject/trait/MoveTrait"; // 已转换
import { CallbackTask } from "game/gameobject/task/system/CallbackTask"; // 已转换
import { MoveTask } from "game/gameobject/task/move/MoveTask"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class EnterTransportOrder extends OrderModule.Order {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;

  constructor(game: any) {
    super(OrderType.EnterTransport);
    this.game = game;
    this.targetOptional = false;
    this.terminal = true;
    this.feedbackType = OrderFeedbackType.Enter;
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
    return !(
      !this.target.obj?.isVehicle() ||
      !this.target.obj.transportTrait ||
      this.target.obj.isDestroyed ||
      this.target.obj === this.sourceObject ||
      !this.game.areFriendly(this.target.obj, this.sourceObject) ||
      (!this.sourceObject.isVehicle() && !this.sourceObject.isInfantry())
    );
  }

  isAllowed(): boolean {
    const target = this.target.obj;
    const source = this.sourceObject;
    return (
      source.zone !== ZoneType.Air &&
      target.zone !== ZoneType.Air &&
      target.transportTrait.unitFitsInside(source) &&
      target.moveTrait.moveState === MoveState.Idle &&
      !target.warpedOutTrait.isActive() &&
      !source.mindControllableTrait?.isActive() &&
      !source.mindControllerTrait?.isActive()
    );
  }

  process(): any[] {
    const source = this.sourceObject;
    const target = this.target.obj;
    return this.game.map.terrain.getPassableSpeed(
      target.tile,
      source.rules.speedType,
      source.isInfantry(),
      source.onBridge,
    )
      ? [new EnterTransportTask(this.game, target)]
      : [
          new CallbackTask(() => {
            target.unitOrderTrait.addTask(new MoveTask(this.game, source.tile, source.onBridge));
            target.unitOrderTrait.addTask(
              new CallbackTask(() => {
                this.game.map.terrain.getPassableSpeed(
                  target.tile,
                  source.rules.speedType,
                  source.isInfantry(),
                  source.onBridge,
                ) && source.unitOrderTrait.addTask(new EnterTransportTask(this.game, target));
              }),
            );
          }),
        ];
  }

  onAdd(tasks: any, skip: any): boolean {
    if (!skip) {
      const existing = tasks.find((task: any) => task instanceof EnterTransportTask);
      if (
        this.isValid() &&
        this.isAllowed() &&
        existing &&
        !existing.isCancelling() &&
        existing.target === this.target.obj
      )
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
