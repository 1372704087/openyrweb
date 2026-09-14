/**
 * ParadropRules — 空降部队规则。
 *
 * 四个阵营的空降编队（盟军/美军伞兵/苏军/尤里）：每支编队是
 * [{inf: 步兵名, num: 数量}] 的列表，Inf 列表与 Num 列表长度必须一致、
 * 数量 >0 的条目才入列；paradropPlane 指定运载机（必填，缺失即抛错）。
 * getParadropSquads 按 SideType 取对应编队（GDI→盟军、Nod→苏军、
 * ThirdSide→尤里；其余抛错）。
 *
 * 由 game/rules/general/ParadropRules.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { SideType } from "game/SideType";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ParadropRules {
  allyParaDrop: any[];
  amerParaDrop: any[];
  sovParaDrop: any[];
  yuriParaDrop: any[];
  /** 运载机单位名（必填）。 */
  paradropPlane: string;
  paradropRadius: any;

  /** 从 [General] 段读取四支编队与运载机（链式返回 this）。 */
  readIni(ini: any): this {
    this.allyParaDrop = this.readParadropSquad(
      ini.getArray("AllyParaDropInf"),
      ini.getNumberArray("AllyParaDropNum"),
      "Ally",
    );
    this.amerParaDrop = this.readParadropSquad(
      ini.getArray("AmerParaDropInf"),
      ini.getNumberArray("AmerParaDropNum"),
      "Amer",
    );
    this.sovParaDrop = this.readParadropSquad(
      ini.getArray("SovParaDropInf"),
      ini.getNumberArray("SovParaDropNum"),
      "Sov",
    );
    this.yuriParaDrop = this.readParadropSquad(
      ini.getArray("YuriParaDropInf"),
      ini.getNumberArray("YuriParaDropNum"),
      "Yuri",
    );
    this.paradropPlane = ini.getString("ParadropPlane");
    if (!this.paradropPlane) throw new Error("Missing rules [General]->ParadropPlane");
    this.paradropRadius = ini.getNumber("ParadropRadius");
    return this;
  }

  /**
   * 组装一支编队：Inf/Num 两列表一一配对，数量 >0 的条目保留为
   * {inf: 步兵名, num: 数量}；长度不一致抛 RangeError。
   */
  readParadropSquad(infantryList: any, numList: any, sideLabel: string): any[] {
    if (infantryList.length !== numList.length)
      throw new RangeError(`${sideLabel}ParaDropInf/Num size mismatch (${infantryList.length}, ${numList.length})`);
    const squads = [];
    for (let i = 0; i < infantryList.length; ++i) {
      if (numList[i] > 0) squads.push({ inf: infantryList[i], num: numList[i] });
    }
    return squads;
  }

  /** 按阵营取空降编队（GDI→盟军、Nod→苏军、ThirdSide→尤里）。 */
  getParadropSquads(side: SideType): any[] {
    switch (side) {
      case SideType.GDI:
        return this.allyParaDrop;
      case SideType.Nod:
        return this.sovParaDrop;
      case SideType.ThirdSide:
        return this.yuriParaDrop;
      default:
        throw new Error(`Unhandled side type "${side}"`);
    }
  }
}
