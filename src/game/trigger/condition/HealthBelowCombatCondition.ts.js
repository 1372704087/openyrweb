// === Reconstructed SystemJS module: game/trigger/condition/HealthBelowCombatCondition ===
// deps: ["game/event/EventType","game/trigger/TriggerCondition"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/condition/HealthBelowCombatCondition",
  ["game/event/EventType", "game/trigger/TriggerCondition"],
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
        ((s = class extends r.TriggerCondition {
          constructor(e, t, i) {
            (super(e, t), (this.threshold = i));
          }
          check(e, t) {
            return t
              .filter((e) => {
                if (e.type !== i.EventType.InflictDamage) return !1;
                let t = e.target;
                return (
                  !(!t.isTechno() || !this.targets.includes(t)) &&
                  e.currentHealth < this.threshold &&
                  e.prevHealth > this.threshold
                );
              })
              .map((e) => e.target);
          }
        }),
          e("HealthBelowCombatCondition", s));
      },
    };
  },
);
