// === Reconstructed SystemJS module: game/gameobject/trait/CastProgressTrait ===
// deps: ["game/GameSpeed","util/math","game/gameobject/unit/Timer","game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/interface/NotifyTeleport","game/gameobject/trait/interface/NotifyOwnerChange"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/CastProgressTrait",
  [
    "game/GameSpeed",
    "util/math",
    "game/gameobject/unit/Timer",
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/trait/interface/NotifyTeleport",
    "game/gameobject/trait/interface/NotifyOwnerChange",
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
          constructor() {
            ((this.timer = new s.Timer()), (this.completed = !1));
          }
          isCasting() {
            return this.timer.isActive();
          }
          isCompleted() {
            return this.completed;
          }
          getProgress() {
            return this.completed
              ? 1
              : this.timer.isActive()
                ? r.clamp(1 - this.timer.getTicksLeft() / this.timer.getInitialTicks(), 0, 1)
                : 0;
          }
          start(e) {
            var t;
            this.completed ||
              this.timer.isActive() ||
              (t = Math.max(0, Math.round(e * i.GameSpeed.BASE_TICKS_PER_SECOND))) <= 0 ||
              this.timer.setActiveFor(t);
          }
          reset() {
            ((this.completed = !1), this.timer.reset());
          }
          [a.NotifyTick.onTick](e, t) {
            this.timer.isActive() && !0 === this.timer.tick(t.currentTick) && (this.completed = !0);
          }
          [n.NotifyTeleport.onBeforeTeleport]() {
            this.reset();
          }
          [o.NotifyOwnerChange.onChange]() {
            this.reset();
          }
          getHash() {
            return r.fnv32a([this.timer.getTicksLeft(), this.timer.getInitialTicks(), this.completed ? 1 : 0]);
          }
          debugGetState() {
            return {
              ticksLeft: this.timer.getTicksLeft(),
              totalTicks: this.timer.getInitialTicks(),
              completed: this.completed,
            };
          }
        }),
          e("CastProgressTrait", l));
      },
    };
  },
);
