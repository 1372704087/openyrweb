// === Reconstructed SystemJS module: game/gameobject/trait/FreeUnitTrait ===
// deps: ["game/gameobject/trait/interface/NotifyBuildStatus","game/gameobject/Building","engine/type/ObjectType","game/map/tileFinder/RadialBackFirstTileFinder"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/FreeUnitTrait",
  [
    "game/gameobject/trait/interface/NotifyBuildStatus",
    "game/gameobject/Building",
    "engine/type/ObjectType",
    "game/map/tileFinder/RadialBackFirstTileFinder",
  ],
  function (e, t) {
    "use strict";
    var i, r, n, o, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
      ],
      execute: function () {
        ((s = class {
          [i.NotifyBuildStatus.onStatusChange](e, s, a) {
            if (s.buildStatus === r.BuildStatus.Ready && e === r.BuildStatus.BuildUp && !s.owner.isNeutral) {
              let e;
              if (a.rules.hasObject(s.rules.freeUnit, n.ObjectType.Vehicle))
                e = a.rules.getObject(s.rules.freeUnit, n.ObjectType.Vehicle);
              else {
                if (!a.rules.hasObject(s.rules.freeUnit, n.ObjectType.Infantry))
                  return void console.warn(`Free unit "${s.rules.freeUnit}" is not a vehicle or infantry type.`);
                e = a.rules.getObject(s.rules.freeUnit, n.ObjectType.Infantry);
              }
              let i = a.createUnitForPlayer(e, s.owner),
                r;
              var t =
                new o.RadialBackFirstTileFinder(a.map.tiles, a.map.mapBounds, s.tile, s.getFoundation(), 1, 1, (e) => {
                  var t =
                    0 < a.map.terrain.getPassableSpeed(e, i.rules.speedType, i.isInfantry(), !1) &&
                    Math.abs(e.z - s.tile.z) < 2 &&
                    !a.map.terrain.findObstacles({ tile: e, onBridge: void 0 }, i).length;
                  return (!r && t && (r = e), t && !a.map.getObjectsOnTile(e).find((e) => e.isOverlay()));
                }).getNextTile() ?? r;
              if (!t)
                return (
                  s.owner.removeOwnedObject(i),
                  i.dispose(),
                  void (s.owner.credits += i.rules.soylent || i.purchaseValue)
                );
              a.spawnObject(i, t);
            }
          }
        }),
          e("FreeUnitTrait", s));
      },
    };
  },
);
