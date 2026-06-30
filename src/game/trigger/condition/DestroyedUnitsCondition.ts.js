// === Reconstructed SystemJS module: game/trigger/condition/DestroyedUnitsCondition ===
// deps: ["game/event/EventType","game/trigger/TriggerCondition"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/condition/DestroyedUnitsCondition",
  ["game/event/EventType", "game/trigger/TriggerCondition"],
  function (e, t) {
    "use strict";
    var r, i, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        ((s = class extends i.TriggerCondition {
          constructor(e, t) {
            (super(e, t), (this.count = 0), (this.threshold = Number(e.params[1])));
          }
          check(e, t) {
            if (!this.player) return !1;
            if (this.count >= this.threshold) return !0;
            for (var i of t)
              if (i.type === r.EventType.ObjectDestroy) {
                let e = i.target;
                e.isUnit() && e.owner.country?.id === this.houseId && this.count++;
              }
            return this.count >= this.threshold;
          }
        }),
          e("DestroyedUnitsCondition", s));
      },
    };
  },
);
