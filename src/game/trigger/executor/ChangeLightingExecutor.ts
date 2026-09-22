/**
 * ChangeLightingExecutor — 切换地图环境光照（动作 52）。
 *
 * params[1]≠0 → 目标强度 1（亮）；=0 → 0.35（暗）。经
 * mapLightingTrait.setTargetAmbientIntensity 平滑过渡，并 console.warn
 * 记录 on/off。
 *
 * 由 game/trigger/executor/ChangeLightingExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ChangeLightingExecutor extends TriggerExecutor {
  /** 按 params[1] 切换目标环境光强度。 */
  execute(world: any): void {
    const on = 0 !== Number(this.action.params[1]);
    world.mapLightingTrait.setTargetAmbientIntensity(on ? 1 : 0.35);
    console.warn(`[OpenYRWeb] ChangeLighting: ${on ? "on" : "off"}`);
  }
}
