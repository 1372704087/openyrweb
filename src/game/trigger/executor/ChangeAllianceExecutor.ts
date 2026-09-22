/**
 * ChangeAllianceExecutor — 在两个阵营之间建立/解除联盟。
 *
 * 动作 89: ChangeAlliance
 * 参数: params[1]=阵营 A 国家 ID, params[2]=阵营 B 国家 ID,
 *       params[3]=1 建立 / 0 解除。
 * 通过 game.onAllianceChange 派发 AllianceChangeEvent 并通知 shroud 等系统。
 *
 * 由 game/trigger/executor/ChangeAllianceExecutor.ts.js 重写为 TS。
 */
import { AllianceStatus } from "game/Alliances"; // 孪生
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ChangeAllianceExecutor extends TriggerExecutor {
  execute(game: any): void {
    const idA = Number(this.action.params[1]);
    const idB = Number(this.action.params[2]);
    const form = Boolean(Number(this.action.params[3]));
    const p1 = game.getAllPlayers().find((p) => !p.defeated && p.country?.id === idA);
    const p2 = game.getAllPlayers().find((p) => !p.defeated && p.country?.id === idB);
    if (!p1 || !p2) {
      console.warn(`Invalid houses ${idA}/${idB} for action ${this.getDebugName()}.`);
      return;
    }
    const alliances = game.alliances;
    const existing = alliances.findByPlayers(p1, p2);
    if (form) {
      if (existing) {
        if (existing.status !== AllianceStatus.Formed) {
          existing.status = AllianceStatus.Formed;
          game.onAllianceChange(existing, p1, true);
        }
      } else if (alliances.canFormAlliance(p1, p2)) {
        const formed = alliances.setAlliance(p1, p2, AllianceStatus.Formed);
        game.onAllianceChange(formed, p1, true);
      }
    } else if (existing && existing.status === AllianceStatus.Formed) {
      alliances.breakAlliance(p1, p2);
      game.onAllianceChange(existing, p1, false);
    }
  }
}
