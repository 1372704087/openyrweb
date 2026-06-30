// === Reconstructed SystemJS module: engine/util/MapTileIntersectHelper ===
// deps: ["util/geometry","game/Coords","engine/IsoCoords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/util/MapTileIntersectHelper",
  ["util/geometry", "game/Coords", "engine/IsoCoords"],
  function (e, t) {
    "use strict";
    var i, y, T, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          y = e;
        },
        function (e) {
          T = e;
        },
      ],
      execute: function () {
        e(
          "MapTileIntersectHelper",
          (r = class {
            constructor(e, t) {
              ((this.map = e), (this.scene = t));
            }
            getTileAtScreenPoint(e) {
              var t = this.scene.viewport;
              if (i.rectContainsPoint(t, e)) {
                t = this.intersectTilesByScreenPos(e);
                return t.length ? t[0] : void 0;
              }
            }
            intersectTilesByScreenPos(e) {
              var t = T.IsoCoords.worldToScreen(0, 0),
                i = this.scene.cameraPan.getPan(),
                t = {
                  x: e.x + t.x + i.x - this.scene.viewport.width / 2,
                  y: e.y + t.y + i.y - this.scene.viewport.height / 2,
                },
                i = T.IsoCoords.screenToWorld(t.x, t.y),
                r = new THREE.Vector2(i.x, i.y).multiplyScalar(1 / y.Coords.LEPTONS_PER_TILE).floor();
              let s = this.map.tiles.getByMapCoords(r.x, r.y);
              var a;
              if (!s) {
                for (let e = 0; e < 15 && ((s = this.map.tiles.getByMapCoords(r.x + e, r.y + e)), !s); e++);
                if (!s) return [];
              }
              let n = [];
              for (let f = 0; f < 15; f++)
                for (a of [
                  { x: s.rx + f, y: s.ry + f },
                  { x: s.rx + f + 1, y: s.ry + f },
                  { x: s.rx + f, y: s.ry + f + 1 },
                ]) {
                  var o = { x: a.x, y: a.y },
                    o = this.map.tiles.getByMapCoords(o.x, o.y);
                  o && n.push(o);
                }
              let l = [],
                c = new THREE.Triangle();
              var h,
                u = new THREE.Vector3(t.x, 0, t.y);
              for (h of n) {
                var d = T.IsoCoords.tile3dToScreen(h.rx, h.ry, h.z),
                  g = T.IsoCoords.tile3dToScreen(h.rx, h.ry + 1.1, h.z),
                  p = T.IsoCoords.tile3dToScreen(h.rx + 1.1, h.ry, h.z),
                  m = T.IsoCoords.tile3dToScreen(h.rx + 1.1, h.ry + 1.1, h.z);
                ((c.b.x = g.x), (c.b.z = g.y), (c.c.x = p.x), (c.c.z = p.y), (c.a.x = d.x), (c.a.z = d.y));
                d = c.containsPoint(u);
                ((c.a.x = m.x), (c.a.z = m.y));
                m = c.containsPoint(u);
                (d || m) && l.unshift(h);
              }
              return (
                l.length ||
                  (l = this.intersectTilesByScreenPos({ x: e.x, y: e.y - T.IsoCoords.tileHeightToScreen(1) })),
                l
              );
            }
          }),
        );
      },
    };
  },
);
