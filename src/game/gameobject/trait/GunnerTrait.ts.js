// === Reconstructed SystemJS module: game/gameobject/trait/GunnerTrait ===
// deps: ["game/gameobject/unit/VeteranLevel","game/gameobject/trait/interface/NotifyTick"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/GunnerTrait",
  ["game/gameobject/unit/VeteranLevel", "game/gameobject/trait/interface/NotifyTick"],
  function (e, t) {
    "use strict";
    var r, i, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        ((s = class {
          [i.NotifyTick.onTick](e) {
            var t, i;
            !!e.transportTrait.units.length !== this.lastHadGunner &&
              ((this.lastHadGunner = !!e.transportTrait.units.length),
              (i = t = e.transportTrait.units[0]?.rules.ifvMode ?? 0),
              (t = e.rules.turretIndexesByIfvMode.get(t) ?? 0) < e.rules.turretCount &&
                ((e.turretNo = t), e.armedTrait?.selectSpecialWeapon(i, e.veteranLevel === r.VeteranLevel.Elite)));
          }
          getUiNameForIfvMode(e, t) {
            switch (e) {
              case 0:
                return "tip:rocket";
              case 1:
                return "tip:repair";
              case 2:
              case 4:
              case 5:
                return "tip:machinegun";
              default:
                return t ? "name:" + t.toLowerCase() : void 0;
            }
          }
        }),
          e("GunnerTrait", s));
      },
    };
  },
);
