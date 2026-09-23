/**
 * DestroyedByAnyCondition — 目标被敌方摧毁。
 *
 * 事件 DestroyedByAny：目标 techno 在 targets 内，攻击者非友军/非本人，
 * 且非 incidental（附带伤害）。无攻击者信息（环境摧毁）也计入。
 *
 * 由 game/trigger/condition/DestroyedByAnyCondition.ts.js 重写为 TS。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 孪生
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 本组已写

export class DestroyedByAnyCondition extends TriggerCondition {
  check(game: any, events: any[]): any[] {
    return events
      .filter((ev) => {
        if (ev.type !== EventType.ObjectDestroy) return false;
        const target = ev.target;
        if (!target.isTechno() || !this.targets.includes(target)) return false;
        const attackerPlayer = ev.attackerInfo?.player;
        // 攻击者必须非盟友且非本人；incidental 不算「被摧毁」语义
        if (attackerPlayer) {
          if (game.alliances.areAllied(attackerPlayer, target.owner)) return false;
          if (attackerPlayer === target.owner) return false;
        }
        return !ev.incidental;
      })
      .map((ev) => ev.target);
  }
}
