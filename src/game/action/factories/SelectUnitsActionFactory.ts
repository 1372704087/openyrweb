/**
 * SelectUnitsActionFactory — 选择单位动作工厂。
 *
 * 构造：(game, orderActionContext)。create()：new SelectUnitsAction(game, orderActionContext)。
 *
 * 由 game/action/factories/SelectUnitsActionFactory.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as SelectUnitsActionModule from "game/action/SelectUnitsAction"; // 已转换
import type { Action } from "game/action/Action"; // 已转换
export class SelectUnitsActionFactory {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;
  orderActionContext: any;

  constructor(game: any, orderActionContext: any) {
    this.game = game;
    this.orderActionContext = orderActionContext;
  }

  create(): Action {
    return new SelectUnitsActionModule.SelectUnitsAction(
      this.game,
      this.orderActionContext,
    );
  }
}
