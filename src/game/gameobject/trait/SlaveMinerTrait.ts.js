﻿﻿﻿﻿﻿﻿﻿// === Reconstructed SystemJS module: game/gameobject/trait/SlaveMinerTrait ===
// deps: ["game/gameobject/trait/interface/NotifySpawn","game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/interface/NotifyUnspawn","game/gameobject/trait/interface/NotifyDestroy","game/gameobject/trait/interface/NotifyOwnerChange","engine/type/ObjectType","game/map/tileFinder/RadialTileFinder","game/gameobject/task/SlaveGatherTask","game/gameobject/task/move/MoveTask","game/gameobject/task/morph/UndeployIntoTask","game/type/LandType","game/gameobject/trait/TiberiumTrait"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// OpenYRWeb: SlaveMiner economy (YR Yuri faction). Attached to a building whose rules have
// Slaves=<infantry>. The building acts as a refinery: it owns a pool of slave infantry that
// walk to ore, harvest one bail, and walk back to dump (credits += value). Slaves that die are
// respawned after SlaveRegenRate seconds (mirrors AirSpawnTrait's regen model).
//
// The slave walking/harvesting/dumping loop is in SlaveGatherTask (a self-contained state
// machine that reuses MoveTask for pathfinding and TiberiumTrait.collectBail for harvesting).
//
// Liberation semantics (vanilla YR, ModEnc/Enslaves + ModEnc/Slaved):
//   - Slave Miner DESTROYED by an enemy → surviving slaves are FREED and transfer to the
//     destroyer's House (attackerInfo.player). They become regular selectable infantry.
//   - Slave Miner SOLD or captured by mind-control/owner-change → surviving slaves FOLLOW the
//     miner to its new owner (they are the miner's property). We hook NotifyOwnerChange.
//   - Slave Miner removed with no attacker (e.g. limbo/sell with no killer) → slaves are
//     freed to the civilian player (vanilla: they become neutral free units).
// The earlier implementation unconditionally destroyed all slaves on unspawn, which diverged
// from vanilla on every destroy/sell/capture case.

