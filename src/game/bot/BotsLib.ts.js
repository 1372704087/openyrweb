// === Reconstructed SystemJS module: game/bot/BotsLib ===
// OpenYRWeb: BotsLib now exports our in-tree IraqBot, CustomAiBot, and OriginalAiBot.
// GameLoader.loadBotsLib imports this module directly,
// so the AI ships in the main ra2web.js bundle — no external sp-bots dependency.
// `version` must match the app version (GameLoader checks botsLib.version).
// deps: ["game/bot/iraq/IraqBot","game/bot/custom-ai/CustomAiBot","game/bot/original/OriginalAiBot"]
System.register("game/bot/BotsLib", ["game/bot/iraq/IraqBot", "game/bot/custom-ai/CustomAiBot", "game/bot/original/OriginalAiBot"], function (e, t) {
  "use strict";
  var i, c, o;
  t && t.id;
  return {
    setters: [
      function (x) {
        i = x;
      },
      function (x) {
        c = x;
      },
      function (x) {
        o = x;
      },
    ],
    execute: function () {
      e("IraqBot", i.IraqBot);
      e("CustomAiBot", c.RA2WEBCustomBot);
      e("OriginalAiBot", o.OriginalAiBot);
      e("version", "0.1.0");
    },
  };
});
