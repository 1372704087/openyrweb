// === Reconstructed SystemJS module: game/gameobject/trait/CloakableTrait ===
// deps: ["game/event/ObjectCloakChangeEvent","game/GameSpeed","game/gameobject/trait/interface/NotifyDamage","game/gameobject/trait/interface/NotifySpawn","game/gameobject/trait/interface/NotifyTick"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/CloakableTrait",
  [
    "game/event/ObjectCloakChangeEvent",
    "game/GameSpeed",
    "game/gameobject/trait/interface/NotifyDamage",
    "game/gameobject/trait/interface/NotifySpawn",
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
          constructor(e, t) {
            ((this.gameObject = e), (this.cloakDelayMinutes = t), (this.isActive = !1), this.resetCloakCooldown());
          }
          isCloaked() {
            return this.isActive;
          }
          uncloak(e) {
            var t = this.isActive;
            (this.resetCloakCooldown(),
              t && ((this.isActive = !1), e.events.dispatch(new i.ObjectCloakChangeEvent(this.gameObject))));
          }
          resetCloakCooldown() {
            this.cooldownTicks = Math.floor(60 * this.cloakDelayMinutes * r.GameSpeed.BASE_TICKS_PER_SECOND);
          }
          [a.NotifySpawn.onSpawn](e, t) {
            this.resetCloakCooldown();
          }
          [n.NotifyTick.onTick](e, t) {
            (0 < this.cooldownTicks && this.cooldownTicks--,
              !(this.cooldownTicks <= 0) ||
                this.isActive ||
                (e.isVehicle() && e.submergibleTrait && !e.submergibleTrait.isSubmerged()) ||
                e.temporalTrait.getTarget() ||
                ((this.isActive = !0), t.events.dispatch(new i.ObjectCloakChangeEvent(this.gameObject))));
          }
          [s.NotifyDamage.onDamage](e, t) {
            this.uncloak(t);
          }
          dispose() {
            this.gameObject = void 0;
          }
        }),
          e("CloakableTrait", o));
      },
    };
  },
);
