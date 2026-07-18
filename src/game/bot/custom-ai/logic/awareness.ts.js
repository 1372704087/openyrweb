// === Custom AI module: game/bot/custom-ai/logic/awareness ===
System.register("game/bot/custom-ai/logic/awareness", [
  "game/api/index",
  "game/bot/custom-ai/logic/map/sector",
  "game/bot/custom-ai/logic/threat/threat",
  "game/bot/custom-ai/logic/threat/threatCalculator",
  "game/bot/custom-ai/logic/map/map",
  "game/bot/custom-ai/logic/common/scout"
], function (e, t) {
  "use strict";
  var A, SectorMod, ThreatMod, ThreatCalc, MapMod, ScoutMod;
  t && t.id;
  return {
    setters: [
      function (x) { A = x; },
      function (x) { SectorMod = x; },
      function (x) { ThreatMod = x; },
      function (x) { ThreatCalc = x; },
      function (x) { MapMod = x; },
      function (x) { ScoutMod = x; },
    ],
    execute: function () {
      var Vector2 = A.Vector2;
      var GlobalThreat = ThreatMod.GlobalThreat;
      var calculateGlobalThreat = ThreatCalc.calculateGlobalThreat;
      var ScoutingManager = ScoutMod.ScoutingManager;

      var SECTORS_TO_UPDATE_PER_CYCLE = 8;
      var RALLY_POINT_UPDATE_INTERVAL_TICKS = 90;
      var THREAT_UPDATE_INTERVAL_TICKS = 30;

      var MatchAwarenessImpl = function (threatCache, sectorCache, mainRallyPoint, logger) {
        this.threatCache = threatCache;
        this.sectorCache = sectorCache;
        this.mainRallyPoint = mainRallyPoint;
        this.logger = logger;
        this._shouldAttack = false;
        this._hostileUnitCache = [];
        this.scoutingManager = new ScoutingManager(logger);
      };

      MatchAwarenessImpl.prototype.getHostilesNearPoint2d = function (point, radius) {
        return this.getHostilesNearPoint(point.x, point.y, radius);
      };

      MatchAwarenessImpl.prototype.getHostilesNearPoint = function (searchX, searchY, radius) {
        var result = [];
        var radiusSq = radius * radius;
        var units = this._hostileUnitCache;
        for (var ii = 0; ii < units.length; ii++) {
          var unit = units[ii];
          if (!unit || !unit.tile) continue;
          var dx = unit.tile.rx - searchX;
          var dy = unit.tile.ry - searchY;
          if (dx * dx + dy * dy <= radiusSq) {
            result.push({ x: unit.tile.rx, y: unit.tile.ry, unitId: unit.id });
          }
        }
        return result;
      };

      MatchAwarenessImpl.prototype.getThreatCache = function () { return this.threatCache; };
      MatchAwarenessImpl.prototype.getSectorCache = function () { return this.sectorCache; };
      MatchAwarenessImpl.prototype.getMainRallyPoint = function () { return this.mainRallyPoint; };
      MatchAwarenessImpl.prototype.getScoutingManager = function () { return this.scoutingManager; };
      MatchAwarenessImpl.prototype.shouldAttack = function () { return this._shouldAttack; };

      MatchAwarenessImpl.prototype.checkShouldAttack = function (threatCache, threatFactor) {
        var scaledGroundPower = threatCache.totalAvailableAntiGroundFirepower * 1.1;
        var scaledGroundThreat = (threatFactor * threatCache.totalOffensiveLandThreat + threatCache.totalDefensiveThreat) * 1.1;
        var scaledAirPower = threatCache.totalAvailableAirPower * 1.1;
        var scaledAirThreat = (threatFactor * threatCache.totalOffensiveAntiAirThreat + threatCache.totalDefensiveThreat) * 1.1;
        return scaledGroundPower > scaledGroundThreat || scaledAirPower > scaledAirThreat;
      };

      MatchAwarenessImpl.prototype.onGameStart = function (gameApi, playerData) {
        this.scoutingManager.onGameStart(gameApi, playerData, this.sectorCache);
      };

      MatchAwarenessImpl.prototype.onAiUpdate = function (game, playerData) {
        var _this = this;
        var sectorCache = this.sectorCache;
        sectorCache.updateSectors(game.getCurrentTick(), SECTORS_TO_UPDATE_PER_CYCLE, game.mapApi, playerData);
        this.scoutingManager.onAiUpdate(game, playerData, sectorCache);

        var updateRatio = sectorCache.getSectorUpdateRatio(game.getCurrentTick() - game.getTickRate() * 60);
        if (updateRatio && updateRatio < 1.0) {
          this.logger((updateRatio * 100.0).toFixed(1) + "% of sectors updated in last 60 seconds.");
        }

        var hostileUnitIds = game.getVisibleUnits(playerData.name, "enemy");
        var hostileUnits = [];
        for (var hi = 0; hi < hostileUnitIds.length; hi++) {
          var obj = game.getGameObjectData(hostileUnitIds[hi]);
          if (obj) hostileUnits.push(obj);
        }
        this._hostileUnitCache = hostileUnits;

        if (game.getCurrentTick() % THREAT_UPDATE_INTERVAL_TICKS === 0) {
          var visibility = sectorCache.getOverallVisibility();
          if (visibility) {
            this.logger((Math.round(visibility * 1000.0) / 10).toFixed(1) + "% of tiles visible. Calculating threat.");
            this.threatCache = calculateGlobalThreat(game, playerData, visibility);
            var gameLengthFactor = Math.max(0, 1.0 - game.getCurrentTick() / (15 * 7200.0));
            this.logger("Game length multiplier: " + gameLengthFactor.toFixed(4));

            if (!this._shouldAttack) {
              this._shouldAttack = this.checkShouldAttack(this.threatCache, 1.25 * gameLengthFactor);
              if (this._shouldAttack) this.logger("Globally switched to attack mode.");
            } else {
              this._shouldAttack = this.checkShouldAttack(this.threatCache, 0.75 * gameLengthFactor);
              if (!this._shouldAttack) this.logger("Globally switched to defence mode.");
            }
          }
        }

        if (game.getCurrentTick() % RALLY_POINT_UPDATE_INTERVAL_TICKS === 0) {
          var enemyPlayers = game.getPlayers().filter(function (p) { return p !== playerData.name && !game.areAlliedPlayers(playerData.name, p); });
          if (enemyPlayers.length) {
            var enemy = game.getPlayerData(enemyPlayers[0]);
            this.mainRallyPoint = MapMod.getPointTowardsOtherPoint(game, playerData.startLocation, enemy.startLocation, 15, 20, 0);
          }
        }
      };

      MatchAwarenessImpl.prototype.getGlobalDebugText = function () {
        if (!this.threatCache) return undefined;
        return (
          "Threat LAND: Them " + Math.round(this.threatCache.totalOffensiveLandThreat) + ", us: " + Math.round(this.threatCache.totalAvailableAntiGroundFirepower) + ".\n" +
          "Threat DEFENSIVE: Them " + Math.round(this.threatCache.totalDefensiveThreat) + ", us: " + Math.round(this.threatCache.totalDefensivePower) + ".\n" +
          "Threat AIR: Them " + Math.round(this.threatCache.totalOffensiveAirThreat) + ", us: " + Math.round(this.threatCache.totalAvailableAntiAirFirepower) + "."
        );
      };

      e("MatchAwarenessImpl", MatchAwarenessImpl);
    },
  };
});
