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
//   SEEKING_ORE        — find nearest reachable ore tile (RadialTileFinder + island-id connectivity
//                        check, mirroring GatherOreTask.findClosestReachableOreSite, so the slave
//                        doesn't pathfind toward ore it can't reach)
//   MOVING_TO_ORE      — push a MoveTask child; resume when it finishes
//   IDLE_BEFORE_HARVEST — random brief pause ("thinking") before starting to dig (vanilla behavior)
//   HARVESTING         — collect one bail via the ore overlay's TiberiumTrait (traits.get)
//   RETURNING          — push a MoveTask child toward the owning SlaveMiner building's adjacent tile
//   DUMPING            — credits += tiberium value (+ OrePurifier bonus), loop back
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
              DUMPING = 4,
              EXITING_MINER = 5,
              IDLE_BEFORE_HARVEST = 6;
        // Mining delay per bail. Read from GeneralRules.HarvestRate (rulescd.ini [General]),
        // default 2/60 (2 seconds) — HarvestRate is slave-specific (vehicle harvesters use a
        // hardcoded 1s interval). Slaves also pause for a random brief moment before starting
        // to dig (IDLE_BEFORE_HARVEST state), matching vanilla behavior.
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
                (this._returnDoorTile = void 0),
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
                    t.rules.general.slaveMinerSlaveScan,
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
              // Found ore — give the building a long grace period so the slave has
              // time to walk to the ore and start harvesting before the counter expires.
              // A short KickFrameDelay (10s) is not enough when ore is far away.

              // Prefer higher-value ore (mirrors GatherOreTask's value-based sort, simplified).
              candidates.sort((x, y) => (y.tibTrait.rules.value || 0) - (x.tibTrait.rules.value || 0));
              // Among the highest-value candidates, pick randomly from the closest few so
              // the 5 slaves spread out instead of all pathing to the exact same tile.
              // RadialTileFinder yields tiles by increasing distance, so after the value sort
              // the first entries are the closest top-value tiles.
              var topValue = candidates[0].tibTrait.rules.value || 0;
              var pool = candidates
                .filter((c) => (c.tibTrait.rules.value || 0) === topValue)
                .slice(0, 5);
              return pool[Math.floor(Math.random() * pool.length)].tile;
            }
            // Search for higher-value ore within a small radius around the slave.
            // Used after the IDLE_BEFORE_HARVEST thinking pause — the slave looks around
            // and may walk to a better ore tile if one is nearby (vanilla behavior).
            _findBetterOreNearby(t, range) {
              var e = this.game.map,
                a = t.rules.speedType,
                isInf = !0,
                islandMap = e.terrain.getIslandIdMap(a, isInf),
                homeIsland = islandMap ? islandMap.get(t.tile, t.onBridge) : void 0,
                currentValue = 0;
              // Get current target ore value for comparison
              if (this.oreTile) {
                var co = e.getGroundObjectsOnTile(this.oreTile).find((e) => e.isOverlay() && e.isTiberium());
                var ctt = co && co.traits ? co.traits.get(b.TiberiumTrait) : void 0;
                ctt && (currentValue = ctt.rules.value || 0);
              }
              var bestTile,
                bestValue = currentValue,
                o = new r.RadialTileFinder(e.tiles, e.mapBounds, t.tile, { width: 1, height: 1 }, 2, range, (r) =>
                  r.landType === l.LandType.Tiberium &&
                  0 < e.terrain.getPassableSpeed(r, a, isInf, !1) &&
                  Math.abs(r.z - t.tile.z) < 2 &&
                  (!islandMap || islandMap.get(r, !1) === homeIsland)
                );
              for (;;) {
                var d = o.getNextTile();
                if (!d) break;
                var c = e.getGroundObjectsOnTile(d).find((e) => e.isOverlay() && e.isTiberium());
                var tt = c && c.traits ? c.traits.get(b.TiberiumTrait) : void 0;
                if (tt && 0 < tt.getBailCount()) {
                  var val = tt.rules.value || 0;
                  val > bestValue && ((bestValue = val), (bestTile = d));
                }
              }
              return bestTile;
            }
            // OpenYRWeb: on any exit (cancel / miner destroyed / liberation), drop the harvest
            // anim flag so the slave stops playing the Shovel digging sequence. Without this, a
            // slave cancelled mid-harvest would keep the isHarvesting flag and loop the dig anim.
            onEnd(t) {
              t && t.harvesterTrait && (t.harvesterTrait.status = 0);
              t && (t.isHarvesting = !1);
              t && (t.isCarrying = !1);
              t && (t._oreLocked = !1);
            }
            onTick(t) {
              if (this.isCancelling()) return !0;
              // miner sold/destroyed → free the slave
              if (!this.miner || this.miner.isDisposed || this.miner.isDestroyed) return !0;
              switch (this.state) {
                case SEEKING_ORE: {
                  // Wait for any running child task (e.g. MoveTask walking toward the miner)
                  // before re-scanning for ore, otherwise the slave oscillates: it walks toward
                  // the miner, _findOre sees old ore mid-walk, and turns back.
                  if (this.children.length) return !1;
                  // Repoint guard: if we already have cargo (e.g. the miner morphed/moved while
                  // we were returning), go back to dump first instead of mining more ore.
                  if (t.harvesterTrait && !t.harvesterTrait.isEmpty()) {
                    t.isCarrying = !0;
                    return (this.state = RETURNING), !1;
                  }
                  var i = this._findOre(this.game, t);
                  if (!i) {
                    // No ore nearby. If the miner is a vehicle, pathfind directly to it so
                    // the slave follows continuously instead of lagging behind in 2-tile hops.
                    // When the vehicle deploys, _repointSlaveMiner switches to the new building.
                    if (this.miner.isVehicle && this.miner.isVehicle()) {
                      if (t.tile !== this.miner.tile) {
                        this.children.push(new m.MoveTask(this.game, this.miner.tile, !1, { ignoredBlockers: [this.miner] }));
                        return !1;
                      }
                      // At the vehicle — wait and rescan (vehicle may deploy soon).
                      return (this.children.push(new w.WaitMinutesTask(1 / 6)), !1);
                    }
                    // Building form (not moving): walk a few tiles toward the building, rescan.
                    var mx = this.miner.tile.rx, my = this.miner.tile.ry,
                        sx = t.tile.rx, sy = t.tile.ry,
                        dx = mx - sx, dy = my - sy,
                        dist = Math.abs(dx) + Math.abs(dy);
                    if (dist > 2) {
                      var step = t.tile;
                      if (dist > 0) { dx = Math.sign(dx); dy = Math.sign(dy); }
                      for (var sd = 0, rx = sx, ry = sy; sd < 2 && (rx !== mx || ry !== my); sd++) {
                        if (dx !== 0) { var nx = rx + dx; var ny = ry; } else { var nx = rx; var ny = ry + dy; }
                        var ct = this.game.map.tiles.getByMapCoords(nx, ny);
                        if (ct && 0 < this.game.map.terrain.getPassableSpeed(ct, t.rules.speedType, !0, !1)) { step = ct; rx = nx; ry = ny; }
                      }
                      if (step !== t.tile) {
                        this.children.push(new m.MoveTask(this.game, step, !1));
                        return !1;
                      }
                    }
                    // Close enough — wait and retry.
                    return (this.children.push(new w.WaitMinutesTask(1 / 6)), !1);
                  }
                  return (
                    (this.oreTile = i),
                    (this._moveTargetTile = i),
                    (t._oreLocked = !0),
                    (this.state = MOVING_TO_ORE),
                    this.children.push(new m.MoveTask(this.game, i, !1)),
                    !1
                  );
                }
                case MOVING_TO_ORE:
                  // children still running (MoveTask) → keep waiting; on finish, pause before harvest
                  if (this.children.length) {
                    // chase vehicle: if miner is vehicle and moved >3 tiles, re-scan
                    try {
                      if (this.miner && this.miner.isVehicle && this.miner.isVehicle() &&
                          this._moveTargetTile && this.miner.tile) {
                        var dx2 = this.miner.tile.rx - this._moveTargetTile.rx,
                            dy2 = this.miner.tile.ry - this._moveTargetTile.ry;
                        if (Math.abs(dx2) + Math.abs(dy2) > 3) {
                          this.children = [];
                          this.state = SEEKING_ORE;
                          return !1;
                        }
                      }
                    } catch (er2) {}
                    return !1;
                  }
                  // Vanilla: slave does not mine immediately upon reaching the ore tile —
                  // there is a random brief idle pause ("thinking") before digging starts.
                  // Mark isHarvesting early so the building's idle timer doesn't count down
                  // during this pause (up to 5s) and trigger a premature pack-up.
                  return (
                    (t._oreLocked = !1),
                    (t.isHarvesting = !0),
                    (this.state = IDLE_BEFORE_HARVEST),
                    this.children.push(new w.WaitMinutesTask(Math.random() * (5 / 60))),
                    !1
                  );
                case IDLE_BEFORE_HARVEST:
                  if (this.children.length) {
                    // Random turning while "thinking" / looking around (vanilla behavior)
                    Math.random() < 0.05 && (t.direction = 360 * Math.random());
                    return !1;
                  }
                  // face the slave toward the ore tile before digging
                  this.oreTile && (this.oreTile.x !== t.tile.x || this.oreTile.y !== t.tile.y) && (t.direction = (-Math.atan2(this.oreTile.y - t.tile.y, this.oreTile.x - t.tile.x) * 180 / Math.PI - 90 + 720) % 360);
                  t.isHarvesting = !0;
                  return ((this.state = HARVESTING), this.children.push(new w.WaitMinutesTask(8 * this.game.rules.general.harvestRate)), !1);
                case HARVESTING: {
                  if (this.children.length) return !1;
                  // harvest until the slave's cargo is full (Storage=3 for slaves) or nearby ore is exhausted.
                  var cargoFull = t.harvesterTrait
                    ? t.harvesterTrait.isFull()
                    : (this.cargoCount ?? 0) >= (t.rules.storage ?? 4);
                  if (cargoFull) {
                    // capacity reached → head back to dump
                    t.harvesterTrait && (t.harvesterTrait.status = 0);
                    t.isHarvesting = !1;
                    t.isCarrying = !0;
                    return ((this.state = RETURNING), !1);
                  }
                  var a = this.game.map.getGroundObjectsOnTile(t.tile).find((e) => e.isOverlay() && e.isTiberium());
                  var ta = a && a.traits ? a.traits.get(b.TiberiumTrait) : void 0;
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
                    // still room and ore remains on this tile → keep harvesting here (paced)
                    if (!t.harvesterTrait?.isFull() && ta && 0 < ta.getBailCount())
                      return (this.children.push(new w.WaitMinutesTask(8 * this.game.rules.general.harvestRate)), !1);
                  }
                  // current tile exhausted (or none) and still has cargo room → check 8 neighbors
                  t.harvesterTrait && (t.harvesterTrait.status = 0);
                  t.isHarvesting = !1;
                  var nextTile = void 0;
                  var tile3 = t.tile;
                  var neighbors = [
                    this.game.map.tiles.getByMapCoords(tile3.rx - 1, tile3.ry),
                    this.game.map.tiles.getByMapCoords(tile3.rx + 1, tile3.ry),
                    this.game.map.tiles.getByMapCoords(tile3.rx, tile3.ry - 1),
                    this.game.map.tiles.getByMapCoords(tile3.rx, tile3.ry + 1),
                    this.game.map.tiles.getByMapCoords(tile3.rx - 1, tile3.ry - 1),
                    this.game.map.tiles.getByMapCoords(tile3.rx + 1, tile3.ry - 1),
                    this.game.map.tiles.getByMapCoords(tile3.rx - 1, tile3.ry + 1),
                    this.game.map.tiles.getByMapCoords(tile3.rx + 1, tile3.ry + 1),
                  ];
                  for (var ni = 0; ni < neighbors.length; ni++) {
                    var nt = neighbors[ni];
                    if (nt && nt.landType === l.LandType.Tiberium && 0 < this.game.map.terrain.getPassableSpeed(nt, t.rules.speedType, !0, !1)) {
                      var no = this.game.map.getGroundObjectsOnTile(nt).find(function(e) { return e.isOverlay() && e.isTiberium(); });
                      var ntt = no && no.traits ? no.traits.get(b.TiberiumTrait) : void 0;
                      if (ntt && 0 < ntt.getBailCount()) { nextTile = nt; break; }
                    }
                  }
                  if (nextTile)
                    return (
                      (this.oreTile = nextTile),
                      (t._oreLocked = !0),
                      (this.state = MOVING_TO_ORE),
                      this.children.push(new m.MoveTask(this.game, nextTile, !1)),
                      !1
                    );
                  // no more reachable ore nearby → return with whatever was gathered
                  t.isCarrying = !0;
                  return ((this.state = RETURNING), !1);
                }
                case RETURNING: {
                  if (this.children.length) {
                    // While walking to the miner, check if the miner moved; if so, re-path.
                    // Use a distance threshold so we don't cancel+restart the MoveTask every
                    // single tile when the miner is a driving vehicle — that leaves the slave
                    // stuck re-pathing forever and walking toward stale positions. Only re-path
                    // when the miner moved ≥3 tiles from the cached target.
                    if (this.miner && !this.miner.isDisposed && !this.miner.isDestroyed) {
                      var n = this.miner;
                      if (
                        this._returnDoorTile &&
                        (Math.abs(this._returnDoorTile.rx - n.tile.rx) >= 3 ||
                          Math.abs(this._returnDoorTile.ry - n.tile.ry) >= 3)
                      ) {
                        this._returnDoorTile = n.tile;
                        this.children = [];
                        this.children.push(
                          new m.MoveTask(this.game, n.tile, !1, { ignoredBlockers: [n] }),
                        );
                      }
                    }
                    return !1;
                  }
                  if (!this.miner || this.miner.isDisposed || this.miner.isDestroyed) return !0;
                  var n = this.miner;
                  // MoveTask finished (or first entry) — check if we actually reached the miner.
                  // If not (miner moved, or just starting the return), walk toward the current tile.
                  if (
                    !this._returnDoorTile ||
                    t.tile.rx !== n.tile.rx ||
                    t.tile.ry !== n.tile.ry
                  ) {
                    this._returnDoorTile = n.tile;
                    this.children.push(
                      new m.MoveTask(this.game, n.tile, !1, { ignoredBlockers: [n] }),
                    );
                    return !1;
                  }
                  // Reached the miner's current tile → enter and dump
                  return (
                    (t._enteringMiner = !0),
                    (this.state = DUMPING),
                    !1
                  );
                }
                case DUMPING: {
                  if (this.children.length) return !1;
                  if (!this.miner || this.miner.isDisposed || this.miner.isDestroyed) return !0;
                  // If the miner moved away, go back to RETURNING instead of dumping at the old location
                  if (t.tile !== this.miner.tile) {
                    t._enteringMiner = void 0;
                    return (this.state = RETURNING), !1;
                  }
                  // First time: dump credits and hide slave for ~2 seconds (instead of destroy+respawn).
                  if (!this._hideTimerStarted) {
                    this._dump(t);
                    t._enteringMiner = void 0;
                    t.isCarrying = !1;
                    this._hideTimerStarted = !0;
                    if (t.warpedOutTrait) t.warpedOutTrait.setTimed(30, !1, this.game);
                    this.children.push(new w.WaitMinutesTask(2 / 60));
                    return !1;
                  }
                  // Wait complete: unhide and resume mining.
                  this._hideTimerStarted = !1;
                  if (t.warpedOutTrait && t.warpedOutTrait.isActive()) t.warpedOutTrait.expire(this.game);
                  this.state = EXITING_MINER;
                  this._exitTicks = 180;
                  return !1;
                }
                case EXITING_MINER: {
                  if (this.children.length) return !1;
                  if (!this.miner || this.miner.isDisposed || this.miner.isDestroyed) return !0;
                  // Timeout: if slave can't exit after ~3s, force teleport
                  if (this._exitTicks !== void 0 && --this._exitTicks <= 0) {
                    try {
                      var n2 = this.miner,
                        o2 = this.game.map,
                        d2 = t.rules.speedType,
                        ff2 = n2.getFoundation(),
                        finder2 = new r.RadialTileFinder(
                          o2.tiles, o2.mapBounds, n2.tile, ff2, 1, 4,
                          function(e) {
                            return 0 < o2.terrain.getPassableSpeed(e, d2, !0, !1) &&
                              Math.abs(e.z - n2.tile.z) < 2 &&
                              !o2.terrain.findObstacles({ tile: e, onBridge: void 0 }, t).length;
                          }
                        );
                      var forceTile = finder2.getNextTile();
                      if (forceTile) {
                        t.position = forceTile.center;
                        this._exitTicks = void 0;
                        this.state = SEEKING_ORE;
                        return !1;
                      }
                    } catch (er3) {}
                  }
                  // After dumping inside the miner, walk out to a free adjacent tile before resuming mining.
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
                    (this.state = SEEKING_ORE),
                    c ? (this.children.push(new m.MoveTask(this.game, c, !1)), !1) : !1
                  );
                }
              }
              return !1;
            }
            _dump(t) {
              var total = 0;
              try {
                // Value the full load by actual bail mix (ore + gems) so a slave that gathered
                // both tiberium types is paid correctly. Falls back to the legacy single-type
                // cargo fields if the harvesterTrait is missing.
                var entries = t.harvesterTrait ? t.harvesterTrait.getBails() : [];
                if (!entries.length && void 0 !== this.cargo && 0 < (this.cargoCount ?? 0)) {
                  entries = [[this.cargo, this.cargoCount]];
                }
                var base = 0;
                for (var [type, count] of entries) {
                  var tr = this.game.rules.getTiberium(type);
                  base += (tr ? tr.value : 0) * count;
                }
                total = base;
                // OrePurifier bonus (vanilla: each powered OrePurifier owned by the miner's owner
                // adds floor(baseValue × general.purifierBonus)), matching ReturnOreTask.
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
              if (0 < total && this.miner && this.miner.owner) {
                this.miner.owner.credits += total;
                this.miner.owner.creditsGained += total;
              }
              // clear the cargo trait so the ore pip resets after dumping.
              t.harvesterTrait && t.harvesterTrait.empty();
              this.cargo = void 0;
              this.cargoCount = 0;
            }
          }),
        );
      },
    };
  },
);
