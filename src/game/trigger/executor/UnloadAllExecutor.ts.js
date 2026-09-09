// === OpenYRWeb: 卸载所有运输工具动作 (UnloadAllExecutor) ===
// 动作 86: UnloadAll — 使触发器的所属阵营所有运输载具/可进驻建筑卸载乘客。
// 复用 EvacuateTransportTask（与战斗要塞/生化反应炉同一卸载机制）。
// deps: ["game/gameobject/task/EvacuateTransportTask","game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/executor/UnloadAllExecutor",
  ["game/gameobject/task/EvacuateTransportTask", "game/trigger/TriggerExecutor"],
  function (e, t) {
    "use strict";
    var r, i, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        ((s = class extends i.TriggerExecutor {
          execute(e) {
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
            for (var obj of p.getOwnedObjects()) {
              if (obj.isDestroyed || !obj.transportTrait || !obj.transportTrait.units.length) continue;
              if (!obj.unitOrderTrait) continue;
              try {
                obj.unitOrderTrait.addTask(new r.EvacuateTransportTask(e, !0));
                count++;
              } catch (_) {}
            }
            console.warn(`[OpenYRWeb] UnloadAll: ${p.name}, transports unloaded: ${count}`);
          }
        }),
          e("UnloadAllExecutor", s));
      },
    };
  },
);
