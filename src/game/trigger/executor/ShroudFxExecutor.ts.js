// === 迷雾触发动作 (ShroudFxExecutor) ===
// 处理按路径点揭示/延伸黑幕的动作：
//   18 RevealAllUnits  → 揭示路径点周围（revealTriggerRadius）给所有作战方
//   31 ExtendShroud    → 逐单元延伸黑幕（同样揭示一圈，半径略小）
// deps: ["game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/executor/ShroudFxExecutor", ["game/trigger/TriggerExecutor"], function (e, t) {
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
        constructor(e, t, s) {
          (super(e, t), (this.mode = s));
        }
        execute(e) {
          var t = Number(this.action.params[1]),
            s = e.map.getTileAtWaypoint(t);
          if (!s) {
            console.warn(`No valid location found for waypoint ${t}. Skipping action ${this.getDebugName()}.`);
            return;
          }
          var radius =
            "extend-shroud" === this.mode
              ? Math.max(1, Math.floor(e.rules.general.revealTriggerRadius / 2))
              : e.rules.general.revealTriggerRadius;
          for (var r of e.getCombatants()) e.mapShroudTrait.getPlayerShroud(r)?.revealAround(s, radius);
          console.warn(`[OpenYRWeb] ShroudFx ${this.mode}: waypoint ${t}, radius ${radius}`);
        }
      }),
        e("ShroudFxExecutor", r));
    },
  };
});
