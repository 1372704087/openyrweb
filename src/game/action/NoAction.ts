/**
 * NoAction — 空动作（占位/心跳，process 不做任何事）。
 *
 * 由 game/action/NoAction.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { ActionType } from "game/action/ActionType"; // 已转换
import { Action } from "game/action/Action"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class NoAction extends Action {
  constructor() {
    super(ActionType.NoAction);
  }

  process(): void {}
}
