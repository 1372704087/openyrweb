// === Reconstructed SystemJS module: game/gameobject/trait/SubmergibleTrait ===
// deps: ["game/event/ShipSubmergeChangeEvent","game/GameSpeed","game/gameobject/trait/AttackTrait","game/gameobject/trait/interface/NotifyDamage","game/gameobject/trait/interface/NotifyTick"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/SubmergibleTrait",
  [
    "game/event/ShipSubmergeChangeEvent",
    "game/GameSpeed",
    "game/gameobject/trait/AttackTrait",
    "game/gameobject/trait/interface/NotifyDamage",
    "game/gameobject/trait/interface/NotifyTick",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o;
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
      ],
      execute: function () {
        ((o = class {
          constructor() {
            this.isActive = !1;
          }
          isSubmerged() {
            return this.isActive;
          }
          setCooldown(e) {
            this.cooldownTicks = e;
          }
          [n.NotifyTick.onTick](e, t) {
            this.isActive ||
              e.parasiteableTrait?.isInfested() ||
              (e.attackTrait && e.attackTrait.attackState !== s.AttackState.Idle && !e.moveTrait.isMoving()
                ? (this.cooldownTicks = Math.max(this.cooldownTicks ?? 0, 5 * r.GameSpeed.BASE_TICKS_PER_SECOND))
                : (this.cooldownTicks ??
                  (this.cooldownTicks = Math.floor(
                    60 * t.rules.general.cloakDelay * r.GameSpeed.BASE_TICKS_PER_SECOND,
                  ))),
              0 < this.cooldownTicks && this.cooldownTicks--,
              this.cooldownTicks <= 0 && ((this.isActive = !0), t.events.dispatch(new i.ShipSubmergeChangeEvent(e))));
          }
          [a.NotifyDamage.onDamage](e, t) {
            this.emerge(e, t);
          }
          emerge(e, t) {
            this.isActive &&
              ((this.isActive = !1),
              (this.cooldownTicks = void 0),
              t.events.dispatch(new i.ShipSubmergeChangeEvent(e)));
          }
        }),
          e("SubmergibleTrait", o));
      },
    };
  },
);
