/**
 * TileOcclusion — 建筑/对象对雷达与选择框的 tile 遮挡集。
 *
 * 按 art.occupyHeight 在地块左上方向扩展遮挡偏移（含 foundation
 * 宽高），叠加 art.addOccupy / 减去 art.removeOccupy，再映射到
 * 实际 tile 列表；每个 tile 持有 Set 记录遮挡者，occluded 为
 * size>0 的镜像布尔。
 *
 * 由 game/map/TileOcclusion.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
import { Vector2 } from "game/math/Vector2"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** tile 遮挡管理器。 */
export class TileOcclusion {
  tiles: any;
  /** rx → ry → Set(occluder) 稀疏表。 */
  tileOcclusion: any[][];

  constructor(tiles: any) {
    this.tiles = tiles;
    this.tileOcclusion = [];
    const table = this.tileOcclusion;
    for (const tile of tiles.getAll()) {
      table[tile.rx] = table[tile.rx] || [];
      table[tile.rx][tile.ry] = new Set();
    }
  }

  addOccluder(obj: any): void {
    const affected = this.calculateTilesForGameObject(obj);
    affected.forEach((tile) => this.occludeTile(tile, obj));
  }

  removeOccluder(obj: any): void {
    const affected = this.calculateTilesForGameObject(obj);
    affected.forEach((tile) => this.unoccludeTile(tile, obj));
  }

  /**
   * 计算对象遮挡的 tile 列表。
   * occupyHeight-2 层沿左/上斜向扫 foundation，再应用 add/removeOccupy。
   */
  calculateTilesForGameObject(obj: any): any[] {
    const occupyHeight = obj.art.occupyHeight;
    const layers = Math.max(0, occupyHeight - 2);
    const offsets: Vector2[] = [];
    const foundation = obj.getFoundation();
    // 上侧斜扫：每层向左上扩
    for (let h = 1; h <= layers; h++) {
      for (let w = 0; w < foundation.width; w++) {
        offsets.push(new Vector2(w - h, -h));
      }
    }
    // 左侧斜扫
    for (let d = 1; d <= layers; d++) {
      for (let h = 1; h < foundation.height; h++) {
        offsets.push(new Vector2(-d, h - d));
      }
    }
    offsets.push(...obj.art.addOccupy);
    for (const { x: rmx, y: rmy } of obj.art.removeOccupy) {
      const idx = offsets.findIndex((o) => o.x === rmx && o.y === rmy);
      if (-1 !== idx) offsets.splice(idx, 1);
    }
    const origin = obj.tile;
    const result: any[] = [];
    for (const { x: ox, y: oy } of offsets) {
      const tile = this.tiles.getByMapCoords(origin.rx + ox, origin.ry + oy);
      if (tile) result.push(tile);
    }
    return result;
  }

  occludeTile(tile: any, obj: any): void {
    this.tileOcclusion[tile.rx][tile.ry].add(obj);
    tile.occluded = true;
  }

  unoccludeTile(tile: any, obj: any): void {
    const set = this.tileOcclusion[tile.rx][tile.ry];
    set.delete(obj);
    // 仍有其他遮挡者时保持 true（孪生用 size 赋值布尔语义）
    tile.occluded = 0 < set.size;
  }

  isTileOccluded(tile: any): boolean {
    return 0 < this.tileOcclusion[tile.rx][tile.ry].size;
  }
}
