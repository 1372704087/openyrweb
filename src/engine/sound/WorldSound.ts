/**
 * WorldSound — 世界空间音效：按视口/瓦片/迷雾计算音量与声像，跟踪实例生命周期。
 *
 * 订阅 renderer.onFrame（节流 200ms 或视口变化时 update）与 world.onObjectRemoved
 * （对象消失即停对应句柄）。playEffect 把 SoundSpec + 世界坐标登记为
 * soundInstances，update 中按 Camera 视口中心 tile 重算 volume/pan，
 * 并对 loop 实例执行 per-spec limit 限制。
 * computeVolumeAndPan 实现 Screen/Local/Global 的衰减、声像与迷雾裁剪。
 *
 * 由 engine/sound/WorldSound.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { SoundKey } from "engine/sound/SoundKey"; // 已转换
import { ChannelType } from "engine/sound/ChannelType"; // 已转换
import { SoundType, SoundControl } from "engine/sound/SoundSpecs"; // 已转换
import { clamp, getRandomInt } from "util/math"; // 已转换
import { rectEquals } from "util/geometry"; // 已转换
// 孪生模块仅经 wildcard `export = any` 可达，命名导出需经模块对象取值。
import * as MapShroudModule from "game/map/MapShroud"; // 孪生
import { Coords } from "game/Coords"; // 已转换
import { isNotNullOrUndefined } from "util/typeGuard"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

const ShroudType = (MapShroudModule as any).ShroudType;

/** 一条世界音效实例（update 中重算音量/声像）。 */
export interface WorldSoundInstance {
  /** 对应声音定义。 */
  spec: any;
  /** 关联的游戏对象（坐标点调用时为 undefined）。 */
  gameObject?: any;
  /** 固定世界坐标（无 gameObject 时的锚点）。 */
  worldPos: { x: number; y: number; z: number };
  /** 所属玩家。 */
  player: any;
  /** 播放句柄。 */
  handle: any;
  /** 外部增益系数。 */
  gain: number;
  /** 最近一次算出的音量（limit 统计用）。 */
  volume: number;
  /** 是否循环实例。 */
  loop: boolean;
}

export class WorldSound {
  /** 音效门面。 */
  sound: any;
  /** 本地玩家（Global 型友军/敌军音量区分）。 */
  localPlayer: any;
  /** 迷雾查询。 */
  shroud: any;
  /** 视口距离助手。 */
  worldViewportHelper: any;
  /** 屏幕点 → 瓦片助手。 */
  mapTileIntersectHelper: any;
  /** 世界（onObjectRemoved 源）。 */
  world: any;
  /** 世界场景（viewport）。 */
  worldScene: any;
  /** 渲染器（onFrame 源）。 */
  renderer: any;
  /** 在途世界音效实例。 */
  soundInstances: WorldSoundInstance[] = [];
  /** 上次处理时的视口矩形（变化检测）。 */
  lastViewport?: any;
  /** 上次 update 的帧时间。 */
  lastUpdate?: number;
  /** 视口中心所在瓦片（Local 衰减原点）。 */
  tileAtViewportCenter?: any;
  /** 不受迷雾裁剪的声音 spec 列表（构造时由 noShroudKeys 解析）。 */
  noShroudSpecs: any[];

  /** 不受迷雾影响的 SoundKey 列表（与孪生一致的静态字段）。 */
  static noShroudKeys: SoundKey[] = [
    SoundKey.BuildingSlam,
    SoundKey.SellSound,
    SoundKey.BuildingGarrisonedSound,
    SoundKey.EnterBioReactorSound,
    SoundKey.LeaveBioReactorSound,
    SoundKey.BuildingRepairedSound,
    SoundKey.SpySatActivationSound,
    SoundKey.SpySatDeactivationSound,
  ];

  /** 对象被移除：停掉关联实例的句柄。 */
  handleObjectRemoved = (removed: any): void => {
    this.soundInstances.forEach((inst) => {
      if (inst.gameObject === removed) inst.handle.stop();
    });
  };

