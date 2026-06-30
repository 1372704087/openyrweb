// === Reconstructed SystemJS module: game/trigger/condition/ComesNearWaypointCondition ===
// deps: ["game/event/EventType","game/gameobject/unit/RangeHelper","game/trigger/TriggerCondition"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/condition/ComesNearWaypointCondition",
  ["game/event/EventType", "game/gameobject/unit/RangeHelper", "game/trigger/TriggerCondition"],
  function (e, t) {
    "use strict";
    var r, s, i, a;
    t && t.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        ((a = class extends i.TriggerCondition {
          constructor(e, t) {
            super(e, t);
          }
          init(e) {
            super.init(e);
            var t = Number(this.event.params[1]);
            ((this.waypointTile = e.map.getTileAtWaypoint(t)),
              this.waypointTile ||
                console.warn(`No valid location found for waypoint ${t}. ` + `Skipping event ${this.getDebugName()}.`));
          }
          check(t, e) {
            if (!this.waypointTile || !this.player) return !1;
            for (var i of e)
              if (i.type === r.EventType.EnterTile && i.source.owner === this.player) {
                let e = new s.RangeHelper(t.map.tileOccupation);
                if (e.tileDistance(i.target, this.waypointTile) < 2) return !0;
              }
            return !1;
          }
        }),
          e("ComesNearWaypointCondition", a));
      },
    };
  },
);
