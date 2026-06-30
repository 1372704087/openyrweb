// === Reconstructed SystemJS module: game/gameobject/locomotor/HoverLocomotor ===
// deps: ["game/Coords","game/gameobject/unit/FacingUtil","game/GameSpeed","game/math/geometry","game/math/Vector2","game/math/Vector3"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/locomotor/HoverLocomotor",
  [
    "game/Coords",
    "game/gameobject/unit/FacingUtil",
    "game/GameSpeed",
    "game/math/geometry",
    "game/math/Vector2",
    "game/math/Vector3",
  ],
  function (t, e) {
    "use strict";
    var d, g, n, p, o, m, f, i;
    e && e.id;
    return {
      setters: [
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          m = e;
        },
      ],
      execute: function () {
        var e;
        (((e = f = f || {})[(e.None = 0)] = "None"),
          (e[(e.Start = 1)] = "Start"),
          (e[(e.Normal = 2)] = "Normal"),
          (e[(e.End = 3)] = "End"),
          (e[(e.Single = 4)] = "Single"),
          t(
            "HoverLocomotor",
            (i = class {
              constructor(e) {
                ((this.hoverRules = e),
                  (this.currentSpeed = 0),
                  (this.distanceTravelled = 0),
                  (this.carryOverDistance = 0),
                  (this.currentWaypointType = f.None),
                  (this.nextWaypointDir = new o.Vector2()));
              }
              selectNextWaypoint(e, t) {
                var i, r;
                return (
                  (this.currentWaypointType =
                    this.currentWaypointType && this.currentWaypointType !== f.End ? f.Normal : f.Start),
                  (this.initialPosition = e.position.getMapPosition()),
                  this.currentWaypointType === f.Start && (this.currentSpeed = 0),
                  t.length <= 1
                    ? ((this.currentWaypointType = this.currentWaypointType === f.Start ? f.Single : f.End),
                      (r = t[t.length - 1]) && this.nextWaypointDir.set(r.tile.rx - e.tile.rx, r.tile.ry - e.tile.ry))
                    : ((i = t[t.length - 1]),
                      (r = t[t.length - 2]),
                      this.nextWaypointDir.set(r.tile.rx - i.tile.rx, r.tile.ry - i.tile.ry)),
                  t[t.length - 1]
                );
              }
              onNewWaypoint(e, t, i) {
                let r = new o.Vector2().copy(t).sub(this.initialPosition);
                ((this.distanceTravelled = 0), (this.totalDistanceToTravel = r.length()));
                var s = (this.maxSpeed = e.moveTrait.baseSpeed),
                  a = 60 * this.hoverRules.acceleration * n.GameSpeed.BASE_TICKS_PER_SECOND;
                this.acceleration = s / a;
                a = 60 * this.hoverRules.brake * n.GameSpeed.BASE_TICKS_PER_SECOND;
                this.deceleration = s / a;
              }
              tick(e, t) {
                var i = e.position.getMapPosition();
                let r = t.clone().sub(i);
                var s = r.length(),
                  i = this.maxSpeed;
                this.currentWaypointType === f.Single
                  ? (this.currentSpeed = i / 2)
                  : this.currentWaypointType === f.End
                    ? ((a = this.computeBrakeDistance(this.currentSpeed, this.deceleration)),
                      this.totalDistanceToTravel - this.distanceTravelled <= a &&
                        (this.currentSpeed = Math.max(1, this.currentSpeed - this.deceleration)))
                    : (this.currentSpeed = Math.min(this.currentSpeed + this.acceleration, i));
                var a = g.FacingUtil.fromMapCoords(r),
                  i = g.FacingUtil.fromMapCoords(this.nextWaypointDir);
                let n = a,
                  o = e.rules.rot;
                this.currentWaypointType === f.Normal &&
                  a !== i &&
                  ((a = (l = p.angleDegBetweenVec2(this.nextWaypointDir, g.FacingUtil.toMapCoords(e.direction))) / o),
                  (a = Math.max(this.currentSpeed * a, this.totalDistanceToTravel)),
                  this.totalDistanceToTravel - this.distanceTravelled <= a &&
                    ((n = i), (o = l / ((this.totalDistanceToTravel - this.distanceTravelled) / this.currentSpeed))));
                var l = g.FacingUtil.tick(e.direction, n, o)["facing"];
                e.direction = l;
                let c = this.currentSpeed;
                this.carryOverDistance && (c = this.carryOverDistance);
                l = Math.min(c, s);
                let h = r.clone().setLength(l),
                  u = h.clone();
                return (
                  this.carryOverDistance && u.add(d.Coords.vecWorldToGround(e.moveTrait.velocity)),
                  e.moveTrait.velocity.set(u.x, 0, u.y),
                  (this.distanceTravelled += l),
                  (this.carryOverDistance = Math.max(0, c - s)),
                  { distance: new m.Vector3(h.x, 0, h.y), done: !h.length() || !!this.carryOverDistance }
                );
              }
              computeBrakeDistance(e, t) {
                var i = e / t;
                return Math.max(0, e * i - (t * i * i) / 2);
              }
            }),
          ));
      },
    };
  },
);
