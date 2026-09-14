/**
 * LightningStormRules — 闪电风暴超武参数。
 *
 * 由 game/rules/general/LightningStormRules.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export class LightningStormRules {
  /** 风暴延迟帧数 */
  deferment: any;
  /** 单道闪电伤害 */
  damage: any;
  /** 风暴持续帧数 */
  duration: any;
  /** 闪电弹头名 */
  warhead: any;
  /** 落雷延迟 */
  hitDelay: any;
  /** 散布延迟 */
  scatterDelay: any;
  /** 单雷范围 */
  cellSpread: any;
  /** 雷点间距 */
  separation: any;

  /** 从 [General] 段读取本组规则键（链式返回 this）。 */
  readIni(ini: any): this {
    this.deferment = ini.getNumber("LightningDeferment");
    this.damage = ini.getNumber("LightningDamage");
    this.duration = ini.getNumber("LightningStormDuration");
    this.warhead = ini.getString("LightningWarhead");
    this.hitDelay = ini.getNumber("LightningHitDelay");
    this.scatterDelay = ini.getNumber("LightningScatterDelay");
    this.cellSpread = ini.getNumber("LightningCellSpread");
    this.separation = ini.getNumber("LightningSeparation");
    return this;
  }
}
