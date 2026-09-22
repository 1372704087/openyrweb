/**
 * NoFactoriesLeftCondition — 归属玩家已无工厂建筑条件。
 *
 * 由 game/trigger/condition/NoFactoriesLeftCondition.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 对应 TriggerEventType.NoFactoriesLeft=17：遍历 player.buildings，
 * 任一仍带 factoryTrait 则 false；全部无工厂或无 player 时——无 player
 * 返回 false，有 player 且全无工厂返回 true。
 */
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
export class NoFactoriesLeftCondition extends TriggerCondition {
  /**
   * 检查是否已无工厂。
   *
   * @returns 无 player 为 false；有 player 且无 factoryTrait 为 true。
   */
  check(): boolean {
    if (!this.player) return !1;
    for (const b of this.player.buildings) if (b.factoryTrait) return !1;
    return !0;
  }
}
