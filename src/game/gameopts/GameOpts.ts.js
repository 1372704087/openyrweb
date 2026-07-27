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
        (e[(e.Easy = 2)] = "Easy"),
        (e[(e.Brutal_Ori = 3)] = "Brutal_Ori"),
        (e[(e.Medium_Ori = 4)] = "Medium_Ori"),
        (e[(e.Easy_Ori = 5)] = "Easy_Ori"));
    },
  };
});
