/**
 * Weapon — 武器运行时实例（规则 + 弹头 + 弹体 + 目标判定的聚合体）。
 *
 * 一个 Techno 的每个武器槽（主/副/死亡武器）各持有一个 Weapon 实例，
 * 负责射击的全生命周期：
 *  - 冷却（rof → cooldownTicks，含老兵/狂乱/碉堡/驻扎修正）与连发
 *    （burst：Burst=、BurstDelay= 表、连发间隔随机 3-5 tick）；
 *  - 射程计算：建筑副武器取主武器射程下限；坦克碉堡/敞开运输车提供
 *    射程加成；驻楼步兵射程被 OccupyWeaponRange 固定覆盖；
 *  - fire()：从正确的"开火原点"（敞开运输车/驻楼建筑优先于悬置的
 *    步兵本体）生成/发射弹丸，处理炮口 FLH 与建筑像素偏移、分布式
 *    火力扇形轮转、空射连发齐射、limboLaunch 出仓、战雾揭示与解除
 *    隐形，最后派发 WeaponFireEvent（携带开火原点供音效定位）；
 *    空射出生体（airSpawnTrait + Spawner=yes）在无法发射时整体回收；
 *  - findSpecialWarheadName："Special" 弹头按出生体机型解析真实弹头
 *    （V3/DMisl/CMisl 或出生体主武器的弹头）。
 *
 * 静态字段（berserkROFMultiplier 等）是 [CombatDamage] 的可调参数，
 * 由 CombatDamageRules 在初始化时写入，缺省值对齐原版 YR。
 *
 * 由 game/Weapon.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as WarheadModule from "game/Warhead"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as FlhCoordsModule from "game/art/FlhCoords"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as WeaponFireEventModule from "game/event/WeaponFireEvent"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as geometryModule from "game/math/geometry"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import { ObjectRules } from "game/rules/ObjectRules";
import { Coords } from "game/Coords";
import { ObjectType } from "engine/type/ObjectType";
import { WeaponTargeting } from "game/WeaponTargeting";
import { WeaponType } from "game/WeaponType";
import { Vector2 } from "game/math/Vector2";
import { Vector3 } from "game/math/Vector3";

/* eslint-disable @typescript-eslint/no-explicit-any */
/** 弧线弹体（arcing）的基础速度刻度（换算 lepton/tick 用）。 */
const ARCING_SPEED = 50;

export class Weapon {
  /** 核弹第二阶段子弹头的弹头名。 */
  static NUKE_PAYLOAD_NAME = "NukePayload";
  /** 狂乱单位射速倍率（[CombatDamage]BerserkROFMultiplier，0.5 = 双倍射速）。 */
  static berserkROFMultiplier = 0.5;
  /** 坦克碉堡武器参数（[CombatDamage]，初始化时由 CombatDamageRules 写入）。 */
  static bunkerDamageMultiplier = 1;
  static bunkerROFMultiplier = 1;
  static bunkerWeaponRangeBonus = 0;
  /** 敞开运输车（战斗要塞）乘员开火加成（[CombatDamage]）。 */
  static openToppedRangeBonus = 2;
  static openToppedDamageMultiplier = 1.2;
  /** 驻楼步兵开火参数（[CombatDamage]；OccupyWeaponRange 直接覆盖射程）。 */
  static occupyWeaponRange = 5;
  static occupyDamageMultiplier = 1.2;
  static occupyROFMultiplier = 1.2;

  /** 武器槽类型（主/副/死亡武器）。 */
  type: WeaponType;
  gameObject: any;
  rules: any;
  warhead: any;
  projectileRules: any;
  flh: any;
  targeting: WeaponTargeting;
  cooldownTicks: number;
  burstsLeft: number;
  burstIndex: number;
  useBurstDelay: boolean;
  /** 连发时的炮口左右交替系数（±1）。 */
  lateralMuzzleMult: number;
  /** 分布式火力当前的扇形偏角（多单位环散射时轮转）。 */
  distributedFireAngle: number;

