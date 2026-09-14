/**
 * RepairRules — 修理规则（建筑/载具/步兵的修复速率与费用）。
 *
 * 由 game/rules/general/RepairRules.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export class RepairRules {
  /** 炮塔/武器装填速率基值 */
  reloadRate: any;
  /** 建筑修理费用百分比 */
  repairPercent: any;
  /** 建筑修复速率 */
  repairRate: any;
  /** 建筑修复步长（每 tick 修复量） */
  repairStep: any;
  /** 载具修复速率 */
  uRepairRate: any;
  /** 步兵修复速率 */
  iRepairRate: any;
  /** 步兵修复步长 */
  iRepairStep: any;

  /** 从 [General] 段读取本组规则键（链式返回 this）。 */
  readIni(ini: any): this {
    this.reloadRate = ini.getNumber("ReloadRate");
    this.repairPercent = ini.getNumber("RepairPercent");
    this.repairRate = ini.getNumber("RepairRate");
    this.repairStep = ini.getNumber("RepairStep");
    this.uRepairRate = ini.getNumber("URepairRate");
    this.iRepairRate = ini.getNumber("IRepairRate");
    this.iRepairStep = ini.getNumber("IRepairStep");
    return this;
  }
}
