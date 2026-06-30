// === Reconstructed SystemJS module: game/gameobject/trait/RallyTrait ===
// deps: ["engine/type/TerrainType","game/map/tileFinder/RadialTileFinder","game/rules/TechnoRules","game/type/MovementZone","game/type/SpeedType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/RallyTrait",
  [
    "engine/type/TerrainType",
    "game/map/tileFinder/RadialTileFinder",
    "game/rules/TechnoRules",
    "game/type/MovementZone",
    "game/type/SpeedType",
  ],
  function (e, t) {
    "use strict";
    var l, c, h, u, d, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
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
      ],
      execute: function () {
        e(
          "RallyTrait",
          (i = class {
            getRallyPoint() {
              return this.rallyPoint;
            }
            changeRallyPoint(e, t, i) {
              var r = this.findValidRallyPoint(t, e, i.map);
              r && (this.rallyPoint = r);
            }
            findValidRallyPoint(i, e, r) {
              let t = new c.RadialTileFinder(
                  r.tiles,
                  r.mapBounds,
                  e,
                  { width: 1, height: 1 },
                  0,
                  20,
                  (e) =>
                    (i.rules.naval || e.terrainType !== l.TerrainType.Water) &&
                    !r.tileOccupation.isTileOccupiedBy(e, i),
                ),
                s = t.getNextTile();
              if (!s && i.factoryTrait?.type === h.FactoryType.NavalUnitType) {
                var { width: a, height: n } = i.getFoundation();
                for (let t = 0; t < a; t++)
                  for (let e = 0; e < n; e++) {
                    var o = r.tiles.getByMapCoords(i.tile.rx + t, i.tile.ry + e);
                    if (!o) break;
                    if (0 < r.terrain.getPassableSpeed(o, d.SpeedType.Float, !1, !1)) {
                      s = o;
                      break;
                    }
                  }
              }
              return s;
            }
            findRallyNodeForUnit(e, t) {
              if (this.rallyPoint) {
                var i = this.findRallyPointforUnit(e, this.rallyPoint, t, !0);
                return { tile: i, onBridge: e.rules.naval ? void 0 : t.tileOccupation.getBridgeOnTile(i) };
              }
            }
            findRallyPointforUnit(i, e, r, s, a) {
              let n = i.rules.naval ? void 0 : r.tileOccupation.getBridgeOnTile(e),
                o = i.rules.movementZone === u.MovementZone.Fly,
                t = new c.RadialTileFinder(r.tiles, r.mapBounds, e, { width: 1, height: 1 }, 0, 5, (e) => {
                  var t = !n || n.isHighBridge() ? r.tileOccupation.getBridgeOnTile(e) : void 0;
                  return (
                    !(o ? [] : r.terrain.findObstacles({ tile: e, onBridge: t }, i)).length &&
                    (void 0 === a || Math.abs(a - (e.z + (t?.tileElevation ?? 0))) < 4) &&
                    (!s || !r.getObjectsOnTile(e).find((e) => e.isBuilding() && !e.isDestroyed)) &&
                    (o || 0 < r.terrain.getPassableSpeed(e, i.rules.speedType, i.isInfantry(), !!t))
                  );
                });
              return t.getNextTile() ?? e;
            }
          }),
        );
      },
    };
  },
);
