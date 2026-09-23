/**
 * Techno — 所有"受战斗规则约束"对象的基类（步兵/载具/飞行器/建筑）。
 *
 * 在 GameObject 之上叠加战斗语义：
 *  - 规则标志快照：explodes（阵亡自爆）/ radarInvisible / c4 / crusher /
 *    omniCrusher / defaultToGuardArea / purchaseValue（卖价基准）；
 *  - 经由可选 trait 转发的便捷读取器：武器（armedTrait）、弹药
 *    （ammoTrait）、视野与经验等级（veteranTrait）——trait 由具体子类的
 *    工厂按规则挂载，未挂载时读取器安全降级（undefined/默认值）；
 *  - 碾压判定 canCrushObject()：实现原版"谁碾谁"规则（见方法注释）；
 *  - 超时空（warp）状态下的 tick 分流：被传送出战场时只驱动声明了
 *    ticksWhenWarpedOut 的 trait。
 *  - 碾压俯仰（原版 YR TiltsWhenCrushes/IsTilter）：碾压过程中车头上抬
 *    的动画状态（crushTilt* 三字段），渲染层每 tick 向目标值缓动。
 *
 * 由 game/gameobject/Techno.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { GameObject } from "game/gameobject/GameObject";
import { TechnoRules } from "game/rules/TechnoRules";
import { VeteranLevel } from "game/gameobject/unit/VeteranLevel";
import { NotifyTick } from "game/gameobject/trait/interface/NotifyTick";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class Techno extends GameObject {
  /** 规则快照：阵亡时自爆。 */
  explodes: boolean;
  radarInvisible: boolean;
  c4: boolean;
  /** 可碾压他人（Crusher=yes）。 */
  crusher: boolean;
  /** 强化碾压（OmniCrusher=yes，可碾非常规可碾目标）。 */
  omniCrusher: boolean;
  /** 碾压俯仰当前角度（度，正值 = 车头沿局部 X 轴抬起；每 tick 向目标缓动）。 */
  crushTilt: number;
  crushTiltTarget: number;
  crushTiltTimer: number;
  /** 强制攻击状态：AttackTask 强攻可碾目标时置位，允许碾过友军单位/墙。 */
  isForceAttacking: boolean;
  /** 当前攻击目标引用。 */
  currentAttackTarget: any;
  defaultToGuardArea: boolean;
  /** 当前警戒模式（初始取规则缺省，可被玩家指令切换）。 */
  guardMode: boolean;
  /** 警戒区域（guardMode 开启时的驻守地点）。 */
  guardArea: any;
  /** 变卖基准价（= 造价，实际卖价再乘折扣）。 */
  purchaseValue: number;
  /** 以下 trait 由子类工厂按规则挂载（未转换期类型为 any）。 */
  armedTrait: any;
  ammoTrait: any;
  veteranTrait: any;
  warpedOutTrait: any;
  attackTrait: any;

  constructor(type: any, name: string, rules: TechnoRules, art: any) {
    super(type, name, rules, art);
    this.explodes = this.rules.explodes;
    this.radarInvisible = this.rules.radarInvisible;
    this.c4 = this.rules.c4;
    this.crusher = this.rules.crusher;
    this.omniCrusher = this.rules.omniCrusher;
    // 碾压俯仰（原版 YR TiltsWhenCrushes/IsTilter）：单位碾压目标时车头上抬。
    // 数值为角度；正值 = 沿主对象局部 X 轴抬头（引擎内验证）。crushTilt 每 tick
    // 向 crushTiltTarget 缓动，抬起与回落共用同一过渡（无瞬间跳变）。
    this.crushTilt = 0;
    this.crushTiltTarget = 0;
    this.crushTiltTimer = 0;
    // 强制攻击状态：AttackTask 强攻可碾目标期间置位。让碾压逻辑从被强攻的
    // 友军单位/墙上碾过（原版 YR：强攻友军墙/单位即驾车碾过）。
    this.isForceAttacking = false;
    this.currentAttackTarget = undefined;
    this.defaultToGuardArea = this.rules.defaultToGuardArea;
    this.guardMode = this.rules.defaultToGuardArea;
    this.purchaseValue = this.rules.cost;
  }

  /** 主武器（来自武器 trait，未挂载为 undefined）。 */
  get primaryWeapon(): any {
    return this.armedTrait?.primaryWeapon;
  }

  /** 副武器。 */
  get secondaryWeapon(): any {
    return this.armedTrait?.secondaryWeapon;
  }

  /** 当前弹药（来自弹药 trait）。 */
  get ammo(): any {
    return this.ammoTrait?.ammo;
  }

  /** 实际视野：规则视野 × 老兵视野系数（如有），上限 MAX_SIGHT。 */
  get sight(): number {
    return Math.min(
      TechnoRules.MAX_SIGHT,
      this.rules.sight * (this.veteranTrait?.getVeteranSightMultiplier() ?? 1),
    );
  }

  /** 经验等级：无经验 trait 时视为普通。 */
  get veteranLevel(): VeteranLevel {
    return this.veteranTrait?.veteranLevel ?? VeteranLevel.None;
  }

  /** 警戒模式复位为规则缺省，并清除警戒区域。 */
  resetGuardModeToIdle(): void {
    this.guardMode = this.defaultToGuardArea;
    this.guardArea = undefined;
  }

  /**
   * 碾压判定——原版 YR 的"谁碾谁"规则（ModEnc）：
   *  - Crusher=yes 可碾 Crushable=yes 的目标（步兵、墙类建筑）；
   *  - OmniCrusher=yes（要求 Crusher=yes）额外可碾 Crushable=no 的目标
   *    （载具等），但对方 OmniCrushResistant=yes 时免疫——
   *    OmniCrushResistant 优先级高于 OmniCrusher；
   *  - 非墙类建筑永远不可被碾；
   *  - 无敌目标（铁幕/力盾）永远不可被碾——原版无敌 negates 全部伤害，
   *    含碾压，碾压车只能绕行/被阻挡。
   */
  canCrushObject(target: any): boolean {
    return (
      !!this.crusher &&
      !target?.invulnerableTrait?.isActive?.() &&
      (!!target?.rules?.crushable ||
        (!!this.omniCrusher && !target?.rules?.omniCrushResistant && !(target?.isBuilding?.() && !target.rules.wall)))
    );
  }

  /** 每 tick 驱动：超时空离场状态下只走声明了 ticksWhenWarpedOut 的 trait。 */
  update(world: any): void {
    if (this.warpedOutTrait.isActive()) {
      for (const trait of this.cachedTraits.tick) {
        if (trait.ticksWhenWarpedOut) trait[NotifyTick.onTick](this, world);
      }
    } else {
      super.update(world);
    }
  }

  isTechno(): boolean {
    return true;
  }
}
