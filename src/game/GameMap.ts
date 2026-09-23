/**
 * GameMap — 运行时地图门面（组装 tile/地形/桥/占用/遮蔽查询）。
 *
 * 构造时：按 MapFile 建 TileCollection、MapBounds、TileOccupation、
 * TileOcclusion、Terrain、Bridges；把 cellTags 绑到对应 tile；为
 * technos 建 QuadTree；非雪地剧院跑 AutoLat 高差平滑。
 * 之后提供触发器/剧本用的 getters（tags/triggers/waypoints/teams 等）、
 * 边界 clamp（含 elevation 上升/下降搜索）、初始地图对象打包与 tile 占用转发。
 *
 * 由 game/GameMap.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as TileCollectionModule from "game/map/TileCollection"; // 孪生
import * as TileOccupationModule from "game/map/TileOccupation"; // 孪生
import * as TerrainModule from "game/map/Terrain"; // 孪生
import * as MapBoundsModule from "game/map/MapBounds"; // 孪生
import * as BridgesModule from "game/map/Bridges"; // 孪生
import { QuadTree } from "util/QuadTree"; // 已转换
import * as TileOcclusionModule from "game/map/TileOcclusion"; // 孪生
import * as AutoLatModule from "game/theater/AutoLat"; // 孪生
import { TheaterType } from "engine/TheaterType"; // 已转换
import { Vector2 } from "game/math/Vector2"; // 已转换
import { Box2 } from "game/math/Box2"; // 已转换

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const TileCollection: any = (TileCollectionModule as any).TileCollection;
const TileOccupation: any = (TileOccupationModule as any).TileOccupation;
const Terrain: any = (TerrainModule as any).Terrain;
const MapBounds: any = (MapBoundsModule as any).MapBounds;
const Bridges: any = (BridgesModule as any).Bridges;
const TileOcclusion: any = (TileOcclusionModule as any).TileOcclusion;
const AutoLat: any = (AutoLatModule as any).AutoLat;

/* eslint-disable @typescript-eslint/no-explicit-any */
export class GameMap {
  /** 原始地图文件（MapFile 解析结果）。 */
  mapFile: any;
  /** 地块集合。 */
  tiles: any;
  /** 地图边界。 */
  mapBounds: any;
  /** 地块占用（单位/建筑落格）。 */
  tileOccupation: any;
  /** 地块遮蔽/高亮遮挡。 */
  tileOcclusion: any;
  /** 地形资源与通行图。 */
  terrain: any;
  /** 桥梁集合。 */
  bridges: any;
  /** 单位/建筑空间索引（按所在 tile 的 QuadTree）。 */
  technosByTile: any;

  /** 地图出生点列表（透传）。 */
  get startingLocations() {
    return this.mapFile.startingLocations;
  }

  constructor(mapFile: any, rules: any, gameOpts: any, randomInt: any) {
    this.mapFile = mapFile;
    this.tiles = new TileCollection(this.mapFile.tiles, rules, gameOpts.general, randomInt);
    this.mapBounds = new MapBounds().fromMapFile(this.mapFile, this.tiles);
    this.tileOccupation = new TileOccupation(this.tiles);
    this.tileOcclusion = new TileOcclusion(this.tiles);
    this.terrain = new Terrain(
      this.tiles,
      this.mapFile.theaterType,
      this.mapBounds,
      this.tileOccupation,
      gameOpts,
    );
    this.bridges = new Bridges(rules, this.tiles, this.tileOccupation, this.mapBounds, gameOpts);
    // 把 cellTags 上的 tagId 解析成 tag 对象挂到对应 tile
    let tags = this.mapFile.tags;
    for (const cellTag of this.mapFile.cellTags) {
      const tile = this.tiles.getByMapCoords(cellTag.coords.x, cellTag.coords.y);
      if (tile) tile.tag = tags.find((t: any) => t.id === cellTag.tagId);
    }
    // 单位 QuadTree 深度：max(w,h)/5 折半至 <2 再计层；阈值 10/5
    const size = this.tiles.getMapSize();
    const n = Math.max(size.width, size.height) / 5;
    this.technosByTile = new QuadTree(
      new Box2(new Vector2(0, 0), new Vector2(size.width, size.height)) as any, // Box2 → Box2Like 桥
      {
        getKey: (e: any) => {
          // 建筑按 centerTile 键控，其余按自身 tile
          const t = e.isBuilding() ? e.centerTile : e.tile;
          return new Vector2(t.rx, t.ry);
        },
        maxDepth: this.computeQuadDepth(n),
        splitThreshold: 10,
        joinThreshold: 5,
      },
    );
    // 雪地剧院不做 AutoLat（孪生条件：theaterType !== Snow 才计算）
    if (this.mapFile.theaterType !== TheaterType.Snow) AutoLat.calculate(this.tiles, rules);
  }

  /** 计算 QuadTree 最大深度：反复对半直至 <2，再补一层（若有余数）。 */
  computeQuadDepth(n: number): number {
    if (n <= 1) return 1;
    let depth = 0;
    for (; n / 2 >= 1; ) {
      n /= 2;
      depth++;
    }
    return depth + (n > 1 ? 1 : 0);
  }

  /** 常规光照参数。 */
  getLighting(): any {
    return this.mapFile.lighting;
  }

