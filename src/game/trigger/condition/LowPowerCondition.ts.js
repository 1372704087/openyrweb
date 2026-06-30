// === Reconstructed SystemJS module: game/trigger/condition/LowPowerCondition ===
// deps: ["game/trigger/TriggerCondition"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/condition/LowPowerCondition", ["game/trigger/TriggerCondition"], function (e, t) {
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
        constructor(e, t) {
          (super(e, t), (this.houseId = Number(this.event.params[1])));
        }
        init(e) {
          (super.init(e), (this.targetPlayer = e.getAllPlayers().find((e) => e.country?.id === this.houseId)));
        }
        check() {
          return !!this.targetPlayer?.powerTrait?.isLowPower();
        }
      }),
        e("LowPowerCondition", r));
    },
  };
});
