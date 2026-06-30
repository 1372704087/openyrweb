// === Reconstructed SystemJS module: game/gameobject/unit/CollisionType ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/gameobject/unit/CollisionType", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("CollisionType", (i = {})))[(e.None = 0)] = "None"),
        (e[(e.Ground = 1)] = "Ground"),
        (e[(e.Wall = 2)] = "Wall"),
        (e[(e.Cliff = 3)] = "Cliff"),
        (e[(e.OnBridge = 4)] = "OnBridge"),
        (e[(e.UnderBridge = 5)] = "UnderBridge"),
        (e[(e.Shore = 6)] = "Shore"));
    },
  };
});
