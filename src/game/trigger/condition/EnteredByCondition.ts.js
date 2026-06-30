// === Reconstructed SystemJS module: game/trigger/condition/EnteredByCondition ===
// deps: ["game/event/EventType","game/gameobject/unit/ZoneType","game/trigger/TriggerCondition"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/condition/EnteredByCondition",
  ["game/event/EventType", "game/gameobject/unit/ZoneType", "game/trigger/TriggerCondition"],
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
        ((a = class extends s.TriggerCondition {
          constructor(e, t) {
            (super(e, t), (this.houseId = Number(this.event.params[1])));
          }
          check(e, t) {
            return t
              .filter(
                (e) =>
                  (e.type === i.EventType.EnterObject || e.type === i.EventType.EnterTile) &&
                  this.targets.includes(e.target) &&
                  (e.type !== i.EventType.EnterTile || e.source.zone !== r.ZoneType.Air) &&
                  (-1 === this.houseId || e.source.owner.country?.id === this.houseId),
              )
              .map((e) => e.target);
          }
        }),
          e("EnteredByCondition", a));
      },
    };
  },
);
