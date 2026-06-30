// === Reconstructed SystemJS module: game/map/tileFinder/FloodTileFinder ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/map/tileFinder/FloodTileFinder", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "FloodTileFinder",
        (i = class {
          constructor(e, t, i, r, s, a = !0) {
            ((this.tiles = e),
              (this.mapBounds = t),
              (this.startTile = i),
              (this.areConnected = r),
              (this.predicate = s),
              (this.checkBounds = a),
              (this.generator = this.generate()));
          }
          getNextTile() {
            return this.generator.next().value;
          }
          *generate() {
            let e = [this.startTile],
              t = new Set();
            for (; e.length;) {
              var i,
                r = e.pop();
              if (!t.has(r)) {
                (t.add(r), (this.checkBounds && !this.mapBounds.isWithinBounds(r)) || !this.predicate(r) || (yield r));
                for (i of this.tiles.getAllNeighbourTiles(r)) this.areConnected(i, r) && e.push(i);
              }
            }
          }
        }),
      );
    },
  };
});
