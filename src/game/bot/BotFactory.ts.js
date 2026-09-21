// === Reconstructed SystemJS module: game/bot/BotFactory ===
// 遭遇战每个难度档位对应一个 Bot 实现
//   简单 → DummyBot / 原版AI(Easy)
//   普通 → IraqBot / 原版AI(Medium)
//   困难 → 原版AI(Brutal)
// 战役：电脑阵营 → OriginalAiBot；人类阵营 → ScenarioTeamBot（仅脚本小队引擎）
//
// ⚠️ AiDifficulty 的数值同时被当作「难度档位索引」硬编码在别的模块里
//   （0=最难 / 1=中 / 2=易，见 Game.ts:377、ReturnOreTask:184、
//   SlaveGatherTask:504、SlaveMinerVehicleTrait:318）。
//   因此 AiDifficulty 的成员与数值一律不得增删或重排。
//   Brutal(0) / Easy_Custom(6) / Medium_Custom(7) 原由 custom-ai 承担，
//   custom-ai 移除后统一回落到 OriginalAiBot —— 数值槽位保留不动，
//   将来接自研 Bot 时只需改下面这三个 case。
// deps: ["game/gameopts/GameOpts","game/bot/DummyBot","game/bot/iraq/IraqBot","game/bot/original/OriginalAiBot","game/bot/campaign/ScenarioTeamBot"]
System.register("game/bot/BotFactory", ["game/gameopts/GameOpts", "game/bot/DummyBot", "game/bot/iraq/IraqBot", "game/bot/original/OriginalAiBot", "game/bot/campaign/ScenarioTeamBot"], function (e, t) {
  "use strict";
  var i, r, s, o, a;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
      function (e) {
        r = e;
      },
      function (e) {
        s = e;
      },
      function (e) {
        o = e;
      },
      function (e) {
        a = e;
      },
    ],
    execute: function () {
      e(
        "BotFactory",
        (class {
          constructor(e) {
            this.botsLib = e;
          }
          create(e) {
            // 战役人类阵营没有常规 AI，但需要脚本小队引擎
            // （CreateTeam 等触发器动作对任意阵营都可用，参考临时源码 scenarioTeamRuntime）。
            if (!e.isAi) {
              if (e.isCampaign) return new a.ScenarioTeamBot(e.name, e.country.name);
              throw new Error(`Player "${e.name}" is not an AI`);
            }
            // 战役 AI 不使用遭遇战 AI（OriginalAiBot / IraqBot 等），
            // 统一使用 ScenarioTeamBot —— 只执行地图/触发器创建的脚本小队，不做自主生产与进攻。
            if (e.isCampaign) return new a.ScenarioTeamBot(e.name, e.country.name);
            switch (e.aiDifficulty) {
              case i.AiDifficulty.Easy:
                return new r.DummyBot(e.name, e.country.name);
              case i.AiDifficulty.Easy_Ori:
                return new o.OriginalAiBot(e.name, e.country.name, "Easy");
              // custom-ai 移除后回落的三个槽位（数值保留，见文件头说明）
              case i.AiDifficulty.Easy_Custom:
                return new o.OriginalAiBot(e.name, e.country.name, "Easy");
              case i.AiDifficulty.Medium:
                return new s.IraqBot(e.name, e.country.name);
              case i.AiDifficulty.Medium_Ori:
                return new o.OriginalAiBot(e.name, e.country.name, "Medium");
              case i.AiDifficulty.Medium_Custom:
                return new o.OriginalAiBot(e.name, e.country.name, "Medium");
              case i.AiDifficulty.Brutal:
                return new o.OriginalAiBot(e.name, e.country.name, "Brutal");
              case i.AiDifficulty.Brutal_Ori:
                return new o.OriginalAiBot(e.name, e.country.name, "Brutal");
              default:
                throw new Error(`Unsupported AI difficulty "${e.aiDifficulty}"`);
            }
          }
        }),
      );
    },
  };
});
