/**
 * NukeStrikeExecutor — 在路径点核打击（MultiMissile 超武效果）。
 *
 * 路径点 params[6]；对触发 house 按 SuperWeaponType.MultiMissile
 * 规则 activateEffect。路径点无效 warn；house/rule 缺失静默跳过
 * （与孪生短路表达式一致）。
 *
 * 由 game/trigger/executor/NukeStrikeExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { SuperWeaponsTrait } from "game/trait/SuperWeaponsTrait"; // 已转换
import { SuperWeaponType } from "game/type/SuperWeaponType"; // 已转换
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class NukeStrikeExecutor extends TriggerExecutor {
  /** 在路径点对触发 house 激活 MultiMissile。 */
  execute(world: any): void {
    let player: any;
    let rule: any;
    const waypoint = this.action.params[6];
    const tile = world.map.getTileAtWaypoint(waypoint);
    if (tile) {
      if (
        !(player = world
          .getAllPlayers()
          .find((p: any) => !p.defeated && p.country?.name === this.trigger.houseName))
      )
        return;
      if (
        (rule = [...world.rules.superWeaponRules.values()].find(
          (r: any) => r.type === SuperWeaponType.MultiMissile,
        )) &&
        rule
      )
        world.traits.get(SuperWeaponsTrait).activateEffect(rule, player, world, tile, undefined, true);
    } else
      console.warn(`No valid location found for waypoint ${waypoint}. ` + `Skipping action ${this.getDebugName()}.`);
  }
}
