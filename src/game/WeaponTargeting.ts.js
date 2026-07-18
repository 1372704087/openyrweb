// === Reconstructed SystemJS module: game/WeaponTargeting ===
// deps: ["game/gameobject/infantry/StanceType","game/gameobject/unit/ZoneType","game/type/LandTargeting","game/type/LandType","game/type/NavalTargeting","game/type/SpeedType","game/WeaponType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/WeaponTargeting",
  [
    "game/gameobject/infantry/StanceType",
    "game/gameobject/unit/ZoneType",
    "game/type/LandTargeting",
    "game/type/LandType",
    "game/type/NavalTargeting",
    "game/type/SpeedType",
    "game/WeaponType",
  ],
  function (e, t) {
    "use strict";
    var r, s, i, a, n, o, l, c;
    t && t.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          i = e;
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
      ],
      execute: function () {
        e(
          "WeaponTargeting",
          (c = class {
            constructor(e, t, i, r, s, a) {
              ((this.weaponType = e),
                (this.projectileRules = t),
                (this.weaponRules = i),
                (this.warheadRules = r),
                (this.gameObject = s),
                (this.generalRules = a),
                (this.targetChecks = []),
                this.initConditions());
            }
            initConditions() {
              this.projectileRules.isAntiGround || this.targetChecks.push((e) => !!e);
              const a = this.generalRules.prism.type;
              (this.gameObject.name === a && this.weaponType === l.WeaponType.Secondary
                ? this.targetChecks.push(
                    (e, t, i, r, s) => !(!s || !e?.isBuilding() || e.name !== a || e.owner !== this.gameObject.owner),
                  )
                : this.warheadRules.electricAssault
                  ? this.targetChecks.push(
                      (e, t, i, r, s) =>
                        !((!r && !s) || !e?.isBuilding() || !e.overpoweredTrait || e.owner !== this.gameObject.owner),
                    )
                  : this.weaponRules.drainWeapon
                    ? this.targetChecks.push((e, t, i) => !!(e?.isBuilding() && e.rules?.drainable && !i.areFriendly(e, this.gameObject) && (!e.drainedBy || e.drainedBy === this.gameObject)))
                    : this.weaponRules.damage < 0
                    ? this.targetChecks.push(
                        (e, t, i) =>
                          !!(
                            e !== this.gameObject &&
                            e?.isUnit() &&
                            i.areFriendly(e, this.gameObject) &&
                            e.healthTrait.health < 100 &&
                            this.gameObject.isAircraft() === e.isAircraft()
                          ),
                      )
                    : (this.gameObject.rules.attackCursorOnFriendlies || this.warheadRules.bombDisarm
                        ? this.targetChecks.push(
                            (e, t, i, r, s) =>
                              !s &&
                              !!(!this.warheadRules.bombDisarm || (e?.isTechno() && e.tntChargeTrait?.hasCharge())),
                          )
                        : this.targetChecks.push(
                            (e, t, i, r) =>
                              !(
                                (!r || this.warheadRules.mindControl) &&
                                e?.isTechno() &&
                                i.areFriendly(e, this.gameObject)
                              ),
                          ),
                      this.targetChecks.push(
                        (e, t, i) =>
                          !(
                            e?.isTechno() &&
                            e.cloakableTrait?.isCloaked() &&
                            !i.alliances.haveSharedIntel(this.gameObject.owner, e.owner)
                          ),
                      ),
                      this.weaponRules.limboLaunch &&
                        this.targetChecks.push(
                          (e, t, i, r, s) =>
                            !(s && e && (e.isVehicle() || e.isAircraft()) && e.parasiteableTrait?.isInfested()),
                        ),
                      this.warheadRules.ivanBomb &&
                        this.targetChecks.push(
                          (e) => !(!e?.isTechno() || !e.tntChargeTrait || e.tntChargeTrait.hasCharge()),
                        ),
                      this.warheadRules.parasite &&
                        this.targetChecks.push(
                          (e, t, i, r) =>
                            !!(
                              (!e && r) ||
                              e?.isInfantry() ||
                              ((e?.isVehicle() || e?.isAircraft()) && e.parasiteableTrait)
                            ),
                        ),
                      this.warheadRules.mindControl &&
                        this.targetChecks.push((e) => !(!e?.isTechno() || !e.mindControllableTrait)),
                      this.warheadRules.temporal ||
                        this.targetChecks.push(
                          (e, t, i, r, s) => !(s && e?.isTechno() && e.warpedOutTrait.isInvulnerable()),
                        ),
                      this.gameObject.rules.natural &&
                        this.targetChecks.push((e) => !e?.isTechno() || !e.rules.unnatural)),
                this.targetChecks.push((e, t) => this.canTargetZone(e, t)));
            }
            canTarget(t, i, r, s, a) {
              return this.targetChecks.every((e) => e(t, i, r, s, a));
            }
            canTargetZone(e, t) {
              let i;
              if (e?.isUnit()) {
                if (e?.isInfantry() && e.stance === r.StanceType.Paradrop && 2 < e.tileElevation)
                  return (
                    this.projectileRules.isAntiAir &&
                    (this.projectileRules.isAntiGround || this.weaponType === l.WeaponType.Secondary)
                  );
                if (e.zone === s.ZoneType.Air) return this.projectileRules.isAntiAir;
                if (
                  this.weaponType === l.WeaponType.Secondary &&
                  this.projectileRules.isAntiAir &&
                  !this.projectileRules.isAntiGround
                )
                  return !1;
                i = e.zone;
              } else i = t.landType === a.LandType.Water ? s.ZoneType.Water : s.ZoneType.Ground;
              return i === s.ZoneType.Water
                ? this.canTargetNaval(this.gameObject.rules.navalTargeting, this.gameObject, e, this.weaponType)
                : this.canTargetLand(this.gameObject.rules.landTargeting, this.weaponType);
            }
            canTargetLand(e, t) {
              switch (e) {
                case i.LandTargeting.LandOk:
                  return !0;
                case i.LandTargeting.LandNotOk:
                  return !1;
                case i.LandTargeting.LandSecondary:
                  return t === l.WeaponType.Secondary;
                default:
                  throw new Error(`Unhandled LandTargeting value "${e}"`);
              }
            }
            canTargetNaval(e, t, i, r) {
              switch (e) {
                case n.NavalTargeting.UnderwaterNever:
                  return !i || !(i.isVehicle() && i.submergibleTrait?.isSubmerged());
                case n.NavalTargeting.UnderwaterSecondary:
                  return i && i.isVehicle() && i.submergibleTrait && !t.rules.spawned
                    ? r === l.WeaponType.Secondary
                    : r === l.WeaponType.Primary;
                case n.NavalTargeting.UnderwaterOnly:
                  return !!(i && i.isVehicle() && i.submergibleTrait);
                case n.NavalTargeting.OrganicSecondary:
                  return i?.isTechno() && i.rules.organic ? r === l.WeaponType.Secondary : r === l.WeaponType.Primary;
                case n.NavalTargeting.SealSpecial:
                  return i?.isTechno() &&
                    i.rules.naval &&
                    !i.rules.organic &&
                    (i.isBuilding() || i.rules.speedType === o.SpeedType.Float)
                    ? r === l.WeaponType.Secondary
                    : r === l.WeaponType.Primary;
                case n.NavalTargeting.NavalAll:
                case n.NavalTargeting.NavalAllEquivalent:
                  return !0;
                case n.NavalTargeting.NavalNone:
                  return !1;
                default:
                  throw new Error(`Unhandled NavalTargeting value "${e}"`);
              }
            }
          }),
        );
      },
    };
  },
);
