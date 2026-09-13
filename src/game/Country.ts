/**
 * Country — 国家（阵营）运行时包装，背后是 INI 规则对象。
 *
 * RA2 里的"国家"即可选势力（美国、苏联、古巴、尤里…），在规则层是一个
 * [Countries] 段下的条目：声明所属 side、初始颜色、可玩性，以及各自的
 * 老兵单位名单。本类不复制数据，只包住规则对象提供便捷访问——rules
 * 字段就是原始 INI 解析产物（未转换前类型为 any）。
 *
 * 使用方：Player.country 持有；Player.canProduceVeteran() 调
 * hasVeteranUnit() 判断"该国家出产的此类单位是否自带老兵级"。
 *
 * 由 game/Country.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { ObjectType } from "engine/type/ObjectType";

export class Country {
  rules: any;

  constructor(rules: any) {
    this.rules = rules;
  }

  /** 按国家名从规则对象中取国家定义（GameRules 的便捷工厂）。 */
  static factory(name: string, gameRules: { getCountry(name: string): any }): Country {
    return new this(gameRules.getCountry(name));
  }

  /** 国家在 [Countries] 列表中的序号。 */
  get id(): number {
    return this.rules.id;
  }

  /** 所属阵营（SideType）：盟军/苏军/尤里/平民/变异人。 */
  get side(): number {
    return this.rules.side;
  }

  /** INI 内部名（如 "Americans"）。 */
  get name(): string {
    return this.rules.name;
  }

  /** 是否为玩家可选国家：multiplay 开且非 passive（passive 只作 AI/占位）。 */
  isPlayable(): boolean {
    return this.rules.multiplay && !this.rules.multiplayPassive;
  }

  /**
   * 判断指定类型的单位名是否在该国家的老兵级名单中
   * （规则键 VeteranAircraft/VeteranInfantry/VeteranUnits）。
   * 仅这三类参与名单，其余类型直接抛错。
   */
  hasVeteranUnit(type: ObjectType, name: string): boolean {
    let list: string[];
    switch (type) {
      case ObjectType.Aircraft:
        list = this.rules.veteranAircraft;
        break;
      case ObjectType.Infantry:
        list = this.rules.veteranInfantry;
        break;
      case ObjectType.Vehicle:
        list = this.rules.veteranUnits;
        break;
      default:
        throw new Error(`Unsupported object type "${ObjectType[type]}"`);
    }
    return list.includes(name);
  }
}
