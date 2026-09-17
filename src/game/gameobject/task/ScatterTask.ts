/**
 * ScatterTask — 散开任务：让单位移动到附近可用格（逃离威胁/让路）。
 *
 * onStart 时通过 ScatterPositionHelper 找到可用散开位置并挂 MoveTask；
 * 或由调用方直接指定目标 tile（如强制攻击友军墙时的让路）。
 *
 * 由 game/gameobject/task/ScatterTask.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as MoveTaskModule from "game/gameobject/task/move/MoveTask"; // 未转换（any-shim）
import { Task } from "game/gameobject/task/system/Task"; // 已转换
import * as ScatterPositionHelperModule from "game/gameobject/unit/ScatterPositionHelper"; // 未转换（any-shim）
import { MovementZone } from "game/type/MovementZone"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ScatterTask extends Task {
  game: any;
  target: any;
  options: any;

  constructor(game: any, target?: any, options?: any) {
    super();
    this.game = game;
    this.target = target;
    this.options = options;
  }

  onStart(world: any): void {
    if (world.moveTrait.isDisabled() || world.rules.movementZone === MovementZone.Fly) return;
    let tile: any;
    let toBridge: any;
    if (this.target) {
      tile = this.target.tile;
      toBridge = this.target.toBridge;
    } else {
      const positions = new ScatterPositionHelperModule.ScatterPositionHelper(this.game)
        .findPositions([world], this.options)
        .get(world);
      if (!positions) return;
      tile = positions.tile;
      toBridge = !!positions.onBridge;
    }
    this.children.push(
      new MoveTaskModule.MoveTask(this.game, tile, toBridge, {
        closeEnoughTiles: 0,
        ignoredBlockers: this.options?.ignoredBlockers,
      }),
    );
  }

  onTick(_world: any): boolean {
    return true;
  }
}
