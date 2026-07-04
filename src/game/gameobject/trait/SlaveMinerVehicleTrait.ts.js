// === Reconstructed SystemJS module: game/gameobject/trait/SlaveMinerVehicleTrait ===
// deps: ["game/gameobject/trait/interface/NotifySpawn","game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/interface/NotifyDestroy","game/map/tileFinder/RadialTileFinder","game/type/LandType","game/gameobject/trait/TiberiumTrait","game/gameobject/task/move/MoveTask","game/gameobject/task/morph/DeployIntoTask","game/gameobject/task/SlaveGatherTask","engine/type/ObjectType"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// OpenYRWeb: Slave Miner VEHICLE (YASLMN, Yuri faction) auto-deploy AI.
//
// Vanilla YR behaviour (REVERSED @ yrmd.exe, 2026-06-30):
//   The Slave Miner vehicle is NOT a normal harvester — it is a deployable refinery. When built
//   (or after undeploying from the building form) it PROACTIVELY seeks the nearest ore field,
//   drives adjacent to it, and deploys (morphs into the YAREFN building) so its slaves can mine.
//   A human player can also manually order the undeployed vehicle onto ore / a tile and it will
//   travel there and deploy on arrival. This is the defining difference vs the MCV, which waits
//   for an explicit Deploy command.
//
//   Evidence: RulesStruct scan params (FUN_0066d530, [General] reader):
//     SlaveMinerShortScan -> +0x1780, SlaveMinerSlaveScan -> +0x1784,
//     SlaveMinerLongScan   -> +0x1788, SlaveMinerScanCorrection -> +0x178c,
//     SlaveMinerKickFrameDelay -> +0x1790.
//   The SlaveManager (FUN_006af6c0 / FUN_006afd60 cluster) drives individual SLAVES once the
//   building is deployed; the VEHICLE's seek-and-deploy is a FootClass/unit-level mission that
//   reuses the same ore-detection primitive (Tiberium overlay scan). We mirror that here with the
//   engine's existing RadialTileFinder + MoveTask + DeployIntoTask, since OpenYRWeb has no single
//   SlaveManager driver class (slaves run their own SlaveGatherTask instead).
//
// Trigger model (NotifyTick):
//   * While the vehicle has active orders (player or AI MoveTask), _playerLockTicks is kept at
//     KickFrameDelay (factory ExitFactoryTask is exempted via _aiTaskingIsFactory so it deploys
//     immediately after leaving the factory).
//   * When orders finish, the lock counts down. During the lock the AI does nothing — this
//     prevents the AI from immediately fighting the player for control.
//   * When the lock expires and no cooldown is active: check if we can deploy at current tile
//     (ShortScan on nearby ore). If yes, deploy immediately.
//   * Otherwise LongScan (48 tiles) for nearest ore, find a placeable spot near it (ScanCorrection=3),
//     issue a MoveTask. On arrival the idle check fires the deploy.
//   * If no ore anywhere: KickFrameDelay cooldown before retry.

