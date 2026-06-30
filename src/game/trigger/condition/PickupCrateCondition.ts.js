// === Reconstructed SystemJS module: game/trigger/condition/PickupCrateCondition ===
// deps: ["game/event/EventType","game/trigger/TriggerCondition"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/condition/PickupCrateCondition",
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
          check(e, t) {
            return t
              .filter((e) => e.type === i.EventType.CratePickup && this.targets.includes(e.source))
              .map((e) => e.source);
          }
        }),
          e("PickupCrateCondition", s));
      },
    };
  },
);
