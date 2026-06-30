// === Reconstructed SystemJS module: game/map/tileFinder/DirectionalTileFinder ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/map/tileFinder/DirectionalTileFinder", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "DirectionalTileFinder",
        (i = class {
          constructor(e, t, i, r, s, a, n, o = () => !0, l = !0) {
            ((this.tiles = e),
              (this.mapBounds = t),
              (this.startTile = i),
              (this.maxDistance = s),
              (this.dirX = a),
              (this.dirY = n),
              (this.predicate = o),
              (this.checkBounds = l),
              (this.finished = !1),
              (this.distance = r));
          }
          getNextTile() {
            if (!this.finished) {
              let t;
              do {
                let e = { x: this.startTile.rx, y: this.startTile.ry };
                ((e.x += this.distance * Math.sign(this.dirX)), (e.y += this.distance * Math.sign(this.dirY)));
                var i = this.tiles.getByMapCoords(e.x, e.y);
                if (
                  (i && (!this.checkBounds || this.mapBounds.isWithinBounds(i)) && this.predicate(i) && (t = i),
                  this.maxDistance && this.distance >= this.maxDistance)
                )
                  return ((this.finished = !0), t);
              } while ((this.distance++, !t));
              return t;
            }
          }
        }),
      );
    },
  };
});
