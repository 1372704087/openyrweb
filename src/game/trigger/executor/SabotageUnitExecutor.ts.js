// === OpenYRWeb: 破坏单位动作 (SabotageUnitExecutor) ===
// 动作 87: SabotageUnit — 破坏指定路径点区域（3x3）的敌方技术单位。
// 简化实现：对路径点所在格及邻近格（曼哈顿距离 ≤1）的敌方单位直接销毁。
// deps: ["game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/executor/SabotageUnitExecutor", ["game/trigger/TriggerExecutor"], function (e, t) {
  "use strict";
  var i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      ((r = class extends i.TriggerExecutor {
        execute(e) {
          var t = Number(this.action.params[1]),
            tile = e.map.getTileAtWaypoint(t);
          if (!tile) {
            console.warn(`No valid location found for waypoint ${t}. Skipping action ${this.getDebugName()}.`);
            return;
          }
          var houseName = String(this.trigger.houseName || "").trim(),
            lowerHouse = houseName.toLowerCase(),
            p =
              e.housePlayers.get(houseName) ||
              e.getAllPlayers().find(
                (p) =>
                  !p.defeated &&
                  (p.country?.name === houseName ||
                    p.name === houseName ||
                    (p.scenarioAliases || []).some((a) => String(a).toLowerCase() === lowerHouse)),
              );
          if (!p) {
            console.warn(`Invalid house "${this.trigger.houseName}" for ${this.getDebugName()}.`);
            return;
          }
          var count = 0;
          for (var obj of e.updatableObjects) {
            if (!obj.isSpawned || obj.isDestroyed || !obj.isTechno() || !obj.tile) continue;
            var d = Math.max(Math.abs(obj.tile.rx - tile.rx), Math.abs(obj.tile.ry - tile.ry));
            if (d > 1) continue;
            if (obj.owner === p || e.alliances.areAllied(p, obj.owner)) continue;
            e.destroyObject(obj);
            count++;
          }
          console.warn(`[OpenYRWeb] SabotageUnit: ${p.name} destroyed ${count} unit(s) @ waypoint ${t}`);
        }
      }),
        e("SabotageUnitExecutor", r));
    },
  };
});
