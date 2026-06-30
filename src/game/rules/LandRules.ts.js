// === Reconstructed SystemJS module: game/rules/LandRules ===
// deps: ["game/type/SpeedType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/LandRules", ["game/type/SpeedType"], function (e, t) {
  "use strict";
  var i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      e(
        "LandRules",
        (r = class {
          constructor() {
            this.speedModifiers = new Map();
          }
          readIni(t) {
            return (
              (this.buildable = t.getBool("Buildable", !1)),
              [...t.entries.keys()].forEach((e) => {
                void 0 !== i.SpeedType[e] && this.speedModifiers.set(i.SpeedType[e], t.getNumber(e));
              }),
              this
            );
          }
          getSpeedModifier(e) {
            if (e === i.SpeedType.Foot && 0 === this.speedModifiers.get(i.SpeedType.Track)) return 0;
            let t = this.speedModifiers.get(e);
            return (void 0 === t && (t = 1), e !== i.SpeedType.Track && e !== i.SpeedType.Wheel && 0 < t && (t = 1), t);
          }
        }),
      );
    },
  };
});
