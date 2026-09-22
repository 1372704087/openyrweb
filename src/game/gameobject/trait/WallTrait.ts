/**
 * WallTrait — 墙体连接与联动伤害（wallType 方向掩码、半伤扩散）。
 *
 * 建筑出生 connectWall 更新自身与相邻同名墙的 wallType；overlay 用 value
 * 存类型。onDamage 半伤经 linkedDamageHandled 防环扩散到相邻 Wall 地形墙。
 * unspawn 后 CardinalTileFinder 找相邻同名墙重连。
 *
 * 由 game/gameobject/trait/WallTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */
import * as NotifyDamageModule from "game/gameobject/trait/interface/NotifyDamage"; // 已转换
import * as LandTypeModule from "game/type/LandType"; // 已转换
import * as NotifySpawnModule from "game/gameobject/trait/interface/NotifySpawn"; // 已转换
import * as NotifyUnspawnModule from "game/gameobject/trait/interface/NotifyUnspawn"; // 已转换
import * as CardinalTileFinderModule from "game/map/tileFinder/CardinalTileFinder"; // 未转换（any-shim）
import * as wallTypesModule from "game/map/wallTypes"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class WallTrait {
  /** 联动伤害是否已在处理中（防环）。 */
  linkedDamageHandled: boolean;
  /** 方向掩码索引（wallTypes 表）。 */
  wallType: number;

  constructor() {
    this.linkedDamageHandled = false;
    this.wallType = 0;
  }

  /** 出生：建筑则 connectWall，overlay 则从 value 恢复 wallType。 */
  [NotifySpawnModule.NotifySpawn.onSpawn](object: any, world: any) {
    if (object.isBuilding()) this.connectWall(object, world.map);
    else this.wallType = object.value;
  }

  /** 离场：刷新仍存活的相邻同名墙连接。 */
  [NotifyUnspawnModule.NotifyUnspawn.onUnspawn](object: any, world: any) {
    this.updateAdjacentWalls(object, world.map);
  }

  /** 受伤：半伤扩散到相邻 Wall 地形上的同名墙/overlay。 */
  [NotifyDamageModule.NotifyDamage.onDamage](object: any, world: any, damage: number, attacker: any) {
    if (!this.linkedDamageHandled) {
      const half = Math.floor(damage / 2);
      if (half) {
        for (const neighbour of world.map.tiles.getAllNeighbourTiles(object.tile)) {
          if (neighbour.landType === LandTypeModule.LandType.Wall) {
            const linked = world.map
              .getObjectsOnTile(neighbour)
              .find((o: any) => (o.isBuilding() || o.isOverlay()) && o.wallTrait);
            linked.wallTrait.linkedDamageHandled = true;
            linked.healthTrait.inflictDamage(half, attacker, world);
            linked.wallTrait.linkedDamageHandled = false;
            if (!linked.healthTrait.health) world.destroyObject(linked, attacker);
          }
        }
      }
    }
  }

  /** 用 CardinalTileFinder（非对角）找相邻同名墙并 connectWall。 */
  updateAdjacentWalls(object: any, map: any) {
    const finder = new CardinalTileFinderModule.CardinalTileFinder(map.tiles, map.mapBounds, object.tile, 1, 1);
    finder.diagonal = false;
    let next: any;
    while ((next = finder.getNextTile())) {
      const neighbour = map.getObjectsOnTile(next).find((o: any) => (o.isBuilding() || o.isOverlay()) && o.name === object.rules.name);
      if (neighbour) this.connectWall(neighbour, map);
    }
  }

  /** 更新自身与一圈相邻同名墙的 wallType。 */
  connectWall(object: any, map: any) {
    const adjacent = this.getAdjacentWallData(object.tile, object.name, map);
    this.updateWallType(
      object,
      adjacent.map((a: any) => a.direction),
    );
    adjacent.forEach((a: any) => {
      const second = this.getAdjacentWallData(a.tile, a.wall.name, map);
      this.updateWallType(
        a.wall,
        second.map((s: any) => s.direction),
      );
    });
  }

  /** 由方向列表算 N/E/S/W 掩码并写入 wallTrait.wallType（overlay 同步 value）。 */
  updateWallType(object: any, directions: any[]) {
    const mask = [0, 0, 0, 0];
    for (const dir of directions) {
      if (dir[0] === 0 && dir[1] === -1) mask[0] = 1;
      if (dir[0] === 1 && dir[1] === 0) mask[1] = 1;
      if (dir[0] === 0 && dir[1] === 1) mask[2] = 1;
      if (dir[0] === -1 && dir[1] === 0) mask[3] = 1;
    }
    const type = this.findWallType(mask);
    object.wallTrait.wallType = type;
    if (object.isOverlay()) object.value = type;
  }

  /** 在 wallTypes 表中匹配掩码；未命中告警并返回 0。 */
  findWallType(mask: number[]) {
    for (let i = 0; i < wallTypesModule.wallTypes.length; ++i) {
      const t = wallTypesModule.wallTypes[i];
      if (t[0] === mask[0] && t[1] === mask[1] && t[2] === mask[2] && t[3] === mask[3]) return i;
    }
    console.warn("Invalid wall directions", mask);
    return 0;
  }

  /** 四方向找同名墙/overlay，返回 {direction, tile, wall}。 */
  getAdjacentWallData(tile: any, name: string, map: any) {
    const result: any[] = [];
    for (const dir of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ]) {
      const coords = { x: tile.rx + dir[0], y: tile.ry + dir[1] };
      const neighbourTile = map.tiles.getByMapCoords(coords.x, coords.y);
      const wall =
        neighbourTile &&
        map.getObjectsOnTile(neighbourTile).find((o: any) => (o.isBuilding() || o.isOverlay()) && o.name === name);
      if (wall) result.push({ direction: dir, tile: neighbourTile, wall });
    }
    return result;
  }
}
