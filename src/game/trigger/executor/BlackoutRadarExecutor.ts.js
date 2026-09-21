// === 雷达黑屏动作 (BlackoutRadarExecutor) ===
// 动作 139: BlackoutRadar — 使触发阵营的雷达暂时失效。
// deps: ["game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/executor/BlackoutRadarExecutor", ["game/trigger/TriggerExecutor"], function (e, t) {
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
          var disabled = !this.action.params[1] || Number(this.action.params[1]) !== 0;
          if (owner.radarTrait) {
            owner.radarTrait.setDisabled(disabled);
            console.warn(`[OpenYRWeb] BlackoutRadar: ${owner.name} radar disabled=${disabled}`);
          } else {
            console.warn(`[OpenYRWeb] BlackoutRadar: ${owner.name} has no radarTrait — no-op.`);
          }
        }
      }),
        e("BlackoutRadarExecutor", r));
    },
  };
});
