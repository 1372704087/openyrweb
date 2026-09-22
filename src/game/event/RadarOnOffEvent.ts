/**
 * RadarOnOffEvent — 雷达开关状态变化事件。
 *
 * 由 game/event/RadarOnOffEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class RadarOnOffEvent {
  /** 雷达状态所属的玩家目标。 */
  readonly target: any;
  /** 雷达是否已启用。 */
  readonly radarEnabled: boolean;
  readonly type: number;

  constructor(target: any, radarEnabled: boolean) {
    this.target = target;
    this.radarEnabled = radarEnabled;
    this.type = EventType.RadarOnOff;
  }
}
