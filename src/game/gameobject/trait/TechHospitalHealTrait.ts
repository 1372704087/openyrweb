/**
 * TechHospitalHealTrait — 技术医院自愈 trait（YR）。
 *
 * 挂在 InfantryGainSelfHeal>0 或 UnitsGainSelfHeal>0 的建筑上。当建筑
 * 属于真实玩家且已建成（buildStatus===1）时，周期性治疗该玩家全图
 * 所有步兵/车辆（无需进入建筑）。中立/无主建筑无效。
 *
 * 治疗节奏由 [General] SelfHealInfantryFrames/Amount、
 * SelfHealUnitFrames/Amount 控制；治疗量 = Amount × 建筑增益系数。
 * 治疗后置 __hospitalHealFlash 供渲染层（PipOverlay）闪烁治疗图标。
 * 换主（工程师占领）时重置 tickCounter，让节奏在新主下重新对齐。
 *
 * 由 game/gameobject/trait/TechHospitalHealTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as NotifyDestroyModule from "game/gameobject/trait/interface/NotifyDestroy"; // 本组新写
import * as NotifyOwnerChangeModule from "game/gameobject/trait/interface/NotifyOwnerChange"; // 本组新写

export class TechHospitalHealTrait {
  /** 全局 tick 计数器（对 Frames 取模决定治疗节奏）。 */
  tickCounter: number;

  constructor() {
    this.tickCounter = 0;
  }

  /** 治疗该建筑 owner 的全部友方步兵（amount>0 才执行）。 */
  _healInfantry(self: any, world: any): void {
    const amount = world.rules.general.selfHealInfantryAmount * self.rules.infantryGainSelfHeal;
    if (amount <= 0) return;
    const all = world.world.getAllObjects();
    for (let i = 0; i < all.length; i++) {
      const obj = all[i];
      if (
        obj.isInfantry() &&
        obj.owner === self.owner &&
        !obj.isDestroyed &&
        obj.healthTrait &&
        obj.healthTrait.health < 100
      ) {
        obj.healthTrait.healBy(amount, self, world);
        // 渲染层瞬时标志（PipOverlay）：本单位 HP 增量来自医院治疗，
        // 治疗图标闪烁。覆盖把单位奶满的那一跳（上面 health<100 检查）。
        obj.__hospitalHealFlash = true;
      }
    }
  }

  /** 治疗该建筑 owner 的全部友方车辆（amount>0 才执行）。 */
  _healUnits(self: any, world: any): void {
    const amount = world.rules.general.selfHealUnitAmount * self.rules.unitsGainSelfHeal;
    if (amount <= 0) return;
    const all = world.world.getAllObjects();
    for (let i = 0; i < all.length; i++) {
      const obj = all[i];
      if (
        obj.isVehicle() &&
        obj.owner === self.owner &&
        !obj.isDestroyed &&
        obj.healthTrait &&
        obj.healthTrait.health < 100
      ) {
        obj.healthTrait.healBy(amount, self, world);
        obj.__hospitalHealFlash = true;
      }
    }
  }

  /**
   * 每 tick：仅当建筑有主、未毁、已建成（buildStatus===1）才推进；
   * tickCounter 对 Frames 取模为 0 时分别触发步兵/车辆治疗。
   * 与 PipOverlay 图标门控（buildStatus!==1）镜像，建造中/出售中无效。
   */
  [NotifyTickModule.NotifyTick.onTick](self: any, world: any): void {
    if (!self.owner || self.isDestroyed || self.buildStatus !== 1) return;
    this.tickCounter++;
    const general = world.rules.general;
    if (self.rules.infantryGainSelfHeal > 0 && this.tickCounter % general.selfHealInfantryFrames === 0) {
      this._healInfantry(self, world);
    }
    if (self.rules.unitsGainSelfHeal > 0 && this.tickCounter % general.selfHealUnitFrames === 0) {
      this._healUnits(self, world);
    }
  }

  /** 摧毁：trait 随建筑销毁，无需清理。 */
  [NotifyDestroyModule.NotifyDestroy.onDestroy](
    _object: any,
    _attacker: any,
    _world: any,
  ): void {
    // 无清理——trait 挂在建筑上，随建筑销毁。
  }

  /** 换主（工程师占领）：重置 tickCounter，让治疗节奏在新主下重新对齐。 */
  [NotifyOwnerChangeModule.NotifyOwnerChange.onChange](
    _object: any,
    _oldOwner: any,
    _newOwner: any,
  ): void {
    this.tickCounter = 0;
  }
}