  /** 离子风暴光照参数。 */
  getIonLighting(): any {
    return this.mapFile.ionLighting;
  }

  /** 剧院类型（Temperate/Snow 等）。 */
  getTheaterType(): any {
    return this.mapFile.theaterType;
  }

  /** 触发器 Tag 列表。 */
  getTags(): any {
    return this.mapFile.tags;
  }

  /** 触发器 Trigger 列表。 */
  getTriggers(): any {
    return this.mapFile.triggers;
  }

  /** cell → tag 绑定列表。 */
  getCellTags(): any {
    return this.mapFile.cellTags;
  }

  /** 全局/本地变量表。 */
  getVariables(): any {
    return this.mapFile.variables;
  }

  /** 区域（Zone）表。 */
  getZones(): any {
    return this.mapFile.zones;
  }

  /** 按 id 取剧本脚本（ScriptTypes）。 */
  getScenarioScript(id: any): any {
    return this.mapFile.scenarioScripts.get(id);
  }

  /** 按 index 取剧本脚本。 */
  getScenarioScriptByIndex(index: any): any {
    return [...this.mapFile.scenarioScripts.values()].find((t: any) => t.index === index);
  }

  /** 按 id 取剧本特遣队编制（TaskForces）。 */
  getScenarioTaskForce(id: any): any {
    return this.mapFile.scenarioTaskForces.get(id);
  }

  /** 按 id 取剧本队伍定义（TeamTypes）。 */
  getScenarioTeam(id: any): any {
    return this.mapFile.scenarioTeams.get(id);
  }

  /** 按 index 取剧本队伍。 */
  getScenarioTeamByIndex(index: any): any {
    return [...this.mapFile.scenarioTeams.values()].find((t: any) => t.index === index);
  }

  /** 全部剧本队伍迭代器。 */
  getScenarioTeams(): any {
    return this.mapFile.scenarioTeams.values();
  }

  /** 全部剧本 AI 触发器迭代器。 */
  getScenarioAiTriggers(): any {
    return this.mapFile.scenarioAiTriggers.values();
  }

  /** 按路点编号取 Waypoint。 */
  getWaypoint(number: any): any {
    return this.mapFile.waypoints.find((e: any) => e.number === number);
  }

  /** 路点 → 地块（无路点或无格则 undefined）。 */
  getTileAtWaypoint(number: any): any {
    const wp = this.getWaypoint(number);
    if (wp) {
      const tile = this.tiles.getByMapCoords(wp.rx, wp.ry);
      if (tile) return tile;
    }
    return undefined;
  }

  /** 是否在可玩边界内。 */
  isWithinBounds(tile: any): boolean {
    return this.mapBounds.isWithinBounds(tile);
  }

  /**
   * 把显示坐标 clamp 进边界并返回合法 tile：
   * 先 clamp 得基准格；若合法则沿高程下降方向（dy+2, z-2）尽量上探；
   * 若非法则从基准起以步长 2 上升直到合法（超过 30 次抛错）。
   */
  clampWithinBounds(displayCoords: any): any {
    const clamped = this.mapBounds.clampWithinBounds(displayCoords);
    let tile = this.tiles.getByDisplayCoords(clamped.dx, clamped.dy);
    if (tile && this.mapBounds.isWithinBounds(tile)) {
      let cur = tile;
      let z = tile.z;
      for (; z >= 0 && cur && this.mapBounds.isWithinBounds(cur); ) {
        tile = cur;
        cur = this.tiles.getByDisplayCoords(cur.dx, cur.dy + 2);
        z -= 2;
      }
    } else {
      let step = 0;
      for (; !tile || !this.mapBounds.isWithinBounds(tile); ) {
        if (30 < step) throw new Error("Exceeded max elevation while trying to clamp tile to map bounds");
        tile = this.tiles.getByDisplayCoords(clamped.dx, clamped.dy + step);
        step += 2;
      }
    }
    return tile;
  }

  /** 硬边界（不可越过的地图矩形）。 */
  isWithinHardBounds(tile: any): boolean {
    return this.mapBounds.isWithinHardBounds(tile);
  }

  /** 打包 MapFile 中的初始地形/覆盖/污痕/科技对象。 */
  getInitialMapObjects(): any {
    return {
      terrains: this.mapFile.terrains,
      overlays: this.mapFile.overlays,
      smudges: this.mapFile.smudges,
      technos: [
        ...this.mapFile.structures,
        ...this.mapFile.infantries,
        ...this.mapFile.vehicles,
        ...this.mapFile.aircrafts,
      ],
    };
  }

  /** 该格上全部占用对象。 */
  getObjectsOnTile(tile: any): any {
    return this.tileOccupation.getObjectsOnTile(tile);
  }

  /** 该格上的地面占用对象（不含空中）。 */
  getGroundObjectsOnTile(tile: any): any {
    return this.tileOccupation.getGroundObjectsOnTile(tile);
  }

  /** 该格区域类型（可含桥上区域）。 */
  getTileZone(tile: any, onBridge: any = false): any {
    return this.tileOccupation.getTileZone(tile, onBridge);
  }

  /** 释放地形/桥资源。 */
  dispose(): void {
    this.terrain.dispose();
    this.bridges.dispose();
  }
}
