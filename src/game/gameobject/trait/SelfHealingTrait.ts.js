// === Reconstructed SystemJS module: game/gameobject/trait/SelfHealingTrait ===
// deps: ["game/gameobject/trait/interface/NotifyTick","game/GameSpeed"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/SelfHealingTrait",
  ["game/gameobject/trait/interface/NotifyTick", "game/GameSpeed"],
  function (e, t) {
    "use strict";
    var i, r, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        ((s = class {
          constructor() {
            this.cooldownTicks = 0;
          }
          [i.NotifyTick.onTick](e, t) {
            100 !== e.healthTrait.health &&
              (this.cooldownTicks <= 0
                ? ((this.cooldownTicks += r.GameSpeed.BASE_TICKS_PER_SECOND * t.rules.general.repair.repairRate * 60),
                  e.healthTrait.healBy(1, e, t))
                : this.cooldownTicks--);
          }
        }),
          e("SelfHealingTrait", s));
      },
    };
  },
);
