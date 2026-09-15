/**
 * CrateRules — 箱子规则（生成数量/半径/再生、单位箱类型、贴图与音效）。
 *
 * 由 game/rules/CrateRules.ts.js 机械重写为 TS（语句原样保留，行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */


/* eslint-disable @typescript-eslint/no-explicit-any */

export class CrateRules {
  crateMaximum: any;
  crateMinimum: any;
  crateRadius: any;
  crateRegen: any;
  unitCrateType: any;
  healCrateSound: any;
  crateImg: any;
  waterCrateImg: any;
  freeMCV: any;

          readIni(ini) {
            ((this.crateMaximum = ini.getNumber("CrateMaximum")),
              (this.crateMinimum = ini.getNumber("CrateMinimum")),
              (this.crateRadius = ini.getNumber("CrateRadius")),
              (this.crateRegen = ini.getNumber("CrateRegen")));
            let t = ini.getString("UnitCrateType");
            return (
              (this.unitCrateType = "none" !== t.toLowerCase() ? t : void 0),
              (this.healCrateSound = ini.getString("HealCrateSound")),
              (this.crateImg = ini.getString("CrateImg")),
              (this.waterCrateImg = ini.getString("WaterCrateImg")),
              (this.freeMCV = ini.getBool("FreeMCV")),
              this
            );
          }
        }
