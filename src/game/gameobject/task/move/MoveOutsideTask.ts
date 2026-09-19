/**
 * MoveOutsideTask — 走出目标内部的任务（与 MoveInsideTask 相对）。
 *
 * 继承 MoveTask：目的地默认取目标的当前 tile（也可由调用方指定），
 * 目标本体加入 ignoredBlockers；不可取消（走出过程不响应取消指令）。
 * canStopAtTile 与 MoveInsideTask 相反：当前格不再被目标占用
 * （真正走出来了）且父类通用停驻检查通过，才允许停。
 *
 * 由 game/gameobject/task/move/MoveOutsideTask.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标。
 */
import { MoveTask } from "game/gameobject/task/move/MoveTask"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class MoveOutsideTask extends MoveTask {
  /** 要走出的目标（建筑/载具等）。 */
  target: any;

  constructor(game: any, target: any, tile?: any) {
    super(game, tile ?? target.tile, false, { ignoredBlockers: [target] });
    this.target = target;
    this.cancellable = false;
  }

  /** 停驻判定：当前格不被目标占用（已走出来）且父类检查通过。 */
  canStopAtTile(object: any, tile: any, onBridge: any): boolean {
    return !this.game.map.tileOccupation.isTileOccupiedBy(tile, this.target) && super.canStopAtTile(object, tile, onBridge);
  }
}
