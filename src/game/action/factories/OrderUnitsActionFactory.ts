/**
 * OrderUnitsActionFactory — 单位指令动作工厂。
 *
 * 构造：(game, map, orderActionContext)。create()：
 * new OrderUnitsAction(game, map, orderActionContext, new OrderFactory(game, map))。
 *
 * 由 game/action/factories/OrderUnitsActionFactory.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { OrderFactory } from "game/order/OrderFactory"; // 已转换
import * as OrderUnitsActionModule from "game/action/OrderUnitsAction"; // 已转换
import type { Action } from "game/action/Action"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class OrderUnitsActionFactory {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;
  map: any;
  orderActionContext: any;

  constructor(game: any, map: any, orderActionContext: any) {
    this.game = game;
    this.map = map;
    this.orderActionContext = orderActionContext;
  }

  create(): Action {
    return new OrderUnitsActionModule.OrderUnitsAction(
      this.game,
      this.map,
      this.orderActionContext,
      new OrderFactory(this.game, this.map),
    );
  }
}
