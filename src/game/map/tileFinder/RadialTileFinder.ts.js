// === Reconstructed SystemJS module: game/map/tileFinder/RadialTileFinder ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/map/tileFinder/RadialTileFinder", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "RadialTileFinder",
        (i = class {
          constructor(e, t, i, r, s, a, n, o = !0) {
            ((this.tiles = e),
              (this.mapBounds = t),
              (this.startTile = i),
              (this.foundation = r),
              (this.maxDistance = a),
              (this.predicate = n),
              (this.checkBounds = o),
              (this.distance = s),
              (this.generator = this.generate()));
          }
          getNextTile() {
            return this.generator.next().value;
          }
          *generate() {
            var r = (e, t) => {
              var i = this.tiles.getByMapCoords(e, t);
              if (i && (!this.checkBounds || this.mapBounds.isWithinBounds(i)) && this.predicate(i)) return i;
            };
            do {
              var s = this.startTile.rx - this.distance,
                a = this.startTile.ry - this.distance,
                n = this.startTile.rx + this.foundation.width - 1 + this.distance,
                o = this.startTile.ry + this.foundation.height - 1 + this.distance;
              let e, t, i;
              if (0 < this.distance) {
                for (e = n; e >= s; e--) ((i = r(e, o)), i && (yield i));
                for (t = o - 1; t >= a; t--) ((i = r(n, t)), i && (yield i));
                for (e = s; e < n; e++) ((i = r(e, a)), i && (yield i));
                for (t = 1 + a; t < o; t++) ((i = r(s, t)), i && (yield i));
              } else this.predicate(this.startTile) && (yield this.startTile);
            } while ((this.distance++, this.distance <= this.maxDistance));
          }
        }),
      );
    },
  };
});
