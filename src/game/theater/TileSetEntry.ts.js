// === Reconstructed SystemJS module: game/theater/TileSetEntry ===
// deps: ["game/Coords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/theater/TileSetEntry", ["game/Coords"], function (e, t) {
  "use strict";
  var s, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        s = e;
      },
    ],
    execute: function () {
      e(
        "TileSetEntry",
        (i = class {
          constructor(e, t) {
            ((this.owner = e), (this.index = t), (this.files = []));
          }
          addFile(e) {
            this.files.push(e);
          }
          setAnimation(e) {
            this.animation = e;
          }
          getAnimation() {
            return this.animation;
          }
          getTmpFile(e, t, i = !1) {
            if (this.files.length) {
              var r = this.files[t(0, this.files.length - 1)];
              return r.images[Math.min(e, r.images.length - 1)].hasDamagedData
                ? this.files[Math.min(i ? 1 : 0, this.files.length - 1)]
                : r;
            }
          }
          getRelativeTilePositions() {
            return this.files[0].images.map(({ x: e, y: t, height: i }, r) => ({
              subTile: r,
              rx: (e + 2 * t) / 2 / s.Coords.ISO_TILE_SIZE,
              ry: (2 * t - e) / 2 / s.Coords.ISO_TILE_SIZE,
              z: i,
            }));
          }
        }),
      );
    },
  };
});
