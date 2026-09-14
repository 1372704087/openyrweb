/**
 * CrewRules — 乘员规则：载具被毁时逃出的乘员单位与幸存率。
 *
 * 由 game/rules/general/CrewRules.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export class CrewRules {
  /** 盟军乘员单位名 */
  alliedCrew: any;
  /** 盟军幸存者除数（越大越少逃出） */
  alliedSurvivorDivisor: any;
  /** 乘员逃跑概率（0-1） */
  crewEscape: any;
  /** 苏军乘员单位名 */
  sovietCrew: any;
  /** 苏军幸存者除数 */
  sovietSurvivorDivisor: any;
  /** 基础幸存率 */
  survivorRate: any;
  /** 第三阵营乘员单位名 */
  thirdCrew: any;
  /** 第三阵营幸存者除数 */
  thirdSurvivorDivisor: any;

  /** 从 [General] 段读取本组规则键（链式返回 this）。 */
  readIni(ini: any): this {
    this.alliedCrew = ini.getString("AlliedCrew");
    this.alliedSurvivorDivisor = ini.getNumber("AlliedSurvivorDivisor");
    this.crewEscape = ini.getNumber("CrewEscape");
    this.sovietCrew = ini.getString("SovietCrew");
    this.sovietSurvivorDivisor = ini.getNumber("SovietSurvivorDivisor");
    this.survivorRate = ini.getNumber("SurvivorRate");
    this.thirdCrew = ini.getString("ThirdCrew");
    this.thirdSurvivorDivisor = ini.getNumber("ThirdSurvivorDivisor");
    return this;
  }
}
