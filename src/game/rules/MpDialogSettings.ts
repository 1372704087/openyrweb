/**
 * MpDialogSettings — 多人对局对话框设置（开局选项的缺省值）。
 *
 * 由 game/rules/MpDialogSettings.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export class MpDialogSettings {
  minMoney: any;
  money: any;
  maxMoney: any;
  moneyIncrement: any;
  minUnitCount: any;
  unitCount: any;
  maxUnitCount: any;
  crates: any;
  gameSpeed: any;
  mcvRedeploys: any;
  shortGame: any;
  superWeapons: any;
  techLevel: any;
  alliesAllowed: any;
  allyChangeAllowed: any;
  mustAlly: any;
  bridgeDestruction: any;
  multiEngineer: any;

  /** 从 [MultiplayerDialogSettings] 段读取开局选项（链式返回 this）。 */
  readIni(ini: any): this {
    this.minMoney = ini.getNumber("MinMoney");
    this.money = ini.getNumber("Money");
    this.maxMoney = ini.getNumber("MaxMoney");
    this.moneyIncrement = ini.getNumber("MoneyIncrement");
    this.minUnitCount = ini.getNumber("MinUnitCount");
    this.unitCount = ini.getNumber("UnitCount");
    this.maxUnitCount = ini.getNumber("MaxUnitCount");
    this.crates = ini.getBool("Crates");
    this.gameSpeed = ini.getNumber("GameSpeed");
    this.mcvRedeploys = ini.getBool("MCVRedeploys");
    this.shortGame = ini.getBool("ShortGame");
    this.superWeapons = ini.getBool("SuperWeapons");
    this.techLevel = ini.getNumber("TechLevel");
    this.alliesAllowed = ini.getBool("AlliesAllowed", true);
    this.allyChangeAllowed = ini.getBool("AllyChangeAllowed", true);
    this.mustAlly = ini.getBool("MustAlly");
    this.bridgeDestruction = ini.getBool("BridgeDestruction", true);
    this.multiEngineer = ini.getBool("MultiEngineer");
    return this;
  }
}
