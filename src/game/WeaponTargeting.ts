/**
 * WeaponTargeting — 武器目标合法性判定引擎。
 *
 * 回答一个问题："这把武器此刻能否瞄准那个目标？"
 * 构造时按武器/弹体/弹头/持有者的属性组合，把一组判定谓词依次压入
 * targetChecks 列表；canTarget() 逐条执行，全部通过才算合法。
 *
 * 判定链的组装逻辑（initConditions）：
 *  1. 弹体非对地（isAntiAir only）→ 目标必须存在；
 *  2. 光棱塔（持有者=棱镜塔且用副武器）→ 仅允许同阵营已供电的棱镜塔
 *     （支持折射链起点）；
 *  3. electricAssault 弹头 → 仅允许同阵营带电力建筑的强攻类目标；
 *  4. drainWeapon（吸血武器，如疯狂伊文无人机母体）→ 仅允许敌方
 *     Drainable=yes 建筑；
 *  5. 负伤害（治疗武器，如医疗兵）→ 仅允许己方受损的非同类单位；
 *  6. 普通武器 → 敌我判定（攻击光标友好方/拆弹特例）、隐形判定
 *     （共享情报豁免）、limboLaunch 寄生锁定、伊文炸弹不重复挂、
 *     寄生目标类别、心灵控制须有 mindControllableTrait、时间武器除外
 *     的超时空无敌判定、natural 单位不打 unnatural 目标；
 *  7. 恒定追加区域判定 canTargetZone（对空/对地/对海策略）。
 *
 * 由 game/WeaponTargeting.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 */
