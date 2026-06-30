// === Reconstructed SystemJS module: engine/TheaterType ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/TheaterType", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("TheaterType", (i = {})))[(e.None = 0)] = "None"),
        (e[(e.Temperate = 1)] = "Temperate"),
        (e[(e.Urban = 2)] = "Urban"),
        (e[(e.Snow = 4)] = "Snow"),
        (e[(e.Lunar = 8)] = "Lunar"),
        (e[(e.Desert = 16)] = "Desert"),
        (e[(e.NewUrban = 32)] = "NewUrban"),
        (e[(e.All = 63)] = "All"));
    },
  };
});
