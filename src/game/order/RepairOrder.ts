/**
 * RepairOrder — 工程师修理 / 修桥指令。
 *
 * 目标必须是未毁建筑，源对象为工程师步兵；非战斗方驻军/桥舱建筑
 * 或友军建筑可修。isAllowed：桥舱走 canRepairBridge，普通建筑看
 * repairable 且血量 <100。process 挂 RepairBuildingTask。
 *
 * onAdd：已在同目标任务中且已在建筑旁时拒绝重复排队。
 *
 * 由 game/order/RepairOrder.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as OrderModule from "game/order/Order"; // 未转换（any-shim）
import { OrderType } from "game/order/OrderType"; // 已转换
import * as PointerTypeModule from "engine/type/PointerType"; // 未转换（any-shim）
import * as RangeHelperModule from "game/gameobject/unit/RangeHelper"; // 未转换（any-shim）
import { RepairBuildingTask } from "game/gameobject/task/RepairBuildingTask"; // 已转换
import * as OrderFeedbackTypeModule from "game/order/OrderFeedbackType"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class RepairOrder extends OrderModule.Order {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;

  constructor(game: any) {
    super(OrderType.Repair);
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
        ? PointerTypeModule.PointerType.RepairMove
        : PointerTypeModule.PointerType.NoRepair;
  }

  isValid(): boolean {
    return (
      !!this.target.obj?.isBuilding() &&
      !this.target.obj.isDestroyed &&
      this.sourceObject.isInfantry() &&
      this.sourceObject.rules.engineer &&
      ((!this.target.obj.owner.isCombatant() &&
        (!!this.target.obj.garrisonTrait || !!this.target.obj.cabHutTrait)) ||
        this.game.areFriendly(this.target.obj, this.sourceObject))
    );
  }

  isAllowed(): boolean {
    const target = this.target.obj;
    return target.cabHutTrait
      ? target.cabHutTrait.canRepairBridge()
      : !!(target.rules.repairable && target.healthTrait.health < 100);
  }

  process(): any[] {
    const target = this.target.obj;
    return [new RepairBuildingTask(this.game, target)];
  }

  onAdd(tasks: any, skip: any): boolean {
    if (!skip) {
      const existing = tasks.find((task: any) => task instanceof RepairBuildingTask);
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
