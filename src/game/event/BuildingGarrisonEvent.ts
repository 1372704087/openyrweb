/**
 * BuildingGarrisonEvent — 单位进驻（驻军）建筑事件。
 *
 * 由 game/event/BuildingGarrisonEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class BuildingGarrisonEvent {
  /** 被进驻的建筑目标。 */
  readonly target: any;
  readonly type: number;

  constructor(target: any) {
    this.target = target;
    this.type = EventType.BuildingGarrison;
  }
}
