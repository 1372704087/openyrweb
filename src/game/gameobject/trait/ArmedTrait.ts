/**
 * ArmedTrait — 武器管理 trait（武器槽选择/精英切换/开火 tick/死亡武器）。
 *
 * 每个 techno 挂载一个，负责：
 *  - 武器槽选择：按规则组装主/副/死亡武器（Weapon.factory），精英切换
 *    时重建（ElitePrimary/EliteSecondary/EliteOccupyWeapon）；
 *  - 特殊武器（WeaponN/EliteWeaponN 扩展槽）：盖特机炮按阶段切换对空
 *    +对地武器对，普通特殊武器按索引切换；
 *  - 驻楼/敞开运输车乘员武器 tick 同步；
 *  - 死亡武器：阵亡时自动开火（时间抹除/运输车内自爆车辆等例外）；
 *  - 警戒范围：guardWeaponRangeOverride 或主副武器最大射者与 guardRange
 *    取大再 clamp 到 15。
 *
 * 由 game/gameobject/trait/ArmedTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as WeaponModule from "game/Weapon"; // 已转换
import { WeaponType } from "game/WeaponType"; // 已转换
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as NotifyDestroyModule from "game/gameobject/trait/interface/NotifyDestroy"; // 已转换
import * as VeteranLevelModule from "game/gameobject/unit/VeteranLevel"; // 已转换
import { isNotNullOrUndefined } from "util/typeGuard";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ArmedTrait {
  gameObject: any;
  rules: any;
  specialWeaponIndex = 0;
  /** 盖特/特殊武器的 (阶段,精英) 缓存——复用 Weapon 实例保持冷却/连发状态。 */
  _specialWeaponCache = new Map();
  primaryWeapon: any;
  secondaryWeapon: any;
  occupyWeapon: any;
  deathWeapon: any;
  guardWeaponRangeOverride: any;

  constructor(gameObject: any, rules: any) {
    this.gameObject = gameObject;
    this.rules = rules;
    this.specialWeaponIndex = 0;
    this._specialWeaponCache = new Map();
    const isElite = gameObject.veteranLevel === VeteranLevelModule.VeteranLevel.Elite;
    if (gameObject.rules.weaponCount) {
      if (gameObject.rules.isGattling) {
        this.selectGattlingStage(0, isElite);
        this.guardWeaponRangeOverride = Math.max(this.primaryWeapon?.range || 0, this.secondaryWeapon?.range || 0);
      } else {
        this.selectSpecialWeapon(0, isElite);
        this.guardWeaponRangeOverride = this.primaryWeapon?.range;
      }
    } else {
      this.selectStandardWeapons(isElite);
    }
  }

  /** 组装标准武器槽：主/副/驻楼/死亡武器（精英版优先）。 */
  selectStandardWeapons(isElite = false): void {
    const object = this.gameObject;
    const primaryName = (isElite && object.rules.elitePrimary) || object.rules.primary;
    if (primaryName) {
      const flh = isElite ? object.art.elitePrimaryFireFlh : object.art.primaryFireFlh;
      this.primaryWeapon = WeaponModule.Weapon.factory(primaryName, WeaponType.Primary, object, this.rules, flh);
    } else {
      this.primaryWeapon = undefined;
    }
    // OccupyWeapon/EliteOccupyWeapon（原版 YR）：驻楼步兵使用的武器，
    // 未写时回落主武器；精英切换时一并重建。
    const occupyName = (isElite && object.rules.eliteOccupyWeapon) || object.rules.occupyWeapon;
    this.occupyWeapon = occupyName
      ? WeaponModule.Weapon.factory(
          occupyName,
          WeaponType.Primary,
          object,
          this.rules,
          isElite ? object.art.elitePrimaryFireFlh : object.art.primaryFireFlh,
        )
      : undefined;
    const secondaryName = (isElite && object.rules.eliteSecondary) || object.rules.secondary;
    if (secondaryName) {
      const flh = isElite ? object.art.eliteSecondaryFireFlh : object.art.secondaryFireFlh;
      this.secondaryWeapon = WeaponModule.Weapon.factory(secondaryName, WeaponType.Secondary, object, this.rules, flh);
    } else {
      this.secondaryWeapon = undefined;
    }
    // 死亡武器：explodes 或 crashable 时组装，弹头优先级 DeathWeapon →
    // 副武器名 → 主武器名 → [CombatDamage]DeathWeapon。
    if (object.rules.explodes || object.crashableTrait) {
      const deathName =
        object.rules.deathWeapon ||
        (!!object.crashableTrait && this.secondaryWeapon?.rules.name) ||
        this.primaryWeapon?.rules.name ||
        this.rules.combatDamage.deathWeapon;
      this.deathWeapon = WeaponModule.Weapon.factory(deathName, WeaponType.DeathWeapon, object, this.rules);
    }
  }

  /** 缓存特殊武器：按 (索引, 精英) 缓存避免盖特阶段切换时重置冷却。 */
  _getCachedSpecialWeapon(index: number, isElite = false): any {
    const object = this.gameObject;
    const weaponCount = object.rules.weaponCount;
    if (weaponCount < 1) throw new Error(`Object "${object.name}" doesn't support special weapons`);
    if (weaponCount - 1 < index) throw new RangeError(`Weapon index ${index} out of bounds (max ${weaponCount}) for object ` + object.name);
    const cacheKey = index + "_" + (isElite ? 1 : 0);
    const cached = this._specialWeaponCache.get(cacheKey);
    if (cached && cached.name) return cached.weapon;
    const weaponName = (isElite && object.rules.getEliteWeaponAtIndex(index)) || object.rules.getWeaponAtIndex(index);
    if (!weaponName) throw new Error(`Missing weapon at index ${index} for object "${object.name}"`);
    const flh = object.art.getSpecialWeaponFlh(index);
    const weapon = WeaponModule.Weapon.factory(weaponName, WeaponType.Primary, object, this.rules, flh);
    this._specialWeaponCache.set(cacheKey, { name: weaponName, weapon });
    return weapon;
  }

  /** 切换特殊武器（WeaponN 扩展槽）；同步死亡武器（仅自爆弹头时挂载）。 */
  selectSpecialWeapon(index: number, isElite = false): void {
    const object = this.gameObject;
    this.primaryWeapon = this._getCachedSpecialWeapon(index, isElite);
    this.secondaryWeapon = undefined;
    this.specialWeaponIndex = index;
    this.deathWeapon = this.primaryWeapon.rules.suicide
      ? WeaponModule.Weapon.factory(object.rules.deathWeapon || this.primaryWeapon.name, WeaponType.DeathWeapon, object, this.rules)
      : undefined;
  }

  /**
   * 切换盖特机炮阶段：每阶段有一对武器（对地 stage×2、对空 stage×2+1）。
   * 武器数量不足时抛 RangeError。
   */
  selectGattlingStage(stage: number, isElite = false): void {
    const object = this.gameObject;
    const weaponCount = object.rules.weaponCount;
    if (weaponCount < 2) throw new Error(`Object "${object.name}" doesn't support gattling weapons`);
    const groundIndex = stage * 2;
    const airIndex = groundIndex + 1;
    if (weaponCount - 1 < airIndex)
      throw new RangeError(`Gattling stage ${stage} weapon pair exceeds available weapons (max ${weaponCount}) for object ` + object.name);
    this.specialWeaponIndex = stage;
    this.primaryWeapon = this._getCachedSpecialWeapon(groundIndex, isElite);
    this.secondaryWeapon = this._getCachedSpecialWeapon(airIndex, isElite);
    this.deathWeapon =
      this.primaryWeapon.rules.suicide || this.secondaryWeapon.rules.suicide
        ? WeaponModule.Weapon.factory(
            object.rules.deathWeapon || this.primaryWeapon.rules.name || this.secondaryWeapon.rules.name,
            WeaponType.DeathWeapon,
            object,
            this.rules,
          )
        : undefined;
  }

  /** 精英切换：按武器体系分派到对应的 select 方法。 */
  toggleEliteWeapons(isElite: boolean): void {
    if (this.gameObject.rules.weaponCount) {
      if (this.gameObject.rules.isGattling) this.selectGattlingStage(this.specialWeaponIndex, isElite);
      else this.selectSpecialWeapon(this.specialWeaponIndex, isElite);
    } else {
      this.selectStandardWeapons(isElite);
    }
  }

  getSpecialWeaponIndex(): number {
    return this.specialWeaponIndex;
  }

  /**
   * 警戒扫描范围：优先 guardWeaponRangeOverride，否则取主/副武器中
   * 匹配目标类型或 NeverUse 武器的最大射程；驻楼建筑用驻员武器射程；
   * 下限 guardRange，上限 15 格（min(15, 2×range − 1)）。
   */
  computeGuardScanRange(target: any): number {
    let range =
      this.guardWeaponRangeOverride ??
      [this.primaryWeapon, this.secondaryWeapon]
        .filter((weapon) => weapon === target || weapon?.rules.neverUse)
        .reduce((max, weapon) => Math.max(max, weapon.range), 0);
    // 驻楼建筑（自身无武器）从驻员武器推导警戒半径——原版 YR 行为。
    if (!range && this.gameObject.isBuilding() && this.gameObject.garrisonTrait?.isOccupied()) {
      for (const occupant of this.gameObject.garrisonTrait.units) {
        const occWeapon = occupant.armedTrait?.getGarrisonWeapon();
        if (occWeapon && occWeapon.range > range) range = occWeapon.range;
      }
    }
    range = Math.max(range, this.gameObject.rules.guardRange);
    return Math.min(15, 2 * range - 1);
  }

  /** 敞开运输车内乘员使用的武器（OpenTransportWeapon 键控制主/副/默认）。 */
  getOpenToppedWeapon(): any {
    if (this.gameObject.rules.openTransportWeapon > 0 && this.secondaryWeapon) return this.secondaryWeapon;
    return this.primaryWeapon;
  }

  /** 驻楼武器（OccupyWeapon 优先，回落主武器）。 */
  getGarrisonWeapon(): any {
    return this.occupyWeapon || this.primaryWeapon;
  }

  /** 部署开火武器：DeployFireWeapon 指向副武器但副武器不可用时回落主武器。 */
  getDeployFireWeapon(): any {
    if (this.gameObject.rules.deployFire) {
      if (
        this.gameObject.rules.deployFireWeapon === WeaponType.Primary ||
        this.secondaryWeapon?.rules.neverUse
      ) {
        return this.primaryWeapon;
      }
      return this.secondaryWeapon;
    }
    return undefined;
  }

  /** 是否装备了指定武器（含驻楼乘员武器和敞开运输车乘员武器）。 */
  isEquippedWithWeapon(weapon: any): boolean {
    if ([this.primaryWeapon, this.secondaryWeapon].includes(weapon)) return true;
    const object = this.gameObject;
    if (object && object.garrisonTrait && object.garrisonTrait.isOccupied()) {
      for (const occupant of object.garrisonTrait.units) {
        if (occupant.armedTrait?.getGarrisonWeapon() === weapon) return true;
      }
    }
    if (object && object.transportTrait && object.rules.openTopped && object.transportTrait.units.length) {
      for (const passenger of object.transportTrait.units) {
        if (passenger.armedTrait?.getOpenToppedWeapon() === weapon) return true;
      }
    }
    return false;
  }

  /** 可用武器列表（主 + 副，过滤 undefined）。 */
  getWeapons(): any[] {
    return [this.primaryWeapon, this.secondaryWeapon].filter(isNotNullOrUndefined);
  }

  /** 每 tick：推进主/副武器冷却 + 驻楼/敞开运输乘员武器冷却。 */
  [NotifyTickModule.NotifyTick.onTick](): void {
    if (this.primaryWeapon) this.primaryWeapon.tick();
    if (this.secondaryWeapon) this.secondaryWeapon.tick();
    const object = this.gameObject;
    // 驻楼乘员武器冷却同步（OpenTransportWeapon 选中的武器）。
    if (object && object.garrisonTrait && object.garrisonTrait.isOccupied()) {
      for (const occupant of object.garrisonTrait.units) {
        const garrisonWeapon = occupant.armedTrait?.getGarrisonWeapon();
        if (garrisonWeapon) garrisonWeapon.tick();
      }
    }
    // 敞开运输车乘员武器冷却同步。
    if (object && object.transportTrait && object.rules.openTopped && object.transportTrait.units.length) {
      for (const passenger of object.transportTrait.units) {
        const openToppedWeapon = passenger.armedTrait?.getOpenToppedWeapon();
        if (openToppedWeapon) openToppedWeapon.tick();
      }
    }
  }

  /** 死亡武器开火：目标死亡时如果挂载了死亡武器则自动开火。 */
  [NotifyDestroyModule.NotifyDestroy.onDestroy](object: any, world: any, attacker: any): void {
    if (
      !this.deathWeapon ||
      attacker?.weapon?.warhead.rules.temporal ||
      (object.crashableTrait && !object.isCrashing) ||
      (attacker?.obj?.isVehicle() && attacker.weapon?.rules.suicide && attacker.obj.transportTrait?.units.find((u: any) => u === object))
    ) {
      return;
    }
    this.deathWeapon.fire(world.createTarget(object, object.tile), world);
  }

  dispose(): void {
    this.gameObject = undefined;
    this.primaryWeapon = undefined;
    this.secondaryWeapon = undefined;
    this.occupyWeapon = undefined;
    this.deathWeapon = undefined;
  }
}
