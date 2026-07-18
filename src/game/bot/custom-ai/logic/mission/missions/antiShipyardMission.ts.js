// === Custom AI module: game/bot/custom-ai/logic/mission/missions/antiShipyardMission ===
System.register("game/bot/custom-ai/logic/mission/missions/antiShipyardMission", ["game/api/index", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/mission/mission", "game/bot/custom-ai/logic/mission/actionBatcher", "game/bot/custom-ai/logic/common/utils", "game/bot/custom-ai/logic/mission/missionFactories", "game/bot/custom-ai/logic/mission/missionController"], function (e, t) {
  "use strict";
  var ActionsApi, OrderType, GameApi, PlayerData, Vector2, SideType, SpeedType, LandType;
  var Mission, requestUnits, noop, disbandMission;
  var ActionBatcher, BatchableAction;
  var DebugLogger, countBy;
  t && t.id;
  return {
    setters: [
      function (A) {
        ActionsApi = A.ActionsApi;
        OrderType = A.OrderType;
        GameApi = A.GameApi;
        PlayerData = A.PlayerData;
        Vector2 = A.Vector2;
        SideType = A.SideType;
        SpeedType = A.SpeedType;
        LandType = A.LandType;
      },
      function () {},
      function (C) {
        Mission = C.Mission;
        requestUnits = C.requestUnits;
        noop = C.noop;
        disbandMission = C.disbandMission;
      },
      function (D) {
        ActionBatcher = D.ActionBatcher;
        BatchableAction = D.BatchableAction;
      },
      function (E) {
        DebugLogger = E.DebugLogger;
        countBy = E.countBy;
      },
      function () {},
      function () {},
    ],
    execute: function () {

      var AntiShipyardMission = /** @class */ (function (Mission) {
        function AntiShipyardMission(uniqueName, targetPos, requiredUnits, logger) {
          Mission.call(this, uniqueName, logger);
          this.targetPos = targetPos;
          this.rallyPoint = targetPos;
          this.requiredUnits = requiredUnits;
          this.shipyardId = null;
          this.stage = "gather";
          this.patrolPoints = [];
          this.currentPatrolIdx = 0;
          this.lastHostileTick = 0;
          this.initialized = false;
          this.lastRepositionTick = 0;
        }
        AntiShipyardMission.prototype = Object.create(Mission.prototype);
        AntiShipyardMission.prototype.constructor = AntiShipyardMission;

        AntiShipyardMission.prototype.hasClearWaterLoS = function (gameApi, from, to, corridorHalfWidth) {
          if (corridorHalfWidth === void 0) { corridorHalfWidth = 1; }
          var dx = to.x - from.x;
          var dy = to.y - from.y;
          var steps = Math.max(Math.abs(dx), Math.abs(dy));
          if (steps === 0) return true;
          for (var i = 0; i <= steps; i++) {
            var cx = Math.round(from.x + (dx * i) / steps);
            var cy = Math.round(from.y + (dy * i) / steps);
            for (var ox = -corridorHalfWidth; ox <= corridorHalfWidth; ox++) {
              for (var oy = -corridorHalfWidth; oy <= corridorHalfWidth; oy++) {
                var tx = cx + ox;
                var ty = cy + oy;
                var tile = gameApi.mapApi.getTile(tx, ty);
                if (!tile) return false;
                if ((tile.landType !== LandType.Clear && tile.landType !== LandType.Water) || tile.onBridgeLandType !== undefined) return false;
              }
            }
          }
          return true;
        };

        AntiShipyardMission.prototype.findWaterFiringPoint = function (gameApi, radiusMin, radiusMax, attempts) {
          if (attempts === void 0) { attempts = 10; }
          for (var attempt = 0; attempt < attempts; attempt++) {
            var ang = gameApi.generateRandom() * Math.PI * 2;
            var radius = radiusMin + gameApi.generateRandom() * (radiusMax - radiusMin);
            var dest = this.targetPos.add(new Vector2(Math.round(Math.cos(ang) * radius), Math.round(Math.sin(ang) * radius)));
            var tile = gameApi.mapApi.getTile(dest.x, dest.y);
            if (!tile) continue;
            if (tile.landType !== LandType.Water || tile.onBridgeLandType !== undefined) continue;
            if (!this.hasClearWaterLoS(gameApi, dest, this.targetPos)) continue;
            return dest;
          }
          return null;
        };

        AntiShipyardMission.prototype.pushToPointSafe = function (gameApi, actionBatcher, unitId, orderType, point) {
          if (gameApi.mapApi.getTile(point.x, point.y)) {
            actionBatcher.push(BatchableAction.toPoint(unitId, orderType, point));
          }
        };

        AntiShipyardMission.prototype.getPriority = function () { return 80; };
        AntiShipyardMission.prototype.isUnitsLocked = function () { return false; };
        AntiShipyardMission.prototype.getGlobalDebugText = function () { return "AntiShipyard \u2192 (" + this.targetPos.x + "," + this.targetPos.y + ")"; };

        AntiShipyardMission.prototype._onAiUpdate = function (gameApi, actionsApi, playerData, matchAwareness, actionBatcher) {
          if (!this.initialized) {
            var squadUnits = this.getUnits(gameApi);
            var startPos = this.targetPos;
            var ourShipyards = gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.name === "GAYARD" || r.name === "NAYARD" || r.name === "YAYARD"; });
            if (ourShipyards.length > 0) {
              var ourYard = gameApi.getUnitData(ourShipyards[0]);
              if (ourYard) startPos = new Vector2(ourYard.tile.rx, ourYard.tile.ry);
            }
            if (squadUnits.length > 0) {
              var firstUnit = squadUnits[0];
              startPos = new Vector2(firstUnit.tile.rx, firstUnit.tile.ry);
            }
            var startTile = gameApi.mapApi.getTile(startPos.x, startPos.y);
            var endTile = gameApi.mapApi.getTile(this.targetPos.x, this.targetPos.y);
            var mid = startPos;
            if (startTile && endTile) {
              var path = gameApi.mapApi.findPath(SpeedType.Float, false, { tile: startTile, onBridge: false }, { tile: endTile, onBridge: false });
              if (path && path.length > 2) {
                var midNode = path[Math.floor(path.length / 5 * 4)];
                mid = new Vector2(midNode.tile.rx, midNode.tile.ry);
              }
            }
            this.rallyPoint = mid;
            this.initialized = true;
          }

          var currentComp = countBy(this.getUnitsGameObjectData(gameApi), function (u) { return u.name; });
          var missing = Object.entries(this.requiredUnits).filter(function (_a) {
            var unitName = _a[0], want = _a[1];
            return (currentComp[unitName] || 0) < want;
          });

          if (missing.length > 0) {
            return requestUnits(missing.map(function (_a) { return _a[0]; }), this.getPriority());
          }

          var SIGHT_RADIUS = 12;
          var squadUnits = this.getUnits(gameApi);

          if (this.stage === "gather") {
            var allClose = squadUnits.every(function (u) { return new Vector2(u.tile.rx, u.tile.ry).distanceTo(this.rallyPoint) <= 4; }, this);
            if (!allClose) {
              squadUnits.forEach(function (u) { this.pushToPointSafe(gameApi, actionBatcher, u.id, OrderType.Move, this.rallyPoint); }, this);
              return noop();
            }
            if (this.patrolPoints.length === 0) {
              for (var i = 0; i < 3; i++) {
                var ang = (Math.PI * 2 * i) / 3;
                var pt = this.targetPos.add(new Vector2(Math.round(Math.cos(ang) * 6), Math.round(Math.sin(ang) * 6)));
                this.patrolPoints.push(pt);
              }
            }
            this.stage = "approach";
            this.lastHostileTick = gameApi.getCurrentTick();
          }

          if (this.stage === "approach") {
            var nearShipyard = squadUnits.every(function (u) { return new Vector2(u.tile.rx, u.tile.ry).distanceTo(this.targetPos) <= SIGHT_RADIUS; }, this);
            if (nearShipyard) {
              this.stage = "patrol";
            } else {
              squadUnits.forEach(function (u) { this.pushToPointSafe(gameApi, actionBatcher, u.id, OrderType.AttackMove, this.targetPos); }, this);
              return noop();
            }
          }

          var hostiles = matchAwareness.getHostilesNearPoint2d(this.targetPos, SIGHT_RADIUS);
          if (hostiles.length > 0) this.lastHostileTick = gameApi.getCurrentTick();

          if (this.stage === "patrol") {
            var nearbyEnemyNaval = gameApi.getVisibleUnits(playerData.name, "enemy")
              .map(function (id) { return gameApi.getUnitData(id); })
              .filter(function (unit) {
                if (!unit) return false;
                var distance = new Vector2(unit.tile.rx, unit.tile.ry).distanceTo(this.targetPos);
                return distance <= SIGHT_RADIUS && unit.rules.speedType === SpeedType.Float;
              }, this);

            if (nearbyEnemyNaval.length > 0) {
              this.lastHostileTick = gameApi.getCurrentTick();
              squadUnits.forEach(function (u) {
                var closestEnemy = nearbyEnemyNaval[0];
                var minDistance = new Vector2(u.tile.rx, u.tile.ry).distanceTo(new Vector2(closestEnemy.tile.rx, closestEnemy.tile.ry));
                for (var _i = 0, nearbyEnemyNaval_1 = nearbyEnemyNaval; _i < nearbyEnemyNaval_1.length; _i++) {
                  var enemy = nearbyEnemyNaval_1[_i];
                  var distance = new Vector2(u.tile.rx, u.tile.ry).distanceTo(new Vector2(enemy.tile.rx, enemy.tile.ry));
                  if (distance < minDistance) { closestEnemy = enemy; minDistance = distance; }
                }
                if (closestEnemy) { actionBatcher.push(BatchableAction.toTargetId(u.id, OrderType.Attack, closestEnemy.id)); }
              });
              return noop();
            }

            if (gameApi.getCurrentTick() - this.lastHostileTick > 45) {
              this.stage = "destroy";
            } else {
              squadUnits.forEach(function (u) {
                var jitter = new Vector2(gameApi.generateRandomInt(-2, 2), gameApi.generateRandomInt(-2, 2));
                var dest = this.targetPos.add(jitter);
                this.pushToPointSafe(gameApi, actionBatcher, u.id, OrderType.Move, dest);
              }, this);
              return noop();
            }
          }

          var visibleShipyards = gameApi.getVisibleUnits(playerData.name, "enemy", function (r) { return r.name === "GAYARD" || r.name === "NAYARD" || r.name === "YAYARD"; })
            .map(function (id) { return gameApi.getUnitData(id); })
            .filter(function (u) { return !!u; });

          var enemyNavalDestroy = gameApi.getVisibleUnits(playerData.name, "enemy")
            .map(function (id) { return gameApi.getUnitData(id); })
            .filter(function (unit) {
              if (!unit) return false;
              var distance = new Vector2(unit.tile.rx, unit.tile.ry).distanceTo(this.targetPos);
              return distance <= SIGHT_RADIUS && unit.rules.speedType === SpeedType.Float;
            }, this);

          if (enemyNavalDestroy.length > 0) {
            squadUnits.forEach(function (u) {
              var closest = enemyNavalDestroy[0];
              var minDist = new Vector2(u.tile.rx, u.tile.ry).distanceTo(new Vector2(closest.tile.rx, closest.tile.ry));
              for (var _i = 0, enemyNavalDestroy_1 = enemyNavalDestroy; _i < enemyNavalDestroy_1.length; _i++) {
                var e = enemyNavalDestroy_1[_i];
                var d = new Vector2(u.tile.rx, u.tile.ry).distanceTo(new Vector2(e.tile.rx, e.tile.ry));
                if (d < minDist) { closest = e; minDist = d; }
              }
              actionBatcher.push(BatchableAction.toTargetId(u.id, OrderType.Attack, closest.id));
            });
            return noop();
          }

          if (visibleShipyards.length > 0) {
            var target = visibleShipyards[0];
            squadUnits.forEach(function (u) {
              var unitPos = new Vector2(u.tile.rx, u.tile.ry);
              var clearLoS = this.hasClearWaterLoS(gameApi, unitPos, this.targetPos);
              if (clearLoS) {
                actionBatcher.push(BatchableAction.toTargetId(u.id, OrderType.Attack, target.id));
              } else {
                if (gameApi.getCurrentTick() - this.lastRepositionTick < 30) return;
                var newPos = this.findWaterFiringPoint(gameApi, 5, 8);
                if (newPos) {
                  this.pushToPointSafe(gameApi, actionBatcher, u.id, OrderType.AttackMove, newPos);
                  this.lastRepositionTick = gameApi.getCurrentTick();
                } else {
                  this.pushToPointSafe(gameApi, actionBatcher, u.id, OrderType.AttackMove, this.targetPos);
                }
              }
            }, this);
          } else {
            squadUnits.forEach(function (u) { this.pushToPointSafe(gameApi, actionBatcher, u.id, OrderType.AttackMove, this.targetPos); }, this);
          }

          return noop();
        };
        return AntiShipyardMission;
      }(Mission));
      e("AntiShipyardMission", AntiShipyardMission);

      var AntiShipyardMissionFactory = /** @class */ (function () {
        function AntiShipyardMissionFactory() {}
        AntiShipyardMissionFactory.prototype.maybeCreateMissions = function (gameApi, playerData, matchAwareness, missionController, logger) {
          if (missionController.getMissions().some(function (m) { return m instanceof AntiShipyardMission; })) return;
          var enemyShipyards = gameApi.getVisibleUnits(playerData.name, "enemy", function (r) { return r.name === "GAYARD" || r.name === "NAYARD" || r.name === "YAYARD"; });
          if (enemyShipyards.length === 0) return;
          var shipyardData = gameApi.getUnitData(enemyShipyards[0]);
          if (!shipyardData) return;
          var targetPos = new Vector2(shipyardData.tile.rx, shipyardData.tile.ry);
          var side = playerData.country ? playerData.country.side : undefined;
          var requiredUnits;
          if (side === SideType.Nod) requiredUnits = { SUB: 3 };
          else if (side === SideType.ThirdSide) requiredUnits = { BSUB: 3 };
          else requiredUnits = { DLPH: 5 };
          var mission = new AntiShipyardMission("antiShipyard_" + gameApi.getCurrentTick(), targetPos, requiredUnits, logger);
          missionController.addMission(mission);
        };
        AntiShipyardMissionFactory.prototype.getName = function () { return "AntiShipyardMissionFactory"; };
        AntiShipyardMissionFactory.prototype.onMissionFailed = function () {};
        return AntiShipyardMissionFactory;
      }());
      e("AntiShipyardMissionFactory", AntiShipyardMissionFactory);
    },
  };
});
