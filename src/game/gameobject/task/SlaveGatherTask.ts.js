// === Reconstructed SystemJS module: game/gameobject/task/SlaveGatherTask ===
// deps: ["game/gameobject/task/system/Task","game/gameobject/task/move/MoveTask","game/map/tileFinder/RadialTileFinder","game/type/LandType","game/gameobject/task/system/WaitMinutesTask","game/gameobject/trait/TiberiumTrait"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// OpenYRWeb: Slave economy loop for SlaveMiner slaves (YR Yuri faction). A self-contained state
// machine driven by one slave infantry unit (SLAV). Reuses MoveTask (A* pathfinding) as a CHILD
// task (this.children.push), matching how the vanilla GatherOreTask drives movement — the earlier
// version erroneously pushed MoveTask onto the unit's own order queue, so the slave never waited
// for the move and the harvest never happened.
//
// Loop:
//   SEEKING_ORE   — find nearest reachable ore tile (RadialTileFinder + island-id connectivity
//                   check, mirroring GatherOreTask.findClosestReachableOreSite, so the slave
//                   doesn't pathfind toward ore it can't reach)
//   MOVING_TO_ORE — push a MoveTask child; resume when it finishes
//   HARVESTING    — collect one bail via the ore overlay's TiberiumTrait (traits.get)
//   RETURNING     — push a MoveTask child toward the owning SlaveMiner building's adjacent tile
//   DUMPING       — credits += tiberium value (+ OrePurifier bonus), loop back
// If no ore is found, the slave idles near the miner and retries periodically.
//
// Fixes vs. earlier "屎山" version:
//   - Last bail crash: TiberiumTrait.collectBail() returns undefined for the final bail; the
//     earlier code stored cargo=undefined then called getTiberium(undefined) which throws. Now
//     guarded (void 0 === bailType || we skip adding it), matching GatherOreTask.
//   - Connectivity: added getIslandIdMap check so the slave only picks ore on its landmass.
//   - Ore Purifier bonus: dump now applies general.purifierBonus per powered OrePurifier owned
//     by the miner's owner, matching ReturnOreTask for vehicle harvesters.

