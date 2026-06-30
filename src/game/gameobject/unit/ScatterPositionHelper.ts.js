// === Reconstructed SystemJS module: game/gameobject/unit/ScatterPositionHelper ===
// deps: ["game/gameobject/unit/MovePositionHelper","game/map/tileFinder/RandomTileFinder"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/unit/ScatterPositionHelper",
  ["game/gameobject/unit/MovePositionHelper", "game/map/tileFinder/RandomTileFinder"],
  function (e, t) {
    "use strict";
    var i, u, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          u = e;
        },
      ],
      execute: function () {
        e(
          "ScatterPositionHelper",
          (r = class {
            constructor(e) {
              ((this.game = e), (this.movePositionHelper = new i.MovePositionHelper(e.map)));
            }
            findPositions(e, t) {
              let i = new Set(),
                r = new Map();
              for (var s of e) {
                var a = this.findFreeMovePosition(s, i, t);
                a && (r.set(s, a), i.add(a.tile));
              }
              return r;
            }
            findFreeMovePosition(i, e, { ignoredBlockers: t, excludedTiles: r, noSlopes: s } = {}) {
              let a = this.game.map,
                n = i.onBridge ? a.tileOccupation.getBridgeOnTile(i.tile) : void 0,
                o = new u.RandomTileFinder(a.tiles, a.mapBounds, i.tile, 1, this.game, (e) => {
                  if (r?.includes(e)) return !1;
                  var t = a.tileOccupation.getBridgeOnTile(e);
                  return (
                    ((t && this.movePositionHelper.isEligibleTile(e, t, n, i.tile)) ||
                      this.movePositionHelper.isEligibleTile(e, void 0, n, i.tile)) &&
                    (!s || 0 === e.rampType)
                  );
                }),
                l,
                c;
              for (;;) {
                var h = o.getNextTile();
                if (!h) break;
                if (
                  ((l = h),
                  (c = a.tileOccupation.getBridgeOnTile(h)),
                  c && !this.movePositionHelper.isEligibleTile(h, c, n, i.tile) && (c = void 0),
                  !e.has(h))
                ) {
                  let e = a.terrain.findObstacles({ tile: h, onBridge: c }, i);
                  if ((t && t.length && (e = e.filter((e) => !t.includes(e.obj))), !e.length)) break;
                }
              }
              if (l) return { tile: l, onBridge: c };
            }
          }),
        );
      },
    };
  },
);
