/**
 * SlaveMinerVehicleTrait — 奴隶矿车自主寻矿展开 AI trait（YASLMN）。
 *
 * 车辆形态不是普通矿车而是可展开精炼厂：空闲时 LongScan 找最近矿，
 * 在 ScanCorrection 内找可放置点 MoveTask 前往，到场 ShortScan 可展开
 * 则 DeployIntoTask。玩家指令期间锁 KickFrameDelay 防抢控；工厂出厂
 * 跳过锁。AI 按难度上限避让已有矿场找新矿脉。变形时把奴隶池交回
 * 建筑（_stashSlavesForMorph → _pendingMinerSlaves）。
 *
 * 由 game/gameobject/trait/SlaveMinerVehicleTrait.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as NotifySpawnModule from "game/gameobject/trait/interface/NotifySpawn"; // 已转换
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as NotifyDestroyModule from "game/gameobject/trait/interface/NotifyDestroy"; // 已转换
import { RadialTileFinder } from "game/map/tileFinder/RadialTileFinder"; // 未转换（any-shim）
import { LandType } from "game/type/LandType"; // 已转换
import { TiberiumTrait } from "game/gameobject/trait/TiberiumTrait"; // 已转换
import { MoveTask } from "game/gameobject/task/move/MoveTask"; // 未转换（any-shim）
import { DeployIntoTask } from "game/gameobject/task/morph/DeployIntoTask"; // 未转换（any-shim）
import { SlaveGatherTask } from "game/gameobject/task/SlaveGatherTask"; // 未转换（any-shim）
import { ObjectType } from "engine/type/ObjectType"; // 未转换（any-shim）

/**
 * 动作后小 settle 冷却（tick）。无 INI 对应，仅避免同帧连发。
 * Radii 多数来自 GeneralRules：SlaveMinerShortScan / LongScan /
 * ScanCorrection / KickFrameDelay。
 */
const POST_ACTION_COOLDOWN = 7;

/* eslint-disable @typescript-eslint/no-explicit-any */
export class SlaveMinerVehicleTrait {
  /** AI 扫描冷却剩余 tick。 */
  scanCooldown: number;
  /** 玩家控制锁剩余 tick（期间 AI 不抢控）。 */
  _playerLockTicks: number;
  /** 当前任务是否工厂 ExitFactory（跳过玩家锁）。 */
  _aiTaskingIsFactory: boolean;
  /**
   * 奴隶池（车辆形态内随车，不在地图上单独寻路）。
   * 出生认领 _pendingMinerSlaves 或变形移交；展开时 _stashSlavesForMorph 交回。
   */
  slaves: any[];

  constructor() {
    this.scanCooldown = 0;
    this._playerLockTicks = 0;
    this._aiTaskingIsFactory = !1;
    // (2026-06-30, REVERSED): slaves ride INSIDE the vehicle (off the map).
    this.slaves = [];
  }

  /** 出生：重置锁；按来路设 AI 冷却/锁；认领移交奴隶池并重指采集。 */
  [NotifySpawnModule.NotifySpawn.onSpawn](obj: any, world: any): void {
    this._playerLockTicks = 0;
    if (world._slaveMinerAutoDeployMode) {
      // auto-undeploy (no-ore timer expired): seek and deploy immediately
      this.scanCooldown = 0;
      world._slaveMinerAutoDeployMode = !1;
    } else if (obj.unitOrderTrait && obj.unitOrderTrait.hasTasks && obj.unitOrderTrait.hasTasks()) {
      // factory-produced: has ExitFactoryTask, skip player lock via _aiTaskingIsFactory
      this._aiTaskingIsFactory = !0;
      this.scanCooldown = 0;
    } else {
      // manual undeploy or script spawn: enforce player-lock delay before AI resumes
      this._playerLockTicks = world.rules.general.slaveMinerKickFrameDelay || 150;
    }
    // claim any slave pool handed over from the just-undeployed building and repoint
    // their gather task at THIS vehicle …
    try {
      if (world._pendingMinerSlaves && world._pendingMinerSlaves.length) {
        for (const sv of world._pendingMinerSlaves) {
          if (sv && !sv.isDisposed && !sv.isDestroyed) {
            this.slaves.push(sv);
            try {
              sv.unitOrderTrait?.cancelAll?.();
              sv.unitOrderTrait?.addTask?.(new SlaveGatherTask(world, obj));
            } catch {
              /* ignore */
            }
          }
        }
        world._pendingMinerSlaves = [];
      }
    } catch {
      /* ignore */
    }
  }

  /**
   * 变形前调用：把奴隶池交给 game._pendingMinerSlaves，由新建筑
   * NotifySpawn 认领并重指采集（走门卸矿动画）。
   */
  _stashSlavesForMorph(game: any): void {
    try {
      if (!game._pendingMinerSlaves) game._pendingMinerSlaves = [];
      for (const sv of this.slaves) {
        if (sv && !sv.isDisposed && !sv.isDestroyed) game._pendingMinerSlaves.push(sv);
      }
    } catch {
      /* ignore */
    }
    this.slaves = [];
  }

