// === Reconstructed SystemJS module: game/trigger/condition/CrossHorizLineCondition ===
// deps: ["game/event/EventType","game/gameobject/unit/ZoneType","game/trigger/TriggerCondition"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/condition/CrossHorizLineCondition",
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
                (t) =>
                  t.type === i.EventType.EnterTile &&
                  t.source.zone !== r.ZoneType.Air &&
                  this.targets.some((e) => e.ry === t.target.ry) &&
                  (-1 === this.houseId || t.source.owner.country?.id === this.houseId),
              )
              .map((e) => e.target);
          }
        }),
          e("CrossHorizLineCondition", a));
      },
    };
  },
);
