/**
 * TileOccupation — 地块占用（对象落格）与地表类型重算。
 *
 * occupy/unoccupy 单格或矩形范围时维护每格 Set，并重算
 * landType / onBridgeLandType（墙、桥、矿等覆盖层优先级）。
 * onChange 事件载荷 { tiles, object, type: added|removed }，
 * Bridges/Terrain 靠它增量刷新。另提供地面/空中对象查询与
 * LayerType 过滤。
 *
 * 由 game/map/TileOccupation.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
import { LandType, getLandType } from "game/type/LandType"; // 已转换
import { EventDispatcher } from "util/event"; // 已转换
import { getZoneType, ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 查询层级过滤。 */
export enum LayerType {
  /** 全部对象。 */
  All = 0,
  /** 仅地面（排除空中非建筑 techno）。 */
  Ground = 1,
  /** 仅空中。 */
  Air = 2,
}

/** 地块占用管理器。 */
export class TileOccupation {
  tiles: any;
  /** rx → ry → Set(object) 稀疏表。 */
  tileOccupation: any[][];
  /** 当前无对象的 tile 集合。 */
  emptyTiles: Set<any>;
  private _onChange = new EventDispatcher();

  /** 占用变更事件：listener(payload, self)，payload={tiles,object,type}。 */
  get onChange() {
    return this._onChange.asEvent();
  }

  constructor(tiles: any) {
    this.tiles = tiles;
    this.tileOccupation = [];
    this.emptyTiles = new Set();
    this._onChange = new EventDispatcher();
    const table = this.tileOccupation;
    for (const tile of tiles.getAll()) {
      table[tile.rx] = table[tile.rx] || [];
      table[tile.rx][tile.ry] = new Set();
      this.emptyTiles.add(tile);
    }
  }

  /** 按 foundation 矩形占用多格。 */
  occupyTileRange(pos: any, obj: any): void {
    const affected = this.calculateTilesForGameObject(pos, obj);
    affected.forEach((tile) => this.occupyTile(tile, obj));
    this._onChange.dispatch(this, { tiles: affected, object: obj, type: "added" });
  }

  /** 按 foundation 矩形释放多格。 */
  unoccupyTileRange(pos: any, obj: any): void {
    const affected = this.calculateTilesForGameObject(pos, obj);
    affected.forEach((tile) => this.unoccupyTile(tile, obj));
    this._onChange.dispatch(this, { tiles: affected, object: obj, type: "removed" });
  }

  occupySingleTile(tile: any, obj: any): void {
    this.occupyTile(tile, obj);
    this._onChange.dispatch(this, { tiles: [tile], object: obj, type: "added" });
  }

  unoccupySingleTile(tile: any, obj: any): void {
    this.unoccupyTile(tile, obj);
    this._onChange.dispatch(this, { tiles: [tile], object: obj, type: "removed" });
  }

  /** 对象占位矩形映射到 tile 列表。 */
  calculateTilesForGameObject(pos: any, obj: any): any[] {
    return this.tiles.getInRectangle(pos, obj.getFoundation());
  }

  occupyTile(tile: any, obj: any): void {
    const set = this.tileOccupation[tile.rx]?.[tile.ry];
    if (set) {
      set.add(obj);
      this.emptyTiles.delete(tile);
      tile.landType = this.computeTileLandType(tile);
      tile.onBridgeLandType = this.computeOnBridgeLandType(tile);
    }
  }

  unoccupyTile(tile: any, obj: any): void {
    const set = this.tileOccupation[tile.rx]?.[tile.ry];
    if (set) {
      set.delete(obj);
      if (!set.size) this.emptyTiles.add(tile);
      tile.landType = this.computeTileLandType(tile);
      tile.onBridgeLandType = this.computeOnBridgeLandType(tile);
    }
  }

  isTileOccupiedBy(tile: any, obj: any): boolean {
    return !!this.tileOccupation[tile.rx]?.[tile.ry]?.has(obj);
  }

  /**
   * 重算地面 landType：Rock 固定；墙建筑 → Wall；
   * 非桥/非占位 overlay 若自身 landType 非 Clear 则覆盖；否则用地形映射。
   */
  computeTileLandType(tile: any): LandType {
    if (tile.landType === LandType.Rock) return LandType.Rock;
    const base = getLandType(tile.terrainType);
    for (const obj of this.tileOccupation[tile.rx]?.[tile.ry] ?? []) {
      if (obj.isBuilding() && obj.rules.wall) return LandType.Wall;
      if (obj.isOverlay() && !obj.isBridge() && !obj.isBridgePlaceholder()) {
        if (obj.getLandType() !== LandType.Clear) return obj.getLandType();
      }
    }
    return base;
  }

  /** 桥上 landType：第一个桥 overlay 的 getLandType；无桥返回 undefined。 */
  computeOnBridgeLandType(tile: any): LandType | undefined {
    for (const obj of this.tileOccupation[tile.rx]?.[tile.ry] ?? []) {
      if (obj.isOverlay() && obj.isBridge()) return obj.getLandType();
    }
  }

  /**
   * 取 tile 所属战区。
   * @param onBridge - true 强制用地面 landType，否则优先 onBridgeLandType
   */
  getTileZone(tile: any, onBridge = false): any {
    return getZoneType(onBridge ? tile.landType : (tile.onBridgeLandType ?? tile.landType));
  }

  getBridgeOnTile(tile: any): any {
    for (const obj of this.tileOccupation[tile.rx]?.[tile.ry] ?? []) {
      if (obj.isOverlay() && obj.isBridge()) return obj;
    }
  }

  getObjectsOnTile(tile: any): any[] {
    return [...(this.tileOccupation[tile.rx]?.[tile.ry] ?? [])];
  }

  /** 地面对象：排除 zone=Air 的非建筑 techno。 */
  getGroundObjectsOnTile(tile: any): any[] {
    const result: any[] = [];
    for (const obj of this.tileOccupation[tile.rx]?.[tile.ry] ?? []) {
      if (obj.isTechno() && !obj.isBuilding() && obj.zone === ZoneType.Air) continue;
      result.push(obj);
    }
    return result;
  }

  /** 空中对象：zone=Air 的单位。 */
  getAirObjectsOnTile(tile: any): any[] {
    const result: any[] = [];
    for (const obj of this.tileOccupation[tile.rx]?.[tile.ry] ?? []) {
      if (obj.isUnit() && obj.zone === ZoneType.Air) result.push(obj);
    }
    return result;
  }

  getObjectsOnTileByLayer(tile: any, layer: LayerType): any[] {
    if (layer === LayerType.Ground) return this.getGroundObjectsOnTile(tile);
    if (layer === LayerType.Air) return this.getAirObjectsOnTile(tile);
    if (layer === LayerType.All) return this.getObjectsOnTile(tile);
    throw new Error(`Unhandled layer type "${layer}"`);
  }

  getEmptyTiles(): any[] {
    return [...this.emptyTiles];
  }
}
