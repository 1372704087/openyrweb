// === Reconstructed SystemJS module: game/trigger/condition/AttackedByAnyCondition ===
// deps: ["game/event/EventType","game/trigger/TriggerCondition"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/condition/AttackedByAnyCondition",
  ["game/event/EventType", "game/trigger/TriggerCondition"],
  function (e, t) {
    "use strict";
    var s, i, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          s = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        ((r = class extends i.TriggerCondition {
          check(r, e) {
            return e
              .filter((e) => {
                if (e.type !== s.EventType.ObjectAttacked) return !1;
                let t = e.target;
                if (!t.isTechno() || !this.targets.includes(t)) return !1;
                var i = e.attacker?.player;
                return (!i || (!r.alliances.areAllied(i, t.owner) && i !== t.owner)) && !e.incidental;
              })
              .map((e) => e.target);
          }
        }),
          e("AttackedByAnyCondition", r));
      },
    };
  },
);
