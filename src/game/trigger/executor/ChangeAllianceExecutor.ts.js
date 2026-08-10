// === OpenYRWeb: 更改联盟关系动作 (ChangeAllianceExecutor) ===
// 动作 89: ChangeAlliance — 在两个阵营之间建立/解除联盟。
// 参数: params[1] = 阵营 A 的国家 ID, params[2] = 阵营 B 的国家 ID,
//       params[3] = 1 建立联盟 / 0 解除联盟。
// 通过 game.onAllianceChange 派发 AllianceChangeEvent 并通知 shroud 等系统。
// deps: ["game/Alliances","game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/executor/ChangeAllianceExecutor",
  ["game/Alliances", "game/trigger/TriggerExecutor"],
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
            var t = Number(this.action.params[1]),
              a = Number(this.action.params[2]),
              n = Boolean(Number(this.action.params[3]));
            var p1 = e.getAllPlayers().find((p) => !p.defeated && p.country?.id === t),
              p2 = e.getAllPlayers().find((p) => !p.defeated && p.country?.id === a);
            if (!p1 || !p2) {
              console.warn(`Invalid houses ${t}/${a} for action ${this.getDebugName()}.`);
              return;
            }
            var l = e.alliances,
              existing = l.findByPlayers(p1, p2);
            if (n) {
              if (existing) {
                if (existing.status !== i.AllianceStatus.Formed) {
                  existing.status = i.AllianceStatus.Formed;
                  e.onAllianceChange(existing, p1, !0);
                }
              } else if (l.canFormAlliance(p1, p2)) {
                var formed = l.setAlliance(p1, p2, i.AllianceStatus.Formed);
                e.onAllianceChange(formed, p1, !0);
              }
            } else if (existing && existing.status === i.AllianceStatus.Formed) {
              l.breakAlliance(p1, p2);
              e.onAllianceChange(existing, p1, !1);
            }
          }
        }),
          e("ChangeAllianceExecutor", s));
      },
    };
  },
);
