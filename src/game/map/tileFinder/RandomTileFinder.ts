/**
 * RandomTileFinder — 在 maxDistance 方形窗口内随机枚举 tile。
 *
 * 构造时把 (2*maxDistance+1)^2 个线性下标填入 pool，generate 每次
 * 用 rng 抽一个下标并映射回世界坐标，predicate/边界过滤后 yield。
 * 不放回抽样：pool 耗尽即结束。
 *
 * 由 game/map/tileFinder/RandomTileFinder.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { GameMath } from "game/math/GameMath"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 随机窗口 tile 搜索器。 */
export class RandomTileFinder {
  tiles: any;
  mapBounds: any;
  startTile: any;
  maxDistance: number;
  /** 随机源（需提供 generateRandomInt）。 */
  rng: any;
  predicate: (tile: any) => boolean;
  /** 是否允许返回起点本身。 */
  includeStartTile: boolean;
  checkBounds: boolean;
  /** 待抽取的线性下标池（不放回）。 */
  pool: number[];
  generator: Generator<any>;

  constructor(
    tiles: any,
    mapBounds: any,
    startTile: any,
    maxDistance: number,
    rng: any,
    predicate: (tile: any) => boolean,
    includeStartTile = false,
    checkBounds = true,
  ) {
    this.tiles = tiles;
    this.mapBounds = mapBounds;
    this.startTile = startTile;
    this.maxDistance = maxDistance;
    this.rng = rng;
    this.predicate = predicate;
    this.includeStartTile = includeStartTile;
    this.checkBounds = checkBounds;
    this.pool = [];
    // 池大小 = 边长²；用 GameMath.pow 保持与孪生同一数值路径
    this.pool = new Array(GameMath.pow(2 * this.maxDistance + 1, 2))
      .fill(0)
      .map((_: number, i: number) => i);
    this.generator = this.generate();
  }

  getNextTile(): any {
    return this.generator.next().value;
  }

  *generate(): Generator<any> {
    const tryGet = (x: number, y: number) => {
      const tile = this.tiles.getByMapCoords(x, y);
      if (this.includeStartTile || tile !== this.startTile) {
        return tile && (!this.checkBounds || this.mapBounds.isWithinBounds(tile)) && this.predicate(tile)
          ? tile
          : undefined;
      }
    };
    const side = 2 * this.maxDistance + 1;
    while (this.pool.length) {
      // 单元素时固定抽 0，与孪生一致
      let idx = 1 < this.pool.length ? this.rng.generateRandomInt(0, this.pool.length) : 0;
      const linear = this.pool.splice(idx, 1)[0];
      const col = linear % side;
      const row = Math.floor(linear / side);
      const tile = tryGet(this.startTile.rx - this.maxDistance + col, this.startTile.ry - this.maxDistance + row);
      if (tile) yield tile;
    }
  }
}
