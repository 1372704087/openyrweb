// === Reconstructed SystemJS module: game/gameobject/trait/SuperWeaponTrait ===
// deps: ["engine/type/ObjectType","game/gameobject/trait/interface/NotifyOwnerChange","game/gameobject/trait/interface/NotifySpawn","game/gameobject/trait/interface/NotifyUnspawn"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/SuperWeaponTrait",
  [
    "engine/type/ObjectType",
    "game/gameobject/trait/interface/NotifyOwnerChange",
    "game/gameobject/trait/interface/NotifySpawn",
    "game/gameobject/trait/interface/NotifyUnspawn",
  ],
  function (e, t) {
    "use strict";
    var r, i, s, a, n;
    t && t.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
      ],
      execute: function () {
        ((n = class {
          constructor(e) {
            this.name = e;
          }
          getSuperWeapon(e) {
            return e.owner.superWeaponsTrait?.get(this.name);
          }
          [s.NotifySpawn.onSpawn](e, t) {
            this.addSuperWeaponToPlayerIfNeeded(e.owner, t);
          }
          [a.NotifyUnspawn.onUnspawn](e, t) {
            this.removeSuperWeaponFromPlayerIfNeeded(e.owner);
          }
          [i.NotifyOwnerChange.onChange](e, t, i) {
            (this.removeSuperWeaponFromPlayerIfNeeded(t), this.addSuperWeaponToPlayerIfNeeded(e.owner, i));
          }
          addSuperWeaponToPlayerIfNeeded(t, i) {
            if (t.superWeaponsTrait && !t.superWeaponsTrait.has(this.name)) {
              let e = i.createSuperWeapon(this.name, t);
              (t.superWeaponsTrait.add(e), e.rules.isPowered && t.powerTrait?.isLowPower() && e.pauseTimer());
            }
          }
          removeSuperWeaponFromPlayerIfNeeded(e) {
            let t = e.superWeaponsTrait;
            var i;
            t &&
              (e.getOwnedObjectsByType(r.ObjectType.Building).some((e) => e.superWeaponTrait?.name === this.name) ||
                ((i = t.get(this.name)) && !i.isGift && t.remove(this.name)));
          }
        }),
          e("SuperWeaponTrait", n));
      },
    };
  },
);