System.register(
  "game/gameobject/trait/SlaveMinerVehicleTrait",
  [
    "game/gameobject/trait/interface/NotifySpawn",
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/trait/interface/NotifyDestroy",
    "game/map/tileFinder/RadialTileFinder",
    "game/type/LandType",
    "game/gameobject/trait/TiberiumTrait",
    "game/gameobject/task/move/MoveTask",
    "game/gameobject/task/morph/DeployIntoTask",
    "game/gameobject/task/SlaveGatherTask",
    "engine/type/ObjectType",
  ],
  function (e, t) {
    "use strict";
    var n, i, ds, r, l, b, m, d, g, ot;
    t && t.id;
    return {
      setters: [
        function (e) {
          n = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          ds = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          b = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          ot = e;
        },
      ],
      execute: function () {
        var o;
        // Radii (tiles). Most values now come from GeneralRules INI keys (SlaveMinerShortScan,
        // SlaveMinerLongScan, SlaveMinerScanCorrection, SlaveMinerKickFrameDelay).
        // POST_ACTION_COOLDOWN (7 ticks) is a small settle delay and has no INI counterpart.
        var POST_ACTION_COOLDOWN = 7;
        e(
          "SlaveMinerVehicleTrait",
          (o = class {
            constructor() {
              this.scanCooldown = 0;
              this._playerLockTicks = 0;
              this._aiTaskingIsFactory = !1;
              // OpenYRWeb (2026-06-30, REVERSED): slaves ride INSIDE the vehicle (off the map).
              // Populated either at spawn (claiming the pool handed over from the undeployed
              // building via game._pendingMinerSlaves) or by SlaveMinerTrait.NotifyUnspawn. The
              // vehicle's NotifyTick seeks ore + deploys; when it deploys, _stashSlavesForMorph
              // hands this pool back to the new building so the slaves re-enter the map there.
              this.slaves = [];
            }
            // small settle delay on spawn so the vehicle clears the factory exit before seeking
            [n.NotifySpawn.onSpawn](e, t) {
              this._playerLockTicks = 0;
              if (t._slaveMinerAutoDeployMode) {
                // auto-undeploy (no-ore timer expired): seek and deploy immediately
                this.scanCooldown = 0;
                t._slaveMinerAutoDeployMode = !1;
              } else if (e.unitOrderTrait && e.unitOrderTrait.hasTasks && e.unitOrderTrait.hasTasks()) {
                // factory-produced: has ExitFactoryTask, skip player lock via _aiTaskingIsFactory
                this._aiTaskingIsFactory = !0;
                this.scanCooldown = 0;
              } else {
                // manual undeploy or script spawn: enforce player-lock delay before AI resumes
                this._playerLockTicks = t.rules.general.slaveMinerKickFrameDelay || 150;
              }
              // claim any slave pool handed over from the just-undeployed building and repoint
              // their gather task at THIS vehicle. The slaves are already on the map (they were
              // the building's workforce); we do NOT spawn/unspawn them — that would teleport.
              // Repointing keeps them gathering/dumping at the vehicle's adjacent tile, so they
              // follow the vehicle as it drives to ore (vanilla SlaveManager semantics).
              try {
                if (t._pendingMinerSlaves && t._pendingMinerSlaves.length) {
                  for (var sv of t._pendingMinerSlaves) {
                    if (sv && !sv.isDisposed && !sv.isDestroyed) {
                      this.slaves.push(sv);
                      try {
                        sv.unitOrderTrait?.cancelAll?.();
                        sv.unitOrderTrait?.addTask?.(new g.SlaveGatherTask(t, e));
                      } catch (er) {}
                    }
                  }
                  t._pendingMinerSlaves = [];
                }
              } catch (err) {}
            }
            // OpenYRWeb: called by MorphIntoTask just before the vehicle morphs into the
            // deployed building. The slaves stay on the map; we just hand the pool to the new
            // building via game._pendingMinerSlaves. The building's SlaveMinerTrait.NotifySpawn
            // claims it and repoints the slaves' gather task at the building (so they walk to
            // the building's door to dump = walk-through-door anim).
            _stashSlavesForMorph(e) {
              try {
                if (!e._pendingMinerSlaves) e._pendingMinerSlaves = [];
                for (var sv of this.slaves) {
                  if (sv && !sv.isDisposed && !sv.isDestroyed) e._pendingMinerSlaves.push(sv);
                }
              } catch (err) {}
              this.slaves = [];
            }
            // OpenYRWeb (YR-correct): when the vehicle is destroyed/sold, its slaves (which are
            // following it on the map) are NOT liberated to the destroyer — they are the Slave
            // Miner's property and perish with the vehicle form (vanilla: a packed/undeployed
            // Slave Miner's workforce is not freed; only the deployed-building form liberates on
            // destroy, handled by SlaveMinerTrait._liberator). Kill them on the map so they
            // visibly die with the carrier rather than vanishing or being captured.
            [ds.NotifyDestroy.onDestroy](e, t, i, r) {
              for (var sv of this.slaves) {
                if (!sv || sv.isDisposed || sv.isDestroyed) continue;
                try { t.destroyObject(sv, i, !0); } catch (err) {}
              }
              this.slaves = [];
            }
            _isOreTile(e, t) {
              if (!t || t.landType !== l.LandType.Tiberium) return !1;
              var i = e.map.getGroundObjectsOnTile(t).find((e) => e.isOverlay() && e.isTiberium()),
                r = i && i.traits ? i.traits.get(b.TiberiumTrait) : void 0;
              return !!(r && 0 < r.getBailCount());
            }
            // any harvestable ore overlay within `a` tiles of `s`?
            _hasOreNearby(e, t, s, a) {
              for (
                var i = new o._RadialTileFinder(
                    e.map.tiles,
                    e.map.mapBounds,
                    s,
                    { width: 1, height: 1 },
                    0,
                    a,
                    (t) => this._isOreTile(e, t),
                  ),
                  n;
                (n = i.getNextTile());

              )
                return !0;
              return !1;
            }
            _countOreBailsAround(e, s, a) {
              for (
                var total = 0,
                  i = new o._RadialTileFinder(
                    e.map.tiles,
                    e.map.mapBounds,
                    s,
                    { width: 1, height: 1 },
                    0,
                    a,
                    (t) => !0,
                  ),
                  r;
                (r = i.getNextTile());

              ) {
                if (r.landType !== l.LandType.Tiberium) continue;
                var ov = e.map.getGroundObjectsOnTile(r).find(
                    (t) => t.isOverlay() && t.isTiberium(),
                  ),
                  tt = ov && ov.traits ? ov.traits.get(b.TiberiumTrait) : void 0;
                if (tt && 0 < tt.getBailCount()) total += tt.getBailCount();
              }
              return total;
            }
            // nearest reachable ore tile within SCAN_RADIUS (island-id connectivity, like
            // SlaveGatherTask._findOre / GatherOreTask.findClosestReachableOreSite, so the vehicle
            // never drives toward ore on a different landmass it cannot reach).
            _findNearestOre(e, t) {
              var s = t.rules.speedType,
                a = e.map.terrain.getIslandIdMap(s, !1),
                n = a ? a.get(t.tile, t.onBridge) : void 0,
                i = new o._RadialTileFinder(
                  e.map.tiles,
                  e.map.mapBounds,
                  t.tile,
                  { width: 1, height: 1 },
                  0,
                  e.rules.general.slaveMinerLongScan,
                  (i) =>
                    !!i &&
                    i.landType === l.LandType.Tiberium &&
                    0 < e.map.terrain.getPassableSpeed(i, s, !1, !1) &&
                    Math.abs(i.z - t.tile.z) < 2 &&
                    (!a || a.get(i, !1) === n) &&
                    this._isOreTile(e, i),
                );
              return i.getNextTile();
            }
            // closest tile near `s` (an ore tile) where DeploysInto can be placed.
            _findPlaceableNear(e, t, s) {
              for (
                var a = e.getConstructionWorker(t.owner),
                  n = t.rules.deploysInto,
                  i = new o._RadialTileFinder(
                    e.map.tiles,
                    e.map.mapBounds,
                    s,
                    { width: 1, height: 1 },
                    0,
                    e.rules.general.slaveMinerScanCorrection,
                    (e) => !0,
                  ),
                  r = void 0,
                  l = Number.POSITIVE_INFINITY,
                  b;
                (b = i.getNextTile());

              )
                if (
                  a.canPlaceAt(n, b, { ignoreAdjacent: !0, ignoreObjects: [t] }) &&
                  b.passable !== !1
                ) {
                  var d = Math.abs(b.rx - t.tile.rx) + Math.abs(b.ry - t.tile.ry);
                  d < l && ((l = d), (r = b));
                }
              return r;
            }
            _canDeployHere(e, t) {
              var s = e.getConstructionWorker(t.owner);
              if (
                !t.rules.deploysInto ||
                !s.canPlaceAt(t.rules.deploysInto, t.tile, { ignoreAdjacent: !0, ignoreObjects: [t] })
              )
                return !1;
              var totalOre = this._countOreBailsAround(e, t.tile, e.rules.general.slaveMinerShortScan);
              return totalOre > 0;
            }
            [i.NotifyTick.onTick](e, t) {
              // e = vehicle (self), t = game
              if (!e.isVehicle || !e.isVehicle()) return;
              var vt = e;
              // ---- player-control lock ----
              // When the vehicle has any active orders (player or AI), reset the lock to
              // KickFrameDelay so the player has a window to take over after orders finish.
              // Exception: factory-produced vehicles with ExitFactoryTask (_aiTaskingIsFactory)
              // skip the lock and deploy immediately once the exit task completes.
              var hasOrders = vt.unitOrderTrait && vt.unitOrderTrait.hasTasks && vt.unitOrderTrait.hasTasks();
              if (hasOrders) {
                if (!this._aiTaskingIsFactory) {
                  this._playerLockTicks = t.rules.general.slaveMinerKickFrameDelay || 150;
                }
                return;
              }
              // clear factory flag once ExitFactoryTask finishes
              if (this._aiTaskingIsFactory) {
                this._aiTaskingIsFactory = !1;
              }
              if (this._playerLockTicks > 0) {
                this._playerLockTicks--;
                return;
              }
              // ---- scan cooldown ----
              if (this.scanCooldown > 0) { this.scanCooldown--; return; }
              var deployTarget = vt.rules.deploysInto;
              if (!deployTarget) return;
              var bldgRules = t.rules.getObject(deployTarget, ot.ObjectType.Building);
              if (!bldgRules) return;
              // ---- AI slave miner count limit (AISlaveMinerNumber=4,3,2) ----
              // When at the limit, skip the feet ShortScan and search for NEW ore patches
              // that aren't already crowded by existing deployed miners.
              if (vt.owner.isAi) {
                var aiLimits = (t.rules.ai && t.rules.ai.aislaveMinerNumber) || [4, 3, 2],
                  aiDiffIdx = vt.owner.aiDifficulty,
                  aiMaxSlavesBuildings = aiLimits[Math.min(aiDiffIdx, aiLimits.length - 1)] || 4;
                var aiDeployed = 0,
                  existingMinerTiles = [];
                try {
                  for (var cobj of t.combatants.get(vt.owner)?.allObjects || []) {
                    if (
                      cobj !== vt &&
                      cobj.isBuilding &&
                      !cobj.isDisposed &&
                      !cobj.isDestroyed &&
                      cobj.rules &&
                      cobj.rules.slaveMiner
                    ) {
                      aiDeployed++;
                      cobj.tile && existingMinerTiles.push(cobj.tile);
                    }
                  }
                } catch (cntErr) {}
                if (aiDeployed >= aiMaxSlavesBuildings) {
                  // at limit → find an ore field NOT near our existing deployed miners
                  var farOre = void 0,
                    farPlace = void 0,
                    rf = new o._RadialTileFinder(
                      t.map.tiles,
                      t.map.mapBounds,
                      vt.tile,
                      { width: 1, height: 1 },
                      0,
                      t.rules.general.slaveMinerLongScan,
                    );
                  for (var scanTile; (scanTile = rf.getNextTile()); ) {
                    if (!this._isOreTile(t, scanTile)) continue;
                    var tooClose = !1;
                    for (var mt of existingMinerTiles) {
                      if (
                        Math.abs(mt.rx - scanTile.rx) + Math.abs(mt.ry - scanTile.ry) <=
                        t.rules.general.slaveMinerShortScan
                      ) {
                        tooClose = !0;
                        break;
                      }
                    }
                    if (tooClose) continue;
                    farOre = scanTile;
                    farPlace = this._findPlaceableNear(t, vt, farOre);
                    if (farPlace) break;
                  }
                  if (farPlace) {
                    vt.unitOrderTrait.addTask(new m.MoveTask(t, farPlace, !1));
                  } else
                    this.scanCooldown = t.rules.general.slaveMinerKickFrameDelay || 150;
                  return;
                }
              }
              // 1) check feet: can deploy and ore under/near us?
              if (this._canDeployHere(t, vt)) {
                vt.unitOrderTrait.addTask(new d.DeployIntoTask(t));
                return;
              }
              // 2) look far: LongScan (48) for nearest ore
              var oreTile = this._findNearestOre(t, vt);
              if (oreTile) {
                // 3) find placeable spot near ore (ScanCorrection=3)
                var placeTile = this._findPlaceableNear(t, vt, oreTile);
                if (placeTile) {
                  vt.unitOrderTrait.addTask(new m.MoveTask(t, placeTile, !1));
                } else {
                  this.scanCooldown = POST_ACTION_COOLDOWN;
                }
              } else {
                // 5) no ore anywhere: long cooldown
                this.scanCooldown = t.rules.general.slaveMinerKickFrameDelay || 150;
              }
            }
          }),
        );
        o._RadialTileFinder = r.RadialTileFinder;
        o._MoveTask = m.MoveTask;
        o._DeployIntoTask = d.DeployIntoTask;
      },
    };
  },
);
