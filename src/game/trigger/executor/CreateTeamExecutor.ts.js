// === 建立小队动作 (CreateTeamExecutor) ===
// 动作 4 (RA2) / 76 (YR): CreateTeam — 按地图 [TeamTypes] 定义创建作战小队。
// 参考临时源码（werhd.min.js @1705013 / @2751183）：
//   - teamId 取 params[1]，空/"0"/"none"/"<none>" 视为无效；
//   - 队伍归属阵营优先取 TeamType 自身的 House= 字段（其次触发器 houseName），
//     再解析到对应 Player 的 AI 引擎（OriginalAiBot 的 AiEngine.spawnTeam）。
// 引擎负责招募空闲单位（TaskForce）并执行脚本（ScriptType）。
// deps: ["game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/executor/CreateTeamExecutor", ["game/trigger/TriggerExecutor"], function (e, t) {
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
        // 解析阵营名/索引到 Player（housePlayers 精确名 → [Houses] 数字索引 → 国家名 → 大小写不敏感 → 别名）
        resolveHousePlayer(e, name) {
          if (!name) return void 0;
          let s = String(name).trim();
          if (!s) return void 0;
          var p = e.housePlayers.get(s);
          if (p) return p;
          if (/^\d+$/.test(s)) {
            let h = e.campaignHouses && e.campaignHouses[Number(s)];
            if (h) p = e.housePlayers.get(h.name);
            if (p) return p;
          }
          p = e.getAllPlayers().find((q) => !q.defeated && q.country?.name === s);
          if (p) return p;
          let lower = s.toLowerCase();
          for (var [k, v] of e.housePlayers) if (k.toLowerCase() === lower) return v;
          p = e
            .getAllPlayers()
            .find(
              (q) =>
                q.name === s ||
                (q.scenarioAliases || []).some((a) => String(a).toLowerCase() === lower),
            );
          return p;
        }
        execute(e) {
            var teamName = String(this.action.params[1] || "").trim();
            if (!teamName || "0" === teamName || /^(?:none|<none>)$/i.test(teamName)) {
              console.warn(`CreateTeam has no team id (${this.getDebugName()}).`);
              return;
            }
            // 战役队伍：优先走 ScenarioTeamRuntime 完整脚本执行路径（已移植 cQe 的
            // quarry 协调攻击 / 小队同步 / 特勤任务分流等）。地图 [TeamTypes] 中存在
            // 定义且能解析归属阵营时使用它；否则回退到 AiEngine。
            if (e.scenarioTeamRuntime) {
              var scenarioDef = e.scenarioTeamRuntime.getTeam(teamName);
              if (scenarioDef) {
                var scenarioOwner = this.resolveHousePlayer(e, scenarioDef.houseName);
                if (scenarioOwner) {
                  try {
                    if (e.scenarioTeamRuntime.createTeam(teamName, e.currentTick)) {
                      console.warn(
                        `[OpenYRWeb] CreateTeam: "${teamName}" (house=${scenarioDef.houseName}) via scenarioTeamRuntime @ tick ${e.currentTick} — trigger ${this.getDebugName()}`,
                      );
                      return;
                    }
                  } catch (err) {
                    console.warn(`CreateTeam: scenarioTeamRuntime failed for "${teamName}": ${err?.message}`);
                  }
                }
              }
            }
            // 战役队伍统一交给 AiEngine（ScenarioTeamBot，evaluateTriggers=false）执行。
          var bots = e.botManager && e.botManager.bots ? e.botManager.bots : void 0;
          var firstEngine,
            botCount = 0,
            parsedCount = 0;
          for (var [player, bot] of bots ? bots : []) {
            botCount++;
            var eng = bot && bot.aiApi ? bot.aiApi.engine : void 0;
            if (!eng || !eng.parsed) continue;
            parsedCount++;
            firstEngine || (firstEngine = eng);
            var tm = eng.parsed.teamTypes[teamName];
            if (!tm) {
              let lower = teamName.toLowerCase();
              tm = Object.keys(eng.parsed.teamTypes).reduce(
                (acc, k) => acc || (k.toLowerCase() === lower ? eng.parsed.teamTypes[k] : void 0),
                void 0,
              );
            }
            if (!tm) continue;
            // 归属阵营：TeamType.House= 优先，其次触发器 houseName
            var ownerName = (tm.house || this.trigger.houseName || "").toString().trim();
            var owner = this.resolveHousePlayer(e, ownerName);
            if (owner && owner !== player) continue;
            if (!owner && this.trigger.houseName && this.trigger.houseName.trim()) {
              // TeamType 未标注 House 时按触发器阵营匹配
              let tp = this.resolveHousePlayer(e, this.trigger.houseName);
              if (tp && tp !== player) continue;
            }
            eng.spawnTeam(tm, e.currentTick);
            console.warn(
              `[OpenYRWeb] CreateTeam: "${teamName}" (house=${ownerName || "?"}) via ${player.name} @ tick ${e.currentTick} — trigger ${this.getDebugName()}`,
            );
            return;
          }
          if (firstEngine) {
            console.warn(`TeamType "${teamName}" not found in any AI engine's map data.`);
            return;
          }
          console.warn(
            `No AI engine available for house "${this.trigger.houseName}" — cannot create team "${teamName}" ` +
              `(bots=${botCount}, parsed engines=${parsedCount}).`,
          );
        }
      }),
        e("CreateTeamExecutor", r));
    },
  };
});
