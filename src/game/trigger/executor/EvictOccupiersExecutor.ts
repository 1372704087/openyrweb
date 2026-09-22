/**
 * EvictOccupiersExecutor — 驱逐建筑内驻军。
 *
 * 对 targets：是 GameObject、是 Building、有 garrisonTrait 且未
 * 被毁时调 garrisonTrait.evacuate(world)。
 *
 * 由 game/trigger/executor/EvictOccupiersExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { GameObject } from "game/gameobject/GameObject"; // 已转换
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class EvictOccupiersExecutor extends TriggerExecutor {
  /** 驱逐 targets 中未毁驻军建筑的全部 occupier。 */
  execute(world: any, targets: any[]): void {
    for (const t of targets)
      if (t instanceof GameObject && t.isBuilding() && (t as any).garrisonTrait && !t.isDestroyed)
        (t as any).garrisonTrait.evacuate(world);
  }
}
