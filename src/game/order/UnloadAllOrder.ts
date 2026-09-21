/**
 * UnloadAllOrder — 生化反应堆（YAPOWR）侧栏「全部卸载」指令。
 *
 * 玩家选中已吸入步兵的友方生化反应堆后按 Ctrl+E：建筑 LIFO 排出
 * 全部驻军，复用 Battle Fortress 的 EvacuateTransportTask（soft 模式，
 * 一次一个步兵，刷在占地外出口格；被封死时单位留在建筑内）。
 *
 * isValid：未毁建筑 + bioReactorPowerTrait + garrisonTrait 且驻军非空。
 * onAdd：恒允许重新触发（空建筑 onStart 自完成；中途重按则取消旧任务
 * 以当前 units 重开，对齐原版 YR）。
 *
 * 由 game/order/UnloadAllOrder.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as OrderModule from "game/order/Order"; // 未转换（any-shim）
import { OrderType } from "game/order/OrderType"; // 已转换
import * as PointerTypeModule from "engine/type/PointerType"; // 未转换（any-shim）
import * as OrderFeedbackTypeModule from "game/order/OrderFeedbackType"; // 未转换（any-shim）
import { EvacuateTransportTask } from "game/gameobject/task/EvacuateTransportTask"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class UnloadAllOrder extends OrderModule.Order {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;
  getPointerType: any;

  constructor(game: any) {
    super(OrderType.UnloadAll);
    this.game = game;
    this.targetOptional = true;
    this.terminal = true;
    this.feedbackType = OrderFeedbackTypeModule.OrderFeedbackType.Enter;
    this.getPointerType = () => PointerTypeModule.PointerType.NoAction;
  }

  isValid(): boolean {
    const sourceObject = this.sourceObject;
    return (
      !!sourceObject &&
      !sourceObject.isDestroyed &&
      sourceObject.isBuilding() &&
      !!sourceObject.bioReactorPowerTrait &&
      !!sourceObject.garrisonTrait &&
      sourceObject.garrisonTrait.units.length > 0
    );
  }

  isAllowed(): boolean {
    return this.isValid();
  }

  // Hand off the LIFO drain to EvacuateTransportTask — the same task the Battle
  // Fortress uses to unload passengers. It runs on the building's update loop
  // (sourceObject = the building), spawning one infantry at a time on an exit tile
  // outside the footprint. Soft mode: if the building is fully boxed in, units stay
  // inside instead of being destroyed.
  process(): any[] {
    return [new EvacuateTransportTask(this.game, true)];
  }

  onAdd(): boolean {
    // Always allow re-triggering. If the building is empty, the task self-completes on
    // onStart; if the user spam-clicks mid-drain, the existing task is cancelled and a
    // new one starts with whatever is still in garrisonTrait.units — matches vanilla
    // YR "restart the drain with whatever is still in".
    return true;
  }
}
