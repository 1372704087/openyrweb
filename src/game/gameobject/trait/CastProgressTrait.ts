/**
 * CastProgressTrait — 工程师占领读条（Timer 驱动进度，传送/换主时重置）。
 *
 * 由 game/gameobject/trait/CastProgressTrait.ts.js 重写为 TS（行为完全一致）。
 * 本文件为修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { GameSpeed } from "game/GameSpeed"; // 已转换
import { clamp, fnv32a } from "util/math"; // 已转换
import * as TimerModule from "game/gameobject/unit/Timer"; // 未转换（any-shim）
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as NotifyTeleportModule from "game/gameobject/trait/interface/NotifyTeleport"; // 未转换（any-shim）
import * as NotifyOwnerChangeModule from "game/gameobject/trait/interface/NotifyOwnerChange"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class CastProgressTrait {
  timer: any;
  completed: any;

  constructor() {
    this.timer = new TimerModule.Timer();
    this.completed = false;
  }
  isCasting() {
    return this.timer.isActive();
  }
  isCompleted() {
    return this.completed;
  }
  getProgress() {
    return this.completed
      ? 1
      : this.timer.isActive()
        ? clamp(1 - this.timer.getTicksLeft() / this.timer.getInitialTicks(), 0, 1)
        : 0;
  }
  start(seconds: number) {
    if (this.completed || this.timer.isActive()) return;
    const ticks = Math.max(0, Math.round(seconds * GameSpeed.BASE_TICKS_PER_SECOND));
    if (ticks <= 0) return;
    this.timer.setActiveFor(ticks);
  }
  reset() {
    this.completed = false;
    this.timer.reset();
  }
  [NotifyTickModule.NotifyTick.onTick](_obj: any, world: any) {
    if (this.timer.isActive() && !0 === this.timer.tick(world.currentTick)) {
      this.completed = true;
    }
  }
  [NotifyTeleportModule.NotifyTeleport.onBeforeTeleport]() {
    this.reset();
  }
  [NotifyOwnerChangeModule.NotifyOwnerChange.onChange]() {
    this.reset();
  }
  getHash() {
    return fnv32a([this.timer.getTicksLeft(), this.timer.getInitialTicks(), this.completed ? 1 : 0]);
  }
  debugGetState() {
    return {
      ticksLeft: this.timer.getTicksLeft(),
      totalTicks: this.timer.getInitialTicks(),
      completed: this.completed,
    };
  }
}
