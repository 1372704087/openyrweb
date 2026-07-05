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
    var h, u, d, g, i, p, a, m, r, f, y, s, T, v, b, S;
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
          (T = 5),
          (v = 2),
          (b = 1),
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
                return this.gameObject.isBuilding() &&
                  !this.gameObject.overpoweredTrait &&
                  this.type === r.WeaponType.Secondary &&
                  this.gameObject.primaryWeapon
                  ? Math.min(this.gameObject.primaryWeapon.rules.range, this.rules.range)
                  : this.rules.range;
              }
              get speed() {
                return S.computeSpeed(this.rules, this.projectileRules);
              }
              get rof() {
                let e = this.rules.rof;
                return (
                  this.gameObject.veteranTrait && (e *= this.gameObject.veteranTrait.getVeteranRofMultiplier()),
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
                        : this.gameObject.isAircraft()
                          ? (this.burstsLeft =
                              this.projectileRules.iniRot <= 1 ? T - 1 : this.gameObject.rules.fighter ? b - 1 : v - 1)
                          : ((this.burstsLeft = this.rules.burst - 1), (this.useBurstDelay = !0)),
                      (this.lateralMuzzleMult = 1)),
                    0 < this.burstsLeft &&
                      (t && 0 < o
                        ? (this.cooldownTicks = this.rules.iniSpeed)
                        : this.gameObject.isAircraft()
                          ? (this.cooldownTicks = this.rules.rof)
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
                      e * (this.gameObject.isUnit() ? this.gameObject.crateBonuses.firepower : 1));
                  let r = this.flh.clone();
                  r.lateral *= this.lateralMuzzleMult;
                  var l = n.position.getMapPosition();
                  if (a.map.isWithinHardBounds(l)) {
                    (i.position.moveToLeptons(l), (i.position.tileElevation = n.position.tileElevation));
                    let e = new f.Vector2(r.lateral, r.forward);
                    var c = this.getMuzzleFacing() + this.distributedFireAngle;
                    e = g.rotateVec2(e, c);
                    ((l = new f.Vector2(0, n.art.turretOffset)), (l = g.rotateVec2(l, n.direction)));
                    (e.add(l),
                      n.rules.radialFireSegments &&
                        n.rules.distributedFire &&
                        ((l = Math.floor(180 / n.rules.radialFireSegments)),
                        (this.distributedFireAngle = ((this.distributedFireAngle + l + 90) % 180) - 90)),
                      (i.direction = c),
                      n.isBuilding() &&
                        n.rules.turretAnim &&
                        ((h = p.Coords.screenDistanceToWorld(n.rules.turretAnimX, n.rules.turretAnimY)),
                        (c = n.getFoundationCenterOffset()),
                        i.position.moveByLeptons(-c.x + h.x, -c.y + h.y)));
                    let t = new y.Vector3(e.x, r.vertical, -e.y);
                    var h = t.clone().add(i.position.worldPosition);
                    if (
                      (a.map.isWithinHardBounds(h) && i.position.moveByLeptons3(t),
                      i.tileElevation < 0 && (i.position.tileElevation = 0),
                      i.isAircraft() ? a.unlimboObject(i, i.position.tile) : a.spawnObject(i, i.position.tile),
                      this.rules.revealOnFire && s.obj?.isTechno())
                    ) {
                      let e = a.mapShroudTrait.getPlayerShroud(s.obj.owner);
                      e?.isShrouded(n.tile, n.tileElevation) && e.revealTemporarily(n);
                    }
                    (this.rules.decloakToFire && this.gameObject.cloakableTrait?.uncloak(a),
                      a.events.dispatch(new d.WeaponFireEvent(this, this.gameObject)));
                  } else t && (t.owner.removeOwnedObject(t), t.dispose());
                }
              }
              getMuzzleFacing() {
                let e = this.gameObject,
                  t;
                return (
                  (t =
                    !e.isInfantry() && !e.isAircraft() && (e.isBuilding() || e.isVehicle()) && e.turretTrait
                      ? e.turretTrait.facing
                      : e.direction),
                  t
                );
              }
            }),
          ),
          (S.NUKE_PAYLOAD_NAME = "NukePayload"));
      },
    };
  },
);
