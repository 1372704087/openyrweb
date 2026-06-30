// === Reconstructed SystemJS module: game/gameobject/trait/IdleActionTrait ===
// deps: ["game/gameobject/trait/interface/NotifyTick","game/gameobject/task/ScatterTask","game/GameSpeed"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/IdleActionTrait",
  ["game/gameobject/trait/interface/NotifyTick", "game/gameobject/task/ScatterTask", "game/GameSpeed"],
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
            ((this.cooldownTicks = Number.POSITIVE_INFINITY), (this._actionDueThisTick = !1));
          }
          [i.NotifyTick.onTick](e, t) {
            this._actionDueThisTick = !1;
            var i = !e.unitOrderTrait.hasTasks();
            (i && !this.idle
              ? this.resetCooldown(t)
              : i
                ? 0 === this.cooldownTicks
                  ? (this.doIdleAction(e, t), this.resetCooldown(t))
                  : this.cooldownTicks--
                : (this.cooldownTicks = Number.POSITIVE_INFINITY),
              (this.idle = i));
          }
          doIdleAction(e, t) {
            if (e.isInfantry()) {
              if (e.rules.fraidycat)
                if (e.owner.isNeutral && 0.5 < t.generateRandom())
                  return void e.unitOrderTrait.addTask(new r.ScatterTask(t, void 0, { noSlopes: !0 }));
              this._actionDueThisTick = !0;
            }
          }
          actionDueThisTick() {
            return this._actionDueThisTick;
          }
          resetCooldown(e) {
            var t = e.rules.audioVisual.idleActionFrequency,
              i = e.generateRandom() * t * 0.5,
              i = Math.max(0, t - i);
            this.cooldownTicks = Math.floor(i * s.GameSpeed.BASE_TICKS_PER_SECOND);
          }
        }),
          e("IdleActionTrait", a));
      },
    };
  },
);
