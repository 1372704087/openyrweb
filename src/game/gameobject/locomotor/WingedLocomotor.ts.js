// === Reconstructed SystemJS module: game/gameobject/locomotor/WingedLocomotor ===
// deps: ["game/Coords","game/gameobject/unit/FacingUtil","game/gameobject/unit/TargetUtil","util/geometry","game/gameobject/unit/ZoneType","game/event/ObjectLiftOffEvent","game/event/ObjectLandEvent","game/type/SpeedType","game/gameobject/task/MoveToDockTask","game/gameobject/trait/interface/NotifyTick","game/math/Vector2","game/math/Vector3","util/math","game/math/GameMath"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/locomotor/WingedLocomotor",
  [
    "game/Coords",
    "game/gameobject/unit/FacingUtil",
    "game/gameobject/unit/TargetUtil",
    "util/geometry",
    "game/gameobject/unit/ZoneType",
    "game/event/ObjectLiftOffEvent",
    "game/event/ObjectLandEvent",
    "game/type/SpeedType",
    "game/gameobject/task/MoveToDockTask",
    "game/gameobject/trait/interface/NotifyTick",
    "game/math/Vector2",
    "game/math/Vector3",
    "util/math",
    "game/math/GameMath",
  ],
  function (t, e) {
    "use strict";
    var C, x, O, A, M, R, h, u, d, g, r, P, I, k, B, i;
    e && e.id;
    return {
      setters: [
        function (e) {
          C = e;
        },
        function (e) {
          x = e;
        },
        function (e) {
          O = e;
        },
        function (e) {
          A = e;
        },
        function (e) {
          M = e;
        },
        function (e) {
          R = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          P = e;
        },
        function (e) {
          I = e;
        },
        function (e) {
          k = e;
        },
      ],
      execute: function () {
        var e;
        (0,
          ((e = B = B || {})[(e.None = 0)] = "None"),
          (e[(e.CircleStrafe = 1)] = "CircleStrafe"),
          (e[(e.HoverStrafe = 2)] = "HoverStrafe"),
          t(
            "WingedLocomotor",
            (i = class {
              static tickStationary(s, a) {
                if (s.zone === M.ZoneType.Air) {
                  var n = s.tile.onBridgeLandType ? a.map.tileOccupation.getBridgeOnTile(s.tile) : void 0;
                  let e = s.rules.landable && !s.unitOrderTrait.getCurrentTask()?.preventLanding,
                    i = s.spawnLinkTrait?.getParent();
                  e && i
                    ? (e = !(((!i.isUnit() || !i.onBridge) && n) || i.tile !== s.tile))
                    : e &&
                      !s.airportBoundTrait &&
                      (e =
                        a.map.getTileZone(s.tile) !== M.ZoneType.Water &&
                        0 < a.map.terrain.getPassableSpeed(s.tile, u.SpeedType.Foot, !0, !!s.tile.onBridgeLandType) &&
                        0 === a.map.terrain.findObstacles({ tile: s.tile, onBridge: n }, s).length);
                  let r;
                  if (e) {
                    let e = s.airportBoundTrait?.preferredAirport?.dockTrait;
                    var o = e?.isDocked(s) || e?.hasReservedDockForUnit(s);
                    if (!s.airportBoundTrait || o) {
                      var l = o ? 0 : 270;
                      if (s.direction !== l)
                        return void (s.direction = x.FacingUtil.tick(s.direction, l, s.rules.rot).facing);
                    }
                    if (s.airportBoundTrait) {
                      let e = s.airportBoundTrait.preferredAirport;
                      if (!e?.dockTrait?.isDocked(s))
                        return (
                          e?.dockTrait?.getAvailableDockCount() ||
                            ((e = s.airportBoundTrait.findAvailableAirport(s)),
                            (s.airportBoundTrait.preferredAirport = e),
                            e && ((l = e.dockTrait.getFirstAvailableDockNumber()), e.dockTrait.reserveDockAt(s, l))),
                          void (e
                            ? (s.unitOrderTrait.addTask(new d.MoveToDockTask(a, e)),
                              s.unitOrderTrait[g.NotifyTick.onTick](s, a))
                            : s.crashableTrait.crash(void 0))
                        );
                    }
                    let t;
                    ((t = i ? i.tile.z + i.tileElevation : s.tile.z + (n?.tileElevation ?? 0)),
                      (r = C.Coords.tileHeightToWorld(t)));
                  } else {
                    var t = s.tile.z + (n?.tileElevation ?? 0),
                      c = s.rules.flightLevel ?? a.rules.general.flightLevel;
                    r = C.Coords.tileHeightToWorld(t) + c;
                  }
                  t = s.position.worldPosition.y;
                  r !== t
                    ? ((c = Math.abs(r - t)),
                      (t = Math.sign(r - t) * Math.min(30, c)),
                      (c = s.tileElevation),
                      s.position.moveByLeptons3(new P.Vector3(0, t, 0)),
                      s.moveTrait.handleElevationChange(c, a))
                    : e &&
                      ((s.zone = M.ZoneType.Ground),
                      i ? i.airSpawnTrait.storeAircraft(s, a) : (s.onBridge = !!n),
                      a.events.dispatch(new h.ObjectLandEvent(s)),
                      (n = a.map.tileOccupation
                        .getGroundObjectsOnTile(s.tile)
                        .find((e) => e.isOverlay() && e.rules.crate)) && a.crateGeneratorTrait.pickupCrate(s, n, a));
                }
              }
              static tickCrash(e, t, i) {
                (i.rollDelta ?? (i.rollDelta = t.generateRandomInt(-15, 15)),
                  i.pitchDelta ?? (i.pitchDelta = t.generateRandomInt(0, 15)),
                  (e.roll += i.rollDelta),
                  (e.pitch += i.pitchDelta));
                var r = C.Coords.vecWorldToGround(e.moveTrait.velocity);
                return new P.Vector3(r.x, -30, r.y);
              }
              constructor(e) {
                ((this.game = e),
                  (this.allowOutOfBounds = !0),
                  (this.lastDestLeptons = new r.Vector2()),
                  (this.currentMoveDir = new r.Vector2()),
                  (this.currentHorizSpeed = 0),
                  (this.maneuverType = B.None),
                  (this.deceleratingToTurn = !1));
              }
              onNewWaypoint(e, t, i) {
                ((this.currentHorizSpeed = C.Coords.vecWorldToGround(e.moveTrait.velocity).length()),
                  (this.cancelDestLeptons = void 0));
              }
              tick(t, e, i, r) {
                if (r) {
                  if (!this.cancelDestLeptons) {
                    let e = t.tile;
                    (this.game.map.isWithinBounds(e) || (e = this.game.map.clampWithinBounds(e)),
                      (this.cancelDestLeptons = this.computeCancelDest(e, i)));
                  }
                  i = this.cancelDestLeptons;
                }
                var s = t.position.getMapPosition();
                let a = i.clone().sub(s);
                var n = a.length();
                (this.lastDestLeptons.equals(i) ||
                  (this.lastDestLeptons.copy(i),
                  r
                    ? (this.maneuverType = B.HoverStrafe)
                    : t.zone === M.ZoneType.Air && this.currentHorizSpeed < 5
                      ? (this.maneuverType = n > C.Coords.LEPTONS_PER_TILE ? B.CircleStrafe : B.HoverStrafe)
                      : (this.maneuverType = B.None),
                  (this.deceleratingToTurn = !1)),
                  t.zone !== M.ZoneType.Air &&
                    ((t.onBridge = !1),
                    (t.zone = M.ZoneType.Air),
                    this.game.events.dispatch(new R.ObjectLiftOffEvent(t))));
                var o = t.tile.onBridgeLandType ? this.game.map.tileOccupation.getBridgeOnTile(t.tile) : void 0,
                  l = t.tile.z + (o?.tileElevation ?? 0),
                  c = t.rules.flightLevel ?? this.game.rules.general.flightLevel,
                  h = C.Coords.tileHeightToWorld(l) + c,
                  o = t.position.worldPosition.y,
                  u = x.FacingUtil.fromMapCoords(a);
                t.direction === u && this.maneuverType === B.None && n <= C.Coords.LEPTONS_PER_TILE
                  ? (this.maneuverType = B.HoverStrafe)
                  : t.direction === u && this.maneuverType === B.CircleStrafe && (this.maneuverType = B.None);
                let d;
                switch (this.maneuverType) {
                  case B.HoverStrafe:
                    if (t.attackTrait?.currentTarget) {
                      let e = C.Coords.vecWorldToGround(t.attackTrait.currentTarget.getWorldCoords());
                      d = x.FacingUtil.fromMapCoords(e.sub(s));
                    } else d = t.airportBoundTrait?.preferredAirport?.dockTrait?.hasReservedDockForUnit(t) ? 0 : 270;
                    break;
                  case B.CircleStrafe:
                  case B.None:
                    d = u;
                    break;
                  default:
                    throw new Error('Unknown maneuver type "' + this.maneuverType);
                }
                var { facing: g, delta: p } = x.FacingUtil.tick(t.direction, d, t.rules.rot);
                ((t.direction = g), (t.roll = Math.sign(p) * t.rules.pitchAngle));
                let m;
                switch (this.maneuverType) {
                  case B.HoverStrafe:
                    m = u;
                    break;
                  case B.CircleStrafe:
                    m = (g - 90 * Math.sign(p) + 360) % 360;
                    break;
                  case B.None:
                    m = g;
                    break;
                  default:
                    throw new Error('Unknown maneuver type "' + this.maneuverType);
                }
                void 0 === this.thrustFacing && (this.thrustFacing = m);
                var l = 5 < this.currentHorizSpeed ? t.rules.rot : Number.POSITIVE_INFINITY,
                  { facing: c, delta: l } = x.FacingUtil.tick(this.thrustFacing, m, l);
                ((this.thrustFacing = c), this.currentMoveDir.copy(x.FacingUtil.toMapCoords(this.thrustFacing)));
                let f = !1,
                  y = 0,
                  T = 0;
                let v = !0;
                h !== o && ((S = Math.abs(h - o)), (y = Math.sign(h - o) * Math.min(30, S)), (v = S <= 30));
                let b = t.rules.speed;
                (n <= C.Coords.LEPTONS_PER_TILE &&
                  this.maneuverType !== B.CircleStrafe &&
                  (b = I.lerp(1, b / 2, k.GameMath.sqrt(n / C.Coords.LEPTONS_PER_TILE))),
                  this.deceleratingToTurn
                    ? (this.currentHorizSpeed = Math.max(0, this.currentHorizSpeed - 2))
                    : (this.currentHorizSpeed = Math.min(this.currentHorizSpeed + 2, b)));
                var S = this.currentHorizSpeed;
                ((this.deceleratingToTurn = !1),
                  (f = l
                    ? ((l =
                        S || l
                          ? O.TargetUtil.computeTurnCircle(s, this.currentMoveDir, Math.sign(l) * t.rules.rot, S)
                          : void 0),
                      (0 !== S && !A.circleContainsPoint(l, i)) ||
                        (this.maneuverType === B.HoverStrafe || n > C.Coords.LEPTONS_PER_TILE
                          ? (this.deceleratingToTurn = !0)
                          : this.maneuverType === B.None && (this.maneuverType = B.HoverStrafe)),
                      (T = S),
                      !1)
                    : ((T = Math.min(S, n)), n <= S)));
                let w;
                w = n < 1 ? ((f = !0), a) : f ? a : this.currentMoveDir.clone().setLength(T);
                let E = new P.Vector3(w.x, y, w.y);
                n = E.clone();
                return (t.moveTrait.velocity.copy(n), { distance: E, done: f && v });
              }
              computeCancelDest(e, t) {
                var i = t
                    .clone()
                    .multiplyScalar(1 / C.Coords.LEPTONS_PER_TILE)
                    .floor()
                    .multiplyScalar(C.Coords.LEPTONS_PER_TILE),
                  i = t.clone().sub(i);
                return new r.Vector2(e.rx, e.ry).multiplyScalar(C.Coords.LEPTONS_PER_TILE).add(i);
              }
            }),
          ));
      },
    };
  },
);
