// === OpenYRWeb: 解除触发器动作 (DisarmTriggerExecutor) ===
// 动作 90: DisarmTrigger — 解除指定触发器，使其不再被触发。
// 复用 TriggerManager.setTriggerEnabled(id, false)（与 DisableTrigger 同路径）。
// 参数: params[1] = 触发器 ID。
// deps: ["game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/executor/DisarmTriggerExecutor", ["game/trigger/TriggerExecutor"], function (e, t) {
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
          var t = this.action.params[1];
          e.triggers.setTriggerEnabled(t, !1);
        }
      }),
        e("DisarmTriggerExecutor", r));
    },
  };
});
