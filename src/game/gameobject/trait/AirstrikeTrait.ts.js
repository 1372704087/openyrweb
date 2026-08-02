// === Reconstructed SystemJS module: game/gameobject/trait/AirstrikeTrait ===
// deps: ["game/gameobject/unit/VeteranLevel","engine/type/ObjectType","game/gameobject/unit/ZoneType","game/gameobject/unit/FacingUtil","game/gameobject/task/move/MoveTask","game/gameobject/task/AttackTask","game/gameobject/task/system/TaskGroup","game/gameobject/task/system/CallbackTask","game/Coords","game/math/Vector2","game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/interface/NotifyDestroy","game/event/TriggerSoundFxEvent","game/rules/TechnoRules"]
// Note: Boris airstrike trait — the strike needs Boris's continuous laser
// guidance. If he moves or dies before the MiGs drop their bombs, the guidance
// is interrupted and the planes abandon the attack and head back; while they
// are still in the air, re-locking the target recalls them.
//   Update   — first trigger spawns the planes (Execute); a re-trigger after an
//              interruption recalls the planes (re-guide); switching targets
//              while some planes still carry a bomb redirects them; once every
//              plane has dropped its bomb the click locks the laser onto the
//              building and, after the old planes are destroyed and the
//              AirstrikeRechargeTime countdown, spawns the next wave.
//   Auto-lock — a building that survives a strike is re-locked automatically:
//              the bombardment keeps repeating until the building is destroyed.
//   Execute  — spawns the MiG team immediately and marks the target.
//   ChangeTarget — turns only the planes that still have a bomb onto a target;
//              spent planes keep flying off the map.
//   Cancel   — guidance broken: planes fly off the map (return), mission-aborted
//              voice plays; a re-lock before they leave recalls them.
//   Reset    — the strike resets once every MiG has flown off the map or been
//              destroyed; a new airstrike then waits for the recharge timer
//              (AirstrikeRechargeTime), like vanilla YR.

