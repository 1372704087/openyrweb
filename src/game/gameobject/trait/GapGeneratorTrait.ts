/**
 * GapGeneratorTrait — 雷达干扰器（Darken 战争迷雾洞 + 敌方 reveal/间谍卫星）。
 *
 * 出生/换主/传送维护友方 Darken 标记；tick 周期 update：对非盟友未参战
 * 玩家 unrevealAround（通电）或间谍卫星 revealAround，并查询半径内 technos
 * 做 revealFrom/revealObject。refreshTicks 默认 5 秒。
 *
 * 由 game/gameobject/trait/GapGeneratorTrait.ts.js 重写为 TS（行为完全一
 * 致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as GameSpeedModule from "game/GameSpeed"; // 已转换
import * as MapShroudModule from "game/map/MapShroud"; // 未转换（any-shim）
import * as Box2Module from "game/math/Box2"; // 未转换（any-shim）
import * as Vector2Module from "game/math/Vector2"; // 未转换（any-shim）
import * as TechnoRulesModule from "game/rules/TechnoRules"; // 未转换（any-shim）
import * as RangeHelperModule from "game/gameobject/unit/RangeHelper"; // 未转换（any-shim）
import * as NotifyOwnerChangeModule from "game/gameobject/trait/interface/NotifyOwnerChange"; // 已转换
import * as NotifySpawnModule from "game/gameobject/trait/interface/NotifySpawn"; // 已转换
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as NotifyUnspawnModule from "game/gameobject/trait/interface/NotifyUnspawn"; // 已转换
import * as NotifyWarpChangeModule from "game/gameobject/trait/interface/NotifyWarpChange"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class GapGeneratorTrait {
  /** 干扰半径（格）。 */
  radiusTiles: any;
  /** 距下次 update 的剩余 tick。 */
  refreshTicks: number;

  constructor(radiusTiles: any) {
    this.radiusTiles = radiusTiles;
    this.refreshTicks = 0;
  }

  /** 每 tick：refreshTicks 倒数到 ≤0 时 update。 */
  [NotifyTickModule.NotifyTick.onTick](object: any, world: any) {
    if (this.refreshTicks > 0) this.refreshTicks--;
    if (this.refreshTicks <= 0) this.update(object, world);
  }

  /** 出生：为友方开 Darken 标记。 */
  [NotifySpawnModule.NotifySpawn.onSpawn](object: any, world: any) {
    this.markGapTilesForFriendlies(object, object.owner, world, true);
  }

  /** 离场：关 Darken 并立即刷新视野。 */
  [NotifyUnspawnModule.NotifyUnspawn.onUnspawn](object: any, world: any) {
    this.markGapTilesForFriendlies(object, object.owner, world, false);
    this.update(object, world);
  }

  /** 换主：旧主关标记、新主开标记并刷新。 */
  [NotifyOwnerChangeModule.NotifyOwnerChange.onChange](object: any, oldOwner: any, world: any) {
    this.markGapTilesForFriendlies(object, oldOwner, world, false);
    this.markGapTilesForFriendlies(object, object.owner, world, true);
    this.update(object, world);
  }

  /** 传送态切换：active=false 关标记；开启时刷新。 */
  [NotifyWarpChangeModule.NotifyWarpChange.onChange](object: any, world: any, active: any) {
    this.markGapTilesForFriendlies(object, object.owner, world, !active);
    if (active) this.update(object, world);
  }

  /**
   * 为 owner 及其盟友在 object.tile 周围 toggle Darken 标记。
   * 关闭（enable=false）时，对每个拥有 shroud 的玩家把仍存活的邻近
   * 干扰器自身半径重新打上 Darken，避免误关覆盖洞。
   */
  markGapTilesForFriendlies(object: any, owner: any, world: any, enable: boolean) {
    const players = [owner, ...world.alliances.getAllies(owner)];
    let neighbors: any;
    for (const player of players) {
      const shroud = world.mapShroudTrait.getPlayerShroud(player);
      if (!shroud) continue;
      shroud.toggleFlagsAround(object.tile, this.radiusTiles, MapShroudModule.ShroudFlag.Darken, enable);
      if (!enable) {
        if (!neighbors) {
          const rangeHelper = new RangeHelperModule.RangeHelper(world.map.tileOccupation);
          neighbors = players
            .map((p: any) => [...p.buildings])
            .flat()
            .filter(
              (b: any) =>
                b.gapGeneratorTrait &&
                b !== object &&
                rangeHelper.tileDistance(b, object) <= b.gapGeneratorTrait.radiusTiles + this.radiusTiles,
            );
        }
        for (const n of neighbors) {
          shroud.toggleFlagsAround(n.tile, n.gapGeneratorTrait.radiusTiles, MapShroudModule.ShroudFlag.Darken, true);
        }
      }
    }
  }

  /** 周期刷新：通电则 unreveal+范围内 reveal；否则间谍卫星 revealAround。 */
  update(object: any, world: any) {
    this.refreshTicks = 5 * GameSpeedModule.GameSpeed.BASE_TICKS_PER_SECOND;
    let technos: any;
    const powered = object.owner.buildings.has(object) && object.poweredTrait?.isPoweredOn();
    for (const enemy of world.getCombatants()) {
      if (enemy === object.owner || world.alliances.areAllied(object.owner, enemy)) continue;
      const shroud = world.mapShroudTrait.getPlayerShroud(enemy);
      if (!shroud) continue;
      if (powered) {
        shroud.unrevealAround(object.tile, this.radiusTiles);
        if (!technos) {
          const half = this.radiusTiles + TechnoRulesModule.TechnoRules.MAX_SIGHT;
          const min = new Vector2Module.Vector2(object.tile.rx, object.tile.ry).addScalar(-half);
          const max = new Vector2Module.Vector2(object.tile.rx, object.tile.ry).addScalar(half);
          technos = world.map.technosByTile.queryRange(new Box2Module.Box2(min, max));
        }
        for (const tech of technos) {
          if (tech.owner === enemy || world.alliances.areAllied(tech.owner, enemy)) shroud.revealFrom(tech);
          else if (tech.rules.revealToAll) shroud.revealObject(tech);
        }
      } else if ([...enemy.buildings].some((b: any) => b.rules.spySat)) {
        shroud.revealAround(object.tile, this.radiusTiles);
      }
    }
  }
}
