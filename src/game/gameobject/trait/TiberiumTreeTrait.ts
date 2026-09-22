/**
 * TiberiumTreeTrait — 泰伯利亚树产矿 trait。
 *
 * 挂在泰伯利亚树上：周期性（cooldownTicks = floor(1/animationProbability)）
 * 在半径 1~2 tile 内尝试生成新矿脉或给已有矿堆 +1 bail：
 *  - 先 RadialTileFinder 找可放置矿石的空 tile（TiberiumTrait.canBePlacedOn），
 *    命中则 createObject(Overlay, …) 并设 overlayId/value=3 后 spawn；
 *  - 否则找 landType===Tiberium 且已有矿堆未满 maxBails 的 tile，
 *    命中则 spawnBails(1)。
 * 每 tick 重置 status=Idle，超冷却时置 Spawning 并调用 spawnTiberium。
 *
 * 由 game/gameobject/trait/TiberiumTreeTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import { RadialTileFinder } from "game/map/tileFinder/RadialTileFinder"; // 孪生
import { LandType } from "game/type/LandType"; // 孪生
import { ObjectType } from "engine/type/ObjectType"; // 孪生
import * as OreSpreadModule from "game/map/OreSpread"; // 未转换（any-shim）
import { TiberiumType } from "engine/type/TiberiumType"; // 孪生
import { TiberiumTrait } from "game/gameobject/trait/TiberiumTrait"; // 孪生

/** 产矿状态机：Idle=空闲，Spawning=本 tick 刚触发产矿。 */
export enum SpawnStatus {
  Idle = 0,
  Spawning = 1,
}

export class TiberiumTreeTrait {
  /** 树的规则（animationProbability 决定冷却）。 */
  readonly rules: any;
  /** 距上次产矿的累计 tick。 */
  ticksSinceLastSpawn: number;
  /** 产矿冷却 tick 数 = floor(1/animationProbability)。 */
  cooldownTicks: number;
  /** 当前产矿状态（每 tick 先复位 Idle）。 */
  status: SpawnStatus;

  constructor(rules: any) {
    this.rules = rules;
    this.ticksSinceLastSpawn = 0;
    this.cooldownTicks = Math.floor(1 / this.rules.animationProbability);
    this.status = SpawnStatus.Idle;
  }

  /**
   * 每 tick：status 复位 Idle；ticksSinceLastSpawn 超过 cooldown 时
   * 归零计数、置 Spawning 并在树 tile 上 spawnTiberium。
   */
  [NotifyTickModule.NotifyTick.onTick](object: any, world: any): void {
    this.status = SpawnStatus.Idle;
    if (this.ticksSinceLastSpawn++ > this.cooldownTicks) {
      this.ticksSinceLastSpawn = 0;
      this.status = SpawnStatus.Spawning;
      this.spawnTiberium(object.tile, world);
    }
  }

  /**
   * 在 origin 半径 o=1..2 内尝试产矿：
   *  第一轮：找可放置矿石 overlay 的空 tile → 创建新矿脉（value=3）；
   *  第二轮：找 Tiberium 地表且已有矿堆未满 maxBails → +1 bail。
   * 命中即 return。
   */
  spawnTiberium(origin: any, world: any): void {
    for (let radius = 1; radius <= 2; radius++) {
      // 第一轮：找可放置新矿石的空 tile。
      let finder = new RadialTileFinder(
        world.map.tiles,
        world.map.mapBounds,
        origin,
        { width: 1, height: 1 },
        radius,
        radius,
        (t) => TiberiumTrait.canBePlacedOn(t, world.map),
      );
      let tile = finder.getNextTile();
      if (tile) {
        const overlayId = OreSpreadModule.OreSpread.calculateOverlayId(TiberiumType.Ore, tile);
        if (overlayId === undefined) throw new Error("Expected an overlayId");
        const overlay = world.createObject(ObjectType.Overlay, world.rules.getOverlayName(overlayId));
        overlay.overlayId = overlayId;
        overlay.value = 3;
        world.spawnObject(overlay, tile);
        return;
      }
      // 第二轮：找 Tiberium 地表上未满 bail 的既有矿堆。
      finder = new RadialTileFinder(
        world.map.tiles,
        world.map.mapBounds,
        origin,
        { width: 1, height: 1 },
        radius,
        radius,
        (t) => t.landType === LandType.Tiberium,
      );
      let oreTile: any;
      while (!oreTile) {
        const t = finder.getNextTile();
        if (!t) break;
        oreTile = world.map
          .getObjectsOnTile(t)
          .find(
            (o: any) =>
              o.isOverlay() &&
              o.isTiberium() &&
              o.traits.get(TiberiumTrait).getBailCount() + 1 <= TiberiumTrait.maxBails,
          );
      }
      if (oreTile) {
        oreTile.traits.get(TiberiumTrait).spawnBails(1);
        return;
      }
    }
  }
}
