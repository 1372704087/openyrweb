// === Reconstructed SystemJS module: game/gameobject/trait/OilDerrickTrait ===
// deps: ["game/gameobject/trait/interface/NotifyOwnerChange","game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/interface/NotifySpawn"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/OilDerrickTrait",
  [
    "game/gameobject/trait/interface/NotifyOwnerChange",
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/trait/interface/NotifySpawn",
  ],
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
        ((a = class {
          constructor() {
            ((this.isActive = !1), (this.produceCashCooldown = 0));
          }
          [s.NotifySpawn.onSpawn](e) {
            e.owner.isNeutral || (this.isActive = !0);
          }
          [i.NotifyOwnerChange.onChange](e, t) {
            t.isNeutral &&
              !e.owner.isNeutral &&
              ((e.owner.credits = Math.max(0, e.owner.credits + e.rules.produceCashStartup)),
              0 < e.rules.produceCashStartup && (e.owner.creditsGained += e.rules.produceCashStartup),
              (this.isActive = !0),
              (this.produceCashCooldown = e.rules.produceCashDelay));
          }
          [r.NotifyTick.onTick](e) {
            this.isActive &&
              (this.produceCashCooldown--,
              this.produceCashCooldown <= 0 &&
                ((this.produceCashCooldown = e.rules.produceCashDelay),
                (e.owner.credits = Math.max(0, e.owner.credits + e.rules.produceCashAmount)),
                0 < e.rules.produceCashAmount && (e.owner.creditsGained += e.rules.produceCashAmount)));
          }
        }),
          e("OilDerrickTrait", a));
      },
    };
  },
);