  /** 帧回调：视口变化或距上次 ≥200ms 时执行 update（与孪生逐句对应）。 */
  handleFrame = (frameTime: number): void => {
    let shouldUpdate = false;
    // 孪生: (lastViewport && rectEquals(vp, last)) || ((last = vp), (should = true))
    if (!(this.lastViewport && rectEquals(this.worldScene.viewport, this.lastViewport))) {
      this.lastViewport = this.worldScene.viewport;
      shouldUpdate = true;
    }
    // 孪生: (!lastUpdate || 200 <= e - lastUpdate) && (should = true)
    if (!this.lastUpdate || frameTime - this.lastUpdate >= 200) {
      shouldUpdate = true;
    }
    // 孪生: should && (update(), lastUpdate = e)
    if (shouldUpdate) {
      this.update();
      this.lastUpdate = frameTime;
    }
  };

  constructor(
    sound: any,
    localPlayer: any,
    shroud: any,
    worldViewportHelper: any,
    mapTileIntersectHelper: any,
    world: any,
    worldScene: any,
    renderer: any,
  ) {
    this.sound = sound;
    this.localPlayer = localPlayer;
    this.shroud = shroud;
    this.worldViewportHelper = worldViewportHelper;
    this.mapTileIntersectHelper = mapTileIntersectHelper;
    this.world = world;
    this.worldScene = worldScene;
    this.renderer = renderer;
    this.soundInstances = [];
    this.noShroudSpecs = WorldSound.noShroudKeys
      .map((key) => {
        const spec = this.sound.getSoundSpec(key);
        if (spec) return spec;
        console.warn(`Sound key "${key}" doesn't have a corresponding sound.ini entry`);
      })
      .filter(isNotNullOrUndefined);
  }

  /** 订阅帧与对象移除事件。 */
  init(): void {
    this.renderer.onFrame.subscribe(this.handleFrame);
    this.world.onObjectRemoved.subscribe(this.handleObjectRemoved);
  }

  /** 切换本地玩家与迷雾上下文（换家/观战时）。 */
  changeLocalPlayer(localPlayer: any, shroud: any): void {
    this.localPlayer = localPlayer;
    this.shroud = shroud;
  }

  /** 退订并停掉全部实例。 */
  dispose(): void {
    this.renderer.onFrame.unsubscribe(this.handleFrame);
    this.world.onObjectRemoved.unsubscribe(this.handleObjectRemoved);
    this.soundInstances.forEach((inst) => inst.handle.stop());
  }

  /**
   * 以视口中心瓦片为基准，重算各实例 volume/pan 并写回句柄；
   * loop 实例在同 spec 已达 limit 时强制 volume=0。
   * 中心无瓦片时 console.warn。
   */
  update(): void {
    const tile = this.mapTileIntersectHelper.getTileAtScreenPoint({
      x: this.worldScene.viewport.x + this.worldScene.viewport.width / 2,
      y: this.worldScene.viewport.y + this.worldScene.viewport.height / 2,
    });
    if (tile) {
      this.tileAtViewportCenter = tile;
      this.cleanOldInstances();
      const loopCounts = new Map<any, number>();
      for (const inst of this.soundInstances) {
        const pos = inst.gameObject?.position.worldPosition ?? inst.worldPos;
        const { volume, pan } = this.computeVolumeAndPan(inst.spec, pos, inst.player, inst.gain);
        let vol = volume;
        if (vol > 0) {
          const count = loopCounts.get(inst.spec) ?? 0;
          if (inst.loop && count >= inst.spec.limit) vol = 0;
          else loopCounts.set(inst.spec, count + 1);
        }
        inst.handle.setVolume(vol);
        inst.handle.setPan(pan);
        inst.volume = vol;
      }
    } else {
      console.warn("No tile found at viewport center. Can't update local sound positions.");
    }
  }

  /** 去掉已结束的实例。 */
  cleanOldInstances(): void {
    this.soundInstances = this.soundInstances.filter((inst) => inst.handle.isPlaying());
  }

