/**
 * ParasiteableTrait — 可被寄生 trait（恐怖机器人宿主）。
 *
 * infest 登记寄生者与武器；每 tick 按 organic/武器冷却结算伤害，
 * 可 culling 时直接清空血量。治疗/声波攻击/摧毁/传送触发驱逐或
 * 禁用寄生者（stunParasite）。驱逐时在宿主脚下或相邻可通行格
 * unlimbo 寄生者，否则销毁。
 *
 * 由 game/gameobject/trait/ParasiteableTrait.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { DeathType } from "game/gameobject/common/DeathType"; // 未转换（any-shim）
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 未转换（any-shim）
import { Vehicle } from "game/gameobject/Vehicle"; // 未转换（any-shim）
import * as NotifyAttackModule from "game/gameobject/trait/interface/NotifyAttack"; // 已转换
import * as NotifyDestroyModule from "game/gameobject/trait/interface/NotifyDestroy"; // 已转换
import * as NotifyHealModule from "game/gameobject/trait/interface/NotifyHeal"; // 已转换
import * as NotifyDamageModule from "game/gameobject/trait/interface/NotifyDamage"; // 已转换
import * as NotifyTeleportModule from "game/gameobject/trait/interface/NotifyTeleport"; // 已转换
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import { WaitMinutesTask } from "game/gameobject/task/system/WaitMinutesTask"; // 未转换（any-shim）
import { GameSpeed } from "game/GameSpeed"; // 已转换
import { RadialTileFinder } from "game/map/tileFinder/RadialTileFinder"; // 未转换（any-shim）
import { AttackTask } from "game/gameobject/task/AttackTask"; // 未转换（any-shim）

/** 寄生震荡后额外锁定帧。 */
const ROCKING_TICKS_BASE = 10; // Vehicle.ROCKING_TICKS 近似；与孪生 m() 对齐用常量兜底
// 实际孪生依赖 Vehicle.ROCKING_TICKS；此处从 Vehicle 取以保持行为。
const ROCKING_TICKS = (Vehicle as any)?.ROCKING_TICKS ?? ROCKING_TICKS_BASE;

