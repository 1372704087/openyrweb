/**
 * SmudgeRules — 地面污渍规则（Burn/Crater/宽高）。
 *
 * 由 game/rules/SmudgeRules.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 */
import { ObjectRules } from "game/rules/ObjectRules"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

export class SmudgeRules extends ObjectRules {
  /** 是否带燃烧痕迹。 */
  burn: boolean;
  /** 是否带弹坑贴图。 */
  crater: boolean;
  /** 宽度（格）。 */
  width: number;
  /** 高度（格）。 */
  height: number;

  parse(): void {
    super.parse();
    this.burn = this.ini.getBool("Burn");
    this.crater = this.ini.getBool("Crater");
    this.width = this.ini.getNumber("Width", 1);
    this.height = this.ini.getNumber("Height", 1);
  }
}
