/**
 * DropPlayerActionFactory — 踢出/掉线玩家动作工厂。
 *
 * 构造：(game, localPlayerName)。create()：new DropPlayerAction(game, localPlayerName)。
 *
 * 由 game/action/factories/DropPlayerActionFactory.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as DropPlayerActionModule from "game/action/DropPlayerAction"; // 已转换
import type { Action } from "game/action/Action"; // 已转换
export class DropPlayerActionFactory {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;
  localPlayerName: any;

  constructor(game: any, localPlayerName: any) {
    this.game = game;
    this.localPlayerName = localPlayerName;
  }

  create(): Action {
    return new DropPlayerActionModule.DropPlayerAction(
      this.game,
      this.localPlayerName,
    );
  }
}
