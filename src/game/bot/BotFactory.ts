/**
 * BotFactory — 按玩家类型与 AI 难度创建对应 Bot 实例。
 *
 * 遭遇战每个难度档位对应一个 Bot 实现：
 *   简单 → DummyBot / 原版AI(Easy)
 *   普通 → IraqBot / 原版AI(Medium)
 *   困难 → 原版AI(Brutal)
 * 战役：电脑阵营 → OriginalAiBot；人类阵营 → ScenarioTeamBot（仅脚本小队引擎）
 * （当前实现中战役 AI 亦回落 ScenarioTeamBot，见 create 内注释。）
 *
 * ⚠️ AiDifficulty 的数值同时被当作「难度档位索引」硬编码在别的模块里
 *   （0=最难 / 1=中 / 2=易，见 Game.ts:377、ReturnOreTask:184、
 *   SlaveGatherTask:504、SlaveMinerVehicleTrait:318）。
 *   因此 AiDifficulty 的成员与数值一律不得增删或重排。
 *   Brutal(0) / Easy_Custom(6) / Medium_Custom(7) 原由 custom-ai 承担，
 *   custom-ai 移除后统一回落到 OriginalAiBot —— 数值槽位保留不动，
 *   将来接自研 Bot 时只需改下面这三个 case。
 *
 * 由 game/bot/BotFactory.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { AiDifficulty } from "game/gameopts/GameOpts"; // 已转换
import { DummyBot } from "game/bot/DummyBot"; // 已转换
import { IraqBot } from "game/bot/iraq/IraqBot"; // 已转换
import { OriginalAiBot } from "game/bot/original/OriginalAiBot"; // 已转换
import { ScenarioTeamBot } from "game/bot/campaign/ScenarioTeamBot"; // 已转换

export class BotFactory {
  /** 预留：可注入 Bot 装配库（当前构造后未再读取，与孪生一致）。 */
  botsLib: any;

  constructor(botsLib: any) {
    this.botsLib = botsLib;
  }

  /**
   * 为一名战斗成员创建 Bot。
   * @param player 含 isAi / isCampaign / aiDifficulty / name / country 的玩家信息
   */
  create(player: any): any {
    // 战役人类阵营没有常规 AI，但需要脚本小队引擎
    // （CreateTeam 等触发器动作对任意阵营都可用，参考临时源码 scenarioTeamRuntime）。
    if (!player.isAi) {
      if (player.isCampaign) return new ScenarioTeamBot(player.name, player.country.name);
      throw new Error(`Player "${player.name}" is not an AI`);
    }
    // 战役 AI 不使用遭遇战 AI（OriginalAiBot / IraqBot 等），
    // 统一使用 ScenarioTeamBot —— 只执行地图/触发器创建的脚本小队，不做自主生产与进攻。
    if (player.isCampaign) return new ScenarioTeamBot(player.name, player.country.name);
    switch (player.aiDifficulty) {
      case AiDifficulty.Easy:
        return new DummyBot(player.name, player.country.name);
      case AiDifficulty.Easy_Ori:
        return new OriginalAiBot(player.name, player.country.name, "Easy");
      // custom-ai 移除后回落的三个槽位（数值保留，见文件头说明）
      case AiDifficulty.Easy_Custom:
        return new OriginalAiBot(player.name, player.country.name, "Easy");
      case AiDifficulty.Medium:
        return new IraqBot(player.name, player.country.name);
      case AiDifficulty.Medium_Ori:
        return new OriginalAiBot(player.name, player.country.name, "Medium");
      case AiDifficulty.Medium_Custom:
        return new OriginalAiBot(player.name, player.country.name, "Medium");
      case AiDifficulty.Brutal:
        return new OriginalAiBot(player.name, player.country.name, "Brutal");
      case AiDifficulty.Brutal_Ori:
        return new OriginalAiBot(player.name, player.country.name, "Brutal");
      default:
        throw new Error(`Unsupported AI difficulty "${player.aiDifficulty}"`);
    }
  }
}
