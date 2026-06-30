// === Reconstructed SystemJS module: game/gameobject/trait/MoveTrait ===
// deps: ["game/gameobject/task/move/MoveTask","game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/interface/NotifyDestroy","game/gameobject/unit/ZoneType","game/gameobject/infantry/InfDeathType","game/event/ObjectTeleportEvent","game/gameobject/common/DeathType","game/gameobject/trait/interface/NotifyTeleport","game/type/LocomotorType","game/gameobject/locomotor/JumpjetLocomotor","game/type/SpeedType","game/gameobject/locomotor/WingedLocomotor","game/gameobject/infantry/StanceType","game/trait/interface/NotifyTileChange","game/gameobject/trait/interface/NotifyTileChange","game/event/EnterTileEvent","game/math/Vector3","game/trait/interface/NotifyElevationChange"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/MoveTrait",
  [
    "game/gameobject/task/move/MoveTask",
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/trait/interface/NotifyDestroy",
    "game/gameobject/unit/ZoneType",
    "game/gameobject/infantry/InfDeathType",
    "game/event/ObjectTeleportEvent",
    "game/gameobject/common/DeathType",
    "game/gameobject/trait/interface/NotifyTeleport",
    "game/type/LocomotorType",
    "game/gameobject/locomotor/JumpjetLocomotor",
    "game/type/SpeedType",
    "game/gameobject/locomotor/WingedLocomotor",
    "game/gameobject/infantry/StanceType",
    "game/trait/interface/NotifyTileChange",
    "game/gameobject/trait/interface/NotifyTileChange",
    "game/event/EnterTileEvent",
    "game/math/Vector3",
    "game/trait/interface/NotifyElevationChange",
  ],
  function (t, e) {
    "use strict";
    var i, r, s, h, u, o, d, l, a, n, g, c, p, m, f, y, T, v, b, S, w, E, C;
    e && e.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          c = e;
        },
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
      ],
      execute: function () {
        var e;
        (((e = b || t("MoveState", (b = {})))[(e.Idle = 0)] = "Idle"),
          (e[(e.ReachedNextWaypoint = 1)] = "ReachedNextWaypoint"),
          (e[(e.PlanMove = 2)] = "PlanMove"),
          (e[(e.Moving = 3)] = "Moving"),
          ((e = S || t("MoveResult", (S = {})))[(e.Success = 0)] = "Success"),
          (e[(e.Cancel = 1)] = "Cancel"),
          (e[(e.CloseEnough = 2)] = "CloseEnough"),
          (e[(e.Fail = 3)] = "Fail"),
          ((e = w || t("CollisionState", (w = {})))[(e.Waiting = 0)] = "Waiting"),
          (e[(e.Resolved = 1)] = "Resolved"),
          (E = (e) => e instanceof i.MoveTask || (e.children[0] && E(e.children[0]))),
          (C = class {
            get baseSpeed() {
              return (
                this.gameObject.rules.speed *
                (this.gameObject.veteranTrait?.getVeteranSpeedMultiplier() ?? 1) *
                this.gameObject.crateBonuses.speed *
                (this.gameObject.isVehicle() &&
                this.gameObject.healthTrait.health <= 50 &&
                this.gameObject.rules.locomotor !== a.LocomotorType.Hover
                  ? 0.75
                  : 1) *
                (1 - this.speedPenalty)
              );
            }
            constructor(e, t) {
              ((this.gameObject = e),
                (this.tileOccupation = t),
                (this.disabled = !1),
                (this.speedPenalty = 0),
                (this.velocity = new T.Vector3()),
                (this.reservedPathNodes = []),
                (this.moveState = b.Idle),
                (this.collisionState = w.Resolved));
            }
            isDisabled() {
              return this.disabled;
            }
            setDisabled(e) {
              this.disabled = e;
            }
            isMoving() {
              return this.moveState === b.Moving;
            }
            isIdle() {
              return this.moveState === b.Idle;
            }
            isWaiting() {
              return this.collisionState === w.Waiting;
            }
            [r.NotifyTick.onTick](e, t) {
              var i;
              (this.moveState !== b.Idle &&
                this.collisionState === w.Resolved &&
                (((i = e.unitOrderTrait.getCurrentTask()) && E(i)) ||
                  (this.velocity.set(0, 0, 0),
                  (this.moveState = b.Idle),
                  (this.locomotor = void 0),
                  !i &&
                    !e.attackTrait?.currentTarget &&
                    e.isVehicle() &&
                    e.turretTrait &&
                    (e.turretTrait.desiredFacing = e.direction))),
                this.moveState === b.Idle &&
                  (e.rules.locomotor === a.LocomotorType.Jumpjet
                    ? n.JumpjetLocomotor.tickStationary(e, t)
                    : e.isAircraft() &&
                      e.rules.locomotor === a.LocomotorType.Aircraft &&
                      c.WingedLocomotor.tickStationary(e, t)));
            }
            [s.NotifyDestroy.onDestroy](e, t) {
              this.unreservePathNodes();
            }
            teleportUnitToTile(e, t, i, r, s) {
              let a = this.gameObject;
              var n = a.tile;
              (a.traits.filter(l.NotifyTeleport).forEach((e) => {
                e[l.NotifyTeleport.onBeforeTeleport](a, s, i, r);
              }),
                (a.position.tileElevation = a.tileElevation),
                (a.position.tile = e),
                (a.position.subCell = a.position.desiredSubCell),
                this.handleTileChange(n, t, !0, s, !0),
                r ||
                  (this.unreservePathNodes(),
                  (this.speedPenalty = 0),
                  this.velocity.set(0, 0, 0),
                  (this.moveState = b.Idle),
                  (this.collisionState = w.Resolved),
                  (this.locomotor = void 0),
                  (this.currentWaypoint = void 0),
                  (this.lastTargetOffset = void 0),
                  (this.lastVelocity = void 0),
                  (this.lastMoveResult = S.Cancel),
                  a.isVehicle() &&
                    ((a.spinVelocity = 0), a.turretTrait && (a.turretTrait.desiredFacing = a.direction))),
                (this.lastTeleportTick = s.currentTick),
                s.events.dispatch(new o.ObjectTeleportEvent(a, i, n)));
            }
            handleTileChange(t, e, i, r, s = !1) {
              const a = this.gameObject;
              if (
                (r.map.tileOccupation.unoccupyTileRange(t, a),
                r.map.tileOccupation.occupyTileRange(a.tile, a),
                r.map.technosByTile.updateObject(a),
                a.zone !== h.ZoneType.Air)
              ) {
                var n = a.onBridge ? r.map.tileOccupation.getBridgeOnTile(t) : void 0,
                  o = a.onBridge ? t.onBridgeLandType : t.landType,
                  l = e ? a.tile.onBridgeLandType : a.tile.landType;
                (o !== l &&
                  (0 < r.rules.getLandRules(l).getSpeedModifier(a.rules.speedType) ||
                    a.rules.speedType === g.SpeedType.Amphibious ||
                    s) &&
                  (a.zone = h.getZoneType(l)),
                  e !== n &&
                    ((a.position.tileElevation += -(n?.tileElevation ?? 0) + (e?.tileElevation ?? 0)),
                    (a.onBridge = !!e)));
                var c,
                  n = a.moveTrait.reservedPathNodes.findIndex((e) => e.tile === a.tile);
                if ((-1 !== n && a.moveTrait.reservedPathNodes.splice(n, 1), a.crusher))
                  for (c of r.map
                    .getGroundObjectsOnTile(a.tile)
                    .filter(
                      (e) =>
                        (!e.isUnit() || e.onBridge === a.onBridge) &&
                        e.rules.crushable &&
                        !(e.isInfantry() && e.stance === p.StanceType.Paradrop) &&
                        (!(e.isTechno() && !i) || !r.areFriendly(e, a)),
                    ))
                    c.isDestroyed ||
                      (c.isInfantry() && (c.infDeathType = u.InfDeathType.None),
                      a.isVehicle() && c.isOverlay() && c.rules.wall && a.applyRocking(0, 0.5),
                      (c.deathType = d.DeathType.Crush),
                      r.destroyObject(c, { player: a.owner, obj: a }));
                a.onBridge ||
                  ((n = r.map.tileOccupation
                    .getGroundObjectsOnTile(a.tile)
                    .find((e) => e.isOverlay() && e.rules.crate)) &&
                    r.crateGeneratorTrait.pickupCrate(a, n, r));
              }
              (r.traits.filter(m.NotifyTileChange).forEach((e) => {
                e[m.NotifyTileChange.onTileChange](a, r, t, s);
              }),
                a.traits.filter(f.NotifyTileChange).forEach((e) => {
                  e[f.NotifyTileChange.onTileChange](a, r, t, s);
                }),
                r.events.dispatch(new y.EnterTileEvent(a.tile, a)));
            }
            handleElevationChange(t, i) {
              i.traits.filter(v.NotifyElevationChange).forEach((e) => {
                e[v.NotifyElevationChange.onElevationChange](this.gameObject, i, t);
              });
            }
            unreservePathNodes() {
              (this.reservedPathNodes.forEach((e) => {
                e.tile !== this.gameObject.tile && this.tileOccupation.unoccupySingleTile(e.tile, this.gameObject);
              }),
                (this.reservedPathNodes.length = 0));
            }
            dispose() {
              this.gameObject = void 0;
            }
          }),
          t("MoveTrait", C));
      },
    };
  },
);
