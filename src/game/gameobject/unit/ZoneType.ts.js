// === Reconstructed SystemJS module: game/gameobject/unit/ZoneType ===
// deps: ["game/type/LandType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/gameobject/unit/ZoneType", ["game/type/LandType"], function (t, e) {
  "use strict";
  var i, r;
  e && e.id;
  return (
    t("getZoneType", function (e) {
      return [i.LandType.Water, i.LandType.Beach].includes(e) ? r.Water : r.Ground;
    }),
    {
      setters: [
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        var e;
        (((e = r || t("ZoneType", (r = {})))[(e.Ground = 0)] = "Ground"),
          (e[(e.Air = 1)] = "Air"),
          (e[(e.Water = 2)] = "Water"));
      },
    }
  );
});
