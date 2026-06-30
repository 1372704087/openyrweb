// === Reconstructed SystemJS module: game/trigger/executor/DetonateWarheadExecutor ===
// deps: ["game/Coords","game/gameobject/unit/CollisionType","game/Warhead","game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/executor/DetonateWarheadExecutor",
  ["game/Coords", "game/gameobject/unit/CollisionType", "game/Warhead", "game/trigger/TriggerExecutor"],
  function (e, t) {
    "use strict";
    var l, c, h, i, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        ((r = class extends i.TriggerExecutor {
          execute(r) {
            var s = Number(this.action.params[1]),
              e = this.action.params[6],
              a = r.map.getTileAtWaypoint(e);
            if (a) {
              let t;
              try {
                t = r.rules.getWeaponByInternalId(s);
              } catch (e) {
                if (e instanceof RangeError)
                  return void console.warn(
                    `Weapon with internal ID "${s}" not found. ` + `Skipping action ${this.getDebugName()}.`,
                  );
                throw e;
              }
              let e;
              try {
                e = r.rules.getWarhead(t.warhead);
              } catch (e) {
                return void console.warn(
                  `Warhead "${t.warhead}" not found. ` + `Skipping action ${this.getDebugName()}.`,
                );
              }
              let i = new h.Warhead(e);
              var n = r.map.tileOccupation.getBridgeOnTile(a),
                o = n?.tileElevation ?? 0,
                s = r.map.getTileZone(a);
              i.detonate(
                r,
                t.damage,
                a,
                o,
                l.Coords.tile3dToWorld(a.rx + 0.5, a.ry + 0.5, a.z + o),
                s,
                n ? c.CollisionType.OnBridge : c.CollisionType.None,
                r.createTarget(n, a),
                void 0,
              );
            } else
              console.warn(`No valid location found for waypoint ${e}. ` + `Skipping action ${this.getDebugName()}.`);
          }
        }),
          e("DetonateWarheadExecutor", r));
      },
    };
  },
);
