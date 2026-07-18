// === Reconstructed SystemJS module: game/gameobject/locomotor/JumpjetLocomotor ===
// deps: ["game/Coords","game/gameobject/unit/FacingUtil","game/gameobject/unit/TargetUtil","util/geometry","game/gameobject/unit/ZoneType","game/event/ObjectLiftOffEvent","game/event/ObjectLandEvent","game/type/SpeedType","game/gameobject/infantry/StanceType","game/math/Vector2","game/math/Vector3"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/locomotor/JumpjetLocomotor",
  [
    "game/Coords",
    "game/gameobject/unit/FacingUtil",
    "game/gameobject/unit/TargetUtil",
    "util/geometry",
    "game/gameobject/unit/ZoneType",
    "game/event/ObjectLiftOffEvent",
    "game/event/ObjectLandEvent",
    "game/type/SpeedType",
    "game/gameobject/infantry/StanceType",
    "game/math/Vector2",
    "game/math/Vector3",
  ],
  function (e, t) {
    "use strict";
    var E, C, x, O, A, M, l, c, R, r, P, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          E = e;
        },
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
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          R = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          P = e;
        },
      ],
      execute: function () {
        e(
          "JumpjetLocomotor",
          (i = class {
            static tickStationary(t, i) {
              if (t.zone === A.ZoneType.Air) {
                var r = t.tile.onBridgeLandType ? i.map.tileOccupation.getBridgeOnTile(t.tile) : void 0,
                  s =
                    !t.rules.balloonHover &&
                    (!t.unitOrderTrait.getCurrentTask()?.preventLanding || !t.rules.hoverAttack) &&
                    (i.map.getGroundObjectsOnTile(t.tile).find((e) => e.isBuilding() && e.dockTrait?.isDocked(t)) ||
                      (i.map.getTileZone(t.tile) !== A.ZoneType.Water &&
                        0 < i.map.terrain.getPassableSpeed(t.tile, c.SpeedType.Foot, !0, !!t.tile.onBridgeLandType) &&
                        0 === i.map.terrain.findObstacles({ tile: t.tile, onBridge: r }, t).length));
                let e;
                e = s
                  ? ((a = t.tile.z + (r?.tileElevation ?? 0)), E.Coords.tileHeightToWorld(a))
                  : ((n =
                      t.tile.z +
                      i.map
                        .getGroundObjectsOnTile(t.tile)
                        .filter((e) => !(e.isInfantry() && e.stance === R.StanceType.Paradrop))
                        .reduce((e, t) => Math.max(e, t.tileElevation + t.art.height), 0)),
                    E.Coords.tileHeightToWorld(n) + t.rules.jumpjetHeight);
                var a,
                  n,
                  o = t.position.worldPosition.y;
                e !== o
                  ? ((a = t.rules.jumpjetClimb),
                    (n = Math.abs(e - o)),
                    (a = Math.sign(e - o) * Math.min(a, n)),
                    (n = t.tileElevation),
                    t.position.moveByLeptons3(new P.Vector3(0, a, 0)),
                    t.moveTrait.handleElevationChange(n, i))
                  : s &&
                    ((t.zone = A.ZoneType.Ground),
                    (t.onBridge = !!r),
                    i.events.dispatch(new l.ObjectLandEvent(t)),
                    (r = i.map.tileOccupation
                      .getGroundObjectsOnTile(t.tile)
                      .find((e) => e.isOverlay() && e.rules.crate)) && i.crateGeneratorTrait.pickupCrate(t, r, i));
              }
            }
            static tickCrash(e, t, i) {
              var r = 2 * e.rules.jumpjetCrash;
              e.direction = (e.direction - 6 + 360) % 360;
              if (e.rules.tiltCrashJumpjet) {
                i.crashTick ??= 0;
                i.crashTick++;
                var maxTilt = 45, tiltProgress = Math.min(1, i.crashTick / 20);
                e.crashPitch = maxTilt * tiltProgress;
                i.orbitCenter ??= { x: e.position.worldPosition.x, z: e.position.worldPosition.z };
                i.orbitRadius ??= 3 * r;
                i.orbitAngle ??= 0;
                i.orbitAngle += 8;
                var orbitRad = (i.orbitAngle * Math.PI) / 180;
                var omega = (8 * Math.PI) / 180;
                var vx = -i.orbitRadius * omega * Math.sin(orbitRad);
                var vz = i.orbitRadius * omega * Math.cos(orbitRad);
                var crashVelocity = new P.Vector3(vx, -r, vz);
                e.moveTrait && e.moveTrait.velocity.copy(crashVelocity);
                return crashVelocity;
              }
              return new P.Vector3(0, -r, 0);
            }
            constructor(e) {
              ((this.game = e),
                (this.allowOutOfBounds = !0),
                (this.currentMoveDir = new r.Vector2()),
                (this.currentHorizSpeed = 0));
            }
            onNewWaypoint(e, t, i) {
              ((this.currentMoveDir = C.FacingUtil.toMapCoords(e.direction)), (this.cancelDestLeptons = void 0));
            }
            tick(t, e, i, r) {
              if (
                (t.zone !== A.ZoneType.Air &&
                  ((t.onBridge = !1),
                  (t.zone = A.ZoneType.Air),
                  this.game.events.dispatch(new M.ObjectLiftOffEvent(t))),
                r)
              ) {
                if (!this.cancelDestLeptons) {
                  let e = t.tile;
                  (this.game.map.isWithinBounds(e) || (e = this.game.map.clampWithinBounds(e)),
                    (this.cancelDestLeptons = this.computeCancelDest(e, i)));
                }
                i = this.cancelDestLeptons;
              }
              var s = t.position.getMapPosition();
              let a = i.clone().sub(s),
                n = this.findTilesToCheckForBlockers(t.tile, s, this.currentMoveDir, a.length());
              var o = n
                .map(
                  (e) =>
                    e.z +
                    this.game.map
                      .getGroundObjectsOnTile(e)
                      .filter((e) => !(e.isDestroyed || (e.isInfantry() && e.stance === R.StanceType.Paradrop)))
                      .reduce((e, t) => Math.max(e, t.tileElevation + t.art.height), 0),
                )
                .reduce((e, t) => Math.max(e, t), 0);
              let l = 0;
              (void 0 === this.lastClearZ || 2 < o - this.lastClearZ) && (l = 4);
              var c,
                h = E.Coords.tileHeightToWorld(o),
                u = E.Coords.tileHeightToWorld(o + l),
                d = t.position.worldPosition.y,
                g = C.FacingUtil.fromMapCoords(a),
                p = a.length() < t.rules.jumpjetSpeed;
              let m = 0;
              (h <= d &&
                !p &&
                (({ facing: b, delta: c } = C.FacingUtil.tick(t.direction, g, t.rules.jumpjetTurnRate)),
                (m = c),
                (t.direction = b),
                this.currentMoveDir.copy(C.FacingUtil.toMapCoords(t.direction))),
                t.isVehicle() && (t.spinVelocity = m));
              let f,
                y = !1,
                T = 0,
                v = 0;
              var b = t.rules.jumpjetClimb;
              d < u
                ? ((T = Math.min(b, u - d)), (f = !1), (this.currentHorizSpeed = 0))
                : ((this.lastClearZ = o),
                  (o = h + t.rules.jumpjetHeight),
                  (f = !0),
                  o !== d && ((h = Math.abs(o - d)), (T = Math.sign(o - d) * Math.min(b, h)), (f = h <= b)),
                  (b = this.currentHorizSpeed),
                  (this.currentHorizSpeed = Math.min(this.currentHorizSpeed + 2, t.rules.jumpjetSpeed)),
                  (y =
                    g === t.direction
                      ? ((v = Math.min(b, a.length())), b >= a.length())
                      : ((s =
                          b || m
                            ? x.TargetUtil.computeTurnCircle(
                                s,
                                this.currentMoveDir,
                                Math.sign(m) * t.rules.jumpjetTurnRate,
                                b,
                              )
                            : void 0) && O.circleContainsPoint(s, i)
                          ? ((v = 0), (this.currentHorizSpeed = 0))
                          : (v = b),
                        !1)));
              let S;
              S = p ? ((y = !0), a) : this.currentMoveDir.clone().setLength(v);
              let w = new P.Vector3(S.x, T, S.y);
              p = w.clone();
              return (t.moveTrait.velocity.copy(p), { distance: w, done: y && f });
            }
            findTilesToCheckForBlockers(e, t, i, r) {
              var s = i
                  .clone()
                  .setLength(Math.min(r, E.Coords.LEPTONS_PER_TILE))
                  .add(t)
                  .multiplyScalar(1 / E.Coords.LEPTONS_PER_TILE)
                  .floor(),
                a = this.game.map.tiles.getByMapCoords(s.x, s.y);
              if (!a || a === e) return [e];
              ((s = Math.sign(a.rx - e.rx)), (a = Math.sign(a.ry - e.ry)));
              let n = [e],
                o;
              return (
                s && ((o = this.game.map.tiles.getByMapCoords(e.rx + s, e.ry)), o && n.push(o)),
                a && ((o = this.game.map.tiles.getByMapCoords(e.rx, e.ry + a)), o && n.push(o)),
                s && a && ((o = this.game.map.tiles.getByMapCoords(e.rx + s, e.ry + a)), o && n.push(o)),
                n
              );
            }
            computeCancelDest(e, t) {
              var i = t
                  .clone()
                  .multiplyScalar(1 / E.Coords.LEPTONS_PER_TILE)
                  .floor()
                  .multiplyScalar(E.Coords.LEPTONS_PER_TILE),
                i = t.clone().sub(i);
              return new r.Vector2(e.rx, e.ry).multiplyScalar(E.Coords.LEPTONS_PER_TILE).add(i);
            }
          }),
        );
      },
    };
  },
);
