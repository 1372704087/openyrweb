// === Reconstructed SystemJS module: game/gameobject/trait/SpawnDebrisTrait ===
// deps: ["engine/type/ObjectType","game/gameobject/common/DeathType","game/gameobject/trait/interface/NotifyCrash","game/gameobject/trait/interface/NotifyDestroy"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/SpawnDebrisTrait",
  [
    "engine/type/ObjectType",
    "game/gameobject/common/DeathType",
    "game/gameobject/trait/interface/NotifyCrash",
    "game/gameobject/trait/interface/NotifyDestroy",
  ],
  function (e, t) {
    "use strict";
    var a, r, i, s, n;
    t && t.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        ((n = class {
          [i.NotifyCrash.onCrash](e, t) {
            this.handleDestroy(e, t);
          }
          [s.NotifyDestroy.onDestroy](e, t, i) {
            i?.weapon?.warhead.rules.temporal ||
              e.isCrashing ||
              (e.deathType !== r.DeathType.Sink && e.isSpawned && this.handleDestroy(e, t));
          }
          handleDestroy(e, t) {
            var i, r;
            (e.isVehicle() || e.isBuilding() || e.isOverlay()) &&
              ((i = e.isOverlay() ? 0 : e.rules.minDebris),
              (r = e.isOverlay() ? t.rules.general.bridgeVoxelMax : e.rules.maxDebris),
              0 < (r = t.generateRandomInt(i, r)) && this.spawnDebris(e, t, r));
          }
          spawnDebris(t, i, r) {
            let s = t.position.getMapPosition();
            if (i.map.isWithinHardBounds(s)) {
              let e = t.isOverlay() ? [] : t.isVehicle() ? t.rules.debrisTypes : t.rules.debrisAnims;
              (e.length || (e = i.rules.audioVisual.metallicDebris),
                (e = e.filter(
                  (e) => i.rules.hasObject(e, a.ObjectType.VoxelAnim) || i.art.hasObject(e, a.ObjectType.Animation),
                )),
                new Array(r)
                  .fill(0)
                  .map(() => e[i.generateRandomInt(0, e.length - 1)])
                  .map((e) => i.createObject(a.ObjectType.Debris, e))
                  .forEach((e) => {
                    (e.position.moveToLeptons(s),
                      (e.position.tileElevation = t.position.tileElevation),
                      i.spawnObject(e, e.position.tile));
                  }));
            }
          }
        }),
          e("SpawnDebrisTrait", n));
      },
    };
  },
);
