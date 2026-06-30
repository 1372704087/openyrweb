// === Reconstructed SystemJS module: game/gameobject/locomotor/FootLocomotor ===
// deps: ["game/gameobject/unit/FacingUtil","game/gameobject/infantry/StanceType","game/math/Vector2","game/math/Vector3"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/locomotor/FootLocomotor",
  ["game/gameobject/unit/FacingUtil", "game/gameobject/infantry/StanceType", "game/math/Vector2", "game/math/Vector3"],
  function (e, t) {
    "use strict";
    var r, l, i, c, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          c = e;
        },
      ],
      execute: function () {
        e(
          "FootLocomotor",
          (s = class {
            constructor(e) {
              ((this.game = e),
                (this.currentMoveDirection = new i.Vector2()),
                (this.distanceToWaypoint = new i.Vector2()),
                (this.endPauseFrames = 0));
            }
            onNewWaypoint(e, t) {
              this.currentMoveDirection.copy(t).sub(e.position.getMapPosition());
              var i = r.FacingUtil.fromMapCoords(this.currentMoveDirection);
              (i !== e.direction && (e.direction = i), (this.endPauseFrames = 1));
            }
            onWaypointUpdate(e, t) {
              this.onNewWaypoint(e, t);
            }
            tick(e, t, i) {
              let r = e.moveTrait.baseSpeed;
              ((r = Math.floor(r)),
                e.stance === l.StanceType.Prone && (r *= e.art.crawls ? 0.5 : 2),
                e.isPanicked && (r *= 2));
              let s = this.game.map.terrain.getPassableSpeed(
                e.tile,
                e.rules.speedType,
                e.isInfantry(),
                e.onBridge,
                void 0,
                !0,
              );
              (s ? (e.moveTrait.lastTileSpeed = s) : (s = e.moveTrait.lastTileSpeed || 1),
                (r *= s),
                (r = Math.floor(r)),
                this.distanceToWaypoint.copy(t).sub(e.position.getMapPosition()));
              let a = this.distanceToWaypoint.clone().setLength(r);
              (a.length() || t.equals(i)) && e.moveTrait.velocity.set(a.x, 0, a.y);
              var n = Math.min(this.distanceToWaypoint.length(), r),
                o = !n && 0 < this.endPauseFrames--;
              return (
                this.distanceToWaypoint.setLength(n),
                {
                  distance: new c.Vector3(this.distanceToWaypoint.x, 0, this.distanceToWaypoint.y),
                  done: !this.distanceToWaypoint.length() && !o,
                }
              );
            }
          }),
        );
      },
    };
  },
);
