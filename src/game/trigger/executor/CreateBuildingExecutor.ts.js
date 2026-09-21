// === 创建建筑动作 (CreateBuildingExecutor) ===
// 动作 125: CreateBuilding — 为触发器所属阵营在指定路径点生成建筑。
// 参数约定：params[1]=建筑类型名，params[6]=路径点（与其它路径点动作一致）。
// 参考临时源码枚举 CreateBuilding=125；临时源码未实现，本工程给出可用实现。
// deps: ["game/trigger/TriggerExecutor","game/api/index"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/executor/CreateBuildingExecutor",
  ["game/trigger/TriggerExecutor", "game/api/index"],
  function (e, t) {
    "use strict";
    var i, a, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          a = e;
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
            var buildingName = String(this.action.params[1] || "").trim();
            if (!buildingName || "0" === buildingName || /^(?:none|<none>)$/i.test(buildingName)) {
              console.warn(`CreateBuilding has no building id (${this.getDebugName()}).`);
              return;
            }
            var waypoint = Number(this.action.params[6]) || 0;
            var tile = e.map.getTileAtWaypoint(waypoint);
            if (!tile) {
              console.warn(`CreateBuilding: no valid location for waypoint ${waypoint}. Skipping ${this.getDebugName()}.`);
              return;
            }
            var owner = this.resolveHousePlayer(e, this.trigger.houseName);
            if (!owner) {
              console.warn(`Invalid house "${this.trigger.houseName}" for ${this.getDebugName()}.`);
              return;
            }
            if (!e.rules.hasObject(buildingName, a.ObjectType.Building)) {
              console.warn(`CreateBuilding: building "${buildingName}" not found in rules.`);
              return;
            }
            try {
              var obj = e.createObject(a.ObjectType.Building, buildingName);
              e.changeObjectOwner(obj, owner);
              obj.poweredTrait?.setTurnedOn(!0);
              e.spawnObject(obj, tile);
              console.warn(
                `[OpenYRWeb] CreateBuilding: "${buildingName}" (house=${owner.name}, waypoint=${waypoint}) @ tick ${e.currentTick}`,
              );
            } catch (err) {
              console.warn(`CreateBuilding failed for "${buildingName}" @ waypoint ${waypoint}: ${err && err.message || err}`);
            }
          }
        }),
          e("CreateBuildingExecutor", r));
      },
    };
  },
);
