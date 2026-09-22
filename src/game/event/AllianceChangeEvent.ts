/**
 * AllianceChangeEvent — 联盟关系变化事件（请求/结成/破裂）。
 *
 * 由 game/event/AllianceChangeEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 *
 * 模块同时导出子枚举 AllianceEventType（孪生内联定义），消费方如
 * game/action/ToggleAllianceAction、game/Game 与 SoundHandler 会一并引用。
 */
import { EventType } from "game/event/EventType";

/** 联盟变化子类型（对应孪生内联导出的 AllianceEventType）。 */
export enum AllianceEventType {
  /** 已向对方发出结盟请求，尚未接受。 */
  Requested = 0,
  /** 双方正式结成同盟。 */
  Formed = 1,
  /** 既有同盟关系破裂（含主动撤回/拒绝后的清理）。 */
  Broken = 2,
}

export class AllianceChangeEvent {
  /** 变化所涉及的联盟关系对象（Alliances 中的 alliance 记录）。 */
  readonly alliance: any;
  /** 本次变化的子类型。 */
  readonly changeType: AllianceEventType;
  /** 触发本次变化的玩家（请求方/破盟方）。 */
  readonly from: any;
  readonly type: number;

  constructor(alliance: any, changeType: AllianceEventType, from: any) {
    this.alliance = alliance;
    this.changeType = changeType;
    this.from = from;
    this.type = EventType.AllianceChange;
  }
}
