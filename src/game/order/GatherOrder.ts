/**
 * GatherOrder — 矿车采矿指令。
 *
 * 目标必须是矿区（target.isOre）；源对象须为带 harvesterTrait 的载具
 * 且移动未禁用、目标格未被己方迷雾遮挡。process 挂 GatherOreTask。
 * 光标：迷你 AttackMini / 普通 AttackNoRange。
 *
 * 由 game/order/GatherOrder.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as OrderModule from "game/order/Order"; // 已转换
import { OrderType } from "game/order/OrderType"; // 已转换
import * as PointerTypeModule from "engine/type/PointerType"; // 未转换（any-shim）
import { GatherOreTask } from "game/gameobject/task/harvester/GatherOreTask"; // 已转换
import { OrderFeedbackType } from "game/order/OrderFeedbackType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class GatherOrder extends OrderModule.Order {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;

  constructor(game: any) {
    super(OrderType.Gather);
    this.game = game;
    this.targetOptional = false;
    this.feedbackType = OrderFeedbackType.Move;
  }

  getPointerType(isMini: any): any {
    return isMini ? PointerTypeModule.PointerType.AttackMini : PointerTypeModule.PointerType.AttackNoRange;
  }

  isValid(): boolean {
    return (
      !(
        !this.sourceObject.isVehicle() ||
        !this.sourceObject.harvesterTrait ||
        this.sourceObject.moveTrait.isDisabled() ||
        this.game.mapShroudTrait
          .getPlayerShroud(this.sourceObject.owner)
          ?.isShrouded(this.target.tile, this.target.obj?.tileElevation)
      ) && this.target.isOre
    );
  }

  isAllowed(): boolean {
    return true;
  }

  process(): any[] {
    return [new GatherOreTask(this.game, this.target.tile, true)];
  }
}
