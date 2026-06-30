// === Reconstructed SystemJS module: game/gameobject/unit/CollisionHelper ===
// deps: ["engine/type/TerrainType","game/type/LandType","game/gameobject/unit/CollisionType","game/gameobject/unit/ZoneType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/unit/CollisionHelper",
  [
    "engine/type/TerrainType",
    "game/type/LandType",
    "game/gameobject/unit/CollisionType",
    "game/gameobject/unit/ZoneType",
  ],
  function (e, t) {
    "use strict";
    var s, u, d, g, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          s = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
      ],
      execute: function () {
        e(
          "CollisionHelper",
          (i = class {
            constructor(e) {
              this.tileOccupation = e;
            }
            checkCollisions(e, t, i) {
              var r,
                s = e.tile;
              let a, n, o;
              for (r of this.tileOccupation.getObjectsOnTile(s))
                (r.isOverlay() && r.isBridge() && (a = r),
                  r.isOverlay() && r.wallTrait && (o = r),
                  r.isTechno() && !r.isDestroyed && (n = r));
              if (i.walls) {
                if (e.tileElevation <= 2 && s.landType === u.LandType.Wall)
                  return { type: d.CollisionType.Wall, target: o };
                if (
                  i.units &&
                  n?.tile === s &&
                  (!n.isUnit() || n.zone === g.ZoneType.Ground) &&
                  e.tileElevation <= 1.1 &&
                  i.units(n.owner)
                )
                  return { type: d.CollisionType.Wall, target: n };
              }
              if (i.shore && s.landType !== u.LandType.Water) return { type: d.CollisionType.Shore };
              if (i.ground && e.tileElevation < 0) return { type: d.CollisionType.Ground };
              var l = e.tileElevation + s.z,
                c = t.tileElevation + t.tile.z;
              if (a?.isHighBridge()) {
                var h = a.tile.z + a.tileElevation;
                if ((h < c && l <= h) || (c < h && h - 1 <= l))
                  return c < h
                    ? { type: d.CollisionType.UnderBridge, target: a }
                    : { type: d.CollisionType.OnBridge, target: a };
              } else if (a?.isLowBridge() && i.shore) return { type: d.CollisionType.UnderBridge, target: a };
              if (i.cliffs) {
                s = s.z - t.tile.z;
                if (e.tileElevation < 0 && 4 <= s) return { type: d.CollisionType.Cliff };
              }
              return { type: d.CollisionType.None };
            }
            computeDetonationZone(e, t, i) {
              let r = this.tileOccupation.getBridgeOnTile(e);
              return i === d.CollisionType.None && t > 1.5 + (r?.tileElevation ?? 0)
                ? g.ZoneType.Air
                : (r && 1.5 < t) || e.terrainType !== s.TerrainType.Water || r?.isLowBridge()
                  ? g.ZoneType.Ground
                  : g.ZoneType.Water;
            }
          }),
        );
      },
    };
  },
);
