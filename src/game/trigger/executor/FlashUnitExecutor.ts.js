// === OpenYRWeb: 单元高亮/闪烁执行器 (FlashUnitExecutor) ===
// 动作 64/65/66 (FlashSmall/Medium/Large) + 74 (FlashTeam): 高亮地图上的单元
// 以吸引玩家注意（RA2 战役演出常用）。
// 参考临时源码：flashTeam -> ui.flashTeam -> 逐个 renderable.highlight()。
// 实现方式：收集目标单元 id 写入 game.pendingUnitFlash，GUI 层（GameScreen）
// 轮询消费并调用渲染实体的高亮动画。
// deps: ["game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/executor/FlashUnitExecutor", ["game/trigger/TriggerExecutor"], function (e, t) {
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
        execute(e) {
          var ids = [],
            cycles = 2;
          switch (this.action.type) {
            case i.TriggerActionType.FlashSmall:
              cycles = 1;
              break;
            case i.TriggerActionType.FlashMedium:
              cycles = 3;
              break;
            case i.TriggerActionType.FlashLarge:
              cycles = 6;
              break;
            case i.TriggerActionType.FlashTeam:
              cycles = 2;
              break;
          }
          if (this.action.type === i.TriggerActionType.FlashTeam) {
            var teamName = String(this.action.params[1] || "").trim();
            if (!teamName) {
              console.warn(`FlashTeam has no team id (${this.getDebugName()}).`);
              return;
            }
            var lower = teamName.toLowerCase();
            var bots = e.botManager && e.botManager.bots ? e.botManager.bots : void 0;
            for (var [player, bot] of bots ? bots : []) {
              var eng = bot && bot.aiApi ? bot.aiApi.engine : void 0;
              if (!eng || !eng.parsed) continue;
              for (var team of eng.activeTeams || []) {
                var name = team.teamType && team.teamType.name;
                if (name && name.toLowerCase() === lower) {
                  for (var uid of team.unitIds || []) ids.push(uid);
                }
              }
            }
            if (!ids.length) {
              console.warn(`FlashTeam: team "${teamName}" has no active units (${this.getDebugName()}).`);
              return;
            }
          } else {
            // FlashSmall/Medium/Large: 高亮地图上所有已生成的技术单位
            for (var obj of e.updatableObjects) {
              if (obj.isSpawned && !obj.isDestroyed && obj.isTechno()) ids.push(obj.id);
            }
          }
          e.pendingUnitFlash = { ids: ids, cycles: cycles };
          console.debug(
            `[OpenYRWeb] ${i.TriggerActionType[this.action.type]}: highlight ${ids.length} unit(s) (${this.getDebugName()}).`,
          );
        }
      }),
        e("FlashUnitExecutor", r));
    },
  };
});
