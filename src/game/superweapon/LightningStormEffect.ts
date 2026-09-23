/**
 * LightningStormEffect — 闪电风暴超武特效。
 *
 * 状态机：Approaching（deferment 倒计时）→ Manifesting（持续 duration）：
 *  - 首次进入 Manifesting 派发 LightningStormManifestEvent；
 *  - 直接命中格按 hitDelay 生成云，散射按 scatterDelay + separation 生成云；
 *  - 每朵云存活一半时长时用 storm warhead 引爆（含 SpecialWarheadType.LightningStrike）；
 *  - 持续结束且云清空 → onTick 返回 true。
 *
 * 由 game/superweapon/LightningStormEffect.ts.js 重写为 TS（行为完全
 * 一致，枚举值脚本提取自原文件）。两个文件并存期间，本文件才是修改
 * 目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换
import { LightningStormCloudEvent } from "game/event/LightningStormCloudEvent"; // 已转换
import { LightningStormManifestEvent } from "game/event/LightningStormManifestEvent"; // 已转换
import { CollisionType } from "game/gameobject/unit/CollisionType"; // 已转换
import * as RangeHelperModule from "game/gameobject/unit/RangeHelper"; // 未转换（any-shim）
import { GameSpeed } from "game/GameSpeed"; // 已转换
import * as RandomTileFinderModule from "game/map/tileFinder/RandomTileFinder"; // 未转换（any-shim）
import { Warhead } from "game/Warhead"; // 已转换
import { SuperWeaponEffect } from "game/superweapon/SuperWeaponEffect"; // 已转换
import * as SpecialWarheadTypeModule from "game/SpecialWarheadType"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 闪电风暴阶段（模块内状态机，不对外导出——与孪生一致）。 */
enum LightningStormState {
  /** 云层逼近（deferment 倒计时）。 */
  Approaching = 0,
  /** 正式肆虐。 */
  Manifesting = 1,
}

/** 场上一朵闪电云。 */
interface StormCloud {
  tile: any;
  durationTicks: number;
  ticksLeft: number;
}

export class LightningStormEffect extends SuperWeaponEffect {
  /** 当前阶段。 */
  private state: LightningStormState;
  /** 云列表。 */
  private clouds: StormCloud[];
  /** 进入 Manifesting 前剩余 tick。 */
  private manifestStartTimer: number;
  /** Manifesting 剩余 tick。 */
  private manifestEndTimer: number;
  /** 直接命中倒计时。 */
  private nextDirectHitTimer: number;
  /** 散射命中倒计时。 */
  private nextRandomHitTimer: number;

  constructor(type?: any, owner?: any, tile?: any) {
    super(type, owner, tile);
    this.state = LightningStormState.Approaching;
    this.clouds = [];
    this.manifestStartTimer = 0;
    this.manifestEndTimer = 0;
    this.nextDirectHitTimer = 0;
    this.nextRandomHitTimer = 0;
  }

  onStart(world: any): void {
    const storm = world.rules.general.lightningStorm;
    this.manifestStartTimer = storm.deferment;
    this.manifestEndTimer = storm.duration;
    this.nextDirectHitTimer = 0;
    this.nextRandomHitTimer = 0;
  }

  onTick(world: any): boolean {
    // 孪生用逗号运算符：先执行 Approaching 副作用，再以是否已进入
    // Manifesting 作为 if 的实际条件。
    if (
      (this.state === LightningStormState.Approaching &&
        (0 < this.manifestStartTimer
          ? this.manifestStartTimer--
          : ((this.state = LightningStormState.Manifesting),
            world.events.dispatch(new LightningStormManifestEvent(this.tile)))),
      this.state === LightningStormState.Manifesting)
    ) {
      let cloud: StormCloud;
      const storm = world.rules.general.lightningStorm;
      if (
        0 < this.manifestEndTimer &&
        (this.manifestEndTimer--,
        0 < this.nextDirectHitTimer && this.nextDirectHitTimer--,
        this.nextDirectHitTimer <= 0 &&
          ((this.nextDirectHitTimer = storm.hitDelay), this.spawnCloudAt(this.tile, world)),
        0 < this.nextRandomHitTimer && this.nextRandomHitTimer--,
        this.nextRandomHitTimer <= 0)
      ) {
        this.nextRandomHitTimer = storm.scatterDelay;
        let radius = Math.floor(storm.cellSpread / 2);
        const separation = storm.separation;
        const helper = new RangeHelperModule.RangeHelper(world.map.tileOccupation);
        const finder = new RandomTileFinderModule.RandomTileFinder(
          world.map.tiles,
          world.map.mapBounds,
          this.tile,
          radius,
          world,
          (t: any) => !this.clouds.some((c) => helper.tileDistance(t, c.tile) < separation),
          false,
        );
        radius = finder.getNextTile();
        if (radius) this.spawnCloudAt(radius, world);
      }
      for (cloud of this.clouds.slice()) {
        if (0 < cloud.ticksLeft) {
          if (cloud.ticksLeft--, cloud.ticksLeft === Math.floor(cloud.durationTicks / 2)) {
            const whName = storm.warhead;
            const wh = new Warhead(world.rules.getWarhead(whName));
            const tile = cloud.tile;
            const bridge = world.map.tileOccupation.getBridgeOnTile(tile);
            const elev = bridge?.tileElevation ?? 0;
            const zone = world.map.getTileZone(tile);
            // 孪生传 10 参；尾部 smudge/cellSpread/suppressAnim 省略（与 JS 调用一致）。
            (wh as any).detonate(
              world,
              storm.damage,
              tile,
              elev,
              Coords.tile3dToWorld(tile.rx + 0.5, tile.ry + 0.5, tile.z + elev),
              zone,
              bridge ? CollisionType.OnBridge : CollisionType.None,
              world.createTarget(bridge, tile),
              { player: this.owner, weapon: undefined },
              SpecialWarheadTypeModule.SpecialWarheadType.LightningStrike,
            );
          }
        } else {
          this.clouds.splice(this.clouds.indexOf(cloud), 1);
        }
      }
      if (!this.clouds.length && this.manifestEndTimer <= 0) return true;
    }
    return false;
  }

  /** 在格上生成一朵云并派发视觉事件。 */
  private spawnCloudAt(tile: any, world: any): void {
    let idx = world.rules.audioVisual.weatherConClouds;
    idx = world.generateRandomInt(0, idx.length - 1);
    const anim = world.art.getAnimation(world.rules.audioVisual.weatherConClouds[idx]);
    let durationTicks = anim.art.getNumber("Rate", 60 * GameSpeed.BASE_TICKS_PER_SECOND) / 60;
    durationTicks = Math.floor((GameSpeed.BASE_TICKS_PER_SECOND / durationTicks) * 60);
    this.clouds.push({ tile, durationTicks, ticksLeft: durationTicks });
    let height =
      (world.map.tileOccupation.getBridgeOnTile(tile)?.tileElevation ?? 0) +
      Coords.worldToTileHeight(world.rules.general.flightLevel);
    height = Coords.tile3dToWorld(tile.rx + 0.5, tile.ry + 0.5, tile.z + height);
    world.events.dispatch(new LightningStormCloudEvent(height));
  }
}
