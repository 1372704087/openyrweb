// === Reconstructed SystemJS module: game/trigger/condition/AttackedByHouseCondition ===
// deps: ["game/event/EventType","game/trigger/TriggerCondition"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/condition/AttackedByHouseCondition",
  ["game/event/EventType", "game/trigger/TriggerCondition"],
  function (e, t) {
    "use strict";
    var r, i, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        ((s = class extends i.TriggerCondition {
          constructor(e, t) {
            (super(e, t), (this.houseId = Number(e.params[1])));
          }
          check(e, t) {
            return t
              .filter((e) => {
                if (e.type !== r.EventType.ObjectAttacked) return !1;
                let t = e.target;
                if (!t.isTechno() || !this.targets.includes(t)) return !1;
                var i = e.attacker?.player;
                return i && (-1 === this.houseId || i?.country?.id === this.houseId);
              })
              .map((e) => e.target);
          }
        }),
          e("AttackedByHouseCondition", s));
      },
    };
  },
);
