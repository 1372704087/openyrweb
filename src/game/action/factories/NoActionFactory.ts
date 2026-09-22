/**
 * NoActionFactory — 空动作工厂。
 *
 * create()：返回 NoAction，无参构造。
 *
 * 由 game/action/factories/NoActionFactory.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as NoActionModule from "game/action/NoAction"; // 已转换
import type { Action } from "game/action/Action"; // 已转换
export class NoActionFactory {
  create(): Action {
    return new NoActionModule.NoAction();
  }
}
