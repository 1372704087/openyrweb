/**
 * ActionFactory — 按 ActionType 构造具体 Action 实例的注册表工厂。
 *
 * registerFactory(type, factory) 登记构造器；create(type) 查表并调用
 * factory.create()，未注册类型抛错。
 *
 * 由 game/action/ActionFactory.ts.js 重写为 TS。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 */
import type { Action } from "game/action/Action"; // 已转换
import { ActionType } from "game/action/ActionType"; // 已转换

/** 可注册进 ActionFactory 的动作工厂接口。 */
export interface ActionCtorFactory {
  create(): Action;
}

export class ActionFactory {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  factories: Map<ActionType, ActionCtorFactory>;

  constructor() {
    this.factories = new Map();
  }

  /** 登记某动作类型对应的工厂实例。 */
  registerFactory(actionType: ActionType, factory: ActionCtorFactory): void {
    this.factories.set(actionType, factory);
  }

  /** 按动作类型创建 Action；未注册则抛错。 */
  create(actionType: ActionType): Action {
    const factory = this.factories.get(actionType);
    if (!factory)
      throw new Error("No factory registered for action type " + actionType);
    return factory.create();
  }
}
