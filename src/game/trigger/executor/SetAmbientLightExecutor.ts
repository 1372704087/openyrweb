/**
 * SetAmbientLightExecutor — 设置环境光强度目标。
 *
 * 动作 SetAmbientLight：params[1] 为百分比 → /100 后写入
 * mapLightingTrait.setTargetAmbientIntensity（由光照 trait 平滑逼近）。
 *
 * 由 game/trigger/executor/SetAmbientLightExecutor.ts.js 重写为 TS。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写

/* eslint-disable @typescript-eslint/no-explicit-any */
export class SetAmbientLightExecutor extends TriggerExecutor {
  execute(game: any): void {
    const intensity = Number(this.action.params[1]) / 100;
    game.mapLightingTrait.setTargetAmbientIntensity(intensity);
  }
}
