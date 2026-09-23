/**
 * IdleActionTrait — 待机小动作（冷却到 0 时触发 doIdleAction，由子类实现）。
 *
 * 由 game/gameobject/trait/IdleActionTrait.ts.js 重写为 TS（行为完全一致）。
 * 本文件为修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as ScatterTaskModule from "game/gameobject/task/ScatterTask"; // 未转换（any-shim）
import { GameSpeed } from "game/GameSpeed"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class IdleActionTrait {
  cooldownTicks: any;
  _actionDueThisTick: any;
  idle: any;

  constructor() {
    this.cooldownTicks = Number.POSITIVE_INFINITY;
    this._actionDueThisTick = false;
  }
  [NotifyTickModule.NotifyTick.onTick](obj: any, world: any) {
    this._actionDueThisTick = false;
    const isIdle = !obj.unitOrderTrait.hasTasks();
    if (isIdle && !this.idle) {
      this.resetCooldown(world);
    } else if (isIdle) {
      if (this.cooldownTicks === 0) {
        this.doIdleAction(obj, world);
        this.resetCooldown(world);
      } else {
        this.cooldownTicks--;
      }
    } else {
      this.cooldownTicks = Number.POSITIVE_INFINITY;
    }
    this.idle = isIdle;
  }
  doIdleAction(obj: any, world: any) {
    if (obj.isInfantry()) {
      if (obj.rules.fraidycat) {
        if (obj.owner.isNeutral && 0.5 < world.generateRandom()) {
          obj.unitOrderTrait.addTask(new ScatterTaskModule.ScatterTask(world, void 0, { noSlopes: true }));
          return;
        }
      }
      this._actionDueThisTick = true;
    }
  }
  actionDueThisTick() {
    return this._actionDueThisTick;
  }
  resetCooldown(world: any) {
    const frequency = world.rules.audioVisual.idleActionFrequency;
    const jitter = world.generateRandom() * frequency * 0.5;
    const delay = Math.max(0, frequency - jitter);
    this.cooldownTicks = Math.floor(delay * GameSpeed.BASE_TICKS_PER_SECOND);
  }
}
