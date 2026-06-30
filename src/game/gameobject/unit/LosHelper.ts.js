// === Reconstructed SystemJS module: game/gameobject/unit/LosHelper ===
// deps: ["util/bresenham","game/type/LandType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/gameobject/unit/LosHelper", ["util/bresenham", "game/type/LandType"], function (e, t) {
  "use strict";
  var g, p, m, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        g = e;
      },
      function (e) {
        p = e;
      },
    ],
    execute: function () {
      ((m = (e) => void 0 !== e.position),
        e(
          "LosHelper",
          (i = class {
            constructor(e, t) {
              ((this.tiles = e), (this.tileOccupation = t));
            }
            hasLineOfSight(t, i, e) {
              var r = e.warhead.rules.wall || !e.projectileRules.subjectToWalls,
                s = e.projectileRules.subjectToCliffs,
                a = e.rules.spawner;
              let n = 0,
                o = !1;
              if (!r || s || a) {
                var l,
                  c,
                  h = m(t) ? t.tile : t,
                  u = m(i) ? (i.isBuilding() ? i.centerTile : i.tile) : i;
                let e = h.z;
                s &&
                  m(t) &&
                  t.isUnit() &&
                  t.onBridge &&
                  (e += this.tileOccupation.getBridgeOnTile(h)?.tileElevation ?? 0);
                for ({ x: l, y: c } of g.bresenham(h.rx, h.ry, u.rx, u.ry)) {
                  var d = this.tiles.getByMapCoords(l, c);
                  if (!d) return !1;
                  if (!r && d.landType === p.LandType.Wall) return !1;
                  if (s)
                    if (d.landType === p.LandType.Cliff) {
                      if (d.z > e) return !1;
                      o = !0;
                    } else {
                      if (d.z > e && o) return !1;
                      o = !1;
                    }
                  if (a && n < 2 && this.tileOccupation.getBridgeOnTile(d)?.isHighBridge()) return !1;
                  n++;
                }
              }
              return !0;
            }
          }),
        ));
    },
  };
});
