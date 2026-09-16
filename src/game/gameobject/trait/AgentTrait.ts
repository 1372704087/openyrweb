/**
 * AgentTrait — 间谍/特工渗透（infiltrate 检查目标是否有卫星/重置超武计时/给生产加老兵类型）。
 *
 * 由 game/gameobject/trait/AgentTrait.ts.js 重写为 TS（行为完全一致）。
 * 本文件为修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { FactoryType } from "game/rules/TechnoRules"; // 已转换
import { clamp } from "util/math"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class AgentTrait {
  infiltrate(spy: any, target: any, world: any) {
    if (target.rules.radar && ![...target.owner.buildings].some((building: any) => building.rules.spySat)) {
      world.mapShroudTrait.resetShroud(target.owner, world);
    }
    if (0 < target.rules.power) {
      const blackout = world.rules.general.spyPowerBlackout;
      target.owner.powerTrait?.setBlackoutFor(blackout, world);
    }
    if (target.superWeaponTrait) {
      target.superWeaponTrait.getSuperWeapon(target)?.resetTimer();
    }
    if (0 < target.rules.storage) {
      const stealRatio = clamp(world.rules.general.spyMoneyStealPercent, 0, 1);
      const stolen = Math.floor(target.owner.credits * stealRatio);
      target.owner.credits -= stolen;
      spy.owner.credits += stolen;
    }
    if (world.rules.ai.buildTech.includes(target.name)) {
      const planningSide = target.rules.aiBasePlanningSide;
      if (void 0 !== planningSide) spy.owner.production.addStolenTech(planningSide);
    }
    if (
      target.factoryTrait &&
      [FactoryType.InfantryType, FactoryType.UnitType].includes(target.factoryTrait.type)
    ) {
      spy.owner.production?.addVeteranType(target.factoryTrait.type);
    }
  }
}
