// === Reconstructed SystemJS module: game/trigger/executor/ApplyDamageExecutor ===
// deps: ["game/Coords","game/gameobject/unit/CollisionType","game/Warhead","game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/executor/ApplyDamageExecutor",
  ["game/Coords", "game/gameobject/unit/CollisionType", "game/Warhead", "game/trigger/TriggerExecutor"],
  function (e, t) {
    "use strict";
    var n, o, l, i, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        ((r = class extends i.TriggerExecutor {
          constructor(e, t, i) {
            (super(e, t), (this.damage = i));
          }
          execute(t) {
            var e = Number(this.action.params[1]),
              i = t.map.getTileAtWaypoint(e);
            if (i) {
              var r = t.rules.getWarhead(l.Warhead.HE_WARHEAD_NAME);
              let e = new l.Warhead(r);
              var s = t.map.tileOccupation.getBridgeOnTile(i),
                a = s?.tileElevation ?? 0,
                r = t.map.getTileZone(i);
              e.detonate(
                t,
                this.damage,
                i,
                a,
                n.Coords.tile3dToWorld(i.rx + 0.5, i.ry + 0.5, i.z + a),
                r,
                s ? o.CollisionType.OnBridge : o.CollisionType.None,
                t.createTarget(s, i),
                void 0,
              );
            } else
              console.warn(`No valid location found for waypoint ${e}. ` + `Skipping action ${this.getDebugName()}.`);
          }
        }),
          e("ApplyDamageExecutor", r));
      },
    };
  },
);
