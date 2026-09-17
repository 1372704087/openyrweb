/**
 * CardinalTileFinder — 方向旋转 tile 搜索器（从起点按距离环形旋转扫四方向）。
 *
 * 从 startTile 中心按 dirVec 方向跳 distance 格，每步旋转 45°（对角）
 * 或 90°（正向），扫完一圈后 distance++。由 game/map/tileFinder/
 * CardinalTileFinder.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Vector2 } from "game/math/Vector2"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class CardinalTileFinder {
  tiles: any;
  mapBounds: any;
  startTile: any;
  maxDistance: number;
  predicate: (tile: any) => boolean;
  dirVec: Vector2;
  finished = false;
  diagonal = true;
  distance: number;

  constructor(tiles: any, mapBounds: any, startTile: any, distance: number, maxDistance: number, predicate?: (tile: any) => boolean) {
    this.tiles = tiles;
    this.mapBounds = mapBounds;
    this.startTile = startTile;
    this.maxDistance = maxDistance;
    this.predicate = predicate ?? (() => true);
    this.dirVec = new Vector2(10, 0);
    this.finished = false;
    this.diagonal = true;
    this.distance = distance;
  }

  getNextTile(): any {
    if (this.finished) return undefined;
    let found: any;
    do {
      const coords = { x: this.startTile.rx, y: this.startTile.ry };
      coords.x += this.distance * Math.sign(this.dirVec.x);
      coords.y += this.distance * Math.sign(this.dirVec.y);
      this.dirVec.rotateAround(new Vector2(), (Math.PI / 4) * (this.diagonal ? 1 : 2)).round();
      const tile = this.tiles.getByMapCoords(coords.x, coords.y);
      if (tile && this.mapBounds.isWithinBounds(tile) && this.predicate(tile)) found = tile;
      if (!this.dirVec.angle()) {
        if (this.maxDistance && this.distance >= this.maxDistance) {
          this.finished = true;
          return found;
        }
        this.distance++;
      }
    } while (!found);
    return found;
  }
}
