// === Reconstructed SystemJS module: game/gameobject/Techno ===
// deps: ["game/gameobject/GameObject","game/rules/TechnoRules","game/gameobject/unit/VeteranLevel","game/gameobject/trait/interface/NotifyTick"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/Techno",
  [
    "game/gameobject/GameObject",
    "game/rules/TechnoRules",
    "game/gameobject/unit/VeteranLevel",
    "game/gameobject/trait/interface/NotifyTick",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n;
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
          s = e;
        },
        function (e) {
          a = e;
        },
      ],
      execute: function () {
        ((n = class extends i.GameObject {
          get primaryWeapon() {
            return this.armedTrait?.primaryWeapon;
          }
          get secondaryWeapon() {
            return this.armedTrait?.secondaryWeapon;
          }
          get ammo() {
            return this.ammoTrait?.ammo;
          }
          get sight() {
            return Math.min(
              r.TechnoRules.MAX_SIGHT,
              this.rules.sight * (this.veteranTrait?.getVeteranSightMultiplier() ?? 1),
            );
          }
          get veteranLevel() {
            return this.veteranTrait?.veteranLevel ?? s.VeteranLevel.None;
          }
          constructor(e, t, i, r) {
            (super(e, t, i, r),
              (this.explodes = this.rules.explodes),
              (this.radarInvisible = this.rules.radarInvisible),
              (this.c4 = this.rules.c4),
              (this.crusher = this.rules.crusher),
              (this.defaultToGuardArea = this.rules.defaultToGuardArea),
              (this.guardMode = this.rules.defaultToGuardArea),
              (this.purchaseValue = this.rules.cost));
          }
          resetGuardModeToIdle() {
            ((this.guardMode = this.defaultToGuardArea), (this.guardArea = void 0));
          }
          update(e) {
            if (this.warpedOutTrait.isActive())
              for (var t of this.cachedTraits.tick) t.ticksWhenWarpedOut && t[a.NotifyTick.onTick](this, e);
            else super.update(e);
          }
          isTechno() {
            return !0;
          }
        }),
          e("Techno", n));
      },
    };
  },
);
