/**
 * IsoCoords — 等距坐标系换算（世界 ↔ 屏幕 ↔ tile ↔ 屏幕 tile）。
 *
 * 由 engine/IsoCoords.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换

/** 二维点（世界或屏幕）。 */
export interface IsoPoint {
  x: number;
  y: number;
}

/** 世界向量（含高度 y）。 */
export interface IsoVec3 {
  x: number;
  y: number;
  z: number;
}

/** 世界原点（worldToScreen 依赖）。 */
let worldOrigin: IsoPoint | undefined;

/**
 * 等距坐标换算工具类（静态方法）。
 * 必须先 init(worldOrigin) 才能做世界↔屏幕换算。
 */
export class IsoCoords {
  /** 设置世界原点（屏幕换算的基准）。 */
  static init(e: IsoPoint): void {
    worldOrigin = e;
  }

  /**
   * 世界坐标 → 屏幕坐标。
   * @param e - 世界 x
   * @param t - 世界 y（孪生参数名 t）
   */
  static worldToScreen(e: number, t: number): IsoPoint {
    if (!worldOrigin) {
      throw new Error("Coords not initialized with world origin");
    }
    e -= worldOrigin.x;
    t -= worldOrigin.y;
    return {
      x: (e /= Coords.ISO_WORLD_SCALE) - (t /= Coords.ISO_WORLD_SCALE),
      y: (e + t) / 2,
    };
  }

  /**
   * 屏幕坐标 → 世界坐标。
   * @param e - 屏幕 x
   * @param t - 屏幕 y
   */
  static screenToWorld(e: number, t: number): IsoPoint {
    if (!worldOrigin) {
      throw new Error("Coords not initialized with world origin");
    }
    return {
      x: ((e + 2 * t) / 2) * Coords.ISO_WORLD_SCALE + worldOrigin.x,
      y: ((2 * t - e) / 2) * Coords.ISO_WORLD_SCALE + worldOrigin.y,
    };
  }

  /**
   * 世界 3D 向量 → 屏幕点（含 tile 高度抬升）。
   * @param e - { x, y(高度), z } 世界向量
   */
  static vecWorldToScreen(e: IsoVec3): IsoPoint {
    const t = this.worldToScreen(e.x, e.z);
    t.y -= this.tileHeightToScreen(Coords.worldToTileHeight(e.y));
    return t;
  }

  /**
   * tile 坐标 → 屏幕点（tile 中心由 Coords.tileToWorld 决定）。
   * @param e - tile X
   * @param t - tile Y
   */
  static tileToScreen(e: number, t: number): IsoPoint {
    const i = Coords.tileToWorld(e, t);
    return this.worldToScreen(i.x, i.y);
  }

  /**
   * tile 高度层 → 屏幕纵向偏移。
   * @param e - 高度层数
   */
  static tileHeightToScreen(e: number): number {
    return e * (Coords.ISO_TILE_SIZE / 2);
  }

  /**
   * tile + 高度 → 屏幕点。
   * @param e - tile X
   * @param t - tile Y
   * @param i - 高度层数
   */
  static tile3dToScreen(e: number, t: number, i: number): IsoPoint {
    const r = this.tileToScreen(e, t);
    r.y -= this.tileHeightToScreen(i);
    return r;
  }

  /**
   * 屏幕 tile 单位 → 屏幕像素。
   * @param e - 屏幕 tile X
   * @param t - 屏幕 tile Y
   */
  static screenTileToScreen(e: number, t: number): IsoPoint {
    return { x: e * Coords.ISO_TILE_SIZE, y: (t * Coords.ISO_TILE_SIZE) / 2 };
  }

  /**
   * 屏幕像素 → 屏幕 tile 单位。
   * @param e - 屏幕 x
   * @param t - 屏幕 y
   */
  static screenToScreenTile(e: number, t: number): IsoPoint {
    return { x: e / Coords.ISO_TILE_SIZE, y: t / (Coords.ISO_TILE_SIZE / 2) };
  }

  /**
   * 屏幕 tile 单位 → 世界坐标。
   * @param e - 屏幕 tile X
   * @param t - 屏幕 tile Y
   */
  static screenTileToWorld(e: number, t: number): IsoPoint {
    const i = this.screenTileToScreen(e, t);
    return this.screenToWorld(i.x, i.y);
  }

  /** 单个屏幕 tile 的像素宽高。 */
  static getScreenTileSize(): { width: number; height: number } {
    return {
      width: this.tileToScreen(1, 0).x - this.tileToScreen(0, 1).x,
      height: this.tileToScreen(1, 1).y - this.tileToScreen(0, 0).y,
    };
  }

  /**
   * 屏幕距离 → 世界距离。
   * @param e - 屏幕距离 x 分量
   * @param t - 屏幕距离 y 分量
   */
  static screenDistanceToWorld(e: number, t: number): { x: number; y: number } {
    return Coords.screenDistanceToWorld(e, t);
  }
}
