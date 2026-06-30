// === Reconstructed SystemJS module: gui/screen/options/GraphicsOptions ===
// deps: ["engine/renderable/entity/unit/ModelQuality","engine/renderable/entity/unit/ShadowQuality","util/BoxedVar"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/options/GraphicsOptions",
  ["engine/renderable/entity/unit/ModelQuality", "engine/renderable/entity/unit/ShadowQuality", "util/BoxedVar"],
  function (e, t) {
    "use strict";
    var i, r, s, a;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        e(
          "GraphicsOptions",
          (a = class {
            constructor() {
              ((this.resolution = new s.BoxedVar(void 0)),
                (this.models = new s.BoxedVar(i.ModelQuality.High)),
                (this.shadows = new s.BoxedVar(r.ShadowQuality.High)));
            }
            unserialize(e) {
              let [t, i, r] = e.split(",");
              var s;
              return (
                (this.models.value = Number(t)),
                (this.shadows.value = Number(i)),
                void 0 !== r &&
                  ((s = r.length ? r.split("x").map((e) => Number(e)) : void 0),
                  (this.resolution.value = s ? { width: s[0], height: s[1] } : void 0)),
                this
              );
            }
            serialize() {
              return [
                this.models.value,
                this.shadows.value,
                this.resolution.value ? [this.resolution.value.width, this.resolution.value.height].join("x") : "",
              ].join(",");
            }
            applyLowPreset() {
              ((this.models.value = i.ModelQuality.Low), (this.shadows.value = r.ShadowQuality.Low));
            }
            applyHighPreset() {
              ((this.models.value = i.ModelQuality.High), (this.shadows.value = r.ShadowQuality.High));
            }
          }),
        );
      },
    };
  },
);
