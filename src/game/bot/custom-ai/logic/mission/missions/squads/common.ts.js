// === Custom AI module: game/bot/custom-ai/logic/mission/missions/squads/common ===
System.register("game/bot/custom-ai/logic/mission/missions/squads/common", ["game/api/index", "game/bot/custom-ai/logic/map/map", "game/bot/custom-ai/logic/mission/actionBatcher"], function (e, t) {
  "use strict";
  var AttackState, ObjectType, OrderType, StanceType, UnitData, Vector2, ZoneType;
  var getDistanceBetweenPoints, getDistanceBetweenUnits;
  var BatchableAction;
  t && t.id;
  return {
    setters: [
      function (A) {
        AttackState = A.AttackState;
        ObjectType = A.ObjectType;
        OrderType = A.OrderType;
        StanceType = A.StanceType;
        UnitData = A.UnitData;
        Vector2 = A.Vector2;
        ZoneType = A.ZoneType;
      },
      function (B) {
        getDistanceBetweenPoints = B.getDistanceBetweenPoints;
        getDistanceBetweenUnits = B.getDistanceBetweenUnits;
      },
      function (C) {
        BatchableAction = C.BatchableAction;
      },
    ],
    execute: function () {

      var NONCE_GI_DEPLOY = 0;
      var NONCE_GI_UNDEPLOY = 1;

      function manageMoveMicro(attacker, attackPoint) {
        if (attacker.name === "E1") {
          var isDeployed = attacker.stance === StanceType.Deployed;
          if (isDeployed) {
            return BatchableAction.noTarget(attacker.id, OrderType.DeploySelected, NONCE_GI_UNDEPLOY);
          }
        }
        return BatchableAction.toPoint(attacker.id, OrderType.AttackMove, attackPoint);
      }
      e("manageMoveMicro", manageMoveMicro);

      function manageAttackMicro(attacker, target) {
        var distance = getDistanceBetweenUnits(attacker, target);
        if (attacker.name === "E1") {
          var deployedWeaponRange = attacker.secondaryWeapon ? attacker.secondaryWeapon.maxRange : 5;
          var isDeployed = attacker.stance === StanceType.Deployed;
          if (!isDeployed && (distance <= deployedWeaponRange || attacker.attackState === AttackState.JustFired)) {
            return BatchableAction.noTarget(attacker.id, OrderType.DeploySelected, NONCE_GI_DEPLOY);
          } else if (isDeployed && distance > deployedWeaponRange) {
            return BatchableAction.noTarget(attacker.id, OrderType.DeploySelected, NONCE_GI_UNDEPLOY);
          }
        }
        var targetData = target;
        var orderType = OrderType.Attack;
        var primaryWeaponRange = attacker.primaryWeapon ? attacker.primaryWeapon.maxRange : 5;
        if (targetData && targetData.type == ObjectType.Building && distance < primaryWeaponRange * 0.8) {
          orderType = OrderType.Attack;
        } else if (targetData && targetData.rules.canDisguise) {
          orderType = OrderType.Attack;
        }
        return BatchableAction.toTargetId(attacker.id, orderType, target.id);
      }
      e("manageAttackMicro", manageAttackMicro);

      function getAttackWeight(attacker, target) {
        var x = attacker.tile.rx, y = attacker.tile.ry;
        var hX = target.tile.rx, hY = target.tile.ry;

        var isUnderWaterUnit = ["SUB", "DLPH", "SQD"].indexOf(attacker.name) !== -1;
        var isNavalTarget = ["DEST", "AEGIS", "CARRIER", "SUB", "HYD", "DRED", "DLPH", "SQD"].indexOf(target.name) !== -1;

        if (isUnderWaterUnit || isNavalTarget) {
          console.log("[NAVAL_DEBUG] \u653B\u51FB\u6743\u91CD\u68C0\u67E5: " + attacker.name + "(id:" + attacker.id + ") -> " + target.name + "(id:" + target.id + ")");
          console.log("[NAVAL_DEBUG]   \u653B\u51FB\u8005\u4F4D\u7F6E: (" + x + ", " + y + "), \u76EE\u6807\u4F4D\u7F6E: (" + hX + ", " + hY + ")");
          console.log("[NAVAL_DEBUG]   \u653B\u51FB\u8005\u533A\u57DF: " + attacker.zone + ", \u76EE\u6807\u533A\u57DF: " + target.zone);
          console.log("[NAVAL_DEBUG]   \u662F\u5426\u6C34\u4E0B\u5355\u4F4D: " + isUnderWaterUnit + ", \u662F\u5426\u6D77\u519B\u76EE\u6807: " + isNavalTarget);
          if (attacker.primaryWeapon) {
            console.log("[NAVAL_DEBUG]   \u4E3B\u6B66\u5668\u4FE1\u606F: maxRange=" + attacker.primaryWeapon.maxRange);
            console.log("[NAVAL_DEBUG]   \u4E3B\u6B66\u5668\u5F39\u9053: isAntiAir=" + attacker.primaryWeapon.projectileRules.isAntiAir + ", isAntiGround=" + attacker.primaryWeapon.projectileRules.isAntiGround);
          } else {
            console.log("[NAVAL_DEBUG]   \u6CA1\u6709\u4E3B\u6B66\u5668!");
          }
          if (attacker.secondaryWeapon) {
            console.log("[NAVAL_DEBUG]   \u526F\u6B66\u5668\u4FE1\u606F: maxRange=" + attacker.secondaryWeapon.maxRange);
            console.log("[NAVAL_DEBUG]   \u526F\u6B66\u5668\u5F39\u9053: isAntiAir=" + attacker.secondaryWeapon.projectileRules.isAntiAir + ", isAntiGround=" + attacker.secondaryWeapon.projectileRules.isAntiGround);
          }
        }

        if (!attacker.primaryWeapon.projectileRules.isAntiAir && target.zone === ZoneType.Air) {
          if (isUnderWaterUnit) console.log("[NAVAL_DEBUG]   -> \u62D2\u7EDD\u653B\u51FB: \u6CA1\u6709\u9632\u7A7A\u80FD\u529B\u4F46\u76EE\u6807\u5728\u7A7A\u4E2D");
          return null;
        }

        var groundAttackWhitelist = ["CARRIER", "DRED"];
        var ignoreAntiGroundCheck = groundAttackWhitelist.indexOf(attacker.name) !== -1;

        if (!ignoreAntiGroundCheck && !attacker.primaryWeapon.projectileRules.isAntiGround && target.zone === ZoneType.Ground) {
          if (isUnderWaterUnit) console.log("[NAVAL_DEBUG]   -> \u62D2\u7EDD\u653B\u51FB: \u6CA1\u6709\u5BF9\u5730\u80FD\u529B\u4F46\u76EE\u6807\u5728\u5730\u9762");
          return null;
        }

        var distance = getDistanceBetweenPoints(new Vector2(x, y), new Vector2(hX, hY));
        var weight = 1000000 - distance;

        if (isUnderWaterUnit || isNavalTarget) {
          console.log("[NAVAL_DEBUG]   -> \u653B\u51FB\u6743\u91CD: " + weight + " (\u8DDD\u79BB: " + distance + ")");
        }

        return weight;
      }
      e("getAttackWeight", getAttackWeight);
    },
  };
});
