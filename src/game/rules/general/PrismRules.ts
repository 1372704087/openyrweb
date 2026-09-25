/**
 * PrismRules — 光棱塔规则（折射链的高度/数量/衰减）。
 *
 * 由 game/rules/general/PrismRules.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export class PrismRules {
  /** 光棱塔建筑 INI 名 */
  type: any;
  /** 支撑塔高度 */
  supportHeight: any;
  /** 最大支撑塔数量 */
  supportMax: any;
  /** 每座支撑塔的威力增幅（缺省 1） */
  supportModifier: any;

  /** 从 [General] 段读取本组规则键（链式返回 this）。 */
  readIni(ini: any): this {
    this.type = ini.getString("PrismType");
    this.supportHeight = ini.getNumber("PrismSupportHeight");
    this.supportMax = ini.getNumber("PrismSupportMax");
    this.supportModifier = ini.getNumber("PrismSupportModifier", 1);
    return this;
  }
}
