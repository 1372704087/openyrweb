// === Reconstructed SystemJS module: game/trigger/condition/DestroyedOrCapturedOrInfiltratedCondition ===
// deps: ["game/event/EventType","game/trigger/TriggerCondition"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/condition/DestroyedOrCapturedOrInfiltratedCondition",
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
          constructor() {
            (super(...arguments),
              (this.eventsFilter = [
                i.EventType.ObjectDestroy,
                i.EventType.ObjectOwnerChange,
                i.EventType.BuildingInfiltration,
              ]));
          }
          check(e, t) {
            return t
              .filter((e) => {
                if (!this.eventsFilter.includes(e.type)) return !1;
                let t = e.target;
                return !(!t.isTechno() || !this.targets.includes(t));
              })
              .map((e) => e.target);
          }
        }),
          e("DestroyedOrCapturedOrInfiltratedCondition", s));
      },
    };
  },
);
