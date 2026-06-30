// === Reconstructed SystemJS module: game/gameobject/locomotor/ChronoLocomotor ===
// deps: ["game/math/Vector2","game/math/Vector3"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/locomotor/ChronoLocomotor",
  ["game/math/Vector2", "game/math/Vector3"],
  function (e, t) {
    "use strict";
    var i, n, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          n = e;
        },
      ],
      execute: function () {
        e(
          "ChronoLocomotor",
          (r = class {
            constructor(e) {
              ((this.game = e), (this.ignoresTerrain = !0), (this.distanceToWaypoint = new i.Vector2()));
            }
            onNewWaypoint(e, t) {}
            tick(e, t, i, r) {
              if (r) return { distance: new n.Vector3(), done: !0 };
              this.distanceToWaypoint.copy(t).sub(e.position.getMapPosition());
              var s,
                a = this.game.rules.general;
              return (
                a.chronoTrigger &&
                  ((a =
                    (s = this.distanceToWaypoint.length()) < a.chronoRangeMinimum
                      ? a.chronoMinimumDelay
                      : s / a.chronoDistanceFactor),
                  e.warpedOutTrait.setTimed(a, !1, this.game)),
                {
                  distance: new n.Vector3(this.distanceToWaypoint.x, 0, this.distanceToWaypoint.y),
                  done: !0,
                  isTeleport: !0,
                }
              );
            }
          }),
        );
      },
    };
  },
);
