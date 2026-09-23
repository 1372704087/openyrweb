/**
 * MapHoverHandler — 屏幕点 → 实体/tile 悬停检测（帧节流 15Hz）。
 *
 * 由 gui/screen/game/worldInteraction/MapHoverHandler.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { EventDispatcher } from "util/event"; // 已转换
import { Coords } from "game/Coords"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 地图悬停处理器。 */
export class MapHoverHandler {
  /** 实体相交辅助。 */
  entityIntersectHelper: any;
  /** tile 相交辅助。 */
  mapTileIntersectHelper: any;
  /** 地图。 */
  map: any;
  /** 迷雾。 */
  shroud: any;
  /** 渲染器。 */
  renderer: any;
  /** 悬停变化事件源。 */
  private _onHoverChange = new EventDispatcher();
  /** 是否在帧循环。 */
  isActive = false;
  /** 是否需要立即刷新。 */
  needsUpdate = false;
  /** 当前悬停实体 renderable。 */
  currentHoverEntity: any;
  /** 当前悬停 tile。 */
  currentHoverTile: any;
  /** 最近指针位置。 */
  lastPointerPos: any;
  /** 上次帧时间。 */
  lastUpdate: number | undefined;
  /** 帧回调。 */
  onFrame: (now: number) => void;

  /** 悬停变化事件。 */
  get onHoverChange() {
    return this._onHoverChange.asEvent();
  }

  /**
   * @param entityIntersectHelper 实体相交
   * @param mapTileIntersectHelper tile 相交
   * @param map 地图
   * @param shroud 迷雾
   * @param renderer 渲染器
   */
  constructor(
    entityIntersectHelper: any,
    mapTileIntersectHelper: any,
    map: any,
    shroud: any,
    renderer: any,
  ) {
    this.entityIntersectHelper = entityIntersectHelper;
    this.mapTileIntersectHelper = mapTileIntersectHelper;
    this.map = map;
    this.shroud = shroud;
    this.renderer = renderer;
    this._onHoverChange = new EventDispatcher();
    this.isActive = false;
    this.needsUpdate = false;
    this.onFrame = (now: number) => {
      if (
        this.isActive &&
        (this.needsUpdate || !this.lastUpdate || now - this.lastUpdate >= 1e3 / 15)
      ) {
        this.needsUpdate = false;
        this.lastUpdate = now;
        this.doUpdate();
      }
    };
  }

  /** 读取当前悬停（销毁/坠机实体降级为纯 tile）。 */
  getCurrentHover(): any {
    if (this.currentHoverTile) {
      if (
        this.currentHoverEntity?.gameObject.isDestroyed ||
        this.currentHoverEntity?.gameObject.isCrashing
      ) {
        return { entity: void 0, gameObject: void 0, tile: this.currentHoverTile };
      }
      return {
        entity: this.currentHoverEntity,
        gameObject: this.currentHoverEntity?.gameObject,
        tile: this.currentHoverTile,
      };
    }
    return void 0;
  }

  /**
   * 更新迷雾。
   * @param shroud 新迷雾
   */
  setShroud(shroud: any): void {
    this.shroud = shroud;
  }

  /**
   * 记录指针；immediate 则立刻刷新，否则惰性启动帧循环。
   * @param pos 指针位置
   * @param immediate 是否立即
   */
  update(pos: any, immediate = false): void {
    this.lastPointerPos = pos;
    if (immediate) {
      this.doUpdate();
    } else if (!this.isActive) {
      this.isActive = true;
      this.needsUpdate = true;
      this.renderer.onFrame.subscribe(this.onFrame);
    }
  }

  /** 重算悬停实体/tile 并广播变化。 */
  doUpdate(): void {
    const prevEntity = this.currentHoverEntity;
    const prevTile = this.currentHoverTile;
    const hit = this.entityIntersectHelper.getEntityAtScreenPoint(this.lastPointerPos);
    if (hit) {
      this.currentHoverEntity = hit.renderable;
      let tile: any;
      const obj = hit.renderable.gameObject;
      const foundation = obj.getFoundation();
      if (obj.isBuilding() && (foundation.width > 1 || foundation.height > 1)) {
        tile = this.mapTileIntersectHelper.getTileAtScreenPoint(this.lastPointerPos);
      } else if (obj.isTechno() && !obj.art.isVoxel) {
        tile = obj.tile;
      } else {
        const rxry = new THREE.Vector2(hit.point.x, hit.point.z)
          .multiplyScalar(1 / Coords.LEPTONS_PER_TILE)
          .floor();
        tile = this.map.tiles.getByMapCoords(rxry.x, rxry.y);
        if (!tile) {
          console.warn(`No tile exists at rx,ry="${JSON.stringify(rxry)}". Falling back to obj location.`);
        }
      }
      tile ||= obj.tile;
      const bridge = this.map.tileOccupation.getBridgeOnTile(tile);
      if (
        this.currentHoverEntity.gameObject.isOverlay() &&
        this.currentHoverEntity.gameObject.isBridge() &&
        !bridge
      ) {
        this.currentHoverEntity = void 0;
      }
      this.currentHoverTile = tile;
    } else {
      this.currentHoverEntity = void 0;
      this.currentHoverTile = this.mapTileIntersectHelper.getTileAtScreenPoint(this.lastPointerPos);
    }
    // 迷雾遮挡时清实体（桥梁 overlay 除外）
    if (
      this.shroud &&
      this.currentHoverTile &&
      this.shroud.isShrouded(this.currentHoverTile, this.currentHoverEntity?.gameObject.tileElevation) &&
      !(
        this.currentHoverEntity?.gameObject.isOverlay() &&
        this.currentHoverEntity.gameObject.isBridge()
      )
    ) {
      this.currentHoverEntity = void 0;
    }
    if (this.currentHoverEntity !== prevEntity || this.currentHoverTile !== prevTile) {
      prevEntity?.selectionModel?.setHover(false);
      this.currentHoverEntity?.selectionModel?.setHover(true);
      if (this.currentHoverTile) {
        this._onHoverChange.dispatch(this, {
          entity: this.currentHoverEntity,
          gameObject: this.currentHoverEntity?.gameObject,
          tile: this.currentHoverTile,
        });
      }
    }
  }

  /** 清悬停并停止帧循环。 */
  finish(): void {
    this.currentHoverEntity?.selectionModel?.setHover(false);
    this.currentHoverEntity = void 0;
    this.currentHoverTile = void 0;
    if (this.isActive) {
      this.renderer.onFrame.unsubscribe(this.onFrame);
      this.isActive = false;
      this.needsUpdate = false;
    }
  }

  /** 释放=finish。 */
  dispose(): void {
    this.finish();
  }
}
