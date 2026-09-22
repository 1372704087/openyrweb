/**
 * AirSpawnTrait — 飞行中队挂载（生成/机库存储/导弹发射序列）。
 *
 * onSpawn 按 spawnsNumber 生成子机入 storage；tick 再生（spawnRegenRate，
 * 导弹型首格带头）、补弹（spawnReloadRate）、推进 missileLaunches
 * （pauseFrames→tilt→MoveTask+CallbackTask 引爆）。prepareLaunch 从
 * storage 取机；导弹设 damage/warhead/launcher，常规连 spawnLinkTrait。
 * storeAircraft unspawn 入库。换主 changeObjectOwner；传送清导弹序列。
 *
 * 由 game/gameobject/trait/AirSpawnTrait.ts.js 重写为 TS（行为完全一
 * 致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as CoordsModule from "game/Coords"; // 已转换
import * as ObjectTypeModule from "engine/type/ObjectType"; // 已转换
import * as WarheadModule from "game/Warhead"; // 未转换（any-shim）
import * as CollisionTypeModule from "game/gameobject/unit/CollisionType"; // 未转换（any-shim）
import * as MoveTaskModule from "game/gameobject/task/move/MoveTask"; // 未转换（any-shim）
import * as CallbackTaskModule from "game/gameobject/task/system/CallbackTask"; // 未转换（any-shim）
import * as TaskGroupModule from "game/gameobject/task/system/TaskGroup"; // 未转换（any-shim）
import * as FacingUtilModule from "game/gameobject/unit/FacingUtil"; // 未转换（any-shim）
import * as NotifyDestroyModule from "game/gameobject/trait/interface/NotifyDestroy"; // 已转换
import * as NotifyOwnerChangeModule from "game/gameobject/trait/interface/NotifyOwnerChange"; // 已转换
import * as NotifySpawnModule from "game/gameobject/trait/interface/NotifySpawn"; // 已转换
import * as NotifyTeleportModule from "game/gameobject/trait/interface/NotifyTeleport"; // 已转换
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as NotifyUnspawnModule from "game/gameobject/trait/interface/NotifyUnspawn"; // 已转换
import * as NotifyWarpChangeModule from "game/gameobject/trait/interface/NotifyWarpChange"; // 已转换
import * as ZoneTypeModule from "game/gameobject/unit/ZoneType"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class AirSpawnTrait {
  /** 已生成的子机（含在机库中的）。 */
  spawns: any[];
  /** 机库中的子机（可发射）。 */
  storage: any[];
  /** 进行中的导弹发射序列。 */
  missileLaunches: any[];
  /** 各格再生冷却（仅 >0 存活）。 */
  nextRegenTicks: number[];
  /** 机库补弹冷却。 */
  nextReloadTicks: number | undefined;

  constructor() {
    this.spawns = [];
    this.storage = [];
    this.missileLaunches = [];
    this.nextRegenTicks = [];
  }

  /** 机库存量。 */
  get availableSpawns() {
    return this.storage.length;
  }

  /** 调试：填充机库。 */
  debugSetStorage(unit: any, count: number) {
    this.storage.length = count;
    this.storage.fill(unit, 0, count);
  }

  /** 是否有导弹在发射流程中。 */
  isLaunchingMissiles() {
    return this.missileLaunches.length > 0;
  }

  /** 出生：按 spawnsNumber 生成子机。 */
  [NotifySpawnModule.NotifySpawn.onSpawn](object: any, world: any) {
    const spawnRules = world.rules.getObject(object.rules.spawns, ObjectTypeModule.ObjectType.Aircraft);
    for (let i = 0; i < object.rules.spawnsNumber; i++) this.pushNewSpawn(spawnRules, world, object);
  }

  /** 离场：销毁全部子机。 */
  [NotifyUnspawnModule.NotifyUnspawn.onUnspawn](object: any, world: any) {
    this.destroySpawns(object, world);
  }

  /** 摧毁：销毁全部子机（透传 attacker/destroy 标志）。 */
  [NotifyDestroyModule.NotifyDestroy.onDestroy](object: any, world: any, attacker: any, destroyFlag: any) {
    this.destroySpawns(object, world, attacker, destroyFlag);
  }

  /** 生成一架子机入 spawns+storage；导弹型设初始 pitch。 */
  pushNewSpawn(spawnRules: any, world: any, parent: any) {
    const unit = world.createUnitForPlayer(spawnRules, parent.owner);
    unit.limboData = { selected: false, controlGroup: undefined };
    if (spawnRules.missileSpawn) {
      unit.pitch = 90 * world.rules.general.getMissileRules(spawnRules.name).pitchInitial;
    }
    this.spawns.push(unit);
    this.storage.push(unit);
  }

  /** 销毁全部子机：在场可坠毁则 crash，否则同步状态后 destroyObject。 */
  destroySpawns(parent: any, world: any, attacker?: any, destroyFlag?: any) {
    for (const spawn of this.spawns) {
      if (spawn.isDestroyed) continue;
      if (spawn.isSpawned && !spawn.rules.missileSpawn && spawn.crashableTrait) {
        spawn.crashableTrait.crash(attacker);
      } else {
        if (!spawn.isSpawned) {
          if (spawn.armedTrait) spawn.armedTrait.deathWeapon = undefined;
          spawn.position.tileElevation = parent.position.tileElevation;
          spawn.zone = parent.isUnit() ? parent.zone : ZoneTypeModule.ZoneType.Ground;
          spawn.onBridge = !!parent.isUnit() && parent.onBridge;
          spawn.position.tile = parent.tile;
        }
        world.destroyObject(spawn, attacker, destroyFlag);
      }
    }
    this.spawns.length = 0;
    this.storage.length = 0;
    this.missileLaunches.length = 0;
  }

  /**
   * 每 tick：清理已毁、再生、补弹、推进导弹发射。
   * 再生：导弹型非首格先复制首格进度；否则 ??= spawnRegenRate 后倒数；
   * 归零 pushNewSpawn，最后过滤仍 >0 的槽位。
   */
  [NotifyTickModule.NotifyTick.onTick](parent: any, world: any) {
    this.spawns = this.spawns.filter((s) => !s.isDestroyed);
    this.missileLaunches = this.missileLaunches.filter((l) => !l.missile.isDestroyed);
    if (this.spawns.length < parent.rules.spawnsNumber) {
      const missing = parent.rules.spawnsNumber - this.spawns.length;
      const spawnRules = world.rules.getObject(parent.rules.spawns, ObjectTypeModule.ObjectType.Aircraft);
      for (let i = 0; i < missing; i++) {
        if (spawnRules.missileSpawn && i && this.nextRegenTicks[i] === undefined) {
          this.nextRegenTicks[i] = this.nextRegenTicks[0];
        } else {
          if (this.nextRegenTicks[i] === undefined) this.nextRegenTicks[i] = parent.rules.spawnRegenRate;
          if (this.nextRegenTicks[i] > 0) this.nextRegenTicks[i]--;
        }
        if (this.nextRegenTicks[i] <= 0) this.pushNewSpawn(spawnRules, world, parent);
      }
      this.nextRegenTicks = this.nextRegenTicks.filter((t) => t > 0);
    }
    if (this.storage.length) {
      if (this.nextReloadTicks === undefined) this.nextReloadTicks = parent.rules.spawnReloadRate;
      if (this.nextReloadTicks > 0) this.nextReloadTicks--;
      if (this.nextReloadTicks <= 0) {
        for (const unit of this.storage) {
          if (unit.ammoTrait && unit.ammoTrait.ammo < unit.ammoTrait.maxAmmo) unit.ammoTrait.ammo++;
        }
        this.nextReloadTicks = parent.rules.spawnReloadRate;
      }
    } else {
      this.nextReloadTicks = undefined;
    }
    for (const launch of [...this.missileLaunches]) {
      // 下潜中跳过升空（仍在 limbo 且母体正在上浮）
      if (launch.missile.limboData && parent.submergibleTrait && parent.submergibleTrait.getSurfaceProgress() > 0) {
        continue;
      }
      if (launch.missile.limboData) world.unlimboObject(launch.missile, launch.missile.position.tile);
      let missileRules = world.rules.general.getMissileRules(launch.missile.name);
      if (launch.pauseFrames === undefined) launch.pauseFrames = missileRules.pauseFrames;
      if (launch.pauseFrames > 0) launch.pauseFrames--;
      if (launch.pauseFrames <= 0) {
        const missile = launch.missile;
        const finalPitch = 90 * missileRules.pitchFinal;
        const raiseRate = missileRules.raiseRate || 0;
        if (launch.tiltFramesRemaining === undefined) launch.tiltFramesRemaining = missileRules.tiltFrames;
        if (launch.tiltFramesRemaining > 0) {
          const pitchDelta = (90 * (missileRules.pitchFinal - missileRules.pitchInitial)) / missileRules.tiltFrames;
          missile.pitch = Math.min(finalPitch, missile.pitch + pitchDelta);
          if (raiseRate) missile.position.worldPosition.y += raiseRate;
          launch.tiltFramesRemaining--;
        } else {
          missile.unitOrderTrait.addTask(
            new TaskGroupModule.TaskGroup(
              new MoveTaskModule.MoveTask(world, launch.targetTile, !!launch.targetBridge),
              new CallbackTaskModule.CallbackTask(() => {
                if (missile.isDestroyed) return;
                world.unspawnObject(missile);
                missile.dispose();
                const facingOffset = CoordsModule.Coords.vecGroundToWorld(
                  FacingUtilModule.FacingUtil.toMapCoords(missile.direction).multiplyScalar(1),
                );
                const detonateAt = launch.targetWorldPos.clone().add(facingOffset);
                const zone = world.map.getTileZone(launch.targetTile);
                launch.warhead.detonate(
                  world,
                  launch.damage,
                  launch.targetTile,
                  launch.targetBridge?.tileElevation ?? 0,
                  detonateAt,
                  zone,
                  launch.targetBridge
                    ? CollisionTypeModule.CollisionType.OnBridge
                    : CollisionTypeModule.CollisionType.None,
                  launch.target,
                  { player: missile.owner, obj: parent, weapon: undefined },
                );
              }),
            ).setCancellable(false),
          );
          const idx = this.spawns.indexOf(missile);
          if (idx === -1) throw new Error("Missile not found in spawns list");
          this.spawns.splice(idx, 1);
          this.missileLaunches.splice(this.missileLaunches.indexOf(launch), 1);
        }
      }
    }
  }

  /** 换主：存活子机随 object.owner（已是新主）转移。 */
  [NotifyOwnerChangeModule.NotifyOwnerChange.onChange](object: any, _oldOwner: any, world: any) {
    for (const spawn of this.spawns) {
      if (!spawn.isDestroyed) world.changeObjectOwner(spawn, object.owner);
    }
  }

  /** 传送开启时清导弹序列。 */
  [NotifyWarpChangeModule.NotifyWarpChange.onChange](_object: any, world: any, active: any) {
    if (active) this.removeMissileLaunches(world);
  }

  /** 传送前（未取消）清导弹序列。 */
  [NotifyTeleportModule.NotifyTeleport.onBeforeTeleport](_object: any, world: any, _target: any, cancelled: any) {
    if (!cancelled) this.removeMissileLaunches(world);
  }

  /** unspawn+dispose 全部进行中导弹并从 spawns 移除。 */
  removeMissileLaunches(world: any) {
    if (this.missileLaunches.length) {
      for (const launch of this.missileLaunches) {
        world.unspawnObject(launch.missile);
        launch.missile.dispose();
        const idx = this.spawns.indexOf(launch.missile);
        if (idx === -1) throw new Error("Missile not found in spawns list");
        this.spawns.splice(idx, 1);
      }
      this.missileLaunches.length = 0;
    }
  }

  /**
   * 发射一架：下潜中 emerge；导弹设 damage/warhead 入 missileLaunches；
   * 常规连 spawnLinkTrait.setParent。无可发则 undefined。
   */
  prepareLaunch(parent: any, target: any, world: any) {
    parent.submergibleTrait?.emerge(parent, world);
    if (parent.submergibleTrait && parent.submergibleTrait.getSurfaceProgress() > 0) return;
    if (this.storage.length) {
      const unit = this.storage[0];
      if (!unit.ammo) return;
      this.storage.shift();
      if (unit.missileSpawnTrait) {
        let warheadName: any;
        let damage: any;
        const elite = parent.veteranTrait?.isElite();
        const rules = world.rules;
        if (parent.rules.spawns === rules.general.v3Rocket.type) {
          warheadName = elite ? rules.combatDamage.v3EliteWarhead : rules.combatDamage.v3Warhead;
          damage = elite ? rules.general.v3Rocket.eliteDamage : rules.general.v3Rocket.damage;
        } else if (parent.rules.spawns === rules.general.dMisl.type) {
          warheadName = elite ? rules.combatDamage.dMislEliteWarhead : rules.combatDamage.dMislWarhead;
          damage = elite ? rules.general.dMisl.eliteDamage : rules.general.dMisl.damage;
        } else if (parent.rules.spawns === rules.general.cMisl.type) {
          warheadName = elite ? rules.combatDamage.cMislEliteWarhead : rules.combatDamage.cMislWarhead;
          damage = elite ? rules.general.cMisl.eliteDamage : rules.general.cMisl.damage;
        } else {
          throw new Error(`Unhandled missile type "${parent.rules.spawns}"`);
        }
        const warhead = new WarheadModule.Warhead(world.rules.getWarhead(warheadName));
        unit.missileSpawnTrait.setDamage(damage).setWarhead(warhead).setLauncher(parent);
        this.missileLaunches.push({
          missile: unit,
          targetTile: (target.obj?.isUnit() ? target.obj : target).tile,
          targetBridge: target.getBridge(),
          targetWorldPos: target.getWorldCoords().clone(),
          target,
          warhead,
          damage,
          pauseFrames: undefined,
        });
      } else {
        if (!unit.spawnLinkTrait) {
          throw new Error(`Aircraft "${unit.name}" must have Spawned=yes to be launchable`);
        }
        unit.spawnLinkTrait.setParent(parent);
      }
      return unit;
    }
  }

  /** 把在场子机 unspawn 入机库。 */
  storeAircraft(unit: any, world: any) {
    if (!this.spawns.includes(unit)) {
      throw new Error(`Object "${unit.name}#${unit.id}" not found in list of linked spawns`);
    }
    if (unit.limboData) throw new Error(`Object "${unit.name}#${unit.id}" is already in limbo`);
    world.limboObject(unit, { selected: false, controlGroup: undefined });
    this.storage.push(unit);
  }
}
