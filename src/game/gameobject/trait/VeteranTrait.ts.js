// === Reconstructed SystemJS module: game/gameobject/trait/VeteranTrait ===
// deps: ["game/gameobject/unit/VeteranLevel","game/trait/interface/NotifyTargetDestroy","game/event/UnitPromoteEvent","game/gameobject/unit/VeteranAbility","game/gameobject/trait/SelfHealingTrait","game/gameobject/trait/CloakableTrait","game/gameobject/trait/ArmedTrait","game/gameobject/trait/SensorsTrait"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/VeteranTrait",
  [
    "game/gameobject/unit/VeteranLevel",
    "game/trait/interface/NotifyTargetDestroy",
    "game/event/UnitPromoteEvent",
    "game/gameobject/unit/VeteranAbility",
    "game/gameobject/trait/SelfHealingTrait",
    "game/gameobject/trait/CloakableTrait",
    "game/gameobject/trait/ArmedTrait",
    "game/gameobject/trait/SensorsTrait",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o, l, c, h;
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
      ],
      execute: function () {
        ((h = class {
          constructor(e, t) {
            ((this.gameObject = e),
              (this.veteranRules = t),
              (this.veteranLevel = i.VeteranLevel.None),
              (this.xp = 0),
              (this.promotionThresh = e.rules.cost * t.veteranRatio + 1));
          }
          [r.NotifyTargetDestroy.onDestroy](e, t, i, r) {
            (e.isDestroyed && !e.isCrashing) ||
              (t.isTechno() &&
                (t.rules.dontScore ||
                  t.rules.insignificant ||
                  (((i && (i.warhead.rules.temporal || (i.warhead.rules.parasite && e.rules.organic))) ||
                    !r.areFriendly(e, t)) &&
                    (this.veteranLevel >= this.veteranRules.veteranCap ||
                      (this.gainXP(t.rules.cost * (t.veteranLevel + 1)) && this.handlePromotion(e, r))))));
          }
          setRelativeXP(e) {
            this.gainXP(Math.floor(e * this.promotionThresh));
          }
          gainXP(e) {
            if (((this.xp += e), this.xp >= this.promotionThresh)) {
              var t = Math.min(
                  this.veteranLevel + Math.floor(this.xp / this.promotionThresh),
                  this.veteranRules.veteranCap,
                ),
                i = t - this.veteranLevel;
              if (i) return ((this.xp -= i * this.promotionThresh), this.setVeteranLevel(t), !0);
            }
            return !1;
          }
          promote(e, t) {
            var i = Math.min(this.veteranLevel + e, this.veteranRules.veteranCap);
            i - this.veteranLevel && (this.setVeteranLevel(i), this.handlePromotion(this.gameObject, t));
          }
          isMaxLevel() {
            return this.veteranLevel === this.veteranRules.veteranCap;
          }
          isElite() {
            return this.veteranLevel === i.VeteranLevel.Elite;
          }
          setVeteranLevel(e) {
            ((this.veteranLevel = e),
              this.veteranLevel === i.VeteranLevel.Elite && this.gameObject.armedTrait?.toggleEliteWeapons(!0));
          }
          handlePromotion(e, t) {
            (this.hasVeteranAbility(a.VeteranAbility.SELF_HEAL) &&
              (e.traits.find(n.SelfHealingTrait) || t.addObjectTrait(e, new n.SelfHealingTrait())),
              this.hasVeteranAbility(a.VeteranAbility.CLOAK) &&
                (e.cloakableTrait ||
                  ((e.cloakableTrait = new o.CloakableTrait(e, t.rules.general.cloakDelay)),
                  t.addObjectTrait(e, e.cloakableTrait))),
              this.hasVeteranAbility(a.VeteranAbility.EXPLODES) &&
                (e.explodes ||
                  ((e.explodes = !0),
                  e.armedTrait || ((e.armedTrait = new l.ArmedTrait(e, t.rules)), t.addObjectTrait(e, e.armedTrait)))),
              this.hasVeteranAbility(a.VeteranAbility.RADAR_INVISIBLE) && (e.radarInvisible || (e.radarInvisible = !0)),
              this.hasVeteranAbility(a.VeteranAbility.SENSORS) &&
                (e.sensorsTrait || ((e.sensorsTrait = new c.SensorsTrait()), t.addObjectTrait(e, e.sensorsTrait))),
              e.isInfantry() && this.hasVeteranAbility(a.VeteranAbility.FEARLESS) && e.suppressionTrait?.disable(),
              this.hasVeteranAbility(a.VeteranAbility.C4) && (e.c4 || (e.c4 = !0)),
              this.hasVeteranAbility(a.VeteranAbility.GUARD_AREA) &&
                (e.defaultToGuardArea ||
                  ((e.defaultToGuardArea = !0), e.unitOrderTrait.isIdle() && e.resetGuardModeToIdle())),
              this.hasVeteranAbility(a.VeteranAbility.CRUSHER) && (e.crusher || (e.crusher = !0)),
              t.events.dispatch(new s.UnitPromoteEvent(e)));
          }
          getVeteranSightMultiplier() {
            return this.getVeteranAbilityMultiplier(a.VeteranAbility.SIGHT);
          }
          getVeteranSpeedMultiplier() {
            return this.getVeteranAbilityMultiplier(a.VeteranAbility.FASTER);
          }
          getVeteranArmorMultiplier() {
            return this.getVeteranAbilityMultiplier(a.VeteranAbility.STRONGER);
          }
          getVeteranDamageMultiplier() {
            return this.getVeteranAbilityMultiplier(a.VeteranAbility.FIREPOWER);
          }
          getVeteranRofMultiplier() {
            return this.getVeteranAbilityMultiplier(a.VeteranAbility.ROF);
          }
          hasVeteranAbility(e) {
            return (
              (this.veteranLevel === i.VeteranLevel.Veteran && this.gameObject.rules.veteranAbilities.has(e)) ||
              (this.veteranLevel >= i.VeteranLevel.Elite && this.gameObject.rules.eliteAbilities.has(e))
            );
          }
          getVeteranAbilityMultiplier(e) {
            let t = 1;
            return (
              ((this.veteranLevel === i.VeteranLevel.Veteran && this.gameObject.rules.veteranAbilities.has(e)) ||
                (this.veteranLevel >= i.VeteranLevel.Elite && this.gameObject.rules.eliteAbilities.has(e))) &&
                (t = this.getVeteranRulesMultiplier(e)),
              t
            );
          }
          getVeteranRulesMultiplier(e) {
            switch (e) {
              case a.VeteranAbility.FASTER:
                return this.veteranRules.veteranSpeed;
              case a.VeteranAbility.STRONGER:
                return this.veteranRules.veteranArmor;
              case a.VeteranAbility.FIREPOWER:
                return this.veteranRules.veteranCombat;
              case a.VeteranAbility.ROF:
                return this.veteranRules.veteranROF;
              case a.VeteranAbility.SIGHT:
                return this.veteranRules.veteranSight;
              default:
                throw new Error("Unhandled VeteranAbility " + e);
            }
          }
          dispose() {
            this.gameObject = void 0;
          }
        }),
          e("VeteranTrait", h));
      },
    };
  },
);
