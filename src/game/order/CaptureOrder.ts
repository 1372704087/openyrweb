/**
 * CaptureOrder — 工程师占领建筑指令。
 *
 * 目标须为未毁可占领建筑、源对象为工程师步兵，且非己方友军建筑。
 * multiEngineer 规则下血量高于 engineerCaptureLevel 时显示 EngineerDamage
 * 光标。process 挂 CaptureBuildingTask。
 *
 * onAdd：已在同目标任务中且已在建筑旁时拒绝重复排队。
 *
 * 由 game/order/CaptureOrder.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as OrderModule from "game/order/Order"; // 已转换
import { OrderType } from "game/order/OrderType"; // 已转换
import * as PointerTypeModule from "engine/type/PointerType"; // 未转换（any-shim）
import * as RangeHelperModule from "game/gameobject/unit/RangeHelper"; // 未转换（any-shim）
import { CaptureBuildingTask } from "game/gameobject/task/CaptureBuildingTask"; // 已转换
import { OrderFeedbackType } from "game/order/OrderFeedbackType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class CaptureOrder extends OrderModule.Order {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;
  getPointerType: any;

  constructor(game: any) {
    super(OrderType.Capture);
    this.game = game;
    this.targetOptional = false;
    this.terminal = true;
    this.feedbackType = OrderFeedbackType.Capture;
    this.getPointerType = (isMini: any) => {
      if (!this.isAllowed())
        return isMini ? PointerTypeModule.PointerType.NoActionMini : PointerTypeModule.PointerType.NoOccupy;
      if (isMini) return PointerTypeModule.PointerType.OccupyMini;
      if (this.game.gameOpts.multiEngineer) {
        var general = this.game.rules.general;
        var target = this.target.obj;
        if (
          (!target.rules.needsEngineer || !general.engineerAlwaysCaptureTech) &&
          target.healthTrait.health > 100 * general.engineerCaptureLevel
        )
          return PointerTypeModule.PointerType.EngineerDamage;
      }
      return PointerTypeModule.PointerType.Occupy;
    };
  }

  isValid(): boolean {
    return (
      !(this.target.obj?.isDestroyed || !this.target.obj?.isBuilding() || !this.sourceObject.isInfantry()) &&
      this.target.obj.rules.capturable &&
      this.sourceObject.rules.engineer &&
      !this.target.obj.secureProgressTrait?.isActiveFrom(this.sourceObject.owner) &&
      !this.game.areFriendly(this.sourceObject, this.target.obj)
    );
  }

  isAllowed(): boolean {
    return true;
  }

  process(): any[] {
    return [new CaptureBuildingTask(this.game, this.target.obj)];
  }

  onAdd(tasks: any, skip: any): boolean {
    if (!skip) {
      const existing = tasks.find((task: any) => task instanceof CaptureBuildingTask);
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
