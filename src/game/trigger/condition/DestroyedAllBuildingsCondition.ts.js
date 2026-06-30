// === Reconstructed SystemJS module: game/trigger/condition/DestroyedAllBuildingsCondition ===
// deps: ["game/event/EventType","game/trigger/TriggerCondition"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/condition/DestroyedAllBuildingsCondition",
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
            (super(e, t), (this.allDestroyed = !1), (this.houseId = Number(e.params[1])));
          }
          check(e, t) {
            return (
              !!this.allDestroyed ||
              (!!t.some((e) => {
                if (e.type !== i.EventType.ObjectDestroy) return !1;
                let t = e.target;
                return !(!t.isBuilding() || t.owner.country?.id !== this.houseId) && !t.owner.buildings.size;
              }) &&
                (this.allDestroyed = !0))
            );
          }
        }),
          e("DestroyedAllBuildingsCondition", s));
      },
    };
  },
);
