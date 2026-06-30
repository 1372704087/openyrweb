// === Reconstructed SystemJS module: game/ini/GameModeType ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/ini/GameModeType", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("GameModeType", (i = {})))[(e.Battle = 0)] = "Battle"),
        (e[(e.ManBattle = 1)] = "ManBattle"),
        (e[(e.FreeForAll = 2)] = "FreeForAll"),
        (e[(e.Unholy = 3)] = "Unholy"),
        (e[(e.Cooperative = 4)] = "Cooperative"));
    },
  };
});
