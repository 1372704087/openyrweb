// === Reconstructed SystemJS module: game/gameobject/trait/DelayedKillTrait ===
// deps: ["game/gameobject/unit/Timer","game/gameobject/trait/interface/NotifyTick"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/DelayedKillTrait",
  ["game/gameobject/unit/Timer", "game/gameobject/trait/interface/NotifyTick"],
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
            this.timer = new i.Timer();
          }
          isActive() {
            return this.timer.isActive();
          }
          activate(e, t) {
            this.isActive() || (this.timer.setActiveFor(e), (this.attackerInfo = t));
          }
          [r.NotifyTick.onTick](e, t) {
            this.timer.isActive() &&
              !0 === this.timer.tick(t.currentTick) &&
              (e.invulnerableTrait.isActive() ||
                (e.isBuilding() && e.cabHutTrait) ||
                t.destroyObject(e, this.attackerInfo, !0, !0));
          }
        }),
          e("DelayedKillTrait", s));
      },
    };
  },
);
