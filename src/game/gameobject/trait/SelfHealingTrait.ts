/**
 * SelfHealingTrait — 自我修复（周期冷却后 healBy(1)）。
 *
 * 每 tick：若生命未满且冷却已到，则按 repairRate（秒）换算的冷却
 * tick 数重新武装并 healBy(1)；否则冷却倒数。冷却公式：
 *   BASE_TICKS_PER_SECOND × repair.repairRate × 60
 *
 * 由 game/gameobject/trait/SelfHealingTrait.ts.js 重写为 TS（行为完全一
 * 致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as GameSpeedModule from "game/GameSpeed"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class SelfHealingTrait {
  /** 距下次可修复的剩余 tick（≤0 可修复）。 */
  cooldownTicks: number;

  constructor() {
    this.cooldownTicks = 0;
  }

  /** 每 tick：满血跳过；冷却中倒数；否则冷却重置并 healBy(1)。 */
  [NotifyTickModule.NotifyTick.onTick](obj: any, world: any) {
    if (obj.healthTrait.health !== 100) {
      if (this.cooldownTicks <= 0) {
        this.cooldownTicks += GameSpeedModule.GameSpeed.BASE_TICKS_PER_SECOND * world.rules.general.repair.repairRate * 60;
        obj.healthTrait.healBy(1, obj, world);
      } else {
        this.cooldownTicks--;
      }
    }
  }
}
