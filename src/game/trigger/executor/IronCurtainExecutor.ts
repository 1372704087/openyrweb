/**
 * IronCurtainExecutor — 在路径点释放铁幕。
 *
 * 动作 IronCurtainAt：params[6]=路径点；解析触发器所属阵营未败北玩家，
 * 找到 IronCurtain 超武规则后经 SuperWeaponsTrait.activateEffect 施放。
 *
 * 由 game/trigger/executor/IronCurtainExecutor.ts.js 重写为 TS。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { SuperWeaponsTrait } from "game/trait/SuperWeaponsTrait"; // 孪生
import { SuperWeaponType } from "game/type/SuperWeaponType"; // 孪生
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写

/* eslint-disable @typescript-eslint/no-explicit-any */
export class IronCurtainExecutor extends TriggerExecutor {
  execute(game: any): void {
    const wp = this.action.params[6];
    const tile = game.map.getTileAtWaypoint(wp);
    if (!tile) {
      console.warn(`No valid location found for waypoint ${wp}. ` + `Skipping action ${this.getDebugName()}.`);
      return;
    }
    const owner = game.getAllPlayers().find((p) => !p.defeated && p.country?.name === this.trigger.houseName);
    if (!owner) return;
    const rules = [...game.rules.superWeaponRules.values()].find((r) => r.type === SuperWeaponType.IronCurtain);
    if (rules) {
      // 孪生第 2 参为解析出的玩家 owner（非 tile），与 ForceShieldAt 等同构
      game.traits.get(SuperWeaponsTrait).activateEffect(rules, owner, game, tile, undefined, true);
    }
  }
}
