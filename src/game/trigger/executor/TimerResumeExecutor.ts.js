// === OpenYRWeb: 恢复计时器动作 (TimerResumeExecutor) ===
// 动作 105: TimerResume — 恢复被暂停的任务计时器。
// 复用 CountdownTimer.start()。
// deps: ["game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/executor/TimerResumeExecutor", ["game/trigger/TriggerExecutor"], function (e, t) {
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
          e.countdownTimer.start();
        }
      }),
        e("TimerResumeExecutor", r));
    },
  };
});
