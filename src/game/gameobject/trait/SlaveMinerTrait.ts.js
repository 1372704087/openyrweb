// === Reconstructed SystemJS module: game/gameobject/trait/SlaveMinerTrait ===
// deps: ["game/gameobject/trait/interface/NotifySpawn","game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/interface/NotifyUnspawn","game/gameobject/trait/interface/NotifyDestroy","game/gameobject/trait/interface/NotifyOwnerChange","engine/type/ObjectType","game/map/tileFinder/RadialTileFinder","game/gameobject/task/SlaveGatherTask"]
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
  ],
  function (e, t) {
    "use strict";
    var n, i, r, d, oc, o, a, s;
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
            }
            _spawnOneSlave(e, t) {
              var i = e.rules.getObject(t.rules.slaves, o.ObjectType.Infantry),
                r = e.createUnitForPlayer(i, t.owner),
                // find a free adjacent tile around the miner to drop the slave on
                a = new l._RadialTileFinder(
                  e.map.tiles,
                  e.map.mapBounds,
                  t.tile,
                  { width: t.art.foundation.width, height: t.art.foundation.height },
                  0,
                  3,
                  (i) => {
                    var r = e.map.getGroundObjectsOnTile(i);
                    return !r.some((e) => e.isTechno()) && i.passable !== !1;
                  },
                ),
                s = a.getNextTile() ?? t.tile;
              e.spawnObject(r, s),
                this.slaves.push(r),
                r.unitOrderTrait.addTask(new l._SlaveGatherTask(e, t));
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
                for (var i = 0; i < e.rules.initialSlaves; i++) t.afterTick(() => this._spawnOneSlave(t, e));
            }
            // repoint a slave's SlaveGatherTask at this building/vehicle (the new miner form),
            // so after a morph the slave keeps gathering/dumping against the current form.
            // Cancels any in-flight move so the slave immediately re-plans toward the new miner.
            _repointSlaveMiner(s, miner, game) {
              try {
                s.unitOrderTrait?.cancelAll?.();
                s.unitOrderTrait?.addTask?.(new l._SlaveGatherTask(game, miner));
              } catch (err) {}
            }
            [i.NotifyTick.onTick](e, t) {
              if (!e.owner || !e.owner.isCombatant || !e.owner.isCombatant()) return;
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
