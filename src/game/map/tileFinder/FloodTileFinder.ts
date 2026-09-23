/**
 * FloodTileFinder — 连通性洪水填充 tile 搜索器。
 *
 * 从 startTile 出发按栈 DFS 扩散：visited 去重，areConnected 决定
 * 是否把邻格压栈，predicate + 可选边界过滤决定是否 yield。
 * getNextTile 委托内部 generator.next().value。
 *
 * 由 game/map/tileFinder/FloodTileFinder.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 连通洪水填充搜索器。 */
export class FloodTileFinder {
  tiles: any;
  mapBounds: any;
  startTile: any;
  /** 相邻两格是否视为可连通。 */
  areConnected: (a: any, b: any) => boolean;
  predicate: (tile: any) => boolean;
  checkBounds: boolean;
  generator: Generator<any>;

  constructor(
    tiles: any,
    mapBounds: any,
    startTile: any,
    areConnected: (a: any, b: any) => boolean,
    predicate: (tile: any) => boolean,
    checkBounds = true,
  ) {
    this.tiles = tiles;
    this.mapBounds = mapBounds;
    this.startTile = startTile;
    this.areConnected = areConnected;
    this.predicate = predicate;
    this.checkBounds = checkBounds;
    this.generator = this.generate();
  }

  getNextTile(): any {
    return this.generator.next().value;
  }

  *generate(): Generator<any> {
    const stack = [this.startTile];
    const visited = new Set();
    while (stack.length) {
      const tile = stack.pop();
      if (!visited.has(tile)) {
        visited.add(tile);
        // 越界/不满足谓词时不 yield，但仍继续扩展邻格（与孪生短路顺序一致）
        if ((this.checkBounds && !this.mapBounds.isWithinBounds(tile)) || !this.predicate(tile)) {
          // 不 yield
        } else {
          yield tile;
        }
        for (const neighbour of this.tiles.getAllNeighbourTiles(tile)) {
          if (this.areConnected(neighbour, tile)) stack.push(neighbour);
        }
      }
    }
  }
}
