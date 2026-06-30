// === Reconstructed SystemJS module: network/ladder/PlayerRankType ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("network/ladder/PlayerRankType", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("PlayerRankType", (i = {})))[(e.None = 0)] = "None"),
        (e[(e.Private = 1)] = "Private"),
        (e[(e.Corporal = 2)] = "Corporal"),
        (e[(e.Sergeant = 3)] = "Sergeant"),
        (e[(e.Lieutenant = 4)] = "Lieutenant"),
        (e[(e.Major = 5)] = "Major"),
        (e[(e.Colonel = 6)] = "Colonel"),
        (e[(e.BrigGeneral = 7)] = "BrigGeneral"),
        (e[(e.General = 8)] = "General"),
        (e[(e.FiveStarGeneral = 9)] = "FiveStarGeneral"),
        (e[(e.CommanderInChief = 10)] = "CommanderInChief"));
    },
  };
});
