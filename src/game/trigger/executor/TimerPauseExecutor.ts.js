// === OpenYRWeb: 暂停计时器动作 (TimerPauseExecutor) ===
// 动作 104: TimerPause — 暂停任务计时器（保留剩余时间，仅停止递减）。
// 复用 CountdownTimer.stop()（其仅置 running=false，ticks 保留）。
// deps: ["game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/executor/TimerPauseExecutor", ["game/trigger/TriggerExecutor"], function (e, t) {
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
          e.countdownTimer.stop();
        }
      }),
        e("TimerPauseExecutor", r));
    },
  };
});
