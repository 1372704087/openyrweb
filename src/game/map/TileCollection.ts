/**
 * TileCollection — 地图全部 tile 的索引与邻居/矩形查询。
 *
 * 构造时从原始 tile 描述 + TileSets 图像信息展开完整字段
 * （landType、rampType、id、occluded 等），建 rx/ry 与 dx/dy 双索引，
 * 统计高程范围并收集桥集合 tile；悬崖后方高地按规则改写 Rock。
 * getByMapCoords 对负坐标返回 undefined（防平面索引回绕）。
 *
 * 由 game/map/TileCollection.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
import { LandType, getLandType } from "game/type/LandType"; // 已转换
import { TerrainType } from "engine/type/TerrainType"; // 已转换
import { isNotNullOrUndefined } from "util/typeGuard"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 八方向邻居偏移方向枚举。 */
export enum TileDirection {
  /** 上（-1,-1）。 */
  Top = 0,
  /** 左上（-1,0）。 */
  TopLeft = 1,
  /** 右上（0,-1）。 */
  TopRight = 2,
  /** 左（-1,+1）。 */
  Left = 3,
  /** 右（+1,-1）。 */
  Right = 4,
  /** 左下（0,+1）。 */
  BottomLeft = 5,
  /** 下（+1,+1）。 */
  Bottom = 6,
  /** 右下（+1,0）。 */
  BottomRight = 7,
}

/** 地图 tile 集合。 */
export class TileCollection {
  tileSets: any;
  generalRules: any;
  /** 地图坐标网格尺寸。 */
  rSize: { width: number; height: number };
  /** 显示（对角）坐标网格尺寸。 */
  dSize: { width: number; height: number };
  /** rx+ry*rw 索引。 */
  tilesByRxy: any[];
  /** dx+dy*dw 索引。 */
  tilesByDxy: any[];
  /** 全部 tile（按加载序）。 */
  tiles: any[];
  /** 桥集合 tile 列表。 */
  bridgeSetTiles: any[];
  minTileHeight: number;
  maxTileHeight: number;
  /** 遮蔽/渲染截断高度。 */
  cutoffTileHeight: number;

  /**
   * @param damaged 传给 `TileSets.getTileImage` 的第 3 参（damaged 索引回调，
   * 孪生 GameMap 传入 randomInt；非 theaterType）。
   */
  constructor(rawTiles: any[], tileSets: any, generalRules: any, damaged: any) {
    this.tileSets = tileSets;
    this.generalRules = generalRules;
    const rSize = (this.rSize = { width: 0, height: 0 });
    const dSize = (this.dSize = { width: 0, height: 0 });
    for (let i = 0, n = rawTiles.length; i < n; ++i) {
      rSize.width = Math.max(rSize.width, rawTiles[i].rx);
      rSize.height = Math.max(rSize.height, rawTiles[i].ry);
      dSize.width = Math.max(dSize.width, rawTiles[i].dx);
      dSize.height = Math.max(dSize.height, rawTiles[i].dy);
    }
    rSize.width++;
    rSize.height++;
    dSize.width++;
    dSize.height++;
    const byRxy = (this.tilesByRxy = new Array(rSize.width * rSize.height));
    byRxy.fill(void 0);
    const byDxy = (this.tilesByDxy = new Array(dSize.width * dSize.height));
    byDxy.fill(void 0);
    const tiles = (this.tiles = new Array(rawTiles.length));
    const cliffCandidates: any[] = [];
    const bridgeTiles = (this.bridgeSetTiles = []);
    const knownTerrain = new Set(Object.values(TerrainType));
    this.minTileHeight = Number.POSITIVE_INFINITY;
    for (let i = 0, n = rawTiles.length; i < n; ++i) {
      const raw = rawTiles[i];
      const image = tileSets.getTileImage(raw.tileNum, raw.subTile, damaged);
      const terrainType = image.terrainType;
      if (!knownTerrain.has(terrainType)) {
        throw new Error(`Tile (${raw.rx}, ${raw.ry}) has unknown terrain type "${terrainType}"`);
      }
      const tile = {
        ...raw,
        terrainType,
        landType: getLandType(terrainType),
        onBridgeLandType: void 0 as LandType | undefined,
        rampType: image.rampType,
        id: raw.rx + "_" + raw.ry,
        occluded: false,
      };
      tiles[i] = tile;
      byRxy[tile.rx + tile.ry * rSize.width] = tile;
      byDxy[tile.dx + tile.dy * dSize.width] = tile;
      this.minTileHeight = Math.min(this.minTileHeight, tile.z);
      this.maxTileHeight = Math.max(this.maxTileHeight, tile.z);
      // 孪生短路：4!==height || 非悬崖 || push ⇒ 仅 height===4 且(Cliff||isCliffTile) 时 push
      if (
        !(
          4 !== image.height ||
          (tile.terrainType !== TerrainType.Cliff && !tileSets.isCliffTile(tile.tileNum))
        )
      ) {
        cliffCandidates.push(tile);
      }
      if (tileSets.isHighBridgeBoundaryTile(raw.tileNum)) bridgeTiles.push(tile);
    }
    this.computeLandBehindCliffTiles(cliffCandidates);
    this.cutoffTileHeight = this.computeCutoffTileHeight();
  }

