// === Reconstructed SystemJS module: game/superweapon/ChronoSphereEffect ===
// deps: ["game/gameobject/common/DeathType","game/gameobject/infantry/StanceType","game/gameobject/unit/ZoneType","game/map/tileFinder/RadialTileFinder","game/type/MovementZone","game/type/SpeedType","game/superweapon/SuperWeaponEffect"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/superweapon/ChronoSphereEffect",
  [
    "game/gameobject/common/DeathType",
    "game/gameobject/infantry/StanceType",
    "game/gameobject/unit/ZoneType",
    "game/map/tileFinder/RadialTileFinder",
    "game/type/MovementZone",
    "game/type/SpeedType",
    "game/superweapon/SuperWeaponEffect",
  ],
  function (e, t) {
    "use strict";
    var p, m, f, y, T, v, i, r;
    t && t.id;
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
          i = e;
        },
      ],
      execute: function () {
        ((r = class extends i.SuperWeaponEffect {
          constructor(e, t, i, r) {
            (super(e, t, i), (this.tile2 = r), (this.objectsToTeleport = []));
          }
          onStart(t) {
            this.delayTicks = t.rules.general.chronoDelay;
            let i = t.map.tiles;
            for (let o = -1; o <= 1; o++)
              for (let e = -1; e <= 1; e++) {
                var r = i.getByMapCoords(this.tile.rx + o, this.tile.ry + e);
                if (r) {
                  var s,
                    a = !!r.onBridgeLandType,
                    n = i.getByMapCoords(this.tile2.rx + o, this.tile2.ry + e);
                  for (s of t.map.getGroundObjectsOnTile(r))
                    !s.isUnit() ||
                      s.tile !== r ||
                      s.onBridge !== a ||
                      (s.isInfantry() && s.stance === m.StanceType.Paradrop && 2 < s.tileElevation) ||
                      s.isDisposed ||
                      s.invulnerableTrait.isActive() ||
                      ((s.rules.organic && !s.rules.teleporter) || !n
                        ? t.destroyObject(s, { player: this.owner })
                        : s.warpedOutTrait.isActive() ||
                          (s.warpedOutTrait.setActive(!0, !0, t),
                          this.objectsToTeleport.push({ obj: s, destTile: n })));
                }
              }
          }
          onTick(l) {
            if ((0 < this.delayTicks && this.delayTicks--, this.delayTicks)) return !1;
            for (let { obj: d, destTile: g } of this.objectsToTeleport)
              if (d.isSpawned) {
                let i = !1,
                  r = g ? l.map.tileOccupation.getBridgeOnTile(g) : void 0,
                  s = l.map.getGroundObjectsOnTile(g),
                  a = s.find((e) => e.isBuilding());
                var c = s.some((e) => l.rules.general.padAircraft.includes(e.name)),
                  h =
                    l.rules.general.padAircraft.includes(d.name) &&
                    !!a?.helipadTrait &&
                    !!a.dockTrait?.getAllDockTiles().includes(g) &&
                    !a.dockTrait.hasReservedDockAt(a.dockTrait.getDockNumberByTile(g)) &&
                    a.owner === d.owner;
                let e = !1,
                  n = d.rules.speedType,
                  o = d.isInfantry();
                d.rules.movementZone === T.MovementZone.Fly && (n = v.SpeedType.Wheel);
                var u = l.map.mapBounds.isWithinBounds(g);
                if (!(h || (l.map.terrain.getPassableSpeed(g, n, o, !!r) && u))) {
                  let t = !1;
                  if (!c && (0 < l.map.terrain.getPassableSpeed(g, n, o, !!r, void 0, !0) || !u)) {
                    a && (i = !0);
                    let e = new y.RadialTileFinder(
                      l.map.tiles,
                      l.map.mapBounds,
                      g,
                      { width: 1, height: 1 },
                      1,
                      15,
                      (e) =>
                        0 < l.map.terrain.getPassableSpeed(e, n, o, !!e.onBridgeLandType) &&
                        !l.map.terrain.findObstacles({ tile: e, onBridge: !!e.onBridgeLandType }, d).length,
                    );
                    u = e.getNextTile();
                    u &&
                      ((g = u),
                      (r = l.map.tileOccupation.getBridgeOnTile(g)),
                      (s = l.map.getGroundObjectsOnTile(g)),
                      (t = !0));
                  }
                  t ||
                    (d.moveTrait.teleportUnitToTile(g, r, !0, !1, l),
                    d.warpedOutTrait.setActive(!1, !0, l),
                    l.map.getTileZone(g) === f.ZoneType.Water && (d.deathType = p.DeathType.Sink),
                    l.destroyObject(d, { player: this.owner }),
                    (e = !0));
                }
                for (let t of s)
                  t.isDisposed ||
                    (t.isUnit() &&
                      (this.objectsToTeleport.some(({ obj: e }) => e === t) ||
                        (t.onBridge !== !!r && t.tile === g) ||
                        2 < Math.abs(t.tileElevation - d.tileElevation) ||
                        (t.isInfantry() && t.stance !== m.StanceType.Paradrop && (t.deathType = p.DeathType.Crush),
                        l.destroyObject(t, { player: this.owner, obj: d }))));
                if (!e) {
                  if ((d.moveTrait.teleportUnitToTile(g, r, !0, !1, l), h && a?.dockTrait)) {
                    h = a.dockTrait.getAllDockTiles().indexOf(g);
                    if ((a.dockTrait.undockUnitAt(h), a.dockTrait.hasReservedDockAt(h)))
                      throw new Error("Target building dock is already reserved by another unit");
                    a.dockTrait.dockUnitAt(d, h);
                  }
                  i
                    ? d.warpedOutTrait.setTimed(l.rules.general.chronoDelay, !1, l)
                    : d.warpedOutTrait.setActive(!1, !0, l);
                }
              }
            return !0;
          }
        }),
          e("ChronoSphereEffect", r));
      },
    };
  },
);
