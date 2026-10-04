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
import { FactoryType } from "game/rules/TechnoRules"; // 已转换

/**
 * 动作后小 settle 冷却（tick）。无 INI 对应，仅避免同帧连发。
 * Radii 多数来自 GeneralRules：SlaveMinerShortScan / LongScan /
 * ScanCorrection / KickFrameDelay。
 */
const POST_ACTION_COOLDOWN = 7;

/**
 * 就地展开时"离己方工厂出口多远才算安全"（曼哈顿格数）。
 *
 * 展开体是精炼厂（3x3）。锚点距出口格 d 时，占位能覆盖到出口格的充分条件
 * 是 |dx| ≤ 2 且 |dy| ≤ 2 ⇒ 曼哈顿距离 ≤ 4。取 4 是该条件的**保守超集**
 * （会连带拒绝少数其实压不到出口的锚点），宁可多让几格，也不能万一压住。
 *
 * （旧值 3 是按"车在出口格上"估的，算漏了占位向外铺开的 2 格——实测锚点
 * 在出口格正东 2 格照样能把集结格盖住。）
 */
const EXIT_BLOCK_RADIUS = 4;

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
    // 落点必须同时满足"能放置"和"展开后不挡住己方出厂通道"——只在下车判定
    // （_canDeployHere）拦是不够的：那样车会一次次走到出口旁的可放置格、
    // 被拒、再被同一个"就近落点"选回来，原地压着集结格不动。
    const avoidExit = !!(obj.owner && obj.owner.isAi);
    const cells = avoidExit ? this._exitCorridorCells(game, obj) : [];
    let tile;
    while ((tile = finder.getNextTile())) {
      if (
        worker.canPlaceAt(rules, tile, { ignoreAdjacent: !0, ignoreObjects: [obj] }) &&
        tile.passable !== !1 &&
        (!avoidExit || this._exitDistance(cells, tile) > EXIT_BLOCK_RADIUS)
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

  /**
   * 己方所有"出兵工厂"的出口格 + 集结格（= 出厂通道必须保持畅通的格）。
   *
   * 两类格各有来源：出生格 `computeExitCoords`（单位被 spawn 处，战车工厂
   * = 占位中心、兵营 = 出口角），集结格 `compute*InternalRallyCoords`
   * （`ExitFactoryTask` 的目标，`strictCloseEnough` 要求精确到达）。
   * `computeExitCoords` 只认兵营/战厂/船坞/机场，建筑工厂（建造厂）会抛错——
   * 正好用来把"不吐单位的厂"过滤掉。
   */
  private _exitCorridorCells(game: any, obj: any): any[] {
    const cells: any[] = [];
    try {
      // 注意：不能用 `game.combatants.get(owner).allObjects` —— 全仓没有
      // `game.combatants` 这个入口，`.allObjects` 也是 World 上那张
      // Map<id,obj>，不是玩家字段。写错时 `?.allObjects || []` 静默退化成
      // 空数组，整个保护变成永不生效的死代码（上一版实测就是这样：判定
      // 一直返回 false，矿车照旧压在厂门口）。正确入口是 Player 的方法。
      const own = obj.owner && obj.owner.getOwnedObjectsByType
        ? obj.owner.getOwnedObjectsByType(ObjectType.Building)
        : [];
      for (const b of own) {
        if (!b || b === obj || !b.tile || b.isDisposed || b.isDestroyed) continue;
        const ft = b.factoryTrait;
        if (!ft) continue;
        try {
          cells.push(ft.computeExitCoords(b, ft.type));
        } catch (_) {
          continue; // 建筑工厂（建造厂）没有出口格
        }
        try {
          cells.push(
            ft.type === FactoryType.InfantryType
              ? ft.computeBarracksInternalRallyCoords(b)
              : ft.type === FactoryType.UnitType
                ? ft.computeWarFactoryInternalRallyCoords(b)
                : null,
          );
        } catch {
          /* ignore */
        }
      }
    } catch {
      /* ignore */
    }
    return cells.filter((c: any) => c && typeof c.rx === "number" && typeof c.ry === "number");
  }

  /** 某格到最近出口/集结格的曼哈顿距离（无工厂时 +∞）。 */
  private _exitDistance(cells: any[], tile: any): number {
    if (!tile || typeof tile.rx !== "number") return Number.POSITIVE_INFINITY;
    let best = Number.POSITIVE_INFINITY;
    for (const c of cells) {
      const d = Math.abs(tile.rx - Math.floor(c.rx)) + Math.abs(tile.ry - Math.floor(c.ry));
      if (d < best) best = d;
    }
    return best;
  }

  /**
   * 就地展开前的一道额外保护：**别把展开体压在己方出兵工厂的出厂通道上**。
   *
   * 背景（2026-10-01 实机）：ini 里 `SlaveMinerShortScan=8` 的官方注释是
   * "the Slave Miner looks this far to decide if it needs to move closer"
   * —— 语义是"看去决定要不要再靠近点"，而上游把它当成了"8 格内有矿就地展开"。
   * AI 的战车工厂（YAWEAP 等）本来就贴着矿脉建，于是奴隶矿车一出厂门就满足
   * "8 格内有矿"，当场展开；展开体是精炼厂（3x3），直接压住工厂出口/集结格。
   * 而工厂侧的 `produceGroundUnitAt` 把单位 spawn 在出口格、`ExitFactoryTask`
   * 又以集结格为精确目标 → 通道被占后 `canStopAtTile`/`isCloseEnoughToDest`
   * 永远不成立 → 车辆队列长期停在 `status=3 size=N`，队伍 stall 一路涨到 150。
   *
   * **只对 AI 生效**：人类玩家同样会遇到"矿车自己展开堵门"，但那是原版行为，
   * 不替人类改；AI 的基地布局是程序生成的，必须自保。
   */
  private _isInExitDangerZone(game: any, obj: any, tile: any): boolean {
    return this._exitDistance(this._exitCorridorCells(game, obj), tile) <= EXIT_BLOCK_RADIUS;
  }

  /**
   * 退避：从当前格向外找一格"不挡出口、可通行"的落脚点。
   * 只接受**离出口更远**的格（距离单调递增），否则会在出口附近来回蹭，
   * 仍旧压着集结格 —— 那正是上一版只有判定、没有退避时留下的洞。
   */
  private _retreatFromExit(game: any, obj: any): boolean {
    try {
      const cells = this._exitCorridorCells(game, obj);
      const here = this._exitDistance(cells, obj.tile);
      const finder = new RadialTileFinder(
        game.map.tiles,
        game.map.mapBounds,
        obj.tile,
        { width: 1, height: 1 },
        1,
        10,
        (tile: any) =>
          !!tile &&
          tile.passable !== !1 &&
          0 < game.map.terrain.getPassableSpeed(tile, obj.rules.speedType, !1, !1) &&
          this._exitDistance(cells, tile) > Math.max(here, EXIT_BLOCK_RADIUS),
      );
      const tile = finder.getNextTile();
      if (tile) {
        obj.unitOrderTrait.addTask(new MoveTask(game, tile, !1));
        return !0;
      }
    } catch {
      /* ignore */
    }
    return !1;
  }

  /** 当前格能否直接展开（可放置 + 不挡出厂通道 + 足下有矿）。 */
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
    if (obj.owner && obj.owner.isAi && this._isInExitDangerZone(game, obj, obj.tile)) {
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
        // 同 _exitCorridorCells：`game.combatants` 不存在，写错会让
        // aiDeployed 恒为 0 → AISlaveMinerNumber 上限永不生效。
        for (const cobj of vt.owner.getOwnedObjectsByType
          ? vt.owner.getOwnedObjectsByType(ObjectType.Building)
          : []) {
          if (
            cobj !== vt &&
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
        // ⚠ 上游孪生此处只传 6 参（predicate 为 undefined），而 RadialTileFinder
        // 的 generate() 在 distance=0 时会**直接调 this.predicate(startTile)**
        // ⇒ 一取 next() 就抛 `TypeError: this.predicate is not a function`。
        // 这是**上游自带**的 latent bug（已用
        // `git show backup-before-twins-removal:...SlaveMinerVehicleTrait.ts.js`
        // 逐字核对：同样 6 参、同样顺序），不是我们转写错。
        // 该路径要求"AI 且已部署矿车数达 AISlaveMinerNumber 上限"才走到，
        // 上游极少触发所以没人发现。这里补一个宽松谓词（真正的过滤在下面的
        // `_isOreTile` 循环里做），与同文件另两处 `() => !0` 的用法一致。
        const rf = new (RadialTileFinder as any)(
          world.map.tiles,
          world.map.mapBounds,
          vt.tile,
          { width: 1, height: 1 },
          0,
          world.rules.general.slaveMinerLongScan,
          () => !0,
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
        } else if (
          // 找不到远处矿脉时只会进长冷却、原地待命。刚出厂的矿车此刻正好
          // 停在集结格上 → 等于把出厂通道堵死。先把位让开再冷却。
          !(this._isInExitDangerZone(world, vt, vt.tile) && this._retreatFromExit(world, vt))
        ) {
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
      } else if (vt.owner.isAi && this._isInExitDangerZone(world, vt, vt.tile)) {
        // 矿脉旁边找不到"既不挡出口、又能展开"的落点：车正停在出厂通道上，
        // 再原地等冷却就等于把后来的车一直堵在厂里。先让开通道。
        if (!this._retreatFromExit(world, vt)) this.scanCooldown = POST_ACTION_COOLDOWN;
      } else {
        this.scanCooldown = POST_ACTION_COOLDOWN;
      }
    } else {
      // 5) no ore anywhere: long cooldown（同样先让开出厂通道再待命）
      if (!(this._isInExitDangerZone(world, vt, vt.tile) && this._retreatFromExit(world, vt))) {
        this.scanCooldown = world.rules.general.slaveMinerKickFrameDelay || 150;
      }
    }
  }
}
