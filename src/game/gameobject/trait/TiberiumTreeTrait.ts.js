// === Reconstructed SystemJS module: game/gameobject/trait/TiberiumTreeTrait ===
// deps: ["game/gameobject/trait/interface/NotifyTick","game/map/tileFinder/RadialTileFinder","game/type/LandType","engine/type/ObjectType","game/map/OreSpread","engine/type/TiberiumType","game/gameobject/trait/TiberiumTrait"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/TiberiumTreeTrait",
  [
    "game/gameobject/trait/interface/NotifyTick",
    "game/map/tileFinder/RadialTileFinder",
    "game/type/LandType",
    "engine/type/ObjectType",
    "game/map/OreSpread",
    "engine/type/TiberiumType",
    "game/gameobject/trait/TiberiumTrait",
  ],
  function (t, e) {
    "use strict";
    var i, l, c, h, u, d, g, r, s;
    e && e.id;
    return {
      setters: [
        function (e) {
          i = e;
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
        var e;
        (((e = r || t("SpawnStatus", (r = {})))[(e.Idle = 0)] = "Idle"),
          (e[(e.Spawning = 1)] = "Spawning"),
          (s = class {
            constructor(e) {
              ((this.rules = e),
                (this.ticksSinceLastSpawn = 0),
                (this.cooldownTicks = Math.floor(1 / this.rules.animationProbability)),
                (this.status = r.Idle));
            }
            [i.NotifyTick.onTick](e, t) {
              ((this.status = r.Idle),
                this.ticksSinceLastSpawn++ > this.cooldownTicks &&
                  ((this.ticksSinceLastSpawn = 0), (this.status = r.Spawning), this.spawnTiberium(e.tile, t)));
            }
            spawnTiberium(i, r) {
              for (let o = 1; o <= 2; o++) {
                let e = new l.RadialTileFinder(r.map.tiles, r.map.mapBounds, i, { width: 1, height: 1 }, o, o, (e) =>
                  g.TiberiumTrait.canBePlacedOn(e, r.map),
                );
                var s = e.getNextTile();
                if (s) {
                  var a = u.OreSpread.calculateOverlayId(d.TiberiumType.Ore, s);
                  if (void 0 === a) throw new Error("Expected an overlayId");
                  let e = r.createObject(h.ObjectType.Overlay, r.rules.getOverlayName(a));
                  return ((e.overlayId = a), (e.value = 3), void r.spawnObject(e, s));
                }
                e = new l.RadialTileFinder(
                  r.map.tiles,
                  r.map.mapBounds,
                  i,
                  { width: 1, height: 1 },
                  o,
                  o,
                  (e) => e.landType === c.LandType.Tiberium,
                );
                let t;
                for (; !t;) {
                  var n = e.getNextTile();
                  if (!n) break;
                  t = r.map
                    .getObjectsOnTile(n)
                    .find(
                      (e) =>
                        e.isOverlay() &&
                        e.isTiberium() &&
                        e.traits.get(g.TiberiumTrait).getBailCount() + 1 <= g.TiberiumTrait.maxBails,
                    );
                }
                if (t) return void t.traits.get(g.TiberiumTrait).spawnBails(1);
              }
            }
          }),
          t("TiberiumTreeTrait", s));
      },
    };
  },
);
