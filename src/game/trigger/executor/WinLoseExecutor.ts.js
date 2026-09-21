// === 宣告胜负动作 (WinLoseExecutor) ===
// 动作 1 Win(胜利者是…) / 2 Lose(失败者是…) / 67 DeclareWinning / 68 DeclareLosing。
// 参数: params[0] = 目标阵营索引（地图 [Houses] 顺序）。
//   Win   → 目标阵营获胜，其余非中立阵营判负，结束游戏。
//   Lose  → 目标阵营判负，结束游戏。
// 游戏结束画面根据 localPlayer.defeated 显示胜利/失败（见 ScoreTable）。
// deps: ["game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/executor/WinLoseExecutor", ["game/trigger/TriggerExecutor"], function (e, t) {
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
        constructor(e, t, r) {
          super(e, t);
          this.win = !!r;
        }
        execute(e) {
          let idx = Number(this.action.params[0]);
          let house = e.campaignHouses ? e.campaignHouses[idx] : void 0;
          let player = house ? e.housePlayers.get(house.name) : void 0;
          console.warn(
            `[OpenYRWeb] WinLose: ${this.win ? "Win" : "Lose"} idx=${idx} house=${house?.name} player=${player?.name}`,
          );
          if (!player) {
            console.warn(`Invalid house index ${idx} for action ${this.getDebugName()}.`);
            return;
          }
          if (this.win) {
            // 目标阵营获胜：其余非中立阵营判负
            for (let p of e.getAllPlayers())
              if (p !== player && !p.isNeutral && !p.isObserver) p.defeated = !0;
          } else {
            player.defeated = !0;
          }
          e.end();
        }
      }),
        e("WinLoseExecutor", r));
    },
  };
});