System.register(
  "game/gameobject/trait/SlaveMinerTrait",
  [
    "game/gameobject/trait/interface/NotifySpawn",
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/trait/interface/NotifyUnspawn",
    "game/gameobject/trait/interface/NotifyDestroy",
    "game/gameobject/trait/interface/NotifyOwnerChange",
    "engine/type/ObjectType",
    "game/map/tileFinder/RadialTileFinder",
    "game/gameobject/task/SlaveGatherTask",
    "game/gameobject/task/move/MoveTask",
    "game/gameobject/task/morph/UndeployIntoTask",
    "game/type/LandType",
    "game/gameobject/trait/TiberiumTrait",
  ],
  function (e, t) {
    "use strict";
    var n, i, r, d, oc, o, a, s, m, u, lt, tt;
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
          r = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          oc = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          lt = e;
        },
        function (e) {
          tt = e;
        },
      ],
      execute: function () {
        var l;
        e(
          "SlaveMinerTrait",
          (l = class {
            constructor() {
              this.slaves = [];
              this.regenTicksLeft = 0;
              // Last attacker that destroyed the miner (set in NotifyDestroy, read in
              // NotifyUnspawn) so we can free slaves to the destroyer. Vanilla YR liberates
              // slaves to the House that killed the Slave Miner.
              this._liberator = void 0;
              // OpenYRWeb: set true by MorphIntoTask just before unspawning the miner, so
              // NotifyUnspawn knows this is a deploy/undeploy morph (NOT a destroy/sell) and
              // silently recalls the slaves instead of liberating them to the civilian player.
              this._morphInFlight = !1;
              // Deferred initial spawn count: slaves are created only after the building
              // reaches buildStatus === Ready (fully deployed), not during BUILDUP.
              this._pendingSpawnCount = 0;
              // Initial spawn delay (game ticks). After buildStatus becomes Ready, wait this
              // many ticks before spawning the first slaves (~2s = 30 ticks @ speed 6).
              this._initialSpawnTicksLeft = 0;
              // Respawn countdown timer (game ticks). Set to ~1s (15 ticks @ speed 6) by
              // scheduleSlaveRespawn(). When it reaches 0, a new slave is spawned at the door.
              this._respawnTicksLeft = 0;
              // OpenYRWeb: counter for auto-undeploy triggered by slaves. Increments each
              // tick when no slave has recently found ore. Reset by any slave finding ore.
              // When it reaches SlaveMinerKickFrameDelay, the building undeploys.
              // Start at a large negative value so a freshly-built building doesn't
              // auto-undeploy before its slaves have a chance to find the nearest ore field.
              this._noOreTicks = 150;
            }
            _spawnOneSlave(e, t) {
              var i = e.rules.getObject(t.rules.slaves, o.ObjectType.Infantry),
                r = e.createUnitForPlayer(i, t.owner),
                // Door tile = bottom-left cell of the building's foundation
                doorRy = t.tile.ry + t.art.foundation.height - 1,
                doorTile = e.map.tiles.getByMapCoords(t.tile.rx, doorRy) ?? e.map.tiles.getPlaceholderTile(t.tile.rx, doorRy),
                // find a free adjacent tile for the slave to walk out to after spawning at the door
                a = new l._RadialTileFinder(
                  e.map.tiles,
                  e.map.mapBounds,
                  doorTile,
                  { width: 1, height: 1 },
                  1,
                  3,
                  (i) => {
                    var r = e.map.getGroundObjectsOnTile(i);
                    return !r.some((e) => e.isTechno()) && i.passable !== !1;
                  },
                ),
                s = a.getNextTile() ?? doorTile;
              // Vanilla YR: slaves spawn at the door (bottom-left) of the building and walk out.
              e.spawnObject(r, doorTile),
                this.slaves.push(r),
                s !== doorTile && r.unitOrderTrait.addTask(new m.MoveTask(e, s, void 0)),
                r.unitOrderTrait.addTask(new l._SlaveGatherTask(e, t));
            }
            // Schedule a new slave to be spawned at the door after ~1 second. Used by
            // SlaveGatherTask DUMPING when the slave is consumed (vanilla YR: destroy old, create new).
            scheduleSlaveRespawn() {
              this._respawnTicksLeft = 15; // ~1s at game speed 6 (15 ticks per game minute)
            }
            // Free the surviving slaves: transfer each to `newOwner`, drop the automated
            // SlaveGatherTask so the new owner can command them, and clear our pool. Vanilla
            // behaviour (ModEnc/Enslaves): a freed slave becomes a normal infantry under the
            // liberator's control.
            //
            // OpenYRWeb: mark each freed slave with `liberated = true` so the selection handler
            // lets the new owner select/command it. We must NOT mutate the shared `rules.slaved`
            // flag (TechnoRules is shared per type), so a per-instance flag is the only safe way
            // to make a freed slave selectable while still-enslaved slaves remain unselectable.
            _liberateSlaves(e, t, newOwner) {
              if (!newOwner) return;
              for (var i of this.slaves) {
                if (i.isDisposed || i.isDestroyed) continue;
                // cancel the auto-gather loop so the liberator can issue orders
                i.unitOrderTrait?.cancelAll?.();
                // mark freed so UnitSelectionHandler lets it be selected (slaved && !liberated)
                try { i.liberated = !0; } catch (err) {}
                if (i.owner !== newOwner) e.changeObjectOwner(i, newOwner);
              }
              this.slaves = [];
            }
            [n.NotifySpawn.onSpawn](e, t) {
              // OpenYRWeb (2026-06-30, REVERSED): on deploy (vehicle→building) the slaves that
              // were following the vehicle are claimed here and their SlaveGatherTask.miner is
              // repointed at this building (so they dump at the building's adjacent tile = walk
              // through the door). The slaves are already on the map (they followed the vehicle);
              // we do NOT spawn/unspawn them — that would teleport. If there is no pending pool
              // (first build), spawn the initial workforce as usual.
              var claimed = !1;
              try {
                if (t._pendingMinerSlaves && t._pendingMinerSlaves.length) {
                  for (var sv of t._pendingMinerSlaves) {
                    if (!sv || sv.isDisposed || sv.isDestroyed) continue;
                    this.slaves.push(sv);
                    this._repointSlaveMiner(sv, e, t);
                  }
                  t._pendingMinerSlaves = [];
                  claimed = !0;
                }
              } catch (err) {}
              if (!claimed && e.owner.isCombatant())
                this._pendingSpawnCount = e.rules.initialSlaves;
            }
            // repoint a slave's SlaveGatherTask at this building/vehicle (the new miner form),
            // so after a morph the slave keeps gathering/dumping against the current form.
            // Cancels any in-flight move so the slave immediately re-plans toward the new miner.
            //
            // When the miner is a building (just deployed from vehicle), pre-scan for ore near
            // the building and direct the slave to walk there. Otherwise the slave scans from
            // wherever it happens to be (possibly far from the building).
            _repointSlaveMiner(s, miner, game) {
              try {
                s.unitOrderTrait?.cancelAll?.();
                if (miner.isBuilding && miner.isBuilding()) {
                  if (s.isCarrying) {
                    // Carrying ore: walk to the building to dump.
                    s.unitOrderTrait?.addTask?.(new m.MoveTask(game, miner.tile, !1, { ignoredBlockers: [miner] }));
                  } else {
                    var oreTile = this._findOreNearMiner(game, miner, s);
                    if (oreTile)
                      s.unitOrderTrait?.addTask?.(new m.MoveTask(game, oreTile, !1));
                  }
                }
                s.unitOrderTrait?.addTask?.(new l._SlaveGatherTask(game, miner));
              } catch (err) {}
            }
            // Scan for ore tiles near the miner building, using the SLAVE's speedType
            // (not the building's) so island-id connectivity and passable-speed checks
            // match what the slave can actually walk on.
            // Returns the first viable ore tile or undefined.
            _findOreNearMiner(e, t, s) {
              try {
                var spd = s.rules.speedType,  // slave infantry speed type (Foot)
                    islandMap = e.map.terrain.getIslandIdMap(spd, !0),
                    homeIsland = islandMap ? islandMap.get(t.tile, t.onBridge) : void 0,
                    o = new l._RadialTileFinder(
                      e.map.tiles,
                      e.map.mapBounds,
                      t.tile,
                      t.getFoundation(),
                      1,
                      e.rules.general.slaveMinerSlaveScan,
                      (r) =>
                        r.landType === lt.LandType.Tiberium &&
                        0 < e.map.terrain.getPassableSpeed(r, spd, !0, !1) &&
                        Math.abs(r.z - t.tile.z) < 2 &&
                        (!islandMap || islandMap.get(r, !1) === homeIsland),
                    );
                for (;;) {
                  var d = o.getNextTile();
                  if (!d) break;
                  var c = e.map.getGroundObjectsOnTile(d).find((i) => i.isOverlay() && i.isTiberium()),
                      tv = c && c.traits ? c.traits.get(tt.TiberiumTrait) : void 0;
                  if (tv && 0 < tv.getBailCount()) return d;
                }
              } catch (err) {}
              return void 0;
            }
            [i.NotifyTick.onTick](e, t) {
              if (!e.owner || !e.owner.isCombatant || !e.owner.isCombatant()) return;
              // Deferred initial spawn: wait until building is fully deployed (buildStatus 1=Ready),
              // then wait an additional ~2 seconds (30 ticks) before spawning the first slaves.
              if (this._pendingSpawnCount > 0 && e.isBuilding && e.isBuilding() && e.buildStatus === 1) {
                if (this._initialSpawnTicksLeft === 0) {
                  this._initialSpawnTicksLeft = 30; // ~2s @ speed 6
                }
                if (--this._initialSpawnTicksLeft > 0) return;
                for (var si = 0; si < this._pendingSpawnCount; si++) this._spawnOneSlave(t, e);
                this._pendingSpawnCount = 0;
              }
              // Respawn timer (vanilla YR: new slave appears at door ~1s after previous slave was consumed in DUMPING)
              if (this._respawnTicksLeft > 0 && 0 >= --this._respawnTicksLeft) {
                this._spawnOneSlave(t, e);
              }
              // prune dead/destroyed slaves from the pool
              if (
                ((this.slaves = this.slaves.filter((e) => !e.isDisposed && !e.isDestroyed)),
                this.slaves.length < e.rules.initialSlaves)
              ) {
                // SlaveRegenRate is in frames/ticks (vanilla YR semantics, e.g. 500 ≈ 33s @15fps).
                // Start the countdown only when we first notice a deficit; tick it down each frame.
                if (this.regenTicksLeft <= 0) {
                  this.regenTicksLeft = e.rules.slaveRegenRate || 1;
                }
                if (0 >= --this.regenTicksLeft) {
                  (this.regenTicksLeft = 0), this._spawnOneSlave(t, e);
                }
              } else this.regenTicksLeft = 0;
              // OpenYRWeb: auto-undeploy when no slave has found ore for too long.
              // We check the slaves directly: if any slave is carrying ore (isCarrying)
              // or is actively harvesting (isHarvesting), ore is clearly available and
              // we reset the counter. Only when ALL slaves are idle/searching and the
              // counter reaches SlaveMinerKickFrameDelay do we pack up.
              if (e.isBuilding && e.isBuilding() && e.buildStatus === 1) {
                // If any slave currently has cargo or is digging, ore is available.
                var anyActive = !1;
                for (var si = 0; si < this.slaves.length; si++) {
                  var sv = this.slaves[si];
                  if (!sv || sv.isDisposed || sv.isDestroyed) continue;
                  if (sv.isCarrying || sv.isHarvesting || sv._oreLocked) { anyActive = !0; break; }
                }
                if (anyActive) { this._noOreTicks = t.rules.general.slaveMinerKickFrameDelay || 150; }
                else if (--this._noOreTicks <= 0) {
                  this._noOreTicks = t.rules.general.slaveMinerKickFrameDelay || 150;
                  if (!e.unitOrderTrait || !e.unitOrderTrait.hasTasks || !e.unitOrderTrait.hasTasks()) {
                    var vehicleType = t.rules.getObject(e.rules.undeploysInto, o.ObjectType.Vehicle);
                    if (!vehicleType) return;
                    // Tell the vehicle to skip the idle delay so it deploys on arrival.
                    t._slaveMinerAutoDeployMode = !0;
                    e.unitOrderTrait.addTask(new u.UndeployIntoTask(t));
                  }
                }
              }
            }
            // OpenYRWeb: capture the destroyer so onUnspawn can free slaves to them. Vanilla YR
            // liberates enslaved workers to the House that killed their Slave Miner.
            [d.NotifyDestroy.onDestroy](e, t, i) {
              this._liberator = i && i.player ? i.player : void 0;
            }
            // OpenYRWeb: slaves follow the miner on owner-change (mind-control / capture). They
            // are property of the miner; vanilla transfers them with it.
            [oc.NotifyOwnerChange.onChange](e, t, i) {
              // `t`=oldOwner, `i`=game. After changeObjectOwner, e.owner is already the new
              // owner. Reassign every surviving slave to the new owner so the economy continues
              // for the capturer and the liberator-on-destroy logic stays consistent.
              for (var slave of this.slaves) {
                if (slave.isDisposed || slave.isDestroyed) continue;
                if (slave.owner !== e.owner) i.changeObjectOwner(slave, e.owner);
              }
            }
            [r.NotifyUnspawn.onUnspawn](e, t) {
              // OpenYRWeb: deploy/undeploy morph — silently recall slaves (no liberation).
              // MorphIntoTask sets _morphInFlight=true just before unspawning the miner.
              //
              // IMPORTANT: do NOT clear _morphInFlight here. Object-level NotifyUnspawn (this
              // handler, fired via GameObject.onUnspawn at Game.doUnspawnObject line ~765) runs
              // BEFORE game-level NotifyUnspawn (ProductionTrait, fired at ~766-768). Clearing the
              // flag here would defeat ProductionTrait's morph guard, causing the in-progress
              // War Factory build to be cancelled when the Slave Miner undeploys. The flag is
              // per-morph and the building is about to be disposed, so leaving it set is safe.
              if (this._morphInFlight) {
                // OpenYRWeb (2026-06-30, REVERSED @ yrmd.exe): on undeploy (building→vehicle) the
                // slaves do NOT vanish and are NOT teleported — the SlaveManager persists across
                // the morph and the slaves stay on the map, following the new vehicle form.
                // We hand the slave pool to the morph target via game._pendingMinerSlaves; the
                // freshly spawned vehicle's SlaveMinerVehicleTrait.NotifySpawn will claim it and
                // repoint every slave's SlaveGatherTask.miner at the vehicle (so they keep mining
                // and dump at the vehicle's adjacent tile). The slaves themselves are untouched.
                // Earlier code unspawned+disposed the slaves here, which deleted the workforce
                // on every undeploy — the reported "slaves disappear when packed" bug. A later
                // attempt teleported them off-map, which produced "stuck inside / vanish". This
                // version matches vanilla SlaveManager semantics (slaves always on the map).
                try {
                  if (!t._pendingMinerSlaves) t._pendingMinerSlaves = [];
                  for (var s of this.slaves) {
                    if (s && !s.isDisposed && !s.isDestroyed) t._pendingMinerSlaves.push(s);
                  }
                } catch (err) {}
                this.slaves = [];
                return;
              }
              if (this._liberator) {
                // destroyed by an enemy → free slaves to the destroyer (vanilla liberation)
                e._slavesLiberated = !0; // flag for SoundHandler to play SlavesFreeSound
                this._liberateSlaves(t, e, this._liberator);
              } else {
                // sold / limboed with no killer → free to civilian player (neutral free units)
                var civ = t.getCivilianPlayer ? t.getCivilianPlayer() : void 0;
                if (civ) this._liberateSlaves(t, e, civ);
                else for (var i of this.slaves) i.isDisposed || i.isDestroyed || t.destroyObject(i, void 0);
                this.slaves = [];
              }
              this._liberator = void 0;
            }
          }),
        ),
          (l._RadialTileFinder = a.RadialTileFinder),
          (l._SlaveGatherTask = s.SlaveGatherTask);
      },
    };
  },
);
