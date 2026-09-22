/**
 * AmbientLightCondition — 环境光越过阈值条件。
 *
 * 事件 AmbientLightBelow / AmbientLightAbove：比较当前 ambient 与阈值的
 * 跨越（crossing），而非持续比较——首次 check 只记录 previous，之后
 * 仅在跨越时刻返回 true。
 *
 * 由 game/trigger/condition/AmbientLightCondition.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 本组已写

export class AmbientLightCondition extends TriggerCondition {
  /** 跨越方向："above" 升过阈值 / "below" 跌破阈值。 */
  readonly type: string;
  /** 阈值 = params[1]/100（百分比 → 0~1 浮点）。 */
  readonly threshold: number;
  /** 上一次观测到的 ambient（undefined 表示尚未采样）。 */
  private previousAmbient?: number;

  constructor(event: any, trigger: any, type: string) {
    super(event, trigger);
    this.type = type;
    this.threshold = Number(event.params[1]) / 100;
  }

  check(game: any): boolean {
    const prev = this.previousAmbient;
    const current = game.mapLightingTrait.getAmbient().ambient;
    this.previousAmbient = current;
    if (prev === undefined) return false;
    if (prev === current) return false;
    if (this.type === "above") {
      // 升越：上一帧在阈下、本帧在阈上（含等于）
      return current >= this.threshold && prev < this.threshold;
    }
    // 跌破：上一帧在阈上、本帧在阈下（含等于）
    return current <= this.threshold && prev > this.threshold;
  }
}
