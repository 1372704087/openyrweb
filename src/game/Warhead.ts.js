// === Reconstructed SystemJS module: game/Warhead ===
// deps: ["game/gameobject/common/DeathType","game/gameobject/infantry/StanceType","game/gameobject/unit/ZoneType","game/gameobject/task/system/CallbackTask","game/gameobject/task/ScatterTask","game/map/BridgeOverlayTypes","game/trait/interface/NotifyAttack","game/type/ArmorType","game/gameobject/unit/CollisionType","game/gameobject/unit/RangeHelper","game/map/tileFinder/RadialTileFinder","game/Coords","util/math","game/gameobject/unit/FacingUtil","engine/type/ObjectType","game/event/WarheadDetonateEvent","game/WeaponType","game/rules/WeaponRules","data/IniSection","game/rules/ProjectileRules","game/gameobject/common/AnimTerrainEffect","game/event/ObjectAttackedEvent","game/SpecialWarheadType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/Warhead",
  [
    "game/gameobject/common/DeathType",
    "game/gameobject/infantry/StanceType",
    "game/gameobject/unit/ZoneType",
    "game/gameobject/task/system/CallbackTask",
    "game/gameobject/task/ScatterTask",
    "game/map/BridgeOverlayTypes",
    "game/trait/interface/NotifyAttack",
    "game/type/ArmorType",
    "game/gameobject/unit/CollisionType",
    "game/gameobject/unit/RangeHelper",
    "game/map/tileFinder/RadialTileFinder",
    "game/Coords",
    "util/math",
    "game/gameobject/unit/FacingUtil",
    "engine/type/ObjectType",
    "game/event/WarheadDetonateEvent",
    "game/WeaponType",
    "game/rules/WeaponRules",
    "data/IniSection",
    "game/rules/ProjectileRules",
    "game/gameobject/common/AnimTerrainEffect",
    "game/event/ObjectAttackedEvent",
    "game/SpecialWarheadType",
    "game/gameobject/task/MagnetronDragTask",
    "game/gameobject/trait/BerserkTrait",
  ],
  function (e, t) {
    "use strict";
    var n, o, k, i, r, l, c, h, B, N, j, L, D, F, s, _, a, u, d, g, U, p, H, Md, m, Bk;
    t && t.id;
    return {
      setters: [
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          k = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
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
          B = e;
        },
        function (e) {
          N = e;
        },
        function (e) {
          j = e;
        },
        function (e) {
          L = e;
        },
        function (e) {
          D = e;
        },
        function (e) {
          F = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          _ = e;
        },
        function (e) {
          a = e;
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
          U = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          H = e;
        },
        function (e) {
          Md = e;
        },
        function (e) {
          Bk = e;
        },
      ],
      execute: function () {
        (e(
          "Warhead",
          (m = class {
            constructor(e) {
              this.rules = e;
            }
            canDamage(e, t, i) {
              return (
                !(!e.isSpawned || e.isDisposed || e.isDestroyed || e.isCrashing) &&
                !(e.isTechno() && e.warpedOutTrait.isInvulnerable() && !this.rules.temporal) &&
                (!e.isUnit() || !e.moveTrait.reservedPathNodes.find((e) => e.tile === t)) &&
                !!e.healthTrait &&
                (!e.isUnit() || e.zone !== k.ZoneType.Air || i === k.ZoneType.Air) &&
                !(!e.isUnit() && i === k.ZoneType.Air) &&
                (!e.isBuilding() || !e.rules.invisibleInGame) &&
                !((e.isTechno() || e.isTerrain()) && e.rules.immune && !this.rules.temporal) &&
                !(e.isTechno() && !e.rules.warpable && this.rules.temporal) &&
                !(this.rules.radiation && (!e.isUnit() || e.rules.immuneToRadiation)) &&
                !(this.rules.psychicDamage && (!e.isUnit() || e.rules.immuneToPsionics)) &&
                (!e.isOverlay() || !l.BridgeOverlayTypes.isLowBridgeHead(e.overlayId))
              );
            }
            computeDamage(e, t, i, r = !1) {
              let s = e;
              if (0 < e && t.isTechno() && t.invulnerableTrait.isActive()) return 0;
              if (t.isAircraft() && t.missileSpawnTrait && t.zone !== k.ZoneType.Air) return 0;
              if (!i.gameOpts.destroyableBridges && t.isOverlay() && t.bridgeTrait) return 0;
              // OpenYRWeb: DrainWeapon damage suppression is handled in detonate() using
              // T.rules.drainWeapon (weapon-level). It is NOT done here in computeDamage
              // because WarheadRules does not have a drainWeapon property (drainWeapon is
              // a weapon-level flag in vanilla YR). See the detonate() method where the
              // drain weapon skips computeDamage entirely for Drainable=yes buildings.
              if (
                (this.rules.radiation ||
                  this.rules.temporal ||
                  !t.isInfantry() ||
                  t.stance !== o.StanceType.Prone ||
                  (s *= this.rules.proneDamage),
                t.isTechno() || t.isOverlay() || t.isTerrain())
              ) {
                let e = t.isTerrain() ? h.ArmorType.Wood : t.rules.armor;
                var a;
                (t.isOverlay() &&
                  t.isBridge() &&
                  ((a = l.BridgeOverlayTypes.getOverlayBridgeType(t.overlayId)) === l.OverlayBridgeType.Wood
                    ? (e = h.ArmorType.Wood)
                    : a === l.OverlayBridgeType.Concrete && (e = h.ArmorType.Concrete)),
                  (r && t.isOverlay() && (t.isBridge() || t.rules.wall)) || (s *= this.rules.verses.get(e)),
                  0 < s && t.isTechno() && t.veteranTrait && (s /= t.veteranTrait.getVeteranArmorMultiplier()),
                  0 < s && t.isUnit() && (s /= t.crateBonuses.armor));
              }
              return (
                (t.isOverlay() || t.isBuilding()) &&
                  t.rules.wall &&
                  (this.rules.wallAbsoluteDestroyer
                    ? (s = Number.POSITIVE_INFINITY)
                    : this.rules.wall || (this.rules.wood && t.rules.armor === h.ArmorType.Wood) || (s = 0)),
                t.isOverlay() && t.isBridge() && (this.rules.wall || (s = 0)),
                (s = 0 < s ? Math.floor(s) : Math.ceil(s)),
                s
              );
            }
            inflictDamage(e, t, i, r, s = !1) {
              // OpenYRWeb: Tank Bunker damage redirection. If the target is a vehicle
              // docked inside a Tank Bunker and the warhead doesn't have
              // PenetratesBunker=yes, redirect the damage to the bunker building.
              // The bunker absorbs the hit instead of the vehicle (ModEnc/PenetratesBunker).
              if (t.isVehicle && t.isVehicle() && t.bunkeredAt && t.bunkeredAt.tankBunkerTrait && !this.rules.penetratesBunker) {
                t = t.bunkeredAt;
              }
              let a = t.healthTrait;
              return (
                e === Number.POSITIVE_INFINITY && (e = a.getHitPoints()),
                a.inflictDamage(e, i, r),
                r.traits.filter(c.NotifyAttack).forEach((e) => {
                  e[c.NotifyAttack.onAttack](t, i?.obj, r);
                }),
                t.onAttack(r, i),
                r.events.dispatch(new p.ObjectAttackedEvent(t, i, s)),
                t.isTechno() && !this.rules.temporal && this.supressOrScatterTarget(t, r),
                !a.health &&
                  (t.isInfantry() && (t.infDeathType = this.rules.infDeath),
                  this.rules.temporal && (t.deathType = n.DeathType.Temporal),
                  // OpenYRWeb: Genetic Mutator transform. A warhead with InfDeath=Mutate (9) that
                  // kills convertible infantry spawns a Brute under the attacker's owner instead
                  // of leaving a corpse. Mirrors the ParadropTask/BridgeTrait idiom of suppressing
                  // the death anim (infDeathType=None) before silent destroy. Brute unit type is
                  // resolved from rules ("BRUTE"); immuneToPsionics / already-Brute victims are skipped.
                  // vanilla YR: InfDeath=9 (=Mutate) is the ONLY value that triggers mutation
                  // (ModEnc/InfDeath). The earlier `=== 8` check matched Virus instead and never fired.
                  this.rules.infDeath === 9 &&
                  t.isInfantry() &&
                  !t.rules.immuneToPsionics &&
                  "BRUTE" !== t.name &&
                  r.rules.hasObject("BRUTE", j.ObjectType.Infantry)
                    ? (this._mutateInfantryToBrute(t, i, r), !1)
                    : t.isUnit() && t.crashableTrait && t.zone === k.ZoneType.Air && !this.rules.temporal
                      ? t.crashableTrait.crash(i)
                      : r.destroyObject(t, i, void 0, s),
                  !0)
              );
            }
            supressOrScatterTarget(e, t) {
              e.rules.fraidycat || (e.isVehicle() && !e.owner.isCombatant() && e.rules.insignificant)
                ? e.unitOrderTrait.hasTasks() ||
                  (e.isInfantry() && (e.isPanicked = !0),
                  e.unitOrderTrait.addTask(new r.ScatterTask(t)),
                  e.isInfantry() &&
                    e.unitOrderTrait.addTask(new i.CallbackTask(() => (e.isPanicked = !1)).setCancellable(!1)))
                : e.isInfantry() &&
                  (e.moveTrait.isIdle() || e.suppressionTrait?.isSuppressed()) &&
                  e.suppressionTrait?.suppress();
            }
            // OpenYRWeb: Magnetron locomotor-beam drag. Called from detonate() (delegated
            // because detonate's params shadow the module aliases). The drag itself is a
            // MagnetronDragTask that sets victim zone=Air (vanilla YR: IsLocomotor swaps
            // victim Locomotor= to Jumpjet, making it an air unit), lifts it to cruise
            // height, drags it toward the Magnetron, then drops it on a random nearby
            // tile. `game`=t, `target`=e, `attacker`=i (un-shadowed here).
            _dragVehicleTo(e, t, i) {
              // OpenYRWeb: Vanilla YR Magnetron drag. Push a MagnetronDragTask that
              // lifts the victim (zone→Air, vulnerable to AA), flies it toward the
              // Magnetron, then drops it on a random nearby unoccupied tile. The drag
              // persists as long as the Magnetron's AttackTask targets this victim —
              // approximating vanilla's "continuous firing refreshes locomotor" behavior.
              // `e`=victim, `t`=game, `i`=attacker (magnetron). `this` is the LocomotorBeam
              // warhead instance (passed to the task for drop crush damage).
              // Guard: if the victim is already being dragged by this same Magnetron, no-op.
              // (No refreshBeam — the drag task persists as long as the attack task exists.)
              if (e.magnetronDraggedBy) { return; }
              if (!e.unitOrderTrait) return;
              // Stop the victim's current orders so it doesn't fight the involuntary drag.
              e.unitOrderTrait.cancelAllTasks();
              // Force the victim's move state clean so the drag task can start cleanly
              // (cancelAllTasks only marks tasks cancelled; their onEnd cleanup runs later).
              if (e.moveTrait) {
                try { e.moveTrait.unreservePathNodes && e.moveTrait.unreservePathNodes(); } catch (err) {}
                e.moveTrait.currentWaypoint = void 0;
                e.moveTrait.collisionState = 1; // CollisionState.Resolved
                e.moveTrait.moveState = 0; // MoveState.Idle
                e.moveTrait.velocity && e.moveTrait.velocity.set(0, 0, 0);
                e.moveTrait.locomotor = void 0;
              }
              e.unitOrderTrait.addTaskToFront(new Md.MagnetronDragTask(t, e, i, this));
            }
            // OpenYRWeb: Genetic Mutator transform helper. Spawns a Brute under the attacker's
            // owner at the victim's tile, then silently destroys the victim (no death anim).
            _mutateInfantryToBrute(e, t, i) {
              var r = t?.player ?? e.owner,
                s = i.rules.getObject("BRUTE", j.ObjectType.Infantry),
                a = i.createUnitForPlayer(s, r),
                l = e.tile;
              (i.spawnObject(a, l),
                (e.infDeathType = 0),
                i.destroyObject(e, t, void 0, !1));
            }
            createDummyWeaponInfo() {
              return {
                minRange: 0,
                range: 0,
                speed: Number.POSITIVE_INFINITY,
                type: a.WeaponType.Primary,
                rules: new u.WeaponRules(new d.IniSection("Dummy")),
                projectileRules: new g.ProjectileRules(s.ObjectType.Projectile, new d.IniSection("Dummy")),
                warhead: this,
              };
            }
            detonate(r, e, t, i, s, a, n, o, l, c = H.SpecialWarheadType.None, h, u, d = !1) {
              var g,
                p,
                m,
                f,
                y,
                T = l?.weapon ?? this.createDummyWeaponInfo(),
                v = l?.obj,
                b = l?.player,
                S = c === H.SpecialWarheadType.Shrapnel,
                w = c === H.SpecialWarheadType.LightningStrike,
                E = u ? u / L.Coords.LEPTONS_PER_TILE : this.rules.cellSpread,
                C = this.rules.percentAtMax;
              let x = new Set(),
                O = new Map(),
                A = new N.RangeHelper(r.map.tileOccupation),
                M = new j.RadialTileFinder(
                  r.map.tiles,
                  r.map.mapBounds,
                  t,
                  { width: 1, height: 1 },
                  0,
                  Math.ceil(E),
                  () => !0,
                  !1,
                );
              for (; (g = M.getNextTile());)
                for (p of r.map.getObjectsOnTile(g))
                  if (
                    (!x.has(p) || p.isBuilding()) &&
                    (n !== B.CollisionType.UnderBridge || !p.isUnit() || !p.onBridge) &&
                    !(v && p.isTechno() && p.rules.typeImmune && p.owner === b && p.name === v.name) &&
                    (p !== v || v.rules.damageSelf) &&
                    this.canDamage(p, g, a) &&
                    (!p.isOverlay() ||
                      !(
                        (!n && 0.1 < Math.abs(p.tileElevation - i)) ||
                        (n === B.CollisionType.OnBridge && !p.isBridge())
                      ))
                  ) {
                    let e = p.isBuilding()
                      ? g === t
                        ? 0
                        : A.distance3(g, s) / L.Coords.LEPTONS_PER_TILE
                      : p.isTerrain() || p.isOverlay()
                        ? A.distance3(g, t) / L.Coords.LEPTONS_PER_TILE
                        : A.distance3(p, s) / L.Coords.LEPTONS_PER_TILE;
                    if (
                      (E && p.isAircraft() && p.zone === k.ZoneType.Air && (e /= 2),
                      e < 0.001 && (e = 0),
                      !(S && p.isInfantry() && b) || (p.owner !== b && !r.alliances.areAllied(p.owner, b)))
                    ) {
                      if (!E)
                        if (p.isTerrain()) {
                          if (g !== t || !this.rules.wall) continue;
                        } else if (!S && (g !== t || (!p.isBuilding() && p !== (o.obj || o.getBridge())))) continue;
                      (E && e > E) || (x.add(p), O.set(p, p.isBuilding() ? (O.get(p) || []).concat(e) : [e]));
                    }
                  }
              let R = !1,
                P;
              // OpenYRWeb: Psychedelic (Chaos Drone gas) warhead — apply berserk instead of damage.
              // The weapon's Damage value is the berserk duration in frames (e.g. 600 = ~10 game seconds).
              // Verses armor multiplier scales the duration. ImmuneToPsionics units are skipped by canDamage().
              if (this.rules.psychicDamage) {
                for (m of x)
                  // OpenYRWeb: Chaos Drone gas only affects enemy units, not own faction or allies
                  if (!m.isDestroyed && !m.isCrashing && m.isTechno() && m.berserkTrait &&
                      b && m.owner !== b && !r.alliances.areAllied(m.owner, b)) {
                    // Base berserk duration = weapon Damage value (e.g. 600 frames).
                    var beserkDuration = e;
                    // Apply Verses armor multiplier.
                    if (m.isTechno()) {
                      var armorType = m.isTerrain() ? h.ArmorType.Wood : m.rules.armor;
                      beserkDuration *= this.rules.verses.get(armorType) ?? 0;
                    }
                    // Apply CellSpread distance falloff (same formula as damage loop).
                    if (E && O.has(m)) {
                      for (var dist of O.get(m)) {
                        var falloffDuration = beserkDuration;
                        0 < E && Number.isFinite(falloffDuration) &&
                          (falloffDuration = D.lerp(falloffDuration, C * falloffDuration, dist / E));
                        falloffDuration = 0 < falloffDuration ? Math.floor(falloffDuration) : Math.ceil(falloffDuration);
                        0 < falloffDuration && m.berserkTrait.setBerserk(falloffDuration, v);
                      }
                    } else {
                      beserkDuration = 0 < beserkDuration ? Math.floor(beserkDuration) : Math.ceil(beserkDuration);
                      0 < beserkDuration && m.berserkTrait.setBerserk(beserkDuration, v);
                    }
                  }
              } else
              for (m of x)
                if (!m.isDestroyed && !m.isCrashing) {
                  // OpenYRWeb: Magnetron locomotor beam. Delegated to a helper method because
                  // detonate()'s params shadow the module-level aliases (r=game, m=target, etc.),
                  // so the ScatterTask class can't be referenced inline. See _dragVehicleTo.
                  if (this.rules.isLocomotor && m.isVehicle() && m.moveTrait && !m.moveTrait.isDisabled() && v) {
                    this._dragVehicleTo(m, r, v);
                    continue;
                  }
                  // OpenYRWeb: DrainWeapon trigger. When a DrainWeapon=yes warhead strikes a
                  // Drainable=yes building, start (or refresh) the drain on the attacker's
                  // DrainTrait instead of dealing normal damage. T.rules.drainWeapon (weapon-level,
                  // WeaponRules) is used here — this.rules.drainWeapon (warhead-level, WarheadRules)
                  // does NOT exist because drainWeapon is a weapon-level flag in vanilla YR.
                  // The drain is attached before computeDamage so it fires even when the building
                  // is already being drained (subsequent projectiles deal zero damage).
                  let i;
                  if (T.rules.drainWeapon && m.isBuilding() && m.rules.drainable) {
                    v && v.drainTrait && v.drainTrait.startDrain(v, m, r);
                    i = 0;
                  } else {
                    i = this.computeDamage(e, m, r, w);
                  }
                  if (
                    0 < e &&
                    !this.rules.affectsAllies &&
                    m.isTechno() &&
                    b &&
                    (r.alliances.areAllied(m.owner, b) || m.owner === b) &&
                    (i = 0),
                    i
                  )
                    for (var I of O.get(m)) {
                      let t = i;
                      if (
                        (0 < E && Number.isFinite(t) && (t = D.lerp(t, C * t, I / E)),
                        Math.abs(t) < 1 && (!E || 0.25 <= t / i) && (t = +Math.sign(t)),
                        (t = 0 < t ? Math.floor(t) : Math.ceil(t)),
                        t)
                      ) {
                        let e = m.healthTrait;
                        if (t < 0) {
                          if (!v) throw new Error("Expected healer object to be set");
                          if ((e.healBy(-t, v, r), 100 === e.health)) break;
                        } else {
                          if (
                            (m === o.obj && I < 1 && (P = m),
                            this.rules.causesDelayKill &&
                              m.isBuilding() &&
                              m.delayedKillTrait &&
                              ((f = m.healthTrait.getHitPoints()),
                              t >= f &&
                                ((t = f - 1),
                                m.delayedKillTrait.isActive() ||
                                  ((f = this.rules.delayKillAtMax),
                                  (y = this.rules.delayKillFrames),
                                  (y = D.lerp(y, f * y, I / E)),
                                  m.delayedKillTrait.activate(y, l)))),
                            this.inflictDamage(t, m, l, r, !P))
                          )
                            break;
                          m.isVehicle() &&
                            this.rules.rocker &&
                            0 < (I = D.clamp(i / 300, 0, 1)) &&
                            ((y =
                              F.FacingUtil.fromMapCoords(
                                m.position.getMapPosition().clone().sub(L.Coords.vecWorldToGround(s)),
                              ) - m.direction),
                            m.applyRocking(y, I));
                        }
                      }
                    }
                  else m.isTechno() && m.invulnerableTrait.isActive() && (R = !0);
                }
              T = T.rules.radLevel;
              T && E && r.mapRadiationTrait.createRadSite(t, T, E + 1);
              T = d ? void 0 : R ? r.rules.audioVisual.weaponNullifyAnim : this.pickExplodeAnim(e, P, a, r, w);
              // OpenYRWeb: DiskLaser weapons have their own ring-laser visual effect;
              // suppress the standard warhead impact explosion anim.
              l?.weapon?.rules?.isDiskLaser && (T = void 0);
              if (!R && a === k.ZoneType.Ground) {
                let e = new U.AnimTerrainEffect();
                (T && e.destroyOre(T, t, r), h && e.spawnSmudges(h, t, r), T && e.spawnSmudges(T, t, r));
              }
              r.events.dispatch(new _.WarheadDetonateEvent(this, s, T, w));
            }
            pickExplodeAnim(t, i, r, s, a) {
              if (t) {
                if (a) return s.rules.audioVisual.weatherConBoltExplosion;
                if (
                  this.rules.conventional &&
                  r === k.ZoneType.Water &&
                  (!i || i.isBuilding() || (i.isVehicle() && i.submergibleTrait))
                ) {
                  var n = s.rules.combatDamage.splashList;
                  return n[D.clamp(Math.floor(t / 50), 0, n.length - 1)];
                }
                n = this.rules.animList.length;
                let e;
                return n
                  ? ((e =
                      s.rules.combatDamage.c4Warhead === this.rules.name
                        ? n - 1
                        : this.rules.emEffect
                          ? s.generateRandomInt(0, n - 1)
                          : D.clamp(Math.floor(t / 25), 0, n - 1)),
                    this.rules.animList[e])
                  : void 0;
              }
            }
          }),
        ),
          (m.SPECIAL_WARHEAD_NAME = "Special"),
          (m.HE_WARHEAD_NAME = "HE"));
      },
    };
  },
);
