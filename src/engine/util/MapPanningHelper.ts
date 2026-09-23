/**
 * MapPanningHelper — 由格子/世界/屏幕坐标推算摄像机平移量与可视平移边界。
 *
 * 由 engine/util/MapPanningHelper.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
// 孪生模块仅经 wildcard `export = any` 可达，命名导出需经模块对象取值。
import * as IsoCoordsModule from "engine/IsoCoords"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
const IsoCoords: any = (IsoCoordsModule as any).IsoCoords ?? IsoCoordsModule;

/** 屏幕/平移二维点。 */
interface Point {
  x: number;
  y: number;
}

/** 矩形区域（视口或地图屏幕包围盒）。 */
interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 地图格子（取 z 作高度）。 */
interface TileLike {
  z: number;
}

/** 最小地图接口（仅本 helper 用到的成员）。 */
interface MapLike {
  tiles: {
    getByMapCoords(x: number, y: number): TileLike | undefined | null;
    getPlaceholderTile(x: number, y: number): TileLike;
  };
}

/** 平移目标点（floor 后的整数屏幕偏移）。 */
interface CameraPan {
  x: number;
  y: number;
}

/** 平移限幅矩形（含位置与可滚动尺寸）。 */
interface PanLimits {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 计算地图平移量的辅助类。 */
export class MapPanningHelper {
  private map: MapLike;

  constructor(map: MapLike) {
    this.map = map;
  }

  /**
   * 由地图格子坐标 (x, y) 求平移量：取该格（或占位格）高度，
   * 以格心 (x+0.5, y+0.5) 投到屏幕再走 computeCameraPanFromScreen。
   */
  computeCameraPanFromTile(x: number, y: number): CameraPan {
    const tile = this.map.tiles.getByMapCoords(x, y) ?? this.map.tiles.getPlaceholderTile(x, y);
    const screen = IsoCoords.tile3dToScreen(x + 0.5, y + 0.5, tile.z);
    return this.computeCameraPanFromScreen(screen);
  }

  /** 由世界坐标（等距世界空间点）经 vecWorldToScreen 求平移量。 */
  computeCameraPanFromWorld(world: Point): CameraPan {
    const screen = IsoCoords.vecWorldToScreen(world);
    return this.computeCameraPanFromScreen(screen);
  }

  /**
   * 核心换算：pan = floor(screen - 原点屏幕坐标)。
   * 原点取 IsoCoords.worldToScreen(0,0)，保证 pan=0 时世界原点对齐视口逻辑原点。
   */
  computeCameraPanFromScreen(screen: Point): CameraPan {
    const origin = this.getScreenPanOrigin();
    return { x: Math.floor(screen.x - origin.x), y: Math.floor(screen.y - origin.y) };
  }

  /** 屏幕坐标系下的平移原点（世界 (0,0) 的投影）。 */
  getScreenPanOrigin(): Point {
    return IsoCoords.worldToScreen(0, 0);
  }

  /**
   * 计算平移限幅：在 viewport（视口尺寸位置）与 mapBounds（地图屏幕包围盒）下，
   * 可允许的 pan.x/pan.y 起点与可滚动 width/height。
   * - x/y 用 ceil 收拢到整数，y 再减 1（与孪生 off-by-one 一致）。
   * - width/height 再减 1，避免最后 1px 越界。
   */
  computeCameraPanLimits(viewport: Rect, mapBounds: Rect): PanLimits {
    const origin = this.getScreenPanOrigin();
    return {
      x: Math.ceil(mapBounds.x - origin.x + viewport.width / 2),
      y: Math.ceil(mapBounds.y - origin.y + viewport.height / 2 - 1),
      width: mapBounds.width - viewport.width - 1,
      height: mapBounds.height - viewport.height - 1,
    };
  }
}
