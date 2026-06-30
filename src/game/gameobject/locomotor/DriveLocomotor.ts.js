// === Reconstructed SystemJS module: game/gameobject/locomotor/DriveLocomotor ===
// deps: ["game/gameobject/unit/FacingUtil","game/gameobject/task/TurnTask","game/Coords","game/math/geometry","game/math/Vector2","game/math/Vector3","game/math/CurvePath","game/math/LineCurve","game/math/QuadraticBezierCurve","util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/locomotor/DriveLocomotor",
  [
    "game/gameobject/unit/FacingUtil",
    "game/gameobject/task/TurnTask",
    "game/Coords",
    "game/math/geometry",
    "game/math/Vector2",
    "game/math/Vector3",
    "game/math/CurvePath",
    "game/math/LineCurve",
    "game/math/QuadraticBezierCurve",
    "util/math",
  ],
  function (t, e) {
    "use strict";
    var c, a, h, o, u, d, l, g, p, s, m, i;
    e && e.id;
    return {
      setters: [
        function (e) {
          c = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        var e;
        (((e = m = m || {})[(e.None = 0)] = "None"),
          (e[(e.Start = 1)] = "Start"),
          (e[(e.Normal = 2)] = "Normal"),
          (e[(e.End = 3)] = "End"),
          (e[(e.Single = 4)] = "Single"),
          t(
            "DriveLocomotor",
            (i = class {
              constructor(e) {
                ((this.game = e),
                  (this.hasMomentum = !1),
                  (this.moveOnCurve = !1),
                  (this.currentSpeed = 0),
                  (this.distanceTravelled = 0),
                  (this.carryOverDistance = 0),
                  (this.currentWaypointType = m.None));
              }
              selectNextWaypoint(e, i) {
                if (
                  ((this.currentWaypointType =
                    this.currentWaypointType && this.currentWaypointType !== m.End ? m.Normal : m.Start),
                  (this.initialPosition = e.position.getMapPosition()),
                  this.currentWaypointType !== m.Start ? (e.moveTrait.speedPenalty = 0) : (this.currentSpeed = 0),
                  1 < i.length)
                ) {
                  var r = i[i.length - 1],
                    s = i[i.length - 2],
                    a = new u.Vector2(r.tile.rx - e.tile.rx, r.tile.ry - e.tile.ry),
                    n = Math.abs(
                      o.angleDegFromVec2(a) -
                        o.angleDegFromVec2(new u.Vector2(s.tile.rx - r.tile.rx, s.tile.ry - r.tile.ry)),
                    );
                  if (!Math.abs(c.FacingUtil.fromMapCoords(a) - e.direction) && 0 < n && n < 90 && this.hasMomentum) {
                    ((this.moveOnCurve = !0),
                      (this.currentWaypointType =
                        2 === i.length ? (this.currentWaypointType === m.Start ? m.Single : m.End) : m.Normal));
                    let e = this.initialPosition;
                    a = new u.Vector2(r.tile.rx + 0.5, r.tile.ry + 0.5).multiplyScalar(h.Coords.LEPTONS_PER_TILE);
                    let t = new u.Vector2(s.tile.rx + 0.5, s.tile.ry + 0.5).multiplyScalar(h.Coords.LEPTONS_PER_TILE);
                    ((n = e.clone().lerp(a, 0.5)), (r = t.clone().lerp(a, 0.5)));
                    return (
                      (this.steerCurve = new l.CurvePath()),
                      this.steerCurve.add(new g.LineCurve(e, n)),
                      this.steerCurve.add(new p.QuadraticBezierCurve(n, a, r)),
                      this.steerCurve.add(new g.LineCurve(r, t)),
                      (this.lastPosition = e),
                      s
                    );
                  }
                } else this.currentWaypointType = this.currentWaypointType === m.Start ? m.Single : m.End;
                return ((this.hasMomentum = !0), (this.moveOnCurve = !1), i[i.length - 1]);
              }
              onNewWaypoint(e, t, i) {
                let r = new u.Vector2().copy(t).sub(this.initialPosition);
                ((this.distanceTravelled = 0),
                  (this.totalDistanceToTravel = this.moveOnCurve ? this.steerCurve.getLength() : r.length()));
                var s = c.FacingUtil.fromMapCoords(r);
                if (s !== e.direction && (this.pointTurretToTarget(e, i), !this.moveOnCurve))
                  return (e.moveTrait.velocity.set(0, 0, 0), [new a.TurnTask(s)]);
              }
              tick(i, r, e) {
                this.pointTurretToTarget(i, e);
                let s = this.currentSpeed;
                ((s = i.rules.accelerates
                  ? ((l = this.distanceTravelled / this.totalDistanceToTravel),
                    (this.currentSpeed = this.applyAcceleration(i, s, i.moveTrait.baseSpeed, l)))
                  : (this.currentSpeed = i.moveTrait.baseSpeed)),
                  1 < s && (s = Math.floor(s)));
                let t = this.game.map.terrain.getPassableSpeed(
                  i.tile,
                  i.rules.speedType,
                  i.isInfantry(),
                  i.onBridge,
                  void 0,
                  !0,
                );
                (t ? (i.moveTrait.lastTileSpeed = t) : (t = i.moveTrait.lastTileSpeed || 1),
                  (s *= t),
                  1 < s && (s = Math.floor(s)),
                  this.carryOverDistance && (s = this.carryOverDistance));
                var a = i.position.getMapPosition();
                let n;
                if (this.moveOnCurve) {
                  var o = this.steerCurve.getLength(),
                    l = Math.min(this.distanceTravelled + s, o);
                  ((this.carryOverDistance = Math.max(0, this.distanceTravelled + s - o)),
                    (this.distanceTravelled = l));
                  let e = this.steerCurve.getPointAt(this.distanceTravelled / o),
                    t = this.steerCurve.getTangentAt(this.distanceTravelled / o);
                  l = t.clone().setLength(s);
                  i.moveTrait.velocity.set(l.x, 0, l.y);
                  var o = i.rules.rot,
                    { facing: l, delta: o } = c.FacingUtil.tick(i.direction, c.FacingUtil.fromMapCoords(t), o);
                  ((i.direction = l), (i.spinVelocity = o));
                  o = this.lastPosition;
                  ((this.lastPosition = e.clone()), (n = e.sub(o)));
                } else {
                  let e = new u.Vector2().copy(r).sub(a);
                  a = Math.min(e.length(), s);
                  n = e.clone().setLength(a);
                  let t = n.clone();
                  (this.carryOverDistance && t.add(h.Coords.vecWorldToGround(i.moveTrait.velocity)),
                    i.moveTrait.velocity.set(t.x, 0, t.y),
                    (this.distanceTravelled += a),
                    (this.carryOverDistance = Math.max(0, s - e.length())));
                }
                return { distance: new d.Vector3(n.x, 0, n.y), done: !n.length() || !!this.carryOverDistance };
              }
              pointTurretToTarget(t, i) {
                if (t.turretTrait) {
                  t.attackTrait?.currentTarget?.obj && (i = t.attackTrait.currentTarget.obj.position.getMapPosition());
                  var r = t.position.getMapPosition();
                  let e = new u.Vector2().copy(i).sub(r);
                  e.length() && ((r = c.FacingUtil.fromMapCoords(e)), (t.turretTrait.desiredFacing = r));
                }
              }
              applyAcceleration(e, t, i, r) {
                if (this.currentWaypointType === m.Single) return i / 2;
                if (this.currentWaypointType !== m.End) return Math.min(t + e.rules.accelerationFactor * i, i);
                return (
                  this.moveOnCurve && this.currentWaypointType === m.End && (r = r <= 0.5 ? 0 : 2 * (r - 0.5)),
                  s.lerp(1, i, 1 - r)
                );
              }
            }),
          ));
      },
    };
  },
);
