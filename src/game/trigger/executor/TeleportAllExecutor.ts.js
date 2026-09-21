// === 传送全部动作 (TeleportAllExecutor) ===
// 动作 128: TeleportAll — 将触发阵营所有存活单位传送到指定路径点。
// 参考临时源码 teleportAll 语义（Tt.TeleportAll / 触发器 128）。
// deps: ["game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/executor/TeleportAllExecutor", ["game/trigger/TriggerExecutor"], function (e, t) {
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
          var waypoint = Number(this.action.params[6]) || 0;
          var tile = e.map.getTileAtWaypoint(waypoint);
          if (!tile) {
            console.warn(`TeleportAll: no valid location for waypoint ${waypoint}. Skipping ${this.getDebugName()}.`);
            return;
          }
          var owner = this.resolveHousePlayer(e, this.trigger.houseName);
          if (!owner) {
            console.warn(`Invalid house "${this.trigger.houseName}" for ${this.getDebugName()}.`);
            return;
          }
          var count = 0;
          for (var obj of owner.getOwnedObjects()) {
            if (!obj.isUnit || !obj.isSpawned || obj.isDestroyed || !obj.moveTrait) continue;
            try {
              obj.moveTrait.teleportUnitToTile(tile, void 0, !0, !1, e);
              count++;
            } catch (_) {}
          }
          console.warn(`[OpenYRWeb] TeleportAll: ${owner.name}, teleported ${count} unit(s) @ waypoint ${waypoint}`);
        }
      }),
        e("TeleportAllExecutor", r));
    },
  };
});