import { StanceType } from "game/gameobject/infantry/StanceType";
import { ZoneType } from "game/gameobject/unit/ZoneType";
import { LandTargeting } from "game/type/LandTargeting";
import * as LandTypeModule from "game/type/LandType"; // 已转换
import { NavalTargeting } from "game/type/NavalTargeting";
import { SpeedType } from "game/type/SpeedType";
import { WeaponType } from "game/WeaponType";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class WeaponTargeting {
  weaponType: WeaponType;
  projectileRules: any;
  weaponRules: any;
  warheadRules: any;
  gameObject: any;
  generalRules: any;
  targetChecks: Function[];

  constructor(
    weaponType: WeaponType,
    projectileRules: any,
    weaponRules: any,
    warheadRules: any,
    gameObject: any,
    generalRules: any,
  ) {
    this.weaponType = weaponType;
    this.projectileRules = projectileRules;
    this.weaponRules = weaponRules;
    this.warheadRules = warheadRules;
    this.gameObject = gameObject;
    this.generalRules = generalRules;
    this.targetChecks = [];
    this.initConditions();
  }

  /** 组装判定谓词链（见类注释的 1-7 条）。 */
  initConditions(): void {
    // 1. 纯对空弹体：必须指定目标。
    if (!this.projectileRules.isAntiGround) this.targetChecks.push((target) => !!target);
    const prismType = this.generalRules.prism.type;
    if (this.gameObject.name === prismType && this.weaponType === WeaponType.Secondary) {
      // 2. 光棱塔副武器：只瞄准同阵营、已就绪（供电）的棱镜塔——折射链。
      this.targetChecks.push(
        (target, _game, _a, _b, supportFlag) =>
          !(!supportFlag || !target?.isBuilding() || target.name !== prismType || target.owner !== this.gameObject.owner),
      );
    } else if (this.warheadRules.electricAssault) {
      // 3. 电击突袭弹头（磁电坦克对建筑）：强攻标志齐全 + 目标是同阵营带
      //    Overpowered 特性的建筑。
      this.targetChecks.push(
        (target, _game, _a, forceFlagA, forceFlagB) =>
          !(
            (!forceFlagA && !forceFlagB) ||
            !target?.isBuilding() ||
            !target.overpoweredTrait ||
            target.owner !== this.gameObject.owner
          ),
      );
    } else if (this.weaponRules.drainWeapon) {
      // 4. 吸血武器：仅敌方 Drainable 建筑，且未被其他单位正在抽取。
      this.targetChecks.push(
        (target, _tile, game) =>
          !!(
            target?.isBuilding() &&
            target.rules?.drainable &&
            !game.areFriendly(target, this.gameObject) &&
            (!target.drainedBy || target.drainedBy === this.gameObject)
          ),
      );
    } else if (this.weaponRules.damage < 0) {
      // 5. 负伤害（治疗）：仅己方受损单位，且不跨飞行器/地面类别。
      this.targetChecks.push(
        (target, _tile, game) =>
          !!(
            target !== this.gameObject &&
            target?.isUnit() &&
            game.areFriendly(target, this.gameObject) &&
            target.healthTrait.health < 100 &&
            this.gameObject.isAircraft() === target.isAircraft()
          ),
      );
    } else {
      // 6. 常规武器：敌我/强攻/拆弹/隐形/寄生/心灵/时间/自然判定。
      if (this.gameObject.rules.attackCursorOnFriendlies || this.warheadRules.bombDisarm) {
        // 允许指向友方（攻击光标友好方），或拆弹武器仅指向带伊文炸弹的目标。
        this.targetChecks.push(
          (target, _game, _a, _b, forceFlag) =>
            !forceFlag &&
            !!(!this.warheadRules.bombDisarm || (target?.isTechno() && target.tntChargeTrait?.hasCharge())),
        );
      } else {
        // 禁止把非心灵控制武器指向己方 techno（非强制攻击时）。
        this.targetChecks.push(
          (target, _tile, game, forceFlag) =>
            !((!forceFlag || this.warheadRules.mindControl) && target?.isTechno() && game.areFriendly(target, this.gameObject)),
        );
      }
      // 隐形单位不可被瞄准，除非与持有者共享情报（盟友/观察者）。
      this.targetChecks.push(
        (target, _tile, game) =>
          !(
            target?.isTechno() &&
            target.cloakableTrait?.isCloaked() &&
            !game.alliances.haveSharedIntel(this.gameObject.owner, target.owner)
          ),
      );
      // limboLaunch（伊文无人机母体）：强制发射时不可选已被寄生的载具/飞行器。
      if (this.weaponRules.limboLaunch)
        this.targetChecks.push(
          (target, _game, _a, _b, forceFlag) =>
            !(forceFlag && target && (target.isVehicle() || target.isAircraft()) && target.parasiteableTrait?.isInfested()),
        );
      // 伊文炸弹：目标必须是尚未挂炸弹的 techno。
      if (this.warheadRules.ivanBomb)
        this.targetChecks.push((target) => !(!target?.isTechno() || !target.tntChargeTrait || target.tntChargeTrait.hasCharge()));
      // 寄生（恐怖机器人）：可寄生载具/飞行器、步兵，或强制攻击空地。
      if (this.warheadRules.parasite)
        this.targetChecks.push(
          (target, _game, _a, forceFlag) =>
            !!((!target && forceFlag) || target?.isInfantry() || ((target?.isVehicle() || target?.isAircraft()) && target.parasiteableTrait)),
        );
      // 心灵控制：目标须具备 mindControllableTrait。
      if (this.warheadRules.mindControl)
        this.targetChecks.push((target) => !(!target?.isTechno() || !target.mindControllableTrait));
      // 非时间武器：不可瞄准超时空无敌（相位转移中）的目标。
      if (!this.warheadRules.temporal)
        this.targetChecks.push(
          (target, _game, _a, _b, forceFlag) => !(forceFlag && target?.isTechno() && target.warpedOutTrait.isInvulnerable()),
        );
      // natural 单位（恐龙等）不打 unnatural 单位（尤里变异体）。
      if (this.gameObject.rules.natural)
        this.targetChecks.push((target) => !target?.isTechno() || !target.rules.unnatural);
    }
    // 7. 区域合法性（对空/对海/对陆）恒定追加。
    this.targetChecks.push((target, tile) => this.canTargetZone(target, tile));
  }

  /** 依次执行全部判定谓词。 */
  canTarget(target: any, tile: any, game: any, forceAttack: boolean, supportFlag: boolean): boolean {
    return this.targetChecks.every((check) => check(target, tile, game, forceAttack, supportFlag));
  }

  /**
   * 区域合法性：对空目标看弹体 isAntiAir；对地面/海面目标按 tile 的
   * 地表类型分流到陆地/海军策略；空降中的步兵按对空处理。
   */
  canTargetZone(target: any, tile: any): boolean {
    let zone;
    if (target?.isUnit()) {
      // 空降中且高度 >2 的步兵：视作空中目标，仅对空弹体可打
      //（对地弹体或副武器不解）。
      if (target?.isInfantry() && target.stance === StanceType.Paradrop && 2 < target.tileElevation)
        return (
          this.projectileRules.isAntiAir &&
          (this.projectileRules.isAntiGround || this.weaponType === WeaponType.Secondary)
        );
      if (target.zone === ZoneType.Air) return this.projectileRules.isAntiAir;
      // 副武器专属对空（主武器无对空能力）：副武器不可打地面目标。
      if (
        this.weaponType === WeaponType.Secondary &&
        this.projectileRules.isAntiAir &&
        !this.projectileRules.isAntiGround
      )
        return false;
      zone = target.zone;
    } else {
      // 地面点目标：按 tile 地表类型归入水区/陆区。
      zone = tile.landType === LandTypeModule.LandType.Water ? ZoneType.Water : ZoneType.Ground;
    }
    return zone === ZoneType.Water
      ? this.canTargetNaval(this.gameObject.rules.navalTargeting, this.gameObject, target, this.weaponType)
      : this.canTargetLand(this.gameObject.rules.landTargeting, this.weaponType);
  }

  /** 陆地目标策略。 */
  canTargetLand(landTargeting: LandTargeting, weaponType: WeaponType): boolean {
    switch (landTargeting) {
      case LandTargeting.LandOk:
        return true;
      case LandTargeting.LandNotOk:
        return false;
      case LandTargeting.LandSecondary:
        return weaponType === WeaponType.Secondary;
      default:
        throw new Error(`Unhandled LandTargeting value "${landTargeting}"`);
    }
  }

  /** 海军/水下目标策略（含原版 YR 的 NavalAllEquivalent 等价值）。 */
  canTargetNaval(navalTargeting: NavalTargeting, self: any, target: any, weaponType: WeaponType): boolean {
    switch (navalTargeting) {
      case NavalTargeting.UnderwaterNever:
        // 不可打水下：浮出水面的潜艇仍可打。
        return !target || !(target.isVehicle() && target.submergibleTrait?.isSubmerged());
      case NavalTargeting.UnderwaterSecondary:
        // 对潜艇用副武器（未出生体）；其余目标用主武器。
        return target && target.isVehicle() && target.submergibleTrait && !self.rules.spawned
          ? weaponType === WeaponType.Secondary
          : weaponType === WeaponType.Primary;
      case NavalTargeting.UnderwaterOnly:
        // 只能打水下潜艇。
        return !!(target && target.isVehicle() && target.submergibleTrait);
      case NavalTargeting.OrganicSecondary:
        // 有机目标（生物）用副武器。
        return target?.isTechno() && target.rules.organic ? weaponType === WeaponType.Secondary : weaponType === WeaponType.Primary;
      case NavalTargeting.SealSpecial:
        // 海军特例（海豹）：对海军建筑/浮行载具用副武器。
        return target?.isTechno() &&
          target.rules.naval &&
          !target.rules.organic &&
          (target.isBuilding() || target.rules.speedType === SpeedType.Float)
          ? weaponType === WeaponType.Secondary
          : weaponType === WeaponType.Primary;
      case NavalTargeting.NavalAll:
      case NavalTargeting.NavalAllEquivalent:
        return true;
      case NavalTargeting.NavalNone:
        return false;
      default:
        throw new Error(`Unhandled NavalTargeting value "${navalTargeting}"`);
    }
  }
}
