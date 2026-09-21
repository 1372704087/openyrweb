// === 结盟动作 (AllianceExecutor) ===
// 动作 37: Alliance/MakeAlly — 使触发器的所属阵营与指定阵营结盟（Formed）。
// 参考临时源码：params[1] = 目标阵营 ID（-1 表示任意）；先按 country.id 匹配，
// 再按地图 [Houses] 索引（campaignHouses）匹配，最后按 13+索引 匹配。
// deps: ["game/Alliances","game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/executor/AllianceExecutor",
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
            if (!t || !s || t === s || e.alliances.areAllied(t, s)) return;
            try {
              let r = e.alliances.setAlliance(t, s, i.AllianceStatus.Formed);
              e.onAllianceChange(r, t, !0);
              console.warn(`[OpenYRWeb] Alliance: ${t.name} <-> ${s.name} (Formed)`);
            } catch (err) {
              console.warn(`[OpenYRWeb] Alliance action failed: ${err.message}`);
            }
          }
        }),
          e("AllianceExecutor", s));
      },
    };
  },
);
