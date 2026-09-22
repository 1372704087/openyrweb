/**
 * AttackedByHouseCondition — 被指定阵营攻击条件。
 *
 * 由 game/trigger/condition/AttackedByHouseCondition.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 对应 TriggerEventType.AttackedByHouse=44：过滤 ObjectAttacked 事件，
 * 要求目标是 Techno 且在标签 targets 内，攻击者国家 id 等于 params[1]
 * （或 houseId=-1 表示任意国家）；返回命中的目标列表。
 */
import { EventType } from "game/event/EventType"; // 孪生
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
export class AttackedByHouseCondition extends TriggerCondition {
  /** 攻击者国家 id；-1 表示任意。 */
  houseId: number;

  constructor(event: any, trigger: any) {
    super(event, trigger);
    this.houseId = Number(event.params[1]);
  }

  /**
   * 检查本批事件中是否有符合条件的攻击。
   *
   * @returns 命中的目标对象数组（可能为空）。
   */
  check(_context?: any, events?: any[]): any[] {
    return events
      .filter((ev) => {
        if (ev.type !== EventType.ObjectAttacked) return !1;
        const target = ev.target;
        if (!target.isTechno() || !this.targets.includes(target)) return !1;
        const attackerPlayer = ev.attacker?.player;
        return !!(attackerPlayer && (-1 === this.houseId || attackerPlayer?.country?.id === this.houseId));
      })
      .map((ev) => ev.target);
  }
}
