/**
 * VeteranTrait — 老练度/晋升 trait。
 *
 * 跟踪单位的经验（xp）与等级（None/Veteran/Elite），击杀 Techno 时
 * 按目标 cost×(目标等级+1) 获得经验；达到 promotionThresh 后晋升。
 * 晋升时按 VeteranAbility 解锁：自愈、隐形、爆炸、雷达隐形、传感器、
 * 无畏、C4、守区、碾压等，并派发 UnitPromoteEvent；Elite 级切换精英武器。
 *
 * 等级倍率（速度/装甲/火力/射速/视野）从 veteranRules 取，经
 * hasVeteranAbility 门控。
 *
 * 由 game/gameobject/trait/VeteranTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { VeteranLevel } from "game/gameobject/unit/VeteranLevel"; // 已转换
import * as NotifyTargetDestroyModule from "game/trait/interface/NotifyTargetDestroy"; // 孪生
import * as UnitPromoteEventModule from "game/event/UnitPromoteEvent"; // 孪生
import { VeteranAbility } from "game/gameobject/unit/VeteranAbility"; // 孪生
import { SelfHealingTrait } from "game/gameobject/trait/SelfHealingTrait"; // 已转换
import { CloakableTrait } from "game/gameobject/trait/CloakableTrait"; // 已转换
import { ArmedTrait } from "game/gameobject/trait/ArmedTrait"; // 已转换
import { SensorsTrait } from "game/gameobject/trait/SensorsTrait"; // 已转换

export class VeteranTrait {
  /** 宿主单位引用（dispose 后置 undefined）。 */
  gameObject: any;
  /** 老练度规则表（cap/倍率/veteranRatio）。 */
  readonly veteranRules: any;
  /** 当前等级。 */
  veteranLevel: number;
  /** 当前经验点数。 */
  xp: number;
  /** 晋升阈值 = cost×veteranRatio+1。 */
  promotionThresh: number;

  constructor(gameObject: any, veteranRules: any) {
    this.gameObject = gameObject;
    this.veteranRules = veteranRules;
    this.veteranLevel = VeteranLevel.None;
    this.xp = 0;
    this.promotionThresh = gameObject.rules.cost * veteranRules.veteranRatio + 1;
  }

  /**
   * 击杀目标摧毁时加经验并尝试晋升。条件（与孪生锁步）：
   *  - 被毁者未真正销毁或正在坠毁；
   *  - 攻击者是 Techno、非 dontScore/insignificant；
   *  - 满足：temporal/有机寄生弹头，或攻击者非友方；
   *  - 等级未达 cap 且 gainXP 成功 → handlePromotion。
   */
  [NotifyTargetDestroyModule.NotifyTargetDestroy.onDestroy](
    victim: any,
    killer: any,
    attackerInfo?: any,
    world?: any,
  ): void {
    if (victim.isDestroyed && !victim.isCrashing) return;
    if (!killer.isTechno()) return;
    if (killer.rules.dontScore || killer.rules.insignificant) return;
    const valid =
      (attackerInfo &&
        (attackerInfo.warhead.rules.temporal ||
          (attackerInfo.warhead.rules.parasite && victim.rules.organic))) ||
      !world.areFriendly(victim, killer);
    if (!valid) return;
    if (this.veteranLevel >= this.veteranRules.veteranCap) return;
    if (this.gainXP(killer.rules.cost * (killer.veteranLevel + 1))) {
      this.handlePromotion(victim, world);
    }
  }

  /** 按相对比例加经验（floor(ratio×thresh)）。 */
  setRelativeXP(ratio: number): void {
    this.gainXP(Math.floor(ratio * this.promotionThresh));
  }

  /**
   * 累加经验；若达到阈值则按可跨级数晋升（封顶 veteranCap），
   * 扣除已消耗经验并 setVeteranLevel。返回是否发生晋升。
   */
  gainXP(amount: number): boolean {
    this.xp += amount;
    if (this.xp >= this.promotionThresh) {
      const newLevel = Math.min(
        this.veteranLevel + Math.floor(this.xp / this.promotionThresh),
        this.veteranRules.veteranCap,
      );
      const delta = newLevel - this.veteranLevel;
      if (delta) {
        this.xp -= delta * this.promotionThresh;
        this.setVeteranLevel(newLevel);
        return true;
      }
    }
    return false;
  }

  /** 直接晋升 levels 级（封顶 cap），成功则 handlePromotion。 */
  promote(levels: number, world: any): void {
    const target = Math.min(this.veteranLevel + levels, this.veteranRules.veteranCap);
    if (target - this.veteranLevel) {
      this.setVeteranLevel(target);
      this.handlePromotion(this.gameObject, world);
    }
  }

  /** 是否已达等级上限。 */
  isMaxLevel(): boolean {
    return this.veteranLevel === this.veteranRules.veteranCap;
  }

  /** 是否 Elite 级。 */
  isElite(): boolean {
    return this.veteranLevel === VeteranLevel.Elite;
  }

  /** 设置等级；升到 Elite 时切换 armedTrait 精英武器。 */
  setVeteranLevel(level: number): void {
    this.veteranLevel = level;
    if (this.veteranLevel === VeteranLevel.Elite) {
      this.gameObject.armedTrait?.toggleEliteWeapons(true);
    }
  }

  /**
   * 晋升副作用：按 VeteranAbility 逐项解锁能力（幂等，已有则跳过），
   * 最后派发 UnitPromoteEvent。
   */
  handlePromotion(object: any, world: any): void {
    if (
      this.hasVeteranAbility(VeteranAbility.SELF_HEAL) &&
      !object.traits.find(SelfHealingTrait)
    ) {
      world.addObjectTrait(object, new SelfHealingTrait());
    }
    if (this.hasVeteranAbility(VeteranAbility.CLOAK) && !object.cloakableTrait) {
      object.cloakableTrait = new CloakableTrait(object, world.rules.general.cloakDelay);
      world.addObjectTrait(object, object.cloakableTrait);
    }
    if (this.hasVeteranAbility(VeteranAbility.EXPLODES) && !object.explodes) {
      object.explodes = true;
      if (!object.armedTrait) {
        object.armedTrait = new ArmedTrait(object, world.rules);
        world.addObjectTrait(object, object.armedTrait);
      }
    }
    if (this.hasVeteranAbility(VeteranAbility.RADAR_INVISIBLE) && !object.radarInvisible) {
      object.radarInvisible = true;
    }
    if (this.hasVeteranAbility(VeteranAbility.SENSORS) && !object.sensorsTrait) {
      object.sensorsTrait = new SensorsTrait();
      world.addObjectTrait(object, object.sensorsTrait);
    }
    if (object.isInfantry() && this.hasVeteranAbility(VeteranAbility.FEARLESS)) {
      object.suppressionTrait?.disable();
    }
    if (this.hasVeteranAbility(VeteranAbility.C4) && !object.c4) {
      object.c4 = true;
    }
    if (this.hasVeteranAbility(VeteranAbility.GUARD_AREA) && !object.defaultToGuardArea) {
      object.defaultToGuardArea = true;
      if (object.unitOrderTrait.isIdle()) object.resetGuardModeToIdle();
    }
    if (this.hasVeteranAbility(VeteranAbility.CRUSHER) && !object.crusher) {
      object.crusher = true;
    }
    world.events.dispatch(new UnitPromoteEventModule.UnitPromoteEvent(object));
  }

  /** 视野等级倍率。 */
  getVeteranSightMultiplier(): number {
    return this.getVeteranAbilityMultiplier(VeteranAbility.SIGHT);
  }

  /** 速度等级倍率。 */
  getVeteranSpeedMultiplier(): number {
    return this.getVeteranAbilityMultiplier(VeteranAbility.FASTER);
  }

  /** 装甲等级倍率。 */
  getVeteranArmorMultiplier(): number {
    return this.getVeteranAbilityMultiplier(VeteranAbility.STRONGER);
  }

  /** 火力等级倍率。 */
  getVeteranDamageMultiplier(): number {
    return this.getVeteranAbilityMultiplier(VeteranAbility.FIREPOWER);
  }

  /** 射速等级倍率。 */
  getVeteranRofMultiplier(): number {
    return this.getVeteranAbilityMultiplier(VeteranAbility.ROF);
  }

  /**
   * 是否拥有某能力：Veteran 级查 veteranAbilities，
   * Elite 级查 eliteAbilities（Elite 同时视为拥有 Veteran 集）。
   */
  hasVeteranAbility(ability: number): boolean {
    return (
      (this.veteranLevel === VeteranLevel.Veteran &&
        this.gameObject.rules.veteranAbilities.has(ability)) ||
      (this.veteranLevel >= VeteranLevel.Elite &&
        this.gameObject.rules.eliteAbilities.has(ability))
    );
  }

  /** 有能力则返回规则倍率，否则 1。 */
  getVeteranAbilityMultiplier(ability: number): number {
    let mult = 1;
    if (
      (this.veteranLevel === VeteranLevel.Veteran &&
        this.gameObject.rules.veteranAbilities.has(ability)) ||
      (this.veteranLevel >= VeteranLevel.Elite &&
        this.gameObject.rules.eliteAbilities.has(ability))
    ) {
      mult = this.getVeteranRulesMultiplier(ability);
    }
    return mult;
  }

  /** Ability → veteranRules 字段映射；未知能力 throw。 */
  getVeteranRulesMultiplier(ability: number): number {
    switch (ability) {
      case VeteranAbility.FASTER:
        return this.veteranRules.veteranSpeed;
      case VeteranAbility.STRONGER:
        return this.veteranRules.veteranArmor;
      case VeteranAbility.FIREPOWER:
        return this.veteranRules.veteranCombat;
      case VeteranAbility.ROF:
        return this.veteranRules.veteranROF;
      case VeteranAbility.SIGHT:
        return this.veteranRules.veteranSight;
      default:
        throw new Error("Unhandled VeteranAbility " + ability);
    }
  }

  /** 释放宿主引用。 */
  dispose(): void {
    this.gameObject = undefined;
  }
}
