/**
 * HoverRules — 悬浮单位运动学参数。
 *
 * 由 game/rules/general/HoverRules.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export class HoverRules {
  /** 悬浮高度 */
  height: any;
  /** 阻尼 */
  dampen: any;
  /** 上下浮动幅度 */
  bob: any;
  /** 加速推力 */
  boost: any;
  /** 加速度 */
  acceleration: any;
  /** 刹车力 */
  brake: any;

  /** 从 [General] 段读取本组规则键（链式返回 this）。 */
  readIni(ini: any): this {
    this.height = ini.getNumber("HoverHeight");
    this.dampen = ini.getNumber("HoverDampen");
    this.bob = ini.getNumber("HoverBob");
    this.boost = ini.getNumber("HoverBoost");
    this.acceleration = ini.getNumber("HoverAcceleration");
    this.brake = ini.getNumber("HoverBrake");
    return this;
  }
}
