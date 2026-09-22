/**
 * UnitPromoteEvent — 单位晋升（升级军衔）事件。
 *
 * 单位获得击杀经验并晋升时派发，用于播放晋升特效、音效与
 * 更新星级（VeteranLevel）显示。
 *
 * 由 game/event/UnitPromoteEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class UnitPromoteEvent {
  /** 晋升的单位目标。 */
  readonly target: any;
  readonly type: number;

  constructor(target: any) {
    this.target = target;
    this.type = EventType.UnitPromote;
  }
}