function boardDelayTicks(): number {
  return ROCKING_TICKS + 2;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ParasiteableTrait {
  /** 宿主对象。 */
  gameObject: any;
  /** 是否正被登机/寄生过程中。 */
  beingBoarded: boolean;
  /** 当前寄生者（恐怖机器人）。 */
  parasite: any;
  /** 寄生所用武器。 */
  parasiteWeapon: any;
  /** 距下次寄生伤害的冷却 tick。 */
  damageTickCooldown: number | undefined;
  /** 最近一次外部攻击信息。 */
  lastAttacker: any;
  /** 最近一次外部基础伤害值。 */
  lastExternalBaseDamage: number | undefined;
  /** 最近一次外部伤害发生的 tick。 */
  lastExternalDamageTick: number | undefined;

  constructor(gameObject: any) {
    this.gameObject = gameObject;
    this.beingBoarded = !1;
  }

  /** 开始寄生：重置冷却/攻击记录，麻痹武器禁用移动。 */
  infest(parasite: any, weapon: any): void {
    this.beingBoarded = !1;
    this.parasite = parasite;
    this.parasiteWeapon = weapon;
    this.damageTickCooldown = parasite.rules.organic ? boardDelayTicks() : 0;
    this.lastAttacker = void 0;
    this.lastExternalBaseDamage = void 0;
    this.lastExternalDamageTick = void 0;
    if (weapon.warhead.rules.paralyzes) this.gameObject.moveTrait.setDisabled(!0);
  }

  /** 是否仍被寄生（寄生者存活或正在登机）。 */
  isInfested(): boolean {
    return !(!this.parasite || this.parasite.isDestroyed) || this.beingBoarded;
  }

  /** 武器是否具有麻痹效果。 */
  isParalyzed(): boolean {
    return !!this.parasiteWeapon?.warhead.rules.paralyzes;
  }

  /** 解除寄生：恢复移动并清空引用。 */
  uninfest(): void {
    if (this.parasite) {
      if (this.parasiteWeapon.warhead.rules.paralyzes) this.gameObject.moveTrait.setDisabled(!1);
      this.parasite = void 0;
      this.parasiteWeapon = void 0;
    }
  }

  /** 当前寄生者。 */
  getParasite(): any {
    return this.parasite;
  }

  /** 每 tick：寄生存活则按冷却结算伤害/震荡/驱逐。 */
  [NotifyTickModule.NotifyTick.onTick](host: any, world: any): void {
    if (!this.parasite) return;
    if (this.parasite.isDestroyed) {
      this.uninfest();
      return;
    }
    if (0 < (this.damageTickCooldown ?? 0)) {
      this.damageTickCooldown = (this.damageTickCooldown as number) - 1;
      return;
    }
    const weapon = this.parasiteWeapon;
    this.damageTickCooldown = this.parasite.rules.organic
      ? boardDelayTicks()
      : weapon.getCooldownTicks();
    let baseDamage = weapon.rules.damage;
    if (this.parasite.veteranTrait) {
      baseDamage *= this.parasite.veteranTrait.getVeteranDamageMultiplier();
    }
    let amount = weapon.warhead.computeDamage(baseDamage, host, world);
    if (this.canBeCulled(host, this.parasite, weapon, world)) {
      amount = host.healthTrait.getHitPoints();
    }
    weapon.warhead.inflictDamage(
      amount,
      host,
      { player: this.parasite.owner, obj: this.parasite, weapon },
      world,
    );
    if (host.isCrashing) {
      this.parasiteWeapon.expireCooldown();
      this.evictOrDestroyParasite(host, world);
    } else if (
      !host.isDestroyed &&
      host.isVehicle() &&
      host.zone !== ZoneType.Air &&
      weapon.warhead.rules.rocker
    ) {
      host.applyRocking(90 * (0.5 <= world.generateRandom() ? 1 : -1), 1);
    }
  }

  /** 是否满足 culling（清空血量）条件。 */
  canBeCulled(host: any, parasite: any, weapon: any, world: any): boolean {
    if (!weapon.warhead.rules.culling) return !1;
    const av = world.rules.audioVisual;
    const threshold = parasite.veteranTrait?.isElite() ? av.conditionYellow : av.conditionRed;
    return host.healthTrait.health <= 100 * threshold;
  }

  /** 宿主被治疗：按规则杀死或驱逐寄生者。 */
  [NotifyHealModule.NotifyHeal.onHeal](host: any, world: any, _amount: number, healer: any): void {
    if (
      !this.parasite ||
      this.parasite.isDestroyed ||
      healer === host ||
      (host.isAircraft() && healer?.rules.unitReload)
    ) {
      return;
    }
    if (!this.parasite.rules.organic || healer?.rules.unitRepair) {
      this.parasite.deathType = DeathType.None;
      world.destroyObject(this.parasite, healer ? { player: healer.owner, obj: healer } : void 0);
      this.uninfest();
    } else {
      const p = this.parasite;
      this.evictOrDestroyParasite(host, world);
      this.stunParasite(p, world);
    }
  }

  /** 记录最近外部伤害（非寄生者造成）。 */
  [NotifyDamageModule.NotifyDamage.onDamage](
    _host: any,
    world: any,
    fallbackDamage: number,
    info: any,
  ): void {
    if (info?.obj !== this.parasite) {
      this.lastAttacker = info;
      this.lastExternalBaseDamage = info?.weapon?.rules.damage ?? fallbackDamage;
      this.lastExternalDamageTick = world.currentTick;
    }
  }

  /** 宿主被声波攻击：驱逐+眩晕寄生者并可能反伤。 */
  [NotifyAttackModule.NotifyAttack.onAttack](
    host: any,
    attackInfo: any,
    world: any,
  ): void {
    if (this.parasite && !this.parasite.isDestroyed && attackInfo?.weapon?.warhead.rules.sonic) {
      const p = this.parasite;
      this.evictOrDestroyParasite(host, world);
      this.stunParasite(p, world);
      const warhead = attackInfo.weapon.warhead;
      if (warhead.canDamage(p, p.tile, p.zone)) {
        const amount = warhead.computeDamage(attackInfo.weapon.rules.damage, p, world);
        warhead.inflictDamage(amount, p, attackInfo, world);
      }
      const task = attackInfo.obj?.unitOrderTrait.getCurrentTask();
      if (task instanceof AttackTask && task.getWeapon().warhead.rules.sonic) task.cancel();
    }
  }

  /** 宿主销毁：按压制规则杀死或驱逐寄生者。 */
  [NotifyDestroyModule.NotifyDestroy.onDestroy](
    host: any,
    world: any,
    attackerInfo: any,
    lethal: boolean,
  ): void {
    if (!this.parasite || this.parasite.isDestroyed) return;
    if (lethal || this.shouldSupressParasite(world, this.parasite)) {
      this.parasite.deathType = DeathType.None;
      world.destroyObject(this.parasite, attackerInfo, lethal);
      this.uninfest();
    } else {
      this.parasiteWeapon.expireCooldown();
      this.evictOrDestroyParasite(host, world);
    }
  }

  /** 是否满足压制（直接杀死寄生者）阈值。 */
  shouldSupressParasite(world: any, parasite: any): boolean {
    return (
      !parasite.invulnerableTrait.isActive() &&
      !!this.lastExternalBaseDamage &&
      this.lastExternalBaseDamage > parasite.rules.suppressionThreshold &&
      world.currentTick - (this.lastExternalDamageTick ?? 0) <
        2 * (this.lastExternalBaseDamage - parasite.rules.suppressionThreshold)
    );
  }

  /** 传送前：压制则杀，否则驱逐+眩晕。 */
  [NotifyTeleportModule.NotifyTeleport.onBeforeTeleport](
    obj: any,
    world: any,
    _from: any,
    toAny: any,
    isWarp: any,
  ): void {
    if (!toAny || !isWarp || !this.parasite || this.parasite.isDestroyed) return;
    if (this.shouldSupressParasite(world, this.parasite)) {
      this.parasite.deathType = DeathType.None;
      world.destroyObject(this.parasite, this.lastAttacker);
      this.uninfest();
    } else {
      this.parasiteWeapon.expireCooldown();
      const p = this.parasite;
      this.evictOrDestroyParasite(obj, world, !0);
      if (!p.isDestroyed) this.stunParasite(p, world);
    }
  }

  /** 眩晕寄生者：10 秒不可取消等待 + 潜水上浮 + 解除隐形。 */
  stunParasite(parasite: any, world: any): void {
    parasite.unitOrderTrait.addTaskToFront(new WaitMinutesTask(10 / 60).setCancellable(!1));
    if (parasite.isVehicle() && parasite.submergibleTrait) {
      parasite.submergibleTrait.emerge(parasite, world);
      parasite.cloakableTrait?.uncloak(world);
      parasite.submergibleTrait.setCooldown(10 * GameSpeed.BASE_TICKS_PER_SECOND);
    }
  }

  /** 将寄生者放到宿主脚下或相邻可通行格；无处可放则销毁。 */
  evictOrDestroyParasite(host: any, world: any, force = false): void {
    if (!this.parasite || this.parasite.isDestroyed) return;
    const groundHere =
      0 <
        world.map.terrain.getPassableSpeed(
          host.tile,
          this.parasite.rules.speedType,
          this.parasite.isInfantry(),
          host.onBridge,
        ) || !!world.map.getObjectsOnTile(host.tile).find((o: any) => o.isBuilding());
    if (groundHere) {
      let dest = host.tile;
      const onBridge = host.onBridge;
      if ((!force && !host.isDestroyed) || this.parasite.rules.organic) {
        const finder = new RadialTileFinder(
          world.map.tiles,
          world.map.mapBounds,
          dest,
          { width: 1, height: 1 },
          1,
          1,
          (tile: any) =>
            0 <
              world.map.terrain.getPassableSpeed(
                tile,
                this.parasite.rules.speedType,
                this.parasite.isInfantry(),
                onBridge,
              ) &&
            !world.map.terrain.findObstacles({ tile, onBridge }, this.parasite).length,
        );
        const alt = finder.getNextTile();
        if (!alt) {
          this.parasite.deathType = DeathType.None;
          world.destroyObject(this.parasite, { player: host.owner, obj: host });
          this.uninfest();
          return;
        }
        dest = alt;
      }
      this.parasite.onBridge = onBridge;
      this.parasite.position.subCell = this.parasite.isInfantry() ? host.position.subCell : 0;
      this.parasite.zone = world.map.getTileZone(dest, !onBridge);
      this.parasite.position.tileElevation = onBridge
        ? world.map.tileOccupation.getBridgeOnTile(dest).tileElevation
        : 0;
      this.parasite.resetGuardModeToIdle();
      world.unlimboObject(this.parasite, dest, !0);
    } else {
      this.parasite.deathType = DeathType.None;
      world.destroyObject(this.parasite, { player: host.owner, obj: host });
    }
    this.uninfest();
  }

  /** 直接销毁寄生者并解除。 */
  destroyParasite(attackerInfo: any, world: any): void {
    if (this.parasite) {
      this.parasite.deathType = DeathType.None;
      world.destroyObject(this.parasite, attackerInfo);
      this.uninfest();
    }
  }

  /** 释放宿主引用。 */
  dispose(): void {
    this.gameObject = void 0;
  }
}
