// === Custom AI module: game/bot/custom-ai/logic/threat/threatCalculator ===
System.register("game/bot/custom-ai/logic/threat/threatCalculator", ["game/api/index", "game/bot/custom-ai/logic/threat/threat", "game/bot/custom-ai/logic/common/rulesCache"], function (e, t) {
  "use strict";
  t && t.id;
  var GameApi, GameMath, GameObjectData, MovementZone, ObjectType, PlayerData, ProjectileRules, UnitData, WeaponRules;
  var GlobalThreat;
  var getCachedTechnoRules;
  return {
    setters: [
      function (x) { GameApi = x.GameApi; GameMath = x.GameMath; GameObjectData = x.GameObjectData; MovementZone = x.MovementZone; ObjectType = x.ObjectType; PlayerData = x.PlayerData; ProjectileRules = x.ProjectileRules; UnitData = x.UnitData; WeaponRules = x.WeaponRules; },
      function (x) { GlobalThreat = x.GlobalThreat; },
      function (x) { getCachedTechnoRules = x.getCachedTechnoRules; }
    ],
    execute: function () {
      var calculateGlobalThreat = function (game, playerData, visibleAreaPercent) {
        var groundUnits = game.getVisibleUnits(
          playerData.name,
          "enemy",
          function (r) { return r.type == ObjectType.Vehicle || r.type == ObjectType.Infantry; }
        );
        var airUnits = game.getVisibleUnits(playerData.name, "enemy", function (r) { return r.movementZone == MovementZone.Fly; });
        var groundDefence = game
          .getVisibleUnits(playerData.name, "enemy", function (r) { return r.type == ObjectType.Building; })
          .filter(function (unitId) { return isAntiGround(game, unitId); });
        var antiAirPower = game
          .getVisibleUnits(playerData.name, "enemy", function (r) { return r.type != ObjectType.Building; })
          .filter(function (unitId) { return isAntiAir(game, unitId); });

        var ourAntiGroundUnits = game
          .getVisibleUnits(playerData.name, "self", function (r) { return r.isSelectableCombatant; })
          .filter(function (unitId) { return isAntiGround(game, unitId); });
        var ourAntiAirUnits = game
          .getVisibleUnits(playerData.name, "self", function (r) { return r.isSelectableCombatant || r.type === ObjectType.Building; })
          .filter(function (unitId) { return isAntiAir(game, unitId); });
        var ourGroundDefence = game
          .getVisibleUnits(playerData.name, "self", function (r) { return r.type === ObjectType.Building; })
          .filter(function (unitId) { return isAntiGround(game, unitId); });
        var ourAirUnits = game.getVisibleUnits(
          playerData.name,
          "self",
          function (r) { return r.movementZone == MovementZone.Fly && r.isSelectableCombatant; }
        );

        var observedGroundThreat = calculateFirepowerForUnits(game, groundUnits);
        var observedAirThreat = calculateFirepowerForUnits(game, airUnits);
        var observedAntiAirThreat = calculateFirepowerForUnits(game, antiAirPower);
        var observedGroundDefence = calculateFirepowerForUnits(game, groundDefence);

        var ourAntiGroundPower = calculateFirepowerForUnits(game, ourAntiGroundUnits);
        var ourAntiAirPower = calculateFirepowerForUnits(game, ourAntiAirUnits);
        var ourAirPower = calculateFirepowerForUnits(game, ourAirUnits);
        var ourGroundDefencePower = calculateFirepowerForUnits(game, ourGroundDefence);

        return new GlobalThreat(
          visibleAreaPercent,
          observedGroundThreat,
          observedAirThreat,
          observedAntiAirThreat,
          observedGroundDefence,
          ourGroundDefencePower,
          ourAntiGroundPower,
          ourAntiAirPower,
          ourAirPower
        );
      };
      e("calculateGlobalThreat", calculateGlobalThreat);

      var isAntiGround = function (gameApi, unitId) {
        return testProjectile(gameApi, unitId, function (p) { return p.isAntiGround; });
      };

      var isAntiAir = function (gameApi, unitId) {
        return testProjectile(gameApi, unitId, function (p) { return p.isAntiAir; });
      };

      var testProjectile = function (gameApi, unitId, test) {
        var rules = getCachedTechnoRules(gameApi, unitId);
        if (!rules || !(rules.primary || rules.secondary)) {
          return false;
        }

        var primaryWeapon = rules.primary ? gameApi.rulesApi.getWeapon(rules.primary) : null;
        var primaryProjectile = getProjectileRules(gameApi, primaryWeapon);
        if (primaryProjectile && test(primaryProjectile)) {
          return true;
        }

        var secondaryWeapon = rules.secondary ? gameApi.rulesApi.getWeapon(rules.secondary) : null;
        var secondaryProjectile = getProjectileRules(gameApi, secondaryWeapon);
        if (secondaryProjectile && test(secondaryProjectile)) {
          return true;
        }

        return false;
      };

      var getProjectileRules = function (gameApi, weapon) {
        var primaryProjectile = weapon ? gameApi.rulesApi.getProjectile(weapon.projectile) : null;
        return primaryProjectile;
      };

      var calculateFirepowerForUnit = function (gameApi, gameObjectData) {
        var rules = getCachedTechnoRules(gameApi, gameObjectData.id);
        if (!rules) {
          return 0;
        }
        var currentHp = (gameObjectData && gameObjectData.hitPoints) || 0;
        var maxHp = (gameObjectData && gameObjectData.maxHitPoints) || 0;
        var threat = 0;
        var hpRatio = currentHp / Math.max(1, maxHp);

        if (rules.primary) {
          var weapon = gameApi.rulesApi.getWeapon(rules.primary);
          threat += (hpRatio * ((weapon.damage + 1) * GameMath.sqrt(weapon.range + 1))) / Math.max(weapon.rof, 1);
        }
        if (rules.secondary) {
          var weapon = gameApi.rulesApi.getWeapon(rules.secondary);
          threat += (hpRatio * ((weapon.damage + 1) * GameMath.sqrt(weapon.range + 1))) / Math.max(weapon.rof, 1);
        }
        return Math.min(800, threat);
      };

      var calculateFirepowerForUnits = function (game, unitIds) {
        var threat = 0;
        unitIds.forEach(function (unitId) {
          var gameObjectData = game.getGameObjectData(unitId);
          if (gameObjectData) {
            threat += calculateFirepowerForUnit(game, gameObjectData);
          }
        });
        return threat;
      };
    },
  };
});
