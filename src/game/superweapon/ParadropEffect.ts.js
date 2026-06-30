// === Reconstructed SystemJS module: game/superweapon/ParadropEffect ===
// deps: ["game/Coords","engine/type/ObjectType","game/gameobject/Infantry","game/gameobject/infantry/StanceType","game/gameobject/task/move/MoveTask","game/gameobject/task/ParadropTask","game/gameobject/trait/UnlandableTrait","game/gameobject/unit/FacingUtil","game/gameobject/unit/RangeHelper","game/gameobject/unit/VeteranLevel","game/gameobject/unit/ZoneType","game/GameSpeed","game/map/tileFinder/RadialTileFinder","game/math/Vector2","util/bresenham","game/superweapon/SuperWeaponEffect"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/superweapon/ParadropEffect",
  [
    "game/Coords",
    "engine/type/ObjectType",
    "game/gameobject/Infantry",
    "game/gameobject/infantry/StanceType",
    "game/gameobject/task/move/MoveTask",
    "game/gameobject/task/ParadropTask",
    "game/gameobject/trait/UnlandableTrait",
    "game/gameobject/unit/FacingUtil",
    "game/gameobject/unit/RangeHelper",
    "game/gameobject/unit/VeteranLevel",
    "game/gameobject/unit/ZoneType",
    "game/GameSpeed",
    "game/map/tileFinder/RadialTileFinder",
    "game/math/Vector2",
    "util/bresenham",
    "game/superweapon/SuperWeaponEffect",
  ],
  function (t, e) {
    "use strict";
    var c, h, s, r, u, d, g, p, i, m, f, a, y, T, o, n, v, l, b;
    e && e.id;
    return {
      setters: [
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          r = e;
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
          p = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          f = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          y = e;
        },
        function (e) {
          T = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          n = e;
        },
      ],
      execute: function () {
        var e;
        (((e = v = v || {})[(e.Spawning = 0)] = "Spawning"),
          (e[(e.EnRoute = 1)] = "EnRoute"),
          (e[(e.Dropping = 2)] = "Dropping"),
          (e[(e.TurningAround = 3)] = "TurningAround"),
          (l = 5 * a.GameSpeed.BASE_TICKS_PER_SECOND),
          (b = class extends n.SuperWeaponEffect {
            constructor(e, t, i, r, s) {
              (super(e, t, i),
                (this.paradropSquad = r),
                (this.state = v.Spawning),
                (this.failedAttempts = 0),
                (this.spawnDelay = s * l));
            }
            onStart(e) {
              ((this.passengerRules = e.rules.getObject(this.paradropSquad.inf, h.ObjectType.Infantry)),
                (this.passengerCount = this.paradropSquad.num));
            }
            computeFlightPath(e, t, i) {
              if (t.equals(e)) throw new Error("Source and destination must be different");
              let r = e.clone().sub(t);
              var s = i.rules.general.paradrop.paradropRadius / c.Coords.LEPTONS_PER_TILE,
                s = t
                  .clone()
                  .add(r.clone().setLength(r.length() + 2 * s))
                  .floor();
              let a = o
                .bresenham(t.x, t.y, s.x, s.y)
                .map((e) => i.map.tiles.getByMapCoords(e.x, e.y) ?? i.map.tiles.getPlaceholderTile(e.x, e.y));
              for (; a.length;) {
                var n = a[0],
                  n = c.Coords.tileToWorld(n.rx + 0.5, n.ry + 0.5);
                if (i.map.isWithinHardBounds(new T.Vector2(n.x, n.y))) break;
                a.shift();
              }
              if (!a.length) throw new Error("No valid paradrop path found");
              return { fromTile: a[0], toTile: a[a.length - 1] };
            }
            onTick(s) {
              if (this.state === v.Spawning) {
                if (0 < this.spawnDelay) return (this.spawnDelay--, !1);
                var a = s.map.tiles.getMapSize(),
                  n = [
                    new T.Vector2(0, 0),
                    new T.Vector2(Math.floor(a.width / 2), 0),
                    new T.Vector2(0, Math.floor(a.height / 2)),
                  ][s.generateRandomInt(0, 2)];
                let t = this.passengerRules.speedType,
                  e = new y.RadialTileFinder(
                    s.map.tiles,
                    s.map.mapBounds,
                    this.tile,
                    { width: 1, height: 1 },
                    0,
                    50,
                    (e) => 0 < s.map.terrain.getPassableSpeed(e, t, !0, !!e.onBridgeLandType),
                  );
                var o = (this.targetTile = e.getNextTile());
                if (!o) return !0;
                let i = new T.Vector2(o.rx, o.ry);
                var { fromTile: l, toTile: a } = this.computeFlightPath(i, n, s),
                  o = s.rules.general.paradrop.paradropPlane,
                  n = s.rules.getObject(o, h.ObjectType.Aircraft);
                let r = (this.pdPlane = s.createUnitForPlayer(n, this.owner));
                (s.spawnObject(r, l),
                  (r.direction = p.FacingUtil.fromMapCoords(i.clone().sub(new T.Vector2(l.rx, l.ry)))),
                  (r.position.tileElevation = c.Coords.worldToTileHeight(
                    r.rules.flightLevel ?? s.rules.general.flightLevel,
                  )),
                  (r.zone = f.ZoneType.Air),
                  (r.onBridge = !1),
                  r.unitOrderTrait.addTask(new u.MoveTask(s, a, !1, { allowOutOfBoundsTarget: !0 })),
                  r.traits.get(g.UnlandableTrait).setEnabled(!1),
                  (this.state = v.EnRoute));
              }
              if (!this.pdPlane || this.pdPlane.isDestroyed || this.pdPlane.isCrashing) return !0;
              o = this.targetTile;
              if (!this.pdPlane.unitOrderTrait.hasTasks())
                return (
                  (this.state = v.TurningAround),
                  this.pdPlane.unitOrderTrait.addTask(new u.MoveTask(s, o, !1, { allowOutOfBoundsTarget: !0 })),
                  !1
                );
              n = s.rules.general.paradrop.paradropRadius / c.Coords.LEPTONS_PER_TILE;
              let e = new i.RangeHelper(s.map.tileOccupation);
              l = e.isInTileRange(this.pdPlane.tile, o, 0, n);
              if ((this.state === v.EnRoute && l && (this.state = v.Dropping), this.state === v.Dropping))
                if (l && 0 < this.passengerCount) {
                  a = this.pdPlane.tile;
                  let t = !!a.onBridgeLandType;
                  if (5 < this.failedAttempts && s.map.mapBounds.isWithinBounds(a))
                    return ((this.passengerCount = 0), !1);
                  if (!s.map.terrain.getPassableSpeed(a, this.passengerRules.speedType, !0, t)) return !1;
                  let e = s.map.getGroundObjectsOnTile(a);
                  if (
                    e.some(
                      (e) =>
                        (e.isVehicle() && e.onBridge === t) ||
                        (e.isBuilding() && !e.isDestroyed) ||
                        (e.isInfantry() && e.stance === r.StanceType.Paradrop),
                    )
                  )
                    return !1;
                  n = this.findFreeSubCell(s, a);
                  if (!n) return !1;
                  this.passengerCount--;
                  let i = s.createUnitForPlayer(this.passengerRules, this.owner);
                  ((i.stance = r.StanceType.Paradrop),
                    (i.position.tileElevation = this.pdPlane.tileElevation),
                    (i.position.subCell = n),
                    (i.onBridge = t),
                    i.rules.trainable &&
                      this.owner.canProduceVeteran(i.rules) &&
                      i.veteranTrait?.setVeteranLevel(m.VeteranLevel.Veteran),
                    s.spawnObject(i, a),
                    i.unitOrderTrait.addTask(new d.ParadropTask(s).setCancellable(!1)));
                } else {
                  if (!(0 < this.passengerCount))
                    return (
                      this.pdPlane.unitOrderTrait.getCurrentTask().forceCancel(this.pdPlane),
                      this.pdPlane.traits.get(g.UnlandableTrait).setEnabled(!0),
                      !0
                    );
                  (this.failedAttempts++,
                    (this.state = v.TurningAround),
                    this.pdPlane.unitOrderTrait.getCurrentTask().updateTarget(o, !!o.onBridgeLandType));
                }
              return (
                this.state === v.TurningAround &&
                  l &&
                  ((o = this.computeFlightPath(
                    new T.Vector2(o.rx, o.ry),
                    new T.Vector2(this.pdPlane.tile.rx, this.pdPlane.tile.ry),
                    s,
                  )["toTile"]),
                  this.pdPlane.unitOrderTrait.getCurrentTask().updateTarget(o, !1),
                  (this.state = v.EnRoute)),
                !1
              );
            }
            findFreeSubCell(t, e) {
              let i = t.map
                .getGroundObjectsOnTile(e)
                .filter((e) => e.isTerrain())
                .map((e) => e.rules.getOccupiedSubCells(t.map.getTheaterType()))
                .flat();
              var r = s.Infantry.SUB_CELLS.filter((e) => -1 === i.indexOf(e));
              if (r.length) return 1 < r.length ? r[t.generateRandomInt(0, r.length - 1)] : r[0];
            }
          }),
          t("ParadropEffect", b));
      },
    };
  },
);
