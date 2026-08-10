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
              (this.omniCrusher = this.rules.omniCrusher),
              // OpenYRWeb: crush-tilt (vanilla YR "TiltsWhenCrushes" = IsTilter). While the
              // vehicle crushes a target its body pitches up (front lifts). Value is in
              // DEGREES; positive = nose up on mainObj's local X axis (in-engine verified).
              // crushTilt eases toward crushTiltTarget every tick, so both the rise and the
              // settle share the same smooth transition (no instant snap).
              (this.crushTilt = 0),
              (this.crushTiltTarget = 0),
              (this.crushTiltTimer = 0),
              // OpenYRWeb: force-attack state, set by AttackTask while it is force-attacking
              // a crushable target. Lets the crush logic run over friendly units/walls that
              // are being force-attacked (vanilla YR: force-attacking a friendly wall or
              // unit drives over and crushes it).
              (this.isForceAttacking = !1),
              (this.currentAttackTarget = void 0),
              (this.defaultToGuardArea = this.rules.defaultToGuardArea),
              (this.guardMode = this.rules.defaultToGuardArea),
              (this.purchaseValue = this.rules.cost));
          }
          resetGuardModeToIdle() {
            ((this.guardMode = this.defaultToGuardArea), (this.guardArea = void 0));
          }
          // OpenYRWeb: vanilla YR crush decision ("Who crushes whom", ModEnc).
          //  - Crusher=yes can crush Crushable=yes objects (infantry, wall-class buildings).
          //  - OmniCrusher=yes (requires Crusher=yes) additionally crushes Crushable=no
          //    objects (vehicles etc.) unless the victim is OmniCrushResistant=yes,
          //    i.e. OmniCrushResistant trumps OmniCrusher.
          //  - Regular (non-wall) buildings can never be crushed.
          //  - Invulnerable objects (Iron Curtain / Force Shield) can never be crushed —
          //    vanilla YR: invulnerability negates ALL damage, including crush, so the
          //    crusher drives around/gets blocked instead of driving over the target.
          canCrushObject(e) {
            return (
              !!this.crusher &&
              !e?.invulnerableTrait?.isActive?.() &&
              (!!e?.rules?.crushable ||
                (!!this.omniCrusher &&
                  !e?.rules?.omniCrushResistant &&
                  !(e?.isBuilding?.() && !e.rules.wall)))
            );
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
