/**
 * MapShroudTrait — 地图阴影/战争迷雾 trait（挂在世界上）。
 *
 * 为每个战斗方维护 MapShroud 实例，处理：
 *  - init：订阅 tile 占用变化（Techno 出现→对 owner+盟友 reveal）、
 *    为每个 combatant clone shroud 并 revealObjects、诊断无 shroud 玩家；
 *  - 高程/换主/spawn/unspawn → 局部 reveal 或 spySat 全图开图；
 *  - 同盟变化 → 合并盟友 shroud 并 invalidateFull；
 *  - revealToAll 建筑 → 对全部非同盟 reveal 并推 EnemyObjectSensed 警报；
 *  - gapGenerator / 低电力 → updateGaps 刷新暗区；
 *  - 每 tick 更新各玩家 shroud，败北（非观察者）玩家移除。
 *
 * 由 game/trait/MapShroudTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as MapShroudModule from "game/map/MapShroud"; // 未转换（any-shim）
const { MapShroud, ShroudFlag } = MapShroudModule as any;
import * as NotifyTickModule from "game/trait/interface/NotifyTick"; // 本组新写
import * as NotifyOwnerChangeModule from "game/trait/interface/NotifyOwnerChange"; // 本组新写
import * as NotifyAllianceChangeModule from "game/trait/interface/NotifyAllianceChange"; // 本组新写
import { isNotNullOrUndefined } from "util/typeGuard"; // 孪生
import * as NotifySpawnModule from "game/trait/interface/NotifySpawn"; // 孪生
import * as NotifyUnspawnModule from "game/trait/interface/NotifyUnspawn"; // 孪生
import { RadarTrait } from "game/trait/RadarTrait"; // 本文件同组
import { RadarEventType } from "game/rules/general/RadarRules"; // 孪生
import { ObjectType } from "engine/type/ObjectType"; // 孪生
import * as NotifyPowerModule from "game/trait/interface/NotifyPower"; // 已转换
import * as NotifyElevationChangeModule from "game/trait/interface/NotifyElevationChange"; // 已转换

export class MapShroudTrait {
  /** 所属地图。 */
  readonly map: any;
  /** 同盟关系查询。 */
  readonly alliances: any;
  /** 玩家 → 其 shroud 实例。 */
  readonly shroudByPlayer: Map<any, any>;
  /** revealToAll 建筑集合。 */
  readonly revealedToAll: Set<any>;
  /** 暗区发生器（Gap Generator）集合。 */
  readonly gapGenerators: Set<any>;
  /** tile 占用变化订阅回调（constructor 绑定，dispose 时退订）。 */
  private readonly handleTileOccupationUpdate: (e: { object: any; type: string }) => void;

  constructor(map: any, alliances: any) {
    this.map = map;
    this.alliances = alliances;
    this.shroudByPlayer = new Map();
    this.revealedToAll = new Set();
    this.gapGenerators = new Set();
    this.handleTileOccupationUpdate = ({ object, type }) => {
      if (type !== "removed" && object.isTechno()) {
        const owner = object.owner;
        for (const p of [owner, ...this.alliances.getAllies(owner)]) {
          this.shroudByPlayer.get(p)?.revealFrom(object);
        }
      }
    };
  }

  /** 取玩家 shroud。 */
  getPlayerShroud(player: any) {
    return this.shroudByPlayer.get(player);
  }

  /**
   * 初始化：订阅 tile 占用变化；为每个 combatant 从全图 tiles clone
   * 一份 shroud 并 revealObjects；诊断未获得 shroud 的可玩玩家
   * （中立/观察者跳过，避免误报）。
   */
  init(world: any): void {
    world.map.tileOccupation.onChange.subscribe(this.handleTileOccupationUpdate);
    const base = new MapShroud().fromTiles(this.map.tiles);
    for (const player of world.getCombatants()) {
      const shroud = base.clone();
      this.shroudByPlayer.set(player, shroud);
      this.revealObjects(shroud, player, world);
      shroud.update();
    }
    // 诊断——记录未获得 shroud 的玩家（国家不可玩→isNeutral→非 combatant）
    // 中立/观察者不需要 shroud，跳过避免误报。
    for (const p of world.getAllPlayers()) {
      if (!this.shroudByPlayer.has(p) && !p.isNeutral && !p.isObserver) {
        console.warn(
          `[OpenYRWeb] No shroud for player "${p.name}" (isNeutral=${p.isNeutral}, ` +
            `country=${p.country?.name ?? "none"})`,
        );
      }
    }
  }

  /** 高程跨整格变化时对该对象 owner+盟友 reveal。 */
  [NotifyElevationChangeModule.NotifyElevationChange.onElevationChange](
    object: any,
    _oldElev: any,
    newElev: number,
  ): void {
    if (Math.floor(object.tileElevation) !== Math.floor(newElev)) {
      const owner = object.owner;
      for (const p of [owner, ...this.alliances.getAllies(owner)]) {
        this.shroudByPlayer.get(p)?.revealFrom(object);
      }
    }
  }

  /** 每 tick：败北（非观察者）玩家删除；其余 shroud.update()。 */
  [NotifyTickModule.NotifyTick.onTick](_world: any): void {
    for (const [player, shroud] of this.shroudByPlayer) {
      if (player.defeated && !player.isObserver) this.shroudByPlayer.delete(player);
      else shroud.update();
    }
  }

  /**
   * 换主：spySat 建筑 → 新主全图开图，旧主若无 spySat 则 resetShroud；
   * 已 spawn 对象 → 新主+盟友 reveal。
   */
  [NotifyOwnerChangeModule.NotifyOwnerChange.onChange](
    object: any,
    oldOwner: any,
    world: any,
  ): void {
    if (object.isBuilding() && object.rules.spySat) {
      this.revealMap(object.owner, world);
      const oldHasSpySat = oldOwner
        .getOwnedObjectsByType(ObjectType.Building)
        .find((b: any) => b.rules.spySat);
      if (!oldHasSpySat) this.resetShroud(oldOwner, world);
    }
    if (object.isSpawned) {
      for (const p of [object.owner, ...world.alliances.getAllies(object.owner)]) {
        this.shroudByPlayer.get(p)?.revealFrom(object);
      }
    }
  }

  /**
   * 同盟变化：把全体盟友 shroud 合并进 first 玩家，invalidateFull，
   * 再把 first 的结果 copy 回每个盟友并 invalidate。
   */
  [NotifyAllianceChangeModule.NotifyAllianceChange.onChange](
    alliancesModule: any,
    formed: boolean,
    world: any,
  ): void {
    if (!formed) return;
    const main = this.getPlayerShroud(alliancesModule.players.first);
    // 孪生：getAllies(t.players.first) — alliancesModule 为事件上的 alliances 上下文
    const allyShrouds = this.alliances
      .getAllies(alliancesModule.players.first)
      .map((p: any) => this.getPlayerShroud(p))
      .filter(isNotNullOrUndefined);
    for (const s of allyShrouds) main.merge(s);
    main.invalidateFull();
    for (const s of allyShrouds) {
      s.copy(main);
      s.invalidateFull();
    }
  }

  /** 建筑出生：spySat 全图；revealToAll 对敌方 reveal+警报；gapGenerator 登记。 */
  [NotifySpawnModule.NotifySpawn.onSpawn](object: any, world: any): void {
    if (!object.isBuilding()) return;
    if (object.rules.spySat) this.revealMap(object.owner, world);
    if (object.rules.revealToAll) {
      this.revealedToAll.add(object);
      for (const player of world.getCombatants()) {
        if (player === object.owner) continue;
        if (world.alliances.areAllied(object.owner, player)) continue;
        this.shroudByPlayer.get(player)?.revealObject(object);
        world.traits
          .get(RadarTrait)
          .addEventForPlayer(RadarEventType.EnemyObjectSensed, player, object.centerTile, world);
      }
    }
    if (object.gapGeneratorTrait) this.gapGenerators.add(object);
  }

  /** 建筑离场：spySat 无残留则 reset；revealToAll/gapGenerator 移除。 */
  [NotifyUnspawnModule.NotifyUnspawn.onUnspawn](object: any, world: any): void {
    if (!object.isBuilding()) return;
    if (object.rules.spySat) {
      const stillHas = object.owner
        .getOwnedObjectsByType(ObjectType.Building)
        .find((b: any) => b.rules.spySat);
      if (!stillHas) this.resetShroud(object.owner, world);
    }
    if (object.rules.revealToAll) this.revealedToAll.delete(object);
    if (object.gapGeneratorTrait) this.gapGenerators.delete(object);
  }

  /** 进入低电力：刷新该玩家的 gap 发生器。 */
  [NotifyPowerModule.NotifyPower.onPowerLow](player: any, world: any): void {
    this.updateGaps(world, player);
  }

  /** 电力恢复：刷新该玩家的 gap 发生器。 */
  [NotifyPowerModule.NotifyPower.onPowerRestore](player: any, world: any): void {
    this.updateGaps(world, player);
  }

  /** 电力数值变化：gap 已在 Low/Restore 处理，空实现。 */
  [NotifyPowerModule.NotifyPower.onPowerChange](_player: any, _world: any): void {}

  /** 全图开图：revealAll + 标记己方 gap 格 + 刷新 gaps。 */
  revealMap(player: any, world: any): void {
    this.shroudByPlayer.get(player)?.revealAll();
    this.markOwnGapTiles(world, player);
    this.updateGaps(world);
  }

  /** 重置玩家 shroud 后重新 revealObjects。 */
  resetShroud(player: any, world: any): void {
    const shroud = this.getPlayerShroud(player);
    if (!shroud) return;
    shroud.reset();
    this.markOwnGapTiles(world, player);
    this.revealObjects(shroud, player, world);
  }

  /** 对玩家自有对象 + 盟友对象 + revealToAll 建筑执行 revealFrom/revealObject。 */
  revealObjects(shroud: any, player: any, world: any): void {
    const objects = [
      ...player.getOwnedObjects(),
      ...this.alliances
        .getAllies(player)
        .map((ally: any) => ally.getOwnedObjects())
        .flat(),
    ];
    for (const obj of objects) shroud.revealFrom(obj);
    this.revealedToAll.forEach((obj) => shroud.revealObject(obj));
  }

  /** 刷新 gap 发生器；player 过滤时只更新该玩家的。 */
  updateGaps(world: any, player?: any): void {
    for (const gap of this.gapGenerators) {
      if (player && gap.owner !== player) continue;
      gap.gapGeneratorTrait.update(gap, world);
    }
  }

  /** 把己方（或同盟）gap 发生器半径内格子打上 Darken 旗。 */
  markOwnGapTiles(world: any, player: any): void {
    for (const gap of this.gapGenerators) {
      if (gap.owner !== player && !this.alliances.areAllied(gap.owner, player)) continue;
      this.getPlayerShroud(player)?.toggleFlagsAround(
        gap.tile,
        gap.gapGeneratorTrait.radiusTiles,
        ShroudFlag.Darken,
        true,
      );
    }
  }

  /** 退订 tile 占用变化。 */
  dispose(): void {
    this.map.tileOccupation.onChange.unsubscribe(this.handleTileOccupationUpdate);
  }
}
