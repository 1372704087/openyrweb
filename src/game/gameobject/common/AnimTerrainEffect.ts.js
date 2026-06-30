// === Reconstructed SystemJS module: game/gameobject/common/AnimTerrainEffect ===
// deps: ["engine/type/ObjectType","game/map/TileCollection","game/type/LandType","game/gameobject/trait/TiberiumTrait"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/common/AnimTerrainEffect",
  ["engine/type/ObjectType", "game/map/TileCollection", "game/type/LandType", "game/gameobject/trait/TiberiumTrait"],
  function (e, t) {
    "use strict";
    var o, l, c, a, i;
    t && t.id;
    return {
      setters: [
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
          a = e;
        },
      ],
      execute: function () {
        e(
          "AnimTerrainEffect",
          (i = class {
            destroyOre(i, e, r) {
              if (
                e.landType === c.LandType.Tiberium &&
                (r.art.hasObject(i, o.ObjectType.Animation) ? r.art.getAnimation(i) : void 0)?.crater
              ) {
                let t = r.map.getObjectsOnTile(e).find((e) => e.isOverlay() && e.isTiberium());
                if (t) {
                  var s = Math.ceil(a.TiberiumTrait.maxBails / 2),
                    s = i.startsWith("S_CLSN") ? s : r.generateRandomInt(1, s);
                  let e = t.traits.get(a.TiberiumTrait);
                  (e.removeBails(s), e.getBailCount() || r.unspawnObject(t));
                }
              }
            }
            spawnSmudges(e, s, a) {
              if (
                s.landType === c.LandType.Clear &&
                0 === s.rampType &&
                a.map.mapBounds.isWithinBounds(s) &&
                !a.map.getObjectsOnTile(s).find((e) => !e.isUnit())
              ) {
                var n = a.art.hasObject(e, o.ObjectType.Animation) ? a.art.getAnimation(e) : void 0;
                if (n?.crater) {
                  let t = n?.forceBigCraters ? 2 : 1,
                    i = n?.scorch,
                    r = [l.TileDirection.Bottom, l.TileDirection.BottomLeft, l.TileDirection.BottomRight].every((e) =>
                      a.map.tiles.getNeighbourTile(s, e),
                    );
                  n = [...a.rules.smudgeRules.values()].filter(
                    (e) =>
                      ((e.crater && e.width === t && e.height === t) || (i && e.burn)) &&
                      !((1 < e.width || 1 < e.height) && !r),
                  );
                  n.length &&
                    ((n = n[a.generateRandomInt(0, n.length - 1)].name),
                    (n = a.createObject(o.ObjectType.Smudge, n)),
                    a.spawnObject(n, s));
                }
              }
            }
          }),
        );
      },
    };
  },
);
