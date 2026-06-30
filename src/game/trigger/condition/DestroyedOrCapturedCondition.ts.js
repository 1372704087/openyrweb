// === Reconstructed SystemJS module: game/trigger/condition/DestroyedOrCapturedCondition ===
// deps: ["game/event/EventType","game/trigger/TriggerCondition"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/condition/DestroyedOrCapturedCondition",
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
              .filter((e) => {
                if (e.type !== i.EventType.ObjectDestroy && e.type !== i.EventType.ObjectOwnerChange) return !1;
                let t = e.target;
                return !(!t.isTechno() || !this.targets.includes(t));
              })
              .map((e) => e.target);
          }
        }),
          e("DestroyedOrCapturedCondition", s));
      },
    };
  },
);
