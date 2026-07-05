// === Reconstructed SystemJS module: game/gameobject/trait/ArmedTrait ===
// deps: ["game/Weapon","game/WeaponType","game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/interface/NotifyDestroy","game/gameobject/unit/VeteranLevel","util/typeGuard"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/ArmedTrait",
  [
    "game/Weapon",
    "game/WeaponType",
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/trait/interface/NotifyDestroy",
    "game/gameobject/unit/VeteranLevel",
    "util/typeGuard",
  ],
  function (e, t) {
    "use strict";
    var a, n, i, r, s, o, l;
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
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          o = e;
        },
      ],
      execute: function () {
        ((l = class {
          constructor(e, t) {
            ((this.gameObject = e), (this.rules = t), (this.specialWeaponIndex = 0));
            // OpenYRWeb: per-(stage,elite) Weapon cache for special-weapon (Gattling/Gunner) units.
            // selectSpecialWeapon is invoked every time the Gattling stage advances; rebuilding the
            // Weapon each time reset its cooldown/burst state, dropping fire continuity. The cache
            // reuses the same Weapon instance across re-selects of an already-built stage.
            this._specialWeaponCache = new Map();
            var i = e.veteranLevel === s.VeteranLevel.Elite;
            e.rules.weaponCount
              ? (this.selectSpecialWeapon(0, i), (this.guardWeaponRangeOverride = this.primaryWeapon?.range))
              : this.selectStandardWeapons(i);
          }
          selectStandardWeapons(e = !1) {
            var t = this.gameObject,
              i = (e && t.rules.elitePrimary) || t.rules.primary;
            i
              ? ((s = e ? t.art.elitePrimaryFireFlh : t.art.primaryFireFlh),
                (this.primaryWeapon = a.Weapon.factory(i, n.WeaponType.Primary, t, this.rules, s)))
              : (this.primaryWeapon = void 0);
            var r,
              s = (e && t.rules.eliteSecondary) || t.rules.secondary;
            (s
              ? ((r = e ? t.art.eliteSecondaryFireFlh : t.art.secondaryFireFlh),
                (this.secondaryWeapon = a.Weapon.factory(s, n.WeaponType.Secondary, t, this.rules, r)))
              : (this.secondaryWeapon = void 0),
              (t.explodes || t.crashableTrait) &&
                ((r =
                  t.rules.deathWeapon ||
                  (!!t.crashableTrait && this.secondaryWeapon?.rules.name) ||
                  this.primaryWeapon?.rules.name ||
                  this.rules.combatDamage.deathWeapon),
                (this.deathWeapon = a.Weapon.factory(r, n.WeaponType.DeathWeapon, t, this.rules))));
          }
          selectSpecialWeapon(e, t = !1) {
            let i = this.gameObject;
            var r = i.rules.weaponCount;
            if (r < 1) throw new Error(`Object "${i.name}" doesn't support special weapons`);
            if (r - 1 < e) throw new RangeError(`Weapon index ${e} out of bounds (max ${r}) for object ` + i.name);
            // OpenYRWeb: reuse a cached Weapon for this (stage, elite) so re-selecting an
            // already-built stage (e.g. Gattling stage oscillation) does NOT reset its cooldown
            // or burst state. First selection of a stage builds & caches; later ones restore.
            var cacheKey = e + "_" + (t ? 1 : 0);
            var cached = this._specialWeaponCache.get(cacheKey);
            if (cached && cached.name) {
              this.primaryWeapon = cached.weapon;
              this.secondaryWeapon = void 0;
              this.specialWeaponIndex = e;
              this.deathWeapon =
                cached.weapon.rules.suicide
                  ? a.Weapon.factory(
                      i.rules.deathWeapon || cached.weapon.name,
                      n.WeaponType.DeathWeapon,
                      i,
                      this.rules,
                    )
                  : void 0;
              return;
            }
            var s = (t && i.rules.getEliteWeaponAtIndex(e)) || i.rules.getWeaponAtIndex(e);
            if (!s) throw new Error(`Missing weapon at index ${e} for object "${i.name}"`);
            r = i.art.getSpecialWeaponFlh(e);
            var built = a.Weapon.factory(s, n.WeaponType.Primary, i, this.rules, r);
            ((this.primaryWeapon = built),
              (this.secondaryWeapon = void 0),
              (this.specialWeaponIndex = e),
              (this.deathWeapon = this.primaryWeapon.rules.suicide
                ? a.Weapon.factory(
                    i.rules.deathWeapon || this.primaryWeapon.name,
                    n.WeaponType.DeathWeapon,
                    i,
                    this.rules,
                  )
                : void 0),
              this._specialWeaponCache.set(cacheKey, { name: s, weapon: built }));
          }
          toggleEliteWeapons(e) {
            this.gameObject.rules.weaponCount
              ? this.selectSpecialWeapon(this.specialWeaponIndex, e)
              : this.selectStandardWeapons(e);
          }
          getSpecialWeaponIndex() {
            return this.specialWeaponIndex;
          }
          computeGuardScanRange(t) {
            var e =
                this.guardWeaponRangeOverride ??
                [this.primaryWeapon, this.secondaryWeapon]
                  .filter((e) => e === t || e?.rules.neverUse)
                  .reduce((e, t) => Math.max(e, t.range), 0),
              e = Math.max(e, this.gameObject.rules.guardRange);
            return Math.min(15, 2 * e - 1);
          }
          getDeployFireWeapon() {
            if (this.gameObject.rules.deployFire)
              return this.gameObject.rules.deployFireWeapon === n.WeaponType.Primary
                ? this.primaryWeapon
                : this.secondaryWeapon;
          }
          isEquippedWithWeapon(e) {
            if ([this.primaryWeapon, this.secondaryWeapon].includes(e)) return !0;
            // OpenYRWeb: garrisoned buildings use occupant weapons
            var g = this.gameObject;
            if (g && g.garrisonTrait && g.garrisonTrait.isOccupied()) {
              for (var u of g.garrisonTrait.units) {
                if (u.primaryWeapon === e || u.secondaryWeapon === e) return !0;
              }
            }
            return !1;
          }
          getWeapons() {
            return [this.primaryWeapon, this.secondaryWeapon].filter(o.isNotNullOrUndefined);
          }
          [i.NotifyTick.onTick]() {
            (this.primaryWeapon && this.primaryWeapon.tick(), this.secondaryWeapon && this.secondaryWeapon.tick());
            // OpenYRWeb: tick weapons of garrisoned units so their cooldowns expire.
            var g = this.gameObject;
            if (g && g.garrisonTrait && g.garrisonTrait.isOccupied()) {
              for (var u of g.garrisonTrait.units) {
                u.primaryWeapon && u.primaryWeapon.tick();
                u.secondaryWeapon && u.secondaryWeapon.tick();
              }
            }
          }
          [r.NotifyDestroy.onDestroy](t, e, i) {
            !this.deathWeapon ||
              i?.weapon?.warhead.rules.temporal ||
              (t.crashableTrait && !t.isCrashing) ||
              (i?.obj?.isVehicle() && i.weapon?.rules.suicide && i.obj.transportTrait?.units.find((e) => e === t)) ||
              this.deathWeapon.fire(e.createTarget(t, t.tile), e);
          }
          dispose() {
            ((this.gameObject = void 0),
              (this.primaryWeapon = void 0),
              (this.secondaryWeapon = void 0),
              (this.deathWeapon = void 0));
          }
        }),
          e("ArmedTrait", l));
      },
    };
  },
);
