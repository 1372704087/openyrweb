/**
 * Order — 玩家指令基类（右键/键盘下达的单条命令）。
 *
 * 全部具体指令（Move/Attack/AttackMove/…）的公共骨架：持有 orderType、
 * 源对象 sourceObject、目标 target，以及一组默认开关（targetOptional /
 * minimapAllowed / singleSelectionRequired / terminal / feedbackType）。
 * 子类覆写 isValid / isAllowed / process / onAdd / getPointerType 实现
 * 各自校验、任务生成与光标反馈。
 *
 * 由 game/order/Order.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as PointerTypeModule from "engine/type/PointerType"; // 未转换（any-shim）
import { OrderFeedbackType } from "game/order/OrderFeedbackType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class Order {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值，TS 的字段
  // 初始化器会被提升到 super() 之后立刻执行，改变 Object.keys() 顺序。
  orderType: any;
  targetOptional: boolean;
  minimapAllowed: boolean;
  singleSelectionRequired: boolean;
  terminal: boolean;
  feedbackType: any;
  sourceObject: any;
  target: any;

  constructor(orderType: any) {
    this.orderType = orderType;
    this.targetOptional = true;
    this.minimapAllowed = true;
    this.singleSelectionRequired = false;
    this.terminal = false;
    this.feedbackType = OrderFeedbackType.None;
  }

  /** 光标类型：迷你/默认。子类按合法性细分 Move/NoMove/Attack 等。 */
  getPointerType(isMini: any, _units?: any): any {
    return isMini ? PointerTypeModule.PointerType.Mini : PointerTypeModule.PointerType.Default;
  }

  /** 绑定源对象与目标，返回自身以便链式调用。 */
  set(sourceObject: any, target: any): this {
    this.sourceObject = sourceObject;
    this.target = target;
    return this;
  }

  /** 目标形态是否合法（子类细化：墙/友军/伪装/可占领等）。 */
  isValid(): boolean {
    return true;
  }

  /** 当前单位/状态是否允许执行该指令（瘫痪、禁移动等）。 */
  isAllowed(): boolean {
    return true;
  }

  /** 指令入队时的拦截/合并逻辑；返回 false 表示本指令不再排入队列。 */
  onAdd(_tasks: any, _isReplacing: any): boolean {
    return true;
  }
}
