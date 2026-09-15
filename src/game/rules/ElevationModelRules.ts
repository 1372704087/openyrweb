/**
 * ElevationModelRules — 海拔模型规则（高度格的攻击加成计算：increment/bonus/cap）。
 *
 * 由 game/rules/ElevationModelRules.ts.js 机械重写为 TS（语句原样保留，行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */


/* eslint-disable @typescript-eslint/no-explicit-any */

export class ElevationModelRules {
  increment: any;
  incrementBonus: any;
  bonusCap: any;

          readIni(ini) {
            return (
              (this.increment = ini.getNumber("ElevationIncrement")),
              (this.incrementBonus = ini.getNumber("ElevationIncrementBonus", 1)),
              (this.bonusCap = ini.getNumber("ElevationBonusCap")),
              this
            );
          }
          getBonus(e, t) {
            return e <= t ? 0 : Math.min(this.bonusCap, Math.floor((e - t) / this.increment)) * this.incrementBonus;
          }
        }
