/**
 * TriggerSoundFxEvent — 触发器动作：播放音效事件。
 *
 * 地图触发器执行 Play Sound 动作时派发；音效可在指定地块位置播放。
 *
 * 由 game/event/TriggerSoundFxEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 孪生

export class TriggerSoundFxEvent {
  /** 要播放的音效资源 ID。 */
  readonly soundId: any;
  /** 播放位置所在地块（空间音效锚点）。 */
  readonly tile: any;
  readonly type: number;

  constructor(soundId: any, tile: any) {
    this.soundId = soundId;
    this.tile = tile;
    this.type = EventType.TriggerSoundFx;
  }
}
