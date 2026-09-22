/**
 * PlaceBuildingActionFactory — 放置建筑动作工厂。
 *
 * 构造：(game)。create()：new PlaceBuildingAction(game)。
 *
 * 由 game/action/factories/PlaceBuildingActionFactory.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as PlaceBuildingActionModule from "game/action/PlaceBuildingAction"; // 已转换
import type { Action } from "game/action/Action"; // 已转换
export class PlaceBuildingActionFactory {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;

  constructor(game: any) {
    this.game = game;
  }

  create(): Action {
    return new PlaceBuildingActionModule.PlaceBuildingAction(this.game);
  }
}
