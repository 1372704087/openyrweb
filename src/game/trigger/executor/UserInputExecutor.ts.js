// === 用户输入锁定执行器 (UserInputExecutor) ===
// 动作 46 (DisableUserInput) / 47 (EnableUserInput): 锁定/解锁玩家对单位的操控。
// 战役过场/任务演出期间锁定输入，防止玩家乱点。
// 实现方式：设置 game.inputLocked 状态，GUI 层（GameScreen）每帧轮询该状态
// 并桥接 WorldInteraction.setEnabled（见 gui/screen/game/GameScreen.ts.js）。
// deps: ["game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/executor/UserInputExecutor", ["game/trigger/TriggerExecutor"], function (e, t) {
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
          (super(e, t), (this.lock = s));
        }
        execute(e) {
          e.inputLocked = !!this.lock;
          console.debug(
            `[OpenYRWeb] Trigger action "${this.lock ? "DisableUserInput" : "EnableUserInput"}" (${this.getDebugName()}) — input ${this.lock ? "locked" : "unlocked"}.`,
          );
        }
      }),
        e("UserInputExecutor", r));
    },
  };
});
