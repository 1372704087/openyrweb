// === Reconstructed SystemJS module: game/bot/BotsLib ===
// OpenYRWeb: BotsLib exports our in-tree IraqBot and OriginalAiBot.
// GameLoader.loadBotsLib imports this module directly,
// so the AI ships in the main ra2web.js bundle — no external sp-bots dependency.
// `version` must match the app version (GameLoader checks botsLib.version).
// deps: ["game/bot/iraq/IraqBot","game/bot/original/OriginalAiBot"]
System.register("game/bot/BotsLib", ["game/bot/iraq/IraqBot", "game/bot/original/OriginalAiBot"], function (e, t) {
  "use strict";
  var i, o;
  t && t.id;
  return {
    setters: [
      function (x) {
        i = x;
      },
      function (x) {
        o = x;
      },
    ],
    execute: function () {
      e("IraqBot", i.IraqBot);
      e("OriginalAiBot", o.OriginalAiBot);
      e("version", "0.1.0");
    },
  };
});
