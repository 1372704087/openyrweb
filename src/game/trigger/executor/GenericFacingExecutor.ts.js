// === OpenYRWeb: 设置朝向动作 (GenericFacingExecutor) ===
// 动作 78: GenericFacing — 将触发阵营所有存活单位朝向设置为指定方向。
// 参数：params[1] 为 0-7 方向（与脚本 ForceFacing 一致）。
// deps: ["game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/executor/GenericFacingExecutor", ["game/trigger/TriggerExecutor"], function (e, t) {
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
          var facing = Number(this.action.params[1]) || 0,
            dir = (8 - (facing & 7)) % 8 * 45;
          var owner = this.resolveHousePlayer(e, this.trigger.houseName);
          if (!owner) {
            console.warn(`Invalid house "${this.trigger.houseName}" for ${this.getDebugName()}.`);
            return;
          }
          var count = 0;
          for (var obj of owner.getOwnedObjects()) {
            if (!obj.isUnit || !obj.isSpawned || obj.isDestroyed) continue;
            obj.direction = dir;
            obj.spinVelocity = 0;
            count++;
          }
          console.warn(`[OpenYRWeb] GenericFacing: ${owner.name}, set ${count} unit(s) to facing ${dir}`);
        }
      }),
        e("GenericFacingExecutor", r));
    },
  };
});
