// === Reconstructed SystemJS module: game/gameobject/unit/MovePositionHelper ===
// deps: ["game/map/tileFinder/RadialTileFinder","game/type/MovementZone","game/type/SpeedType","game/type/LocomotorType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/unit/MovePositionHelper",
  ["game/map/tileFinder/RadialTileFinder", "game/type/MovementZone", "game/type/SpeedType", "game/type/LocomotorType"],
  function (e, t) {
    "use strict";
    var p, m, f, i, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          p = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          f = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        e(
          "MovePositionHelper",
          (r = class {
            constructor(e) {
              this.map = e;
            }
            findPositions(e, r, s, a) {
              let n = new Map(),
                t = this.clusterObjects(e);
              if (!t.length) throw new Error("We should have found at least one cluster");
              let i = t.reduce((e, t) => (t.objects.size > e.objects.size ? t : e), t[0]);
              t.splice(t.indexOf(i), 1);
              let o = [],
                l = this.findCenterTile([...i.objects]);
              (i.objects.forEach((t) => {
                var i = this.map.tiles.getByMapCoords(r.rx + t.tile.rx - l.rx, r.ry + t.tile.ry - l.ry),
                  e = i?.onBridgeLandType ? this.map.tileOccupation.getBridgeOnTile(i) : void 0;
                if (
                  !this.shouldStackObject(t) &&
                  i &&
                  this.map.mapBounds.isWithinBounds(i) &&
                  this.tileHasRoom(i, t, n.get(i)) &&
                  (t.rules.movementZone === m.MovementZone.Fly
                    ? t.rules.airportBound ||
                      (a && t.rules.balloonHover && !t.rules.hoverAttack) ||
                      this.map.terrain.getPassableSpeed(i, f.SpeedType.Amphibious, !1, !!e)
                    : this.isEligibleTile(i, e, s, r))
                ) {
                  let e = n.get(i);
                  (void 0 === e && ((e = []), n.set(i, e)), e.push(t));
                } else o.push(t);
              }),
                t.forEach((e) => o.push(...e.objects)));
              let c = new p.RadialTileFinder(
                  this.map.tiles,
                  this.map.mapBounds,
                  r,
                  { width: 1, height: 1 },
                  0,
                  5,
                  () => !0,
                ),
                h = c.getNextTile();
              for (; o.length && h;) {
                var u = o[0],
                  d = this.map.tileOccupation.getBridgeOnTile(h);
                if (
                  this.tileHasRoom(h, u, n.get(h)) &&
                  (u.rules.movementZone === m.MovementZone.Fly
                    ? u.rules.airportBound || this.map.terrain.getPassableSpeed(h, f.SpeedType.Amphibious, !1, !!d)
                    : this.isEligibleTile(h, d, s, r))
                ) {
                  let e = n.get(h);
                  (void 0 === e && ((e = []), n.set(h, e)), e.push(o.shift()));
                } else h = c.getNextTile();
              }
              let g = new Map();
              if (
                (n.forEach((e, t) => {
                  e.forEach((e) => g.set(e, t));
                }),
                o.forEach((e) => g.set(e, r)),
                g.size !== e.length)
              )
                throw new Error("We should have computed a number of positions equal to the number of input objects");
              return g;
            }
            shouldStackObject(e) {
              return (
                e.isBuilding() ||
                (e.isUnit() &&
                  e.moveTrait.isMoving() &&
                  e.rules.movementZone === m.MovementZone.Fly &&
                  e.rules.locomotor === i.LocomotorType.Jumpjet)
              );
            }
            tileHasRoom(e, t, i) {
              if (t.isBuilding())
                return (
                  !!t.rules.undeploysInto ||
                  !this.map.tileOccupation
                    .getGroundObjectsOnTile(e)
                    .some((e) => e.isTerrain() || e.isTechno() || (e.isOverlay() && e.wallTrait))
                );
              if (!i) return !0;
              if (this.shouldStackObject(t)) return i.length < 3;
              if (t.isInfantry()) {
                if (i.find((e) => !e.isInfantry())) return !1;
                var r = t.rules.movementZone === m.MovementZone.Fly ? 1 : 3;
                return i.filter((e) => e.isInfantry()).length >= r ? !1 : !0;
              }
              return !i.length;
            }
            isEligibleTile(e, t, i, r) {
              return i?.isHighBridge() || t?.isHighBridge()
                ? e.z + (t?.tileElevation ?? 0) === r.z + (i?.tileElevation ?? 0)
                : !(!i && !t) || Math.abs(e.z - r.z) < 2;
            }
            clusterObjects(e) {
              let s = new Map();
              e.forEach((e) => {
                var t = e.tile.rx + "_" + e.tile.ry;
                s.set(t, [...(s.get(t) || []), e]);
              });
              let t = [],
                a = new Set(e);
              for (; a.size;) {
                let e = new Set(),
                  r = [];
                var i = [...a][0].tile;
                for (
                  s.get(i.rx + "_" + i.ry).forEach((e) => {
                    r.push(e);
                  });
                  r.length;
                ) {
                  var n = r.shift();
                  (e.add(n), a.delete(n));
                  for (let i = -1; i <= 1; i++)
                    for (let t = -1; t <= 1; t++)
                      if (i || t) {
                        let e = s.get(n.tile.rx + i + "_" + (n.tile.ry + t));
                        e &&
                          e.length &&
                          e.forEach((e) => {
                            a.has(e) && (a.delete(e), r.push(e));
                          });
                      }
                }
                t.push({ objects: e });
              }
              return t;
            }
            findCenterTile(e) {
              let t = 0,
                i = 0;
              (e.forEach((e) => {
                ((t += e.tile.rx), (i += e.tile.ry));
              }),
                (t = Math.round(t / e.length)),
                (i = Math.round(i / e.length)));
              let r = this.map.tiles.getByMapCoords(t, i);
              if (!r && ((r = e.find((e) => Math.abs(e.tile.rx - t) <= 1 && Math.abs(e.tile.ry - i) <= 1)?.tile), !r))
                throw new Error("At least one adjacent object should have been found");
              return r;
            }
          }),
        );
      },
    };
  },
);
