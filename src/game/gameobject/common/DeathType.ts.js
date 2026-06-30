// === Reconstructed SystemJS module: game/gameobject/common/DeathType ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/gameobject/common/DeathType", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("DeathType", (i = {})))[(e.None = 0)] = "None"),
        (e[(e.Normal = 1)] = "Normal"),
        (e[(e.Demolish = 2)] = "Demolish"),
        (e[(e.Crush = 3)] = "Crush"),
        (e[(e.Temporal = 4)] = "Temporal"),
        (e[(e.Sink = 5)] = "Sink"));
    },
  };
});