  /** 悬崖后方格按规则降为 Rock（cliffBackImpassability≥2 才启用）。 */
  computeLandBehindCliffTiles(cliffs: any[]): void {
    if (!(this.generalRules.cliffBackImpassability < 2)) {
      // 相对悬崖的"后方"偏移（后方/侧后）
      const offsets: number[][] = [
        [-2, -2],
        [-1, -1],
        [-1, 1],
        [1, -1],
        [0, 1],
        [1, 0],
      ];
      cliffs.forEach((cliff) => {
        for (const [ox, oy] of offsets) {
          const behind = this.getByMapCoords(cliff.rx + ox, cliff.ry + oy);
          if (
            behind &&
            4 <= cliff.z - behind.z &&
            behind.terrainType !== TerrainType.Cliff &&
            behind.terrainType !== TerrainType.Rough
          ) {
            behind.landType = LandType.Rock;
          }
        }
      });
    }
  }

  /** 雷达颜色：tile 图像 radarLeft × 0.5。 */
  getTileRadarColor(tile: any): any {
    const image = this.tileSets.getTileImage(tile.tileNum, tile.subTile, () => 0);
    return image.radarLeft.clone().multiplyScalar(0.5);
  }

  getAll(): any[] {
    return [...this.tiles];
  }

  forEach(fn: (tile: any, index: number) => void): void {
    for (let i = 0, n = this.tiles.length; i < n; ++i) fn(this.tiles[i], i);
  }

  reduce<T>(fn: (acc: T, tile: any) => T, initial: T): T {
    let acc = initial;
    this.forEach((tile) => {
      acc = fn(acc, tile);
    });
    return acc;
  }

  getMinTileHeight(): number {
    return this.minTileHeight;
  }

  getMaxTileHeight(): number {
    return this.maxTileHeight;
  }

  getCutoffTileHeight(): number {
    return this.cutoffTileHeight;
  }

  /**
   * 从显示坐标底部向上找第一条有实体 tile 的行，取其最大 z 为截断高度。
   * 边缘 x∈[1, dSize.width-4)。
   */
  computeCutoffTileHeight(): number {
    const maxX = this.dSize.width - 1;
    let y = this.dSize.height - 1;
    let maxZ = 0;
    let searching = true;
    while (searching && 0 < y) {
      for (let x = 1; x < maxX - 3; x++) {
        const tile = this.getByDisplayCoords(x, y);
        if (tile) {
          searching = false;
          if (tile.z > maxZ) maxZ = tile.z;
        }
      }
      if (searching) y--;
    }
    return maxZ;
  }

  getAllBridgeSetTiles(): any[] {
    return this.bridgeSetTiles;
  }

