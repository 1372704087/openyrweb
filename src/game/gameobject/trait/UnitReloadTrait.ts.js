// === Reconstructed SystemJS module: game/gameobject/trait/UnitReloadTrait ===
// deps: ["game/GameSpeed","game/gameobject/unit/ZoneType","game/gameobject/trait/interface/NotifyTick"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/UnitReloadTrait",
  ["game/GameSpeed", "game/gameobject/unit/ZoneType", "game/gameobject/trait/interface/NotifyTick"],
  function (e, t) {
    "use strict";
    var s, i, r, a;
    t && t.id;
    return {
      setters: [
        function (e) {
          s = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        ((a = class {
          [r.NotifyTick.onTick](t, i) {
            if (
              t.dockTrait &&
              t.dockTrait.hasDockedUnits() &&
              !t.dockTrait.getDockedUnits().every((e) => !this.canReloadUnit(e))
            )
              if (
                (void 0 === this.cooldownTicks &&
                  (this.cooldownTicks = s.GameSpeed.BASE_TICKS_PER_SECOND * i.rules.general.repair.reloadRate * 60),
                this.cooldownTicks <= 0)
              ) {
                this.cooldownTicks = s.GameSpeed.BASE_TICKS_PER_SECOND * i.rules.general.repair.reloadRate * 60;
                let e = t.dockTrait.getDockedUnits();
                var r;
                for (r of 0 === e[0].ammo ? e.slice(0, 1) : e) this.canReloadUnit(r) && r.ammoTrait.ammo++;
              } else this.cooldownTicks--;
          }
          canReloadUnit(e) {
            return !(!e.ammoTrait || !e.rules.manualReload || e.ammoTrait.isFull() || e.zone === i.ZoneType.Air);
          }
        }),
          e("UnitReloadTrait", a));
      },
    };
  },
);
