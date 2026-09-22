/**
 * SellBuildingExecutor — 出售目标中的建筑。
 *
 * 对 targets：是 GameObject、是 Building 且未毁时调
 * world.sellTrait.sell(obj)。
 *
 * 由 game/trigger/executor/SellBuildingExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { GameObject } from "game/gameobject/GameObject"; // 已转换
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class SellBuildingExecutor extends TriggerExecutor {
  /** 出售 targets 中未毁的 GameObject 建筑。 */
  execute(world: any, targets: any[]): void {
    for (const t of targets)
      if (t instanceof GameObject && t.isBuilding() && !t.isDestroyed) world.sellTrait.sell(t);
  }
}
