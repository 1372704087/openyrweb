/**
 * Warhead — 弹头：伤害计算与爆炸结算。
 *
 * 一次命中从 computeDamage（算出基础伤害）到 detonate（范围收集 +
 * 逐目标结算）的完整链路都在这里：
 *  - canDamage：目标是否"可被此弹头伤害"的 12 项前置检查（存活状态、
 *    超时空无敌、路径预留、区域匹配、隐形、免疫、辐射/心灵豁免、
 *    低桥桥面不可选中）；
 *  - computeDamage：卧倒减伤、装甲类型（地形固定 Wood、桥梁按桥型）、
 *    verses 威力表、老兵/箱子减伤、墙与桥的绝对摧毁/免伤规则；
 *  - inflictDamage：坦克碉堡伤害转嫁（PenetratesBunker 例外）、无限
 *    伤害取满血、NotifyAttack 广播、受击压制/逃跑、死亡分支（步兵
 *    死亡方式、毒雾、时间抹除、基因突变变狂兽人、空中单位坠毁、
 *    常规摧毁）；
 *  - detonate：以 RadialTileFinder 收集爆炸范围内的目标（建筑按"距离
 *    列表"聚合，多格建筑每个格子各算一次距离），按 cellSpread 距离
 *    衰减，结算伤害/治疗/狂乱（Chaos Drone）/磁电拖拽（Magnetron），
 *    留下辐射场、烧矿、焦痕并派发 WarheadDetonateEvent。
 *
 * 由 game/Warhead.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { DeathType } from "game/gameobject/common/DeathType";
import { StanceType } from "game/gameobject/infantry/StanceType";
import { ZoneType } from "game/gameobject/unit/ZoneType";
import * as CallbackTaskModule from "game/gameobject/task/system/CallbackTask"; // 未转换（any-shim）
import * as ScatterTaskModule from "game/gameobject/task/ScatterTask"; // 未转换（any-shim）
import * as BridgeOverlayTypesModule from "game/map/BridgeOverlayTypes"; // 未转换（any-shim）
import * as NotifyAttackModule from "game/trait/interface/NotifyAttack"; // 未转换（any-shim）
import { ArmorType } from "game/type/ArmorType";
import * as CollisionTypeModule from "game/gameobject/unit/CollisionType"; // 已转换
import * as RangeHelperModule from "game/gameobject/unit/RangeHelper"; // 未转换（any-shim）
import * as RadialTileFinderModule from "game/map/tileFinder/RadialTileFinder"; // 已转换
import { Coords } from "game/Coords";
import { lerp, clamp } from "util/math";
import * as FacingUtilModule from "game/gameobject/unit/FacingUtil"; // 已转换
import { ObjectType } from "engine/type/ObjectType";
import * as WarheadDetonateEventModule from "game/event/WarheadDetonateEvent"; // 未转换（any-shim）
import { WeaponType } from "game/WeaponType";
import * as WeaponRulesModule from "game/rules/WeaponRules"; // 未转换（any-shim）
import * as IniSectionModule from "data/IniSection"; // 未转换（any-shim）
import * as ProjectileRulesModule from "game/rules/ProjectileRules"; // 未转换（any-shim）
import * as AnimTerrainEffectModule from "game/gameobject/common/AnimTerrainEffect"; // 未转换（any-shim）
import * as ObjectAttackedEventModule from "game/event/ObjectAttackedEvent"; // 未转换（any-shim）
import * as SpecialWarheadTypeModule from "game/SpecialWarheadType"; // 未转换（any-shim）
import * as MagnetronDragTaskModule from "game/gameobject/task/MagnetronDragTask"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class Warhead {
  /** "Special" 弹头占位名（按出生体机型动态解析）。 */
  static SPECIAL_WARHEAD_NAME = "Special";
  /** 高爆弹头名。 */
  static HE_WARHEAD_NAME = "HE";

  rules: any;

  constructor(rules: any) {
    this.rules = rules;
  }

  /**
   * 目标是否可被此弹头伤害（引爆收集阶段的前置过滤）：
   * 出生体/已销毁/已摧毁/坠落中的目标跳过；超时空无敌只对时间武器
   * 有效；移动路径预留格不溅射；无血量的对象跳过；空对地错配跳过；
   * 游戏中隐形的建筑跳过；immune 单位只吃时间武器；不可相位单位免疫
   * 时间武器；辐射/心灵弹头对免疫单位无效；低桥桥面不吃地面溅射。
   */
  canDamage(target: any, tile: any, zone: any): boolean {
    return (
      !(!target.isSpawned || target.isDisposed || target.isDestroyed || target.isCrashing) &&
      !(target.isTechno() && target.warpedOutTrait.isInvulnerable() && !this.rules.temporal) &&
      (!target.isUnit() || !target.moveTrait.reservedPathNodes.find((reserved: any) => reserved.tile === tile)) &&
      !!target.healthTrait &&
      (!target.isUnit() || target.zone !== ZoneType.Air || zone === ZoneType.Air) &&
      !(!target.isUnit() && zone === ZoneType.Air) &&
      (!target.isBuilding() || !target.rules.invisibleInGame) &&
      !((target.isTechno() || target.isTerrain()) && target.rules.immune && !this.rules.temporal) &&
      !(target.isTechno() && !target.rules.warpable && this.rules.temporal) &&
      !(this.rules.radiation && (!target.isUnit() || target.rules.immuneToRadiation)) &&
      !(this.rules.psychicDamage && (!target.isUnit() || target.rules.immuneToPsionics)) &&
      (!target.isOverlay() || !BridgeOverlayTypesModule.BridgeOverlayTypes.isLowBridgeHead(target.overlayId))
    );
  }

  /**
   * 计算对单个目标的基础伤害（未做 cellSpread 距离衰减）。
   * @param damage 武器基础伤害
   * @param target 目标
   * @param game 游戏世界
   * @param isWeatherCon 闪电风暴闪电（墙体/桥不衰减、直接吃满）
   */
  computeDamage(damage: number, target: any, game: any, isWeatherCon = false): number {
    let result = damage;
    // 无敌（铁幕/力盾）目标免疫一切；刚发射的空中导弹不可伤；
    // 全局禁止拆桥时桥不受伤害。
    if (damage > 0 && target.isTechno() && target.invulnerableTrait.isActive()) return 0;
    if (target.isAircraft() && target.missileSpawnTrait && target.zone !== ZoneType.Air) return 0;
    if (!game.gameOpts.destroyableBridges && target.isOverlay() && target.bridgeTrait) return 0;
    // 卧倒的步兵受到 proneDamage 系数减伤（时间/辐射武器不减）。
    if (this.rules.radiation || this.rules.temporal || !target.isInfantry() || target.stance !== StanceType.Prone) {
      // 非卧倒：不做俯卧修正
    } else {
      result *= this.rules.proneDamage;
    }
    if (target.isTechno() || target.isOverlay() || target.isTerrain()) {
      // 装甲类型：地形固定 Wood；桥面按桥体材质（Wood/Concrete）覆盖。
      let armor = target.isTerrain() ? ArmorType.Wood : target.rules.armor;
      if (target.isOverlay() && target.isBridge()) {
        const bridgeType = BridgeOverlayTypesModule.BridgeOverlayTypes.getOverlayBridgeType(target.overlayId);
        if (bridgeType === BridgeOverlayTypesModule.OverlayBridgeType.Wood) armor = ArmorType.Wood;
        else if (bridgeType === BridgeOverlayTypesModule.OverlayBridgeType.Concrete) armor = ArmorType.Concrete;
      }
      // verses 威力表：闪电风暴对墙/桥直接吃满不衰减；其余按表查询。
      if (!(isWeatherCon && target.isOverlay() && (target.isBridge() || target.rules.wall))) {
        result *= this.rules.verses.get(armor);
      }
      if (result > 0 && target.isTechno() && target.veteranTrait) {
        result /= target.veteranTrait.getVeteranArmorMultiplier();
      }
      if (result > 0 && target.isUnit()) result /= target.crateBonuses.armor;
    }
    // 墙/桥特殊规则：wallAbsoluteDestroyer 直接无限伤害；非墙类弹头
    // 打墙只对 Wood 装甲（wood 弹头）有效，否则归零；非墙类弹头打桥归零。
    if ((target.isOverlay() || target.isBuilding()) && target.rules.wall) {
      if (this.rules.wallAbsoluteDestroyer) result = Number.POSITIVE_INFINITY;
      else if (!this.rules.wall) {
        if (!(this.rules.wood && target.rules.armor === ArmorType.Wood)) result = 0;
      }
    }
    if (target.isOverlay() && target.isBridge() && !this.rules.wall) result = 0;
    // 取整方向随符号：正伤害向下、负伤害（治疗）向上。
    result = result > 0 ? Math.floor(result) : Math.ceil(result);
    return result;
  }

  /**
   * 对单个目标施加伤害（含死亡处理）。
   * @param damage 伤害值（Infinity = 打满当前血量）
   * @param target 目标
   * @param attacker 攻击者对象（可为 undefined，如辐射/闪电）
   * @param game 游戏世界
   * @param isPrimary 是否为本次爆炸的主目标（影响死亡表现）
   * @returns 目标是否死亡
   */
  inflictDamage(damage: number, target: any, attacker: any, game: any, isPrimary = false): boolean {
    // 坦克碉堡伤害转嫁：碉堡内载具承伤时改由碉堡建筑承担
    //（PenetratesBunker=yes 的弹头穿透，不转嫁）。
    if (target.isVehicle && target.isVehicle() && target.bunkeredAt && target.bunkeredAt.tankBunkerTrait && !this.rules.penetratesBunker) {
      target = target.bunkeredAt;
    }
    const healthTrait = target.healthTrait;
    if (damage === Number.POSITIVE_INFINITY) damage = healthTrait.getHitPoints();
    healthTrait.inflictDamage(damage, attacker, game);
    // NotifyAttack 广播 + 对象自身 onAttack（实参顺序为原实现约定）。
    game.traits.filter(NotifyAttackModule.NotifyAttack).forEach((trait: any) => {
      trait[NotifyAttackModule.NotifyAttack.onAttack](target, attacker?.obj, game);
    });
    target.onAttack(game, attacker);
    game.events.dispatch(new ObjectAttackedEventModule.ObjectAttackedEvent(target, attacker, isPrimary));
    // 非时间武器命中 techno：触发压制/逃跑。
    if (target.isTechno() && !this.rules.temporal) this.supressOrScatterTarget(target, game);
    if (!healthTrait.health) {
      // 目标死亡：设置步兵死亡表现；毒雾（InfDeath=8）留云；时间武器
      // 改写死亡类型；突变弹头把可转化步兵变成狂兽人；空中单位坠毁；
      // 其余常规摧毁。
      if (target.isInfantry()) target.infDeathType = this.rules.infDeath;
      // 病毒狙杀毒雾：InfDeath=8 且受害者为人类步兵（非 NotHuman）时，
      // 在其所在格留下毒雾云（NotHuman 受害者播放 Die1 不留云）；被毒雾
      // 本身毒死的步兵也带 InfDeath=8，链式反应经同一钩子传播。
      if (target.isInfantry() && target.isSpawned && target.rules.isHuman && !this.rules.temporal && this.rules.infDeath === 8) {
        game.virusCloudTrait?.createCloud(target.tile, target.position?.worldPosition, game);
      }
      if (this.rules.temporal) target.deathType = DeathType.Temporal;
      if (
        this.rules.infDeath === 9 &&
        target.isInfantry() &&
        !target.rules.immuneToPsionics &&
        target.name !== "BRUTE" &&
        game.rules.hasObject("BRUTE", ObjectType.Infantry)
      ) {
        // 基因突变（原版 YR 仅 InfDeath=9/Mutate 触发）：在攻击者阵营下
        // 于受害者位置生成狂兽人（BRUTE），并静默销毁受害者（无死亡动画，
        // infDeathType 置 None 后 destroy）。注意：原实现此分支同样返回
        // true（通知调用方目标已死亡并中断距离结算）。
        this._mutateInfantryToBrute(target, attacker, game);
        return true;
      } else if (target.isUnit() && target.crashableTrait && target.zone === ZoneType.Air && !this.rules.temporal) {
        // 空中单位（有坠毁 trait）进入坠落流程而非立即摧毁。
        target.crashableTrait.crash(attacker);
        return true;
      } else {
        game.destroyObject(target, attacker, undefined, isPrimary);
        return true;
      }
    }
    return false;
  }

  /**
   * 受击压制/逃跑：胆小单位（fraidycat）或"非战斗方的无足轻重载具"
   * 惊慌逃散（挂 ScatterTask，步兵附带解除惊慌的回调任务）；普通步兵
   * 走压制（卧倒）机制。
   */
  supressOrScatterTarget(target: any, game: any): void {
    if (
      target.rules.fraidycat || (target.isVehicle() && !target.owner.isCombatant() && target.rules.insignificant)
    ) {
      if (!target.unitOrderTrait.hasTasks()) {
        if (target.isInfantry()) target.isPanicked = true;
        target.unitOrderTrait.addTask(new ScatterTaskModule.ScatterTask(game));
        if (target.isInfantry())
          target.unitOrderTrait.addTask(new CallbackTaskModule.CallbackTask(() => (target.isPanicked = false)).setCancellable(false));
      }
    } else if (
      target.isInfantry() && (target.moveTrait.isIdle() || target.suppressionTrait?.isSuppressed())
    ) {
      target.suppressionTrait?.suppress();
    }
  }

  /**
   * 磁电（Magnetron）移动束拖拽：给受害者挂 MagnetronDragTask——把
   * 受害者抬升为空中单位（zone→Air，可被对空武器攻击）、飞向磁电、
   * 在附近随机空格放下。拖拽持续到磁电的攻击任务结束；同一磁电已
   * 在拖拽该受害者时不重复挂任务。挂任务前清空受害者当前移动状态
   * （取消全部任务、解除路径预留、清空航点/速度/移动器）。
   */
  _dragVehicleTo(victim: any, game: any, attacker: any): void {
    if (victim.magnetronDraggedBy) return;
    if (!victim.unitOrderTrait) return;
    victim.unitOrderTrait.cancelAllTasks();
    if (victim.moveTrait) {
      try {
        if (victim.moveTrait.unreservePathNodes) victim.moveTrait.unreservePathNodes();
      } catch (err) {}
      victim.moveTrait.currentWaypoint = undefined;
      victim.moveTrait.collisionState = 1; // CollisionState.Resolved
      victim.moveTrait.moveState = 0; // MoveState.Idle
      if (victim.moveTrait.velocity) victim.moveTrait.velocity.set(0, 0, 0);
      victim.moveTrait.locomotor = undefined;
    }
    victim.unitOrderTrait.addTaskToFront(new MagnetronDragTaskModule.MagnetronDragTask(game, victim, attacker, this));
  }

  /**
   * 基因突变辅助：在受害者位置、以攻击者阵营（无主时回落受害者阵营）
   * 生成狂兽人（BRUTE），然后静默销毁受害者（infDeathType=None）。
   */
  _mutateInfantryToBrute(victim: any, attacker: any, game: any): void {
    const owner = attacker?.player ?? victim.owner;
    const bruteRules = game.rules.getObject("BRUTE", ObjectType.Infantry);
    const brute = game.createUnitForPlayer(bruteRules, owner);
    const tile = victim.tile;
    game.spawnObject(brute, tile);
    victim.infDeathType = 0;
    game.destroyObject(victim, attacker, undefined, false);
  }

  /** 无武器信息的占位对象（辐射/闪电等无来源爆炸用）。 */
  createDummyWeaponInfo(): any {
    return {
      minRange: 0,
      range: 0,
      speed: Number.POSITIVE_INFINITY,
      type: WeaponType.Primary,
      rules: new WeaponRulesModule.WeaponRules(new IniSectionModule.IniSection("Dummy")),
      projectileRules: new ProjectileRulesModule.ProjectileRules(ObjectType.Projectile, new IniSectionModule.IniSection("Dummy")),
      warhead: this,
    };
  }

  /**
   * 引爆：范围收集 + 逐目标结算。
   * @param game 游戏世界
   * @param damage 武器基础伤害
   * @param tile 爆心 tile
   * @param elevation 爆心高度
   * @param center 爆心世界坐标（距离衰减基准）
   * @param targetZone 爆炸所在区域（Ground/Air/Water）
   * @param collisionType 碰撞类型（含 UnderBridge/OnBridge 特判）
   * @param targetInfo 目标信息 {obj: 直击对象, getBridge: 所在桥}
   * @param weaponInfo 武器信息 {weapon, obj: 攻击者, player}
   * @param specialWarheadType 特殊弹头类型（Shrapnel/ lightningStrike…）
   * @param smudgeType 落下的焦痕类型
   * @param cellSpreadOverride 覆盖 rules.cellSpread 的范围值
   * @param suppressAnim 是否不播爆炸动画
   */
  detonate(
    game: any,
    damage: number,
    tile: any,
    elevation: number,
    center: any,
    targetZone: any,
    collisionType: any,
    targetInfo: any,
    weaponInfo: any,
    specialWarheadType: any = SpecialWarheadTypeModule.SpecialWarheadType.None,
    smudgeType: any,
    cellSpreadOverride: any,
    suppressAnim = false,
  ): void {
    let weapon = weaponInfo?.weapon ?? this.createDummyWeaponInfo();
    const shooter = weaponInfo?.obj;
    const shooterPlayer = weaponInfo?.player;
    const isShrapnel = specialWarheadType === SpecialWarheadTypeModule.SpecialWarheadType.Shrapnel;
    const isLightning = specialWarheadType === SpecialWarheadTypeModule.SpecialWarheadType.LightningStrike;
    // 生效范围：优先用调用方覆盖值，否则用规则 cellSpread。
    const spread = cellSpreadOverride ? cellSpreadOverride / Coords.LEPTONS_PER_TILE : this.rules.cellSpread;
    const percentAtMax = this.rules.percentAtMax;
    const affected = new Set<any>();
    const distancesByTarget = new Map<any, any>();
    const rangeHelper = new RangeHelperModule.RangeHelper(game.map.tileOccupation);
    const tileFinder = new RadialTileFinderModule.RadialTileFinder(
      game.map.tiles,
      game.map.mapBounds,
      tile,
      { width: 1, height: 1 },
      0,
      Math.ceil(spread),
      () => true,
      false,
    );
    // 收集范围内可伤害的目标：建筑按"距离列表"聚合（每个覆盖格追加速度）。
    let nextTile;
    while ((nextTile = tileFinder.getNextTile())) {
      for (const object of game.map.getObjectsOnTile(nextTile)) {
        if (
          (!affected.has(object) || object.isBuilding()) &&
          (collisionType !== CollisionTypeModule.CollisionType.UnderBridge || !object.isUnit() || !object.onBridge) &&
          !(shooter && object.isTechno() && object.rules.typeImmune && object.owner === shooterPlayer && object.name === shooter.name) &&
          (object !== shooter || shooter.rules.damageSelf) &&
          this.canDamage(object, nextTile, targetZone) &&
          (!object.isOverlay() ||
            !(
              (!collisionType && 0.1 < Math.abs(object.tileElevation - elevation)) ||
              (collisionType === CollisionTypeModule.CollisionType.OnBridge && !object.isBridge())
            ))
        ) {
          // 距离基准：建筑按格心到爆心格；地形/覆盖层按格心到爆心点；
          // 其余按对象自身位置到爆心世界点（单位为 tile）。
          let distance = object.isBuilding()
            ? nextTile === tile
              ? 0
              : rangeHelper.distance3(nextTile, center) / Coords.LEPTONS_PER_TILE
            : object.isTerrain() || object.isOverlay()
              ? rangeHelper.distance3(nextTile, tile) / Coords.LEPTONS_PER_TILE
              : rangeHelper.distance3(object, center) / Coords.LEPTONS_PER_TILE;
          // 空中单位距离减半（溅射对空更宽容）。
          if (spread && object.isAircraft() && object.zone === ZoneType.Air) distance /= 2;
          if (distance < 0.001) distance = 0;
          // 榴弹（Shrapnel）：不伤及发射者阵营与其盟友的步兵。
          if (!(isShrapnel && object.isInfantry() && shooterPlayer) || (object.owner !== shooterPlayer && !game.alliances.areAllied(object.owner, shooterPlayer))) {
            // 非范围武器只结算"正中"目标：地形须正中且弹头为墙类；
            // 其他对象须正中格且（是建筑或正是直击对象/所在桥）。
            if (!spread) {
              if (object.isTerrain()) {
                if (nextTile !== tile || !this.rules.wall) continue;
              } else if (!isShrapnel && (nextTile !== tile || (!object.isBuilding() && object !== (targetInfo.obj || targetInfo.getBridge())))) {
                continue;
              }
            }
            if (!(spread && distance > spread)) {
              affected.add(object);
              distancesByTarget.set(object, object.isBuilding() ? (distancesByTarget.get(object) || []).concat(distance) : [distance]);
            }
          }
        }
      }
    }
    let nullified = false;
    let primaryVictim: any;
    // 心灵伤害（Chaos Drone 瓦斯）：施加狂乱而非伤害——武器 Damage 值
    // 即狂乱持续帧数，verses 与距离衰减与伤害循环同公式；仅作用于敌对
    // 单位（免疫心灵者在 canDamage 已被过滤）。
    if (this.rules.psychicDamage) {
      for (const target of affected) {
        if (!target.isDestroyed && !target.isCrashing && target.isTechno() && target.berserkTrait && shooterPlayer && target.owner !== shooterPlayer && !game.alliances.areAllied(target.owner, shooterPlayer)) {
          let berserkDuration = damage;
          if (target.isTechno()) {
            const armor = target.isTerrain() ? ArmorType.Wood : target.rules.armor;
            berserkDuration *= this.rules.verses.get(armor) ?? 0;
          }
          if (spread && distancesByTarget.has(target)) {
            for (const dist of distancesByTarget.get(target)) {
              let falloff = berserkDuration;
              if (spread > 0 && Number.isFinite(falloff)) falloff = lerp(falloff, percentAtMax * falloff, dist / spread);
              falloff = falloff > 0 ? Math.floor(falloff) : Math.ceil(falloff);
              if (falloff > 0) target.berserkTrait.setBerserk(falloff, shooter);
            }
          } else {
            berserkDuration = berserkDuration > 0 ? Math.floor(berserkDuration) : Math.ceil(berserkDuration);
            if (berserkDuration > 0) target.berserkTrait.setBerserk(berserkDuration, shooter);
          }
        }
      }
    } else {
      for (const target of affected) {
        if (!target.isDestroyed && !target.isCrashing) {
          // 磁电移动束：改拖拽为 MagnetronDragTask（参数遮蔽模块别名，
          // 故委托 _dragVehicleTo）。拖走后跳过常规伤害。
          if (this.rules.isLocomotor && target.isVehicle() && target.moveTrait && !target.moveTrait.isDisabled() && shooter) {
            this._dragVehicleTo(target, game, shooter);
            continue;
          }
          // 吸血武器触发：命中 Drainable 建筑时启动/刷新攻击者的吸取
          // （drainWeapon 是武器级标志，弹头层没有该属性）；后续弹丸
          // 伤害归零但不中断吸取启动。
          let damageDealt;
          if (weapon.rules.drainWeapon && target.isBuilding() && target.rules.drainable) {
            if (shooter && shooter.drainTrait) shooter.drainTrait.startDrain(shooter, target, game);
            damageDealt = 0;
          } else {
            damageDealt = this.computeDamage(damage, target, game, isLightning);
          }
          // 非治疗武器不伤盟友/自己（affectsAllIED=yes 的弹头除外）。
          if (
            damage > 0 &&
            !this.rules.affectsAllies &&
            target.isTechno() &&
            shooterPlayer &&
            (game.alliances.areAllied(target.owner, shooterPlayer) || target.owner === shooterPlayer)
          ) {
            damageDealt = 0;
          }
          if (damageDealt) {
            for (const dist of distancesByTarget.get(target)) {
              let finalDamage = damageDealt;
              if (spread > 0 && Number.isFinite(finalDamage)) {
                finalDamage = lerp(finalDamage, percentAtMax * finalDamage, dist / spread);
              }
              // 极小伤害保底为 ±1（避免高衰减把伤害抹零），但满衰减区除外。
              if (Math.abs(finalDamage) < 1 && (!spread || 0.25 <= finalDamage / damageDealt)) {
                finalDamage = +Math.sign(finalDamage);
              }
              finalDamage = finalDamage > 0 ? Math.floor(finalDamage) : Math.ceil(finalDamage);
              if (finalDamage) {
                const healthTrait = target.healthTrait;
                if (finalDamage < 0) {
                  // 治疗：无治疗者对象则报错；满血后停止本目标结算。
                  if (!shooter) throw new Error("Expected healer object to be set");
                  healthTrait.healBy(-finalDamage, shooter, game);
                  if (healthTrait.health === 100) break;
                } else {
                  // 主直击目标标记（用于爆炸动画选择）。
                  if (target === targetInfo.obj && dist < 1) primaryVictim = target;
                  // 延迟摧毁（C4 类）：致死一击改为留 1 血并激活延迟摧毁
                  //（delayKillAtMax/delayKillFrames 按距离插值）。
                  if (this.rules.causesDelayKill && target.isBuilding() && target.delayedKillTrait) {
                    const hitPoints = target.healthTrait.getHitPoints();
                    if (finalDamage >= hitPoints) {
                      finalDamage = hitPoints - 1;
                      if (!target.delayedKillTrait.isActive()) {
                        const atMax = this.rules.delayKillAtMax;
                        let frames = this.rules.delayKillFrames;
                        frames = lerp(frames, atMax * frames, dist / spread);
                        target.delayedKillTrait.activate(frames, weaponInfo);
                      }
                    }
                  }
                  if (this.inflictDamage(finalDamage, target, weaponInfo, game, !primaryVictim)) break;
                  // rocker 弹头：命中载具触发船体摇晃（方向 = 受击面朝向差）。
                  if (target.isVehicle() && this.rules.rocker && clamp(damageDealt / 300, 0, 1) > 0) {
                    const intensity = clamp(damageDealt / 300, 0, 1);
                    const rockingFacing =
                      FacingUtilModule.FacingUtil.fromMapCoords(
                        target.position.getMapPosition().clone().sub(Coords.vecWorldToGround(center)),
                      ) - target.direction;
                    target.applyRocking(rockingFacing, intensity);
                  }
                }
              }
            }
          } else if (target.isTechno() && target.invulnerableTrait.isActive()) {
            // 零伤害（无敌目标）：记录用于播放"无效"动画。
            nullified = true;
          }
        }
      }
    }
    // 辐射残留：弹头声明 radLevel 且有范围时在爆心创建辐射场。
    let radLevel = weapon.rules.radLevel;
    if (radLevel && spread) game.mapRadiationTrait.createRadSite(tile, radLevel, spread + 1);
    // 爆炸动画：无效化 → 武器无效动画；否则按伤害/目标选取。
    let explodeAnim = suppressAnim
      ? undefined
      : nullified
        ? game.rules.audioVisual.weaponNullifyAnim
        : this.pickExplodeAnim(damage, primaryVictim, targetZone, game, isLightning);
    // 盘式激光（DiskLaser）有自己的环形激光表现，压掉标准爆炸动画。
    if (weaponInfo?.weapon?.rules?.isDiskLaser) explodeAnim = undefined;
    if (!nullified && targetZone === ZoneType.Ground) {
      const terrainEffect = new AnimTerrainEffectModule.AnimTerrainEffect();
      if (explodeAnim) terrainEffect.destroyOre(explodeAnim, tile, game);
      if (smudgeType) terrainEffect.spawnSmudges(smudgeType, tile, game);
      if (explodeAnim) terrainEffect.spawnSmudges(explodeAnim, tile, game);
    }
    game.events.dispatch(new WarheadDetonateEventModule.WarheadDetonateEvent(this, center, explodeAnim, isLightning));
  }

  /**
   * 选取爆炸动画：
   *  - 闪电风暴 → 天气闪电爆炸动画；
   *  - conventional 弹头打水面（无主目标/建筑/潜水载具）→ 按伤害档位
   *    取 splashList 水花；
   *  - 其余按 animList：C4 弹头固定最后一帧（贴地炸），emEffect 随机，
   *    普通按伤害每 25 点一档。
   */
  pickExplodeAnim(damage: number, primaryVictim: any, zone: any, game: any, isLightning: boolean): any {
    if (damage) {
      if (isLightning) return game.rules.audioVisual.weatherConBoltExplosion;
      if (
        this.rules.conventional &&
        zone === ZoneType.Water &&
        (!primaryVictim || primaryVictim.isBuilding() || (primaryVictim.isVehicle() && primaryVictim.submergibleTrait))
      ) {
        const splashList = game.rules.combatDamage.splashList;
        return splashList[clamp(Math.floor(damage / 50), 0, splashList.length - 1)];
      }
      const animCount = this.rules.animList.length;
      if (!animCount) return undefined;
      let index;
      if (game.rules.combatDamage.c4Warhead === this.rules.name) index = animCount - 1;
      else if (this.rules.emEffect) index = game.generateRandomInt(0, animCount - 1);
      else index = clamp(Math.floor(damage / 25), 0, animCount - 1);
      return this.rules.animList[index];
    }
    return undefined;
  }
}
