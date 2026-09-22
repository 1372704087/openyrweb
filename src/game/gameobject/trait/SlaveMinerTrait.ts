/**
 * SlaveMinerTrait — 奴隶矿场经济 trait（尤里奴隶矿场建筑形态）。
 *
 * 建筑持有奴隶步兵池：采矿/卸矿循环在 SlaveGatherTask；死奴隶按
 * SlaveRegenRate 再生。解放语义（原版）：被敌摧毁→奴隶解放给摧毁者；
 * 换主→奴隶随矿场；无攻击者移除→解放给平民。变形（_morphInFlight）
 * 时静默移交奴隶池给形态目标（_pendingMinerSlaves），不销毁不瞬移。
 * 长期无矿自动 undeploy（_noOreTicks）。
 *
 * 由 game/gameobject/trait/SlaveMinerTrait.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as NotifySpawnModule from "game/gameobject/trait/interface/NotifySpawn"; // 已转换
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as NotifyUnspawnModule from "game/gameobject/trait/interface/NotifyUnspawn"; // 已转换
import * as NotifyDestroyModule from "game/gameobject/trait/interface/NotifyDestroy"; // 已转换
import * as NotifyOwnerChangeModule from "game/gameobject/trait/interface/NotifyOwnerChange"; // 已转换
import { ObjectType } from "engine/type/ObjectType"; // 未转换（any-shim）
import { RadialTileFinder } from "game/map/tileFinder/RadialTileFinder"; // 未转换（any-shim）
import { SlaveGatherTask } from "game/gameobject/task/SlaveGatherTask"; // 未转换（any-shim）
import { MoveTask } from "game/gameobject/task/move/MoveTask"; // 未转换（any-shim）
import { UndeployIntoTask } from "game/gameobject/task/morph/UndeployIntoTask"; // 未转换（any-shim）
import { LandType } from "game/type/LandType"; // 已转换
import { TiberiumTrait } from "game/gameobject/trait/TiberiumTrait"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class SlaveMinerTrait {
  /** 当前存活奴隶池。 */
  slaves: any[];
  /** 距下次常规再生的剩余 tick。 */
  regenTicksLeft: number;
  /** 最近摧毁矿场的攻击方（onDestroy 记，onUnspawn 读）。 */
  _liberator: any;
  /** 是否处于 deploy/undeploy 变形中（MorphIntoTask 置位）。 */
  _morphInFlight: boolean;
  /** 建筑 Ready 后待孵化的初始奴隶数。 */
  _pendingSpawnCount: number;
  /** 初始孵化延迟剩余 tick。 */
  _initialSpawnTicksLeft: number;
  /** 单只奴隶补生延迟剩余 tick。 */
  _respawnTicksLeft: number;
  /** 无矿计数（超阈值自动 undeploy）；初值 150 避免刚建好就收。 */
  _noOreTicks: number;

  constructor() {
    this.slaves = [];
    this.regenTicksLeft = 0;
    // Last attacker that destroyed the miner (set in NotifyDestroy, read in
    // NotifyUnspawn) so we can free slaves to the destroyer. Vanilla YR liberates
    // slaves to the House that killed the Slave Miner.
    this._liberator = void 0;
    // set true by MorphIntoTask just before unspawning the miner, so
    // NotifyUnspawn knows this is a deploy/undeploy morph (NOT a destroy/sell) and
    // silently recalls the slaves instead of liberating them to the civilian player.
    this._morphInFlight = !1;
    // Deferred initial spawn count: slaves are created only after the building
    // reaches buildStatus === Ready (fully deployed), not during BUILDUP.
    this._pendingSpawnCount = 0;
    // Initial spawn delay (game ticks). After buildStatus becomes Ready, wait this
    // many ticks before spawning the first slaves (~2s = 30 ticks @ speed 6).
    this._initialSpawnTicksLeft = 0;
    // Respawn countdown timer (game ticks). Set to ~1s (15 ticks @ speed 6) by
    // scheduleSlaveRespawn(). When it reaches 0, a new slave is spawned at the door.
    this._respawnTicksLeft = 0;
    // counter for auto-undeploy triggered by slaves. Increments each
    // tick when no slave has recently found ore. Reset by any slave finding ore.
    // When it reaches SlaveMinerKickFrameDelay, the building undeploys.
    // Start at a large negative value so a freshly-built building doesn't
    // auto-undeploy before its slaves have a chance to find the nearest ore field.
    this._noOreTicks = 150;
  }

  /** 在门口生成一只奴隶并压入采集任务。 */
  private _spawnOneSlave(game: any, building: any): void {
    const rules = game.rules.getObject(building.rules.slaves, ObjectType.Infantry);
    const slave = game.createUnitForPlayer(rules, building.owner);
    // Door tile = bottom-left cell of the building's foundation
    const doorRy = building.tile.ry + building.art.foundation.height - 1;
    const doorTile =
      game.map.tiles.getByMapCoords(building.tile.rx, doorRy) ??
      game.map.tiles.getPlaceholderTile(building.tile.rx, doorRy);
    // find a free adjacent tile for the slave to walk out to after spawning at the door
    const finder = new RadialTileFinder(
      game.map.tiles,
      game.map.mapBounds,
      doorTile,
      { width: 1, height: 1 },
      1,
      3,
      (tile: any) => {
        const objs = game.map.getGroundObjectsOnTile(tile);
        return !objs.some((o: any) => o.isTechno()) && tile.passable !== !1;
      },
    );
    const exitTile = finder.getNextTile() ?? doorTile;
    // Vanilla YR: slaves spawn at the door (bottom-left) of the building and walk out.
    game.spawnObject(slave, doorTile);
    this.slaves.push(slave);
    if (exitTile !== doorTile) slave.unitOrderTrait.addTask(new MoveTask(game, exitTile, void 0));
    slave.unitOrderTrait.addTask(new SlaveGatherTask(game, building));
  }

  /** 约 1 秒后补一只奴隶（卸矿消耗时调用）。 */
  scheduleSlaveRespawn(): void {
    this._respawnTicksLeft = 15; // ~1s at game speed 6 (15 ticks per game minute)
  }

  /**
   * 解放存活奴隶：转移所有权、取消自动采集、打 liberated 标、清空池。
   * 不得改写共享 rules.slaved（按类型共享），故用实例级 liberated 标。
   */
  private _liberateSlaves(game: any, obj: any, newOwner: any): void {
    if (!newOwner) return;
    for (const slave of this.slaves) {
      if (slave.isDisposed || slave.isDestroyed) continue;
      // cancel the auto-gather loop so the liberator can issue orders
      slave.unitOrderTrait?.cancelAll?.();
      // mark freed so UnitSelectionHandler lets it be selected (slaved && !liberated)
      try {
        (slave as any).liberated = !0;
      } catch {
        /* ignore */
      }
      if (slave.owner !== newOwner) game.changeObjectOwner(slave, newOwner);
    }
    this.slaves = [];
  }

  /** 出生：认领变形移交的奴隶池，或记录初始待孵化数量。 */
  [NotifySpawnModule.NotifySpawn.onSpawn](obj: any, world: any): void {
    // (2026-06-30, REVERSED): on deploy (vehicle→building) the slaves that
    // were following the vehicle are claimed here and their SlaveGatherTask.miner is
    // repointed at this building …
    let claimed = !1;
    try {
      if (world._pendingMinerSlaves && world._pendingMinerSlaves.length) {
        for (const sv of world._pendingMinerSlaves) {
          if (!sv || sv.isDisposed || sv.isDestroyed) continue;
          this.slaves.push(sv);
          this._repointSlaveMiner(sv, obj, world);
        }
        world._pendingMinerSlaves = [];
        claimed = !0;
      }
    } catch {
      /* ignore */
    }
    if (!claimed && obj.owner.isCombatant()) {
      this._pendingSpawnCount = obj.rules.initialSlaves;
    }
  }

  /** 变形后把奴隶采集目标改指向新形态，并预寻矿路径。 */
  private _repointSlaveMiner(slave: any, miner: any, game: any): void {
    try {
      slave.unitOrderTrait?.cancelAll?.();
      if (miner.isBuilding && miner.isBuilding()) {
        if ((slave as any).isCarrying) {
          // Carrying ore: walk to the building to dump.
          slave.unitOrderTrait?.addTask?.(
            new MoveTask(game, miner.tile, !1, { ignoredBlockers: [miner] }),
          );
        } else {
          const oreTile = this._findOreNearMiner(game, miner, slave);
          if (oreTile) slave.unitOrderTrait?.addTask?.(new MoveTask(game, oreTile, !1));
        }
      }
      slave.unitOrderTrait?.addTask?.(new SlaveGatherTask(game, miner));
    } catch {
      /* ignore */
    }
  }

  /** 用奴隶 speedType 扫建筑附近矿格（岛连通 + 可通行）。 */
  private _findOreNearMiner(game: any, building: any, slave: any): any {
    try {
      const spd = slave.rules.speedType;
      const islandMap = game.map.terrain.getIslandIdMap(spd, !0);
      const homeIsland = islandMap ? islandMap.get(building.tile, building.onBridge) : void 0;
      const finder = new RadialTileFinder(
        game.map.tiles,
        game.map.mapBounds,
        building.tile,
        building.getFoundation(),
        1,
        game.rules.general.slaveMinerSlaveScan,
        (tile: any) =>
          tile.landType === LandType.Tiberium &&
          0 < game.map.terrain.getPassableSpeed(tile, spd, !0, !1) &&
          Math.abs(tile.z - building.tile.z) < 2 &&
          (!islandMap || islandMap.get(tile, !1) === homeIsland),
      );
      for (;;) {
        const tile = finder.getNextTile();
        if (!tile) break;
        const ov = game.map
          .getGroundObjectsOnTile(tile)
          .find((o: any) => o.isOverlay() && o.isTiberium());
        const tv = ov && ov.traits ? ov.traits.get(TiberiumTrait) : void 0;
        if (tv && 0 < tv.getBailCount()) return tile;
      }
    } catch {
      /* ignore */
    }
    return void 0;
  }

  /** 每 tick：初始孵化、补生、池清理、无矿自动 undeploy。 */
  [NotifyTickModule.NotifyTick.onTick](obj: any, world: any): void {
    if (!obj.owner || !obj.owner.isCombatant || !obj.owner.isCombatant()) return;
    // Deferred initial spawn: wait until building is fully deployed (buildStatus 1=Ready),
    // then wait an additional ~2 seconds (30 ticks) before spawning the first slaves.
    if (this._pendingSpawnCount > 0 && obj.isBuilding && obj.isBuilding() && obj.buildStatus === 1) {
      if (this._initialSpawnTicksLeft === 0) {
        this._initialSpawnTicksLeft = 30; // ~2s @ speed 6
      }
      if (--this._initialSpawnTicksLeft > 0) return;
      for (let i = 0; i < this._pendingSpawnCount; i++) this._spawnOneSlave(world, obj);
      this._pendingSpawnCount = 0;
    }
    // Respawn timer (vanilla YR: new slave appears at door ~1s after previous slave was consumed)
    if (this._respawnTicksLeft > 0 && 0 >= --this._respawnTicksLeft) {
      this._spawnOneSlave(world, obj);
    }
    // prune dead/destroyed slaves from the pool
    this.slaves = this.slaves.filter((s) => !s.isDisposed && !s.isDestroyed);
    if (this.slaves.length < obj.rules.initialSlaves) {
      // SlaveRegenRate is in frames/ticks (vanilla YR semantics, e.g. 500 ≈ 33s @15fps).
      if (this.regenTicksLeft <= 0) {
        this.regenTicksLeft = obj.rules.slaveRegenRate || 1;
      }
      if (0 >= --this.regenTicksLeft) {
        this.regenTicksLeft = 0;
        this._spawnOneSlave(world, obj);
      }
    } else {
      this.regenTicksLeft = 0;
    }
    // auto-undeploy when no slave has found ore for too long.
    if (obj.isBuilding && obj.isBuilding() && obj.buildStatus === 1) {
      let anyActive = !1;
      for (const sv of this.slaves) {
        if (!sv || sv.isDisposed || sv.isDestroyed) continue;
        if (sv.isCarrying || sv.isHarvesting || (sv as any)._oreLocked) {
          anyActive = !0;
          break;
        }
      }
      if (anyActive) {
        this._noOreTicks = world.rules.general.slaveMinerKickFrameDelay || 150;
      } else if (--this._noOreTicks <= 0) {
        this._noOreTicks = world.rules.general.slaveMinerKickFrameDelay || 150;
        if (!obj.unitOrderTrait || !obj.unitOrderTrait.hasTasks || !obj.unitOrderTrait.hasTasks()) {
          const vehicleType = world.rules.getObject(obj.rules.undeploysInto, ObjectType.Vehicle);
          if (!vehicleType) return;
          // Tell the vehicle to skip the idle delay so it deploys on arrival.
          (world as any)._slaveMinerAutoDeployMode = !0;
          obj.unitOrderTrait.addTask(new UndeployIntoTask(world));
        }
      }
    }
  }

  /** 捕获摧毁者，供 onUnspawn 解放奴隶。 */
  [NotifyDestroyModule.NotifyDestroy.onDestroy](
    _obj: any,
    _world: any,
    attackerInfo: any,
  ): void {
    this._liberator = attackerInfo && attackerInfo.player ? attackerInfo.player : void 0;
  }

  /** 换主：存活奴隶跟随矿场换主。 */
  [NotifyOwnerChangeModule.NotifyOwnerChange.onChange](
    obj: any,
    _old: any,
    world: any,
  ): void {
    // `t`=oldOwner, `i`=game. After changeObjectOwner, e.owner is already the new owner.
    for (const slave of this.slaves) {
      if (slave.isDisposed || slave.isDestroyed) continue;
      if (slave.owner !== obj.owner) world.changeObjectOwner(slave, obj.owner);
    }
  }

  /** 离场：变形移交 / 敌毁解放 / 无主解放或销毁。 */
  [NotifyUnspawnModule.NotifyUnspawn.onUnspawn](obj: any, world: any): void {
    // deploy/undeploy morph — silently recall slaves (no liberation).
    // MorphIntoTask sets _morphInFlight=true just before unspawning the miner.
    //
    // IMPORTANT: do NOT clear _morphInFlight here. Object-level NotifyUnspawn (this
    // handler, fired via GameObject.onUnspawn at Game.doUnspawnObject line ~765) runs
    // BEFORE game-level NotifyUnspawn (ProductionTrait, fired at ~766-768). Clearing the
    // flag here would defeat ProductionTrait's morph guard …
    if (this._morphInFlight) {
      // (2026-06-30, REVERSED @ yrmd.exe): on undeploy (building→vehicle) the
      // slaves do NOT vanish and are NOT teleported — the SlaveManager persists across
      // the morph and the slaves stay on the map, following the new vehicle form.
      // We hand the slave pool to the morph target via game._pendingMinerSlaves; the
      // freshly spawned vehicle's SlaveMinerVehicleTrait.NotifySpawn will claim it …
      try {
        if (!world._pendingMinerSlaves) world._pendingMinerSlaves = [];
        for (const s of this.slaves) {
          if (s && !s.isDisposed && !s.isDestroyed) world._pendingMinerSlaves.push(s);
        }
      } catch {
        /* ignore */
      }
      this.slaves = [];
      return;
    }
    if (this._liberator) {
      // destroyed by an enemy → free slaves to the destroyer (vanilla liberation)
      (obj as any)._slavesLiberated = !0; // flag for SoundHandler to play SlavesFreeSound
      this._liberateSlaves(world, obj, this._liberator);
    } else {
      // sold / limboed with no killer → free to civilian player (neutral free units)
      const civ = world.getCivilianPlayer ? world.getCivilianPlayer() : void 0;
      if (civ) {
        this._liberateSlaves(world, obj, civ);
      } else {
        for (const s of this.slaves) {
          if (!s.isDisposed && !s.isDestroyed) world.destroyObject(s, void 0);
        }
      }
      this.slaves = [];
    }
    this._liberator = void 0;
  }
}
