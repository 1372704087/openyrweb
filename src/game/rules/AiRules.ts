/**
 * AiRules — AI 建造规则（BuildPower/BuildRefinery/BuildTech 优先表与矿车扫描半径）。
 *
 * 由 game/rules/AiRules.ts.js 机械重写为 TS（语句原样保留，行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */


/* eslint-disable @typescript-eslint/no-explicit-any */

export class AiRules {
  buildPower: any;
  buildRefinery: any;
  buildTech: any;
  tiberiumFarScan: any;
  tiberiumNearScan: any;
  aislaveMinerNumber: any;

          readIni(ini) {
            ((this.buildPower = ini.getArray("BuildPower")),
              (this.buildRefinery = ini.getArray("BuildRefinery")),
              (this.buildTech = ini.getArray("BuildTech")),
              (this.tiberiumFarScan = ini.getNumber("TiberiumFarScan", 50)),
              (this.tiberiumNearScan = ini.getNumber("TiberiumNearScan", 5)),
              (this.aislaveMinerNumber = ini.getArray("AISlaveMinerNumber", [4, 3, 2])));
          }
        }
