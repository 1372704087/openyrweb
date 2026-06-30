// === Reconstructed SystemJS module: game/gameobject/trait/ParasiteableTrait ===
// deps: ["game/gameobject/common/DeathType","game/gameobject/unit/ZoneType","game/gameobject/Vehicle","game/gameobject/trait/interface/NotifyAttack","game/gameobject/trait/interface/NotifyDestroy","game/gameobject/trait/interface/NotifyHeal","game/gameobject/trait/interface/NotifyDamage","game/gameobject/trait/interface/NotifyTeleport","game/gameobject/trait/interface/NotifyTick","game/gameobject/task/system/WaitMinutesTask","game/GameSpeed","game/map/tileFinder/RadialTileFinder","game/gameobject/task/AttackTask"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/ParasiteableTrait",
  [
    "game/gameobject/common/DeathType",
    "game/gameobject/unit/ZoneType",
    "game/gameobject/Vehicle",
    "game/gameobject/trait/interface/NotifyAttack",
    "game/gameobject/trait/interface/NotifyDestroy",
    "game/gameobject/trait/interface/NotifyHeal",
    "game/gameobject/trait/interface/NotifyDamage",
    "game/gameobject/trait/interface/NotifyTeleport",
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/task/system/WaitMinutesTask",
    "game/GameSpeed",
    "game/map/tileFinder/RadialTileFinder",
    "game/gameobject/task/AttackTask",
  ],
  function (e, t) {
    "use strict";
    var n, a, i, r, s, o, l, c, h, u, d, g, p, m, f;
    t && t.id;
    return {
      setters: [
        function (e) {
          n = e;
        },
        function (e) {
          a = e;
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
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
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
          p = e;
        },
      ],
      execute: function () {
        ((m = () => i.ROCKING_TICKS + 2),
          (f = class {
            constructor(e) {
              ((this.gameObject = e), (this.beingBoarded = !1));
            }
            infest(e, t) {
              ((this.beingBoarded = !1),
                (this.parasite = e),
                (this.parasiteWeapon = t),
                e.rules.organic ? (this.damageTickCooldown = m()) : (this.damageTickCooldown = 0),
                (this.lastAttacker = void 0),
                (this.lastExternalBaseDamage = void 0),
                (this.lastExternalDamageTick = void 0),
                t.warhead.rules.paralyzes && this.gameObject.moveTrait.setDisabled(!0));
            }
            isInfested() {
              return !(!this.parasite || this.parasite.isDestroyed) || this.beingBoarded;
            }
            isParalyzed() {
              return !!this.parasiteWeapon?.warhead.rules.paralyzes;
            }
            uninfest() {
              this.parasite &&
                (this.parasiteWeapon.warhead.rules.paralyzes && this.gameObject.moveTrait.setDisabled(!1),
                (this.parasite = void 0),
                (this.parasiteWeapon = void 0));
            }
            getParasite() {
              return this.parasite;
            }
            [h.NotifyTick.onTick](r, s) {
              if (this.parasite)
                if (this.parasite.isDestroyed) this.uninfest();
                else if (0 < this.damageTickCooldown) this.damageTickCooldown--;
                else {
                  let e = this.parasiteWeapon;
                  this.damageTickCooldown = this.parasite.rules.organic ? m() : e.getCooldownTicks();
                  let t = e.rules.damage;
                  this.parasite.veteranTrait && (t *= this.parasite.veteranTrait.getVeteranDamageMultiplier());
                  let i = e.warhead.computeDamage(t, r, s);
                  (this.canBeCulled(r, this.parasite, e, s) && (i = r.healthTrait.getHitPoints()),
                    e.warhead.inflictDamage(i, r, { player: this.parasite.owner, obj: this.parasite, weapon: e }, s),
                    r.isCrashing
                      ? (this.parasiteWeapon.expireCooldown(), this.evictOrDestroyParasite(r, s))
                      : !r.isDestroyed &&
                        r.isVehicle() &&
                        r.zone !== a.ZoneType.Air &&
                        e.warhead.rules.rocker &&
                        r.applyRocking(90 * (0.5 <= s.generateRandom() ? 1 : -1), 1));
                }
            }
            canBeCulled(e, t, i, r) {
              if (!i.warhead.rules.culling) return !1;
              var s = r.rules.audioVisual,
                s = t.veteranTrait?.isElite() ? s.conditionYellow : s.conditionRed;
              return e.healthTrait.health <= 100 * s;
            }
            [o.NotifyHeal.onHeal](e, t, i, r) {
              var s;
              !this.parasite ||
                this.parasite.isDestroyed ||
                r === e ||
                (e.isAircraft() && r?.rules.unitReload) ||
                (!this.parasite.rules.organic || r?.rules.unitRepair
                  ? ((this.parasite.deathType = n.DeathType.None),
                    t.destroyObject(this.parasite, r ? { player: r.owner, obj: r } : void 0),
                    this.uninfest())
                  : ((s = this.parasite), this.evictOrDestroyParasite(e, t), this.stunParasite(s, t)));
            }
            [l.NotifyDamage.onDamage](e, t, i, r) {
              r?.obj !== this.parasite &&
                ((this.lastAttacker = r),
                (this.lastExternalBaseDamage = r?.weapon?.rules.damage ?? i),
                (this.lastExternalDamageTick = t.currentTick));
            }
            [r.NotifyAttack.onAttack](i, r, s) {
              if (this.parasite && !this.parasite.isDestroyed && r?.weapon?.warhead.rules.sonic) {
                var a,
                  n = this.parasite;
                (this.evictOrDestroyParasite(i, s), this.stunParasite(n, s));
                let e = r.weapon.warhead;
                e.canDamage(n, n.tile, n.zone) &&
                  ((a = e.computeDamage(r.weapon.rules.damage, n, s)), e.inflictDamage(a, n, r, s));
                let t = r.obj?.unitOrderTrait.getCurrentTask();
                t instanceof p.AttackTask && t.getWeapon().warhead.rules.sonic && t.cancel();
              }
            }
            [s.NotifyDestroy.onDestroy](e, t, i, r) {
              this.parasite &&
                !this.parasite.isDestroyed &&
                (r || this.shouldSupressParasite(t, this.parasite)
                  ? ((this.parasite.deathType = n.DeathType.None),
                    t.destroyObject(this.parasite, i, r),
                    this.uninfest())
                  : (this.parasiteWeapon.expireCooldown(), this.evictOrDestroyParasite(e, t)));
            }
            shouldSupressParasite(e, t) {
              return (
                !t.invulnerableTrait.isActive() &&
                this.lastExternalBaseDamage &&
                this.lastExternalBaseDamage > t.rules.suppressionThreshold &&
                e.currentTick - this.lastExternalDamageTick <
                  2 * (this.lastExternalBaseDamage - t.rules.suppressionThreshold)
              );
            }
            [c.NotifyTeleport.onBeforeTeleport](e, t, i, r) {
              var s;
              i &&
                r &&
                this.parasite &&
                !this.parasite.isDestroyed &&
                (this.shouldSupressParasite(t, this.parasite)
                  ? ((this.parasite.deathType = n.DeathType.None),
                    t.destroyObject(this.parasite, this.lastAttacker),
                    this.uninfest())
                  : (this.parasiteWeapon.expireCooldown(),
                    (s = this.parasite),
                    this.evictOrDestroyParasite(e, t, !0),
                    s.isDestroyed || this.stunParasite(s, t)));
            }
            stunParasite(e, t) {
              (e.unitOrderTrait.addTaskToFront(new u.WaitMinutesTask(10 / 60).setCancellable(!1)),
                e.isVehicle() &&
                  e.submergibleTrait &&
                  (e.submergibleTrait.emerge(e, t),
                  e.cloakableTrait?.uncloak(t),
                  e.submergibleTrait.setCooldown(10 * d.GameSpeed.BASE_TICKS_PER_SECOND)));
            }
            evictOrDestroyParasite(r, s, e = !1) {
              if (this.parasite && !this.parasite.isDestroyed) {
                if (
                  s.map.terrain.getPassableSpeed(
                    r.tile,
                    this.parasite.rules.speedType,
                    this.parasite.isInfantry(),
                    r.onBridge,
                  ) ||
                  s.map.getObjectsOnTile(r.tile).find((e) => e.isBuilding())
                ) {
                  let t = r.tile,
                    i = r.onBridge;
                  if ((!e && !r.isDestroyed) || this.parasite.rules.organic) {
                    let e = new g.RadialTileFinder(
                      s.map.tiles,
                      s.map.mapBounds,
                      t,
                      { width: 1, height: 1 },
                      1,
                      1,
                      (e) =>
                        0 <
                          s.map.terrain.getPassableSpeed(
                            e,
                            this.parasite.rules.speedType,
                            this.parasite.isInfantry(),
                            i,
                          ) && !s.map.terrain.findObstacles({ tile: e, onBridge: i }, this.parasite).length,
                    );
                    var a = e.getNextTile();
                    if (!a)
                      return (
                        (this.parasite.deathType = n.DeathType.None),
                        s.destroyObject(this.parasite, { player: r.owner, obj: r }),
                        void this.uninfest()
                      );
                    t = a;
                  }
                  ((this.parasite.onBridge = i),
                    (this.parasite.position.subCell = this.parasite.isInfantry() ? r.position.subCell : 0),
                    (this.parasite.zone = s.map.getTileZone(t, !i)),
                    (this.parasite.position.tileElevation = i
                      ? s.map.tileOccupation.getBridgeOnTile(t).tileElevation
                      : 0),
                    this.parasite.resetGuardModeToIdle(),
                    s.unlimboObject(this.parasite, t, !0));
                } else
                  ((this.parasite.deathType = n.DeathType.None),
                    s.destroyObject(this.parasite, { player: r.owner, obj: r }));
                this.uninfest();
              }
            }
            destroyParasite(e, t) {
              this.parasite &&
                ((this.parasite.deathType = n.DeathType.None), t.destroyObject(this.parasite, e), this.uninfest());
            }
            dispose() {
              this.gameObject = void 0;
            }
          }),
          e("ParasiteableTrait", f));
      },
    };
  },
);
