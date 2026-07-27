// === Custom AI module: game/bot/custom-ai/logic/composition/common ===
// 兵种克制支持：分析敌方可见单位的护甲分布，按 Verses 倍率调整我方配比。
System.register("game/bot/custom-ai/logic/composition/common", ["game/api/index", "game/bot/custom-ai/logic/common/rulesCache"], function (e, t) {
  "use strict";
  t && t.id;
  var ObjectType, getCachedTechnoRules;
  return {
    setters: [
      function (x) { ObjectType = x.ObjectType; },
      function (x) { getCachedTechnoRules = x.getCachedTechnoRules; }
    ],
    execute: function () {

      // 分析敌方可见战斗单位的护甲分布。
      // 返回主力护甲类型(ArmorType 数值)、各护甲计数、各类单位计数。
      var getEnemyArmorProfile = function (gameApi, playerData) {
        var enemyUnitIds = gameApi.getVisibleUnits(playerData.name, "enemy", function (r) {
          return r.isSelectableCombatant;
        });
        var counts = {};
        var vehicleCount = 0, infantryCount = 0, airCount = 0;
        var total = 0;
        for (var i = 0; i < enemyUnitIds.length; i++) {
          var rules = getCachedTechnoRules(gameApi, enemyUnitIds[i]);
          if (!rules) continue;
          var armor = rules.armor;
          if (armor === undefined || armor === null) continue;
          counts[armor] = (counts[armor] || 0) + 1;
          total++;
          var obj = gameApi.getGameObjectData(enemyUnitIds[i]);
          if (obj) {
            if (obj.type === ObjectType.Vehicle) vehicleCount++;
            else if (obj.type === ObjectType.Infantry) infantryCount++;
            else if (obj.type === ObjectType.Aircraft) airCount++;
          }
        }
        var dominantArmor = null;
        var maxCount = 0;
        Object.keys(counts).forEach(function (k) {
          if (counts[k] > maxCount) { maxCount = counts[k]; dominantArmor = parseInt(k, 10); }
        });
        return {
          dominantArmor: dominantArmor,
          counts: counts,
          totalCombatants: total,
          vehicleCount: vehicleCount,
          infantryCount: infantryCount,
          airCount: airCount,
        };
      };
      e("getEnemyArmorProfile", getEnemyArmorProfile);

      // 查询某单位主武器对指定护甲的 Verses 倍率（未命中返回 1）。
      var getVersesMultiplier = function (gameApi, unitName, armorType) {
        if (armorType === null || armorType === undefined) return 1;
        var rulesApi = gameApi.rulesApi;
        var rules = rulesApi.vehicleRules.get(unitName)
          || rulesApi.infantryRules.get(unitName)
          || rulesApi.aircraftRules.get(unitName);
        if (!rules || !rules.primary) return 1;
        try {
          var weapon = rulesApi.getWeapon(rules.primary);
          if (!weapon || !weapon.warhead) return 1;
          var v = weapon.warhead.verses.get(armorType);
          return v !== undefined ? v : 1;
        } catch (err) {
          return 1;
        }
      };
      e("getVersesMultiplier", getVersesMultiplier);

      // 根据敌方主力护甲调整配比：强化克制单位(高 Verses)，削弱被克单位(低 Verses)。
      // 敌方可见战斗单位少于 3 个时不调整（情报不足，保留原配比）。
      var adjustCompositionByEnemy = function (gameApi, playerData, result) {
        var profile = getEnemyArmorProfile(gameApi, playerData);
        if (!profile.dominantArmor || profile.totalCombatants < 3) return result;
        var armor = profile.dominantArmor;
        var names = Object.keys(result);
        if (names.length < 2) return result;
        var stats = names.map(function (name) {
          return { name: name, mult: getVersesMultiplier(gameApi, name, armor), qty: result[name] };
        });
        var maxMult = -1, minMult = 99;
        stats.forEach(function (s) {
          if (s.mult > maxMult) maxMult = s.mult;
          if (s.mult < minMult) minMult = s.mult;
        });
        // 倍率差距不明显就不调整
        if (maxMult - minMult < 0.3) return result;
        var adjusted = {};
        stats.forEach(function (s) {
          var qty = s.qty;
          if (s.mult === maxMult && maxMult > 1) {
            qty = Math.ceil(qty * 1.5);
          } else if (s.mult === minMult && minMult < 1) {
            qty = Math.max(1, Math.floor(qty * 0.6));
          }
          adjusted[s.name] = qty;
        });
        return adjusted;
      };
      e("adjustCompositionByEnemy", adjustCompositionByEnemy);
    },
  };
});
