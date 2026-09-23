/**
 * LastRadarEventCmd — 在最近雷达/相关事件机位间轮转跳转。
 *
 * 由 gui/screen/game/worldInteraction/keyboard/command/LastRadarEventCmd.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as EventTypeModule from "game/event/EventType"; // 孪生
import * as SuperWeaponTypeModule from "game/type/SuperWeaponType"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：取命名空间成员
const EventType: any = (EventTypeModule as any).EventType;
const SuperWeaponType: any = (SuperWeaponTypeModule as any).SuperWeaponType;

/** 最近雷达事件命令：历史最多保留 8 条，间隔 >400ms 重置到最新。 */
export class LastRadarEventCmd {
  /** 当前玩家。 */
  player: any;
  /** 地图平移辅助。 */
  mapPanningHelper: any;
  /** 镜头平移。 */
  cameraPan: any;
  /** 事件 tile 历史。 */
  eventHistory: any[] = [];
  /** 当前历史指针。 */
  eventPointer = -1;
  /** 上次执行时间戳（毫秒）。 */
  lastRun: number | undefined;

  /**
   * @param player 玩家
   * @param mapPanningHelper 平移辅助
   * @param cameraPan 镜头平移
   */
  constructor(player: any, mapPanningHelper: any, cameraPan: any) {
    this.player = player;
    this.mapPanningHelper = mapPanningHelper;
    this.cameraPan = cameraPan;
    this.eventHistory = [];
    this.eventPointer = -1;
  }

  /** 轮转指针并跳到对应 tile。 */
  execute(): void {
    if (!this.eventHistory.length) return;
    let delta = 0;
    if (this.lastRun) {
      const now = Date.now();
      delta = now - this.lastRun;
      this.lastRun = now;
      if (delta > 400) {
        this.eventPointer = this.eventHistory.length - 1;
      } else {
        this.eventPointer--;
        if (this.eventPointer < 0) this.eventPointer = this.eventHistory.length - 1;
      }
    } else {
      this.lastRun = Date.now();
    }
    const entry = this.eventHistory[this.eventPointer];
    if (entry) {
      const pan = this.mapPanningHelper.computeCameraPanFromTile(entry.rx, entry.ry);
      this.cameraPan.setPan(pan);
    }
  }

  /**
   * 记录一条事件 tile（只保留最近 8 条）。
   * @param tile 事件所在 tile
   */
  recordEvent(tile: any): void {
    this.eventHistory.push(tile);
    this.eventHistory = this.eventHistory.slice(-8);
    this.eventPointer = this.eventHistory.length - 1;
  }

  /**
   * 处理游戏事件并筛选需要入史的类型。
   * @param event 游戏事件
   */
  handleGameEvent(event: any): void {
    switch (event.type) {
      case EventType.RadarEvent:
        if (event.target === this.player) this.recordEvent(event.tile);
        break;
      case EventType.BridgeRepair:
        if (event.source === this.player) this.recordEvent(event.tile);
        break;
      case EventType.ObjectDestroy: {
        const target = event.target;
        if (target.isUnit() && target.owner === this.player) this.recordEvent(target.tile);
        if (target.isProjectile() && target.isNuke) this.recordEvent(target.tile);
        break;
      }
      case EventType.FactoryProduceUnit: {
        const unit = event.target;
        if (unit.owner === this.player) this.recordEvent(unit.tile);
        break;
      }
      case EventType.SuperWeaponActivate:
        if ([SuperWeaponType.IronCurtain, SuperWeaponType.ChronoSphere].includes(event.target)) {
          this.recordEvent(event.atTile2 ?? event.atTile);
        }
        break;
      case EventType.LightningStormManifest:
        this.recordEvent(event.target);
        break;
      case EventType.PingLocation:
        this.recordEvent(event.tile);
        break;
    }
  }
}
