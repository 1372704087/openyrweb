/**
 * PlayerFactory — 战斗玩家 / 观察者 / 中立玩家的构造工厂。
 *
 *  - createCombatant：完整战斗玩家（Power/Radar/SuperWeapons trait +
 *    Production + SharedDetectDisguiseTrait），并写入 isAi/aiDifficulty；
 *  - createObserver：无国家观察者，浅灰配色，雷达不禁用；
 *  - createNeutral：从规则里找 Civilian 国家，挂电力 trait。
 *
 * 由 game/player/PlayerFactory.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Player } from "game/Player"; // 已转换
import { Country } from "game/Country"; // 已转换
import { PowerTrait } from "game/player/trait/PowerTrait"; // 已转换
import { RadarTrait } from "game/player/trait/RadarTrait"; // 已转换
import { Production } from "game/player/production/Production"; // 已转换
import { SideType } from "game/SideType"; // 已转换
import { SuperWeaponsTrait } from "game/player/trait/SuperWeaponsTrait"; // 已转换
import { SharedDetectDisguiseTrait } from "game/player/trait/SharedDetectDisguiseTrait"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

export class PlayerFactory {
  /** 全局规则。 */
  rules: any;
  /** 对局选项。 */
  gameOpts: any;
  /** 可生产对象表。 */
  allAvailableObjects: any;

  constructor(rules: any, gameOpts: any, allAvailableObjects: any) {
    this.rules = rules;
    this.gameOpts = gameOpts;
    this.allAvailableObjects = allAvailableObjects;
  }

  /**
   * 创建战斗玩家。
   * @param name 玩家名
   * @param country 国家（可 undefined）
   * @param credits 初始资金
   * @param color 颜色
   * @param isAi 是否 AI
   * @param aiDifficulty AI 难度
   */
  createCombatant(name: string, country: any, credits: number, color: any, isAi: boolean, aiDifficulty: any): any {
    // Player 类型未声明运行时挂载的 trait 字段——用 any 承接与孪生一致的动态赋值。
    const player: any = new Player(name, country, credits, color);
    player.isAi = isAi;
    player.aiDifficulty = aiDifficulty;
    player.powerTrait = new PowerTrait(player);
    player.traits.add(player.powerTrait);
    player.radarTrait = new RadarTrait();
    player.traits.add(player.radarTrait);
    player.superWeaponsTrait = new SuperWeaponsTrait();
    player.traits.add(player.superWeaponsTrait);
    player.production = Production.factory(player, this.rules, this.gameOpts, this.allAvailableObjects);
    player.sharedDetectDisguiseTrait = new SharedDetectDisguiseTrait();
    return player;
  }

  /** 创建观察者（无国家、浅灰、雷达不禁用）。入参为 Rules，经 colors 取色。 */
  createObserver(name: string, rules: any): any {
    const observer: any = new Player(name, undefined, undefined, rules.colors.get("LightGrey"));
    observer.radarTrait = new RadarTrait();
    observer.traits.add(observer.radarTrait);
    observer.radarTrait.setDisabled(false);
    return observer;
  }

  /**
   * 创建中立玩家（规则中 side===Civilian 的国家）。
   * @throws 规则里找不到民用侧国家
   */
  createNeutral(rules: any, name: string): any {
    const countryRules = [...rules.countryRules.values()].find((c: any) => c.side === SideType.Civilian);
    if (!countryRules) {
      throw new Error("Missing neutral country. No country found in rules with Civilian side");
    }
    const country = new Country(countryRules);
    const neutral: any = new Player(name, country, undefined, rules.colors.get("LightGrey"));
    neutral.powerTrait = new PowerTrait(neutral);
    neutral.traits.add(neutral.powerTrait);
    return neutral;
  }
}
