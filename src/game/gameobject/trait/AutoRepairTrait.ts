/**
 * AutoRepairTrait — 单位/建筑自动修理 trait。
 *
 * 未禁用时每 tick：满血自动进入禁用；冷却结束后按 INI repair 规则
 * 计算本帧修理比例与扣款（免费修理 freeRepair 时不扣款），用
 * healLeftover 保留小数余量向 HealthTrait.healBy 注入整数治疗量。
 * 资金不足则直接禁用。换主（NotifyOwnerChange）强制重新禁用。
 *
 * 由 game/gameobject/trait/AutoRepairTrait.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as NotifyOwnerChangeModule from "game/gameobject/trait/interface/NotifyOwnerChange"; // 已转换
import { GameSpeed } from "game/GameSpeed"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class AutoRepairTrait {
  /** 是否免费修理（不扣款，repairPercent 按 0 处理）。 */
  freeRepair: boolean;
  /** 当前是否禁用（满血/缺钱/换主后为 true）。 */
  disabled: boolean;
  /** 修理冷却剩余 tick，归零时尝试一帧修理。 */
  cooldownTicks: number;
  /** 跨帧保留的非整数治疗余量。 */
  healLeftover: number;

  constructor(freeRepair = false) {
    this.freeRepair = freeRepair;
    this.disabled = true;
    this.cooldownTicks = 0;
    this.healLeftover = 0;
  }

  /** 是否处于禁用态（不会主动修理）。 */
  isDisabled(): boolean {
    return this.disabled;
  }

  /** 设置禁用标志。 */
  setDisabled(value: boolean): void {
    this.disabled = value;
  }

  /** 每 tick：冷却推进 + 按 repair 规则扣款修理。 */
  [NotifyTickModule.NotifyTick.onTick](gameObject: any, world: any): void {
    if (!this.isDisabled()) {
      if (100 === gameObject.healthTrait.health) this.setDisabled(true);
      if (this.cooldownTicks <= 0) {
        const repair = world.rules.general.repair;
        const rate = gameObject.isInfantry()
          ? repair.iRepairRate
          : gameObject.isBuilding()
            ? repair.repairRate
            : repair.uRepairRate;
        this.cooldownTicks += GameSpeed.BASE_TICKS_PER_SECOND * rate * 60;
        const step = gameObject.isInfantry() ? repair.iRepairStep : repair.repairStep;
        const percent = this.freeRepair ? 0 : repair.repairPercent;
        let healPerTick: number;
        if (percent) {
          // 每点血对应造价，再按 percent 换算本 tick 应修理血量对应的钱。
          const hpCost = (percent * gameObject.purchaseValue) / gameObject.healthTrait.maxHitPoints;
          const cost = Math.min(gameObject.owner.credits, Math.max(1, Math.floor(hpCost * step)));
          if (cost) {
            healPerTick = hpCost ? cost / hpCost : step;
            gameObject.owner.credits -= cost;
          } else {
            healPerTick = 0;
            this.setDisabled(true);
          }
        } else {
          healPerTick = step;
        }
        if (healPerTick) {
          healPerTick += this.healLeftover;
          healPerTick = Math.min(
            gameObject.healthTrait.maxHitPoints - gameObject.healthTrait.getHitPoints(),
            healPerTick,
          );
          if (healPerTick) {
            const whole = Math.floor(healPerTick);
            this.healLeftover = healPerTick - whole;
            if (whole) gameObject.healthTrait.healBy(whole, gameObject, world);
          }
        }
      } else {
        this.cooldownTicks--;
      }
    }
  }

  /** 换主：强制禁用，等新主人条件满足后再恢复。 */
  [NotifyOwnerChangeModule.NotifyOwnerChange.onChange](): void {
    this.setDisabled(true);
  }
}
