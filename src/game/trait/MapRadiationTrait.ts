/**
 * MapRadiationTrait — 地图辐射场 trait（挂在世界上）。
 *
 * 维护全图辐射格（radLevelByTile）与辐射源（radSites）：
 *  - 每 tick 按 radApplicationDelay 周期对辐射格上的单位结算辐射伤害
 *    （radSiteWarhead 弹头，伤害 = min(radLevelMax,level)×radLevelFactor）；
 *  - 按 radLevelDelay 周期对所有辐射源衰减 radLevel（除以
 *    radLevelDurationMultiple），衰减到 0 删除源；
 *  - createRadSite：在 center 半径 radius 内按距离线性插值铺辐射等级；
 *  - 任何格子变化通过 _onChange（EventDispatcher）对外广播，供 UI 刷新。
 *
 * 特殊过滤：空降姿态（Paradrop）且高程 >1 的步兵不吃辐射伤害。
 *
 * 由 game/trait/MapRadiationTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { StanceType } from "game/gameobject/infantry/StanceType"; // 孪生
import * as RangeHelperModule from "game/gameobject/unit/RangeHelper"; // 未转换（any-shim）
import { RadialTileFinder } from "game/map/tileFinder/RadialTileFinder"; // 孪生
import { Warhead } from "game/Warhead"; // 孪生
import { EventDispatcher } from "util/event"; // 孪生
import { lerp } from "util/math"; // 孪生
import * as NotifyTickModule from "game/trait/interface/NotifyTick"; // 本组新写

export class MapRadiationTrait {
  /** 所属地图引用。 */
  readonly map: any;
  /** 辐射源表：key=center tile，value={radLevel, radius}。 */
  radSites: Map<any, { radLevel: number; radius: number }>;
  /** 每格当前辐射等级。 */
  radLevelByTile: Map<any, number>;
  /** 距下次伤害结算的剩余 tick（undefined=首帧初始化）。 */
  nextDamage?: number;
  /** 距下次衰减的剩余 tick（undefined=首帧初始化或无辐射格）。 */
  nextDecay?: number;
  /** 内部变化事件分发器。 */
  private readonly _onChange: EventDispatcher;

  /** 对外变化事件（辐射格集合变化时广播）。 */
  get onChange() {
    return this._onChange.asEvent();
  }

  constructor(map: any) {
    this.map = map;
    this.radSites = new Map();
    this.radLevelByTile = new Map();
    this._onChange = new EventDispatcher();
  }

  /** 取某 tile 的辐射等级。 */
  getRadLevel(tile: any): number | undefined {
    return this.radLevelByTile.get(tile);
  }

  /**
   * 每 tick：有辐射格时驱动两个倒计时——
   *  nextDamage：首次初始化为 radApplicationDelay-1；归零则 applyDamage
   *              并重置为 radApplicationDelay；
   *  nextDecay： 首次初始化为 radLevelDelay-1；归零则 applyDecay，
   *              若仍有辐射格重置，否则清空 nextDecay。
   */
  [NotifyTickModule.NotifyTick.onTick](world: any): void {
    if (!this.radLevelByTile.size) return;
    const rad = world.rules.radiation;
    if (this.nextDamage === undefined) {
      this.nextDamage = Math.max(0, rad.radApplicationDelay - 1);
    } else if (this.nextDamage <= 0) {
      this.applyDamage(world);
      this.nextDamage = Math.max(0, rad.radApplicationDelay);
    } else {
      this.nextDamage--;
    }
    if (this.nextDecay === undefined) {
      this.nextDecay = Math.max(0, rad.radLevelDelay - 1);
    } else if (this.nextDecay <= 0) {
      this.applyDecay(Math.ceil(rad.radLevelDelay / rad.radDurationMultiple));
      if (this.radLevelByTile.size) this.nextDecay = Math.max(0, rad.radLevelDelay);
      else this.nextDecay = undefined;
    } else {
      this.nextDecay--;
    }
  }

  /**
   * 结算辐射伤害：对每个有辐射的 tile，用 radSiteWarhead 对其上
   * 地面单位（跳过 Paradrop 高程>1 的步兵）造成
   * min(radLevelMax,level)×radLevelFactor 伤害。
   */
  applyDamage(world: any): void {
    const rad = world.rules.radiation;
    const warhead = new Warhead(world.rules.getWarhead(rad.radSiteWarhead));
    this.radLevelByTile.forEach((level, tile) => {
      const damage = Math.min(rad.radLevelMax, level) * rad.radLevelFactor;
      const targets = world.map
        .getGroundObjectsOnTile(tile)
        .filter(
          (o: any) =>
            !(o.isInfantry() && o.stance === StanceType.Paradrop && 1 < o.tileElevation) &&
            o.isUnit(),
        );
      // 注意：过滤条件顺序与孪生一致——先排除特殊空降步兵，再要求 isUnit。
      for (const target of targets) {
        if (
          !(target.isUnit() && !(target.isInfantry() && target.stance === StanceType.Paradrop && 1 < target.tileElevation))
        ) {
          continue;
        }
        if (warhead.canDamage(target, tile, target.zone)) {
          const dmg = warhead.computeDamage(damage, target, world);
          if (0 < dmg) warhead.inflictDamage(dmg, target, undefined, world, true);
        }
      }
    });
  }

  /**
   * 全场辐射衰减 delta：先快照旧格集合、清空 radLevelByTile，
   * 再对每个源 radLevel-=delta（≤0 删源，否则重铺 setRadLevelAround），
   * 最后广播旧格集合变化。
   */
  applyDecay(delta: number): void {
    const previousTiles = new Set(this.radLevelByTile.keys());
    this.radLevelByTile.clear();
    this.radSites.forEach(({ radLevel, radius }, center) => {
      const next = radLevel - delta;
      if (next <= 0) {
        this.radSites.delete(center);
      } else {
        this.radSites.set(center, { radLevel: next, radius });
        this.setRadLevelAround(center, radius, next);
      }
    });
    this._onChange.dispatch(this, previousTiles);
  }

  /**
   * 创建/增强辐射源：在已有源等级上叠加 delta，radius 更新为新值，
   * 铺设后若影响了格子则广播变化。delta 减去已有等级后 ≤0 则无操作。
   */
  createRadSite(center: any, delta: number, radius: number): void {
    const current = this.radSites.get(center)?.radLevel ?? 0;
    const add = delta - current;
    if (add <= 0) return;
    this.radSites.set(center, { radLevel: current + add, radius });
    const touched = this.setRadLevelAround(center, radius, add);
    if (touched.size) this._onChange.dispatch(this, touched);
  }

  /**
   * 在 center 周围 radius 内按距离线性插值铺设辐射等级：
   *   level = ceil(lerp(amount, 0, dist/radius))
   * 并把每格辐射压到上限 1000。返回受影响格集合。
   */
  setRadLevelAround(center: any, radius: number, amount: number): Set<any> {
    const helper = new RangeHelperModule.RangeHelper(this.map.tileOccupation);
    const finder = new RadialTileFinder(
      this.map.tiles,
      this.map.mapBounds,
      center,
      { width: 1, height: 1 },
      0,
      radius,
      (t) => !!t,
      false,
    );
    const touched = new Set();
    let tile;
    while ((tile = finder.getNextTile())) {
      const dist = helper.tileDistance(center, tile);
      if (dist <= radius) {
        const level = Math.ceil(lerp(amount, 0 * amount, dist / radius));
        this.radLevelByTile.set(
          tile,
          Math.min(1000, (this.radLevelByTile.get(tile) ?? 0) + level),
        );
        touched.add(tile);
      }
    }
    return touched;
  }

  /** 取某辐射源的当前等级。 */
  getRadSiteLevel(center: any): number | undefined {
    return this.radSites.get(center)?.radLevel;
  }
}
