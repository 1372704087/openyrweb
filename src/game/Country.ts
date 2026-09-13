/**
 * Country — 国家（阵营）运行时包装，背后是 INI 规则对象。
 *
 * 由 game/Country.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，本文件
 * 才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { ObjectType } from "engine/type/ObjectType";

export class Country {
  rules: any;

  constructor(rules: any) {
    this.rules = rules;
  }

  /** 按国家名从规则对象中取国家定义。 */
  static factory(name: string, gameRules: { getCountry(name: string): any }): Country {
    return new this(gameRules.getCountry(name));
  }

  get id(): number {
    return this.rules.id;
  }

  get side(): number {
    return this.rules.side;
  }

  get name(): string {
    return this.rules.name;
  }

  isPlayable(): boolean {
    return this.rules.multiplay && !this.rules.multiplayPassive;
  }

  /** 判断指定类型的单位名是否在该国家的老兵级名单中。 */
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
