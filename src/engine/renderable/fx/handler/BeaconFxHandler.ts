/**
 * BeaconFxHandler — 信标（PingLocation）特效处理器。
 *
 * 订阅 PingLocation：己方/盟军且 canPingLocation 通过时播放 PlaceBeaconSound，
 * 同地块复用已有 PBEACON 动画并刷新 startTime，否则 createTransientAnim。
 * 每帧 handleFrame 推进 now，超过 7 秒的信标 endAnimationLoop 并从数组移除。
 *
 * 由 engine/renderable/fx/handler/BeaconFxHandler.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 已转换
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { Coords } from "game/Coords"; // 已转换
import { SoundKey } from "engine/sound/SoundKey"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 单个活动信标记录。 */
interface BeaconEntry {
  /** 信标所在地块（对象引用相等判断）。 */
  tile: any;
  /** 对应瞬时动画。 */
  anim: any;
  /** 创建/刷新时间戳（ms），未初始化时为 undefined。 */
  startTime: number | undefined;
}

/**
 * 信标特效处理器。
 * 每玩家最多并存 3 个信标；同地块可刷新；最小间隔 1000/3 ms。
 */
export class BeaconFxHandler {
  /** 游戏上下文。 */
  game: any;
  /** 本地玩家（Ref，读 .value）。 */
  localPlayer: any;
  /** 渲染管理器。 */
  renderableManager: any;
  /** 渲染器（onFrame 订阅）。 */
  renderer: any;
  /** 世界音效。 */
  worldSound: any;
  /** 订阅与帧回调的复合可释放集合。 */
  disposables: any;
  /** 玩家 → 活动信标列表。 */
  beacons: Map<any, BeaconEntry[]>;
  /** 当前帧时间戳（handleFrame 写入）。 */
  now: number | undefined;

  /** PingLocation 事件处理器（箭头函数绑定 this）。 */
  handlePingEvent: (ev: any) => void;
  /** 帧回调：更新 now 并清理过期信标。 */
  handleFrame: (t: number) => void;

  /**
   * @param game - 游戏
   * @param localPlayer - 本地玩家 Ref
   * @param renderableManager - 渲染管理器
   * @param renderer - 渲染器
   * @param worldSound - 世界音效
   */
  constructor(game: any, localPlayer: any, renderableManager: any, renderer: any, worldSound: any) {
    this.game = game;
    this.localPlayer = localPlayer;
    this.renderableManager = renderableManager;
    this.renderer = renderer;
    this.worldSound = worldSound;
    this.disposables = new CompositeDisposable();
    this.beacons = new Map();

    this.handlePingEvent = (ev: any) => {
      const local = this.localPlayer.value;
      // 旁观者/无本地玩家/自己/盟军 才允许显示
      if (
        (!local || local.isObserver || ev.player === local || this.game.alliances.areAllied(ev.player, local)) &&
        this.canPingLocation(ev.player, ev.tile)
      ) {
        let list = this.beacons.get(ev.player);
        if (!list) {
          list = [];
          this.beacons.set(ev.player, list);
        }
        let existing = list.find((b) => b.tile === ev.tile);
        // 桥上抬高
        const bridge = ev.tile.onBridgeLandType
          ? this.game.map.tileOccupation.getBridgeOnTile(ev.tile)
          : void 0;
        const world = Coords.tile3dToWorld(
          ev.tile.rx + 0.5,
          ev.tile.ry + 0.5,
          ev.tile.z + (bridge?.tileElevation ?? 0),
        );
        this.worldSound.playEffect(SoundKey.PlaceBeaconSound, world, ev.player);
        if (existing) {
          existing.startTime = this.now;
        } else {
          const anim = this.renderableManager.createTransientAnim("PBEACON", (a: any) => {
            a.setPosition(world);
            a.setRenderOrder(1e6);
            a.remapColor(ev.player.color);
            a.create3DObject();
          });
          list.push({ tile: ev.tile, anim, startTime: this.now });
        }
      }
    };

    this.handleFrame = (t: number) => {
      this.now = t;
      for (const list of this.beacons.values()) {
        // slice：遍历中可能 splice
        for (const entry of list.slice()) {
          if (entry.startTime === void 0) {
            entry.startTime = t;
          } else if (t > entry.startTime + 7000) {
            entry.anim.endAnimationLoop();
            const idx = list.indexOf(entry);
            if (idx === -1) throw new Error("Beacon not found in array");
            list.splice(idx, 1);
          }
        }
      }
    };
  }

  /** 订阅事件与帧回调。 */
  init(): void {
    this.disposables.add(this.game.events.subscribe(EventType.PingLocation, this.handlePingEvent));
    this.renderer.onFrame.subscribe(this.handleFrame);
    this.disposables.add(() => this.renderer.onFrame.unsubscribe(this.handleFrame));
  }

  /**
   * 是否允许在该地块 ping（上限 3 / 同地块刷新 / 最小间隔）。
   * @param player - 玩家
   * @param tile - 目标地块
   */
  canPingLocation(player: any, tile: any): boolean {
    const list = this.beacons.get(player) ?? [];
    const lastStart = list.reduce((acc, b) => Math.max(acc, b.startTime ?? 0), 0);
    return (
      (list.length < 3 || list.some((b) => b.tile === tile)) &&
      (!this.now || this.now - lastStart >= 1000 / 3)
    );
  }

  /** 释放全部订阅。 */
  dispose(): void {
    this.disposables.dispose();
  }
}
