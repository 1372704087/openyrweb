// === Reconstructed SystemJS module: game/theater/AutoLat ===
// deps: ["game/map/TileCollection"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/theater/AutoLat", ["game/map/TileCollection"], function (e, t) {
  "use strict";
  var p, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        p = e;
      },
    ],
    execute: function () {
      e(
        "AutoLat",
        (i = class {
          static calculate(u, d) {
            let g = new Map();
            (u.forEach((e) => {
              var t = d.getSetNum(e.tileNum);
              (g.set(e, t), d.isCLAT(t) && ((t = d.getLAT(t)), g.set(e, t), (e.tileNum = d.getTileNumFromSet(t))));
            }),
              u.forEach((t) => {
                var i = g.get(t);
                if (d.isLAT(i)) {
                  let e = 0;
                  var r = u.getNeighbourTile(t, p.TileDirection.TopRight),
                    s = u.getNeighbourTile(t, p.TileDirection.BottomRight),
                    a = u.getNeighbourTile(t, p.TileDirection.BottomLeft),
                    n = u.getNeighbourTile(t, p.TileDirection.TopLeft);
                  (r && d.canConnectTiles(i, g.get(r)) && (e += 1),
                    s && d.canConnectTiles(i, g.get(s)) && (e += 2),
                    a && d.canConnectTiles(i, g.get(a)) && (e += 4),
                    n && d.canConnectTiles(i, g.get(n)) && (e += 8),
                    0 < e && ((n = d.getCLATSet(i)), (t.tileNum = d.getTileNumFromSet(n, e))));
                } else if (i === d.getGeneralValue("RampBase") && !(t.rampType < 1 || 4 < t.terrainType)) {
                  let e = -1;
                  var o = u.getNeighbourTile(t, p.TileDirection.TopRight),
                    l = u.getNeighbourTile(t, p.TileDirection.BottomRight),
                    c = u.getNeighbourTile(t, p.TileDirection.BottomLeft),
                    h = u.getNeighbourTile(t, p.TileDirection.TopLeft);
                  switch (t.rampType) {
                    case 1:
                      (h && 0 === h.rampType && e++, l && 0 === l.rampType && (e += 2));
                      break;
                    case 2:
                      (o && 0 === o.rampType && e++, c && 0 === c.rampType && (e += 2));
                      break;
                    case 3:
                      (l && 0 === l.rampType && e++, h && 0 === h.rampType && (e += 2));
                      break;
                    case 4:
                      (c && 0 === c.rampType && e++, o && 0 === o.rampType && (e += 2));
                  }
                  -1 !== e &&
                    (t.tileNum = d.getTileNumFromSet(d.getGeneralValue("RampSmooth"), 3 * (t.rampType - 1) + e));
                }
              }));
          }
        }),
      );
    },
  };
});
