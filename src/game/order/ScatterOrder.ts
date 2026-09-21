/**
 * ScatterOrder — 散开指令。
 *
 * 步兵/载具且非飞行、移动未禁用时有效。process 要求 target 已设置
 * （见 OrderUnitsAction），并挂 ScatterTask 到目标格/桥面。
 *
 * 由 game/order/ScatterOrder.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as OrderModule from "game/order/Order"; // 未转换（any-shim）
import { OrderType } from "game/order/OrderType"; // 已转换
import * as PointerTypeModule from "engine/type/PointerType"; // 未转换（any-shim）
import { ScatterTask } from "game/gameobject/task/ScatterTask"; // 已转换
import { MovementZone } from "game/type/MovementZone"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ScatterOrder extends OrderModule.Order {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;
  getPointerType: any;

  constructor(game: any) {
    super(OrderType.Scatter);
    this.game = game;
    this.getPointerType = () => PointerTypeModule.PointerType.NoAction;
  }

  isValid(): boolean {
    return (
      (this.sourceObject.isInfantry() || this.sourceObject.isVehicle()) &&
      this.sourceObject.rules.movementZone !== MovementZone.Fly &&
      !this.sourceObject.moveTrait.isDisabled()
    );
  }

  isAllowed(): boolean {
    return true;
  }

  process(): any[] {
    if (!this.target)
      throw new Error("Target should be set for executing a scatter order. See OrderUnitsAction.");
    return [new ScatterTask(this.game, { tile: this.target.tile, toBridge: !!this.target.getBridge() })];
  }
}
