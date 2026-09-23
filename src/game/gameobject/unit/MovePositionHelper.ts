/**
 * MovePositionHelper — 集结落位：把一簇对象平移到目标区域并分配格子。
 *
 * findPositions 主流程：
 *  1) clusterObjects 把输入按 8 邻接聚成簇，取最大簇为主簇；
 *  2) 找主簇中心 tile，把主簇相对中心平移到 anchor 附近逐个尝试落位
 *     （tileHasRoom 限容量、isEligibleTile 限高度/桥、Fly 单独判定）；
 *  3) 落不下的 + 其余簇用半径 5 的 RadialTileFinder 环扫补位；
 *  4) Map 大小必须等于输入数，否则抛错。
 * shouldStackObject：建筑或飞行中的 Jumpjet 可叠。
 * tileHasRoom：建筑查地面遮挡；步兵陆地 3/空中 1；其余不叠。
 * isEligibleTile：桥面高度必须与目标一致；平地 |Δz|<2。
 *
 * 由 game/gameobject/unit/MovePositionHelper.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包
 * 时优先采用 .ts 模块的编译产物。
 */
import * as RadialTileFinderModule from "game/map/tileFinder/RadialTileFinder"; // 已转换
import * as MovementZoneModule from "game/type/MovementZone"; // 已转换
import * as SpeedTypeModule from "game/type/SpeedType"; // 已转换
import * as LocomotorTypeModule from "game/type/LocomotorType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class MovePositionHelper {
  /** 地图（tiles / tileOccupation / mapBounds / terrain）。 */
  map: any;

  constructor(map: any) {
    this.map = map;
  }

  /**
   * 为一组对象各分配一个落位 tile。
   * @param objects 待落位对象
   * @param anchor 目标锚点 tile（主簇中心平移到此）
   * @param toBridge 源是否在桥上（isEligibleTile 参照）
   * @param opts 额外开关（影响 Fly+balloonHover 判定）
   * @returns Map<对象, tile>（size === objects.length）
   */
  findPositions(objects: any[], anchor: any, toBridge: any, opts?: any): Map<any, any> {
    const assigned = new Map();
    const clusters = this.clusterObjects(objects);
    if (!clusters.length) throw new Error("We should have found at least one cluster");
    const main = clusters.reduce((best, c) => (c.objects.size > best.objects.size ? c : best), clusters[0]);
    clusters.splice(clusters.indexOf(main), 1);
    const leftovers: any[] = [];
    const center = this.findCenterTile([...main.objects]);
    main.objects.forEach((obj: any) => {
      const tile = this.map.tiles.getByMapCoords(
        anchor.rx + obj.tile.rx - center.rx,
        anchor.ry + obj.tile.ry - center.ry,
      );
      const bridge = tile?.onBridgeLandType ? this.map.tileOccupation.getBridgeOnTile(tile) : void 0;
      if (
        !this.shouldStackObject(obj) &&
        tile &&
        this.map.mapBounds.isWithinBounds(tile) &&
        this.tileHasRoom(tile, obj, assigned.get(tile)) &&
        (obj.rules.movementZone === MovementZoneModule.MovementZone.Fly
          ? obj.rules.airportBound ||
            (opts && obj.rules.balloonHover && !obj.rules.hoverAttack) ||
            this.map.terrain.getPassableSpeed(tile, SpeedTypeModule.SpeedType.Amphibious, false, !!bridge)
          : this.isEligibleTile(tile, bridge, toBridge, anchor))
      ) {
        let bucket = assigned.get(tile);
        if (bucket === undefined) {
          bucket = [];
          assigned.set(tile, bucket);
        }
        bucket.push(obj);
      } else leftovers.push(obj);
    });
    // 其余簇全部压入 leftovers
    clusters.forEach((c) => leftovers.push(...c.objects));

    // 半径 5 环扫补位
    const finder = new RadialTileFinderModule.RadialTileFinder(
      this.map.tiles,
      this.map.mapBounds,
      anchor,
      { width: 1, height: 1 },
      0,
      5,
      () => true,
    );
    let tile = finder.getNextTile();
    for (; leftovers.length && tile; ) {
      const first = leftovers[0];
      const bridge = this.map.tileOccupation.getBridgeOnTile(tile);
      if (
        this.tileHasRoom(tile, first, assigned.get(tile)) &&
        (first.rules.movementZone === MovementZoneModule.MovementZone.Fly
          ? first.rules.airportBound ||
            this.map.terrain.getPassableSpeed(tile, SpeedTypeModule.SpeedType.Amphibious, false, !!bridge)
          : this.isEligibleTile(tile, bridge, toBridge, anchor))
      ) {
        let bucket = assigned.get(tile);
        if (bucket === undefined) {
          bucket = [];
          assigned.set(tile, bucket);
        }
        bucket.push(leftovers.shift());
      } else tile = finder.getNextTile();
    }

    const result = new Map();
    assigned.forEach((bucket, t) => {
      bucket.forEach((obj: any) => result.set(obj, t));
    });
    leftovers.forEach((obj: any) => result.set(obj, anchor));
    if (result.size !== objects.length)
      throw new Error("We should have computed a number of positions equal to the number of input objects");
    return result;
  }

  /** 建筑或飞行中的 Jumpjet 可叠（不单独占格判定）。 */
  shouldStackObject(obj: any): boolean {
    return (
      obj.isBuilding() ||
      (obj.isUnit() &&
        obj.moveTrait.isMoving() &&
        obj.rules.movementZone === MovementZoneModule.MovementZone.Fly &&
        obj.rules.locomotor === LocomotorTypeModule.LocomotorType.Jumpjet)
    );
  }

  /** 该 tile 是否还能容纳 obj（按类型容量/遮挡判定）。 */
  tileHasRoom(tile: any, obj: any, occupants: any[] | undefined): boolean {
    if (obj.isBuilding())
      return (
        !!obj.rules.undeploysInto ||
        !this.map.tileOccupation
          .getGroundObjectsOnTile(tile)
          .some((o: any) => o.isTerrain() || o.isTechno() || (o.isOverlay() && o.wallTrait))
      );
    if (!occupants) return true;
    if (this.shouldStackObject(obj)) return occupants.length < 3;
    if (obj.isInfantry()) {
      if (occupants.find((o: any) => !o.isInfantry())) return false;
      const cap = obj.rules.movementZone === MovementZoneModule.MovementZone.Fly ? 1 : 3;
      return !(occupants.filter((o: any) => o.isInfantry()).length >= cap);
    }
    return !occupants.length;
  }

  /**
   * 高度/桥面合法性：
   *  - 任一侧在高桥 → 两端（含桥面 elevation）绝对高度相等；
   *  - 两侧都不在桥 → |Δz| < 2；
   *  - 一侧在桥一侧不在 → false（孪生 !(!i && !t) 为真时不走平地分支）。
   */
  isEligibleTile(tile: any, onBridge: any, fromBridge: any, fromTile: any): boolean {
    return fromBridge?.isHighBridge() || onBridge?.isHighBridge()
      ? tile.z + (onBridge?.tileElevation ?? 0) === fromTile.z + (fromBridge?.tileElevation ?? 0)
      : !(!fromBridge && !onBridge) || Math.abs(tile.z - fromTile.z) < 2;
  }

  /** 按 8 邻接把对象聚成连通簇（按 rx_ry 字典串索引）。 */
  clusterObjects(objects: any[]): any[] {
    const byTile = new Map();
    objects.forEach((o: any) => {
      const key = o.tile.rx + "_" + o.tile.ry;
      byTile.set(key, [...(byTile.get(key) || []), o]);
    });
    const clusters: any[] = [];
    const remaining = new Set(objects);
    while (remaining.size) {
      const members = new Set();
      const queue: any[] = [];
      const start = [...remaining][0].tile;
      byTile.get(start.rx + "_" + start.ry).forEach((o: any) => {
        queue.push(o);
      });
      while (queue.length) {
        const cur = queue.shift();
        members.add(cur);
        remaining.delete(cur);
        for (let dx = -1; dx <= 1; dx++)
          for (let dy = -1; dy <= 1; dy++)
            if (dx || dy) {
              const neigh = byTile.get(cur.tile.rx + dx + "_" + (cur.tile.ry + dy));
              if (neigh && neigh.length)
                neigh.forEach((o: any) => {
                  if (remaining.has(o)) {
                    remaining.delete(o);
                    queue.push(o);
                  }
                });
            }
      }
      clusters.push({ objects: members });
    }
    return clusters;
  }

  /** 求簇中心 tile（rx/ry 平均取整）；格不存在时找 1 邻域内的对象 tile。 */
  findCenterTile(objects: any[]): any {
    let cx = 0;
    let cy = 0;
    objects.forEach((o: any) => {
      cx += o.tile.rx;
      cy += o.tile.ry;
    });
    cx = Math.round(cx / objects.length);
    cy = Math.round(cy / objects.length);
    let center = this.map.tiles.getByMapCoords(cx, cy);
    if (!center) {
      center = objects.find((o: any) => Math.abs(o.tile.rx - cx) <= 1 && Math.abs(o.tile.ry - cy) <= 1)?.tile;
      if (!center) throw new Error("At least one adjacent object should have been found");
    }
    return center;
  }
}
