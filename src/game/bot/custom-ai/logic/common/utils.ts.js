// === Custom AI module: game/bot/custom-ai/logic/common/utils ===
System.register("game/bot/custom-ai/logic/common/utils", ["game/api/index"], function (e, t) {
  "use strict";
  t && t.id;
  return {
    setters: [
      function (x) { }
    ],
    execute: function () {
      e("Countries", {
        USA: "Americans",
        KOREA: "Alliance",
        FRANCE: "French",
        GERMANY: "Germans",
        GREAT_BRITAIN: "British",
        LIBYA: "Africans",
        IRAQ: "Arabs",
        CUBA: "Confederation",
        RUSSIA: "Russians",
      });

      e("isOwnedByNeutral", function isOwnedByNeutral(unitData) {
        return (unitData === null || unitData === undefined) ? undefined : unitData.owner === "@@NEUTRAL@@";
      });

      e("isSelectableCombatant", function isSelectableCombatant(rules) {
        if (!rules) return false;
        if (rules.rules && rules.rules.isSelectableCombatant) {
          return true;
        }
        return false;
      });

      var pad = function pad(n, format) {
        format = format !== undefined ? format : "0000";
        var str = "" + n;
        return format.substring(0, format.length - str.length) + str;
      };
      e("pad", pad);

      e("formatTimeDuration", function formatTimeDuration(timeSeconds, skipZeroHours) {
        var h = Math.floor(timeSeconds / 3600);
        timeSeconds -= h * 3600;
        var m = Math.floor(timeSeconds / 60);
        timeSeconds -= m * 60;
        var s = Math.floor(timeSeconds);
        return (h || !skipZeroHours ? [h] : []).concat([pad(m, "00"), pad(s, "00")]).join(":");
      });

      e("minBy", function minBy(array, predicate) {
        if (array.length === 0) {
          return null;
        }
        var minIdx = 0;
        var minVal = predicate(array[0]);
        for (var i = 1; i < array.length; ++i) {
          var newVal = predicate(array[i]);
          if (minVal === null || (newVal !== null && newVal < minVal)) {
            minIdx = i;
            minVal = newVal;
          }
        }
        return array[minIdx];
      });

      e("maxBy", function maxBy(array, predicate) {
        if (array.length === 0) {
          return null;
        }
        var maxIdx = 0;
        var maxVal = predicate(array[0]);
        for (var i = 1; i < array.length; ++i) {
          var newVal = predicate(array[i]);
          if (maxVal === null || (newVal !== null && newVal > maxVal)) {
            maxIdx = i;
            maxVal = newVal;
          }
        }
        return array[maxIdx];
      });

      e("uniqBy", function uniqBy(array, predicate) {
        return Object.values(
          array.reduce(function (prev, newVal) {
            var val = predicate(newVal);
            if (!prev[val]) {
              prev[val] = newVal;
            }
            return prev;
          }, {})
        );
      });

      e("countBy", function countBy(array, predicate) {
        return array.reduce(function (prev, newVal) {
          var val = predicate(newVal);
          if (val === undefined) {
            return prev;
          }
          if (!prev[val]) {
            prev[val] = 0;
          }
          prev[val] = prev[val] + 1;
          return prev;
        }, {});
      });

      e("groupBy", function groupBy(array, predicate) {
        return array.reduce(function (prev, newVal) {
          var val = predicate(newVal);
          if (val === undefined) {
            return prev;
          }
          if (!prev.hasOwnProperty(val)) {
            prev[val] = [];
          }
          prev[val].push(newVal);
          return prev;
        }, {});
      });
    },
  };
});
