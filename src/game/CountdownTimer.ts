/**
 * CountdownTimer — 以逻辑 tick 计数的倒计时器。
 *
 * 由 game/CountdownTimer.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TimerExpireEvent } from "game/event/TimerExpireEvent";
import { GameSpeed } from "game/GameSpeed";

/** update() 所需的世界对象最小结构（真实实现是携带事件总线的 Game/World）。 */
interface WorldWithEvents {
  events: { dispatch(event: TimerExpireEvent): void };
}

export class CountdownTimer {
  ticks = 0;
  running = false;

  /** 剩余整秒数。 */
  getSeconds(): number {
    return Math.floor(this.ticks / GameSpeed.BASE_TICKS_PER_SECOND);
  }

  /** 设置剩余秒数（向下取整到 tick，负值归零）。 */
  setSeconds(seconds: number): void {
    this.ticks = Math.max(0, Math.floor(GameSpeed.BASE_TICKS_PER_SECOND * seconds));
  }

  /** 增减剩余秒数（可为负，结果不小于 0）。 */
  addSeconds(seconds: number): void {
    this.ticks = Math.max(0, this.ticks + Math.floor(GameSpeed.BASE_TICKS_PER_SECOND * seconds));
  }

  start(): void {
    this.running = true;
  }

  stop(): void {
    this.running = false;
  }

  isRunning(): boolean {
    return this.running;
  }

  /** 每逻辑 tick 调用一次：递减计数，归零时停止并经 world.events 派发到期事件。 */
  update(world: WorldWithEvents): void {
    if (this.running) {
      if (this.ticks > 0) this.ticks--;
      else {
        this.running = false;
        world.events.dispatch(new TimerExpireEvent(this));
      }
    }
  }
}
