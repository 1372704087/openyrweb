// === Reconstructed SystemJS module: game/gameobject/trait/AttackTrait ===
// deps: ["util/typeGuard","game/type/ArmorType","game/gameobject/unit/ZoneType","game/gameobject/task/AttackTask","game/SideType","game/gameobject/trait/interface/NotifyTick","game/gameobject/unit/RangeHelper","game/gameobject/trait/interface/NotifyDamage","game/gameobject/task/system/TaskRunner","game/Target","game/gameobject/task/move/MoveTask","game/gameobject/task/system/CallbackTask","game/gameobject/trait/MoveTrait","game/type/MovementZone","game/Coords","game/gameobject/trait/interface/NotifyTeleport","game/type/VhpScan","game/gameobject/unit/LosHelper","game/math/Vector2","game/math/Box2"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/AttackTrait",
  [
    "util/typeGuard",
    "game/type/ArmorType",
    "game/gameobject/unit/ZoneType",
    "game/gameobject/task/AttackTask",
    "game/SideType",
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/unit/RangeHelper",
    "game/gameobject/trait/interface/NotifyDamage",
    "game/gameobject/task/system/TaskRunner",
    "game/Target",
    "game/gameobject/task/move/MoveTask",
    "game/gameobject/task/system/CallbackTask",
    "game/gameobject/trait/MoveTrait",
    "game/type/MovementZone",
    "game/Coords",
    "game/gameobject/trait/interface/NotifyTeleport",
    "game/type/VhpScan",
    "game/gameobject/unit/LosHelper",
    "game/math/Vector2",
    "game/math/Box2",
  ],
  function (t, e) {
    "use strict";
    var o, s, h, u, a, d, i, r, n, l, g, p, m, f, y, c, T, v, b, S, w, E;
    e && e.id;
    return {
      setters: [
        function (e) {
          o = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          f = e;
        },
        function (e) {
          y = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          T = e;
        },
        function (e) {
          v = e;
        },
        function (e) {
          b = e;
        },
        function (e) {
          S = e;
        },
      ],
      execute: function () {
        var e;
        (((e = w || t("AttackState", (w = {})))[(e.Idle = 0)] = "Idle"),
          (e[(e.CheckRange = 1)] = "CheckRange"),
          (e[(e.PrepareToFire = 2)] = "PrepareToFire"),
          (e[(e.FireUp = 3)] = "FireUp"),
          (e[(e.Firing = 4)] = "Firing"),
          (e[(e.JustFired = 5)] = "JustFired"),
          (E = class {
            constructor(e, t) {
              ((this.disabled = !1),
                (this.attackState = w.Idle),
                (this.passiveScanCooldownTicks = 0),
                (this.taskRunner = new n.TaskRunner()),
                (this.distributedFireHistory = new Map()),
                (this.rangeHelper = new i.RangeHelper(t)),
                (this.losHelper = new v.LosHelper(e, t)));
            }
            isIdle() {
              return this.attackState === w.Idle;
            }
            isDisabled() {
              return this.disabled;
            }
            setDisabled(e) {
              this.disabled = e;
            }
            isOnCooldown(e) {
              let t = [e.primaryWeapon, e.secondaryWeapon],
                i = e.armedTrait?.getDeployFireWeapon();
              return (
                i?.rules.areaFire && !i.rules.fireOnce && (t = t.filter((e) => e !== i)),
                t.some((e) => 0 < (e?.getCooldownTicks() ?? 0))
              );
            }
            expirePassiveScanCooldown() {
              this.passiveScanCooldownTicks = 0;
            }
            increasePassiveScanCooldown(e) {
              this.passiveScanCooldownTicks += e;
            }
            cancelOpportunityFire() {
              this.opportunityFireTask?.cancel();
            }
            getOpportunityFireTask() {
              return this.opportunityFireTask;
            }
            selectDefaultWeapon(e) {
              let i;
              if ((e.isInfantry() || e.isVehicle()) && e.rules.deployFire) {
                let t = e.armedTrait?.getDeployFireWeapon();
                i = e.deployerTrait?.isDeployed()
                  ? t && !t.rules.areaFire
                    ? t
                    : void 0
                  : [e.primaryWeapon, e.secondaryWeapon].find((e) => e !== t);
              } else
                i =
                  e.isBuilding() && e.garrisonTrait
                    ? e.garrisonTrait.isOccupied()
                      ? e.owner.country.side === a.SideType.GDI
                        ? e.primaryWeapon
                        : (e.secondaryWeapon ?? e.primaryWeapon)
                      : void 0
                    : e.isBuilding() && e.overpoweredTrait
                      ? e.overpoweredTrait.getWeapon()
                      : e.primaryWeapon;
              return i;
            }
            selectWeaponVersus(e, t, i, r = !1, s = !1) {
              var a = t.tile;
              const n = t instanceof l.Target ? t.obj : t;
              var o = this.getAvailableWeapons(e, s, n?.isOverlay() || (r && !n));
              return this.selectWeaponFromList(e, n, a, o, i, r, s, !1);
            }
            selectWeaponFromList(e, t, i, r, s, a, n, o) {
              if (
                ((!t?.isInfantry() && !t?.isVehicle()) ||
                  !t.disguiseTrait ||
                  this.canAttackThroughDisguise(e, t, t.disguiseTrait, s, a, n, o)) &&
                (t?.isBuilding() &&
                  t.overpoweredTrait &&
                  t.owner === e.owner &&
                  r.find((e) => e.warhead.rules.electricAssault) &&
                  (r = r.filter((e) => e.warhead.rules.electricAssault)),
                !(n && t?.isAircraft() && t.missileSpawnTrait && t.zone !== h.ZoneType.Air))
              ) {
                var l = t?.isTechno() ? t.rules.armor : void 0;
                for (const c of r)
                  if (c.targeting.canTarget(t, i, s, a, n) && (void 0 === l || this.checkArmor(c.warhead.rules, l, n)))
                    return c;
              }
            }
            getAvailableWeapons(e, t, i) {
              let r;
              var s;
              return (
                (r =
                  (e.isInfantry() || e.isVehicle()) && e.rules.deployFire && e.armedTrait
                    ? ((s = e.armedTrait.getDeployFireWeapon()),
                      [
                        e.deployerTrait?.isDeployed()
                          ? s.rules.areaFire
                            ? void 0
                            : s
                          : s === e.secondaryWeapon
                            ? e.primaryWeapon
                            : e.secondaryWeapon,
                      ])
                    : e.isBuilding() && e.garrisonTrait
                      ? e.garrisonTrait.isOccupied()
                        ? [
                            e.owner.country.side === a.SideType.GDI
                              ? e.primaryWeapon
                              : (e.secondaryWeapon ?? e.primaryWeapon),
                          ]
                        : []
                      : e.isBuilding() && e.overpoweredTrait
                        ? [e.overpoweredTrait.getWeapon()]
                        : i || t
                          ? [e.primaryWeapon, !i && t && e.secondaryWeapon ? e.secondaryWeapon : void 0]
                          : [e.primaryWeapon, e.secondaryWeapon]),
                r.filter((e) => e && !e.rules.neverUse)
              );
            }
            canAttackThroughDisguise(e, t, i, r, s, a, n) {
              if (!s && i.hasTerrainDisguise() && !r.areFriendly(e, t) && !e.owner.sharedDetectDisguiseTrait?.has(t))
                return !1;
              if (a) {
                if (
                  n &&
                  t.moveTrait.isIdle() &&
                  !e.rules.detectDisguise &&
                  !e.owner.sharedDetectDisguiseTrait?.has(t) &&
                  !r.areFriendly(t, e)
                )
                  return !1;
                var o = i.getDisguise();
                if (
                  o?.owner &&
                  !e.rules.detectDisguise &&
                  !e.owner.sharedDetectDisguiseTrait?.has(t) &&
                  (o.owner === e.owner || r.alliances.areAllied(e.owner, o.owner))
                )
                  return !1;
              }
              return !0;
            }
            checkArmor(e, t, i) {
              // OpenYRWeb (2026-06-30, REVERSED): a mindControl warhead must be selectable against
              // ANY techno regardless of its Verses (vanilla Yuri Prime's Controller warhead uses
              // all-0% Verses yet must target buildings to mind-control them). Without this bypass
              // a 0%-Verses mindControl warhead is rejected by checkArmor for None-armored targets
              // (buildings default to Armor=None), so Yuri X can never fire at — hence never
              // mind-control — a building. Mind-control does no damage; Verses is irrelevant.
              var r =
                e.ivanBomb || e.bombDisarm || e.nukeMaker || e.mindControl ? 1 : e.verses.get(t);
              return void 0 === r
                ? (console.warn(`Unhandled ArmorType ${s.ArmorType[t]} in warhead ${e.name} verses`), !1)
                : !(100 * r <= (i ? 1 : 0));
            }
            createAttackTask(e, t, i, r, s) {
              return new u.AttackTask(e, e.createTarget(t, i), r, s);
            }
            [d.NotifyTick.onTick](a, n) {
              if (!this.isDisabled()) {
                if (
                  (this.opportunityFireTask &&
                    (!a.unitOrderTrait.hasTasks() ||
                      (a.isUnit() && !a.unitOrderTrait.getTasks()[0].preventOpportunityFire) ||
                      (a.unitOrderTrait.getTasks()[0] instanceof u.AttackTask
                        ? (this.opportunityFireTask = void 0)
                        : this.opportunityFireTask.cancel()),
                    this.opportunityFireTask &&
                      ((h = [this.opportunityFireTask]),
                      this.taskRunner.tick(h, a),
                      h.length || (this.opportunityFireTask = void 0))),
                  !this.opportunityFireTask && this.retaliateTarget)
                ) {
                  var o = this.retaliateTarget;
                  this.retaliateTarget = void 0;
                  let e;
                  !a.unitOrderTrait.hasTasks() &&
                    n.isValidTarget(o) &&
                    (e = this.selectWeaponVersus(a, o, n, !1)) &&
                    a.unitOrderTrait.addTask(
                      this.createAttackTask(n, o, o.tile, e, {
                        holdGround: a.rules.movementZone === f.MovementZone.Fly,
                      }),
                    );
                }
                if (!this.opportunityFireTask && this.shouldPassiveAcquire(a))
                  if (0 < this.passiveScanCooldownTicks) this.passiveScanCooldownTicks--;
                  else {
                    this.passiveScanCooldownTicks = a.guardMode
                      ? n.rules.general.guardAreaTargetingDelay
                      : n.rules.general.normalTargetingDelay;
                    let e = this.selectDefaultWeapon(a);
                    var l,
                      c,
                      h = a.unitOrderTrait.hasTasks();
                    let t = void 0,
                      i,
                      r;
                    !h &&
                      a.guardMode &&
                      e &&
                      a.owner.isCombatant() &&
                      ((t = a.armedTrait?.computeGuardScanRange(e)), (i = a.guardArea?.tile), (r = 50));
                    let s = !1;
                    (!e ||
                      ((o = this.scanForTarget(a, e, n, t, i)).target &&
                        (({ target: l, weapon: c } = o),
                        (l = this.createAttackTask(n, l, l.tile, c, {
                          holdGround: h || !a.guardMode,
                          disallowTurning: h,
                          leashTiles: r,
                          passive: !0,
                        })),
                        h ? (this.opportunityFireTask = l) : a.unitOrderTrait.addTask(l),
                        (s = !0),
                        h ||
                          !a.guardMode ||
                          a.guardArea ||
                          (a.guardArea = { tile: a.tile, onBridge: !!a.isUnit() && a.onBridge }),
                        s && !h && a.unitOrderTrait[d.NotifyTick.onTick](a, n))),
                      s ||
                        h ||
                        !a.secondaryWeapon?.warhead.rules.electricAssault ||
                        ((e = a.secondaryWeapon),
                        (c = this.scanForTarget(a, e, n, void 0, void 0, !0)).target &&
                          (({ target: l, weapon: c } = c),
                          (c = this.createAttackTask(n, l, l.tile, c, { passive: !0 })),
                          a.unitOrderTrait.addTask(c),
                          (s = !0))),
                      !s &&
                        !h &&
                        a.guardArea &&
                        a.isUnit() &&
                        a.moveTrait &&
                        !a.moveTrait.isDisabled() &&
                        a.guardArea.tile !== a.tile &&
                        a.unitOrderTrait.addTasks(
                          new g.MoveTask(n, a.guardArea.tile, a.guardArea.onBridge),
                          new p.CallbackTask(() => {
                            ([m.MoveResult.Success, m.MoveResult.CloseEnough].includes(a.moveTrait.lastMoveResult) ||
                              a.resetGuardModeToIdle(),
                              (a.guardArea = void 0));
                          }),
                        ));
                  }
              }
            }
            [r.NotifyDamage.onDamage](e, t, i, r) {
              this.isDisabled() ||
                (!this.retaliateTarget &&
                  !this.opportunityFireTask &&
                  r &&
                  r.obj &&
                  r.weapon &&
                  this.shouldRetaliate(e, t, i, r.obj, r.weapon.warhead) &&
                  (this.retaliateTarget = r.obj));
            }
            [c.NotifyTeleport.onBeforeTeleport](e, t, i, r) {
              r ||
                ((this.attackState = w.Idle),
                (this.currentTarget = void 0),
                (this.retaliateTarget = void 0),
                (this.opportunityFireTask = void 0));
            }
            shouldPassiveAcquire(e) {
              if (
                (!e.owner.isCombatant() && e.rules.needsEngineer) ||
                !e.rules.canPassiveAquire ||
                !e.primaryWeapon ||
                (e.ammoTrait && !e.ammoTrait.ammo && e.rules.manualReload)
              )
                return !1;
              if (e.mindControllerTrait?.isAtCapacity()) return !1;
              var t =
                e.rules.opportunityFire || (e.rules.balloonHover && e.unitOrderTrait.getCurrentTask()?.isAttackMove);
              if (e.isUnit() && t) {
                if (e.unitOrderTrait.hasTasks() && e.unitOrderTrait.getTasks()[0].preventOpportunityFire) return !1;
              } else if (e.unitOrderTrait.hasTasks()) return !1;
              return !0;
            }
            shouldRetaliate(e, t, i, r, s) {
              if (
                i < 1 ||
                t.areFriendly(e, r) ||
                !e.rules.canRetaliate ||
                !e.primaryWeapon ||
                (e.ammoTrait && !e.ammoTrait.ammo && e.rules.manualReload) ||
                s.rules.temporal ||
                r.rules.missileSpawn ||
                e.unitOrderTrait.hasTasks() ||
                !t.isValidTarget(r) ||
                ((r.isInfantry() || r.isVehicle()) && r.disguiseTrait && !e.rules.detectDisguise) ||
                e.mindControllerTrait?.isAtCapacity()
              )
                return !1;
              var a = this.selectWeaponVersus(e, r, t, !1);
              return !(
                !a ||
                (e.isBuilding() || r.isBuilding()
                  ? this.rangeHelper.tileDistance(e, r)
                  : this.rangeHelper.distance2(e, r) / y.Coords.LEPTONS_PER_TILE) > Math.max(a.range, e.sight)
              );
            }
            scanForTarget(e, t, i, r, s, a = !1) {
              // OpenYRWeb: unit being dragged by Magnetron cannot attack.
              if (e.magnetronDraggedBy) return {};
              let n = {},
                o = Number.NEGATIVE_INFINITY;
              var l = this.getAvailableWeapons(e, !0, !1),
                c =
                  r ??
                  (e.rules.guardRange || t.range) +
                    1 +
                    3 +
                    i.rules.elevationModel.bonusCap +
                    (t.projectileRules.isAntiAir ? e.rules.airRangeBonus : 0);
              for (const d of this.scanTechnosAround(e, c, i)) {
                var h,
                  u = this.selectWeaponFromList(e, d, d.tile, l, i, !1, !0, !0);
                u &&
                  this.canPassiveAcquire(d, i) &&
                  i.isValidTarget(d) &&
                  (r
                    ? this.rangeHelper.isInRange(e, d, u.minRange, r, u.rules.cellRangefinding) &&
                      (!s || this.rangeHelper.isInRange2(s, d, 0, r))
                    : this.rangeHelper.isInWeaponRange(e, d, u, i.rules)) &&
                  (a || this.losHelper.hasLineOfSight(e, d, u)) &&
                  ((h = this.rangeHelper.distance3(e, d) / y.Coords.LEPTONS_PER_TILE),
                  (h = this.computeThreat(d, e, u, h, i.rules.general.threat)) > o &&
                    ((n = { target: d, weapon: u }), (o = h)));
              }
              return (n.target && e.rules.distributedFire && this.updateDistributedFireHistory(n), n);
            }
            scanTechnosAround(e, t, i) {
              var r = e.getFoundation();
              const s = new b.Vector2(e.tile.rx, e.tile.ry),
                a = new b.Vector2(e.tile.rx + r.width - 1, e.tile.ry + r.height - 1);
              (s.addScalar(-t), a.addScalar(t));
              r = new S.Box2(s, a);
              return i.map.technosByTile.queryRange(r);
            }
            canPassiveAcquire(e, t) {
              return (
                !e.owner.isNeutral &&
                !e.rules.civilian &&
                (!e.rules.insignificant || (e.isBuilding() && e.garrisonTrait?.isOccupied())) &&
                (1 < e.rules.threatPosed ||
                  (e.isBuilding() && e.garrisonTrait?.isOccupied()) ||
                  (0 < e.rules.specialThreatValue && !e.isBuilding()) ||
                  e.rules.harvester ||
                  e.name === t.rules.general.paradrop.paradropPlane)
              );
            }
            computeThreat(e, t, i, r, s) {
              var a;
              let n =
                [e.primaryWeapon, e.secondaryWeapon]
                  .filter(o.isNotNullOrUndefined)
                  .map((e) => e.warhead.rules.verses.get(t.rules.armor) ?? 0)
                  .reduce((e, t) => Math.max(e, t), 0) * s.targetEffectivenessCoefficientDefault;
              return (
                e.attackTrait?.currentTarget?.obj === t && (n *= -1),
                (n += e.rules.specialThreatValue * s.targetSpecialThreatCoefficientDefault),
                (n += (i.warhead.rules.verses.get(e.rules.armor) ?? 0) * s.myEffectivenessCoefficientDefault),
                (n += (e.healthTrait.health / 100) * s.targetStrengthCoefficientDefault),
                (n += r * s.targetDistanceCoefficientDefault),
                (n += 1e5),
                t.rules.vhpScan !== T.VhpScan.None &&
                  ((a = e.healthTrait.getProjectedHitPoints()),
                  t.rules.vhpScan === T.VhpScan.Strong
                    ? a <= 0 && (n = Number.NEGATIVE_INFINITY)
                    : t.rules.vhpScan === T.VhpScan.Normal &&
                      (a <= 0 ? (n /= 2) : a <= e.healthTrait.maxHitPoints / 2 && (n *= 2))),
                t.rules.distributedFire && (n -= 1e6 * (this.distributedFireHistory.get(e) ?? 0)),
                n
              );
            }
            updateDistributedFireHistory(e) {
              if (50 !== this.distributedFireHistory.get(e.target)) {
                for (var [t, i] of this.distributedFireHistory)
                  (i--, i <= 0 ? this.distributedFireHistory.delete(t) : this.distributedFireHistory.set(t, i));
                this.distributedFireHistory.set(e.target, 50);
              }
            }
            dispose() {
              this.distributedFireHistory.clear();
            }
          }),
          t("AttackTrait", E));
      },
    };
  },
);
