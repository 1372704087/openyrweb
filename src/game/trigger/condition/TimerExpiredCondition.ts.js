// === Reconstructed SystemJS module: game/trigger/condition/TimerExpiredCondition ===
// deps: ["game/event/EventType","game/trigger/TriggerCondition"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/condition/TimerExpiredCondition",
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
            return t.some((e) => e.type === i.EventType.TimerExpire);
          }
        }),
          e("TimerExpiredCondition", s));
      },
    };
  },
);
