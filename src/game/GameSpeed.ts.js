// === Reconstructed SystemJS module: game/GameSpeed ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/GameSpeed", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      (e(
        "GameSpeed",
        (i = class i {
          static computeGameSpeed(e) {
            let t;
            return ((t = 6 === e ? 60 : 5 === e ? 45 : 60 / (6 - e)), t / i.BASE_TICKS_PER_SECOND);
          }
        }),
      ),
        (i.BASE_TICKS_PER_SECOND = 15));
    },
  };
});
