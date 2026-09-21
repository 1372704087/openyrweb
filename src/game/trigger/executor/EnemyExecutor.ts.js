// === 敌对动作 (EnemyExecutor) ===
// 动作 38: Enemy/MakeEnemy — 使触发器的所属阵营与指定阵营解除联盟（成为敌人）。
// 参考临时源码：params[1] = 目标阵营 ID（-1 表示任意）；解析方式同 AllianceExecutor。
// deps: ["game/Alliances","game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/executor/EnemyExecutor",
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
          constructor(e, t) {
            (super(e, t), (this.houseId = Number(e.params[1])));
          }
          // 触发器的所属阵营（[Triggers] 行首的 HouseName）
          resolveSource(e) {
            let n = this.trigger.houseName;
            if (!n) return void 0;
            return e.housePlayers.get(n) || e.getAllPlayers().find((p) => p.country?.name === n);
          }
          // 目标阵营：-1 任意；country.id → [Houses] 索引 → 13+索引
          resolveTarget(e, source) {
            if (this.houseId === -1) return e.getAllPlayers().find((p) => p !== source);
            let p = e.getAllPlayers().find((p) => p.country?.id === this.houseId);
            if (!p && e.campaignHouses) {
              let h = e.campaignHouses[this.houseId] ?? e.campaignHouses[this.houseId - 13];
              if (h) p = e.housePlayers.get(h.name);
            }
            return p;
          }
          execute(e) {
            let t = this.resolveSource(e),
              s = this.resolveTarget(e, t);
            if (!t || !s || t === s) return;
            if (!e.alliances.areAllied(t, s)) return;
            let n = e.alliances.findByPlayers(t, s);
            e.alliances.breakAlliance(t, s);
            e.onAllianceChange(n, t, !1);
            console.warn(`[OpenYRWeb] Enemy: ${t.name} vs ${s.name} (Broken)`);
          }
        }),
          e("EnemyExecutor", s));
      },
    };
  },
);
