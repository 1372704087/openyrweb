/**
 * VeteranRules — 老兵晋升倍率（命中/护甲/速度/视野/射速与上限）。
 *
 * 由 game/rules/general/VeteranRules.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export class VeteranRules {
  veteranRatio: any;
  veteranCombat: any;
  veteranSpeed: any;
  veteranSight: any;
  veteranArmor: any;
  veteranROF: any;
  veteranCap: any;
  initialVeteran: any;

  /** 从 [General] 段读取本组键（链式返回 this）。 */
  readIni(ini: any): this {
    this.veteranRatio = ini.getNumber('VeteranRatio', 3);
    this.veteranCombat = ini.getNumber('VeteranCombat', 1);
    this.veteranSpeed = ini.getNumber('VeteranSpeed', 1);
    this.veteranSight = Math.max(1, ini.getNumber('VeteranSight', 1));
    this.veteranArmor = ini.getNumber('VeteranArmor', 1);
    this.veteranROF = ini.getNumber('VeteranROF', 1);
    this.veteranCap = ini.getNumber('VeteranCap', 2);
    this.initialVeteran = ini.getBool('InitialVeteran');
    return this;
  }
}
