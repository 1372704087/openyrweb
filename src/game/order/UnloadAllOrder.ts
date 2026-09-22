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

  // 把 LIFO 排出交给 EvacuateTransportTask — 与战斗要塞卸乘客
  // 使用同一任务。它在建筑更新循环上运行（sourceObject = 建筑），
  // 一次在占地外的出口格刷出一个步兵。软模式：若建筑被完全围死，
  // 单位留在建筑内而不是被摧毁。
  process(): any[] {
    return [new EvacuateTransportTask(this.game, true)];
  }

  onAdd(): boolean {
    // 恒允许重新触发。若建筑为空，任务在 onStart 自完成；若用户在排出
    // 中途连点，现有任务被取消，并以 garrisonTrait.units 中仍存的单位
    // 开新任务 — 对齐原版 YR「以仍存的单位重启排出」。
    return true;
  }
}
