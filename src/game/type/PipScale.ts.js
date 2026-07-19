// === Reconstructed SystemJS module: game/type/PipScale ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/type/PipScale", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("PipScale", (i = {})))[(e.None = 0)] = "None"),
        (e[(e.Passengers = 1)] = "Passengers"),
        (e[(e.Ammo = 2)] = "Ammo"),
        (e[(e.Power = 3)] = "Power"),
        (e[(e.Tiberium = 4)] = "Tiberium"),
        // OpenYRWeb: MindControl pip scale — shows green/red pips for controlled targets.
        (e[(e.MindControl = 5)] = "MindControl"));
    },
  };
});
