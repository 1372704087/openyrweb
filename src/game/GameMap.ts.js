// === Reconstructed SystemJS module: game/GameMap ===
// deps: ["game/map/TileCollection","game/map/TileOccupation","game/map/Terrain","game/map/MapBounds","game/map/Bridges","util/QuadTree","game/map/TileOcclusion","game/theater/AutoLat","engine/TheaterType","game/math/Vector2","game/math/Box2"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/GameMap",
  [
    "game/map/TileCollection",
    "game/map/TileOccupation",
    "game/map/Terrain",
    "game/map/MapBounds",
    "game/map/Bridges",
    "util/QuadTree",
    "game/map/TileOcclusion",
    "game/theater/AutoLat",
    "engine/TheaterType",
    "game/math/Vector2",
    "game/math/Box2",
  ],
  function (e, t) {
    "use strict";
    var l, c, h, u, d, g, p, m, f, y, T, i;
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
        function (e) {
          g = e;
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
      ],
      execute: function () {
        e(
          "GameMap",
          (i = class {
            get startingLocations() {
              return this.mapFile.startingLocations;
            }
            constructor(e, t, i, r) {
              ((this.mapFile = e),
                (this.tiles = new l.TileCollection(this.mapFile.tiles, t, i.general, r)),
                (this.mapBounds = new u.MapBounds().fromMapFile(this.mapFile, this.tiles)),
                (this.tileOccupation = new c.TileOccupation(this.tiles)),
                (this.tileOcclusion = new p.TileOcclusion(this.tiles)),
                (this.terrain = new h.Terrain(
                  this.tiles,
                  this.mapFile.theaterType,
                  this.mapBounds,
                  this.tileOccupation,
                  i,
                )),
                (this.bridges = new d.Bridges(t, this.tiles, this.tileOccupation, this.mapBounds, i)));
              let s = this.mapFile.tags;
              for (let o of this.mapFile.cellTags) {
                let e = this.tiles.getByMapCoords(o.coords.x, o.coords.y);
                e && (e.tag = s.find((e) => e.id === o.tagId));
              }
              var a = this.tiles.getMapSize(),
                n = Math.max(a.width, a.height) / 5;
              ((this.technosByTile = new g.QuadTree(new T.Box2(new y.Vector2(0, 0), new y.Vector2(a.width, a.height)), {
                getKey: (e) => {
                  var t = e.isBuilding() ? e.centerTile : e.tile;
                  return new y.Vector2(t.rx, t.ry);
                },
                maxDepth: this.computeQuadDepth(n),
                splitThreshold: 10,
                joinThreshold: 5,
              })),
                this.mapFile.theaterType !== f.TheaterType.Snow && m.AutoLat.calculate(this.tiles, t));
            }
            computeQuadDepth(e) {
              if (e <= 1) return 1;
              let t = 0;
              for (; 1 <= e / 2;) ((e /= 2), t++);
              return t + (1 < e ? 1 : 0);
            }
            getLighting() {
              return this.mapFile.lighting;
            }
            getIonLighting() {
              return this.mapFile.ionLighting;
            }
            getTheaterType() {
              return this.mapFile.theaterType;
            }
            getTags() {
              return this.mapFile.tags;
            }
            getTriggers() {
              return this.mapFile.triggers;
            }
            getCellTags() {
              return this.mapFile.cellTags;
            }
            getVariables() {
              return this.mapFile.variables;
            }
            getWaypoint(t) {
              return this.mapFile.waypoints.find((e) => e.number === t);
            }
            getTileAtWaypoint(e) {
              var t = this.getWaypoint(e);
              if (t) {
                t = this.tiles.getByMapCoords(t.rx, t.ry);
                if (t) return t;
              }
            }
            isWithinBounds(e) {
              return this.mapBounds.isWithinBounds(e);
            }
            clampWithinBounds(e) {
              var t = this.mapBounds.clampWithinBounds(e);
              let i = this.tiles.getByDisplayCoords(t.dx, t.dy);
              if (i && this.mapBounds.isWithinBounds(i)) {
                let e = i,
                  t = i.z;
                for (; 0 <= t && e && this.mapBounds.isWithinBounds(e);)
                  ((i = e), (e = this.tiles.getByDisplayCoords(e.dx, e.dy + 2)), (t -= 2));
              } else {
                let e = 0;
                for (; !i || !this.mapBounds.isWithinBounds(i);) {
                  if (30 < e) throw new Error("Exceeded max elevation while trying to clamp tile to map bounds");
                  ((i = this.tiles.getByDisplayCoords(t.dx, t.dy + e)), (e += 2));
                }
              }
              return i;
            }
            isWithinHardBounds(e) {
              return this.mapBounds.isWithinHardBounds(e);
            }
            getInitialMapObjects() {
              return {
                terrains: this.mapFile.terrains,
                overlays: this.mapFile.overlays,
                smudges: this.mapFile.smudges,
                technos: [
                  ...this.mapFile.structures,
                  ...this.mapFile.infantries,
                  ...this.mapFile.vehicles,
                  ...this.mapFile.aircrafts,
                ],
              };
            }
            getObjectsOnTile(e) {
              return this.tileOccupation.getObjectsOnTile(e);
            }
            getGroundObjectsOnTile(e) {
              return this.tileOccupation.getGroundObjectsOnTile(e);
            }
            getTileZone(e, t = !1) {
              return this.tileOccupation.getTileZone(e, t);
            }
            dispose() {
              (this.terrain.dispose(), this.bridges.dispose());
            }
          }),
        );
      },
    };
  },
);
