// === Reconstructed SystemJS module: game/trigger/condition/DestroyedAllUnitsCondition ===
// deps: ["engine/type/ObjectType","game/event/EventType","game/trigger/TriggerCondition"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/condition/DestroyedAllUnitsCondition",
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
                return !(!t.isUnit() || t.owner.country?.id !== this.houseId) && !this.hasUnitsLeft(t.owner);
              }) &&
                (this.allDestroyed = !0))
            );
          }
          hasUnitsLeft(e) {
            var t;
            for (t of [i.ObjectType.Aircraft, i.ObjectType.Vehicle, i.ObjectType.Infantry])
              if (e.getOwnedObjectsByType(t, !0).length) return !0;
            return !1;
          }
        }),
          e("DestroyedAllUnitsCondition", a));
      },
    };
  },
);
