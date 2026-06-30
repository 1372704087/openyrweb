// === Reconstructed SystemJS module: game/gameobject/locomotor/MissileLocomotor ===
// deps: ["game/Coords","game/gameobject/unit/ZoneType","game/event/ObjectLiftOffEvent","game/math/geometry","game/gameobject/unit/FacingUtil","game/math/Vector3","game/math/Vector2","game/math/CubicBezierCurve3","game/math/GameMath"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/locomotor/MissileLocomotor",
  [
    "game/Coords",
    "game/gameobject/unit/ZoneType",
    "game/event/ObjectLiftOffEvent",
    "game/math/geometry",
    "game/gameobject/unit/FacingUtil",
    "game/math/Vector3",
    "game/math/Vector2",
    "game/math/CubicBezierCurve3",
    "game/math/GameMath",
  ],
  function (t, e) {
    "use strict";
    var p, m, f, y, T, v, b, S, w, E, i;
    e && e.id;
    return {
      setters: [
        function (e) {
          p = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          f = e;
        },
        function (e) {
          y = e;
        },
        function (e) {
          T = e;
        },
        function (e) {
          v = e;
        },
        function (e) {
          b = e;
        },
        function (e) {
          S = e;
        },
        function (e) {
          w = e;
        },
      ],
      execute: function () {
        var e;
        (((e = E = E || {})[(e.Boost = 0)] = "Boost"),
          (e[(e.Midcourse = 1)] = "Midcourse"),
          (e[(e.Terminal = 2)] = "Terminal"),
          t(
            "MissileLocomotor",
            (i = class {
              constructor(e, t) {
                ((this.game = e), (this.missileRules = t), (this.flightPhase = E.Boost));
              }
              selectNextWaypoint(e, t) {
                var i = t[t.length - 1],
                  r = this.game.map.tileOccupation.getBridgeOnTile(i.tile),
                  r = i.tile.z + (r?.tileElevation ?? 0);
                return (
                  (this.targetPosition = p.Coords.tile3dToWorld(i.tile.rx + 0.5, i.tile.ry + 0.5, r)),
                  (this.cruiseAltitude = p.Coords.tileHeightToWorld(r) + this.missileRules.altitude),
                  i
                );
              }
              onNewWaypoint(e, t, i) {}
              tick(i, e, t) {
                let r = i.position.worldPosition.clone(),
                  s = this.targetPosition.clone().sub(r);
                i.zone !== m.ZoneType.Air &&
                  ((i.onBridge = !1),
                  (i.zone = m.ZoneType.Air),
                  this.game.events.dispatch(new f.ObjectLiftOffEvent(i)));
                let a;
                var n;
                ((a = this.currentVelocity
                  ? ((n = i.rules.speed), Math.min(this.currentVelocity.length() + this.missileRules.acceleration, n))
                  : ((g = this.missileRules.acceleration),
                    this.missileRules.lazyCurve
                      ? (this.currentVelocity = new v.Vector3(s.x, 0, s.z))
                      : (this.currentVelocity = p.Coords.vecGroundToWorld(T.FacingUtil.toMapCoords(i.direction))),
                    y.rotateVec3Towards(
                      this.currentVelocity,
                      new v.Vector3(this.currentVelocity.x, 1e8, this.currentVelocity.z),
                      i.pitch,
                    ),
                    g)),
                  this.currentVelocity.setLength(a));
                let o = !1;
                switch (this.flightPhase) {
                  case E.Boost:
                    if (!(i.position.worldPosition.y >= this.cruiseAltitude)) {
                      o = !1;
                      break;
                    }
                    this.flightPhase = E.Midcourse;
                  case E.Midcourse:
                    var l,
                      c = new b.Vector2(s.x, s.z).length();
                    if (!this.missileRules.lazyCurve) {
                      (y.rotateVec3Towards(
                        this.currentVelocity,
                        new v.Vector3(this.currentVelocity.x, 0, this.currentVelocity.z),
                        i.rules.rot,
                      ),
                        this.currentVelocity.y < 1 &&
                          ((l = this.currentVelocity.length()),
                          (this.currentVelocity.y = 0),
                          this.currentVelocity.setLength(l)),
                        y.rotateVec3Towards(
                          this.currentVelocity,
                          new v.Vector3(s.x, this.currentVelocity.y, s.z),
                          i.rules.rot,
                        ),
                        (i.direction = T.FacingUtil.fromMapCoords(p.Coords.vecWorldToGround(this.currentVelocity))),
                        (i.pitch =
                          Math.sign(this.currentVelocity.y) *
                          y.angleDegBetweenVec3(
                            this.currentVelocity,
                            new v.Vector3(this.currentVelocity.x, 0, this.currentVelocity.z),
                          )),
                        c / (r.y - this.targetPosition.y) < 1 && (this.flightPhase = E.Terminal));
                      break;
                    }
                    this.flightPhase = E.Terminal;
                    var h = r
                        .clone()
                        .add(this.currentVelocity.clone().setLength(c / 3 / w.GameMath.cos(y.degToRad(i.pitch)))),
                      u = this.targetPosition.clone().lerp(r, 0.15).setY(h.y);
                    this.descentCurve = new S.CubicBezierCurve3(r, h, u, this.targetPosition);
                  case E.Terminal:
                    h = this.missileRules.bodyLength;
                    if (this.missileRules.lazyCurve) {
                      var d = this.descentCurve.getLength();
                      (this.descentTravelled ?? (this.descentTravelled = 0),
                        (this.descentTravelled += Math.min(a, d - h - this.descentTravelled)));
                      u = this.descentTravelled / d;
                      let e = this.descentCurve.getPointAt(u),
                        t = this.descentCurve.getTangentAt(u);
                      this.currentVelocity.copy(e.sub(r));
                      u = t.clone().setY(0);
                      ((i.pitch = Math.sign(t.y - u.y) * y.angleDegBetweenVec3(u, t)),
                        (o = 1 <= (this.descentTravelled + h) / d));
                    } else {
                      (y.rotateVec3Towards(this.currentVelocity, s, i.rules.rot),
                        (i.direction = T.FacingUtil.fromMapCoords(p.Coords.vecWorldToGround(this.currentVelocity))),
                        (i.pitch =
                          Math.sign(this.currentVelocity.y) *
                          y.angleDegBetweenVec3(
                            this.currentVelocity,
                            new v.Vector3(this.currentVelocity.x, 0, this.currentVelocity.z),
                          )));
                      d = s.length() - h;
                      (d < a || d < 1) && (this.currentVelocity.copy(s.clone().addScalar(-h)), (o = !0));
                    }
                    break;
                  default:
                    throw new Error(`Unhandled flight phase "${this.flightPhase}"`);
                }
                var g = r.clone().add(this.currentVelocity);
                return this.game.map.isWithinHardBounds(g)
                  ? (i.moveTrait.velocity.copy(this.currentVelocity), { distance: this.currentVelocity, done: o })
                  : (this.game.destroyObject(i), { done: !0, distance: new v.Vector3() });
              }
            }),
          ));
      },
    };
  },
);
