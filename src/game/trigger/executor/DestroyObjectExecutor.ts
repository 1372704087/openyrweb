/**
 * DestroyObjectExecutor — 销毁目标中的全部存活对象。
 *
 * 对 targets 逐个：是 GameObject 且 isSpawned 时调
 * world.destroyObject。参数顺序 (world, targets) 与孪生一致。
 *
 * 由 game/trigger/executor/DestroyObjectExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { GameObject } from "game/gameobject/GameObject"; // 已转换
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class DestroyObjectExecutor extends TriggerExecutor {
  /** 销毁 targets 中所有已出生的 GameObject。 */
  execute(world: any, targets: any[]): void {
    for (const t of targets) if (t instanceof GameObject && t.isSpawned) world.destroyObject(t);
  }
}
