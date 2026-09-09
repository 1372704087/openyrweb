// === Reconstructed SystemJS module: game/bot/BotFactory ===
// OpenYRWeb: 3 个难度 × 3 种 AI = 9 个选项
//   简单 → DummyBot / 原版AI(Easy) / 自定义AI(简单)
//   普通 → IraqBot / 原版AI(Medium) / 自定义AI(普通)
//   困难 → CustomAiBot / 原版AI(Brutal) / 自定义AI(困难)
// 战役：电脑阵营 → OriginalAiBot；人类阵营 → ScenarioTeamBot（仅脚本小队引擎）
// deps: ["game/gameopts/GameOpts","game/bot/DummyBot","game/bot/iraq/IraqBot","game/bot/custom-ai/CustomAiBot","game/bot/original/OriginalAiBot","game/bot/campaign/ScenarioTeamBot"]
System.register("game/bot/BotFactory", ["game/gameopts/GameOpts", "game/bot/DummyBot", "game/bot/iraq/IraqBot", "game/bot/custom-ai/CustomAiBot", "game/bot/original/OriginalAiBot", "game/bot/campaign/ScenarioTeamBot"], function (e, t) {
  "use strict";
  var i, r, s, c, o, a;
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
        c = e;
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
            // OpenYRWeb: 战役人类阵营没有常规 AI，但需要脚本小队引擎
            // （CreateTeam 等触发器动作对任意阵营都可用，参考临时源码 scenarioTeamRuntime）。
            if (!e.isAi) {
              if (e.isCampaign) return new a.ScenarioTeamBot(e.name, e.country.name);
              throw new Error(`Player "${e.name}" is not an AI`);
            }
            // OpenYRWeb: 战役 AI 不使用遭遇战 AI（OriginalAiBot / CustomAiBot / IraqBot 等），
            // 统一使用 ScenarioTeamBot —— 只执行地图/触发器创建的脚本小队，不做自主生产与进攻。
            if (e.isCampaign) return new a.ScenarioTeamBot(e.name, e.country.name);
            switch (e.aiDifficulty) {
              case i.AiDifficulty.Easy:
                return new r.DummyBot(e.name, e.country.name);
              case i.AiDifficulty.Easy_Ori:
                return new o.OriginalAiBot(e.name, e.country.name, "Easy");
              case i.AiDifficulty.Easy_Custom:
                return new c.RA2WEBCustomBot(e.name, e.country.name, void 0, void 0, "Easy");
              case i.AiDifficulty.Medium:
                return new s.IraqBot(e.name, e.country.name);
              case i.AiDifficulty.Medium_Ori:
                return new o.OriginalAiBot(e.name, e.country.name, "Medium");
              case i.AiDifficulty.Medium_Custom:
                return new c.RA2WEBCustomBot(e.name, e.country.name, void 0, void 0, "Medium");
              case i.AiDifficulty.Brutal:
                return new c.RA2WEBCustomBot(e.name, e.country.name, void 0, void 0, "Brutal");
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
