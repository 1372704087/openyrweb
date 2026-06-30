// === Reconstructed SystemJS module: data/map/tag/CellTagsReader ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/map/tag/CellTagsReader", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "CellTagsReader",
        (i = class {
          read(e, t) {
            let i = [];
            for (var [r, s] of e.entries) {
              r = { tagId: s, coords: this.readCoords(Number(r), t) };
              i.push(r);
            }
            return i;
          }
          readCoords(e, t) {
            var i = t < 4 ? 128 : 1e3;
            return { x: e % i, y: Math.floor(e / i) };
          }
        }),
      );
    },
  };
});