  /** 八邻 tile（过滤空位）。 */
  getAllNeighbourTiles(tile: any): any[] {
    const rx = tile.rx;
    const ry = tile.ry;
    return [
      this.getByMapCoords(rx + 1, ry + 1),
      this.getByMapCoords(rx - 1, ry - 1),
      this.getByMapCoords(rx - 1, ry + 1),
      this.getByMapCoords(rx + 1, ry - 1),
      this.getByMapCoords(rx, ry + 1),
      this.getByMapCoords(rx + 1, ry),
      this.getByMapCoords(rx - 1, ry),
      this.getByMapCoords(rx, ry - 1),
    ].filter(isNotNullOrUndefined);
  }

  /** 指定方向取邻格（可能 undefined）。 */
  getNeighbourTile(tile: any, direction: TileDirection): any {
    const rx = tile.rx;
    const ry = tile.ry;
    switch (direction) {
      case TileDirection.Bottom:
        return this.getByMapCoords(rx + 1, ry + 1);
      case TileDirection.Top:
        return this.getByMapCoords(rx - 1, ry - 1);
      case TileDirection.Left:
        return this.getByMapCoords(rx - 1, ry + 1);
      case TileDirection.Right:
        return this.getByMapCoords(rx + 1, ry - 1);
      case TileDirection.BottomLeft:
        return this.getByMapCoords(rx, ry + 1);
      case TileDirection.BottomRight:
        return this.getByMapCoords(rx + 1, ry);
      case TileDirection.TopLeft:
        return this.getByMapCoords(rx - 1, ry);
      case TileDirection.TopRight:
        return this.getByMapCoords(rx, ry - 1);
      default:
        throw new Error("Invalid direction");
    }
  }

  /** 显示坐标取 tile；越界返回 undefined。 */
  getByDisplayCoords(dx: number, dy: number): any {
    if (dx < 0 || dy < 0 || dx >= this.dSize.width || dy >= this.dSize.height) return void 0;
    return this.tilesByDxy[dx + dy * this.dSize.width];
  }

  /** 地图坐标取 tile；越界返回 undefined。 */
  getByMapCoords(rx: number, ry: number): any {
    // Negative coordinates must return undefined — the flat array index
    // e + t*width would otherwise wrap a negative rx into a *positive*
    // index pointing at a real tile on the opposite map edge (a plane
    // flying off the left edge would teleport to the right edge and
    // never register as out-of-bounds).
    if (rx < 0 || ry < 0 || rx >= this.rSize.width || ry >= this.rSize.height) return void 0;
    return this.tilesByRxy[rx + ry * this.rSize.width];
  }

  getMapSize() {
    return this.rSize;
  }

  getDisplaySize() {
    return this.dSize;
  }

  /**
   * 矩形内 tile 列表。
   * @param rect - {rx,ry} 起点 + 可选 size，或直接 {x,y,width,height}
   * @param size - 可选 {width,height}（与 rect 组合成地图坐标起点）
   */
  getInRectangle(rect: any, size?: { width: number; height: number }): any[] {
    let ox: number, oy: number, w: number, h: number;
    if (size) {
      ox = rect.rx;
      oy = rect.ry;
      w = size.width;
      h = size.height;
    } else {
      ox = rect.x;
      oy = rect.y;
      w = rect.width;
      h = rect.height;
    }
    const result: any[] = [];
    for (let c = 0; c < w; c++) {
      for (let r = 0; r < h; r++) {
        const tile = this.getByMapCoords(ox + c, oy + r);
        if (tile) result.push(tile);
      }
    }
    return result;
  }

  /**
   * 为越界/查询用构造占位 tile（地表固定 Rock，高程 0）。
   * 对角偏移量由首 tile 的 (dx-rx+ry+1) 推得。
   */
  getPlaceholderTile(rx: number, ry: number): any {
    const first = this.tiles[0];
    const diagOffset = first.dx - first.rx + first.ry + 1;
    return {
      rx,
      ry,
      dx: rx - ry + diagOffset - 1,
      dy: rx + ry - diagOffset - 1,
      z: 0,
      id: rx + "_" + ry,
      landType: LandType.Rock,
      terrainType: TerrainType.Rock1,
      rampType: 0,
      subTile: 0,
      tileNum: 0,
      occluded: false,
      onBridgeLandType: void 0,
    };
  }
}
