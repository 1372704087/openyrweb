// === OpenYRWeb: 闪烁指定类型建筑动作 (FlashBuildingsOfTypeExecutor) ===
// 动作 131: FlashBuildingsOfType — 高亮触发阵营指定类型建筑（战役演出常用）。
// 参数：params[1]=建筑类型名；为空时高亮该阵营所有建筑。
// deps: ["game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/executor/FlashBuildingsOfTypeExecutor", ["game/trigger/TriggerExecutor"], function (e, t) {
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
        resolveHousePlayer(e, name) {
          if (!name) return void 0;
          let s = String(name).trim();
          if (!s) return void 0;
          var p = e.housePlayers.get(s);
          if (p) return p;
          if (/^\d+$/.test(s)) {
            let h = e.campaignHouses && e.campaignHouses[Number(s)];
            if (h) p = e.housePlayers.get(h.name);
            if (p) return p;
          }
          p = e.getAllPlayers().find((q) => !q.defeated && q.country?.name === s);
          if (p) return p;
          let lower = s.toLowerCase();
          for (var [k, v] of e.housePlayers) if (k.toLowerCase() === lower) return v;
          p = e
            .getAllPlayers()
            .find(
              (q) =>
                q.name === s ||
                (q.scenarioAliases || []).some((a) => String(a).toLowerCase() === lower),
            );
          return p;
        }
        execute(e) {
          var owner = this.resolveHousePlayer(e, this.trigger.houseName);
          if (!owner) {
            console.warn(`Invalid house "${this.trigger.houseName}" for ${this.getDebugName()}.`);
            return;
          }
          var type = String(this.action.params[1] || "").trim().toLowerCase(),
            ids = [];
          for (var obj of owner.getOwnedObjects()) {
            if (!obj.isBuilding || !obj.isBuilding() || !obj.isSpawned || obj.isDestroyed) continue;
            if (type && obj.name.toLowerCase() !== type) continue;
            ids.push(obj.id);
          }
          if (!ids.length) {
            console.warn(`FlashBuildingsOfType: no buildings matched for ${owner.name} type="${type || "*"}"`);
            return;
          }
          e.pendingUnitFlash = { ids: ids, cycles: 3 };
          console.warn(
            `[OpenYRWeb] FlashBuildingsOfType: ${owner.name} highlighted ${ids.length} building(s) type="${type || "*"}"`,
          );
        }
      }),
        e("FlashBuildingsOfTypeExecutor", r));
    },
  };
});
