/**
 * RadialBackFirstTileFinder — 环形扫描但"后缘优先"的 tile 搜索器。
 *
 * 与 RadialTileFinder 同按 distance 逐环扩散，但每环边序为
 * 左→上→右→下（孪生：先左竖、再上横、右竖向下、下横向左），
 * distance==0 时只测起点。predicate/可选边界过滤后 yield。
 *
 * 由 game/map/tileFinder/RadialBackFirstTileFinder.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 后缘优先的环形 tile 搜索器。 */
export class RadialBackFirstTileFinder {
  tiles: any;
  mapBounds: any;
  startTile: any;
  /** 占位地基尺寸 {width,height}。 */
  foundation: any;
  /** 起始环距（含）。 */
  distance: number;
  maxDistance: number;
  predicate: (tile: any) => boolean;
  checkBounds: boolean;
  generator: Generator<any>;

  constructor(
    tiles: any,
    mapBounds: any,
    startTile: any,
    foundation: any,
    distance: number,
    maxDistance: number,
    predicate: (tile: any) => boolean,
    checkBounds = true,
  ) {
    this.tiles = tiles;
    this.mapBounds = mapBounds;
    this.startTile = startTile;
    this.foundation = foundation;
    this.maxDistance = maxDistance;
    this.predicate = predicate;
    this.checkBounds = checkBounds;
    this.distance = distance;
    this.generator = this.generate();
  }

  getNextTile(): any {
    return this.generator.next().value;
  }

  *generate(): Generator<any> {
    const tryGet = (x: number, y: number) => {
      const tile = this.tiles.getByMapCoords(x, y);
      if (tile && (!this.checkBounds || this.mapBounds.isWithinBounds(tile)) && this.predicate(tile)) {
        return tile;
      }
    };
    do {
      const left = this.startTile.rx - this.distance;
      const top = this.startTile.ry - this.distance;
      const right = this.startTile.rx + this.foundation.width - 1 + this.distance;
      const bottom = this.startTile.ry + this.foundation.height - 1 + this.distance;
      let x: number, y: number, tile: any;
      if (0 < this.distance) {
        // 孪生边序：左竖(top+1→bottom-1) → 上横(left→right-1) → 右竖(bottom-1→top) → 下横(right→left)
        for (y = 1 + top; y < bottom; y++) {
          tile = tryGet(left, y);
          if (tile) yield tile;
        }
        for (x = left; x < right; x++) {
          tile = tryGet(x, top);
          if (tile) yield tile;
        }
        for (y = bottom - 1; y >= top; y--) {
          tile = tryGet(right, y);
          if (tile) yield tile;
        }
        for (x = right; x >= left; x--) {
          tile = tryGet(x, bottom);
          if (tile) yield tile;
        }
      } else {
        if (this.predicate(this.startTile)) yield this.startTile;
      }
    } while (this.distance++, this.distance <= this.maxDistance);
  }
}
