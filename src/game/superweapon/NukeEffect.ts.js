// === Reconstructed SystemJS module: game/superweapon/NukeEffect ===
// deps: ["game/Coords","engine/type/ObjectType","game/math/Vector2","game/Weapon","game/WeaponType","game/superweapon/SuperWeaponEffect"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/superweapon/NukeEffect",
  [
    "game/Coords",
    "engine/type/ObjectType",
    "game/math/Vector2",
    "game/Weapon",
    "game/WeaponType",
    "game/superweapon/SuperWeaponEffect",
  ],
  function (e, t) {
    "use strict";
    var a, n, o, l, c, i, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
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
          i = e;
        },
      ],
      execute: function () {
        ((r = class extends i.SuperWeaponEffect {
          constructor(e, t, i, r) {
            (super(e, t, i), (this.weaponType = r));
          }
          onStart(t) {
            var i = t.rules.getWeapon(this.weaponType),
              r = t.createTarget(void 0, this.tile),
              s = this.owner.getOwnedObjectsByType(n.ObjectType.Building).find((e) => e.rules.nukeSilo);
            if (s) {
              let e = l.Weapon.factory(i.name, c.WeaponType.Primary, s, t.rules);
              e.fire(r, t);
            } else this.fireLooseNuke(i, r, t);
          }
          fireLooseNuke(t, i, r) {
            var s = new o.Vector2(this.tile.rx + 0.5, this.tile.ry + 0.5).multiplyScalar(a.Coords.LEPTONS_PER_TILE);
            if (r.map.isWithinHardBounds(s)) {
              let e = r.createLooseProjectile(t.name, this.owner, i);
              (e.position.moveToLeptons(s),
                (e.position.tileElevation = a.Coords.worldToTileHeight(e.rules.detonationAltitude)),
                r.spawnObject(e, e.position.tile));
            }
          }
          onTick(e) {
            return !0;
          }
        }),
          e("NukeEffect", r));
      },
    };
  },
);
