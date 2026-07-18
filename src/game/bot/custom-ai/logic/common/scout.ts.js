// === Custom AI module: game/bot/custom-ai/logic/common/scout ===
System.register("game/bot/custom-ai/logic/common/scout", ["game/api/index", "game/bot/custom-ai/logic/map/sector", "game/bot/custom-ai/logic/common/utils", "vendor/priority-queue"], function (e, t) {
  "use strict";
  t && t.id;
  var GameMath, Vector2, GameApi, PlayerData;
  var Sector, SectorCache, SECTOR_SIZE;
  var DebugLogger;
  var PriorityQueue;
  return {
    setters: [
      function (x) { GameMath = x.GameMath; Vector2 = x.Vector2; GameApi = x.GameApi; PlayerData = x.PlayerData; },
      function (x) { Sector = x.Sector; SectorCache = x.SectorCache; SECTOR_SIZE = x.SECTOR_SIZE; },
      function (x) { DebugLogger = x.DebugLogger; },
      function (x) { PriorityQueue = x.PriorityQueue; }
    ],
    execute: function () {
      var getUnseenStartingLocations = function (gameApi, playerData) {
        return gameApi.mapApi.getStartingLocations().filter(function (startingLocation) {
          if (startingLocation == playerData.startLocation) {
            return false;
          }
          var tile = gameApi.mapApi.getTile(startingLocation.x, startingLocation.y);
          return tile ? !gameApi.mapApi.isVisibleTile(tile, playerData.name) : false;
        });
      };
      e("getUnseenStartingLocations", getUnseenStartingLocations);

      var PrioritisedScoutTarget = (function () {
        function PrioritisedScoutTarget(priority, target, permanent) {
          this.permanent = permanent !== undefined ? permanent : false;
          if (target.hasOwnProperty("x") && target.hasOwnProperty("y")) {
            this._targetPoint = target;
          } else if (target.hasOwnProperty("sectorStartPoint")) {
            this._targetSector = target;
          } else {
            throw new TypeError("invalid object passed as target: " + target);
          }
          this._priority = priority;
        }

        Object.defineProperty(PrioritisedScoutTarget.prototype, "priority", {
          get: function () { return this._priority; }
        });

        PrioritisedScoutTarget.prototype.asVector2 = function () {
          return this._targetPoint || (this._targetSector ? this._targetSector.sectorStartPoint : null);
        };

        Object.defineProperty(PrioritisedScoutTarget.prototype, "targetSector", {
          get: function () { return this._targetSector; }
        });

        Object.defineProperty(PrioritisedScoutTarget.prototype, "isPermanent", {
          get: function () { return this.permanent; }
        });

        return PrioritisedScoutTarget;
      })();
      e("PrioritisedScoutTarget", PrioritisedScoutTarget);

      var ENEMY_SPAWN_POINT_PRIORITY = 100;
      var NEARBY_SECTOR_STARTING_RADIUS = 2;
      var NEARBY_SECTOR_BASE_PRIORITY = 1000;
      var SCOUTING_RADIUS_EXPANSION_TICKS = 9000;

      var ScoutingManager = (function () {
        function ScoutingManager(logger) {
          this.logger = logger;
          this.queuedRadius = NEARBY_SECTOR_STARTING_RADIUS;
          this.scoutingQueue = new PriorityQueue(
            function (a, b) { return b.priority - a.priority; }
          );
        }

        ScoutingManager.prototype.addRadiusToScout = function (gameApi, centerPoint, sectorCache, radius, startingPriority) {
          var startX = centerPoint.x, startY = centerPoint.y;
          var sectorsX = sectorCache.getSectorBounds().width, sectorsY = sectorCache.getSectorBounds().height;
          var startingSector = sectorCache.getSectorCoordinatesForWorldPosition(startX, startY);

          if (!startingSector) {
            return;
          }

          for (var x = Math.max(0, startingSector.sectorX - radius); x < Math.min(sectorsX, startingSector.sectorX + radius); ++x) {
            for (var y = Math.max(0, startingSector.sectorY - radius); y < Math.min(sectorsY, startingSector.sectorY + radius); ++y) {
              if (x === startingSector.sectorX && y === startingSector.sectorY) {
                continue;
              }
              var distanceFactor = GameMath.pow(x - startingSector.sectorX, 2) + GameMath.pow(y - startingSector.sectorY, 2);
              var sector = sectorCache.getSector(x, y);
              if (sector) {
                var points = [];
                points.push(sector.sectorStartPoint);
                points.push(
                  new Vector2(
                    sector.sectorStartPoint.x + Math.floor(SECTOR_SIZE / 2),
                    sector.sectorStartPoint.y + Math.floor(SECTOR_SIZE / 2)
                  )
                );
                points.push(
                  new Vector2(
                    Math.min(sector.sectorStartPoint.x + SECTOR_SIZE - 1, sectorCache.getMapBounds().width - 1),
                    Math.min(sector.sectorStartPoint.y + SECTOR_SIZE - 1, sectorCache.getMapBounds().height - 1)
                  )
                );

                points.forEach(function (pt) {
                  if (!gameApi.mapApi.getTile(pt.x, pt.y)) return;
                  var tgt = new PrioritisedScoutTarget(startingPriority - distanceFactor, pt);
                  this.scoutingQueue.enqueue(tgt);
                }.bind(this));
              }
            }
          }
        };

        ScoutingManager.prototype.ensureEnemyStartLocations = function (gameApi, playerData) {
          gameApi.mapApi
            .getStartingLocations()
            .filter(function (loc) { return loc !== playerData.startLocation; })
            .forEach(function (loc) {
              var tile = gameApi.mapApi.getTile(loc.x, loc.y);
              if (!tile) return;
              if (gameApi.mapApi.isVisibleTile(tile, playerData.name)) {
                return;
              }
              var existsInQueue = this.scoutingQueue
                .toArray()
                .some(function (t) {
                  var v = t.asVector2();
                  return v && v.x === loc.x && v.y === loc.y;
                });
              if (!existsInQueue) {
                this.logger("Re-queue unseen enemy spawn at " + loc.x + "," + loc.y);
                this.scoutingQueue.enqueue(new PrioritisedScoutTarget(ENEMY_SPAWN_POINT_PRIORITY, loc, true));
              }
            }.bind(this));
        };

        ScoutingManager.prototype.onGameStart = function (gameApi, playerData, sectorCache) {
          gameApi.mapApi
            .getStartingLocations()
            .filter(function (startingLocation) {
              if (startingLocation == playerData.startLocation) {
                return false;
              }
              var tile = gameApi.mapApi.getTile(startingLocation.x, startingLocation.y);
              return tile ? !gameApi.mapApi.isVisibleTile(tile, playerData.name) : false;
            })
            .map(function (tile) { return new PrioritisedScoutTarget(ENEMY_SPAWN_POINT_PRIORITY, tile, true); })
            .forEach(function (target) {
              this.logger("Adding " + target.asVector2().x + "," + target.asVector2().y + " to initial scouting queue");
              this.scoutingQueue.enqueue(target);
            }.bind(this));

          this.addRadiusToScout(
            gameApi,
            playerData.startLocation,
            sectorCache,
            NEARBY_SECTOR_STARTING_RADIUS,
            NEARBY_SECTOR_BASE_PRIORITY
          );
        };

        ScoutingManager.prototype.onAiUpdate = function (gameApi, playerData, sectorCache) {
          this.ensureEnemyStartLocations(gameApi, playerData);
          var currentHead = this.scoutingQueue.front();
          if (!currentHead) {
            return;
          }
          var head = currentHead.asVector2();
          if (!head) {
            this.scoutingQueue.dequeue();
            return;
          }
          var x = head.x, y = head.y;
          var tile = gameApi.mapApi.getTile(x, y);
          if (tile && gameApi.mapApi.isVisibleTile(tile, playerData.name)) {
            this.logger("head point is visible, dequeueing");
            this.scoutingQueue.dequeue();
          }

          var requiredRadius = Math.floor(gameApi.getCurrentTick() / SCOUTING_RADIUS_EXPANSION_TICKS);
          if (requiredRadius > this.queuedRadius) {
            this.logger("expanding scouting radius from " + this.queuedRadius + " to " + requiredRadius);
            this.addRadiusToScout(
              gameApi,
              playerData.startLocation,
              sectorCache,
              requiredRadius,
              NEARBY_SECTOR_BASE_PRIORITY
            );
            this.queuedRadius = requiredRadius;
          }
        };

        ScoutingManager.prototype.getNewScoutTarget = function () {
          return this.scoutingQueue.dequeue();
        };

        ScoutingManager.prototype.hasScoutTargets = function () {
          return !this.scoutingQueue.isEmpty();
        };

        return ScoutingManager;
      })();
      e("ScoutingManager", ScoutingManager);
    },
  };
});
