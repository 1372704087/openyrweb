// === Reconstructed SystemJS module: game/Weapon ===
// deps: ["game/Warhead","game/art/FlhCoords","game/event/WeaponFireEvent","game/math/geometry","game/rules/ObjectRules","game/Coords","engine/type/ObjectType","game/WeaponTargeting","game/WeaponType","game/math/Vector2","game/math/Vector3"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/Weapon",
  [
    "game/Warhead",
    "game/art/FlhCoords",
    "game/event/WeaponFireEvent",
    "game/math/geometry",
    "game/rules/ObjectRules",
    "game/Coords",
    "engine/type/ObjectType",
    "game/WeaponTargeting",
    "game/WeaponType",
    "game/math/Vector2",
    "game/math/Vector3",
  ],
  function (e, t) {
    "use strict";
    var h, u, d, g, i, p, a, m, r, f, y, s, S;
    t && t.id;
    return {
      setters: [
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          f = e;
        },
        function (e) {
          y = e;
        },
      ],
      execute: function () {
        ((s = 50),
          e(
            "Weapon",
            (S = class S {
              static factory(e, t, i, r, s) {
                var a = r.getWeapon(e);
                let n = a.warhead;
                n === h.Warhead.SPECIAL_WARHEAD_NAME && (n = S.findSpecialWarheadName(a, i, r));
                var o = new h.Warhead(r.getWarhead(n)),
                  l = r.getProjectile(a.projectile),
                  c = new m.WeaponTargeting(t, l, a, o.rules, i, r.general);
                return new this(t, i, a, o, l, s || new u.FlhCoords(), c);
              }
              static findSpecialWarheadName(e, t, i) {
                let r;
                if (!e.spawner) throw new Error(`Weapon "${e.name} can't use "Special" warhead without Spawner=yes`);
                if (t.rules.spawns === i.general.v3Rocket.type) r = i.combatDamage.v3Warhead;
                else if (t.rules.spawns === i.general.dMisl.type) r = i.combatDamage.dMislWarhead;
                else if (t.rules.spawns === i.general.cMisl.type) r = i.combatDamage.cMislWarhead;
                else {
                  if (!t.rules.spawns)
                    throw new Error(`Can't use "Special" warhead on unit type "${t.name}" without "Spawns"`);
                  var s = i.getObject(t.rules.spawns, a.ObjectType.Aircraft);
                  if (!s.primary) throw new Error(`Spawned unit "${s.name}" doesn't have a primary weapon`);
                  r = i.getWeapon(s.primary).warhead;
                }
                return r;
              }
              static computeSpeed(e, t) {
                return t.arcing
                  ? 0.75 * i.ObjectRules.iniSpeedToLeptonsPerTick(s, 100)
                  : !t.rot || t.inviso || e.isLaser || e.isElectricBolt
                    ? Number.POSITIVE_INFINITY
                    : e.speed;
              }
              constructor(e, t, i, r, s, a, n) {
                ((this.type = e),
                  (this.gameObject = t),
                  (this.rules = i),
                  (this.warhead = r),
                  (this.projectileRules = s),
                  (this.flh = a),
                  (this.targeting = n),
                  (this.cooldownTicks = 0),
                  (this.burstsLeft = 0),
                  (this.burstIndex = 0),
                  (this.useBurstDelay = !1),
                  (this.lateralMuzzleMult = 1),
                  (this.distributedFireAngle = t.rules.distributedFire && t.rules.radialFireSegments ? -90 : 0));
              }
              get name() {
                return this.rules.name;
              }
              get minRange() {
                return this.rules.minimumRange;
              }
              get range() {
                let baseRange = this.gameObject.isBuilding() &&
                  !this.gameObject.overpoweredTrait &&
                  this.type === r.WeaponType.Secondary &&
                  this.gameObject.primaryWeapon
                  ? Math.min(this.gameObject.primaryWeapon.rules.range, this.rules.range)
                  : this.rules.range;
                // OpenYRWeb: Tank Bunker weapon range bonus (BunkerWeaponRangeBonus, default 0).
                // The bonus is in tiles (from [CombatDamage]BunkerWeaponRangeBonus), same unit as
                // rules.range. Do NOT multiply by LEPTONS_PER_TILE — range comparisons divide
                // distance by LEPTONS_PER_TILE, so range values must stay in tile units.
                if (this.gameObject.bunkeredAt && this.gameObject.bunkeredAt.tankBunkerTrait) {
                  baseRange += S.bunkerWeaponRangeBonus;
                }
                // OpenYRWeb: OpenTopped transport range bonus (OpenToppedRangeBonus, default 2).
                // Passengers firing from an OpenTopped=yes transport (e.g. Battle Fortress) get
                // a bonus to their weapon range. The passenger's gameObject.transport back-ref
                // is set in EnterTransportTask and cleared on exit/destruction.
                if (this.gameObject.transport && this.gameObject.transport.rules.openTopped) {
                  baseRange += S.openToppedRangeBonus;
                }
                // OpenYRWeb: OccupyWeaponRange (vanilla YR [CombatDamage], default 5) overrides
                // the range of any weapon fired by an infantry with Occupier=yes while occupying
                // a building (ModEnc). A fixed value is needed because two different occupants
                // may have different weapon ranges — the short-range guy would otherwise make
                // the building stop shooting. The occupant's gameObject.garrisonedAt back-ref is
                // set in GarrisonBuildingTask.onEnter and cleared on evacuation/destruction.
                if (this.gameObject.garrisonedAt) {
                  baseRange = S.occupyWeaponRange;
                }
                return baseRange;
              }
              get speed() {
                return S.computeSpeed(this.rules, this.projectileRules);
              }
              get rof() {
                let e = this.rules.rof;
                return (
                  this.gameObject.veteranTrait && (e *= this.gameObject.veteranTrait.getVeteranRofMultiplier()),
                  // OpenYRWeb: berserk units fire faster (BerserkROFMultiplier, default 0.5 = 2x speed).
                  this.gameObject.berserkTrait?.isBerserk() && (e *= S.berserkROFMultiplier),
                  // OpenYRWeb: Tank Bunker ROF multiplier (BunkerROFMultiplier, default 1).
                  // Divide so values > 1 INCREASE fire rate (matching YR docs: larger = faster).
                  this.gameObject.bunkeredAt && this.gameObject.bunkeredAt.tankBunkerTrait && (e /= S.bunkerROFMultiplier),
                  // OpenYRWeb: OccupyROFMultiplier (vanilla YR [CombatDamage], default 1.2) —
                  // multiplier to ROF of any weapon fired by an infantry while occupying a
                  // building (ModEnc). Divide so values > 1 INCREASE fire rate.
                  this.gameObject.garrisonedAt && (e /= S.occupyROFMultiplier),
                  Math.floor(e)
                );
              }
              getCooldownTicks() {
                return this.cooldownTicks;
              }
              expireCooldown() {
                this.cooldownTicks = 0;
              }
              resetCooldown() {
                this.cooldownTicks = this.rof;
              }
              hasBurstsLeft() {
                return 0 < this.burstsLeft;
              }
              resetBursts() {
                ((this.burstsLeft = 0),
                  (this.burstIndex = 0),
                  this.resetCooldown(),
                  this.gameObject.ammoTrait && 0 < this.gameObject.ammoTrait.ammo && this.gameObject.ammoTrait.ammo--);
              }
              tick() {
                0 < this.cooldownTicks && this.cooldownTicks--;
              }
              getBurstsFired() {
                return this.burstIndex;
              }
              fire(s, a, e = 1) {
                let n = this.gameObject,
                  // OpenYRWeb: when a passenger fires from an OpenTopped transport (e.g.
                  // Battle Fortress), use the transport's position/direction/tile as the
                  // fire origin — the passenger is limboed and its own position is stale.
                  // Same for a garrisoned infantry (Occupier=yes, e.g. inside a Battle
                  // Bunker): the soldier is limboed, so fire from the building instead of
                  // the tile it entered from.
                  fireOrigin = n.transport && n.transport.rules.openTopped ? n.transport : n.garrisonedAt ? n.garrisonedAt : n,
                  t,
                  o = 0;
                if (
                  !n.airSpawnTrait ||
                  !this.rules.spawner ||
                  ((t = n.airSpawnTrait.prepareLaunch(n, s, a)), (o = n.airSpawnTrait.availableSpawns), t)
                ) {
                  (this.burstsLeft
                    ? (this.burstsLeft--, this.burstIndex++, (this.lateralMuzzleMult *= -1))
                    : ((this.useBurstDelay = !1),
                      (this.burstIndex = 0),
                      t
                        ? (this.burstsLeft = o)
                        // OpenYRWeb: aircraft honour the config Burst too (vanilla YR).
                        // This used to be hardcoded per category (fighter=1 shot), which
                        // made the MiG fire only one of its two Maverick3 missiles.
                        : this.gameObject.isAircraft()
                          ? (this.burstsLeft = this.rules.burst - 1)
                          : ((this.burstsLeft = this.rules.burst - 1), (this.useBurstDelay = !0)),
                      (this.lateralMuzzleMult = 1)),
                    0 < this.burstsLeft &&
                      (t && 0 < o
                        ? (this.cooldownTicks = this.rules.iniSpeed)
                        : this.gameObject.isAircraft()
                          ? // OpenYRWeb: aircraft burst shots fire back-to-back (a volley,
                            // one per tick) instead of waiting a full ROF between missiles.
                            // The ROF still applies after the volley (resetBursts).
                            (this.cooldownTicks = 0)
                          : (this.cooldownTicks =
                              this.useBurstDelay && void 0 !== this.gameObject.rules.burstDelay[this.burstIndex]
                                ? this.gameObject.rules.burstDelay[this.burstIndex]
                                : a.generateRandomInt(3, 5))),
                    this.burstsLeft || this.resetBursts(),
                    this.rules.limboLaunch &&
                      (a.limboObject(this.gameObject, {
                        selected: a.getUnitSelection().isSelected(this.gameObject),
                        controlGroup: a
                          .getUnitSelection()
                          .getOrCreateSelectionModel(this.gameObject)
                          .getControlGroupNumber(),
                      }),
                      this.warhead.rules.parasite &&
                        (s.obj?.isVehicle() || s.obj?.isAircraft()) &&
                        s.obj.parasiteableTrait &&
                        (s.obj.parasiteableTrait.beingBoarded = !0)));
                  let i = t ?? a.createProjectile(this.projectileRules.name, this.gameObject, this, s, !1);
                  i.isAircraft() ||
                    (i.baseDamageMultiplier =
                      e * (this.gameObject.isUnit() ? this.gameObject.crateBonuses.firepower : 1) *
                      // OpenYRWeb: Tank Bunker damage multiplier (BunkerDamageMultiplier, default 1).
                      // Multiplies weapon damage when the vehicle is inside a Tank Bunker.
                      (this.gameObject.bunkeredAt && this.gameObject.bunkeredAt.tankBunkerTrait ? S.bunkerDamageMultiplier : 1) *
                      // OpenYRWeb: OpenTopped damage multiplier (OpenToppedDamageMultiplier, default 1.2).
                      // Multiplies passenger weapon damage when firing from an OpenTopped transport.
                      (this.gameObject.transport && this.gameObject.transport.rules.openTopped ? S.openToppedDamageMultiplier : 1) *
                      // OpenYRWeb: OccupyDamageMultiplier (vanilla YR [CombatDamage], default 1.2).
                      // Multiplies weapon damage while the infantry is occupying a building.
                      (this.gameObject.garrisonedAt ? S.occupyDamageMultiplier : 1));
                  let r = this.flh.clone();
                  // OpenYRWeb: when a passenger fires from an OpenTopped transport, use the
                  // transport's AlternateFLH (gun-port positions) instead of the passenger's
                  // own FLH. Each passenger slot (0-based) maps to AlternateFLH0, AlternateFLH1,
                  // ... on the transport (e.g. BFRT: 0=(45,190,90), 1=(45,-190,90), ...).
                  // Falls back to (0,0,0) (transport centre) if no AlternateFLH is defined.
                  // If there are more passengers than configured ports (e.g. MaxPassengers=15
                  // with only AlternateFLH0-4), the ports cycle (index % count) so every
                  // passenger fires from a distinct gun port instead of stacking at the centre.
                  if (fireOrigin !== n && fireOrigin.transportTrait) {
                    var passengerIndex = fireOrigin.transportTrait.units.indexOf(n);
                    if (passengerIndex >= 0) {
                      var alternateFlhCount = fireOrigin.art.getAlternateFlhCount();
                      r = fireOrigin.art.getAlternateFlh(
                        alternateFlhCount > 0 ? passengerIndex % alternateFlhCount : passengerIndex,
                      );
                    }
                  }
                  r.lateral *= this.lateralMuzzleMult;
                  var l = fireOrigin.position.getMapPosition();
                  if (a.map.isWithinHardBounds(l)) {
                    (i.position.moveToLeptons(l), (i.position.tileElevation = fireOrigin.position.tileElevation));
                    let e = new f.Vector2(r.lateral, r.forward);
                    var c = this.getMuzzleFacing() + this.distributedFireAngle;
                    e = g.rotateVec2(e, c);
                    ((l = new f.Vector2(0, fireOrigin.art.turretOffset)), (l = g.rotateVec2(l, fireOrigin.direction)));
                    (e.add(l),
                      n.rules.radialFireSegments &&
                        n.rules.distributedFire &&
                        ((l = Math.floor(180 / n.rules.radialFireSegments)),
                        (this.distributedFireAngle = ((this.distributedFireAngle + l + 90) % 180) - 90)),
                      (i.direction = c),
                      fireOrigin.isBuilding() &&
                        fireOrigin.rules.turretAnim &&
                        ((h = p.Coords.screenDistanceToWorld(fireOrigin.rules.turretAnimX, fireOrigin.rules.turretAnimY)),
                        (c = fireOrigin.getFoundationCenterOffset()),
                        i.position.moveByLeptons(-c.x + h.x, -c.y + h.y)));
                    // OpenYRWeb: buildings may define PrimaryFirePixelOffset / SecondaryFirePixelOffset
                    // (vanilla art.ini) as a fixed firing point instead of an FLH — e.g. the Maya
                    // Pyramid (CAMEX01) has no FLH and fires from "0,-80". The offset is a screen-pixel
                    // offset from the building's base centre: X → ground offset (screen-horizontal),
                    // Y → world height (down positive). It stays fixed (does not rotate with facing).
                    // Only applies when the building itself fires (not a garrisoned/transported unit).
                    if (
                      fireOrigin.isBuilding() &&
                      fireOrigin === n &&
                      // Note: module-level `r` (WeaponType) is shadowed inside fire() by the
                      // local FLH clone, so compare against the raw enum values here:
                      // WeaponType.Primary = 0, WeaponType.Secondary = 1.
                      (0 === this.type || 1 === this.type)
                    ) {
                      let pf =
                        0 === this.type
                          ? fireOrigin.art.primaryFirePixelOffset
                          : fireOrigin.art.secondaryFirePixelOffset;
                      if (pf.length) {
                        let px = p.Coords.screenDistanceToWorld(pf[0], 0);
                        e.add(new f.Vector2(px.x, px.y));
                        // OpenYRWeb: building PrimaryFirePixelOffset/SecondaryFirePixelOffset.
                        // - Weapon WITH an FLH (Prism Tower: PrimaryFireFLH=0,0,378 +
                        //   PrimaryFireDualOffset=true): the FLH already positions the firing
                        //   point, and the pixel offset is a small screen-space correction.
                        //   It uses the engine's original 4x art-pixel scale so the Prism
                        //   Tower keeps its vanilla firing height (FLH 378 + 4*27.9 ≈ 490).
                        // - Weapon WITHOUT an FLH (Maya Pyramid CAMEX01): PrimaryFirePixelOffset
                        //   (0,0) anchors at the building's 3D centre (长宽高中心: foundation
                        //   centre x/z + half its art Height). The offset Y is converted at
                        //   3.375 leptons per art-pixel, calibrated so pf=(0,-80) lands on the
                        //   pyramid's top firing device (centre + 270 ≈ 740).
                        const hasFlh = 0 !== r.forward || 0 !== r.lateral || 0 !== r.vertical;
                        r.vertical += hasFlh
                          ? 4 * p.Coords.tileHeightToWorld(-pf[1] / (p.Coords.ISO_TILE_SIZE / 2))
                          : p.Coords.tileHeightToWorld(fireOrigin.art.height) / 2 - pf[1] * 3.375;
                      }
                    }
                    let t = new y.Vector3(e.x, r.vertical, -e.y);
                    var h = t.clone().add(i.position.worldPosition);
                    if (
                      (a.map.isWithinHardBounds(h) && i.position.moveByLeptons3(t),
                      i.tileElevation < 0 && (i.position.tileElevation = 0),
                      i.isAircraft() ? a.unlimboObject(i, i.position.tile) : a.spawnObject(i, i.position.tile),
                      this.rules.revealOnFire && s.obj?.isTechno())
                    ) {
                      let e = a.mapShroudTrait.getPlayerShroud(s.obj.owner);
                      e?.isShrouded(fireOrigin.tile, fireOrigin.tileElevation) && e.revealTemporarily(fireOrigin);
                    }
                    (this.rules.decloakToFire && this.gameObject.cloakableTrait?.uncloak(a),
                      // OpenYRWeb: dispatch the fire event with the fire origin (the OpenTopped
                      // transport / garrison building) instead of the limboed shooter. SoundHandler
                      // plays the weapon Report at the event object's position; the passenger's own
                      // position is frozen where it entered the transport and can be far away or
                      // shrouded, which made passenger fire reports inaudible. The origin's
                      // position is live, so the sound follows the transport like vanilla YR.
                      a.events.dispatch(new d.WeaponFireEvent(this, fireOrigin)));
                  } else t && (t.owner.removeOwnedObject(t), t.dispose());
                }
              }
              getMuzzleFacing() {
                let e = this.gameObject,
                  // OpenYRWeb: when firing from an OpenTopped transport, use the transport's
                  // facing (and turret if it has one) so the muzzle direction follows the
                  // vehicle's orientation as it moves and turns. A garrisoned infantry uses
                  // the building's facing (buildings cannot turn — vanilla YR behaviour).
                  origin = e.transport && e.transport.rules.openTopped ? e.transport : e.garrisonedAt ? e.garrisonedAt : e,
                  t;
                return (
                  (t =
                    !origin.isInfantry() && !origin.isAircraft() && (origin.isBuilding() || origin.isVehicle()) && origin.turretTrait
                      ? origin.rules.turretSpins
                        ? origin.direction
                        : origin.turretTrait.facing
                      : origin.direction),
                  t
                );
              }
            }),
          ),
          (S.NUKE_PAYLOAD_NAME = "NukePayload"),
          // OpenYRWeb: berserk fire-rate multiplier (vanilla YR [CombatDamage] BerserkROFMultiplier=0.5).
          // Set from CombatDamageRules during game initialization. Default 0.5 = 2x fire rate.
          (S.berserkROFMultiplier = 0.5),
          // OpenYRWeb: Tank Bunker weapon bonus multipliers (vanilla YR [CombatDamage]).
          // Set from CombatDamageRules during game initialization. Defaults match vanilla YR.
          (S.bunkerDamageMultiplier = 1),
          (S.bunkerROFMultiplier = 1),
          (S.bunkerWeaponRangeBonus = 0),
          // OpenYRWeb: OpenTopped (Battle Fortress) passenger firing bonuses (vanilla YR [CombatDamage]).
          // Set from CombatDamageRules during game initialization. Defaults match vanilla YR.
          (S.openToppedRangeBonus = 2),
          (S.openToppedDamageMultiplier = 1.2),
          // OpenYRWeb: garrisoned-infantry firing bonuses (vanilla YR [CombatDamage]).
          // OccupyWeaponRange overrides the range while occupying a building (default 5);
          // OccupyDamageMultiplier / OccupyROFMultiplier scale damage / ROF (default 1.2).
          // Set from CombatDamageRules during game initialization. Defaults match vanilla YR.
          (S.occupyWeaponRange = 5),
          (S.occupyDamageMultiplier = 1.2),
          (S.occupyROFMultiplier = 1.2));
      },
    };
  },
);