  /**
   * 播放一条世界音效。
   * @param target 世界坐标点，或带 position.worldPosition 的 GameObject。
   * @param player 所属玩家（Player 型仅本地玩家可听）。
   * @param gain 外部增益（默认 1）；loop 型可用 ambientGain 覆盖。
   * @returns 播放句柄；被过滤/限流时为 undefined。
   */
  playEffect(
    soundKey: SoundKey,
    target: any,
    player: any,
    gain = 1,
    ambientGain?: number,
  ): any {
    const spec = this.sound.getSoundSpec(soundKey);
    if (spec && (!spec.type.includes(SoundType.Player) || player === this.localPlayer)) {
      let worldPos: any;
      let gameObject: any;
      if (target.position) {
        worldPos = target.position.worldPosition;
        gameObject = target;
      } else {
        worldPos = target;
      }
      const isLoop =
        spec.control.has(SoundControl.Loop) || spec.control.has(SoundControl.Ambient);
      let loops = isLoop ? spec.loop || Number.POSITIVE_INFINITY : 0;
      if (isLoop && ambientGain !== undefined) gain = ambientGain;
      let { volume, pan } = this.computeVolumeAndPan(spec, worldPos, player, gain);
      let limit = spec.limit;
      if (isLoop && spec.limit) {
        limit = 0;
        this.cleanOldInstances();
        const active = this.soundInstances.filter((inst) => inst.spec === spec && inst.volume > 0).length;
        if (active >= spec.limit) volume = 0;
      }
      if (isLoop || volume || !spec.limit) {
        const channel =
          spec.control.has(SoundControl.Ambient) || spec.name.startsWith("_Amb_")
            ? ChannelType.Ambient
            : ChannelType.Effect;
        const handle = this.sound.playWithOptions(spec, channel, volume, pan, limit, loops);
        if (handle) {
          this.soundInstances.push({
            spec,
            gameObject,
            worldPos,
            player,
            handle,
            gain,
            volume,
            loop: isLoop,
          });
        }
        return handle;
      }
    }
  }

  /**
   * 计算音量与声像：
   * - Global 非本地 → minVolume；
   * - Screen/Global：pan 按到视口中心 x 偏移 clamp 到 [-1,1]；
   * - Screen：按到视口矩形距离线性衰减（lerp(1,0,min(1,d/threshold))）；
   * - Local：按瓦片距离与 range*√2 平方衰减，可叠 vShift 随机；
   * - noShroudSpecs 且非 Global：未探索瓦片 → volume 0。
   */
  computeVolumeAndPan(
    spec: any,
    worldPos: { x: number; y: number; z: number },
    player: any,
    gain = 1,
  ): { volume: number; pan: number } {
    let volume = spec.volume / 100;
    let pan = 0;
    if (spec.type.includes(SoundType.Global) && player !== this.localPlayer) {
      volume = spec.minVolume / 100;
    }
    volume *= gain;
    if (spec.type.includes(SoundType.Screen) || spec.type.includes(SoundType.Global)) {
      const dist = this.worldViewportHelper.distanceToViewportCenter(worldPos);
      pan = clamp(dist.x / (this.worldScene.viewport.width / 2), -1, 1);
    }
    if (spec.type.includes(SoundType.Screen)) {
      const d = this.worldViewportHelper.distanceToViewport(worldPos);
      const threshold = (this.worldScene.viewport.height + this.worldScene.viewport.width) / 2 / 3;
      // 孪生: THREE.Math.lerp(1, 0, min(1, d/threshold))
      volume *= (THREE as any).Math.lerp(1, 0, Math.min(1, d / threshold));
    } else if (spec.type.includes(SoundType.Local)) {
      if (this.tileAtViewportCenter) {
        const tileDist = new (THREE as any).Vector2(
          worldPos.x / Coords.LEPTONS_PER_TILE - this.tileAtViewportCenter.rx,
          worldPos.z / Coords.LEPTONS_PER_TILE - this.tileAtViewportCenter.ry,
        ).length();
        const maxDist = spec.range * Math.SQRT2;
        if (maxDist < tileDist) {
          volume = 0;
        } else {
          if (spec.vShift) volume *= getRandomInt(spec.vShift.min, spec.vShift.max) / 100;
          volume *= 1 - Math.min(1, (tileDist / maxDist) ** 2);
        }
      } else {
        volume = 0;
      }
    }
    if (
      this.noShroudSpecs.includes(spec) &&
      !spec.type.includes(SoundType.Global) &&
      this.shroud?.getShroudTypeByTileCoords(
        Math.floor(worldPos.x / Coords.LEPTONS_PER_TILE),
        Math.floor(worldPos.z / Coords.LEPTONS_PER_TILE),
        Math.floor(Coords.worldToTileHeight(worldPos.y)),
      ) === ShroudType.Unexplored
    ) {
      volume = 0;
    }
    return { volume, pan };
  }
}