System.register(
  "game/gameobject/trait/AirstrikeTrait",
  [
    "game/gameobject/unit/VeteranLevel",
    "engine/type/ObjectType",
    "game/gameobject/unit/ZoneType",
    "game/gameobject/unit/FacingUtil",
    "game/gameobject/task/move/MoveTask",
    "game/gameobject/task/AttackTask",
    "game/gameobject/task/system/TaskGroup",
    "game/gameobject/task/system/CallbackTask",
    "game/Coords",
    "game/math/Vector2",
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/trait/interface/NotifyDestroy",
    "game/event/TriggerSoundFxEvent",
    "game/rules/TechnoRules",
  ],
  function (e, t) {
    "use strict";
    var n, s, a, o, l, c, h, u, d, g, p, m, r, x;
    t && t.id;
    return {
      setters: [
        function (e) { n = e; },
        function (e) { s = e; },
        function (e) { a = e; },
        function (e) { o = e; },
        function (e) { l = e; },
        function (e) { c = e; },
        function (e) { h = e; },
        function (e) { u = e; },
        function (e) { d = e; },
        function (e) { g = e; },
        function (e) { p = e; },
        function (e) { m = e; },
        function (e) { r = e; },
        function (e) { x = e; },
      ],
      execute: function () {
        var AirstrikeTrait = class {
          constructor() {
            this.cooldownTicks = 0;
            // Vanilla AirstrikeClass::Fired — 1 once planes have been spawned;
            // stays 1 until every plane has left (destroyed/exited the map).
            this.fired = false;
            // Guidance was broken (Boris moved / died before the bombs dropped) —
            // the planes are returning and a re-lock on the target can recall them.
            this.interrupted = false;
            // Ticks after firing during which movement is ignored, so the brief
            // deceleration right after the strike order does not cancel it.
            this._guideGraceTicks = 0;
            // A next strike has been requested while the last wave is still
            // flying off: the laser locks the building now, and the planes are
            // spawned once the AirstrikeRechargeTime countdown reaches zero.
            this.pendingLaunch = false;
            // Vanilla AirstrikeClass::TeamList — the planes currently in the
            // air for this strike.
            this.teamMiGs = [];
            // OpenYRWeb: target reference — set by execute/changeTarget, read by
            // AirstrikeLaserPlugin on the render side to draw the designator beam.
            this.targetObject = null;
            this.targetTile = null;
            // OpenYRWeb: "Target acquired!" voice played once when a MiG opens fire.
            this._targetAcquiredVoicePlayed = false;
            // OpenYRWeb: MiGs that already dropped their bomb (Ammo=1 — they are
            // spent and must not be re-targeted; they just keep flying off).
            this._migFired = new Set();
            // OpenYRWeb: MiGs that already played their death voice (MIGVoiceDie).
            this._migDeathVoiced = new Set();
            // Whether the airstrike is currently forcing Boris's attack animation
            // (so it is only cleared by this trait, not by normal attacks).
            this._guidanceAnimating = false;
          }

          isReady(gameObject) {
            // The strike resets only after the MiGs have flown off the map, and
            // a new airstrike then waits for the recharge timer (vanilla
            // AirstrikeRechargeTime). While a next strike is already pending
            // (laser locked, countdown running) further clicks stay allowed so
            // the lock can be moved to another building.
            if (this.cooldownTicks > 0 && !this.pendingLaunch) return false;
            var rules = gameObject.rules;
            if (!rules.airstrikeTeamType) return false;
            return true;
          }

          getAirstrikeTeam(gameObject) {
            var isElite = gameObject.veteranTrait && gameObject.veteranTrait.isElite();
            if (isElite) {
              return {
                count: gameObject.rules.eliteAirstrikeTeam || gameObject.rules.airstrikeTeam || 2,
                planeType: gameObject.rules.eliteAirstrikeTeamType || gameObject.rules.airstrikeTeamType,
                rechargeTime: gameObject.rules.eliteAirstrikeRechargeTime || gameObject.rules.airstrikeRechargeTime || 50,
              };
            }
            return {
              count: gameObject.rules.airstrikeTeam || 2,
              planeType: gameObject.rules.airstrikeTeamType,
              rechargeTime: gameObject.rules.airstrikeRechargeTime || 100,
            };
          }

          _hasArmedPlanes() {
            // True while at least one tracked plane still carries its bomb
            // (has not opened fire yet).
            for (var i = 0; i < this.teamMiGs.length; i++) {
              var mig = this.teamMiGs[i];
              if (!mig.isDestroyed && !mig.isCrashing && !this._migFired.has(mig.id)) {
                return true;
              }
            }
            return false;
          }

          _armPendingLaunch(gameObject, targetObj, targetTile) {
            // Lock the laser onto the given building and arm the next strike.
            // The actual planes are spawned later: first once the old planes
            // are gone, then after the AirstrikeRechargeTime countdown.
            this.pendingLaunch = true;
            this._guideGraceTicks = 15;
            if (this.targetObject) {
              this.targetObject.airstrikeLaserTarget = false;
            }
            this.targetObject = targetObj || null;
            this.targetTile = targetTile || null;
            if (this.targetObject) {
              this.targetObject.airstrikeLaserTarget = true;
            }
          }

          update(game, gameObject, targetObj, targetTile) {
            // Dispatcher (see 临时源码/boris_airstrike_reconstructed.cpp).
            //   !Fired                          → Execute (spawn the planes)
            //   guidance interrupted            → re-lock recalls the returning planes
            //   some planes still armed, different target → redirect them
            //   every plane spent (bomb dropped) → lock the laser and wait for
            //     the AirstrikeRechargeTime countdown, then spawn the next wave.
            if (!this.fired) {
              if (this.cooldownTicks > 0 && !this.pendingLaunch) return;
              this.execute(game, gameObject, targetObj, targetTile);
              return;
            }
            if (this.interrupted) {
              this.changeTarget(game, gameObject, targetObj, targetTile);
              return;
            }
            if (this._hasArmedPlanes()) {
              // Some planes still carry their bomb — a different building turns them.
              if (targetObj !== this.targetObject) {
                this.changeTarget(game, gameObject, targetObj, targetTile);
              }
              return;
            }
            // Every plane has already dropped its bomb and is leaving. This click
            // requests the next strike: the laser locks the building now. The
            // recharge countdown only starts once the old planes have all been
            // destroyed (see onTick), then the new wave spawns.
            this._armPendingLaunch(gameObject, targetObj, targetTile);
          }

          execute(game, gameObject, targetObj, targetTile) {
            // Vanilla AirstrikeClass::Execute — mark the strike as fired and
            // spawn the MiG team immediately. Planes from a previous wave that
            // are still flying off stay tracked (appended) so they are cleaned
            // up out of sight; _migFired is NOT cleared so spent planes never
            // get re-targeted.
            this.fired = true;
            this.interrupted = false;
            this._guideGraceTicks = 15;
            if (this.targetObject) {
              this.targetObject.airstrikeLaserTarget = false;
            }
            this.targetObject = targetObj || null;
            this.targetTile = targetTile || null;
            this._targetAcquiredVoicePlayed = false;
            this._migDeathVoiced.clear();
            // Mark the targeted building so the renderer tints it red.
            if (this.targetObject) {
              this.targetObject.airstrikeLaserTarget = true;
            }
            var oldMiGs = this.teamMiGs.filter(function (mig) { return !mig.isDestroyed; });
            var miGs = this.spawnMiGs(game, gameObject, targetTile, targetObj);
            if (miGs.length === 0 && oldMiGs.length === 0) {
              // No planes could be created and no previous wave is in the air —
              // abort so Boris can try again.
              this.fired = false;
              this.clearTarget();
              return;
            }
            this.teamMiGs = oldMiGs.concat(miGs);
          }

          changeTarget(game, gameObject, targetObj, targetTile) {
            // Redirect / recall the in-flight planes to a target. Only planes
            // that still have their bomb (have not opened fire yet) are turned —
            // spent planes keep flying off instead of making a pointless trip to
            // a target they can no longer damage.
            var redirected = false;
            var mapSize = game.map.tiles.getMapSize();
            for (var i = 0; i < this.teamMiGs.length; i++) {
              var mig = this.teamMiGs[i];
              if (mig.isDestroyed || mig.isCrashing || !mig.unitOrderTrait) continue;
              if (this._migFired.has(mig.id)) continue; // no bombs left
              redirected = true;
              mig.unitOrderTrait.cancelAllTasks();
              var attackTarget = targetObj && !targetObj.isDestroyed
                ? game.createTarget(targetObj, targetObj.tile)
                : game.createTarget(void 0, targetTile);
              // All planes leave over the player's own side of the map — behind
              // the base, off the map. The exit tile is also handed to the
              // AttackTask so the fighter banks toward it (at speed) right after
              // firing, instead of stopping mid-air and turning abruptly.
              var exitTile = this.computeExitTile(game, gameObject, targetTile, mapSize);
              var attackWeapon = mig.armedTrait ? mig.armedTrait.primaryWeapon : void 0;
              if (attackWeapon) {
                mig.unitOrderTrait.addTask(
                  new c.AttackTask(game, attackTarget, attackWeapon, { force: true, airstrikeExitTile: exitTile })
                );
              } else {
                mig.unitOrderTrait.addTask(
                  new l.MoveTask(game, targetTile, false, { allowOutOfBoundsTarget: true })
                );
              }
              mig.unitOrderTrait.addTask(
                new l.MoveTask(game, exitTile, false, { allowOutOfBoundsTarget: true })
              );
              mig.unitOrderTrait.addTask(
                new u.CallbackTask(function () {
                  if (!mig.isDestroyed) {
                    game.destroyObject(mig, { player: mig.owner, obj: mig });
                  }
                })
              );
            }
            if (!redirected) return; // every plane is spent — nothing to redirect
            this.interrupted = false;
            this._guideGraceTicks = 15;
            if (this.targetObject) {
              this.targetObject.airstrikeLaserTarget = false;
            }
            this.targetObject = targetObj || null;
            this.targetTile = targetTile || null;
            if (this.targetObject) {
              this.targetObject.airstrikeLaserTarget = true;
            }
            this._targetAcquiredVoicePlayed = false;
          }

          clearTarget() {
            // Clear the target reference and the red laser-tint flag.
            if (this.targetObject) {
              this.targetObject.airstrikeLaserTarget = false;
            }
            this.targetObject = null;
            this.targetTile = null;
          }

          spawnMiGs(game, gameObject, targetTile, targetObj) {
            var team = this.getAirstrikeTeam(gameObject);
            var migRules;
            try {
              migRules = game.rules.getObject(team.planeType, s.ObjectType.Aircraft);
            } catch (err) {
              console.warn(`AirstrikeTrait: Could not find aircraft type "${team.planeType}"`);
              return [];
            }
            var mapSize = game.map.tiles.getMapSize();
            var miGs = [];
            // All planes of the strike spawn from ONE shared position (they come
            // in together from the same map edge), while each plane picks its OWN
            // random return exit — handed to the AttackTask so the fighter banks
            // toward it (at speed) right after firing, instead of stopping
            // mid-air and turning abruptly.
            var spawnPos = this.computeEdgeSpawnPosition(game, gameObject, targetTile, mapSize, 0, team.count);
            for (var i = 0; i < team.count; i++) {
              var mig = game.createUnitForPlayer(migRules, gameObject.owner);
              game.spawnObject(mig, spawnPos.tile);
              // OpenYRWeb: the plane destroys itself the moment it is off the map —
              // independent of Boris's lifetime (see OutOfBoundsCleanupTrait above).
              game.addObjectTrait(mig, new OutOfBoundsCleanupTrait());
              mig.position.tileElevation = d.Coords.worldToTileHeight(
                mig.rules.flightLevel ?? game.rules.general.flightLevel
              );
              mig.zone = a.ZoneType.Air;
              mig.onBridge = false;
              mig.direction = o.FacingUtil.fromMapCoords(
                new g.Vector2(targetTile.rx - spawnPos.tile.rx, targetTile.ry - spawnPos.tile.ry)
              );
              var attackTarget = targetObj && !targetObj.isDestroyed
                ? game.createTarget(targetObj, targetObj.tile)
                : game.createTarget(void 0, targetTile);
              var exitTile = this.computeExitTile(game, gameObject, targetTile, mapSize);
              var attackWeapon = mig.armedTrait ? mig.armedTrait.primaryWeapon : void 0;
              if (attackWeapon) {
                mig.unitOrderTrait.addTask(
                  new c.AttackTask(game, attackTarget, attackWeapon, { force: true, airstrikeExitTile: exitTile })
                );
              } else {
                mig.unitOrderTrait.addTask(
                  new l.MoveTask(game, targetTile, false, { allowOutOfBoundsTarget: true })
                );
              }
              mig.unitOrderTrait.addTask(
                new l.MoveTask(game, exitTile, false, { allowOutOfBoundsTarget: true })
              );
              mig.unitOrderTrait.addTask(
                new u.CallbackTask(function () {
                  if (!mig.isDestroyed) {
                    game.destroyObject(mig, { player: mig.owner, obj: mig });
                  }
                })
              );
              miGs.push(mig);
            }
            // Vanilla YR: play the unit's airstrike voice when the planes spawn
            // ("MiG's on the way" — Boris's line). Configurable via
            // [AudioVisual] AirstrikeAttackVoice, falls back to
            // VoiceSecondaryWeaponAttack.
            var voice =
              (game.rules && game.rules.audioVisual && game.rules.audioVisual.airstrikeAttackVoice) ||
              gameObject.rules.voiceSecondaryWeaponAttack;
            if (voice) {
              game.events.dispatch(new r.TriggerSoundFxEvent(voice, gameObject.tile));
            }
            return miGs;
          }

          findMainBaseTile(gameObject) {
            // The player's main base — the primary construction-yard factory,
            // falling back to the first surviving Construction Yard. Planes
            // fly in from the map edge nearest to this tile.
            var owner = gameObject.owner;
            if (!owner) return null;
            var primary = owner.production && x.FactoryType
              ? owner.production.getPrimaryFactory(x.FactoryType.BuildingType)
              : null;
            if (primary && !primary.isDestroyed && primary.tile) return primary.tile;
            if (owner.buildings) {
              for (var b of owner.buildings) {
                if (b && !b.isDestroyed && b.rules && b.rules.constructionYard) {
                  return b.tile;
                }
              }
            }
            return null;
          }

          computeEdgeSpawnPosition(game, gameObject, targetTile, mapSize, index, total) {
            // Pick the map edge closest to the player's main base, so the planes
            // fly in from the base's side of the map (vanilla behaviour). If no
            // base exists, fall back to the player's start position defined in
            // the map file, and finally to the target's edge.
            var anchorTile = this.findMainBaseTile(gameObject);
            if (!anchorTile) {
              var owner = gameObject.owner;
              if (owner && owner.startLocation != null && game.map.startingLocations) {
                var loc = game.map.startingLocations[owner.startLocation];
                if (loc) {
                  anchorTile =
                    game.map.tiles.getByMapCoords(loc.x, loc.y) ||
                    game.map.tiles.getPlaceholderTile(loc.x, loc.y);
                }
              }
            }
            anchorTile = anchorTile || targetTile;
            // The planes spawn from one of the two NEAREST edges (nearest
            // horizontal / nearest vertical), with random along-edge and
            // inward-depth offsets — the spawn point is not a fixed predictable
            // spot that enemies could camp. The offsets must be whole tiles
            // (TileCollection.getByMapCoords indexes a flat array by
            // x + y*width, so a fractional tile wraps to an unrelated tile).
            var edgeSpread = 8; // random along-edge offset (tiles)
            var depth = Math.floor(game.generateRandom() * 4); // 0..3 tiles inward (kept in-bounds for the octree)
            var randRy = Math.max(
              0,
              Math.min(mapSize.height - 1, anchorTile.ry + Math.round((game.generateRandom() * 2 - 1) * edgeSpread)),
            );
            var randRx = Math.max(
              0,
              Math.min(mapSize.width - 1, anchorTile.rx + Math.round((game.generateRandom() * 2 - 1) * edgeSpread)),
            );
            var left = { edgeX: depth, edgeY: randRy, verticalEdge: true };
            var right = { edgeX: mapSize.width - 1 - depth, edgeY: randRy, verticalEdge: true };
            var top = { edgeX: randRx, edgeY: depth, verticalEdge: false };
            var bottom = { edgeX: randRx, edgeY: mapSize.height - 1 - depth, verticalEdge: false };
            var horizontal = anchorTile.rx < mapSize.width / 2 ? left : right; // nearest horizontal edge
            var vertical = anchorTile.ry < mapSize.height / 2 ? top : bottom; // nearest vertical edge
            var chosen = [horizontal, vertical][Math.floor(game.generateRandom() * 2)];
            var edgeX = Math.max(0, Math.min(Math.round(chosen.edgeX), mapSize.width - 1));
            var edgeY = Math.max(0, Math.min(Math.round(chosen.edgeY), mapSize.height - 1));
            var verticalEdge = chosen.verticalEdge;
            // If the slot is inside a building (e.g. an Airforce Command sitting
            // right on the map border, or the base itself), step along the edge
            // to the nearest free tile so the planes never appear on a building.
            var tile = this.findFreeEdgeSlot(game, edgeX, edgeY, mapSize, verticalEdge);
            if (!tile) {
              tile = game.map.tiles.getPlaceholderTile(edgeX, edgeY);
            }
            return { tile: tile };
          }

          findFreeEdgeSlot(game, edgeX, edgeY, mapSize, verticalEdge) {
            // Walk the map edge starting at the given slot, alternating above
            // and below (or left/right), until a tile that is not inside an
            // undestroyed building is found.
            var axisMax = verticalEdge ? mapSize.height : mapSize.width;
            for (var i = 0; i < axisMax; i++) {
              var delta = i % 2 === 0 ? i / 2 : -(i + 1) / 2;
              var x = verticalEdge ? edgeX : Math.max(0, Math.min(edgeX + delta, mapSize.width - 1));
              var y = verticalEdge ? Math.max(0, Math.min(edgeY + delta, mapSize.height - 1)) : edgeY;
              var tile = game.map.tiles.getByMapCoords(x, y);
              if (
                tile &&
                !game.map
                  .getGroundObjectsOnTile(tile)
                  .some(function (e) {
                    return e.isBuilding() && !e.isDestroyed;
                  })
              ) {
                return tile;
              }
            }
            return null;
          }

          computeExitTile(game, gameObject, targetTile, mapSize) {
            // Planes return to an off-map exit near the player's base, picked at
            // random from the two NEAREST edges only: the nearest horizontal edge
            // (left/right) and the nearest vertical edge (top/bottom), projected
            // straight out from the base tile. Without a base it falls back to a
            // random edge.
            var anchorTile = this.findMainBaseTile(gameObject);
            if (!anchorTile) {
              var owner = gameObject.owner;
              if (owner && owner.startLocation != null && game.map.startingLocations) {
                var loc = game.map.startingLocations[owner.startLocation];
                if (loc) {
                  anchorTile =
                    game.map.tiles.getByMapCoords(loc.x, loc.y) ||
                    game.map.tiles.getPlaceholderTile(loc.x, loc.y);
                }
              }
            }
            var offset = 12; // tiles past the map edge
            if (!anchorTile) {
              var dir = Math.floor(game.generateRandom() * 4);
              var rx, ry;
              switch (dir) {
                case 0: rx = -offset; ry = Math.floor(game.generateRandom() * mapSize.height); break;
                case 1: rx = mapSize.width - 1 + offset; ry = Math.floor(game.generateRandom() * mapSize.height); break;
                case 2: rx = Math.floor(game.generateRandom() * mapSize.width); ry = -offset; break;
                default: rx = Math.floor(game.generateRandom() * mapSize.width); ry = mapSize.height - 1 + offset; break;
              }
              return game.map.tiles.getPlaceholderTile(rx, ry);
            }
            var ax = anchorTile.rx,
              ay = anchorTile.ry;
            // Random offsets on both perpendicular axes — the two legs of the
            // right triangle formed by the base and the exit — so the exit point
            // is never a fixed predictable spot that enemies could camp. The exit
            // is still chosen from the two NEAREST directions only (the nearest
            // horizontal edge and the nearest vertical edge), but its position
            // along the edge and its depth are random.
            var edgeSpread = 8; // random along-edge offset (tiles)
            var depth = 12 + Math.floor(game.generateRandom() * 5); // 12..16 tiles past the edge
            var exitRy = Math.max(0, Math.min(mapSize.height - 1, ay + (game.generateRandom() * 2 - 1) * edgeSpread));
            var exitRx = Math.max(0, Math.min(mapSize.width - 1, ax + (game.generateRandom() * 2 - 1) * edgeSpread));
            var horizontal =
              ax < mapSize.width / 2
                ? { rx: -depth, ry: exitRy } // nearest horizontal: left
                : { rx: mapSize.width - 1 + depth, ry: exitRy }; // nearest horizontal: right
            var vertical =
              ay < mapSize.height / 2
                ? { rx: exitRx, ry: -depth } // nearest vertical: top
                : { rx: exitRx, ry: mapSize.height - 1 + depth }; // nearest vertical: bottom
            var pick = [horizontal, vertical][Math.floor(game.generateRandom() * 2)];
            return game.map.tiles.getPlaceholderTile(pick.rx, pick.ry);
          }

          cancel(game, gameObject) {
            // Guidance was broken (Boris moved before the bombs dropped, or he
            // died) — command every plane to abandon the attack and head back
            // (fly off the map and self-destruct), and play the mission-aborted
            // voice. Fired stays 1 until the last plane has left; while the
            // planes are still in the air a re-lock (update → changeTarget)
            // can recall them. Used when Boris moves or dies.
            this.interrupted = true;
            this.playAbortVoice(game, gameObject);
            var mapSize = game.map.tiles.getMapSize();
            for (var i = 0; i < this.teamMiGs.length; i++) {
              var mig = this.teamMiGs[i];
              if (!mig.isDestroyed && !mig.isCrashing && mig.unitOrderTrait) {
                mig.unitOrderTrait.cancelAllTasks();
                var exitTile = this.computeExitTile(game, gameObject, null, mapSize);
                mig.unitOrderTrait.addTask(
                  new l.MoveTask(game, exitTile, false, { allowOutOfBoundsTarget: true })
                );
                mig.unitOrderTrait.addTask(
                  new u.CallbackTask(function () {
                    if (!mig.isDestroyed) {
                      game.destroyObject(mig, { player: mig.owner, obj: mig });
                    }
                  })
                );
              }
            }
            this.clearTarget();
          }

          playAbortVoice(game, gameObject) {
            // "Mission Aborted" — mission-aborted voice. Sound is the vanilla
            // [MIGMissionAborted], configurable via [AudioVisual] AirstrikeAbortSound.
            var av =
              (game.rules && game.rules.audioVisual && game.rules.audioVisual.airstrikeAbortSound) ||
              "MIGMissionAborted";
            if (av) {
              game.events.dispatch(new r.TriggerSoundFxEvent(av, gameObject.tile));
            }
          }

          [p.NotifyTick.onTick](gameObject, game) {
            if (this.cooldownTicks > 0) {
              this.cooldownTicks--;
              if (this.cooldownTicks === 0 && this.pendingLaunch) {
                // AirstrikeRechargeTime is over — launch the next wave on the
                // building that is currently locked by the laser.
                this.pendingLaunch = false;
                if (this.targetObject || this.targetTile) {
                  this.execute(game, gameObject, this.targetObject, this.targetTile);
                }
              }
            }
            if (this._guideGraceTicks > 0) {
              this._guideGraceTicks--;
            }
            // Boris stopped guiding by moving. Until the MiGs drop their bombs
            // the strike depends on the laser, so the planes abandon the attack
            // and head back (a re-lock can still recall them). Once the bombs
            // have been dropped the strike is committed — only the beam and the
            // building's red tint are dropped (and a pending re-launch lock is
            // dropped as well).
            if (
              this.fired &&
              !this.interrupted &&
              this.targetObject &&
              this._guideGraceTicks <= 0 &&
              gameObject.moveTrait &&
              gameObject.moveTrait.isMoving()
            ) {
              if (!this._targetAcquiredVoicePlayed) {
                this.cancel(game, gameObject);
              } else {
                this.pendingLaunch = false;
                this.clearTarget();
              }
            }
            // Boris plays his dedicated secondary-fire (Flare hand-raise) sequence
            // and faces the locked building while he is guiding the laser (strike
            // in progress or a pending re-launch waiting for its countdown).
            if (this.targetObject && !gameObject.isMoving) {
              gameObject.isFiring = true;
              gameObject.isFiringSecondary = true;
              this._guidanceAnimating = true;
              var tPos = this.targetObject.position.worldPosition;
              var sPos = gameObject.position.worldPosition;
              gameObject.direction = o.FacingUtil.fromMapCoords(
                new g.Vector2(tPos.x - sPos.x, tPos.z - sPos.z)
              );
            } else if (this._guidanceAnimating) {
              // Only clear the animation when the airstrike itself set it —
              // a normal attack must not be interrupted.
              gameObject.isFiring = false;
              gameObject.isFiringSecondary = false;
              this._guidanceAnimating = false;
            }
            // "Target acquired!" — play once when the first MiG opens fire, and
            // remember every plane that has dropped its bomb (spent planes must
            // not be re-targeted later).
            // AttackState: Firing=4, JustFired=5.
            // Sound is the vanilla [MIGAttackVoice] (random vmigata/vmigatb),
            // configurable via [AudioVisual] AirstrikeTargetAcquiredSound.
            var anyFiring = false;
            var firstFiringMig = null;
            for (var i = 0; i < this.teamMiGs.length; i++) {
              var mig = this.teamMiGs[i];
              if (!mig.isDestroyed && mig.attackTrait && (mig.attackTrait.attackState === 4 || mig.attackTrait.attackState === 5)) {
                this._migFired.add(mig.id);
                if (!anyFiring) {
                  anyFiring = true;
                  firstFiringMig = mig;
                }
              }
            }
            if (!this._targetAcquiredVoicePlayed && anyFiring) {
              this._targetAcquiredVoicePlayed = true;
              var tav =
                (game.rules && game.rules.audioVisual && game.rules.audioVisual.airstrikeTargetAcquiredSound) ||
                "MIGAttackVoice";
              if (tav && firstFiringMig) {
                // Play at the MiG's position — the voice belongs to the plane.
                game.events.dispatch(new r.TriggerSoundFxEvent(tav, firstFiringMig.tile));
              }
            }
            // "MiG going down!" — play once per MiG when it starts crashing.
            // If the plane has its own VoiceCrashing configured (e.g.
            // [BPLN] VoiceCrashing=MigVoiceDie), the SoundHandler's
            // ObjectCrashing handler already plays it — skip to avoid
            // double playback. Otherwise use [AudioVisual] AirstrikeDeathSound
            // (fallback [MIGVoiceDie]).
            for (var j = 0; j < this.teamMiGs.length; j++) {
              var m2 = this.teamMiGs[j];
              if (m2.isCrashing && !this._migDeathVoiced.has(m2.id)) {
                this._migDeathVoiced.add(m2.id);
                if (!m2.rules.voiceCrashing) {
                  var dv =
                    (game.rules && game.rules.audioVisual && game.rules.audioVisual.airstrikeDeathSound) ||
                    "MIGVoiceDie";
                  if (dv && !m2.isDestroyed) {
                    game.events.dispatch(new r.TriggerSoundFxEvent(dv, m2.tile));
                  }
                }
              }
            }
            // The designated building was destroyed before any MiG opened fire —
            // abort the strike (mission-aborted voice); the planes fly off on
            // their own once their attack target is gone.
            if (this.targetObject && this.targetObject.isDestroyed) {
              if (this.fired && !this._targetAcquiredVoicePlayed) {
                this.playAbortVoice(game, gameObject);
                this._targetAcquiredVoicePlayed = true;
              }
              this.clearTarget();
            }
            // A building that survived the strike is automatically re-locked:
            // keep bombing it until it is destroyed — no manual re-click needed.
            if (
              this.fired &&
              !this.interrupted &&
              !this.pendingLaunch &&
              this.targetObject &&
              !this.targetObject.isDestroyed &&
              !this._hasArmedPlanes()
            ) {
              this._armPendingLaunch(gameObject, this.targetObject, this.targetTile);
            }
            // Planes that have flown beyond the map bounds are cleaned up out of
            // sight. The exit MoveTask alone is not enough — the aircraft cannot
            // "stop" on an out-of-bounds placeholder tile, so it gets relocated
            // back onto an in-bounds edge tile and explodes visibly at the map
            // boundary. Destroy them here instead, once they are clearly off-map.
            var mapSize = game.map.tiles.getMapSize();
            var exitMargin = 4; // tiles past the edge
            for (var m = 0; m < this.teamMiGs.length; m++) {
              var mm = this.teamMiGs[m];
              if (!mm.isDestroyed && !mm.isCrashing && mm.tile) {
                var tt = mm.tile;
                if (
                  tt.rx < -exitMargin ||
                  tt.ry < -exitMargin ||
                  tt.rx > mapSize.width - 1 + exitMargin ||
                  tt.ry > mapSize.height - 1 + exitMargin
                ) {
                  game.destroyObject(mm, { player: mm.owner, obj: mm });
                }
              }
            }
            // Drop destroyed planes from the team. The strike resets only once
            // every MiG has flown off the map (they self-destruct after exiting)
            // or has been destroyed — then the recharge timer starts (vanilla
            // ReleaseTarget → Fired=0, followed by the AirstrikeRechargeTime).
            var anyRemoved = false;
            this.teamMiGs = this.teamMiGs.filter(function (mig) {
              if (mig.isDestroyed) {
                anyRemoved = true;
                return false;
              }
              return true;
            });
            // Once every old plane is gone, a pending next strike starts its
            // recharge countdown (the laser keeps the lock meanwhile).
            if (this.pendingLaunch && this.teamMiGs.length === 0 && this.cooldownTicks <= 0) {
              this.cooldownTicks = this.getAirstrikeTeam(gameObject).rechargeTime;
            }
            // The normal strike reset is skipped while a next strike is pending
            // (the pending countdown is handled above and the laser holds the lock).
            if (anyRemoved && this.teamMiGs.length === 0 && this.fired && !this.pendingLaunch) {
              this.fired = false;
              this.interrupted = false;
              this._guideGraceTicks = 0;
              var team = this.getAirstrikeTeam(gameObject);
              this.cooldownTicks = team.rechargeTime;
              this.clearTarget();
            }
          }

          [m.NotifyDestroy.onDestroy](gameObject, game) {
            // Boris died — cancel the strike (planes fly off the map). If no
            // planes are in the air, still play the mission-aborted voice.
            if (this.fired && this.teamMiGs.length > 0) {
              this.cancel(game, gameObject);
            } else if (this.fired) {
              this.playAbortVoice(game, gameObject);
              this.fired = false;
              this.clearTarget();
            }
          }

          dispose() {
            this.teamMiGs = [];
            this.pendingLaunch = false;
            this._migFired.clear();
            this.activeLaser = null;
          }
        };

        // OpenYRWeb: per-MiG off-map cleanup. The out-of-bounds destruction used
        // to live only in Boris's AirstrikeTrait.onTick — that tick stops running
        // the moment Boris dies, so a plane already on its exit run could fly past
        // the map edge and never be destroyed (and the strike state would never
        // reset). Attaching this tiny NotifyTick trait to each spawned MiG makes
        // the cleanup independent of Boris: the plane destroys itself the moment
        // it is clearly off the map, whether Boris is alive, dead, or moved away.
        var OutOfBoundsCleanupTrait = class {
          constructor() {
            this.enabled = true;
          }
          setEnabled(e) {
            this.enabled = e;
          }
          [p.NotifyTick.onTick](gameObject, game) {
            if (!this.enabled || gameObject.isDestroyed || gameObject.isCrashing || !gameObject.tile) return;
            var mapSize = game.map.tiles.getMapSize();
            var exitMargin = 4; // tiles past the edge — same margin as AirstrikeTrait.onTick
            var tt = gameObject.tile;
            if (
              tt.rx < -exitMargin ||
              tt.ry < -exitMargin ||
              tt.rx > mapSize.width - 1 + exitMargin ||
              tt.ry > mapSize.height - 1 + exitMargin
            ) {
              game.destroyObject(gameObject, { player: gameObject.owner, obj: gameObject });
            }
          }
        };
        e("AirstrikeTrait", AirstrikeTrait);
      },
    };
  },
);
