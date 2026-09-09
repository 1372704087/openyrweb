// === OpenYRWeb: 全部搜索动作 (AllToHuntExecutor) ===
// 动作 6: AllToHunt — 触发阵营所有战斗单位取消当前任务，向敌方发起攻击移动。
// 参考临时源码 scenarioTeamRuntime.allToHunt：清空任务并 queueHunt。
// 本项目用 AttackMove 到首个敌方出生点/可见敌方位置近似实现。
// deps: ["game/trigger/TriggerExecutor","game/api/index"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/executor/AllToHuntExecutor",
  ["game/trigger/TriggerExecutor", "game/api/index"],
  function (e, t) {
    "use strict";
    var i, a, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          a = e;
        },
      ],
      execute: function () {
        ((r = class extends i.TriggerExecutor {
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
            var owner = this.resolveHousePlayer(e, this.trigger.houseName);
            if (!owner) {
              console.warn(`Invalid house "${this.trigger.houseName}" for ${this.getDebugName()}.`);
              return;
            }
            if (e.scenarioTeamRuntime && e.scenarioTeamRuntime.allToHunt(owner.scenarioHouseName || owner.name)) {
              console.warn(`[OpenYRWeb] AllToHunt: ${owner.name} via scenarioTeamRuntime`);
              return;
            }
            // 找第一个敌对战斗阵营作为攻击移动目标（出生点坐标）
            var enemy = e.getAllPlayers().find(
              (q) =>
                q !== owner &&
                !q.isNeutral &&
                !q.isObserver &&
                !q.defeated &&
                !e.alliances.areAllied(owner, q),
            );
            var targetTile = void 0;
            if (enemy) {
              let sl = e.map.startingLocations[enemy.startLocation];
              if (sl) targetTile = e.map.tiles.getByMapCoords(sl.x, sl.y);
              if (!targetTile && enemy.getOwnedObjects) {
                let b = enemy.getOwnedObjects().find((o) => o.isSpawned && !o.isDestroyed && o.tile);
                if (b) targetTile = b.tile;
              }
            }
            // 找到该阵营对应的 Bot，用其 actionsApi 批量下令（与 AI 指令同一路径）
            var bot = void 0;
            if (e.botManager && e.botManager.bots)
              for (var [player, b] of e.botManager.bots)
                if (player === owner || b.name === owner.name) {
                  bot = b;
                  break;
                }
            var count = 0,
              ids = [];
            for (var obj of owner.getOwnedObjects()) {
              if (!obj.isUnit || !obj.isSpawned || obj.isDestroyed || !obj.unitOrderTrait) continue;
              try {
                obj.unitOrderTrait.cancelAllTasks();
                ids.push(obj.id);
                count++;
              } catch (_) {}
            }
            if (bot && bot.actionsApi && ids.length && targetTile) {
              try {
                bot.actionsApi.orderUnits(ids, a.OrderType.AttackMove, targetTile.rx, targetTile.ry);
              } catch (_) {}
            }
            console.warn(`[OpenYRWeb] AllToHunt: ${owner.name}, units=${count}, enemy=${enemy?.name || "none"}`);
          }
        }),
          e("AllToHuntExecutor", r));
      },
    };
  },
);
