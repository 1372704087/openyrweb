// === Reconstructed SystemJS module: game/gameobject/trait/InvulnerableTrait ===
// deps: ["game/gameobject/unit/Timer","game/gameobject/trait/interface/NotifyTick"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/InvulnerableTrait",
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
            ((this.timer = new i.Timer()),
              // OpenYRWeb: tracks whether invulnerability came from Force Shield (for visual tint).
              (this.isForceShield = !1),
              // OpenYRWeb: independent timer for Force Shield expiration (not reset by Iron Curtain).
              (this.fsTimer = new i.Timer()),
              // OpenYRWeb: version counters increment on each apply — lets renderer detect re-applies.
              (this._version = 0), (this._fsVersion = 0));
          }
          isActive() {
            return this.timer.isActive();
          }
          isForceShieldActive() {
            return this.fsTimer.isActive();
          }
          setActiveFor(e, t) {
            (this.timer.setActiveFor(e, t), (this.isForceShield = !1), this._version++);
          }
          setForceShieldActiveFor(e, t) {
            (this.fsTimer.setActiveFor(e, t), this._fsVersion++);
          }
          [r.NotifyTick.onTick](e, t) {
            (this.timer.tick(t.currentTick), this.fsTimer.tick(t.currentTick));
          }
        }),
          e("InvulnerableTrait", s));
      },
    };
  },
);
