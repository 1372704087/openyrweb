/**
 * TiberiumRules — 矿石规则（矿石价值 Value 单键包装）。
 *
 * 由 game/rules/TiberiumRules.ts.js 机械重写为 TS（语句原样保留，行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */


/* eslint-disable @typescript-eslint/no-explicit-any */

export class TiberiumRules {
  type: any;
  value: any;

          constructor(e) {
            this.type = e;
          }
          readIni(ini) {
            return ((this.value = ini.getNumber("Value")), this);
          }
        }
