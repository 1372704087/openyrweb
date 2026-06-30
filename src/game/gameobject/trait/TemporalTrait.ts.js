// === Reconstructed SystemJS module: game/gameobject/trait/TemporalTrait ===
// deps: ["game/gameobject/common/DeathType","game/gameobject/task/AttackTask","game/gameobject/task/move/MoveTask","game/gameobject/trait/interface/NotifyDestroy","game/gameobject/trait/interface/NotifyTick"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/TemporalTrait",
  [
    "game/gameobject/common/DeathType",
    "game/gameobject/task/AttackTask",
    "game/gameobject/task/move/MoveTask",
    "game/gameobject/trait/interface/NotifyDestroy",
    "game/gameobject/trait/interface/NotifyTick",
  ],
  function (e, t) {
    "use strict";
    var a, s, n, i, r, o;
    t && t.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        ((o = class {
          constructor(e) {
            ((this.gameObject = e), (this.ticksWhenWarpedOut = !0), (this.attackers = new Set()));
          }
          [r.NotifyTick.onTick](e, t) {
            if (
              (e.attackTrait &&
                ((e.attackTrait.currentTarget && !e.warpedOutTrait.isActive()) || this.releaseCurrentTarget(t)),
              void 0 !== this.eraseTicks)
            )
              for (var i of this.attackers) {
                var r = i.temporalTrait.currentWeapon;
                if (!r) throw new Error(`Attacker "${i.name}" is no longer targeting "${e.name}"`);
                var s = r.rules.damage;
                if (((this.eraseTicks -= s), this.eraseTicks <= 0)) {
                  ((e.deathType = a.DeathType.Temporal),
                    t.destroyObject(e, { player: i.owner, obj: i, weapon: r }, !0),
                    (this.eraseTicks = void 0));
                  break;
                }
              }
          }
          getTarget() {
            return this.currentTarget;
          }
          updateTarget(t, e, i) {
            if (this.currentTarget !== t) {
              (this.releaseCurrentTarget(i), (this.currentTarget = t), (this.currentWeapon = e));
              var r = t.temporalTrait.attackers.size;
              if ((t.temporalTrait.attackers.add(this.gameObject), !r)) {
                t.warpedOutTrait.setActive(!0, !0, i);
                let e = t.unitOrderTrait.getCurrentTask();
                (((e && e instanceof s.AttackTask) || e instanceof n.MoveTask) && e.cancel(),
                  (t.temporalTrait.eraseTicks = 10 * t.healthTrait.maxHitPoints));
              }
            }
          }
          releaseCurrentTarget(t) {
            if (this.currentTarget) {
              if (!this.currentTarget.isDisposed) {
                let e = this.currentTarget.temporalTrait.attackers;
                (e.delete(this.gameObject),
                  e.size ||
                    (this.currentTarget.warpedOutTrait.expire(t),
                    (this.currentTarget.temporalTrait.eraseTicks = void 0)));
              }
              ((this.currentTarget = void 0), (this.currentWeapon = void 0));
            }
          }
          [i.NotifyDestroy.onDestroy](e, t) {
            this.releaseCurrentTarget(t);
          }
          dispose() {
            ((this.gameObject = void 0), this.attackers.clear());
          }
        }),
          e("TemporalTrait", o));
      },
    };
  },
);
