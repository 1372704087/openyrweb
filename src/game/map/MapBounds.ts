/**
 * MapBounds — 地图可建区/全图/钳制区矩形与边界判定。
 *
 * fromMapFile 按 MapFile 的 fullSize/localSize 与 tiles 截断高度
 * 推导 fullSize、clampedFullSize、localSize、mapBuildableSize；
 * updateRawLocalSize 在本地限制变化时重算并派发 onLocalResize。
 * isWithinBounds / clampWithinBounds / isWithinHardBounds 分别服务
 * 放置、钳制与硬边界查询。
 *
 * 由 game/map/MapBounds.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
import * as geometry from "util/geometry"; // 已转换
import { Coords } from "game/Coords"; // 已转换
import { EventDispatcher } from "util/event"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 简单矩形。 */
type Rect = { x: number; y: number; width: number; height: number };

/** 地图边界管理器。 */
export class MapBounds {
  /** 遮蔽/渲染截断高度（tile 高度上限参考）。 */
  mapCutoffHeight = 0;
  /** 可建造区域（由 localSize 内缩）。 */
  mapBuildableSize: Rect = { x: 0, y: 0, width: 0, height: 0 };
  /** 本地限制（等轴测上的有效可玩矩形）。 */
  localSize: Rect = { x: 0, y: 0, width: 0, height: 0 };
  /** 全图尺寸。 */
  fullSize: { width: number; height: number } = { width: 0, height: 0 };
  /** 钳制后的全图（含 ISO 半格修正）。 */
  clampedFullSize: Rect = { x: 0, y: 0, width: 0, height: 0 };
  /** 原始本地限制（未经 computeLocalSize 变换）。 */
  rawLocalSize: Rect = { x: 0, y: 0, width: 0, height: 0 };

  private _onLocalResize = new EventDispatcher();

  /** 本地限制变更事件（dispatch(this)）。 */
  get onLocalResize() {
    return this._onLocalResize.asEvent();
  }

  /**
   * 从地图文件与 tile 集合初始化各尺寸。
   * @param mapFile - 含 fullSize / localSize
   * @param tiles - 需提供 getCutoffTileHeight()
   */
  fromMapFile(mapFile: any, tiles: any): this {
    this.fullSize = { width: 2 * mapFile.fullSize.width, height: 2 * mapFile.fullSize.height };
    this.clampedFullSize = {
      x: 1,
      y: 2,
      width: 2 * (mapFile.fullSize.width - 1) - 1 / Coords.ISO_TILE_SIZE,
      height: 2 * (mapFile.fullSize.height - 1) + 1 - 1 / Coords.ISO_TILE_SIZE,
    };
    this.mapCutoffHeight = Math.max(9, tiles.getCutoffTileHeight());
    // localSize.x 至少 2，且宽度不超过 fullSize-2-x
    const minX = Math.max(2, mapFile.localSize.x);
    const raw: Rect = {
      x: minX,
      y: mapFile.localSize.y,
      width: Math.min(mapFile.fullSize.width - 2 - minX, mapFile.localSize.width),
      height: mapFile.localSize.height,
    };
    this.updateRawLocalSize(raw);
    return this;
  }

  /**
   * 更新原始本地限制并派发 onLocalResize。
   * 已有旧限制且新矩形不包含旧矩形时警告并跳过；相等时也跳过。
   */
  updateRawLocalSize(raw: Rect): void {
    if (
      this.rawLocalSize.width &&
      this.rawLocalSize.height &&
      !geometry.rectContainsRect(raw, this.rawLocalSize)
    ) {
      console.warn("New map limits must be outside old limits. Skipping.");
    } else if (!geometry.rectEquals(raw, this.rawLocalSize)) {
      this.localSize = this.computeLocalSize(raw, this.fullSize.height / 2, this.mapCutoffHeight);
      this.rawLocalSize = { ...raw };
      this.mapBuildableSize = {
        x: this.localSize.x,
        y: this.localSize.y + 4,
        width: this.localSize.width - 2,
        height: this.localSize.height - 8,
      };
      this._onLocalResize.dispatch(this);
    }
  }

  /**
   * 原始 localSize → 实际 localSize（对角坐标放大并按半高/截断钳高）。
   * @param raw - 原始限制
   * @param halfFullHeight - fullSize.height / 2
   * @param cutoffHeight - mapCutoffHeight
   */
  computeLocalSize(raw: Rect, halfFullHeight: number, cutoffHeight: number): Rect {
    return {
      x: 2 * raw.x,
      y: 2 * raw.y - 4,
      height: Math.min(2 * (raw.height + 5) - 1, 2 * halfFullHeight - 2 * (raw.y - 3) - cutoffHeight),
      width: 2 * raw.width,
    };
  }

  getLocalSize(): Rect {
    return this.localSize;
  }

  getRawLocalSize(): Rect {
    return this.rawLocalSize;
  }

  getFullSize(): { width: number; height: number } {
    return this.fullSize;
  }

  getClampedFullSize(): Rect {
    return this.clampedFullSize;
  }

  /** 对象是否在可建区内（用对角坐标 dy-z 投影）。 */
  isWithinBounds(obj: any): boolean {
    return geometry.rectContainsPoint(this.mapBuildableSize, { x: obj.dx, y: obj.dy - obj.z });
  }

  /** 把对角坐标钳进可建区，并做奇偶对齐 + 下溢回退 2。 */
  clampWithinBounds(obj: any): { dx: number; dy: number } {
    let { x, y } = geometry.rectClampPoint(this.mapBuildableSize, { x: obj.dx, y: obj.dy - obj.z });
    // 奇偶：让 x/y 同奇偶（对角格合法坐标）
    y += (x % 2) - (y % 2);
    if (y > this.mapBuildableSize.y + this.mapBuildableSize.height) y -= 2;
    return { dx: x, dy: y };
  }

  /**
   * lepton 点是否在钳制全图硬边界内。
   * @param p - { x, y } 或 { x, z }（z 优先于 y）
   */
  isWithinHardBounds(p: any): boolean {
    const xTiles = p.x / Coords.LEPTONS_PER_TILE;
    const yOrZ = (p.z ?? p.y) / Coords.LEPTONS_PER_TILE;
    let bx = xTiles - yOrZ + this.fullSize.width / 2 - 1;
    let by = xTiles + yOrZ - this.fullSize.width / 2 - 1;
    return geometry.rectContainsPoint(this.clampedFullSize, { x: ++bx, y: ++by });
  }
}
