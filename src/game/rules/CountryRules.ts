/**
 * CountryRules — 国家规则（[Countries] 段条目）。
 *
 * 一个国家 = 一个可玩势力（美国/苏联/古巴/尤里…）：所属阵营（Side）、
 * 可玩性（Multiplay/MultiplayPassive）与该国家的老兵单位名单。
 * 两张静态表：
 *  - SIDES_BY_NAME     ：[Countries] 条目的 Side= 字符串 → SideType；
 *  - DEFAULT_UI_TOOLTIPS：未写 UITooltip 时，十个原版国家的默认 Tooltip
 *    文案键（STT: 前缀 = 本地化字符串表键）。
 *
 * 由 game/rules/CountryRules.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { SideType } from "game/SideType";

/** Side= 字符串 → 阵营枚举。 */
const SIDES_BY_NAME = new Map<string, SideType>()
  .set("GDI", SideType.GDI)
  .set("Nod", SideType.Nod)
  .set("Civilian", SideType.Civilian)
  .set("Mutant", SideType.Mutant)
  .set("ThirdSide", SideType.ThirdSide);

/** 原版国家的默认 Tooltip 文案键（规则未写 UITooltip 时回落）。 */
const DEFAULT_UI_TOOLTIPS = new Map<string, string>([
  ["Americans", "STT:PlayerSideAmerica"],
  ["Alliance", "STT:PlayerSideKorea"],
  ["French", "STT:PlayerSideFrance"],
  ["Germans", "STT:PlayerSideGermany"],
  ["British", "STT:PlayerSideBritain"],
  ["Africans", "STT:PlayerSideLibya"],
  ["Arabs", "STT:PlayerSideIraq"],
  ["Confederation", "STT:PlayerSideCuba"],
  ["Russians", "STT:PlayerSideRussia"],
  ["YuriCountry", "STT:PlayerSideYuriCountry"],
]);

/* eslint-disable @typescript-eslint/no-explicit-any */
export class CountryRules {
  /** [Countries] 列表序号。 */
  id: any;

  constructor(id: any) {
    this.id = id;
  }

  name: any;
  uiName: any;
  uiTooltip: any;
  side: SideType;
  multiplay: any;
  multiplayPassive: any;
  veteranAircraft: any;
  veteranInfantry: any;
  veteranUnits: any;

  /** 从国家段落读取规则；Side= 缺失或未登记时抛错。 */
  readIni(ini: any): void {
    this.name = ini.name;
    this.uiName = ini.getString("UIName");
    this.uiTooltip = ini.getString("UITooltip") || DEFAULT_UI_TOOLTIPS.get(this.name);
    const side = ini.getString("Side");
    if (!side) throw new Error(`Missing Side for country "${this.name}"`);
    const mapped = SIDES_BY_NAME.get(side);
    if (mapped === undefined) throw new Error(`Unknown side "${side}" for country "${this.name}"`);
    this.side = mapped;
    this.multiplay = ini.getBool("Multiplay");
    this.multiplayPassive = ini.getBool("MultiplayPassive");
    this.veteranAircraft = ini.getArray("VeteranAircraft");
    this.veteranInfantry = ini.getArray("VeteranInfantry");
    this.veteranUnits = ini.getArray("VeteranUnits");
  }
}
