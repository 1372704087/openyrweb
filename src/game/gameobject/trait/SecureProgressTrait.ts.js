// === Reconstructed SystemJS module: game/gameobject/trait/SecureProgressTrait ===
// deps: ["game/GameSpeed","util/math","game/event/BuildingCaptureEvent","game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/interface/NotifyOwnerChange","game/gameobject/unit/Timer"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/SecureProgressTrait",
  [
    "game/GameSpeed",
    "util/math",
    "game/event/BuildingCaptureEvent",
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/trait/interface/NotifyOwnerChange",
    "game/gameobject/unit/Timer",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o, l;
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
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
      ],
      execute: function () {
        ((l = class {
          constructor(e = 0) {
            ((this.timer = new o.Timer()),
              (this.secureTicks = Math.max(0, Math.round(60 * e * i.GameSpeed.BASE_TICKS_PER_SECOND))));
          }
          isActive() {
            return !!this.securingPlayer && this.timer.isActive();
          }
          getSecuringPlayer() {
            return this.securingPlayer;
          }
          getProgress() {
            return this.isActive() ? r.clamp(1 - this.timer.getTicksLeft() / this.timer.getInitialTicks(), 0, 1) : 0;
          }
          isActiveFrom(e) {
            return this.isActive() && this.securingPlayer === e;
          }
          start(e, t) {
            return (
              !(!e.owner.isNeutral || e.isDestroyed || this.isActiveFrom(t) || this.secureTicks <= 0) &&
              ((this.securingPlayer = t), this.timer.setActiveFor(this.secureTicks), !0)
            );
          }
          reset() {
            ((this.securingPlayer = void 0), this.timer.reset());
          }
          [a.NotifyTick.onTick](t, i) {
            if (this.isActive())
              if (!t.owner.isNeutral || t.isDestroyed || this.securingPlayer?.defeated) this.reset();
              else if (this.timer.tick(i.currentTick)) {
                let e = this.securingPlayer;
                (this.reset(),
                  e.buildingsCaptured++,
                  i.changeObjectOwner(t, e),
                  i.events.dispatch(new s.BuildingCaptureEvent(t)));
              }
          }
          [n.NotifyOwnerChange.onChange]() {
            this.reset();
          }
          getHash() {
            return r.fnv32a([
              this.isActive() ? 1 : 0,
              this.timer.getTicksLeft(),
              this.timer.getInitialTicks(),
              this.securingPlayer?.color.asHex() ?? 0,
            ]);
          }
          debugGetState() {
            return {
              active: this.isActive(),
              securingPlayer: this.securingPlayer?.name,
              ticksLeft: this.timer.getTicksLeft(),
              totalTicks: this.timer.getInitialTicks(),
            };
          }
        }),
          e("SecureProgressTrait", l));
      },
    };
  },
);
