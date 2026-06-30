// === Reconstructed SystemJS module: game/trigger/condition/SpyEnteringAsInfantryCondition ===
// deps: ["game/event/EventType","game/trigger/TriggerCondition"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/condition/SpyEnteringAsInfantryCondition",
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
            (super(e, t), (this.infantryIdx = Number(e.params[1])));
          }
          check(e, t) {
            return t
              .filter((e) => {
                if (e.type !== i.EventType.BuildingInfiltration) return !1;
                var t = e.target;
                return (
                  !!this.targets.includes(t) && e.source.disguiseTrait?.getDisguise()?.rules.index === this.infantryIdx
                );
              })
              .map((e) => e.target);
          }
        }),
          e("SpyEnteringAsInfantryCondition", s));
      },
    };
  },
);
