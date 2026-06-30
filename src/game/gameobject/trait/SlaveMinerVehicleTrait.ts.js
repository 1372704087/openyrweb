// === Reconstructed SystemJS module: game/gameobject/trait/SlaveMinerVehicleTrait ===
// deps: ["game/gameobject/trait/interface/NotifySpawn","game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/interface/NotifyDestroy","game/map/tileFinder/RadialTileFinder","game/type/LandType","game/gameobject/trait/TiberiumTrait","game/gameobject/task/move/MoveTask","game/gameobject/task/morph/DeployIntoTask","game/gameobject/task/SlaveGatherTask"]
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
//   * While the vehicle has player/AI orders (unitOrderTrait.hasTasks()) we do nothing — the
//     player is repositioning it. The instant it goes idle we resume, so a manual move onto ore
//     results in a deploy on arrival (vanilla "click ore → deploy there").
//   * If the vehicle is ALREADY standing on a tile where its DeploysInto building can be placed
//     AND ore lies within ORE_PROXIMITY tiles, we deploy immediately.
//   * Otherwise we scan (SCAN_RADIUS) for the nearest reachable ore, then pick the closest
//     placement-valid tile near that ore and issue a MoveTask toward it. On arrival the idle
//     check above fires the deploy.
//   * A small cooldown prevents per-tick re-scanning while travelling or when no ore is found.

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
  ],
  function (e, t) {
    "use strict";
    var n, i, ds, r, l, b, m, d, g;
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
      ],
      execute: function () {
        var o;
        // Radii (tiles). Ore-proximity gates the deploy (slaves spawn and scan outward from the
        // building); SCAN_RADIUS is how far the vehicle looks for the nearest ore to drive to;
        // SPOT_SEARCH is the radius around a found ore cell in which we look for a buildable
        // placement tile. Cooldowns are in ticks (15 fps engine clock).
        var ORE_PROXIMITY = 5,
          SCAN_RADIUS = 20,
          SPOT_SEARCH = 4,
          POST_ACTION_COOLDOWN = 7,
          NO_ORE_COOLDOWN = 30;
        e(
          "SlaveMinerVehicleTrait",
          (o = class {
            constructor() {
              this.scanCooldown = 0;
              // OpenYRWeb (2026-06-30, REVERSED): slaves ride INSIDE the vehicle (off the map).
              // Populated either at spawn (claiming the pool handed over from the undeployed
              // building via game._pendingMinerSlaves) or by SlaveMinerTrait.NotifyUnspawn. The
              // vehicle's NotifyTick seeks ore + deploys; when it deploys, _stashSlavesForMorph
              // hands this pool back to the new building so the slaves re-enter the map there.
              this.slaves = [];
            }
            // small settle delay on spawn so the vehicle clears the factory exit before seeking
            [n.NotifySpawn.onSpawn](e, t) {
              this.scanCooldown = POST_ACTION_COOLDOWN;
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
                  SCAN_RADIUS,
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
                    SPOT_SEARCH,
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
              return (
                !!t.rules.deploysInto &&
                s.canPlaceAt(t.rules.deploysInto, t.tile, { ignoreAdjacent: !0, ignoreObjects: [t] }) &&
                this._hasOreNearby(e, t, t.tile, ORE_PROXIMITY)
              );
            }
            [i.NotifyTick.onTick](e, t) {
              if (!e || e.isDisposed || e.isDestroyed) return;
              // only drive the undeployed vehicle form; once deployed it morphs into a building
              // (disposed as a vehicle) and this trait is gone.
              if (!e.isVehicle || !e.isVehicle() || !e.unitOrderTrait || !e.rules.deploysInto) return;
              if (!e.owner || !e.owner.isCombatant || !e.owner.isCombatant()) return;
              // While the vehicle has orders (player repositioning / mid-move) do nothing. The
              // moment it goes idle we act, so a manual move onto ore deploys on arrival.
              if (e.unitOrderTrait.hasTasks()) return;
              if (0 < this.scanCooldown) return void this.scanCooldown--;
              var pushed = !1;
              // already standing on a valid deploy spot with ore nearby -> deploy now
              if (this._canDeployHere(t, e))
                (e.unitOrderTrait.addTask(new o._DeployIntoTask(t)), (pushed = !0));
              else {
                // seek nearest reachable ore, then the closest placement-valid tile near it
                var s = this._findNearestOre(t, e);
                if (s) {
                  var a = this._findPlaceableNear(t, e, s);
                  if (a) {
                    a.rx === e.tile.rx && a.ry === e.tile.ry
                      ? e.unitOrderTrait.addTask(new o._DeployIntoTask(t))
                      : e.unitOrderTrait.addTask(new o._MoveTask(t, a, !!e.onBridge));
                    pushed = !0;
                  }
                }
              }
              // if we issued an order the vehicle is now busy (no re-scan needed); otherwise back
              // off so we don't spin every tick when ore / a placement tile isn't available.
              this.scanCooldown = pushed ? 0 : NO_ORE_COOLDOWN;
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
