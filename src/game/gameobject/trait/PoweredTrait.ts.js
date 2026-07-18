// === Reconstructed SystemJS module: game/gameobject/trait/PoweredTrait ===
// deps: ["game/player/trait/PowerTrait"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/gameobject/trait/PoweredTrait", ["game/player/trait/PowerTrait"], function (e, t) {
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
      e(
        "PoweredTrait",
        (r = class {
          constructor(e) {
            ((this.obj = e), (this.turnedOn = !0));
          }
          setTurnedOn(e) {
            this.turnedOn = e;
          }
          isCharged() {
            return !!this.obj.isBuilding() && !!this.obj.overpoweredTrait?.hasChargersToPowerOn();
          }
          isPoweredOn(e = !1) {
              // OpenYRWeb: a building being drained by a Floating Disc (drainedBy set) is treated
              // as unpowered while the disc is attached — vanilla disables drained base defenses
              // and power plants. Refineries / slave miners keep working (they only lose money).
              // The disc clears drainedBy when it retargets/dies.
              if (this.obj && this.obj.drainedBy && !this.obj.rules.refinery) return !1;
              return (
              !(!this.obj || !this.turnedOn) &&
              (!(e || !this.isCharged()) ||
                (!this.obj.rules.power && this.obj.rules.needsEngineer
                  ? !this.obj.owner.isNeutral
                  : !!this.obj.owner.powerTrait && this.obj.owner.powerTrait?.level !== i.PowerLevel.Low))
            );
          }
          dispose() {
            this.obj = void 0;
          }
        }),
      );
    },
  };
});
