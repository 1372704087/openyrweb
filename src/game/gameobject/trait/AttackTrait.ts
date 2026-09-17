/**
 * AttackTrait — 战斗攻击 trait（目标扫描/武器选择/攻击状态机/开火）。
 *
 * 引擎最复杂的单个 trait，驱动全部战斗行为：
 *  - 被动扫描：按 passiveScanCooldownTicks 间隔扫描范围内可攻击目标；
 *  - 武器选择：selectWeaponVersus / selectWeaponFromList 按弹头 verses、
 *    伪装渗透、Drainable、电击突袭、OpenTopped 乘员武器等逐条筛选；
 *  - 攻击状态机 AttackState：Idle → CheckRange → PrepareToFire →
 *    FireUp → Firing → JustFired；
 *  - 机会火（opportunity fire）：非主任务期间发现目标临时开火；
 *  - 反击（retaliate）：被攻击时选择武器反击；
 *  - 狂乱（berserk）：无差别攻击附近全部 techno（含盟友）；
 *  - 威胁评分 computeThreat：verses + 距离 + 特殊威胁 + 分散火力 +
 *    VHP 扫描 + 盖特对空加成综合评分；
 *  - 分散火力 distributedFireHistory 防止全员聚焦同一目标。
 *
 * 由 game/gameobject/trait/AttackTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { isNotNullOrUndefined } from "util/typeGuard"; // 已转换
import { ArmorType } from "game/type/ArmorType"; // 已转换
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import * as AttackTaskModule from "game/gameobject/task/AttackTask"; // 未转换（any-shim）
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as RangeHelperModule from "game/gameobject/unit/RangeHelper"; // 未转换（any-shim）
import * as NotifyDamageModule from "game/gameobject/trait/interface/NotifyDamage"; // 未转换（any-shim）
import * as TaskRunnerModule from "game/gameobject/task/system/TaskRunner"; // 未转换（any-shim）
import * as TargetModule from "game/Target"; // 未转换（any-shim）
import * as MoveTaskModule from "game/gameobject/task/move/MoveTask"; // 未转换（any-shim）
import * as CallbackTaskModule from "game/gameobject/task/system/CallbackTask"; // 已转换
import { MoveResult } from "game/gameobject/trait/MoveTrait"; // 已转换
import { MovementZone } from "game/type/MovementZone"; // 已转换
import { Coords } from "game/Coords"; // 已转换
import * as NotifyTeleportModule from "game/gameobject/trait/interface/NotifyTeleport"; // 未转换（any-shim）
import { VhpScan } from "game/type/VhpScan"; // 已转换
import * as LosHelperModule from "game/gameobject/unit/LosHelper"; // 未转换（any-shim）
import { Vector2 } from "game/math/Vector2"; // 已转换
import * as Box2Module from "game/math/Box2"; // 未转换（any-shim）

/** 攻击状态机。 */
export enum AttackState {
  Idle = 0,
  CheckRange = 1,
  PrepareToFire = 2,
  FireUp = 3,
  Firing = 4,
  JustFired = 5,
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export class AttackTrait {
  disabled = false;
  attackState: AttackState = AttackState.Idle;
  passiveScanCooldownTicks = 0;
  taskRunner: any;
  distributedFireHistory = new Map();
  rangeHelper: any;
  losHelper: any;
  retaliateTarget: any;
  opportunityFireTask: any;
  currentTarget: any;

  constructor(gameObject: any, map: any) {
    this.taskRunner = new TaskRunnerModule.TaskRunner();
    this.rangeHelper = new RangeHelperModule.RangeHelper(map);
    this.losHelper = new LosHelperModule.LosHelper(gameObject, map);
  }

  isIdle(): boolean {
    return this.attackState === AttackState.Idle;
  }

  isDisabled(): boolean {
    return this.disabled;
  }

  setDisabled(disabled: boolean): void {
    this.disabled = disabled;
  }

  /** 主/副武器任一冷却中则返回 true（部署武器的区域开火除外）。 */
  isOnCooldown(object: any): boolean {
    let weapons = [object.primaryWeapon, object.secondaryWeapon];
    const deployWeapon = object.armedTrait?.getDeployFireWeapon();
    // 已部署的区域开火武器由 DeployerTrait 管冷却；未部署时走 AttackTask 需要检查冷却。
    if (deployWeapon?.rules.areaFire && !deployWeapon.rules.fireOnce && object.deployerTrait?.isDeployed()) {
      weapons = weapons.filter((w) => w !== deployWeapon);
    }
    return weapons.some((w) => (w?.getCooldownTicks() ?? 0) > 0);
  }

  expirePassiveScanCooldown(): void {
    this.passiveScanCooldownTicks = 0;
  }

  increasePassiveScanCooldown(ticks: number): void {
    this.passiveScanCooldownTicks += ticks;
  }

  cancelOpportunityFire(): void {
    if (this.opportunityFireTask) this.opportunityFireTask.cancel();
  }

  getOpportunityFireTask(): any {
    return this.opportunityFireTask;
  }

  /**
   * 选择缺省武器（按对象类型和状态）：
   *  - 部署单位：已部署 → 部署武器（非区域开火），未部署 → 非部署武器的另一把；
   *  - 驻楼建筑 → 驻员的驻楼武器；
   *  - 超载建筑 → OverpoweredTrait 武器；
   *  - 其余 → 主武器。
   */
  selectDefaultWeapon(object: any): any {
    let weapon;
    if ((object.isInfantry() || object.isVehicle()) && object.rules.deployFire) {
      const deployWeapon = object.armedTrait?.getDeployFireWeapon();
      if (object.deployerTrait?.isDeployed()) {
        weapon = deployWeapon && !deployWeapon.rules.areaFire ? deployWeapon : undefined;
      } else {
        weapon =
          [object.primaryWeapon, object.secondaryWeapon].find((w) => w !== deployWeapon && !w?.rules.neverUse) ??
          object.primaryWeapon;
      }
    } else if (object.isBuilding() && object.garrisonTrait && object.garrisonTrait.isOccupied()) {
      // 驻楼建筑使用驻员的 OccupyWeapon（原版 YR：GI 驻扎发射 UCPara）。
      for (const occupant of object.garrisonTrait.units) {
        if (occupant.armedTrait?.getGarrisonWeapon()) {
          weapon = occupant.armedTrait.getGarrisonWeapon();
          break;
        }
      }
    } else if (object.isBuilding() && object.garrisonTrait) {
      weapon = undefined;
    } else if (object.isBuilding() && object.overpoweredTrait) {
      weapon = object.overpoweredTrait.getWeapon();
    } else {
      weapon = object.primaryWeapon;
    }
    return weapon;
  }

  /** 按目标选择最佳武器（委托 selectWeaponFromList）。 */
  selectWeaponVersus(
    object: any,
    target: any,
    game: any,
    ignoreBuildings = false,
    ignoreDisguise = false,
  ): any {
    const tile = target.tile;
    const targetObject = target instanceof TargetModule.Target ? target.obj : target;
    const weapons = this.getAvailableWeapons(object, ignoreDisguise, targetObject?.isOverlay() || (ignoreBuildings && !targetObject));
    return this.selectWeaponFromList(object, targetObject, tile, weapons, game, ignoreBuildings, ignoreDisguise, false);
  }

  /**
   * 从候选武器列表中选出第一个满足条件（targeting + verses 装甲）的武器。
   * Drainable 建筑优先选 drainWeapon。
   */
  selectWeaponFromList(
    object: any,
    target: any,
    tile: any,
    weapons: any[],
    game: any,
    ignoreBuildings: boolean,
    ignoreDisguise: boolean,
    ignoreAircraft: boolean,
  ): any {
    if (
      ((!target?.isInfantry() && !target?.isVehicle()) ||
        !target.disguiseTrait ||
        this.canAttackThroughDisguise(object, target, target.disguiseTrait, ignoreBuildings, ignoreDisguise, game, ignoreAircraft)) &&
      (target?.isBuilding() &&
        target.overpoweredTrait &&
        target.owner === object.owner &&
        weapons.find((w) => w.warhead.rules.electricAssault) &&
        (weapons = weapons.filter((w) => w.warhead.rules.electricAssault)),
      !(ignoreAircraft && target?.isAircraft() && target.missileSpawnTrait && target.zone !== ZoneType.Air))
    ) {
      const targetArmor = target?.isTechno() ? target.rules.armor : undefined;
      // Drainable 建筑：优先选 drainWeapon。
      if (target?.isBuilding() && target.rules.drainable) {
        const drain = weapons.find((w) => w.rules.drainWeapon);
        if (drain && drain.targeting.canTarget(target, tile, game, ignoreBuildings, ignoreDisguise) && (targetArmor === undefined || this.checkArmor(drain.warhead.rules, targetArmor, ignoreAircraft)))
          return drain;
      }
      for (const weapon of weapons) {
        if (weapon.targeting.canTarget(target, tile, game, ignoreBuildings, ignoreDisguise) && (targetArmor === undefined || this.checkArmor(weapon.warhead.rules, targetArmor, ignoreAircraft)))
          return weapon;
      }
    }
    return undefined;
  }

  /** 可用武器列表组装（按对象状态分支）。 */
  getAvailableWeapons(object: any, includeAA: boolean, ignoreAllies: boolean): any[] {
    let weapons: any[];
    if ((object.isInfantry() || object.isVehicle()) && object.rules.deployFire && object.armedTrait) {
      const deployWeapon = object.armedTrait.getDeployFireWeapon();
      weapons = [
        object.deployerTrait?.isDeployed()
          ? deployWeapon.rules.areaFire
            ? undefined
            : deployWeapon
          : deployWeapon === object.secondaryWeapon
            ? object.primaryWeapon
            : object.secondaryWeapon?.rules.neverUse
              ? object.primaryWeapon
              : object.secondaryWeapon,
      ];
    } else if (object.isBuilding() && object.garrisonTrait && object.garrisonTrait.isOccupied()) {
      weapons = [];
      for (const occupant of object.garrisonTrait.units) {
        const garrisonWeapon = occupant.armedTrait?.getGarrisonWeapon();
        if (garrisonWeapon) weapons.push(garrisonWeapon);
      }
    } else if (object.isBuilding() && object.garrisonTrait) {
      weapons = [];
    } else if (object.isBuilding() && object.overpoweredTrait) {
      weapons = [object.overpoweredTrait.getWeapon()];
    } else if (object.isVehicle() && object.rules.openTopped && object.transportTrait && object.transportTrait.units.length) {
      // 敞开运输车：自身武器 + 每个乘员的 OpenTransportWeapon。
      weapons = [object.primaryWeapon, object.secondaryWeapon];
      for (const passenger of object.transportTrait.units) {
        const openWeapon = passenger.armedTrait?.getOpenToppedWeapon();
        if (openWeapon) weapons.push(openWeapon);
      }
    } else if (includeAA || ignoreAllies) {
      weapons = [
        object.primaryWeapon,
        object.secondaryWeapon && (object.secondaryWeapon.rules.spawner || (!ignoreAllies && includeAA))
          ? object.secondaryWeapon
          : undefined,
      ];
    } else {
      weapons = [object.primaryWeapon, object.secondaryWeapon];
    }
    return weapons.filter((w) => w && !w.rules.neverUse);
  }

  /** 伪装穿透判定（间谍/幻影坦克等）。 */
  canAttackThroughDisguise(
    object: any, target: any, disguiseTrait: any,
    ignoreBuildings: boolean, ignoreDisguise: boolean, game: any, ignoreAircraft: boolean,
  ): boolean {
    if (!ignoreDisguise && disguiseTrait.hasTerrainDisguise() && !game.areFriendly(object, target) && !object.owner.sharedDetectDisguiseTrait?.has(target))
      return false;
    if (ignoreAircraft) {
      if (
        ignoreBuildings &&
        target.moveTrait.isIdle() &&
        !object.rules.detectDisguise &&
        !object.owner.sharedDetectDisguiseTrait?.has(target) &&
        !game.areFriendly(target, object)
      )
        return false;
      const disguise = disguiseTrait.getDisguise();
      if (
        disguise?.owner &&
        !object.rules.detectDisguise &&
        !object.owner.sharedDetectDisguiseTrait?.has(target) &&
        (disguise.owner === object.owner || game.alliances.areAllied(object.owner, disguise.owner))
      )
        return false;
    }
    return true;
  }

  /** verses 装甲检查：伊文炸弹/拆弹/核弹绕过 verses，其余按表查。 */
  checkArmor(warheadRules: any, armorType: any, ignoreAircraft: boolean): boolean {
    const verse =
      warheadRules.ivanBomb || warheadRules.bombDisarm || warheadRules.nukeMaker ? 1 : warheadRules.verses.get(armorType);
    if (verse === undefined) {
      console.warn(`Unhandled ArmorType ${ArmorType[armorType]} in warhead ${warheadRules.name} verses`);
      return false;
    }
    return !(100 * verse <= (ignoreAircraft ? 1 : 0));
  }

  createAttackTask(world: any, target: any, tile: any, weapon: any, options: any): any {
    return new AttackTaskModule.AttackTask(world, world.createTarget(target, tile), weapon, options);
  }

  /**
   * 每逻辑 tick：狂乱无差别攻击 / 机会火 / 反击 / 被动扫描。
   * 狂乱单位优先——不走去火/反击/警戒逻辑。
   */
  [NotifyTickModule.NotifyTick.onTick](object: any, world: any): void {
    if (this.isDisabled()) return;
    // 狂乱自动攻击：扫描任意附近 techno（含盟友），忽略常规逻辑。
    if (object.berserkTrait?.isBerserk()) {
      if (this.passiveScanCooldownTicks > 0) {
        this.passiveScanCooldownTicks--;
      } else {
        this.passiveScanCooldownTicks = world.rules.general.normalTargetingDelay;
        const weapon = this.selectDefaultWeapon(object);
        if (weapon && !object.unitOrderTrait.hasTasks()) {
          const scan = this.scanForTarget(object, weapon, world, undefined, undefined, false);
          if (scan.target) {
            const task = this.createAttackTask(world, scan.target, scan.target.tile, scan.weapon, { passive: true });
            object.unitOrderTrait.addTask(task);
          }
        }
      }
      return;
    }
    // 机会火：主任务链不含 AttackTask 时持续 tick 机会火任务。
    if (this.opportunityFireTask) {
      if (!object.unitOrderTrait.hasTasks()) {
        // 无任务 → 保留机会火
      } else if (object.isUnit() && !object.unitOrderTrait.getTasks()[0].preventOpportunityFire) {
        // 允许机会火
      } else if (
        object.unitOrderTrait.getTasks()[0] instanceof AttackTaskModule.AttackTask
      ) {
        this.opportunityFireTask = undefined;
      } else {
        this.opportunityFireTask.cancel();
      }
      if (this.opportunityFireTask) {
        const tasks = [this.opportunityFireTask];
        this.taskRunner.tick(tasks, object);
        if (!tasks.length) this.opportunityFireTask = undefined;
      }
    }
    // 无机会火且有反击目标 → 创建反击攻击任务。
    if (!this.opportunityFireTask && this.retaliateTarget) {
      const retaliateTarget = this.retaliateTarget;
      this.retaliateTarget = undefined;
      let weapon;
      if (!object.unitOrderTrait.hasTasks() && world.isValidTarget(retaliateTarget)) {
        weapon = this.selectWeaponVersus(object, retaliateTarget, world, false);
        if (weapon) {
          object.unitOrderTrait.addTask(
            this.createAttackTask(world, retaliateTarget, retaliateTarget.tile, weapon, {
              holdGround: object.rules.movementZone === MovementZone.Fly,
            }),
          );
        }
      }
    }
    // 被动扫描：冷却结束后扫描目标。
    if (!this.opportunityFireTask && this.shouldPassiveAcquire(object)) {
      if (this.passiveScanCooldownTicks > 0) {
        this.passiveScanCooldownTicks--;
      } else {
        this.passiveScanCooldownTicks = object.guardMode
          ? world.rules.general.guardAreaTargetingDelay
          : world.rules.general.normalTargetingDelay;
        const weapon = this.selectDefaultWeapon(object);
        const hasTasks = object.unitOrderTrait.hasTasks();
        let scanRange: number | undefined;
        let guardAreaTile: any;
        let leashTiles: number | undefined;
        let acquired = false;
        if (!weapon) {
          // 无武器 → 只回位
        } else {
          // 仅无主任务时压缩为守卫半径扫描；已有任务（机会火）走全量半径。
          if (!hasTasks && object.guardMode && object.owner.isCombatant()) {
            scanRange = object.armedTrait?.computeGuardScanRange(weapon);
            guardAreaTile = object.guardArea?.tile;
            leashTiles = 50;
          }
          const scan = this.scanForTarget(object, weapon, world, scanRange, guardAreaTile);
          if (scan.target) {
            const task = this.createAttackTask(world, scan.target, scan.target.tile, scan.weapon, {
              holdGround: hasTasks || !object.guardMode,
              disallowTurning: hasTasks,
              leashTiles,
              passive: true,
            });
            if (hasTasks) this.opportunityFireTask = task;
            else object.unitOrderTrait.addTask(task);
            acquired = true;
            if (!hasTasks && object.guardMode && !object.guardArea) {
              object.guardArea = { tile: object.tile, onBridge: !!object.isUnit() && object.onBridge };
            }
            if (acquired && !hasTasks) object.unitOrderTrait[NotifyTickModule.NotifyTick.onTick](object, world);
          }
        }
        if (!acquired && !hasTasks && object.secondaryWeapon?.warhead.rules.electricAssault) {
          const electricWeapon = object.secondaryWeapon;
          const scan = this.scanForTarget(object, electricWeapon, world, undefined, undefined, true);
          if (scan.target) {
            const task = this.createAttackTask(world, scan.target, scan.target.tile, scan.weapon, { passive: true });
            object.unitOrderTrait.addTask(task);
            acquired = true;
          }
        }
        if (!acquired && !hasTasks && object.guardArea && object.isUnit() && object.moveTrait && !object.moveTrait.isDisabled() && object.guardArea.tile !== object.tile) {
          object.unitOrderTrait.addTasks(
            new MoveTaskModule.MoveTask(world, object.guardArea.tile, object.guardArea.onBridge),
            new CallbackTaskModule.CallbackTask(() => {
              // 与基线一致：非 Success/CloseEnough 才复位警戒，随后总是清区域。
              if (![MoveResult.Success, MoveResult.CloseEnough].includes(object.moveTrait.lastMoveResult)) {
                object.resetGuardModeToIdle();
              }
              object.guardArea = undefined;
            }),
          );
        }
      }
    }
  }

  /** 受击时设置反击目标（满足条件时）。调用序：object, world/game, damage, attacker。 */
  [NotifyDamageModule.NotifyDamage.onDamage](object: any, game: any, damage: any, attackerInfo: any): void {
    if (this.isDisabled()) return;
    if (!this.retaliateTarget && !this.opportunityFireTask && attackerInfo && attackerInfo.obj && attackerInfo.weapon) {
      if (this.shouldRetaliate(object, game, damage, attackerInfo.obj, attackerInfo.weapon.warhead)) {
        this.retaliateTarget = attackerInfo.obj;
      }
    }
  }

  /** 超时空传送前：重置攻击状态。 */
  [NotifyTeleportModule.NotifyTeleport.onBeforeTeleport](object: any, _world: any, _target: any, isReverse: any): void {
    if (!isReverse) {
      this.attackState = AttackState.Idle;
      this.currentTarget = undefined;
      this.retaliateTarget = undefined;
      this.opportunityFireTask = undefined;
    }
  }

  /** 是否可被动获取目标（配合驻楼/手动装填/心灵控制容量等判定）。 */
  shouldPassiveAcquire(object: any): boolean {
    const garrisoned = object.isBuilding() && object.garrisonTrait?.isOccupied();
    if (
      (!object.owner.isCombatant() && object.rules.needsEngineer) ||
      !object.rules.canPassiveAquire ||
      (!object.primaryWeapon && !garrisoned) ||
      (object.ammoTrait && !object.ammoTrait.ammo && object.rules.manualReload)
    )
      return false;
    if (object.mindControllerTrait?.isAtCapacity()) return false;
    const isOpportunityFire =
      object.rules.opportunityFire || (object.rules.balloonHover && object.unitOrderTrait.getCurrentTask()?.isAttackMove);
    if (object.isUnit() && isOpportunityFire) {
      if (object.unitOrderTrait.hasTasks() && object.unitOrderTrait.getTasks()[0].preventOpportunityFire) return false;
    } else if (object.unitOrderTrait.hasTasks()) {
      if (!(object.rules.openTopped && object.transportTrait && object.transportTrait.units.length)) return false;
    }
    return true;
  }

  /** 是否应反击。形参序与基线一致：object, game, damage, attacker, warhead。 */
  shouldRetaliate(object: any, game: any, damage: any, attacker: any, warhead: any): boolean {
    const garrisoned = object.isBuilding() && object.garrisonTrait?.isOccupied();
    if (object.berserkTrait?.isBerserk()) {
      if (damage < 1 || !object.rules.canRetaliate || (!object.primaryWeapon && !garrisoned) ||
          (object.ammoTrait && !object.ammoTrait.ammo && object.rules.manualReload) ||
          warhead.rules.temporal || attacker.rules.missileSpawn ||
          !game.isValidTarget(attacker) || object.mindControllerTrait?.isAtCapacity())
        return false;
      const weapon = this.selectWeaponVersus(object, attacker, game, false);
      if (!weapon) return false;
      const distance = object.isBuilding() || attacker.isBuilding()
        ? this.rangeHelper.tileDistance(object, attacker)
        : this.rangeHelper.distance2(object, attacker) / Coords.LEPTONS_PER_TILE;
      return distance <= Math.max(weapon.range, object.sight);
    }
    if (
      damage < 1 ||
      game.areFriendly(object, attacker) ||
      !object.rules.canRetaliate ||
      (!object.primaryWeapon && !garrisoned) ||
      (object.ammoTrait && !object.ammoTrait.ammo && object.rules.manualReload) ||
      warhead.rules.temporal ||
      attacker.rules.missileSpawn ||
      object.unitOrderTrait.hasTasks() ||
      !game.isValidTarget(attacker) ||
      ((attacker.isInfantry() || attacker.isVehicle()) && attacker.disguiseTrait && !object.rules.detectDisguise) ||
      object.mindControllerTrait?.isAtCapacity()
    )
      return false;
    const weapon = this.selectWeaponVersus(object, attacker, game, false);
    if (!weapon) return false;
    const distance = object.isBuilding() || attacker.isBuilding()
      ? this.rangeHelper.tileDistance(object, attacker)
      : this.rangeHelper.distance2(object, attacker) / Coords.LEPTONS_PER_TILE;
    return distance <= Math.max(weapon.range, object.sight);
  }

  /** 扫描范围内最佳目标（按威胁评分选最高）。 */
  scanForTarget(object: any, weapon: any, world: any, scanRange: any, guardArea: any, ignoreLos = false): any {
    if (object.magnetronDraggedBy) return {};
    if (object.berserkTrait?.isBerserk()) return this.scanForBerserkTarget(object, weapon, world, scanRange, guardArea, ignoreLos);
    let best: any = {};
    let bestThreat = Number.NEGATIVE_INFINITY;
    const weapons = this.getAvailableWeapons(object, true, false);
    const scanRadius =
      scanRange ??
      (object.rules.guardRange || weapon.range) + 1 + 3 + world.rules.elevationModel.bonusCap +
        (weapon.projectileRules.isAntiAir ? object.rules.airRangeBonus : 0);
    for (const target of this.scanTechnosAround(object, scanRadius, world)) {
      let weaponObj;
      const selected = this.selectWeaponFromList(object, target, target.tile, weapons, world, false, true, true);
      if (
        selected &&
        this.canPassiveAcquire(target, world) &&
        world.isValidTarget(target) &&
        (scanRange
          ? this.rangeHelper.isInRange(object, target, selected.minRange, scanRange, selected.rules.cellRangefinding) &&
            (!guardArea || this.rangeHelper.isInRange2(guardArea, target, 0, scanRange))
          : this.rangeHelper.isInWeaponRange(object, target, selected, world.rules)) &&
        (ignoreLos || this.losHelper.hasLineOfSight(object, target, selected))
      ) {
        let distance = this.rangeHelper.distance3(object, target) / Coords.LEPTONS_PER_TILE;
        const threat = this.computeThreat(target, object, selected, distance, world.rules.general.threat);
        if (threat > bestThreat) {
          best = { target, weapon: selected };
          bestThreat = threat;
        }
      }
    }
    // 敞开运输车：若自身武器找不到目标，改用乘员武器的更大射程再扫一轮。
    if (!best.target && object.transportTrait && object.rules.openTopped && object.transportTrait.units.length) {
      let passengerScanRadius = 0;
      for (const passenger of object.transportTrait.units) {
        const psgWeapon = passenger.armedTrait?.getOpenToppedWeapon();
        if (psgWeapon && psgWeapon.range > passengerScanRadius) passengerScanRadius = psgWeapon.range;
      }
      passengerScanRadius += 1 + 3 + world.rules.elevationModel.bonusCap;
      for (const target of this.scanTechnosAround(object, passengerScanRadius, world)) {
        if (!this.canPassiveAcquire(target, world) || !world.isValidTarget(target)) continue;
        const targetArmor = target.isTechno() ? target.rules.armor : undefined;
        for (const passenger of object.transportTrait.units) {
          const psgWeapon = passenger.armedTrait?.getOpenToppedWeapon();
          if (
            psgWeapon &&
            psgWeapon.targeting.canTarget(target, target.tile, world, false, true) &&
            (targetArmor === undefined || this.checkArmor(psgWeapon.warhead.rules, targetArmor, true)) &&
            this.rangeHelper.isInWeaponRange(object, target, psgWeapon, world.rules) &&
            (ignoreLos || this.losHelper.hasLineOfSight(object, target, psgWeapon))
          ) {
            const distance = this.rangeHelper.distance3(object, target) / Coords.LEPTONS_PER_TILE;
            const threat = this.computeThreat(target, object, psgWeapon, distance, world.rules.general.threat);
            if (threat > bestThreat) {
              best = { target, weapon: psgWeapon };
              bestThreat = threat;
            }
            break;
          }
        }
      }
    }
    if (best.target && object.rules.distributedFire) this.updateDistributedFireHistory(best);
    return best;
  }

  /** 查找周围全部 techno（Box2 范围查询）。 */
  scanTechnosAround(object: any, range: number, world: any): any[] {
    const foundation = object.getFoundation();
    const min = new Vector2(object.tile.rx, object.tile.ry);
    const max = new Vector2(object.tile.rx + foundation.width - 1, object.tile.ry + foundation.height - 1);
    min.addScalar(-range);
    max.addScalar(range);
    const box = new Box2Module.Box2(min, max);
    return world.map.technosByTile.queryRange(box);
  }

  /** 被动获取目标是否合法（中立/平民/无威胁/矿车/伞兵机判定）。 */
  canPassiveAcquire(target: any, world: any): boolean {
    return (
      !target.owner.isNeutral &&
      !target.rules.civilian &&
      (!target.rules.insignificant || (target.isBuilding() && target.garrisonTrait?.isOccupied())) &&
      (target.rules.threatPosed > 1 ||
        (target.isBuilding() && target.garrisonTrait?.isOccupied() && !target.rules.infantryAbsorb) ||
        (target.rules.specialThreatValue > 0 && !target.isBuilding()) ||
        target.rules.harvester ||
        target.name === world.rules.general.paradrop.paradropPlane)
    );
  }

  /** 狂乱单位能否锁定目标（不含建筑、不含无敌/超时空/混乱源）。 */
  canBerserkAcquire(target: any, self: any): boolean {
    return (
      target !== self &&
      !target.isDestroyed &&
      !target.isCrashing &&
      !target.isBuilding() &&
      !target.invulnerableTrait.isActive() &&
      !target.warpedOutTrait.isInvulnerable() &&
      target !== self.berserkTrait?.berserkSource
    );
  }

  /** 狂乱扫描：友方优先 + 随机抖动分散目标。 */
  scanForBerserkTarget(object: any, weapon: any, world: any, scanRange: any, guardArea: any, ignoreLos = false): any {
    let best: any = {};
    let bestThreat = Number.NEGATIVE_INFINITY;
    const weapons = this.getAvailableWeapons(object, true, false);
    const scanRadius = scanRange ?? (object.rules.guardRange || weapon.range) + 1 + 3 + world.rules.elevationModel.bonusCap +
      (weapon.projectileRules.isAntiAir ? object.rules.airRangeBonus : 0);
    for (const target of this.scanTechnosAround(object, scanRadius, world)) {
      if (!this.canBerserkAcquire(target, object)) continue;
      let selected;
      const armor = target.isTechno() ? target.rules.armor : undefined;
      for (const w of weapons) {
        if (w && this.checkArmor(w.warhead.rules, armor, true)) {
          selected = w;
          break;
        }
      }
      if (
        selected &&
        world.isValidTarget(target) &&
        (scanRange
          ? this.rangeHelper.isInRange(object, target, selected.minRange, scanRange, selected.rules.cellRangefinding) &&
            (!guardArea || this.rangeHelper.isInRange2(guardArea, target, 0, scanRange))
          : this.rangeHelper.isInWeaponRange(object, target, selected, world.rules)) &&
        (ignoreLos || this.losHelper.hasLineOfSight(object, target, selected))
      ) {
        const distance = this.rangeHelper.distance3(object, target) / Coords.LEPTONS_PER_TILE;
        let threat = this.computeThreat(target, object, selected, distance, world.rules.general.threat);
        if (world.areFriendly(object, target)) threat += 1e7;
        threat += world.generateRandomInt(0, 9999);
        if (threat > bestThreat) {
          best = { target, weapon: selected };
          bestThreat = threat;
        }
      }
    }
    return best;
  }

  /**
   * 威胁评分：对方武器对己装甲 verses × 系数 → 正被其瞄准惩罚 →
   * 特殊威胁 → 我方对其装甲 verses × 系数 → 血量比 × 系数 → 距离 ×
   * 系数 → 盖特对空加成 → 基础 1e5 → VHP 扫描修正 → 分散火力惩罚。
   */
  computeThreat(target: any, self: any, weapon: any, distance: number, threatRules: any): number {
    let threat =
      [self.primaryWeapon, self.secondaryWeapon]
        .filter(isNotNullOrUndefined)
        .map((w) => w.warhead.rules.verses.get(target.rules.armor) ?? 0)
        .reduce((max, v) => Math.max(max, v), 0) * threatRules.targetEffectivenessCoefficientDefault;
    if (target.attackTrait?.currentTarget?.obj === self) threat *= -1;
    threat += self.rules.specialThreatValue * threatRules.targetSpecialThreatCoefficientDefault;
    threat += (weapon.warhead.rules.verses.get(self.rules.armor) ?? 0) * threatRules.myEffectivenessCoefficientDefault;
    threat += (self.healthTrait.health / 100) * threatRules.targetStrengthCoefficientDefault;
    threat += distance * threatRules.targetDistanceCoefficientDefault;
    // 盖特武器优先攻击空中目标。
    if (self.gattlingTrait && target.isAircraft()) threat += 5e5;
    threat += 1e5;
    // VHP 扫描修正。
    if (self.rules.vhpScan !== VhpScan.None) {
      const projected = self.healthTrait.getProjectedHitPoints();
      if (self.rules.vhpScan === VhpScan.Strong) {
        if (projected <= 0) threat = Number.NEGATIVE_INFINITY;
      } else if (self.rules.vhpScan === VhpScan.Normal) {
        if (projected <= 0) threat /= 2;
        else if (projected <= self.healthTrait.maxHitPoints / 2) threat *= 2;
      }
    }
    // 分散火力：已有人瞄准的目标降低威胁。
    if (self.rules.distributedFire) {
      threat -= 1e6 * (this.distributedFireHistory.get(target) ?? 0);
    }
    return threat;
  }

  /** 更新分散火力历史：目标标记 50 tick 冷却，期间其他单位降低对其威胁。 */
  updateDistributedFireHistory(result: any): void {
    if (this.distributedFireHistory.get(result.target) !== 50) {
      for (const [target, ticks] of this.distributedFireHistory) {
        const newTicks = ticks - 1;
        if (newTicks <= 0) this.distributedFireHistory.delete(target);
        else this.distributedFireHistory.set(target, newTicks);
      }
      this.distributedFireHistory.set(result.target, 50);
    }
  }

  dispose(): void {
    this.distributedFireHistory.clear();
  }
}
