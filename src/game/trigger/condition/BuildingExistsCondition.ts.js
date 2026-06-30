// === Reconstructed SystemJS module: game/trigger/condition/BuildingExistsCondition ===
// deps: ["game/trigger/TriggerCondition"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/condition/BuildingExistsCondition", ["game/trigger/TriggerCondition"], function (e, t) {
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
        constructor(e, t, i = !1) {
          (super(e, t), (this.negate = i), (this.objectIndex = Number(e.params[1])));
        }
        check() {
          if (!this.player) return !1;
          for (var e of this.player.buildings) if (e.rules.index === this.objectIndex) return !this.negate;
          return this.negate;
        }
      }),
        e("BuildingExistsCondition", r));
    },
  };
});
