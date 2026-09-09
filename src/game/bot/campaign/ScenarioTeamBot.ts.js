// === OpenYRWeb: 战役脚本小队 Bot (ScenarioTeamBot) ===
// 为战役中没有常规 AI Bot 的阵营（人类玩家）提供脚本小队能力：
// CreateTeam/DestroyTeam 等触发器动作创建的队伍由 AiEngine 招募并执行脚本。
// 该 Bot 只做队伍管理，不做生产/展开/自主进攻，避免劫持玩家单位。
// deps: ["game/bot/Bot","game/ai/AiApi"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/bot/campaign/ScenarioTeamBot", ["game/bot/Bot", "game/ai/AiApi"], function (e, t) {
  "use strict";
  var s, i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        s = e;
      },
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      (r = class extends s.Bot {
        constructor(e, t) {
          (super(e, t), (this.aiApi = null), (this.initialized = !1));
        }
        _ensureEngine(t) {
          if (this.aiApi) return !0;
          try {
            this.aiApi = new i.AiApi(t, this.actionsApi, this.name, {
              evaluateTriggers: !1, // 只执行显式 CreateTeam 队伍，不做自主 AITrigger 评估
            });
            this.aiApi.init();
            console.log(
              "[ScenarioTeamBot] " +
                this.name +
                " scenario team engine initialized (parsed=" +
                !!(this.aiApi.engine && this.aiApi.engine.parsed) +
                ")",
            );
            return !0;
          } catch (e) {
            console.warn("[ScenarioTeamBot] init failed for " + this.name + ": " + (e && e.message || e));
            return !1;
          }
        }
        onGameStart(t) {
          this._ensureEngine(t);
        }
        onGameTick(t) {
          if (!this.initialized) {
            if (!this._ensureEngine(t)) return;
            this.initialized = !0;
          }
          try {
            this.aiApi.onTick();
          } catch (_) {}
        }
        onChatMessage(t, e, i) {}
      }),
        e("ScenarioTeamBot", r);
    },
  };
});
