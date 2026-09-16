/**
 * ConstructionWorker — 建筑放置服务（MCV 展开或建造页放置时使用）。
 *
 * 职责：
 *  - 校验放置位置合法性（相邻建筑要求 / 地形可建 / 黑雾 / 占位物）；
 *  - 生成放置预览（每格 buildable 标记，供渲染层绿色/红色网格）；
 *  - 执行放置（含墙的自动连接扩展、污渍清除）与撤销（打包回 MCV）；
 *  - 墙连接搜索：从放置点向四方向逐格扫描，找到已有同型墙即停止。
 *
 * 相邻缓存 adjacencyMaps 按"间距 adjacent"分组缓存，任何建筑变化
 * （放置/销毁/换主/结盟）都会清空缓存强制重算。
 *
 * [CHEAT] cheatsBuildAnywhere 透传自 Production，开启时跳过相邻建筑
 * 要求和地形（水面/斜坡/不可建地面）检查。
 *
 * 由 game/ConstructionWorker.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 */
import * as geometryModule from "util/geometry"; // 本批已转换：可直接具名导入
import { ObjectType } from "engine/type/ObjectType";
import { SpeedType } from "game/type/SpeedType";
import * as PackBuildingTaskModule from "game/gameobject/task/morph/PackBuildingTask"; // 未转换（any-shim）
import * as CallbackTaskModule from "game/gameobject/task/system/CallbackTask"; // 未转换（any-shim）
import * as TaskGroupModule from "game/gameobject/task/system/TaskGroup"; // 未转换（any-shim）
import { CompositeDisposable } from "util/disposable/CompositeDisposable";
import { EventType } from "game/event/EventType";
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ConstructionWorker {
  player: any;
  rules: any;
  art: any;
  map: any;
  game: any;
  /** 相邻缓存：adjacent 间距 → 矩形列表。 */
  adjacencyMaps: Map<any, any>;
  disposables: CompositeDisposable;

  constructor(player: any, rules: any, art: any, map: any, game: any) {
    this.player = player;
    this.rules = rules;
    this.art = art;
    this.map = map;
    this.game = game;
    this.adjacencyMaps = new Map();
    this.disposables = new CompositeDisposable();
    // 建筑变化时清空相邻缓存（占位变化/结盟变化/销毁留残骸）。
    const onTileOccupationChange = ({ object }: any) => {
      if (object.isBuilding()) this.adjacencyMaps.clear();
    };
    this.map.tileOccupation.onChange.subscribe(onTileOccupationChange);
    this.disposables.add(() => this.map.tileOccupation.onChange.unsubscribe(onTileOccupationChange));
    this.disposables.add(
      game.events.subscribe(EventType.AllianceChange, () => this.adjacencyMaps.clear()),
      game.events.subscribe(EventType.ObjectOwnerChange, (event: any) => {
        if (event.target.isBuilding()) this.adjacencyMaps.clear();
      }),
      game.events.subscribe(EventType.ObjectDestroy, (event: any) => {
        if (event.target.isBuilding() && event.target.rules.leaveRubble) this.adjacencyMaps.clear();
      }),
    );
  }

  /** 计算建筑占位向外扩展 adjacent 格的矩形。 */
  getAdjacentRect(tile: any, foundation: any, adjacent: number) {
    return { x: tile.rx - adjacent, y: tile.ry - adjacent, width: foundation.width + 2 * adjacent, height: foundation.height + 2 * adjacent };
  }

  /** [CHEAT] 随处建造：透传 Production 上的作弊标志。 */
  get cheatsBuildAnywhere(): boolean {
    return !!this.player?.production?.cheatsBuildAnywhere;
  }

  /**
   * 获取相邻矩形列表：遍历己方建筑（baseNormal=yes）的占位 + 间距，
   * 盟友建筑仅在 buildOffAlly 开启且标记 eligibileForAllyBuilding 时计入。
   */
  getAdjacencyMap(adjacent: number): any[] {
    const rects: any[] = [];
    for (const building of [
      ...this.player.buildings,
      ...(this.game.gameOpts.buildOffAlly
        ? this.game.alliances
            .getAllies(this.player)
            .map((ally: any) => [...ally.buildings].filter((b: any) => b.rules.eligibileForAllyBuilding))
            .flat()
        : []),
    ]) {
      if (building.rules.baseNormal) rects.push(this.getAdjacentRect(building.tile, building.art.foundation, adjacent));
    }
    return rects;
  }

  /** 矩形是否与任一相邻矩形相交（有缓存）。 */
  meetsAdjacency(rect: any, adjacent: number): boolean {
    let map = this.adjacencyMaps.get(adjacent);
    if (!map) {
      map = this.getAdjacencyMap(adjacent);
      this.adjacencyMaps.set(adjacent, map);
    }
    for (const rect2 of map) {
      if (geometryModule.rectIntersect(rect, rect2)) return true;
    }
    return false;
  }

  /**
   * 生成放置预览：遍历占位面积内的每个格子，标记是否可建。
   * 墙类建筑额外追加连接墙格。
   */
  getPlacementPreview(name: string, tile: any, options: any = {}) {
    const { normalizedTile: normalized = false, ignoreObjects, ignoreAdjacent: ignoreAdj = false } = options;
    const buildingRules = this.rules.getBuilding(name);
    const buildingArt = this.art.getObject(name, ObjectType.Building);
    const preview: any[] = [];
    const foundation = buildingArt.foundation;
    const originTile = normalized ? tile : this.normalizePlacementTileCoords(buildingArt, tile);
    let isOk = true;
    const rect = { x: originTile.rx, y: originTile.ry, width: foundation.width, height: foundation.height };
    if (!ignoreAdj && !this.cheatsBuildAnywhere && !this.meetsAdjacency(rect, buildingRules.adjacent)) isOk = false;
    for (let dx = 0; dx < foundation.width; dx++) {
      for (let dy = 0; dy < foundation.height; dy++) {
        const coords = { x: originTile.rx + dx, y: originTile.ry + dy };
        const mapTile = this.map.tiles.getByMapCoords(coords.x, coords.y);
        if (mapTile) preview.push({ rx: coords.x, ry: coords.y, buildable: isOk && this.isTileBuildable(mapTile, buildingRules, ignoreObjects) });
      }
    }
    // 墙类建筑：向四方向扫描并追加可连接的墙格。
    if (buildingRules.wall && preview[0].buildable) {
      const connectingTiles = this.getWallConnectingTiles(originTile, buildingRules);
      connectingTiles.forEach((tile2: any) => {
        preview.push({ rx: tile2.rx, ry: tile2.ry, buildable: true });
      });
    }
    return preview;
  }

  /** 是否可以在此放置（占位内每格都通过检查）。 */
  canPlaceAt(name: string, tile: any, options: any = {}): boolean {
    const { normalizedTile: normalized = false, ignoreObjects, ignoreAdjacent: ignoreAdj = false } = options;
    const buildingRules = this.rules.getBuilding(name);
    const buildingArt = this.art.getObject(name, ObjectType.Building);
    const foundation = buildingArt.foundation;
    const originTile = normalized ? tile : this.normalizePlacementTileCoords(buildingArt, tile);
    const rect = { x: originTile.rx, y: originTile.ry, width: foundation.width, height: foundation.height };
    if (!ignoreAdj && !this.cheatsBuildAnywhere && !this.meetsAdjacency(rect, buildingRules.adjacent)) return false;
    for (let dx = 0; dx < foundation.width; dx++) {
      for (let dy = 0; dy < foundation.height; dy++) {
        const coords = { x: originTile.rx + dx, y: originTile.ry + dy };
        const mapTile = this.map.tiles.getByMapCoords(coords.x, coords.y);
        if (!mapTile || !this.isTileBuildable(mapTile, buildingRules, ignoreObjects)) return false;
      }
    }
    return true;
  }

  /**
   * 执行放置：墙类建筑同时放置连接墙；非墙建筑清除占位格上的污渍。
   * @returns 放置的全部建筑实例（墙返回多个）
   */
  placeAt(name: string, tile: any, normalize = false): any[] {
    const placed = [];
    const buildingRules = this.rules.getBuilding(name);
    const originTile = normalize ? tile : this.normalizePlacementTile(name, tile);
    if (buildingRules.wall) {
      // 墙：放置本体 + 四方向连接墙。
      const toPlace: any[][] = [[originTile, buildingRules]];
      const connectingTiles = this.getWallConnectingTiles(originTile, buildingRules);
      connectingTiles.forEach((wallTile: any) => {
        if (wallTile !== originTile) toPlace.push([wallTile, buildingRules]);
      });
      for (const [wallTile, wallRules] of toPlace) {
        placed.push(this.executePlacement(wallTile, wallRules));
      }
    } else {
      const building = this.executePlacement(originTile, buildingRules);
      placed.push(building);
      // 清除占位格上的污渍（Smudge）。
      for (const occupiedTile of this.map.tileOccupation.calculateTilesForGameObject(originTile, building)) {
        const smudge = this.map.getObjectsOnTile(occupiedTile).find((obj: any) => obj.isSmudge());
        if (smudge) this.game.unspawnObject(smudge);
      }
    }
    return placed;
  }

  /** 根据建筑美术的中心偏移修正放置格坐标。 */
  normalizePlacementTileCoords(art: any, tile: any) {
    const center = art.foundationCenter;
    return { rx: tile.rx - center.x, ry: tile.ry - center.y };
  }

  /** 同上，但返回 Map tile 对象（越界抛错）。 */
  normalizePlacementTile(name: string, tile: any) {
    const art = this.art.getObject(name, ObjectType.Building);
    const normalized = this.normalizePlacementTileCoords(art, tile);
    const mapTile = this.map.tiles.getByMapCoords(normalized.rx, normalized.ry);
    if (!mapTile) throw new Error(`Can't build outside map (${normalized.rx}, ${normalized.ry})`);
    return mapTile;
  }

  /** 撤销放置（打包含回 MCV）：取消全部任务，挂打包任务 + 回调。 */
  unplace(building: any, onComplete: any): void {
    building.unitOrderTrait.cancelAllTasks();
    building.unitOrderTrait.addTasks(
      new TaskGroupModule.TaskGroup(
        new PackBuildingTaskModule.PackBuildingTask(this.game),
        new CallbackTaskModule.CallbackTask(() => {
          this.game.unspawnObject(building);
          onComplete();
        }),
      ).setCancellable(false),
    );
    building.unitOrderTrait[NotifyTickModule.NotifyTick.onTick](building, this.game);
  }

  /** 执行放置：创建建筑对象、变更归属、计算买断价值、spawn 到地图。 */
  executePlacement(tile: any, rules: any): any {
    const building = this.game.createObject(ObjectType.Building, rules.name);
    this.game.changeObjectOwner(building, this.player);
    building.purchaseValue = this.game.sellTrait.computePurchaseValue(rules, this.player);
    this.game.spawnObject(building, tile);
    return building;
  }

  /**
   * 墙连接搜索：从放置点向四方向各扫描 guardRange+1 格，找到已有同型
   * 己方墙即停止（该方向连通）；不可建则中断该方向。返回全部可连接格。
   */
  getWallConnectingTiles(originTile: any, rules: any): any[] {
    let tile: any;
    const scanRange = rules.guardRange + 1;
    let connecting: any[] = [];
    for (const [dx, dy] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ]) {
      const path: any[] = [];
      for (let step = 0; step < scanRange; ++step) {
        const coords = { x: originTile.rx + dx * step, y: originTile.ry + dy * step };
        const mapTile = this.map.tiles.getByMapCoords(coords.x, coords.y);
        if (!mapTile) break;
        if (
          this.map.getObjectsOnTile(mapTile).find(
            (obj: any) => obj.isBuilding() && obj.name === rules.name && obj.owner === this.player,
          )
        ) {
          connecting = connecting.concat(path);
          break;
        }
        if (!this.isTileBuildable(mapTile, rules)) break;
        path.push(mapTile);
      }
    }
    return connecting;
  }

  /**
   * 地格可建判定：地图范围内 + 非黑雾 + 无阻挡对象（排除可选对象/
   * 隐形建筑/污渍）+ 地形可建或水bound浮动 + [CHEAT] 随处建造跳过地形。
   */
  isTileBuildable(tile: any, rules: any, ignoreObjects?: any[]): boolean {
    return (
      !!this.map.isWithinBounds(tile) &&
      !this.game.mapShroudTrait.getPlayerShroud(this.player)?.isShrouded(tile) &&
      !this.map
        .getGroundObjectsOnTile(tile)
        .some((obj: any) => !(ignoreObjects?.includes(obj) || (obj.isBuilding() && obj.rules.invisibleInGame) || obj.isSmudge())) &&
      (this.cheatsBuildAnywhere ||
        (rules.waterBound
          ? this.rules.getLandRules(tile.landType).getSpeedModifier(SpeedType.Float) > 0
          : tile.rampType === 0 && this.rules.getLandRules(tile.landType).buildable))
    );
  }

  dispose(): void {
    this.disposables.dispose();
  }
}
