/**
 * OilDerrickTrait — 油井产钱 trait。
 *
 * 中立油井被占领（换主：旧主中立 → 新主非中立）后，按
 * produceCashDelay 周期给 owner 增加 produceCashAmount 资金；
 * 占领瞬间先发放 produceCashStartup 一笔启动金。
 *
 *  - 出生时若 owner 非中立则直接激活；
 *  - 换主时仅从中立转为非中立才激活并发放启动金；
 *  - 每 tick 若激活则递减冷却，归零时重置并发放周期金额。
 *
 * 由 game/gameobject/trait/OilDerrickTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as NotifyOwnerChangeModule from "game/gameobject/trait/interface/NotifyOwnerChange"; // 已转换
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as NotifySpawnModule from "game/gameobject/trait/interface/NotifySpawn"; // 已转换

export class OilDerrickTrait {
  /** 是否在产钱（被非中立方拥有时 true）。 */
  isActive: boolean;
  /** 距下次产钱的剩余 tick。 */
  produceCashCooldown: number;

  constructor() {
    this.isActive = false;
    this.produceCashCooldown = 0;
  }

  /** 出生：owner 非中立则直接激活。 */
  [NotifySpawnModule.NotifySpawn.onSpawn](object: any): void {
    if (!object.owner.isNeutral) this.isActive = true;
  }

  /**
   * 换主：仅当中立 → 非中立时激活，发放 produceCashStartup 启动金
   * 并重置周期冷却。
   */
  [NotifyOwnerChangeModule.NotifyOwnerChange.onChange](object: any, oldOwner: any): void {
    if (oldOwner.isNeutral && !object.owner.isNeutral) {
      object.owner.credits = Math.max(0, object.owner.credits + object.rules.produceCashStartup);
      if (0 < object.rules.produceCashStartup) {
        object.owner.creditsGained += object.rules.produceCashStartup;
      }
      this.isActive = true;
      this.produceCashCooldown = object.rules.produceCashDelay;
    }
  }

  /**
   * 每 tick：激活时递减冷却；归零则重置为 produceCashDelay 并给
   * owner 增加 produceCashAmount（金额>0 时计入 creditsGained）。
   */
  [NotifyTickModule.NotifyTick.onTick](object: any): void {
    if (!this.isActive) return;
    this.produceCashCooldown--;
    if (this.produceCashCooldown <= 0) {
      this.produceCashCooldown = object.rules.produceCashDelay;
      object.owner.credits = Math.max(0, object.owner.credits + object.rules.produceCashAmount);
      if (0 < object.rules.produceCashAmount) {
        object.owner.creditsGained += object.rules.produceCashAmount;
      }
    }
  }
}
