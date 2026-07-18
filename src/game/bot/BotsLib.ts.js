// === Reconstructed SystemJS module: game/bot/BotsLib ===
// OpenYRWeb: BotsLib now exports our in-tree IraqBot and CustomAiBot.
// GameLoader.loadBotsLib imports this module directly,
// so the AI ships in the main ra2web.js bundle — no external sp-bots dependency.
// `version` must match the app version (GameLoader checks botsLib.version).
// deps: ["game/bot/iraq/IraqBot","game/bot/custom-ai/CustomAiBot"]
System.register("game/bot/BotsLib", ["game/bot/iraq/IraqBot", "game/bot/custom-ai/CustomAiBot"], function (e, t) {
  "use strict";
  var i, c;
  t && t.id;
  return {
    setters: [
      function (x) {
        i = x;
      },
      function (x) {
        c = x;
      },
    ],
    execute: function () {
      e("IraqBot", i.IraqBot);
      e("CustomAiBot", c.RA2WEBCustomBot);
      e("version", "0.1.0");
    },
  };
});
