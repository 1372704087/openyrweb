// === Custom AI module: game/ai/AiEngine ===
// AIMD.INI 运行时引擎 — 评估触发器、管理队伍、执行脚本
// 提供统一接口供各类 Bot 使用（CustomAiBot / IraqBot 均可接入）
System.register("game/ai/AiEngine", [
  "game/api/index",
  "game/ai/AiData"
], function (e, t) {
  "use strict";
  var GameApi, Vector2, OrderType, ObjectType, SpeedType, AiData;
  t && t.id;
  return {
    setters: [
      function (x) { GameApi = x.GameApi; Vector2 = x.Vector2; OrderType = x.OrderType; ObjectType = x.ObjectType; SpeedType = x.SpeedType; },
      function (x) { AiData = x; },
    ],
    execute: function () {

      // ============================================================
      // 活跃队伍状态
      // ============================================================
      var ActiveTeam = function (teamType) {
        this.teamType = teamType;       // TeamType 定义
        this.taskForce = null;          // 关联的 TaskForce
        this.scriptType = null;         // 关联的 ScriptType
        this.unitIds = [];              // 已招募的单位ID
        this.scriptIndex = 0;           // 当前执行到脚本第几步
        this.state = "recruiting";      // recruiting / executing / done
        this.recruitTicks = 0;
        this.rallyPoint = null;         // 集结点
        this.attackTarget = null;       // 攻击目标
        this.createdAt = 0;
      };

      // ============================================================
      // AiEngine — 主引擎
      // ============================================================
      var AiEngine = function (gameApi, actionsApi, playerName, options) {
        this.gameApi = gameApi;
        this.actionsApi = actionsApi;
        this.playerName = playerName;
        this.options = options || {};
        this.parsed = null;             // {taskForces, scriptTypes, teamTypes, triggers, defenses, queues}
        this.activeTeams = [];          // 活跃队伍列表
        this.lastTriggerCheck = 0;
        this.triggerCooldown = this.options.triggerCooldown || 60;  // 每60tick检查一次触发器
        this.techLevel = 1;
        this.lastTechUpdate = 0;
        this.triggerFired = {};         // 记录已触发的触发器（防重复）
        this.totalTeamsCreated = 0;
      };

      // 初始化：传入 aiIni 或使用 gameApi.getAiIni()
      AiEngine.prototype.init = function (aiIni) {
        if (!aiIni) {
          try { aiIni = this.gameApi.getAiIni(); } catch (e) {
            console.warn("[AiEngine] No AI Ini available");
            return;
          }
        }
        this.parsed = {
          groupWeights: AiData.parseGroupWeights(aiIni),
          taskForces: AiData.parseTaskForces(aiIni),
          scriptTypes: AiData.parseScriptTypes(aiIni),
          teamTypes: AiData.parseTeamTypes(aiIni),
          triggers: AiData.parseAITriggerTypes(aiIni),
          defenses: AiData.parseAIDefenseTypes(aiIni),
          buildQueues: AiData.parseBuildQueues(aiIni),
        };
        console.log("[AiEngine] Loaded " + Object.keys(this.parsed.teamTypes).length + " team types, " +
          Object.keys(this.parsed.triggers).length + " triggers, " +
          Object.keys(this.parsed.taskForces).length + " task forces, " +
          Object.keys(this.parsed.scriptTypes).length + " scripts");
      };

      // 主更新循环（每tick调用）
      AiEngine.prototype.onTick = function () {
        if (!this.parsed) return;
        var tick = this.gameApi.getCurrentTick();

        this.updateTechLevel(tick);
        this.checkTriggers(tick);
        this.updateTeams(tick);

        // 清理完成的队伍
        this.activeTeams = this.activeTeams.filter(function (t) {
          return t.state !== "done";
        });
      };

      // 更新科技等级
      AiEngine.prototype.updateTechLevel = function (tick) {
        if (tick - this.lastTechUpdate < 120) return;
        this.lastTechUpdate = tick;
        try {
          var buildings = this.gameApi.getVisibleUnits(this.playerName, "self", function (r) {
            return r.type === ObjectType.Building;
          });
          // 根据已有建筑推断科技等级
          var hasTech = {}, maxLv = 1;
          buildings.forEach(function (id) {
            var data = this.gameApi.getUnitData(id);
            if (data && data.name) hasTech[data.name] = true;
          }.bind(this));
          // 科技等级映射（简化版）
          if (hasTech["NATECH"] || hasTech["GATECH"] || hasTech["YATECH"]) maxLv = 10;
          else if (hasTech["NAWEAP"] || hasTech["GAWEAP"] || hasTech["YAWEAP"]) maxLv = 5;
          else if (hasTech["NARADR"] || hasTech["GAAIRC"] || hasTech["NAPSIS"]) maxLv = 4;
          else if (hasTech["NAPOWR"] || hasTech["GAPOWR"] || hasTech["YAPOWR"]) maxLv = 3;
          this.techLevel = maxLv;
        } catch (_) {}
      };

      // 检查触发器
      AiEngine.prototype.checkTriggers = function (tick) {
        if (tick - this.lastTriggerCheck < this.triggerCooldown) return;
        this.lastTriggerCheck = tick;

        var triggers = this.parsed.triggers;
        var teamTypes = this.parsed.teamTypes;
        var selfUnits = 0, enemyUnits = 0, credits = 0;

        try {
          selfUnits = this.gameApi.getVisibleUnits(this.playerName, "self", function (r) {
            return r.isSelectableCombatant;
          }).length;
          enemyUnits = this.gameApi.getVisibleUnits(this.playerName, "enemy", function (r) {
            return r.isSelectableCombatant;
          }).length;
          credits = this.gameApi.getPlayerData(this.playerName).credits;
        } catch (_) {}

        var triggerKeys = Object.keys(triggers);
        for (var ti = 0; ti < triggerKeys.length; ti++) {
          var tr = triggers[triggerKeys[ti]];
          if (!tr) continue;

          // 科技等级检查
          if (tr.techLevel >= 0 && this.techLevel < tr.techLevel) continue;

          // 防重复触发
          var fireKey = tr.team1 + "|" + tr.team2;
          if (this.triggerFired[fireKey]) continue;

          // 检查条件
          var met = false;
          switch (tr.condition) {
            case 0: // 时间条件
              met = tick >= tr.value * 900; // value 单位是分钟
              break;
            case 1: // 单位数
              var count = tr.owner === 1 ? enemyUnits : selfUnits;
              met = tr.comparison === 2 ? count >= tr.value :
                    tr.comparison === 0 ? count <= tr.value :
                    count === tr.value;
              break;
            case 3: // 金钱
              met = tr.comparison === 2 ? credits >= tr.value : credits <= tr.value;
              break;
            default:
              met = tick > 300; // 默认：游戏开始一段时间后
          }

          if (met) {
            this.fireTrigger(tr, tick);
          }
        }
      };

      // 触发触发器
      AiEngine.prototype.fireTrigger = function (trigger, tick) {
        // 触发队伍
        var teamNames = [trigger.team1];
        if (trigger.team2) teamNames.push(trigger.team2);

        for (var ti = 0; ti < teamNames.length; ti++) {
          var tm = this.parsed.teamTypes[teamNames[ti]];
          if (!tm) continue;

          // 检查是否已达最大执行次数
          var activeCount = 0;
          for (var ai = 0; ai < this.activeTeams.length; ai++) {
            if (this.activeTeams[ai].teamType.name === tm.name) activeCount++;
          }
          if (activeCount >= tm.maxExecuted) continue;

          this.spawnTeam(tm, tick);
        }

        this.triggerFired[trigger.team1 + "|" + trigger.team2] = true;
      };

      // 创建队伍
      AiEngine.prototype.spawnTeam = function (teamType, tick) {
        var at = new ActiveTeam(teamType);
        at.taskForce = this.parsed.taskForces[teamType.taskForce] || null;
        at.scriptType = this.parsed.scriptTypes[teamType.scriptType] || null;

        if (!at.taskForce || at.taskForce.groups.length === 0) {
          at.state = "done";
          return;
        }

        at.createdAt = tick;
        this.activeTeams.push(at);
        this.totalTeamsCreated++;
        console.log("[AiEngine] Spawn team " + teamType.name + " (TF=" + teamType.taskForce + ")");
      };

      // 更新所有活跃队伍
      AiEngine.prototype.updateTeams = function (tick) {
        for (var ti = 0; ti < this.activeTeams.length; ti++) {
          var team = this.activeTeams[ti];
          if (team.state === "done") continue;

          switch (team.state) {
            case "recruiting":
              this.updateRecruiting(team, tick);
              break;
            case "executing":
              this.updateExecuting(team, tick);
              break;
          }
        }
      };

      // 招募阶段：收集需要的单位
      AiEngine.prototype.updateRecruiting = function (team, tick) {
        team.recruitTicks++;

        // 超时放弃招募
        if (team.recruitTicks > 300) {
          if (team.unitIds.length > 0) {
            team.state = "executing";
            team.scriptIndex = 0;
          } else {
            team.state = "done";
          }
          return;
        }

        if (!team.taskForce) { team.state = "done"; return; }

        // 检查是否已招募足够单位
        var needed = [];
        for (var gi = 0; gi < team.taskForce.groups.length; gi++) {
          var group = team.taskForce.groups[gi];
          var haveCount = 0;
          for (var ui = 0; ui < team.unitIds.length; ui++) {
            try {
              var ud = this.gameApi.getUnitData(team.unitIds[ui]);
              if (ud && ud.name === group.unitType) haveCount++;
            } catch (_) {}
          }
          if (haveCount < group.count) {
            needed.push({ unitType: group.unitType, count: group.count - haveCount });
          }
        }

        if (needed.length === 0) {
          // 招募完毕，开始执行
          team.state = "executing";
          team.scriptIndex = 0;
          this.setRallyPoint(team);
          console.log("[AiEngine] Team " + team.teamType.name + " fully recruited (" + team.unitIds.length + " units)");
          return;
        }

        // 从空闲单位中招募
        if (tick % 30 === 0) {
          for (var ni = 0; ni < needed.length; ni++) {
            var need = needed[ni];
            var freeUnits = this.findFreeUnits(need.unitType);
            for (var fi = 0; fi < freeUnits.length && team.unitIds.length < 30; fi++) {
              if (team.unitIds.indexOf(freeUnits[fi]) < 0) {
                team.unitIds.push(freeUnits[fi]);
                if (team.unitIds.filter(function (uid) {
                  try { var u = this.gameApi.getUnitData(uid); return u && u.name === need.unitType; }
                  catch (_) { return false; }
                }.bind(this)).length >= need.count) break;
              }
            }
          }
        }
      };

      // 寻找空闲单位
      AiEngine.prototype.findFreeUnits = function (unitType) {
        try {
          var allUnits = this.gameApi.getVisibleUnits(this.playerName, "self", function (r) {
            return r.isSelectableCombatant && r.name === unitType;
          });
          return allUnits || [];
        } catch (_) { return []; }
      };

      // 设置集结点
      AiEngine.prototype.setRallyPoint = function (team) {
        try {
          var playerData = this.gameApi.getPlayerData(this.playerName);
          team.rallyPoint = new Vector2(playerData.startLocation.x + 5, playerData.startLocation.y + 5);
        } catch (_) {}
      };

      // 选择攻击目标
      AiEngine.prototype.pickTarget = function (team) {
        try {
          var enemyUnits = this.gameApi.getVisibleUnits(this.playerName, "enemy", function (r) {
            return r.isSelectableCombatant || r.type === ObjectType.Building;
          });
          if (enemyUnits.length > 0) {
            // 选第一个可见敌人
            var targetData = this.gameApi.getUnitData(enemyUnits[0]);
            if (targetData) {
              return new Vector2(targetData.tile.rx, targetData.tile.ry);
            }
          }
        } catch (_) {}
        return team.rallyPoint;
      };

      // 执行阶段：执行脚本
      AiEngine.prototype.updateExecuting = function (team, tick) {
        if (!team.scriptType || team.unitIds.length === 0) {
          team.state = "done";
          return;
        }

        // 每30tick执行一步脚本
        if (tick % 30 !== 0) return;

        var actions = team.scriptType.actions;
        if (team.scriptIndex >= actions.length) {
          team.state = "done";
          return;
        }

        var action = actions[team.scriptIndex];
        if (!action) { team.scriptIndex++; return; }

        this.executeAction(team, action, tick);
        team.scriptIndex++;
      };

      // 执行单个脚本动作
      AiEngine.prototype.executeAction = function (team, action, tick) {
        try {
          switch (action.action) {
            case 0: // Attack — 攻击
            case 14: // AttackMove
              var target = team.attackTarget;
              if (!target) {
                target = this.pickTarget(team);
                team.attackTarget = target;
              }
              if (target) {
                this.orderUnits(team.unitIds, OrderType.AttackMove, target.x, target.y);
              }
              break;
            case 1: // Move
              if (team.rallyPoint) {
                this.orderUnits(team.unitIds, OrderType.Move, team.rallyPoint.x, team.rallyPoint.y);
              }
              break;
            case 2: // Guard — 守卫
              this.orderUnits(team.unitIds, OrderType.Guard);
              break;
            case 3: // Deploy — 展开（MCV等）
              this.orderUnits(team.unitIds, OrderType.DeploySelected);
              break;
            case 4: // Deploy 到目标
              if (team.attackTarget) {
                this.orderUnits(team.unitIds, OrderType.DeploySelected, team.attackTarget.x, team.attackTarget.y);
              }
              break;
            case 49: // Unload
              this.orderUnits(team.unitIds, OrderType.Unload);
              break;
            case 5: // Move to target
              if (team.attackTarget) {
                this.orderUnits(team.unitIds, OrderType.Move, team.attackTarget.x, team.attackTarget.y);
              }
              break;
            case 54: // Return to base
              try {
                var pd = this.gameApi.getPlayerData(this.playerName);
                this.orderUnits(team.unitIds, OrderType.Move, pd.startLocation.x, pd.startLocation.y);
              } catch (_) {}
              break;
          }
        } catch (_) {}
      };

      // 命令单位
      AiEngine.prototype.orderUnits = function (unitIds, order, x, y) {
        if (!unitIds || unitIds.length === 0) return;
        // 分批发送命令（最多5个单位一组）
        var batchSize = 5;
        for (var i = 0; i < unitIds.length; i += batchSize) {
          var batch = unitIds.slice(i, i + batchSize);
          try {
            if (x !== undefined && y !== undefined) {
              this.gameApi.orderUnits(batch, order, x, y);
            } else {
              this.gameApi.orderUnits(batch, order);
            }
          } catch (_) {}
        }
      };

      // ============================================================
      // 对外接口
      // ============================================================

      // 获取当前科技等级
      AiEngine.prototype.getTechLevel = function () { return this.techLevel; };

      // 获取活跃队伍信息（供外部Bot决策）
      AiEngine.prototype.getActiveTeamInfo = function () {
        return this.activeTeams.filter(function (t) { return t.state !== "done"; }).map(function (t) {
          return {
            name: t.teamType.name,
            state: t.state,
            unitCount: t.unitIds.length,
            scriptIndex: t.scriptIndex,
            priority: t.teamType.priority
          };
        });
      };

      // 获取当前应建造的单位列表（基于科技等级）
      AiEngine.prototype.getBuildQueue = function () {
        if (!this.parsed || !this.parsed.buildQueues) return [];
        var queues = this.parsed.buildQueues;
        var tl = this.techLevel;
        // 按科技等级查找最匹配的队列
        var bestKey = null, bestMatch = -1;
        var keys = Object.keys(queues);
        for (var ki = 0; ki < keys.length; ki++) {
          // 尝试从键名提取科技等级（如 "BuildQueue3" → 3）
          var match = keys[ki].match(/(\d+)/);
          if (match) {
            var lv = parseInt(match[1]);
            if (lv <= tl && lv > bestMatch) {
              bestMatch = lv;
              bestKey = keys[ki];
            }
          }
        }
        if (bestKey && queues[bestKey]) return queues[bestKey];
        // 回退到默认队列
        return queues["__default__"] || [];
      };

      // 重置所有触发器状态（用于新游戏开始）
      AiEngine.prototype.reset = function () {
        this.activeTeams = [];
        this.triggerFired = {};
        this.totalTeamsCreated = 0;
        this.techLevel = 1;
        this.lastTriggerCheck = 0;
      };

      e("AiEngine", AiEngine);
    },
  };
});
