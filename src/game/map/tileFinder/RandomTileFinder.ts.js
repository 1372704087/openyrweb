// === Reconstructed SystemJS module: game/map/tileFinder/RandomTileFinder ===
// deps: ["game/math/GameMath"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/map/tileFinder/RandomTileFinder", ["game/math/GameMath"], function (e, t) {
  "use strict";
  var l, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        l = e;
      },
    ],
    execute: function () {
      e(
        "RandomTileFinder",
        (i = class {
          constructor(e, t, i, r, s, a, n = !1, o = !0) {
            ((this.tiles = e),
              (this.mapBounds = t),
              (this.startTile = i),
              (this.maxDistance = r),
              (this.rng = s),
              (this.predicate = a),
              (this.includeStartTile = n),
              (this.checkBounds = o),
              (this.pool = []),
              (this.pool = new Array(l.GameMath.pow(2 * this.maxDistance + 1, 2)).fill(0).map((e, t) => t)),
              (this.generator = this.generate()));
          }
          getNextTile() {
            return this.generator.next().value;
          }
          *generate() {
            for (
              var e = (e, t) => {
                  var i = this.tiles.getByMapCoords(e, t);
                  if (this.includeStartTile || i !== this.startTile)
                    return i && (!this.checkBounds || this.mapBounds.isWithinBounds(i)) && this.predicate(i)
                      ? i
                      : void 0;
                },
                t = 2 * this.maxDistance + 1;
              this.pool.length;
            ) {
              var i = 1 < this.pool.length ? this.rng.generateRandomInt(0, this.pool.length) : 0,
                r = this.pool.splice(i, 1)[0],
                i = r % t,
                r = Math.floor(r / t),
                r = e(this.startTile.rx - this.maxDistance + i, this.startTile.ry - this.maxDistance + r);
              r && (yield r);
            }
          }
        }),
      );
    },
  };
});
