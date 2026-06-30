// === Reconstructed SystemJS module: game/trigger/condition/DestroyedAllUnitsNavalCondition ===
// deps: ["engine/type/ObjectType","game/event/EventType","game/trigger/TriggerCondition"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/condition/DestroyedAllUnitsNavalCondition",
  ["engine/type/ObjectType", "game/event/EventType", "game/trigger/TriggerCondition"],
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
            (super(e, t), (this.allDestroyed = !1), (this.houseId = Number(e.params[1])));
          }
          check(e, t) {
            return (
              !!this.allDestroyed ||
              (!!t.some((e) => {
                if (e.type !== r.EventType.ObjectDestroy) return !1;
                let t = e.target;
                return (
                  !(!t.isVehicle() || t.owner.country?.id !== this.houseId) &&
                  !t.owner.getOwnedObjectsByType(i.ObjectType.Vehicle, !0).filter((e) => e.rules.naval).length
                );
              }) &&
                (this.allDestroyed = !0))
            );
          }
        }),
          e("DestroyedAllUnitsNavalCondition", a));
      },
    };
  },
);
