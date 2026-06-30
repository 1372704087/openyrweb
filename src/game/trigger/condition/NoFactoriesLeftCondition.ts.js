// === Reconstructed SystemJS module: game/trigger/condition/NoFactoriesLeftCondition ===
// deps: ["game/trigger/TriggerCondition"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/condition/NoFactoriesLeftCondition", ["game/trigger/TriggerCondition"], function (e, t) {
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
      ((r = class extends i.TriggerCondition {
        check() {
          if (!this.player) return !1;
          for (var e of this.player.buildings) if (e.factoryTrait) return !1;
          return !0;
        }
      }),
        e("NoFactoriesLeftCondition", r));
    },
  };
});
