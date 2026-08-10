// === OpenYRWeb: 播放音效动作(non-localized) (PlaySoundEffectExecutor) ===
// 动作 85: PlaySoundEffect — 播放全局音效（音效名不经本地化）。
// 与动作 19 (PlaySoundFx) 在引擎内走同一事件通道。
// deps: ["game/event/TriggerSoundFxEvent","game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/executor/PlaySoundEffectExecutor",
  ["game/event/TriggerSoundFxEvent", "game/trigger/TriggerExecutor"],
  function (e, t) {
    "use strict";
    var i, r, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        ((s = class extends r.TriggerExecutor {
          execute(e) {
            e.events.dispatch(new i.TriggerSoundFxEvent(this.action.params[1]));
          }
        }),
          e("PlaySoundEffectExecutor", s));
      },
    };
  },
);