System.register(
  "game/gameobject/task/SlaveGatherTask",
  [
    "game/gameobject/task/system/Task",
    "game/gameobject/task/move/MoveTask",
    "game/map/tileFinder/RadialTileFinder",
    "game/type/LandType",
    "game/gameobject/task/system/WaitMinutesTask",
    "game/gameobject/trait/TiberiumTrait",
  ],
  function (e, t) {
    "use strict";
    var s, m, r, l, w, b;
    t && t.id;
    return {
      setters: [
        function (e) {
          s = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          w = e;
        },
        function (e) {
          b = e;
        },
      ],
      execute: function () {
        var n;
        var SEEKING_ORE = 0,
          MOVING_TO_ORE = 1,
          HARVESTING = 2,
          RETURNING = 3,
          DUMPING = 4;
        e(
          "SlaveGatherTask",
          (n = class extends s.Task {
            constructor(e, t) {
              super(),
                (this.game = e),
                (this.miner = t),
                (this.state = SEEKING_ORE),
                (this.cargo = void 0),
                (this.cargoCount = 0),
                (this.useChildTargetLines = !0),
                (this.blocking = !0);
            }
            // find nearest reachable ore tile around the slave's tile, with island-id
            // connectivity check (mirrors GatherOreTask.findClosestReachableOreSite) so the
            // slave doesn't pathfind toward ore it cannot reach.
            _findOre(t, i) {
              var e = t.map,
                a = i.rules.speedType,
                isInf = !0; // infantry
              var islandMap = e.terrain.getIslandIdMap(a, isInf),
                homeIsland = islandMap ? islandMap.get(i.tile, i.onBridge) : void 0;
              var candidates = [];
              for (
                var o = new r.RadialTileFinder(
                    e.tiles,
                    e.mapBounds,
                    i.tile,
                    { width: 1, height: 1 },
                    0,
                    30,
                    (r) =>
                      r.landType === l.LandType.Tiberium &&
                      0 < e.terrain.getPassableSpeed(r, a, isInf, !1) &&
                      Math.abs(r.z - i.tile.z) < 2 &&
                      (!islandMap || islandMap.get(r, !1) === homeIsland),
                  );
                ;

              ) {
                var d = o.getNextTile();
                if (!d) break;
                var c = e.getGroundObjectsOnTile(d).find((e) => e.isOverlay() && e.isTiberium());
                // Ore overlays store their collect logic in the trait collection, not as a direct
                // property (the earlier `c.tiberiumTrait` check was always undefined here).
                var tt = c && c.traits ? c.traits.get(b.TiberiumTrait) : void 0;
                if (tt && 0 < tt.getBailCount()) candidates.push({ tile: d, tibTrait: tt });
              }
              if (!candidates.length) return void 0;
              // Prefer higher-value ore (mirrors GatherOreTask's value-based sort, simplified).
              candidates.sort((x, y) => (y.tibTrait.rules.value || 0) - (x.tibTrait.rules.value || 0));
              return candidates[0].tile;
            }
            // OpenYRWeb: on any exit (cancel / miner destroyed / liberation), drop the harvest
            // anim flag so the HarvesterPlugin disposes its OREGATH anim. Without this, a slave
            // cancelled mid-harvest (e.g. freed or its miner destroyed) would leave
            // harvesterTrait.status = Harvesting and the digging anim would play forever.
            onEnd(t) {
              t && t.harvesterTrait && (t.harvesterTrait.status = 0);
            }
            onTick(t) {
              if (this.isCancelling()) return !0;
              // miner sold/destroyed → free the slave
              if (!this.miner || this.miner.isDisposed || this.miner.isDestroyed) return !0;
              switch (this.state) {
                case SEEKING_ORE: {
                  var i = this._findOre(this.game, t);
                  if (!i)
                    // no ore nearby — wait ~10s then retry rather than spin every tick
                    return (this.children.push(new w.WaitMinutesTask(1 / 6)), !1);
                  return (
                    (this.oreTile = i),
                    (this.state = MOVING_TO_ORE),
                    this.children.push(new m.MoveTask(this.game, i, !1)),
                    !1
                  );
                }
                case MOVING_TO_ORE:
                  // children still running (MoveTask) → keep waiting; on finish, harvest
                  if (this.children.length) return !1;
                  // OpenYRWeb: entering HARVESTING — flag the slave's harvesterTrait so the
                  // HarvesterPlugin plays the OREGATH digging anim at the (ore) tile. Mirrors
                  // vanilla FUN_0073ced6's +0xe0e/+0x6d2 "is harvesting" gate. value 3 =
                  // HarvesterStatus.Harvesting (see SlaveCargoTrait comment).
                  t.harvesterTrait && (t.harvesterTrait.status = 3);
                  return ((this.state = HARVESTING), this.children.push(new w.WaitMinutesTask(1 / 60)), !1);
                case HARVESTING: {
                  if (this.children.length) return !1;
                  // harvest until the slave's cargo is full (Storage=4) or the ore patch on this
                  // tile is exhausted — matching vanilla YR slave behaviour where a slave fills
                  // its 4-bail capacity before returning to the miner to dump. Each bail
                  // collected waits one harvest animation tick (WaitMinutesTask) so the gather
                  // looks paced rather than instantaneous.
                  var a = this.game.map.getGroundObjectsOnTile(t.tile).find((e) => e.isOverlay() && e.isTiberium());
                  var ta = a && a.traits ? a.traits.get(b.TiberiumTrait) : void 0;
                  var cargoFull = t.harvesterTrait ? t.harvesterTrait.isFull() : (this.cargoCount ?? 0) >= (t.rules.storage ?? 4);
                  if (cargoFull) {
                    // capacity reached → head back to dump
                    t.harvesterTrait && (t.harvesterTrait.status = 0);
                    return ((this.state = RETURNING), !1);
                  }
                  if (ta && 0 < ta.getBailCount()) {
                    var bailType = ta.collectBail();
                    // OpenYRWeb: guard the last-bail crash. collectBail() returns undefined for the
                    // final bail of a patch; the earlier code stored cargo=undefined and later
                    // threw in getTiberium(undefined). Only count non-undefined bail types, exactly
                    // like GatherOreTask does (void 0 === s || r.addBails(s,1)).
                    if (bailType !== void 0) {
                      (this.cargo = bailType),
                        (this.cargoCount = (this.cargoCount ?? 0) + 1),
                        t.harvesterTrait && t.harvesterTrait.addBails(bailType, 1);
                    }
                    ta.getBailCount() <= 0 && this.game.unspawnObject(a);
                    // still room for more and ore remains on this tile → harvest again (paced)
                    if (!t.harvesterTrait?.isFull() && ta && 0 < ta.getBailCount())
                      return (this.children.push(new w.WaitMinutesTask(1 / 60)), !1);
                  }
                  // ore on this tile exhausted (or none) — return with whatever was gathered
                  t.harvesterTrait && (t.harvesterTrait.status = 0);
                  return ((this.state = RETURNING), !1);
                }
                case RETURNING: {
                  if (this.children.length) return !1;
                  if (!this.miner || this.miner.isDisposed || this.miner.isDestroyed) return !0;
                  // walk to a free adjacent tile next to the miner, then dump
                  var n = this.miner,
                    o = this.game.map,
                    d = t.rules.speedType,
                    c = new r.RadialTileFinder(
                      o.tiles,
                      o.mapBounds,
                      n.tile,
                      n.getFoundation(),
                      1,
                      4,
                      (e) =>
                        0 < o.terrain.getPassableSpeed(e, d, !0, !1) &&
                        Math.abs(e.z - n.tile.z) < 2 &&
                        !o.terrain.findObstacles({ tile: e, onBridge: void 0 }, t).length,
                    ).getNextTile();
                  return (
                    (this.state = DUMPING),
                    c
                      ? (this.children.push(new m.MoveTask(this.game, c, !1)), !1)
                      : (this._dump(t), (this.state = SEEKING_ORE), !1)
                  );
                }
                case DUMPING: {
                  if (this.children.length) return !1;
                  return (this._dump(t), (this.state = SEEKING_ORE), !1);
                }
              }
              return !1;
            }
            _dump(t) {
              if (void 0 !== this.cargo && 0 < (this.cargoCount ?? 0)) {
                // OpenYRWeb: value the full load. Per-bail value × number of bails gathered,
                // PLUS the OrePurifier bonus (vanilla: each powered OrePurifier owned by the
                // miner's owner adds floor(baseValue × general.purifierBonus)), matching
                // ReturnOreTask for vehicle harvesters.
                var base = 0;
                // cargo is a single TiberiumType for this trip; value it per bail.
                var tr = this.game.rules.getTiberium(this.cargo);
                var perBail = tr ? tr.value : 0;
                base = perBail * (this.cargoCount ?? 1);
                var total = base;
                try {
                  var purifierCount = 0;
                  if (this.miner && this.miner.owner) {
                    purifierCount = [...this.miner.owner.buildings].filter(
                      (e) =>
                        e.rules.orePurifier &&
                        (!e.poweredTrait || !this.miner.owner.powerTrait?.isLowPower()),
                    ).length;
                  }
                  var bonusRate = this.game.rules.general.purifierBonus || 0;
                  if (purifierCount && bonusRate) total += purifierCount * Math.floor(base * bonusRate);
                } catch (err) {}
                0 < total &&
                  ((this.miner.owner.credits += total), (this.miner.owner.creditsGained += total));
                // clear the cargo trait so the ore pip resets after dumping.
                t.harvesterTrait && t.harvesterTrait.empty();
              }
              (this.cargo = void 0), (this.cargoCount = 0);
            }
          }),
        );
      },
    };
  },
);
