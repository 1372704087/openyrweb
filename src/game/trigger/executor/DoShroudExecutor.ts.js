// === OpenYRWeb: 制造迷雾动作 (DoShroudExecutor) ===
// 动作 80: DoShroud — 在指定路径点周围对触发阵营制造迷雾。
// 参数: params[6] = 路径点编号(AZ 编码), params[1] = 迷雾半径(格, 0 用默认 3)。
// 实现: 复用 MapShroud.unrevealAround 将该区域标为 Unexplored。
// deps: ["game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/executor/DoShroudExecutor", ["game/trigger/TriggerExecutor"], function (e, t) {
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
          var t = Number(this.action.params[6]) || Number(this.action.params[1]) || 0,
            s = e.map.getTileAtWaypoint(t);
          if (s) {
            var a = Number(this.action.params[2]) || 3,
              p = e.getAllPlayers().find((p) => !p.defeated && p.country?.name === this.trigger.houseName);
            if (p) e.mapShroudTrait.getPlayerShroud(p)?.unrevealAround(s, a);
          } else
            console.warn(`No valid location found for waypoint ${t}. ` + `Skipping action ${this.getDebugName()}.`);
        }
      }),
        e("DoShroudExecutor", r));
    },
  };
});
