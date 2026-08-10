// === OpenYRWeb: 随机播放音效动作 (PlaySoundFxRandomExecutor) ===
// 动作 100: PlaySoundFxRandom — 从参数中随机挑选一个音效播放。
// 参数: params[1..7] = 候选音效名列表（"0" 视为空）。
// 与原版一致，随机选择并派发 TriggerSoundFxEvent。
// deps: ["game/event/TriggerSoundFxEvent","game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/executor/PlaySoundFxRandomExecutor",
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
            var sounds = this.action.params.slice(1).filter((e) => e && "0" !== e);
            if (sounds.length) {
              var idx = e.prng ? e.prng.generateRandomInt(0, sounds.length - 1) : Math.floor(Math.random() * sounds.length);
              e.events.dispatch(new i.TriggerSoundFxEvent(sounds[idx]));
            }
          }
        }),
          e("PlaySoundFxRandomExecutor", s));
      },
    };
  },
);
