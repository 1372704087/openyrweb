// === Reconstructed SystemJS module: game/gameopts/GameOptSanitizer ===
// deps: ["util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/gameopts/GameOptSanitizer", ["util/math"], function (e, t) {
  "use strict";
  var r, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      e(
        "GameOptSanitizer",
        (i = class {
          static sanitize(e, t) {
            var i = t.mpDialogSettings;
            ((e.credits = Math.floor(r.clamp(e.credits, i.minMoney, i.maxMoney))),
              (e.gameSpeed = Math.floor(r.clamp(e.gameSpeed, 0, 6))),
              (e.unitCount = Math.floor(r.clamp(e.unitCount, i.minUnitCount, i.maxUnitCount))));
          }
        }),
      );
    },
  };
});
