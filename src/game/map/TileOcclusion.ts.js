// === Reconstructed SystemJS module: game/map/TileOcclusion ===
// deps: ["game/math/Vector2"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/map/TileOcclusion", ["game/math/Vector2"], function (e, t) {
  "use strict";
  var m, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        m = e;
      },
    ],
    execute: function () {
      e(
        "TileOcclusion",
        (i = class {
          constructor(e) {
            ((this.tiles = e), (this.tileOcclusion = []));
            let t = this.tileOcclusion;
            for (var i of e.getAll()) ((t[i.rx] = t[i.rx] || []), (t[i.rx][i.ry] = new Set()));
          }
          addOccluder(t) {
            let e = this.calculateTilesForGameObject(t);
            e.forEach((e) => this.occludeTile(e, t));
          }
          removeOccluder(t) {
            let e = this.calculateTilesForGameObject(t);
            e.forEach((e) => this.unoccludeTile(e, t));
          }
          calculateTilesForGameObject(e) {
            var t = e.art.occupyHeight,
              i = Math.max(0, t - 2);
            let r = [];
            var s = e.getFoundation();
            for (let u = 1; u <= i; u++) for (let e = 0; e < s.width; e++) r.push(new m.Vector2(e - u, -u));
            for (let d = 1; d <= i; d++) for (let e = 1; e < s.height; e++) r.push(new m.Vector2(-d, e - d));
            r.push(...e.art.addOccupy);
            for (let { x: g, y: p } of e.art.removeOccupy) {
              var a = r.findIndex((e) => e.x === g && e.y === p);
              -1 !== a && r.splice(a, 1);
            }
            var n,
              o,
              l = e.tile;
            let c = [];
            for ({ x: n, y: o } of r) {
              var h = this.tiles.getByMapCoords(l.rx + n, l.ry + o);
              h && c.push(h);
            }
            return c;
          }
          occludeTile(e, t) {
            (this.tileOcclusion[e.rx][e.ry].add(t), (e.occluded = !0));
          }
          unoccludeTile(e, t) {
            let i = this.tileOcclusion[e.rx][e.ry];
            (i.delete(t), (e.occluded = 0 < i.size));
          }
          isTileOccluded(e) {
            return 0 < this.tileOcclusion[e.rx][e.ry].size;
          }
        }),
      );
    },
  };
});