  /**
   * 工厂：从规则层解析出武器/弹头/弹体并组装目标判定引擎。
   * @param name 武器 INI 段名
   * @param weaponType 挂载槽位（主/副）
   * @param gameObject 持有者
   * @param gameRules 规则层（getWeapon/getWarhead/getProjectile）
   * @param flh 可选的炮口偏移（缺省新建 FlhCoords）
   */
  static factory(
    name: string,
    weaponType: WeaponType,
    gameObject: any,
    gameRules: any,
    flh?: any,
  ): Weapon {
    const weaponRules = gameRules.getWeapon(name);
    let warheadName = weaponRules.warhead;
    // "Special" 弹头：按出生体机型解析真实弹头名。
    if (warheadName === WarheadModule.Warhead.SPECIAL_WARHEAD_NAME)
      warheadName = Weapon.findSpecialWarheadName(weaponRules, gameObject, gameRules);
    const warhead = new WarheadModule.Warhead(gameRules.getWarhead(warheadName));
    const projectileRules = gameRules.getProjectile(weaponRules.projectile);
    const targeting = new WeaponTargeting(
      weaponType,
      projectileRules,
      weaponRules,
      warhead.rules,
      gameObject,
      gameRules.general,
    );
    return new this(
      weaponType,
      gameObject,
      weaponRules,
      warhead,
      projectileRules,
      flh || new FlhCoordsModule.FlhCoords(),
      targeting,
    );
  }

  /**
   * "Special" 弹头名解析：出生体是 V3/DMisl/CMisl 机型时取
   * [CombatDamage] 对应弹头；否则取出生体主武器的弹头。
   * 要求武器声明 Spawner=yes，且出生体声明 Spawns= 与主武器。
   */
  static findSpecialWarheadName(weaponRules: any, gameObject: any, gameRules: any): string {
    let warheadName: string;
    if (!weaponRules.spawner)
      throw new Error(`Weapon "${weaponRules.name} can't use "Special" warhead without Spawner=yes`);
    if (gameObject.rules.spawns === gameRules.general.v3Rocket.type) warheadName = gameRules.combatDamage.v3Warhead;
    else if (gameObject.rules.spawns === gameRules.general.dMisl.type) warheadName = gameRules.combatDamage.dMislWarhead;
    else if (gameObject.rules.spawns === gameRules.general.cMisl.type) warheadName = gameRules.combatDamage.cMislWarhead;
    else {
      if (!gameObject.rules.spawns)
        throw new Error(`Can't use "Special" warhead on unit type "${gameObject.name}" without "Spawns"`);
      const spawnedRules = gameRules.getObject(gameObject.rules.spawns, ObjectType.Aircraft);
      if (!spawnedRules.primary) throw new Error(`Spawned unit "${spawnedRules.name}" doesn't have a primary weapon`);
      warheadName = gameRules.getWeapon(spawnedRules.primary).warhead;
    }
    return warheadName;
  }

  /**
   * 弹丸速度（lepton/tick）：弧线弹按 50 刻度 × 0.75 固定值；
   * 无旋转率/隐形弹/激光/电弧弹 → Infinity（即时命中）；其余取规则速度。
   */
  static computeSpeed(weaponRules: any, projectileRules: any): number {
    if (projectileRules.arcing) return 0.75 * ObjectRules.iniSpeedToLeptonsPerTick(ARCING_SPEED, 100);
    if (!projectileRules.rot || projectileRules.inviso || weaponRules.isLaser || weaponRules.isElectricBolt)
      return Number.POSITIVE_INFINITY;
    return weaponRules.speed;
  }

