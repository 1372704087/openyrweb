// === Reconstructed SystemJS module: game/map/tileFinder/CardinalTileFinder ===
// deps: ["game/math/Vector2"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/map/tileFinder/CardinalTileFinder", ["game/math/Vector2"], function (e, t) {
  "use strict";
  var n, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        n = e;
      },
    ],
    execute: function () {
      e(
        "CardinalTileFinder",
        (i = class {
          constructor(e, t, i, r, s, a = () => !0) {
            ((this.tiles = e),
              (this.mapBounds = t),
              (this.startTile = i),
              (this.maxDistance = s),
              (this.predicate = a),
              (this.dirVec = new n.Vector2(10, 0)),
              (this.finished = !1),
              (this.diagonal = !0),
              (this.distance = r));
          }
          getNextTile() {
            if (!this.finished) {
              let t;
              do {
                let e = { x: this.startTile.rx, y: this.startTile.ry };
                ((e.x += this.distance * Math.sign(this.dirVec.x)),
                  (e.y += this.distance * Math.sign(this.dirVec.y)),
                  this.dirVec.rotateAround(new n.Vector2(), (Math.PI / 4) * (this.diagonal ? 1 : 2)).round());
                var i = this.tiles.getByMapCoords(e.x, e.y);
                if ((i && this.mapBounds.isWithinBounds(i) && this.predicate(i) && (t = i), !this.dirVec.angle())) {
                  if (this.maxDistance && this.distance >= this.maxDistance) return ((this.finished = !0), t);
                  this.distance++;
                }
              } while (!t);
              return t;
            }
          }
        }),
      );
    },
  };
});
