/**
 * LightningStrikeExecutor — 闪电风暴打击动作。
 *
 * 动作 102: LightningStrike — 在路径点激活 LightningStorm 超武效果。
 *
 * 由 game/trigger/executor/LightningStrikeExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 流程：params[6]→tile；找未战败的触发阵营玩家；在 superWeaponRules 中
 * 找 LightningStorm 类型；经 SuperWeaponsTrait.activateEffect 激活
 * （第 6 参 true 与孪生一致）。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 未转换（any-shim）
import * as SuperWeaponsTraitModule from "game/trait/SuperWeaponsTrait"; // 未转换（any-shim）
import { SuperWeaponType } from "game/type/SuperWeaponType"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class LightningStrikeExecutor extends TriggerExecutor {
  /**
   * 执行：在路径点触发闪电风暴。
   *
   * @param world 世界上下文。
   */
  execute(world: any): void {
    const waypoint = this.action.params[6];
    const tile = world.map.getTileAtWaypoint(waypoint);
    if (!tile) {
      console.warn(
        `No valid location found for waypoint ${waypoint}. ` +
          `Skipping action ${this.getDebugName()}.`,
      );
      return;
    }
    const owner = world
      .getAllPlayers()
      .find((p: any) => !p.defeated && p.country?.name === this.trigger.houseName);
    if (!owner) return;
    const sw = [...world.rules.superWeaponRules.values()].find(
      (r: any) => r.type === SuperWeaponType.LightningStorm,
    );
    if (sw) {
      world.traits
        .get((SuperWeaponsTraitModule as any).SuperWeaponsTrait)
        .activateEffect(sw, owner, world, tile, void 0, !0);
    }
  }
}
