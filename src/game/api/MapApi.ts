/**
 * MapApi — 地图只读/查询门面（tile、可见性、寻路、资源）。
 *
 * 构造 game：内部同时持有 game 与 game.map。提供尺寸/出生点/theater、
 * tile 查询（含边界过滤）、可见性、通行性、findPath、可达性、矿石资源。
 *
 * 由 game/api/MapApi.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的
 * 编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { SpeedType } from "game/type/SpeedType"; // 已转换
import { TiberiumTrait } from "game/gameobject/trait/TiberiumTrait"; // 已转换
import { TiberiumType } from "engine/type/TiberiumType"; // 已转换
import { Vector2 } from "game/math/Vector2"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class MapApi {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  /** Game 实例（孪生 WeakMap 字段 n = 第1参）。 */
  private game: any;
  /** game.map 快捷引用（孪生 WeakMap 字段 s = e.map）。 */
  private map: any;

  constructor(game: any) {
    this.game = game;
    this.map = game.map;
  }

  getRealMapSize(): any {
    return this.map.tiles.getMapSize();
  }

  getStartingLocations(): any {
    return this.map.startingLocations.map(
      (loc: any) => new Vector2(loc.x, loc.y),
    );
  }

  getTheaterType(): any {
    return this.map.getTheaterType();
  }

  getTile(rx: any, ry: any): any {
    const tile = this.map.tiles.getByMapCoords(rx, ry);
    if (tile && this.map.mapBounds.isWithinBounds(tile)) return tile;
    // 孪生：越界返回 undefined（无显式 return）
  }

  getTileAtWaypoint(waypoint: any): any {
    let coords = this.map.getWaypoint(waypoint);
    if (coords) {
      coords = this.map.tiles.getByMapCoords(coords.rx, coords.ry);
      if (coords) return coords;
    }
  }

  getTilesInRect(rect: any, rect2?: any): any {
    const tiles = rect2
      ? this.map.tiles.getInRectangle(rect, rect2)
      : this.map.tiles.getInRectangle(rect);
    return tiles.filter((tile: any) =>
      this.map.mapBounds.isWithinBounds(tile),
    );
  }

  getObjectsOnTile(tile: any): any {
    return this.map.getObjectsOnTile(tile).map((obj: any) => obj.id);
  }

  hasBridgeOnTile(tile: any): any {
    return !!tile.onBridgeLandType;
  }

  hasHighBridgeOnTile(tile: any): any {
    return !!this.map.tileOccupation.getBridgeOnTile(tile)?.isHighBridge();
  }

  isPassableTile(
    tile: any,
    speedType: any,
    onBridge?: any,
    walkable?: any,
  ): any {
    // 孪生 isPassableTile(e,t,i,r)：r = r ?? (t === SpeedType.Foot)，
    // 返回 terrain.getPassableSpeed(e,t,r,i) > 0。
    const walkableFlag = walkable ?? speedType === SpeedType.Foot;
    return this.map.terrain.getPassableSpeed(tile, speedType, walkableFlag, onBridge) > 0;
  }

  findPath(
    startTile: any,
    startOnBridge: any,
    from: any,
    to: any,
    options?: any,
  ): any {
    // 孪生: terrain.computePath(e, t, i.tile, i.onBridge, r.tile, r.onBridge, {...})
    const path = this.map.terrain.computePath(
      startTile,
      startOnBridge,
      from.tile,
      from.onBridge,
      to.tile,
      to.onBridge,
      {
        bestEffort: options?.bestEffort,
        excludeTiles: options?.excludeNodes
          ? (node: any) =>
              options.excludeNodes({ tile: node.tile, onBridge: !!node.onBridge })
          : void 0,
        maxExpandedNodes: options?.maxExpandedNodes,
        bidirectional: options?.bidirectional,
      },
    );
    return path.map((node: any) => ({
      tile: node.tile,
      onBridge: !!node.onBridge,
    }));
  }

  getReachabilityMap(arg0: any, arg1: any): any {
    const regionMap = this.map.terrain.getIslandIdMap(arg0, arg1);
    return {
      isReachable(this: any, node: any, other: any) {
        const r1 = this.getRegionId(node);
        const r2 = this.getRegionId(other);
        return r1 !== void 0 && r1 === r2;
      },
      getRegionId(this: any, node: any) {
        return regionMap.get(node.tile, node.onBridge);
      },
    };
  }

  isVisibleTile(tile: any, playerName: any, elevation: any = 0): any {
    // 孪生 (e,t,i=0)：getPlayerByName / mapShroudTrait 挂在 game（WeakMap n）上
    const player = this.game.getPlayerByName(playerName);
    if (!player) throw new Error(`Player "${playerName}" doesn't exist`);
    return !this.game.mapShroudTrait
      .getPlayerShroud(player)
      ?.isShrouded(tile, elevation);
  }

  getTileResourceData(tile: any): any {
    const obj = this.map
      .getObjectsOnTile(tile)
      .find(
        (o: any) =>
          (o.isOverlay() && o.isTiberium()) ||
          (o.isTerrain() && o.rules.spawnsTiberium),
      );
    if (obj) return this.toResourceData(obj);
  }

  getAllTilesResourceData(): any {
    const out: any[] = [];
    for (const obj of this.game.getWorld().getAllObjects()) {
      const data = this.toResourceData(obj);
      if (data) out.push(data);
    }
    return out;
  }

  /** 叠加层矿 / 产矿地形 → TileResourceData（孪生 WeakSet 私有方法 a）。 */
  private toResourceData(obj: any): any {
    let data: any;
    if (obj.isOverlay() && obj.isTiberium()) {
      const trait = obj.traits.get(TiberiumTrait);
      const type = trait.getTiberiumType();
      const bail = trait.getBailCount();
      data = {
        tile: obj.tile,
        ore: type !== TiberiumType.Gems ? bail : 0,
        gems: type === TiberiumType.Gems ? bail : 0,
        spawnsOre: false,
      };
    } else if (obj.isTerrain() && obj.rules.spawnsTiberium) {
      data = { tile: obj.tile, ore: 0, gems: 0, spawnsOre: true };
    }
    return data;
  }
}