  /**
   * 车辆形态被毁/售：奴隶随车在地图上被杀（不解放给摧毁者），
   * 与原版“收起形态不解放、展开建筑形态才解放”一致。
   */
  [NotifyDestroyModule.NotifyDestroy.onDestroy](
    _obj: any,
    world: any,
    attackerInfo: any,
  ): void {
    for (const sv of this.slaves) {
      if (!sv || sv.isDisposed || sv.isDestroyed) continue;
      try {
        world.destroyObject(sv, attackerInfo, !0);
      } catch {
        /* ignore */
      }
    }
    this.slaves = [];
  }

  /** tile 是否为有剩余 bail 的矿格。 */
  private _isOreTile(game: any, tile: any): boolean {
    if (!tile || tile.landType !== LandType.Tiberium) return !1;
    const ov = game.map.getGroundObjectsOnTile(tile).find((o: any) => o.isOverlay() && o.isTiberium());
    const tv = ov && ov.traits ? ov.traits.get(TiberiumTrait) : void 0;
    return !!(tv && 0 < tv.getBailCount());
  }

  /** 半径 a 内是否有可采矿。 */
  private _hasOreNearby(game: any, _obj: any, center: any, radius: number): boolean {
    const finder = new RadialTileFinder(
      game.map.tiles,
      game.map.mapBounds,
      center,
      { width: 1, height: 1 },
      0,
      radius,
      (tile: any) => this._isOreTile(game, tile),
    );
    if (finder.getNextTile()) return true;
    return false;
  }

  /** 半径内矿 bail 总数。 */
  private _countOreBailsAround(game: any, center: any, radius: number): number {
    let total = 0;
    const finder = new RadialTileFinder(
      game.map.tiles,
      game.map.mapBounds,
      center,
      { width: 1, height: 1 },
      0,
      radius,
      () => !0,
    );
    let tile;
    while ((tile = finder.getNextTile())) {
      if (tile.landType !== LandType.Tiberium) continue;
      const ov = game.map.getGroundObjectsOnTile(tile).find((o: any) => o.isOverlay() && o.isTiberium());
      const tv = ov && ov.traits ? ov.traits.get(TiberiumTrait) : void 0;
      if (tv && 0 < tv.getBailCount()) total += tv.getBailCount();
    }
    return total;
  }

  /** LongScan 找最近可达矿格（岛连通，避免开向对岸）。 */
  private _findNearestOre(game: any, obj: any): any {
    const spd = obj.rules.speedType;
    const islands = game.map.terrain.getIslandIdMap(spd, !1);
    const home = islands ? islands.get(obj.tile, obj.onBridge) : void 0;
    const finder = new RadialTileFinder(
      game.map.tiles,
      game.map.mapBounds,
      obj.tile,
      { width: 1, height: 1 },
      0,
      game.rules.general.slaveMinerLongScan,
      (tile: any) =>
        !!tile &&
        tile.landType === LandType.Tiberium &&
        0 < game.map.terrain.getPassableSpeed(tile, spd, !1, !1) &&
        Math.abs(tile.z - obj.tile.z) < 2 &&
        (!islands || islands.get(tile, !1) === home) &&
        this._isOreTile(game, tile),
    );
    return finder.getNextTile();
  }

  /** 矿旁找 DeploysInto 可放置且曼哈顿最近的格。 */
  private _findPlaceableNear(game: any, obj: any, oreTile: any): any {
    const worker = game.getConstructionWorker(obj.owner);
    const rules = obj.rules.deploysInto;
    const finder = new RadialTileFinder(
      game.map.tiles,
      game.map.mapBounds,
      oreTile,
      { width: 1, height: 1 },
      0,
      game.rules.general.slaveMinerScanCorrection,
      () => !0,
    );
    let best: any = void 0;
    let bestDist = Number.POSITIVE_INFINITY;
    let tile;
    while ((tile = finder.getNextTile())) {
      if (
        worker.canPlaceAt(rules, tile, { ignoreAdjacent: !0, ignoreObjects: [obj] }) &&
        tile.passable !== !1
      ) {
        const dist = Math.abs(tile.rx - obj.tile.rx) + Math.abs(tile.ry - obj.tile.ry);
        if (dist < bestDist) {
          bestDist = dist;
          best = tile;
        }
      }
    }
    return best;
  }

  /** 当前格能否直接展开（可放置 + 足下有矿）。 */
  private _canDeployHere(game: any, obj: any): boolean {
    const worker = game.getConstructionWorker(obj.owner);
    if (
      !obj.rules.deploysInto ||
      !worker.canPlaceAt(obj.rules.deploysInto, obj.tile, {
        ignoreAdjacent: !0,
        ignoreObjects: [obj],
      })
    ) {
      return !1;
    }
    const totalOre = this._countOreBailsAround(
      game,
      obj.tile,
      game.rules.general.slaveMinerShortScan,
    );
    return totalOre > 0;
  }

