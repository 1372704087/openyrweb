// === Reconstructed SystemJS module: game/SuperWeapon ===
// deps: ["game/event/SuperWeaponReadyEvent","game/GameSpeed"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/SuperWeapon", ["game/event/SuperWeaponReadyEvent", "game/GameSpeed"], function (t, e) {
  "use strict";
  var i, s, a, r;
  e && e.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
      function (e) {
        s = e;
      },
    ],
    execute: function () {
      var e;
      (((e = a || t("SuperWeaponStatus", (a = {})))[(e.Charging = 0)] = "Charging"),
        (e[(e.Paused = 1)] = "Paused"),
        (e[(e.Ready = 2)] = "Ready"),
        t(
          "SuperWeapon",
          (r = class {
            constructor(e, t, i, r = !1) {
              ((this.name = e),
                (this.rules = t),
                (this.owner = i),
                (this.oneTimeOnly = r),
                (this.status = a.Charging),
                (this.isGift = !1),
                (this.rechargeTicks = 60 * t.rechargeTime * s.GameSpeed.BASE_TICKS_PER_SECOND),
                (this.chargeTicks = this.rechargeTicks),
                r && ((this.status = a.Ready), (this.chargeTicks = 0)));
            }
            update(e) {
              0 < this.chargeTicks &&
                this.status !== a.Paused &&
                (this.chargeTicks--,
                0 === this.chargeTicks &&
                  ((this.status = a.Ready), e.events.dispatch(new i.SuperWeaponReadyEvent(this))));
            }
            pauseTimer() {
              this.status = a.Paused;
            }
            resumeTimer() {
              this.status = 0 < this.chargeTicks ? a.Charging : a.Ready;
            }
            resetTimer() {
              ((this.chargeTicks = this.rechargeTicks), this.status === a.Ready && (this.status = a.Charging));
            }
            getTimerSeconds() {
              return this.chargeTicks / s.GameSpeed.BASE_TICKS_PER_SECOND;
            }
            getChargeProgress() {
              return (this.rechargeTicks - this.chargeTicks) / this.rechargeTicks;
            }
          }),
        ));
    },
  };
});
