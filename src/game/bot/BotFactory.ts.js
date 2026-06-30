// === Reconstructed SystemJS module: game/bot/BotFactory ===
// OpenYRWeb: Easy → DummyBot；Medium → IraqBot（竞技级伊拉克 1v1 AI，内置于主 bundle）。
// Brutal 保持未实现（原型阶段不处理，沿用原 throw 行为）。
// deps: ["game/gameopts/GameOpts","game/bot/DummyBot","game/bot/iraq/IraqBot"]
System.register("game/bot/BotFactory", ["game/gameopts/GameOpts", "game/bot/DummyBot", "game/bot/iraq/IraqBot"], function (e, t) {
  "use strict";
  var i, r, s;
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
              default:
                // Brutal 保持未实现（原型阶段不处理）
                throw new Error(`Unsupported AI difficulty "${e.aiDifficulty}"`);
            }
          }
        }),
      );
    },
  };
});
