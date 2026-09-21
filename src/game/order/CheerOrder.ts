/**
 * CheerOrder — 步兵欢呼指令。
 *
 * 仅步兵且姿态为 None/Guard 时有效。process 挂 CheerTask。
 * 恒允许执行（isAllowed=true）。光标固定 NoAction。
 *
 * 由 game/order/CheerOrder.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as OrderModule from "game/order/Order"; // 已转换
import { OrderType } from "game/order/OrderType"; // 已转换
import * as PointerTypeModule from "engine/type/PointerType"; // 未转换（any-shim）
import { CheerTask } from "game/gameobject/task/CheerTask"; // 已转换
import { StanceType } from "game/gameobject/infantry/StanceType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class CheerOrder extends OrderModule.Order {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  getPointerType: any;

  constructor() {
    super(OrderType.Cheer);
    this.getPointerType = () => PointerTypeModule.PointerType.NoAction;
  }

  isValid(): boolean {
    return (
      this.sourceObject.isInfantry() &&
      [StanceType.None, StanceType.Guard].includes(this.sourceObject.stance)
    );
  }

  isAllowed(): boolean {
    return true;
  }

  process(): any[] {
    return [new CheerTask()];
  }
}