  /**
   * 每 tick：玩家锁 → 扫描冷却 → AI 矿场上限避让 → 脚下展开
   * → LongScan 寻矿 + 可放置点 MoveTask → 无矿长冷却。
   * 参数顺序与孪生一致：(vehicle, world)。
   */
  [NotifyTickModule.NotifyTick.onTick](obj: any, world: any): void {
    if (!obj.isVehicle || !obj.isVehicle()) return;
    const vt = obj;
    // ---- player-control lock ----
    const hasOrders =
      vt.unitOrderTrait && vt.unitOrderTrait.hasTasks && vt.unitOrderTrait.hasTasks();
    if (hasOrders) {
      if (!this._aiTaskingIsFactory) {
        this._playerLockTicks = world.rules.general.slaveMinerKickFrameDelay || 150;
      }
      return;
    }
    // clear factory flag once ExitFactoryTask finishes
    if (this._aiTaskingIsFactory) {
      this._aiTaskingIsFactory = !1;
    }
    if (this._playerLockTicks > 0) {
      this._playerLockTicks--;
      return;
    }
    // ---- scan cooldown ----
    if (this.scanCooldown > 0) {
      this.scanCooldown--;
      return;
    }
    const deployTarget = vt.rules.deploysInto;
    if (!deployTarget) return;
    const bldgRules = world.rules.getObject(deployTarget, ObjectType.Building);
    if (!bldgRules) return;
    // ---- AI slave miner count limit (AISlaveMinerNumber=4,3,2) ----
    if (vt.owner.isAi) {
      const aiLimits = (world.rules.ai && world.rules.ai.aislaveMinerNumber) || [4, 3, 2];
      const aiDiffIdx = vt.owner.aiDifficulty;
      const aiMax = aiLimits[Math.min(aiDiffIdx, aiLimits.length - 1)] || 4;
      let aiDeployed = 0;
      const existingMinerTiles: any[] = [];
      try {
        for (const cobj of world.combatants.get(vt.owner)?.allObjects || []) {
          if (
            cobj !== vt &&
            cobj.isBuilding &&
            !cobj.isDisposed &&
            !cobj.isDestroyed &&
            cobj.rules &&
            cobj.rules.slaveMiner
          ) {
            aiDeployed++;
            if (cobj.tile) existingMinerTiles.push(cobj.tile);
          }
        }
      } catch {
        /* ignore */
      }
      if (aiDeployed >= aiMax) {
        // at limit → find an ore field NOT near our existing deployed miners
        let farOre: any = void 0;
        let farPlace: any = void 0;
        // 孪生此处只传 6 参（predicate 为 undefined），与 RadialTileFinder 锁步
        const rf = new (RadialTileFinder as any)(
          world.map.tiles,
          world.map.mapBounds,
          vt.tile,
          { width: 1, height: 1 },
          0,
          world.rules.general.slaveMinerLongScan,
        );
        let scanTile;
        while ((scanTile = rf.getNextTile())) {
          if (!this._isOreTile(world, scanTile)) continue;
          let tooClose = !1;
          for (const mt of existingMinerTiles) {
            if (
              Math.abs(mt.rx - scanTile.rx) + Math.abs(mt.ry - scanTile.ry) <=
              world.rules.general.slaveMinerShortScan
            ) {
              tooClose = !0;
              break;
            }
          }
          if (tooClose) continue;
          farOre = scanTile;
          farPlace = this._findPlaceableNear(world, vt, farOre);
          if (farPlace) break;
        }
        if (farPlace) {
          vt.unitOrderTrait.addTask(new MoveTask(world, farPlace, !1));
        } else {
          this.scanCooldown = world.rules.general.slaveMinerKickFrameDelay || 150;
        }
        return;
      }
    }
    // 1) check feet: can deploy and ore under/near us?
    if (this._canDeployHere(world, vt)) {
      vt.unitOrderTrait.addTask(new DeployIntoTask(world));
      return;
    }
    // 2) look far: LongScan (48) for nearest ore
    const oreTile = this._findNearestOre(world, vt);
    if (oreTile) {
      // 3) find placeable spot near ore (ScanCorrection=3)
      const placeTile = this._findPlaceableNear(world, vt, oreTile);
      if (placeTile) {
        vt.unitOrderTrait.addTask(new MoveTask(world, placeTile, !1));
      } else {
        this.scanCooldown = POST_ACTION_COOLDOWN;
      }
    } else {
      // 5) no ore anywhere: long cooldown
      this.scanCooldown = world.rules.general.slaveMinerKickFrameDelay || 150;
    }
  }
}
