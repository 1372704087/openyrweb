// === Reconstructed SystemJS module: game/gameobject/unit/RangeHelper ===
// deps: ["game/Coords","util/math","game/gameobject/unit/ZoneType","game/type/MovementZone","game/math/Vector2"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/unit/RangeHelper",
  ["game/Coords", "util/math", "game/gameobject/unit/ZoneType", "game/type/MovementZone", "game/math/Vector2"],
  function (e, t) {
    "use strict";
    var n, o, l, c, h, u, s, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
      ],
      execute: function () {
        ((u = (e) => void 0 !== e.position),
          (s = (e) => void 0 !== e.addScalar),
          e(
            "RangeHelper",
            (i = class {
              constructor(e) {
                this.tileOccupation = e;
              }
              isInWeaponRange(e, t, i, r, s) {
                var a = s ?? e;
                if (
                  i.rules.limboLaunch &&
                  2 <
                    Math.abs(
                      (u(a) ? a.position.tileElevation + a.tile.z : a.z) -
                        (u(t) ? t.position.tileElevation + t.tile.z : t.z),
                    )
                )
                  return !1;
                var { minRange: n, range: o } = this.computeWeaponRangeVsTarget(a, t, i, r);
                return i.rules.cellRangefinding
                  ? this.isInTileRange(a, t, n, o)
                  : e.isUnit() && e.rules.movementZone === c.MovementZone.Fly
                    ? this.isInRange2(a, t, n, o)
                    : this.isInRange3(a, t, n, o);
              }
              computeWeaponRangeVsTarget(e, t, i, r) {
                let s = 0;
                var a, n;
                return (
                  u(t) &&
                    t.isBuilding() &&
                    !i.projectileRules.arcing &&
                    !i.projectileRules.vertical &&
                    ((n = t.getFoundation()),
                    (i.warhead.rules.ivanBomb && 2 < n.width + n.height) || (s += (n.width + n.height) / 4)),
                  !i.projectileRules.subjectToElevation ||
                    (i.projectileRules.arcing && !u(t)) ||
                    ((a = u(e) ? e.tile.z + e.tileElevation : e.z),
                    (n = u(t) ? t.tile.z + t.tileElevation : t.z) < a && (s += r.elevationModel.getBonus(a, n))),
                  i.projectileRules.isAntiAir &&
                    u(e) &&
                    e.isTechno() &&
                    u(t) &&
                    t.isUnit() &&
                    t.zone === l.ZoneType.Air &&
                    (s += e.rules.airRangeBonus),
                  { minRange: i.minRange, range: i.range + s }
                );
              }
              isInRange(e, t, i, r, s = !1) {
                return s
                  ? this.isInTileRange(e, t, i, r)
                  : e.isUnit() && e.rules.movementZone === c.MovementZone.Fly
                    ? this.isInRange2(e, t, i, r)
                    : this.isInRange3(e, t, i, r);
              }
              isInRange3(e, t, i, r) {
                return o.isBetween(this.distance3(e, t) / n.Coords.LEPTONS_PER_TILE, i, r);
              }
              isInRange2(e, t, i, r) {
                return o.isBetween(this.distance2(e, t) / n.Coords.LEPTONS_PER_TILE, i, r);
              }
              distance3(e, t) {
                let i = u(e)
                  ? e.position.worldPosition
                  : s(e)
                    ? e
                    : n.Coords.tile3dToWorld(e.rx + 0.5, e.ry + 0.5, e.z);
                var r = u(t)
                  ? t.position.worldPosition
                  : s(t)
                    ? t
                    : n.Coords.tile3dToWorld(t.rx + 0.5, t.ry + 0.5, t.z);
                return i.distanceTo(r);
              }
              distance2(e, t) {
                let i = u(e)
                  ? new h.Vector2(e.position.worldPosition.x, e.position.worldPosition.z)
                  : s(e)
                    ? new h.Vector2(e.x, e.z)
                    : new h.Vector2(e.rx + 0.5, e.ry + 0.5).multiplyScalar(n.Coords.LEPTONS_PER_TILE);
                var r = u(t)
                  ? new h.Vector2(t.position.worldPosition.x, t.position.worldPosition.z)
                  : s(t)
                    ? new h.Vector2(t.x, t.z)
                    : new h.Vector2(t.rx + 0.5, t.ry + 0.5).multiplyScalar(n.Coords.LEPTONS_PER_TILE);
                return i.distanceTo(r);
              }
              isInTileRange(e, t, i, r) {
                let s;
                var a;
                return (
                  (s =
                    !Array.isArray(e) && u(t) && t.isUnit()
                      ? ((a = u(e) ? e.tile : e),
                        new h.Vector2(a.rx + 0.5, a.ry + 0.5).distanceTo(
                          t.position.getMapPosition().multiplyScalar(1 / n.Coords.LEPTONS_PER_TILE),
                        ))
                      : this.tileDistance(e, t)),
                  o.isBetween(s, i, r)
                );
              }
              tileDistance(e, t) {
                var i,
                  r = u(e) ? this.tileOccupation.calculateTilesForGameObject(e.tile, e) : Array.isArray(e) ? e : [e],
                  s = u(t) ? this.tileOccupation.calculateTilesForGameObject(t.tile, t) : Array.isArray(t) ? t : [t];
                let a = new h.Vector2(),
                  n = new h.Vector2(),
                  o = Number.POSITIVE_INFINITY;
                for (i of r)
                  for (var l of s) {
                    (a.set(i.rx, i.ry), n.set(l.rx, l.ry));
                    l = a.distanceTo(n);
                    l <= o && (o = l);
                  }
                return o;
              }
            }),
          ));
      },
    };
  },
);
