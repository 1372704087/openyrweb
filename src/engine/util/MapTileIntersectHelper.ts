/**
 * MapTileIntersectHelper — 屏幕坐标到地图格子的相交查询助手。
 *
 * 将视口内点换算到世界坐标，再在候选格子上做三角形包含测试，
 * 返回命中的地图格子列表（用于选中/悬停判定）。
 *
 * 由 engine/util/MapTileIntersectHelper.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */
import { rectContainsPoint } from "util/geometry"; // 已转换
import { Coords } from "game/Coords"; // 已转换
// 孪生模块仅经 wildcard `export = any` 可达，命名导出需经模块对象取值。
import * as IsoCoordsModule from "engine/IsoCoords"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
const IsoCoords: any = (IsoCoordsModule as any).IsoCoords ?? IsoCoordsModule;
const TriangleCtor: any = (THREE as any).Triangle;

export class MapTileIntersectHelper {
  /** 所查询的地图数据（含 tiles 索引）。 */
  readonly map: any;
  /** 所属场景（提供 viewport、cameraPan）。 */
  readonly scene: any;

  constructor(map: any, scene: any) {
    this.map = map;
    this.scene = scene;
  }

  /** 屏幕点落在视口内时，返回该点命中的首个格子；否则 undefined。 */
  getTileAtScreenPoint(point: { x: number; y: number }) {
    const viewport = this.scene.viewport;
    if (rectContainsPoint(viewport, point)) {
      const tiles = this.intersectTilesByScreenPos(point);
      return tiles.length ? tiles[0] : undefined;
    }
  }

  /**
   * 求屏幕点附近可能相交的格子并做精确三角形测试。
   * 无命中时向上偏移一格高度后递归一次；仍无命中返回空数组。
   */
  intersectTilesByScreenPos(point: { x: number; y: number }) {
    const origin = IsoCoords.worldToScreen(0, 0);
    const pan = this.scene.cameraPan.getPan();
    const screen = {
      x: point.x + origin.x + pan.x - this.scene.viewport.width / 2,
      y: point.y + origin.y + pan.y - this.scene.viewport.height / 2,
    };
    const world = IsoCoords.screenToWorld(screen.x, screen.y);
    const base = new THREE.Vector2(world.x, world.y)
      .multiplyScalar(1 / Coords.LEPTONS_PER_TILE)
      .floor();
    let tile = this.map.tiles.getByMapCoords(base.x, base.y);
    if (!tile) {
      for (let i = 0; i < 15 && !(tile = this.map.tiles.getByMapCoords(base.x + i, base.y + i)); i++);
      if (!tile) return [];
    }
    const candidates = [];
    for (let f = 0; f < 15; f++)
      for (const c of [
        { x: tile.rx + f, y: tile.ry + f },
        { x: tile.rx + f + 1, y: tile.ry + f },
        { x: tile.rx + f, y: tile.ry + f + 1 },
      ]) {
        const found = this.map.tiles.getByMapCoords(c.x, c.y);
        if (found) candidates.push(found);
      }
    let hits = [];
    const tri = new TriangleCtor();
    const probe = new THREE.Vector3(screen.x, 0, screen.y);
    for (const cand of candidates) {
      const d = IsoCoords.tile3dToScreen(cand.rx, cand.ry, cand.z);
      const g = IsoCoords.tile3dToScreen(cand.rx, cand.ry + 1.1, cand.z);
      const p = IsoCoords.tile3dToScreen(cand.rx + 1.1, cand.ry, cand.z);
      const m = IsoCoords.tile3dToScreen(cand.rx + 1.1, cand.ry + 1.1, cand.z);
      tri.b.x = g.x;
      tri.b.z = g.y;
      tri.c.x = p.x;
      tri.c.z = p.y;
      tri.a.x = d.x;
      tri.a.z = d.y;
      const inTri1 = tri.containsPoint(probe);
      tri.a.x = m.x;
      tri.a.z = m.y;
      const inTri2 = tri.containsPoint(probe);
      if (inTri1 || inTri2) hits.unshift(cand);
    }
    return (
      hits.length ||
        (hits = this.intersectTilesByScreenPos({
          x: point.x,
          y: point.y - IsoCoords.tileHeightToScreen(1),
        })),
      hits
    );
  }
}
