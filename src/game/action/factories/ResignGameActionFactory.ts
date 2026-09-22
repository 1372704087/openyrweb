/**
 * ResignGameActionFactory — 退出对局动作工厂。
 *
 * 构造：(game, localPlayerName)。create()：new ResignGameAction(game, localPlayerName)。
 *
 * 由 game/action/factories/ResignGameActionFactory.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ResignGameActionModule from "game/action/ResignGameAction"; // 已转换
import type { Action } from "game/action/Action"; // 已转换
export class ResignGameActionFactory {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;
  localPlayerName: any;

  constructor(game: any, localPlayerName: any) {
    this.game = game;
    this.localPlayerName = localPlayerName;
  }

  create(): Action {
    return new ResignGameActionModule.ResignGameAction(
      this.game,
      this.localPlayerName,
    );
  }
}
