// === Reconstructed SystemJS module: game/bot/BotsLib ===
// OpenYRWeb: BotsLib now exports our in-tree IraqBot (replaces the external
// spbots.min.js bundle). GameLoader.loadBotsLib imports this module directly,
// so the AI ships in the main ra2web.js bundle — no external sp-bots dependency.
// `version` must match the app version (GameLoader checks botsLib.version).
// deps: ["game/bot/iraq/IraqBot"]
System.register("game/bot/BotsLib", ["game/bot/iraq/IraqBot"], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [
      function (x) {
        i = x;
      },
    ],
    execute: function () {
      e("IraqBot", i.IraqBot);
      e("version", "0.1.0");
    },
  };
});
