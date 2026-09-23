/**
 * ObjectPosition — 游戏对象的位置组件（tile / 偏移 / 高度 / 事件）。
 *
 * 一切移动逻辑的状态底座，负责把三种坐标表述互相换算并保持同步：
 *  - _tile           所在地图 tile（含 rx/ry 网格坐标、z 海拔、rampType 斜坡类型）
 *  - _tileOffset     在 tile 内的细部偏移（lepton，1 tile = 256 lepton）
 *  - _centerOffset   对象锚点相对自身中心的偏移（如建筑原点在左上角）
 *  - _worldPosition  最终三维世界坐标（Vector3，渲染与战斗判定使用）
 *  - _tileElevation  相对地面的抬升（飞行）；与 _absoluteElevation（绝对世界
 *                    高度）二选一：设置 tileElevation 时清空 absolute，反之亦然
 *
 * 任何位置变化都会经 updateWorldPosition() 重算世界坐标，并通过
 * onPositionChange 事件广播（携带 tileChanged 标记，供寻路/占位/渲染响应）。
 * 斜坡上的高度由 rampHeights 表按四角插值得出。
 *
 * 由 game/gameobject/ObjectPosition.ts.js 重写为 TS（行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords";
import { EventDispatcher } from "util/event";
import { rampHeights } from "game/theater/rampHeights";
import { Vector3 } from "game/math/Vector3";
import { Vector2 } from "game/math/Vector2";
import { roundToDecimals } from "util/math";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ObjectPosition {
  /** 地图 tile 网格（GameMap），按坐标查询 tile。 */
  tiles: any;
  /** tile 占位管理器（查询桥面等）。 */
  tileOccupation: any;

  _worldPosition: Vector3;
  _tile: any;
  _tileOffset: Vector2;
  _centerOffset: Vector2;
  desiredSubCell: number;
  _tileElevation: number;
  _absoluteElevation: number;
  _computedTileElevation: number;
  _onPositionChange: EventDispatcher;

  constructor(tiles: any, tileOccupation: any) {
    this.tiles = tiles;
    this.tileOccupation = tileOccupation;
    this._worldPosition = new Vector3();
    this._tileOffset = new Vector2();
    this._centerOffset = new Vector2();
    this.desiredSubCell = 0;
    this._tileElevation = 0;
    this._onPositionChange = new EventDispatcher();
  }

  /** 位置变化事件（只读视图）：listener 收到 (this, { tileChanged })。 */
  get onPositionChange(): EventDispatcher {
    return this._onPositionChange.asEvent();
  }

  /** 世界三维坐标（Vector3），渲染与武器判定使用。 */
  get worldPosition(): Vector3 {
    return this._worldPosition;
  }

  /** 当前所在 tile（未放置时为 undefined）。 */
  get tile(): any {
    return this._tile;
  }

  /** 直接换 tile（保留 tile 内偏移），变化时广播 tileChanged=true。 */
  set tile(tile) {
    const tileChanged = !!this._tile && tile !== this._tile;
    if (this._tile = tile) {
      this.updateWorldPosition(tile, this._tileOffset);
      this._onPositionChange.dispatch(this, { tileChanged });
    }
  }

  /**
   * 相对地面的抬升层数（飞行高度）。未显式设置时从世界高度反推
   * （含斜坡修正），结果缓存在 _computedTileElevation。
   */
  get tileElevation(): number {
    if (this._tileElevation === undefined) {
      if (this._computedTileElevation === undefined)
        this._computedTileElevation = this.computeTileElevationFromWorldPos();
      return this._computedTileElevation;
    }
    return this._tileElevation;
  }

  set tileElevation(elevation: number) {
    this._absoluteElevation = undefined;
    this._tileElevation = elevation;
    if (this._tile) {
      this.updateWorldPosition(this._tile, this._tileOffset);
      this._onPositionChange.dispatch(this, { tileChanged: false });
    }
  }

  /**
   * 步兵九宫格占位（0-8；0 表示居中/非步兵）。
   * 由 tile 内偏移反推：偏移落在 tile 的哪个象限决定 1-8 的格子号。
   */
  get subCell(): number {
    if (!this._tileOffset.x && !this._tileOffset.y) return 0;
    const signX = Math.sign(this._tileOffset.x / Coords.LEPTONS_PER_TILE - 0.5);
    const signY = Math.sign(this._tileOffset.y / Coords.LEPTONS_PER_TILE - 0.5);
    return signX && signY ? signY + 1 + (signX + 1) / 2 + 1 : 0;
  }

  set subCell(subCell: number) {
    this._tileOffset = this.computeSubCellOffset(subCell);
    this.desiredSubCell = subCell;
    if (this._tile) {
      this.updateWorldPosition(this._tile, this._tileOffset);
      this._onPositionChange.dispatch(this, { tileChanged: false });
    }
  }

  /** tile 内偏移的副本（防外部直接改动内部状态）。 */
  getTileOffset(): Vector2 {
    return this._tileOffset.clone();
  }

  /** 设置 tile 内偏移（lepton），保持所在 tile 不变。 */
  setTileOffset(offset: Vector2): void {
    this._tileOffset.copy(offset);
    if (this._tile) {
      this.updateWorldPosition(this._tile, this._tileOffset);
      this._onPositionChange.dispatch(this, { tileChanged: false });
    }
  }

  /** 设置对象锚点相对中心的偏移（建筑等大对象的定位基准）。 */
  setCenterOffset(offset: Vector2): void {
    this._centerOffset.copy(offset);
    if (this._tile) {
      this.updateWorldPosition(this._tile, this._tileOffset);
      this._onPositionChange.dispatch(this, { tileChanged: false });
    }
  }

  /** 地图平面坐标（lepton）：tile 网格坐标 ×256 + 两组偏移。 */
  getMapPosition(): Vector2 | undefined {
    if (this._tile)
      return new Vector2(
        this._tile.rx * Coords.LEPTONS_PER_TILE + this._tileOffset.x + this._centerOffset.x,
        this._tile.ry * Coords.LEPTONS_PER_TILE + this._tileOffset.y + this._centerOffset.y,
      );
    return undefined;
  }

  /** 若正站在桥上，返回桥面对象；否则 undefined。 */
  getBridgeBelow(): any {
    return this._tile?.onBridgeLandType ? this.tileOccupation.getBridgeOnTile(this._tile) : undefined;
  }

  /** 移动到指定 tile（保留 subCell 语义），显式声明是否跨 tile。 */
  moveToTileCell(tile: any, subCell = 0): void {
    if (!this._tile) throw new Error("Tile is not set");
    const tileChanged = tile !== this._tile;
    this._tile = tile;
    this._tileOffset = this.computeSubCellOffset(subCell);
    this.desiredSubCell = subCell;
    this.updateWorldPosition(tile, this._tileOffset);
    this._onPositionChange.dispatch(this, { tileChanged });
  }

  /**
   * 以 tile 坐标（可带小数）移动：整数部分定 tile、小数部分定 tile 内偏移。
   * 目标 tile 不存在时默认抛 RangeError；allowPlaceholder=true 时改用
   * 占位 tile（供脱图单位收回等场景）。
   */
  moveToTileCoords(x: number, y: number, allowPlaceholder = false): void {
    const rx = Math.floor(x);
    const ry = Math.floor(y);
    const tileChanged = !this._tile || this._tile.rx !== rx || this._tile.ry !== ry;
    if (tileChanged) {
      let tile = this.tiles.getByMapCoords(rx, ry);
      if (!tile) {
        if (!allowPlaceholder) throw new RangeError(`Attempted move to a non-existent tile: [${rx},${ry}]`);
        tile = this.tiles.getPlaceholderTile(rx, ry);
      }
      this._tile = tile;
    }
    this._tileOffset.set((x - rx) * Coords.LEPTONS_PER_TILE, (y - ry) * Coords.LEPTONS_PER_TILE);
    this.updateWorldPosition(this._tile, this._tileOffset);
    this._onPositionChange.dispatch(this, { tileChanged });
  }

  /** 以地图平面 lepton 坐标移动。 */
  moveToLeptons(position: { x: number; y: number }, allowPlaceholder = false): void {
    this.moveToTileCoords(position.x / Coords.LEPTONS_PER_TILE, position.y / Coords.LEPTONS_PER_TILE, allowPlaceholder);
  }

  /** 相对当前 tile 内偏移位移（lepton）。 */
  moveByLeptons(dx: number, dy: number, allowPlaceholder = false): void {
    if (!this._tile) throw new Error("Tile is not set");
    this.moveToTileCoords(
      this._tile.rx + (this._tileOffset.x + dx) / Coords.LEPTONS_PER_TILE,
      this._tile.ry + (this._tileOffset.y + dy) / Coords.LEPTONS_PER_TILE,
      allowPlaceholder,
    );
  }

  /** 三维相对位移：x/z 走平面移动，y 叠加为绝对世界高度。 */
  moveByLeptons3(delta: { x: number; y: number; z: number }, allowPlaceholder = false): void {
    const currentY = this._worldPosition.y;
    this.moveByLeptons(delta.x, delta.z, allowPlaceholder);
    this.setAbsoluteElevationWorld(currentY + delta.y);
  }

  /** 直接指定绝对世界高度（飞行/弹道），此后 tileElevation 走反推。 */
  setAbsoluteElevationWorld(y: number): void {
    this._absoluteElevation = y;
    this._tileElevation = undefined;
    if (this._tile) {
      this.updateWorldPosition(this._tile, this._tileOffset);
      this._onPositionChange.dispatch(this, { tileChanged: false });
    }
  }

  /**
   * 步兵九宫格格子号 → tile 内偏移。
   * 子格 1-8 以 ±tile/4 的偏移落在四角与四边中点（奇偶行交替），
   * 加上 tile 半宽得到最终偏移；0 表示居中（tile/2）。
   */
  computeSubCellOffset(subCell: number): Vector2 {
    let offset = { width: 0, height: 0 };
    if (subCell) {
      const signX = ((subCell - 1) % 2) * 2 - 1;
      const signY = 2 * Math.floor((subCell - 1) / 2) - 1;
      offset = {
        width: (signX * Coords.LEPTONS_PER_TILE) / 4,
        height: (signY * Coords.LEPTONS_PER_TILE) / 4,
      };
    }
    const half = Coords.LEPTONS_PER_TILE / 2;
    return new Vector2(half + offset.width, half + offset.height);
  }

  /**
   * 斜坡高度插值：按四角高度（rampHeights 表）对归一化坐标 (u, v)
   * 做双线性插值，得到斜面上的连续高度。
   */
  interpolateRampHeight(u: number, v: number, rampType: number): number {
    const corners = rampHeights[rampType];
    const top = corners[1];
    const bottom = corners[0];
    return top * (1 - u) * (1 - v) + corners[2] * u * (1 - v) + bottom * (1 - u) * v + corners[3] * u * v;
  }

  /**
   * 核心同步：由 tile + 两组偏移 + 高度表述重算 _worldPosition。
   * 使用 _tileElevation（相对地面）时叠加斜坡插值后换算世界高度；
   * 使用 _absoluteElevation 时直接采用，并顺带反推缓存相对抬升。
   */
  updateWorldPosition(tile: any, offset: Vector2): void {
    const offsetX = offset.x + this._centerOffset.x;
    const offsetY = offset.y + this._centerOffset.y;
    const u = offsetX / Coords.LEPTONS_PER_TILE;
    const v = offsetY / Coords.LEPTONS_PER_TILE;
    let worldY;
    if (this._tileElevation !== undefined) {
      let ramp = 0;
      if (tile.rampType !== 0) ramp = this.interpolateRampHeight(u, v, tile.rampType);
      worldY = Coords.tileHeightToWorld(tile.z + ramp + this._tileElevation);
    } else {
      worldY = this._absoluteElevation;
    }
    this._worldPosition.set(tile.rx * Coords.LEPTONS_PER_TILE + offsetX, worldY, tile.ry * Coords.LEPTONS_PER_TILE + offsetY);
    if (this._tileElevation === undefined)
      this._computedTileElevation = this.computeTileElevationFromWorldPos();
  }

  /**
   * 从当前世界高度反推"相对地面的抬升层数"：
   * 世界Y → tile 高度单位，减去 tile 基础海拔与斜坡插值，14 位小数
   * 取整消除浮点噪声。
   */
  computeTileElevationFromWorldPos(): number {
    if (!this._tile) return 0;
    const tileHeight = roundToDecimals(Coords.worldToTileHeight(this._worldPosition.y), 14);
    const u = (this._tileOffset.x + this._centerOffset.x) / Coords.LEPTONS_PER_TILE;
    const v = (this._tileOffset.y + this._centerOffset.y) / Coords.LEPTONS_PER_TILE;
    let ramp = 0;
    if (this._tile.rampType !== 0) ramp = this.interpolateRampHeight(u, v, this._tile.rampType);
    return tileHeight - this._tile.z - ramp;
  }

  /** 深拷贝位置状态（tile 引用共享，偏移/世界坐标为副本）。 */
  clone(): ObjectPosition {
    const clone = new ObjectPosition(this.tiles, this.tileOccupation);
    clone._worldPosition = this._worldPosition.clone();
    clone._tile = this._tile;
    clone._tileOffset = this._tileOffset.clone();
    clone._centerOffset = this._centerOffset.clone();
    clone._tileElevation = this._tileElevation;
    clone._absoluteElevation = this._absoluteElevation;
    clone._computedTileElevation = this._computedTileElevation;
    return clone;
  }
}
