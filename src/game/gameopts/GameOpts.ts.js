// === Reconstructed SystemJS module: game/gameopts/GameOpts ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/gameopts/GameOpts", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (t("isHumanPlayerInfo", (e) => "name" in e),
        ((e = i || t("AiDifficulty", (i = {})))[(e.Brutal = 0)] = "Brutal"),
        (e[(e.Medium = 1)] = "Medium"),
        (e[(e.Easy = 2)] = "Easy"));
    },
  };
});
