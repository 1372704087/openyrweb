// === OpenYRWeb: 受限触发动作执行器 (MiscActionExecutor) ===
// 为依赖本项目暂缺子系统的触发动作提供"有明确日志的无操作"，避免静默失效：
//   - 视图/输入控制（需 GUI 相机桥接）：39/46/47/48/49/50（其中 46/47/48 已由 UserInput/MoveCamera 实现）
//   - 音乐/影片/教程（需音频/视频系统）：10/20/82/91/92/93/94
//   - 生产/杂项脚本：3/13/30/78/79/88/96/106/107 及 123-145 中未实现的扩展动作
//   - 视觉闪光/杂项：8/15/64/65/66
// 每个 case 在 factory 中传入标签，触发时打印 debug 日志（不刷屏）。
// deps: ["game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/executor/MiscActionExecutor", ["game/trigger/TriggerExecutor"], function (e, t) {
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
          (super(e, t), (this.label = s));
        }
        execute(e) {
          console.debug(
            `[OpenYRWeb] Trigger action "${this.label}" (${this.getDebugName()}) is not supported by this build — no-op.`,
          );
        }
      }),
        e("MiscActionExecutor", r));
    },
  };
});
