/**
 * StartingUnitsGenerator — 遭遇战初始单位编成生成器。
 *
 * 按 unitCount 缩放的平均造价预算，在「可选载具名单」与「其余可建单位」
 * 之间分配初始部队：先给名单内载具各分 2/3 预算份额（按条数均分再除
 * 单价向上取整），剩余预算给名单外单位（多为步兵，ObjectType.Infantry）。
 * 预算耗尽或名单遍历完即停；返回 {name, type, count} 列表供
 * Game.createPlayerInitialUnits 铺放。
 *
 * 由 game/StartingUnitsGenerator.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { ObjectType } from "engine/type/ObjectType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class StartingUnitsGenerator {
  /**
   * 生成初始单位编成。
   * @param unitCount 玩家选择的单位数量系数（预算 = 均价 * unitCount）。
   * @param vehicleNames 优先编入的载具名列表（原样匹配 rules.name）。
   * @param allRules 全部候选 TechnoRules（含造价/阵营可用性）。
   * @param country 出生国家（用于 isAvailableTo / hasOwner 过滤）。
   */
  static generate(unitCount: number, vehicleNames: any[], allRules: any[], country: any): any[] {
    var avgCost = (allRules.reduce((sum, r) => sum + r.cost, 0) / allRules.length) * unitCount;
    let result: any[] = [];
    let remaining = avgCost;
    // 孪生先 filter 可用性再 filter 名单，并把 filter 结果写回 i（供后续取补集）
    let filtered = (allRules = allRules.filter((r) => r.isAvailableTo(country) && r.hasOwner(country))).filter((r) =>
      vehicleNames.includes(r.name),
    );
    for (const rules of filtered) {
      if (remaining <= 0) break;
      // 名单内载具：均分 2/3 预算后再按单价向上取整条数
      var share = 2 / 3 / filtered.length;
      var count = Math.ceil((share * avgCost) / rules.cost);
      remaining -= count * rules.cost;
      result.push({ name: rules.name, type: ObjectType.Vehicle, count });
    }
    // 名单外单位：把剩余预算按条数均分后除单价向上取整（多为步兵）
    var rest = allRules.filter((r) => !filtered.includes(r));
    var perUnitBudget = remaining / rest.length;
    for (const rules of rest) {
      if (remaining <= 0) break;
      var count = Math.ceil(perUnitBudget / rules.cost);
      remaining -= count * rules.cost;
      result.push({ name: rules.name, type: ObjectType.Infantry, count });
    }
    return result;
  }
}
