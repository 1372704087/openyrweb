// === Reconstructed SystemJS module: network/gamestate/lockstepUtil ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("network/gamestate/lockstepUtil", [], function (e, t) {
  "use strict";
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e("computeNetworkTurnMillis", (e, t) => {
        return Math.max(1, Math.ceil(e / t)) * t;
      });
    },
  };
});
