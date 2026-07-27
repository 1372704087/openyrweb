// === Reconstructed SystemJS module: game/bot/BotFactory ===
// OpenYRWeb: 3 个难度 × 2 种 AI = 6 个选项
//   简单 → DummyBot / 原版AI(Easy)
//   普通 → IraqBot / 原版AI(Medium)
//   困难 → CustomAiBot / 原版AI(Brutal)
// deps: ["game/gameopts/GameOpts","game/bot/DummyBot","game/bot/iraq/IraqBot","game/bot/custom-ai/CustomAiBot","game/bot/original/OriginalAiBot"]
System.register("game/bot/BotFactory", ["game/gameopts/GameOpts", "game/bot/DummyBot", "game/bot/iraq/IraqBot", "game/bot/custom-ai/CustomAiBot", "game/bot/original/OriginalAiBot"], function (e, t) {
  "use strict";
  var i, r, s, c, o;
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
    ],
    execute: function () {
      e(
        "BotFactory",
        (class {
          constructor(e) {
            this.botsLib = e;
          }
          create(e) {
            if (!e.isAi) throw new Error(`Player "${e.name}" is not an AI`);
            switch (e.aiDifficulty) {
              case i.AiDifficulty.Easy:
                return new r.DummyBot(e.name, e.country.name);
              case i.AiDifficulty.Easy_Ori:
                return new o.OriginalAiBot(e.name, e.country.name, "Easy");
              case i.AiDifficulty.Medium:
                return new s.IraqBot(e.name, e.country.name);
              case i.AiDifficulty.Medium_Ori:
                return new o.OriginalAiBot(e.name, e.country.name, "Medium");
              case i.AiDifficulty.Brutal:
                return new c.RA2WEBCustomBot(e.name, e.country.name);
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
