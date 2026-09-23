/**
 * BuildingEvacuateEvent — 建筑撤离（驻军撤出）事件。
 *
 * 民用建筑/驻军建筑内的步兵被下令撤离时派发，供音效、动画与触发器消费。
 *
 * 由 game/event/BuildingEvacuateEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 孪生

export class BuildingEvacuateEvent {
  /** 被撤离驻军的建筑目标。 */
  readonly target: any;
  /** 拥有该驻军的玩家（孪生单参调用时为 undefined）。 */
  readonly player: any;
  readonly type: number;

  constructor(target: any, player?: any) {
    this.target = target;
    this.player = player;
    this.type = EventType.BuildingEvacuate;
  }
}
