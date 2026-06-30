// === Reconstructed SystemJS module: game/trigger/condition/SpiedByCondition ===
// deps: ["game/event/EventType","game/trigger/TriggerCondition"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/condition/SpiedByCondition",
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
          constructor(e, t) {
            (super(e, t), (this.houseId = Number(this.event.params[1])));
          }
          check(e, t) {
            return t
              .filter(
                (e) =>
                  e.type === i.EventType.BuildingInfiltration &&
                  this.targets.includes(e.target) &&
                  (-1 === this.houseId || e.source.owner.country?.id === this.houseId),
              )
              .map((e) => e.target);
          }
        }),
          e("SpiedByCondition", s));
      },
    };
  },
);
