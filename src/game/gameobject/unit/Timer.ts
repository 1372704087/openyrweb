/**
 * Timer — 通用计时器（按 tick 倒计时，到期自动重置）。
 *
 * 由 game/gameobject/unit/Timer.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export class Timer {
  activeTicks = 0;
  activeFor: number;
  activeSince: any;

  isActive(): boolean {
    return this.activeTicks > 0;
  }

  /** 设定计时器活跃帧数和起始 tick。 */
  setActiveFor(ticks: number, since: any): void {
    this.activeTicks = ticks;
    this.activeFor = ticks;
    this.activeSince = since;
  }

  reset(): void {
    this.activeTicks = 0;
    this.activeSince = undefined;
    this.activeFor = undefined;
  }

  getTicksLeft(): number {
    return this.activeTicks;
  }

  getInitialTicks(): number {
    return this.activeFor ?? 0;
  }

  /** 每逻辑 tick：递减计数，归零或超时后自动重置并返回 true。 */
  tick(currentTick: number): boolean {
    if (
      this.activeTicks > 0 &&
      (this.activeTicks--,
      this.activeTicks <= 0 || (this.activeSince !== undefined && currentTick - this.activeSince > this.activeFor))
    ) {
      this.reset();
      return true;
    }
    return false;
  }
}
