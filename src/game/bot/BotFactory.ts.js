// === Reconstructed SystemJS module: game/bot/BotFactory ===
// OpenYRWeb: Easy → DummyBot；Medium → IraqBot（竞技级伊拉克 1v1 AI，内置于主 bundle）。
// Brutal → CustomAiBot（基于 ra2web-custom-ai 的多任务 AI，支持生产/任务/海军/侦查）。
// deps: ["game/gameopts/GameOpts","game/bot/DummyBot","game/bot/iraq/IraqBot","game/bot/custom-ai/CustomAiBot"]
System.register("game/bot/BotFactory", ["game/gameopts/GameOpts", "game/bot/DummyBot", "game/bot/iraq/IraqBot", "game/bot/custom-ai/CustomAiBot"], function (e, t) {
  "use strict";
  var i, r, s, c;
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
              case i.AiDifficulty.Medium:
                // IraqBot — 竞技级伊拉克纯犀牛流 AI
                return new s.IraqBot(e.name, e.country.name);
              case i.AiDifficulty.Brutal:
                // CustomAiBot — 多任务 AI（支持建筑队列/任务系统/海军/侦查）
                return new c.RA2WEBCustomBot(e.name, e.country.name);
              default:
                throw new Error(`Unsupported AI difficulty "${e.aiDifficulty}"`);
            }
          }
        }),
      );
    },
  };
});
