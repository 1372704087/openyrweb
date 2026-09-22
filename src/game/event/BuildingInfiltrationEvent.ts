/**
 * BuildingInfiltrationEvent — 建筑被渗透事件（间谍进入窃取情报/断电/偷科技）。
 *
 * 由 game/event/BuildingInfiltrationEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 孪生

export class BuildingInfiltrationEvent {
  /** 被渗透的建筑目标。 */
  readonly target: any;
  /** 执行渗透的来源对象（通常为间谍）。 */
  readonly source: any;
  readonly type: number;

  constructor(target: any, source: any) {
    this.target = target;
    this.source = source;
    this.type = EventType.BuildingInfiltration;
  }
}
