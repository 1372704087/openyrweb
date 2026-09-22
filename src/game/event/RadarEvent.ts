/**
 * RadarEvent — 雷达警报事件。
 *
 * 雷达规则判定需要向玩家播报一次警报（基地遇袭、矿车遇袭、
 * 敌方被探测到等）时派发；HUD 小地图高亮与警报音效订阅本事件。
 *
 * 由 game/event/RadarEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class RadarEvent {
  /** 警报归属的玩家（接收方）。 */
  readonly target: any;
  /** 雷达警报子类型（RadarRules 的 RadarEventType 枚举值）。 */
  readonly radarEventType: number;
  /** 警报相关的地图格（遇袭/探测位置）。 */
  readonly tile: any;
  readonly type: number;

  constructor(target: any, radarEventType: number, tile: any) {
    this.target = target;
    this.radarEventType = radarEventType;
    this.tile = tile;
    this.type = EventType.RadarEvent;
  }
}
