/**
 * SetAmbientLightExecutor — 设置环境光强度目标。
 *
 * 动作 SetAmbientLight：params[1] 为百分比 → /100 后写入
 * mapLightingTrait.setTargetAmbientIntensity（由光照 trait 平滑逼近）。
 *
 * 由 game/trigger/executor/SetAmbientLightExecutor.ts.js 重写为 TS。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写

/* eslint-disable @typescript-eslint/no-explicit-any */
export class SetAmbientLightExecutor extends TriggerExecutor {
  execute(game: any): void {
    const intensity = Number(this.action.params[1]) / 100;
    game.mapLightingTrait.setTargetAmbientIntensity(intensity);
  }
}
