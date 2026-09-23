/**
 * DirectionalTileFinder — 单方向直线 tile 搜索器。
 *
 * 从 startTile 沿 (sign(dirX), sign(dirY)) 方向每步 distance++ 扫格，
 * 经 predicate / 可选边界检查过滤；触达 maxDistance 后置 finished。
 *
 * 由 game/map/tileFinder/DirectionalTileFinder.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 单方向直线 tile 搜索器。 */
export class DirectionalTileFinder {
  tiles: any;
  mapBounds: any;
  startTile: any;
  /** 起始步长（含）。 */
  distance: number;
  /** 最大步长（0/undefined = 不限）。 */
  maxDistance: number;
  /** 方向 x 分量（仅取 sign）。 */
  dirX: number;
  /** 方向 y 分量（仅取 sign）。 */
  dirY: number;
  predicate: (tile: any) => boolean;
  /** 是否调用 mapBounds.isWithinBounds。 */
  checkBounds: boolean;
  finished = false;

  constructor(
    tiles: any,
    mapBounds: any,
    startTile: any,
    distance: number,
    maxDistance: number,
    dirX: number,
    dirY: number,
    predicate: (tile: any) => boolean = () => true,
    checkBounds = true,
  ) {
    this.tiles = tiles;
    this.mapBounds = mapBounds;
    this.startTile = startTile;
    this.maxDistance = maxDistance;
    this.dirX = dirX;
    this.dirY = dirY;
    this.predicate = predicate;
    this.checkBounds = checkBounds;
    this.finished = false;
    this.distance = distance;
  }

  /** 取下一格；已 finished 时返回 undefined。 */
  getNextTile(): any {
    if (!this.finished) {
      let found: any;
      do {
        const coords = { x: this.startTile.rx, y: this.startTile.ry };
        coords.x += this.distance * Math.sign(this.dirX);
        coords.y += this.distance * Math.sign(this.dirY);
        const tile = this.tiles.getByMapCoords(coords.x, coords.y);
        if (
          tile &&
          (!this.checkBounds || this.mapBounds.isWithinBounds(tile)) &&
          this.predicate(tile)
        ) {
          found = tile;
        }
        // 孪生：先判 maxDistance 再递增；命中上限时返回当前 found（可为 undefined）
        if (this.maxDistance && this.distance >= this.maxDistance) {
          this.finished = true;
          return found;
        }
      } while ((this.distance++, !found));
      return found;
    }
  }
}