  constructor(
    type: WeaponType,
    gameObject: any,
    rules: any,
    warhead: any,
    projectileRules: any,
    flh: any,
    targeting: WeaponTargeting,
  ) {
    this.type = type;
    this.gameObject = gameObject;
    this.rules = rules;
    this.warhead = warhead;
    this.projectileRules = projectileRules;
    this.flh = flh;
    this.targeting = targeting;
    this.cooldownTicks = 0;
    this.burstsLeft = 0;
    this.burstIndex = 0;
    this.useBurstDelay = false;
    this.lateralMuzzleMult = 1;
    this.distributedFireAngle = gameObject.rules.distributedFire && gameObject.rules.radialFireSegments ? -90 : 0;
  }

  get name(): string {
    return this.rules.name;
  }

  get minRange(): number {
    return this.rules.minimumRange;
  }

  /**
   * 有效射程（tile 单位）：
   *  - 建筑副武器（有主武器且未超载）取与主武器射程的较小值；
   *  - 坦克碉堡加成 BunkerWeaponRangeBonus（缺省 0，tile 单位，勿乘
   *    LEPTONS_PER_TILE——射程比较处会做除法）；
   *  - 敞开运输车乘员加成 OpenToppedRangeBonus（缺省 2）；
   *  - 驻楼步兵直接覆盖为 OccupyWeaponRange（缺省 5）——不同驻员射程
   *    不同，固定值避免短射程驻员让建筑停火。
   */
  get range(): number {
    let baseRange =
      this.gameObject.isBuilding() &&
      !this.gameObject.overpoweredTrait &&
      this.type === WeaponType.Secondary &&
      this.gameObject.primaryWeapon
        ? Math.min(this.gameObject.primaryWeapon.rules.range, this.rules.range)
        : this.rules.range;
    if (this.gameObject.bunkeredAt && this.gameObject.bunkeredAt.tankBunkerTrait) {
      baseRange += Weapon.bunkerWeaponRangeBonus;
    }
    // transport 回引用由 EnterTransportTask 设置、撤离/被毁时清除。
    if (this.gameObject.transport && this.gameObject.transport.rules.openTopped) {
      baseRange += Weapon.openToppedRangeBonus;
    }
    // garrisonedAt 回引用由 GarrisonBuildingTask.onEnter 设置、撤出时清除。
    if (this.gameObject.garrisonedAt) {
      baseRange = Weapon.occupyWeaponRange;
    }
    return baseRange;
  }

  get speed(): number {
    return Weapon.computeSpeed(this.rules, this.projectileRules);
  }

  /**
   * 当前射速（tick/发，向下取整）：老兵倍率 → 狂乱减半 → 碉堡倍率
   * （除法，>1 即更快）→ 驻楼倍率（除法）。
   */
  get rof(): number {
    let rof = this.rules.rof;
    if (this.gameObject.veteranTrait) rof *= this.gameObject.veteranTrait.getVeteranRofMultiplier();
    if (this.gameObject.berserkTrait?.isBerserk()) rof *= Weapon.berserkROFMultiplier;
    if (this.gameObject.bunkeredAt && this.gameObject.bunkeredAt.tankBunkerTrait) rof /= Weapon.bunkerROFMultiplier;
    if (this.gameObject.garrisonedAt) rof /= Weapon.occupyROFMultiplier;
    return Math.floor(rof);
  }

  getCooldownTicks(): number {
    return this.cooldownTicks;
  }

  expireCooldown(): void {
    this.cooldownTicks = 0;
  }

  resetCooldown(): void {
    this.cooldownTicks = this.rof;
  }

  hasBurstsLeft(): boolean {
    return this.burstsLeft > 0;
  }

  /** 连发结束：清空连发计数、重置冷却，并消耗 1 发弹药（如有弹药 trait）。 */
  resetBursts(): void {
    this.burstsLeft = 0;
    this.burstIndex = 0;
    this.resetCooldown();
    if (this.gameObject.ammoTrait && this.gameObject.ammoTrait.ammo > 0) this.gameObject.ammoTrait.ammo--;
  }

  /** 每逻辑 tick：冷却递减。 */
  tick(): void {
    if (this.cooldownTicks > 0) this.cooldownTicks--;
  }

