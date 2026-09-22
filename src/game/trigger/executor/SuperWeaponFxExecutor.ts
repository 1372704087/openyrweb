/**
 * SuperWeaponFxExecutor — 按 mode 激活对应超武特效（多动作共用）。
 *
 * mode→SuperWeaponType 映射（模块级 SUPER_WEAPON_BY_MODE）：
 * meteor→MultiMissile、chronowarp/chronowarpat→ChronoWarp、
 * chronoshift→ChronoSphere、psychic→PsychicReveal、
 * genetic→GeneticMutator。execute 按 params[6] 路径点取 tile，
 * 找触发 house 与规则后 activateEffect；ChronoSphere 额外传
 * tile2=自身近似。各步失败均 warn 并 return。
 *
 * 由 game/trigger/executor/SuperWeaponFxExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { SuperWeaponsTrait } from "game/trait/SuperWeaponsTrait"; // 已转换
import { SuperWeaponType } from "game/type/SuperWeaponType"; // 已转换
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 已转换

/** mode 字符串 → 超武类型（与孪生模块级常量一致）。 */
const SUPER_WEAPON_BY_MODE: Record<string, any> = {
  meteor: SuperWeaponType.MultiMissile,
  chronowarp: SuperWeaponType.ChronoWarp,
  chronoshift: SuperWeaponType.ChronoSphere,
  chronowarpat: SuperWeaponType.ChronoWarp,
  psychic: SuperWeaponType.PsychicReveal,
  genetic: SuperWeaponType.GeneticMutator,
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export class SuperWeaponFxExecutor extends TriggerExecutor {
  /** 特效模式标签（meteor/chronowarp/…）。 */
  mode: string;

  constructor(action: any, trigger: any, mode: string) {
    super(action, trigger);
    this.mode = mode;
  }

  /** 按 mode 在路径点激活对应超武效果。 */
  execute(world: any): void {
    const waypoint = this.action.params[6];
    const tile = world.map.getTileAtWaypoint(waypoint);
    if (!tile) {
      console.warn(`No valid location found for waypoint ${waypoint}. Skipping action ${this.getDebugName()}.`);
      return;
    }
    const swType = SUPER_WEAPON_BY_MODE[this.mode];
    if (swType === undefined) {
      console.warn(`Unknown super weapon fx mode "${this.mode}" for ${this.getDebugName()}.`);
      return;
    }
    const player =
      world.housePlayers.get(this.trigger.houseName) ||
      world.getAllPlayers().find((p: any) => !p.defeated && p.country?.name === this.trigger.houseName);
    if (!player) {
      console.warn(`Invalid house "${this.trigger.houseName}" for ${this.getDebugName()}.`);
      return;
    }
    const sw = [...world.rules.superWeaponRules.values()].find((r: any) => r.type === swType);
    if (!sw) {
      console.warn(`Super weapon type ${swType} not found in rules. Skipping ${this.getDebugName()}.`);
      return;
    }
    // ChronoSphere 需要 tile2 参数（用目标点自身近似）；其余单点施放。
    const tile2 = swType === SuperWeaponType.ChronoSphere ? tile : undefined;
    world.traits.get(SuperWeaponsTrait).activateEffect(sw, player, world, tile, tile2, true);
    console.warn(`[OpenYRWeb] SuperWeaponFx ${this.mode}: ${player.name} @ waypoint ${waypoint}`);
  }
}
