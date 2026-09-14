/**
 * ThreatRules — AI 威胁评估的各项默认系数。
 *
 * 由 game/rules/general/ThreatRules.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ThreatRules {
  /** 自身火力有效性系数 */
  myEffectivenessCoefficientDefault: any;
  /** 目标火力有效性系数 */
  targetEffectivenessCoefficientDefault: any;
  /** 目标特殊威胁系数 */
  targetSpecialThreatCoefficientDefault: any;
  /** 目标强度系数 */
  targetStrengthCoefficientDefault: any;
  /** 目标距离系数 */
  targetDistanceCoefficientDefault: any;

  /** 从 [General] 段读取本组规则键（链式返回 this）。 */
  readIni(ini: any): this {
    this.myEffectivenessCoefficientDefault = ini.getNumber("MyEffectivenessCoefficientDefault");
    this.targetEffectivenessCoefficientDefault = ini.getNumber("TargetEffectivenessCoefficientDefault");
    this.targetSpecialThreatCoefficientDefault = ini.getNumber("TargetSpecialThreatCoefficientDefault");
    this.targetStrengthCoefficientDefault = ini.getNumber("TargetStrengthCoefficientDefault");
    this.targetDistanceCoefficientDefault = ini.getNumber("TargetDistanceCoefficientDefault");
    return this;
  }
}
