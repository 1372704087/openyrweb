/**
 * RadialTileFinder — 环形（逐距离扩散）tile 搜索器。
 *
 * 从 startTile 占位开始，按距离 0→maxDistance 逐环扩散：
 * 每环按"右→下→左→上"顺时针扫描矩形边缘，predicate 过滤。
 * 由 game/map/tileFinder/RadialTileFinder.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export class RadialTileFinder {
  tiles: any;
  mapBounds: any;
  startTile: any;
  foundation: any;
  maxDistance: number;
  predicate: (tile: any) => boolean;
  checkBounds: boolean;
  distance: number;
  generator: Generator;

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
    const getTile = (x: number, y: number) => {
      const tile = this.tiles.getByMapCoords(x, y);
      if (tile && (!this.checkBounds || this.mapBounds.isWithinBounds(tile)) && this.predicate(tile)) return tile;
      return undefined;
    };
    do {
      const left = this.startTile.rx - this.distance;
      const top = this.startTile.ry - this.distance;
      const right = this.startTile.rx + this.foundation.width - 1 + this.distance;
      const bottom = this.startTile.ry + this.foundation.height - 1 + this.distance;
      let x: number, y: number, tile: any;
      if (this.distance > 0) {
        for (x = right; x >= left; x--) { tile = getTile(x, bottom); if (tile) yield tile; }
        for (y = bottom - 1; y >= top; y--) { tile = getTile(right, y); if (tile) yield tile; }
        for (x = left; x < right; x++) { tile = getTile(x, top); if (tile) yield tile; }
        for (y = top + 1; y < bottom; y++) { tile = getTile(left, y); if (tile) yield tile; }
      } else {
        if (this.predicate(this.startTile)) yield this.startTile;
      }
    } while (this.distance++, this.distance <= this.maxDistance);
  }
}
