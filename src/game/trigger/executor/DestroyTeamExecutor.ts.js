// === OpenYRWeb: 摧毁小队动作 (DestroyTeamExecutor) ===
// 动作 5 (RA2) / 77 (YR): DestroyTeam — 将同名活跃小队标记为完成并停止脚本推进。
// 单位本身保留在地图上（原版 DestroyTeam 只解散小队/回收脚本控制）。
// 参考临时源码 scenarioTeamRuntime.destroyTeam：释放所有同名队伍实例。
// deps: ["game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/executor/DestroyTeamExecutor", ["game/trigger/TriggerExecutor"], function (e, t) {
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
          var teamName = String(this.action.params[1] || "").trim();
          if (!teamName || "0" === teamName || /^(?:none|<none>)$/i.test(teamName)) {
            console.warn(`DestroyTeam has no team id (${this.getDebugName()}).`);
            return;
          }
          if (e.scenarioTeamRuntime && e.scenarioTeamRuntime.destroyTeam(teamName)) {
            console.warn(`[OpenYRWeb] DestroyTeam: "${teamName}" via scenarioTeamRuntime @ tick ${e.currentTick}`);
            return;
          }
          var bots = e.botManager && e.botManager.bots ? e.botManager.bots : void 0;
          var total = 0;
          for (var [player, bot] of bots ? bots : []) {
            var eng = bot && bot.aiApi ? bot.aiApi.engine : void 0;
            if (!eng || !eng.parsed) continue;
            total += eng.destroyTeam(teamName) || 0;
          }
          console.warn(
            `[OpenYRWeb] DestroyTeam: "${teamName}" destroyed ${total} active instance(s) @ tick ${e.currentTick}`,
          );
        }
      }),
        e("DestroyTeamExecutor", r));
    },
  };
});
