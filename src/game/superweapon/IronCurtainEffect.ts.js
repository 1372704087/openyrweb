// === Reconstructed SystemJS module: game/superweapon/IronCurtainEffect ===
// deps: ["game/map/tileFinder/RadialTileFinder","game/superweapon/SuperWeaponEffect"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/superweapon/IronCurtainEffect",
  ["game/map/tileFinder/RadialTileFinder", "game/superweapon/SuperWeaponEffect"],
  function (e, t) {
    "use strict";
    var n, i, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          n = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        ((r = class extends i.SuperWeaponEffect {
          onStart(e) {
            var t,
              i,
              r = e.rules.combatDamage.ironCurtainDuration,
              s = { player: this.owner };
            let a = new n.RadialTileFinder(
              e.map.tiles,
              e.map.mapBounds,
              this.tile,
              { width: 1, height: 1 },
              0,
              1,
              () => !0,
            );
            for (; (t = a.getNextTile());)
              for (i of e.map.getGroundObjectsOnTile(t))
                !i.isTechno() ||
                  i.isDestroyed ||
                  (i.isUnit() && i.tile !== t) ||
                  i.rules.missileSpawn ||
                  (i.rules.organic
                    ? e.destroyObject(i, s)
                    : (i.invulnerableTrait.setActiveFor(r, e.currentTick),
                      (i.isVehicle() || i.isAircraft()) &&
                        i.parasiteableTrait?.isInfested() &&
                        i.parasiteableTrait.destroyParasite(s, e)));
          }
          onTick(e) {
            return !0;
          }
        }),
          e("IronCurtainEffect", r));
      },
    };
  },
);
