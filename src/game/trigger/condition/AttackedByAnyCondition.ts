/**
 * AttackedByAnyCondition — 任意敌方攻击触发条件。
 *
 * 从事件批中筛选 ObjectAttacked：目标须为本触发器 targets 中的
 * Techno；攻击者玩家（或无攻击者）须与目标非同盟且非同一玩家；
 * 排除 incidental（附带伤害）。返回命中的 target 列表。
 *
 * 由 game/trigger/condition/AttackedByAnyCondition.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 已转换
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
export class AttackedByAnyCondition extends TriggerCondition {
  /** 筛选被攻击目标（非同盟、非 incidental），返回 target 列表。 */
  check(world: any, events: any[]): any[] {
    return events
      .filter((event) => {
        if (event.type !== EventType.ObjectAttacked) return false;
        const target = event.target;
        if (!target.isTechno() || !this.targets.includes(target)) return false;
        const attackerPlayer = event.attacker?.player;
        return (
          (!attackerPlayer || (!world.alliances.areAllied(attackerPlayer, target.owner) && attackerPlayer !== target.owner)) &&
          !event.incidental
        );
      })
      .map((event) => event.target);
  }
}
