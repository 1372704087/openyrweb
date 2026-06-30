// === Reconstructed SystemJS module: game/gameobject/trait/WallTrait ===
// deps: ["game/gameobject/trait/interface/NotifyDamage","game/type/LandType","game/gameobject/trait/interface/NotifySpawn","game/gameobject/trait/interface/NotifyUnspawn","game/map/tileFinder/CardinalTileFinder","game/map/wallTypes"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/WallTrait",
  [
    "game/gameobject/trait/interface/NotifyDamage",
    "game/type/LandType",
    "game/gameobject/trait/interface/NotifySpawn",
    "game/gameobject/trait/interface/NotifyUnspawn",
    "game/map/tileFinder/CardinalTileFinder",
    "game/map/wallTypes",
  ],
  function (e, t) {
    "use strict";
    var i, n, r, s, a, o, l;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          o = e;
        },
      ],
      execute: function () {
        ((l = class {
          constructor() {
            ((this.linkedDamageHandled = !1), (this.wallType = 0));
          }
          [r.NotifySpawn.onSpawn](e, t) {
            e.isBuilding() ? this.connectWall(e, t.map) : (this.wallType = e.value);
          }
          [s.NotifyUnspawn.onUnspawn](e, t) {
            this.updateAdjacentWalls(e, t.map);
          }
          [i.NotifyDamage.onDamage](e, t, i, r) {
            if (!this.linkedDamageHandled) {
              var s = Math.floor(i / 2);
              if (s)
                for (var a of t.map.tiles.getAllNeighbourTiles(e.tile))
                  if (a.landType === n.LandType.Wall) {
                    let e = t.map.getObjectsOnTile(a).find((e) => (e.isBuilding() || e.isOverlay()) && e.wallTrait);
                    ((e.wallTrait.linkedDamageHandled = !0),
                      e.healthTrait.inflictDamage(s, r, t),
                      (e.wallTrait.linkedDamageHandled = !1),
                      e.healthTrait.health || t.destroyObject(e, r));
                  }
            }
          }
          updateAdjacentWalls(t, e) {
            let i = new a.CardinalTileFinder(e.tiles, e.mapBounds, t.tile, 1, 1);
            for (i.diagonal = !1; (r = i.getNextTile());) {
              var r = e.getObjectsOnTile(r).find((e) => (e.isBuilding() || e.isOverlay()) && e.name === t.rules.name);
              r && this.connectWall(r, e);
            }
          }
          connectWall(e, i) {
            let t = this.getAdjacentWallData(e.tile, e.name, i);
            (this.updateWallType(
              e,
              t.map((e) => e.direction),
            ),
              t.forEach((e) => {
                let t = this.getAdjacentWallData(e.tile, e.wall.name, i);
                this.updateWallType(
                  e.wall,
                  t.map((e) => e.direction),
                );
              }));
          }
          updateWallType(e, t) {
            let i = [0, 0, 0, 0];
            for (var r of t)
              (0 === r[0] && -1 === r[1] && (i[0] = 1),
                1 === r[0] && 0 === r[1] && (i[1] = 1),
                0 === r[0] && 1 === r[1] && (i[2] = 1),
                -1 === r[0] && 0 === r[1] && (i[3] = 1));
            var s = this.findWallType(i);
            ((e.wallTrait.wallType = s), e.isOverlay() && (e.value = s));
          }
          findWallType(e) {
            for (let i = 0; i < o.wallTypes.length; ++i) {
              var t = o.wallTypes[i];
              if (t[0] === e[0] && t[1] === e[1] && t[2] === e[2] && t[3] === e[3]) return i;
            }
            return (console.warn("Invalid wall directions", e), 0);
          }
          getAdjacentWallData(e, t, i) {
            var r;
            let s = [];
            for (r of [
              [0, 1],
              [0, -1],
              [1, 0],
              [-1, 0],
            ]) {
              var a = { x: e.rx + r[0], y: e.ry + r[1] },
                n = i.tiles.getByMapCoords(a.x, a.y);
              n &&
                (a = i.getObjectsOnTile(n).find((e) => (e.isBuilding() || e.isOverlay()) && e.name === t)) &&
                s.push({ direction: r, tile: n, wall: a });
            }
            return s;
          }
        }),
          e("WallTrait", l));
      },
    };
  },
);
