/**
 * AddSuperWeaponExecutor — 为触发阵营添加超武。
 *
 * 第三参 oneTimeOnly：AddOneTime→true / AddRepeating→false。
 * execute 按 superWeaponIdx=params[1] 在 superWeaponRules 中查找；
 * 找到且目标 house 尚未持有同名超武时 createSuperWeapon 并
 * isGift=true 后加入 superWeaponsTrait；找不到则 warn 跳过。
 *
 * 由 game/trigger/executor/AddSuperWeaponExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class AddSuperWeaponExecutor extends TriggerExecutor {
  /** 是否仅发放一次（true=OneTime / false=Repeating）。 */
  oneTimeOnly: boolean;
  /** 超武规则 index（params[1]）。 */
  superWeaponIdx: number;

  constructor(action: any, trigger: any, oneTimeOnly: boolean) {
    super(action, trigger);
    this.oneTimeOnly = oneTimeOnly;
    this.superWeaponIdx = Number(action.params[1]);
  }

  /** 按 index 找超武规则并授予触发 house（未持有时）。 */
  execute(world: any): void {
    const swRule = [...world.rules.superWeaponRules.values()].find(
      (r: any) => r.index === this.superWeaponIdx,
    );
    if (swRule) {
      const player = world
        .getAllPlayers()
        .find((p: any) => p.country?.name === this.trigger.houseName);
      if (player && player.superWeaponsTrait && !player.superWeaponsTrait.has(swRule.name)) {
        const sw = world.createSuperWeapon(swRule.name, player, this.oneTimeOnly);
        sw.isGift = true;
        player.superWeaponsTrait.add(sw);
      }
    } else
      console.warn(
        `No superweapon found with index "${this.superWeaponIdx}". ` + `Skipping action ${this.getDebugName()}.`,
      );
  }
}
