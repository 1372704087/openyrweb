// === Reconstructed SystemJS module: engine/gfx/lighting/LightingFx ===
// deps: ["data/map/MapLighting"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gfx/lighting/LightingFx", ["data/map/MapLighting"], function (t, e) {
  "use strict";
  var i, r, s;
  e && e.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      var e;
      (((e = r || t("LightingFxPriority", (r = {})))[(e.Normal = 0)] = "Normal"),
        (e[(e.High = 1)] = "High"),
        t(
          "LightingFx",
          (s = class {
            constructor() {
              ((this.priority = r.Normal), (this.mapLighting = new i.MapLighting()), (this.isRunning = !1));
            }
            update(e, t) {
              return { done: !0 };
            }
          }),
        ));
    },
  };
});
