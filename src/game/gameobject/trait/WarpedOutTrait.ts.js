// === Reconstructed SystemJS module: game/gameobject/trait/WarpedOutTrait ===
// deps: ["game/gameobject/trait/interface/NotifyWarpChange","game/trait/interface/NotifyWarpChange","game/gameobject/trait/interface/NotifyTick"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/WarpedOutTrait",
  [
    "game/gameobject/trait/interface/NotifyWarpChange",
    "game/trait/interface/NotifyWarpChange",
    "game/gameobject/trait/interface/NotifyTick",
  ],
  function (e, t) {
    "use strict";
    var r, s, i, a;
    t && t.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        ((a = class {
          constructor(e) {
            ((this.gameObject = e),
              (this.ticksWhenWarpedOut = !0),
              (this.remainingTicks = 0),
              (this.invulnerable = !1));
          }
          isActive() {
            return 0 < this.remainingTicks;
          }
          setActive(e, t, i) {
            ((this.remainingTicks = e ? Number.POSITIVE_INFINITY : 0),
              (this.invulnerable = t),
              this.notifyChange(e, i));
          }
          setTimed(e, t, i) {
            ((this.remainingTicks = e), (this.invulnerable = t), this.notifyChange(!0, i));
          }
          debugSetActive(e) {
            this.remainingTicks = e ? Number.POSITIVE_INFINITY : 0;
          }
          notifyChange(t, i) {
            (i.traits.filter(s.NotifyWarpChange).forEach((e) => {
              e[s.NotifyWarpChange.onChange](this.gameObject, i, t);
            }),
              this.gameObject.traits.filter(r.NotifyWarpChange).forEach((e) => {
                e[r.NotifyWarpChange.onChange](this.gameObject, i, t);
              }));
          }
          expire(e) {
            ((this.remainingTicks = 0), this.notifyChange(!1, e));
          }
          isInvulnerable() {
            return this.isActive() && this.invulnerable;
          }
          [i.NotifyTick.onTick](e, t) {
            0 < this.remainingTicks && (this.remainingTicks--, this.remainingTicks <= 0 && this.notifyChange(!1, t));
          }
          dispose() {
            this.gameObject = void 0;
          }
        }),
          e("WarpedOutTrait", a));
      },
    };
  },
);
