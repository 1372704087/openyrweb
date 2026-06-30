// === Reconstructed SystemJS module: game/gameobject/trait/MissileSpawnTrait ===
// deps: ["game/gameobject/unit/CollisionType","game/gameobject/trait/interface/NotifyDestroy"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/MissileSpawnTrait",
  ["game/gameobject/unit/CollisionType", "game/gameobject/trait/interface/NotifyDestroy"],
  function (e, t) {
    "use strict";
    var i, r, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        ((s = class {
          setWarhead(e) {
            return ((this.warhead = e), this);
          }
          setDamage(e) {
            return ((this.damage = e), this);
          }
          setLauncher(e) {
            return ((this.launcher = e), this);
          }
          [r.NotifyDestroy.onDestroy](e, t) {
            this.warhead &&
              this.damage &&
              this.launcher &&
              this.warhead.detonate(
                t,
                this.damage,
                e.tile,
                e.tileElevation,
                e.position.worldPosition,
                e.zone,
                i.CollisionType.None,
                t.createTarget(void 0, e.tile),
                { player: e.owner, obj: this.launcher, weapon: void 0 },
              );
          }
          dispose() {
            this.launcher = void 0;
          }
        }),
          e("MissileSpawnTrait", s));
      },
    };
  },
);