  /** 已发射的连发序号。 */
  getBurstsFired(): number {
    return this.burstIndex;
  }

  /**
   * 开火。
   * @param target 目标描述（{obj: 目标对象, ...}）
   * @param game 游戏世界（createProjectile/limboObject/map/events 等）
   * @param damageMultiplier 伤害倍率
   *
   * 外层 guard 语义：持有者带 airSpawnTrait 且武器要求 Spawner=yes 时，
   * 先尝试准备空射出生体；准备失败（无可用存货）则本次完全不发射
   * （burst/弹丸/事件全部跳过）。
   */
  fire(target: any, game: any, damageMultiplier = 1): void {
    const shooter = this.gameObject;
    // 空射准备：仅当持有者带 airSpawnTrait 且武器要求 Spawner=yes 时执行。
    let airSpawn: any = undefined;
    let availableSpawns = 0;
    const needsAirSpawn = !!shooter.airSpawnTrait && !!this.rules.spawner;
    if (needsAirSpawn) {
      airSpawn = shooter.airSpawnTrait.prepareLaunch(shooter, target, game);
      availableSpawns = shooter.airSpawnTrait.availableSpawns;
    }
    const proceed = !needsAirSpawn || !!airSpawn;
    if (!proceed) return;

    // 开火原点：敞开运输车/驻楼建筑优先——步兵被 limbo 后自身位置已过期。
    const fireOrigin =
      shooter.transport && shooter.transport.rules.openTopped
        ? shooter.transport
        : shooter.garrisonedAt
          ? shooter.garrisonedAt
          : shooter;

    if (this.burstsLeft) {
      // 连发中：递减计数、交替炮口。
      this.burstsLeft--;
      this.burstIndex++;
      this.lateralMuzzleMult *= -1;
    } else {
      this.useBurstDelay = false;
      this.burstIndex = 0;
      if (airSpawn) {
        // 空射出生体：一次把全部存货打出。
        this.burstsLeft = availableSpawns;
      } else if (this.gameObject.isAircraft()) {
        // 飞行器也遵循 Burst=（原版 YR）；此前硬编码单发导致米格只射一枚。
        this.burstsLeft = this.rules.burst - 1;
      } else {
        this.burstsLeft = this.rules.burst - 1;
        this.useBurstDelay = true;
      }
      this.lateralMuzzleMult = 1;
    }
    // 连发间隔：空射出生体按 iniSpeed；飞行器齐射逐 tick 连发（轮次结束
    // 后 resetBursts 再计整轮 ROF）；地面单位用 BurstDelay 表或随机 3-5。
    if (this.burstsLeft > 0) {
      if (airSpawn && availableSpawns > 0) this.cooldownTicks = this.rules.iniSpeed;
      else if (this.gameObject.isAircraft()) this.cooldownTicks = 0;
      else
        this.cooldownTicks =
          this.useBurstDelay && this.gameObject.rules.burstDelay[this.burstIndex] !== undefined
            ? this.gameObject.rules.burstDelay[this.burstIndex]
            : game.generateRandomInt(3, 5);
    }
    if (!this.burstsLeft) this.resetBursts();
    // limboLaunch（伊文无人机母体）：发射后本体出仓挂起；寄生弹头且
    // 目标是可寄生载具/飞行器时标记 beingBoarded。
    if (this.rules.limboLaunch) {
      game.limboObject(this.gameObject, {
        selected: game.getUnitSelection().isSelected(this.gameObject),
        controlGroup: game.getUnitSelection().getOrCreateSelectionModel(this.gameObject).getControlGroupNumber(),
      });
      if (this.warhead.rules.parasite && (target.obj?.isVehicle() || target.obj?.isAircraft()) && target.obj.parasiteableTrait) {
        target.obj.parasiteableTrait.beingBoarded = true;
      }
    }

    // 弹丸：空射用预生成的出生体，否则现场创建。
    const projectile = airSpawn ?? game.createProjectile(this.projectileRules.name, this.gameObject, this, target, false);
    if (!projectile.isAircraft()) {
      projectile.baseDamageMultiplier =
        damageMultiplier *
        (this.gameObject.isUnit() ? this.gameObject.crateBonuses.firepower : 1) *
        (this.gameObject.bunkeredAt && this.gameObject.bunkeredAt.tankBunkerTrait ? Weapon.bunkerDamageMultiplier : 1) *
        (this.gameObject.transport && this.gameObject.transport.rules.openTopped ? Weapon.openToppedDamageMultiplier : 1) *
        (this.gameObject.garrisonedAt ? Weapon.occupyDamageMultiplier : 1);
    }
    let flh = this.flh.clone();
    // 敞开运输车乘员：用运输车的 AlternateFLH 系（每个乘员槽对应一个
    // 射孔，超配时按序号取模轮转），未配置回落运输车中心 (0,0,0)。
    if (fireOrigin !== shooter && fireOrigin.transportTrait) {
      const passengerIndex = fireOrigin.transportTrait.units.indexOf(shooter);
      if (passengerIndex >= 0) {
        const alternateFlhCount = fireOrigin.art.getAlternateFlhCount();
        flh = fireOrigin.art.getAlternateFlh(
          alternateFlhCount > 0 ? passengerIndex % alternateFlhCount : passengerIndex,
        );
      }
    }
    flh.lateral *= this.lateralMuzzleMult;
    let mapPosition = fireOrigin.position.getMapPosition();
    if (game.map.isWithinHardBounds(mapPosition)) {
      projectile.position.moveToLeptons(mapPosition);
      projectile.position.tileElevation = fireOrigin.position.tileElevation;
      // 炮口方向合成：FLH 平面分量 → 旋转炮塔朝向 + 分布火力偏角 →
      // 叠加炮塔挂点偏移。
      let muzzle = new Vector2(flh.lateral, flh.forward);
      let facing = this.getMuzzleFacing() + this.distributedFireAngle;
      muzzle = geometryModule.rotateVec2(muzzle, facing);
      let turretOffset = new Vector2(0, fireOrigin.art.turretOffset);
      turretOffset = geometryModule.rotateVec2(turretOffset, fireOrigin.direction);
      muzzle.add(turretOffset);
      // 分布式火力：每发射一次轮转一个扇区（±90° 内）。
      if (shooter.rules.radialFireSegments && shooter.rules.distributedFire) {
        const segment = Math.floor(180 / shooter.rules.radialFireSegments);
        this.distributedFireAngle = ((this.distributedFireAngle + segment + 90) % 180) - 90;
      }
      projectile.direction = facing;
      // 建筑带炮塔动画时，弹丸起点再叠加炮塔动画的屏幕偏移换算。
      if (fireOrigin.isBuilding() && fireOrigin.rules.turretAnim) {
        const animOffset = Coords.screenDistanceToWorld(fireOrigin.rules.turretAnimX, fireOrigin.rules.turretAnimY);
        const centerOffset = fireOrigin.getFoundationCenterOffset();
        projectile.position.moveByLeptons(-centerOffset.x + animOffset.x, -centerOffset.y + animOffset.y);
      }
      // 建筑自发的 Primary/SecondaryFirePixelOffset（原版 art.ini）：以
      // 建筑底面中心的屏幕像素偏移作为固定开火点（不随朝向旋转）。仅
      // 建筑本体开火时生效（驻楼/运输中的单位不走此分支）。
      if (
        fireOrigin.isBuilding() &&
        fireOrigin === shooter &&
        // fire() 内局部 flh 遮蔽了模块级 WeaponType，直接比较枚举值：
        // WeaponType.Primary = 0, WeaponType.Secondary = 1。
        (this.type === 0 || this.type === 1)
      ) {
        const pixelOffset =
          this.type === 0 ? fireOrigin.art.primaryFirePixelOffset : fireOrigin.art.secondaryFirePixelOffset;
        if (pixelOffset.length) {
          const screenOffset = Coords.screenDistanceToWorld(pixelOffset[0], 0);
          muzzle.add(new Vector2(screenOffset.x, screenOffset.y));
          // 高度修正分两种情况：
          //  - 有 FLH（光棱塔 PrimaryFireFLH=0,0,378 + DualOffset）：像素
          //    偏移只是小修正，按引擎原始 4 倍美术像素比例换算；
          //  - 无 FLH（玛雅金字塔 CAMEX01 的 "0,-80"）：锚定建筑三维中心
          //    （占位中心 + art Height 一半），Y 以 3.375 lepton/像素换算。
          const hasFlh = flh.forward !== 0 || flh.lateral !== 0 || flh.vertical !== 0;
          flh.vertical += hasFlh
            ? 4 * Coords.tileHeightToWorld(-pixelOffset[1] / (Coords.ISO_TILE_SIZE / 2))
            : Coords.tileHeightToWorld(fireOrigin.art.height) / 2 - pixelOffset[1] * 3.375;
        }
      }
      // 三维合成：平面 muzzle + FLH 竖直分量（z 取负）→ 世界偏移。
      // 注意原实现的逗号表达式语义：越界只跳过位移本身，随后的高度
      // 钳制、弹丸入场、揭示、解除隐形与事件派发照常执行。
      const worldOffset = new Vector3(muzzle.x, flh.vertical, -muzzle.y);
      const worldTarget = worldOffset.clone().add(projectile.position.worldPosition);
      if (game.map.isWithinHardBounds(worldTarget)) projectile.position.moveByLeptons3(worldOffset);
      if (projectile.tileElevation < 0) projectile.position.tileElevation = 0;
      // 出生体弹丸以 unlimbo 入场（与母体同战场），普通弹丸 spawn。
      if (projectile.isAircraft()) game.unlimboObject(projectile, projectile.position.tile);
      else game.spawnObject(projectile, projectile.position.tile);
      // 开火揭示：攻击者处于黑雾时临时揭示开火位置。
      if (this.rules.revealOnFire && target.obj?.isTechno()) {
        const shroud = game.mapShroudTrait.getPlayerShroud(target.obj.owner);
        if (shroud?.isShrouded(fireOrigin.tile, fireOrigin.tileElevation)) shroud.revealTemporarily(fireOrigin);
      }
      // 开火后解除隐形；开火事件携带"开火原点"（运输车/驻楼建筑），
      // 音效跟随原点的实时位置（乘员自身位置已冻结，可能相距很远）。
      if (this.rules.decloakToFire) this.gameObject.cloakableTrait?.uncloak(game);
      game.events.dispatch(new WeaponFireEventModule.WeaponFireEvent(this, fireOrigin));
    } else if (airSpawn) {
      // 越界（仅空射路径可能）：回收出生体。
      airSpawn.owner.removeOwnedObject(airSpawn);
      airSpawn.dispose();
    }
  }

  /**
   * 炮口朝向：敞开运输车用运输车朝向（有炮塔用炮塔朝向，turretSpins
   * 时直接用车身方向）；驻楼步兵用建筑朝向（建筑不可转向，原版行为）；
   * 其余用持有者自身朝向。
   */
  getMuzzleFacing(): number {
    const shooter = this.gameObject;
    const origin =
      shooter.transport && shooter.transport.rules.openTopped
        ? shooter.transport
        : shooter.garrisonedAt
          ? shooter.garrisonedAt
          : shooter;
    let facing;
    if (!origin.isInfantry() && !origin.isAircraft() && (origin.isBuilding() || origin.isVehicle()) && origin.turretTrait) {
      facing = origin.rules.turretSpins ? origin.direction : origin.turretTrait.facing;
    } else {
      facing = origin.direction;
    }
    return facing;
  }
}
