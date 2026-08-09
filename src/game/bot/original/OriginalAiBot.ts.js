// === Custom AI module: game/bot/original/OriginalAiBot ===
// 基于 AIMD.INI 的原版 AI Bot — 支持 Easy / Medium / Brutal 三个难度
// 所有策略由 AiApi 从 AIMD.INI 配置驱动
System.register("game/bot/original/OriginalAiBot", [
  "game/api/index",
  "game/ai/AiApi"
], function (e, t) {
  "use strict";
  var A, AiApi;
  t && t.id;
  return {
    setters: [
      function (x) { A = x; },
      function (x) { AiApi = x.AiApi; },
    ],
    execute: function () {
      var Bot = A.Bot;
      var ObjectType = A.ObjectType;
      var OrderType = A.OrderType;
      var QueueType = A.QueueType;
      var SpeedType = A.SpeedType;
      var MovementZone = A.MovementZone;

      // ============================================================
      // 难度配置
      // ============================================================
      var DIFFICULTY_CFG = {
        // Easy: 反应慢，经济弱，不积极
        Easy: {
          triggerCooldown: 120,       // 触发器检查间隔（tick）
          buildCheckInterval: 90,     // 建造检查间隔
          minAttackGroup: 6,          // 最小进攻编队
          scoutEarly: false,          // 是否开局侦查
          incomeMultiplier: 1.0,      // 收入倍率
          maxActiveTeams: 2,          // 最大活跃队伍数
          grindInterval: 600,         // 缴获单位送回收厂的检查间隔
        },
        // Medium: 标准 AI
        Medium: {
          triggerCooldown: 60,
          buildCheckInterval: 45,
          minAttackGroup: 10,
          scoutEarly: true,
          incomeMultiplier: 1.5,
          maxActiveTeams: 4,
          grindInterval: 300,
        },
        // Brutal: 反应快，经济强，进攻积极
        Brutal: {
          triggerCooldown: 30,
          buildCheckInterval: 30,
          minAttackGroup: 14,
          scoutEarly: true,
          incomeMultiplier: 2.0,
          maxActiveTeams: 6,
          grindInterval: 180,
        },
      };

      // ============================================================
      // OriginalAiBot
      // ============================================================
      var OriginalAiBot = class extends Bot {
        constructor(name, country, difficulty) {
          super(name, country);
          this.difficulty = difficulty || "Medium";
          this.cfg = DIFFICULTY_CFG[this.difficulty] || DIFFICULTY_CFG.Medium;
          this.aiApi = null;
          this.initialized = false;
          this.lastBuildCheck = 0;
          this.lastDeployTick = -999;
          this.lastScoutTick = 0;
          this.lastGrindTick = 0;
          this.buildQueue = [];       // [{unitType, count}]
          this.currentTask = null;    // 当前主要任务
        }

        // ============================================================
        // 生命周期
        // ============================================================

        onGameStart(game) {
          // 初始化 AiApi
          try {
            this.aiApi = new AiApi(game, this.actionsApi, this.name, {
              triggerCooldown: this.cfg.triggerCooldown,
            });
            this.aiApi.init();
            this.logger && this.logger.info("[OriginalAiBot] " + this.difficulty + " initialized with AiApi");
          } catch (e) {
            this.logger && this.logger.info("[OriginalAiBot] AiApi init failed: " + (e.message || e));
          }
        }

        onGameTick(game) {
          if (!this.initialized) {
            // 首次 tick 时确保 aiApi 已初始化（兜底）
            if (!this.aiApi) {
              try {
                this.aiApi = new AiApi(game, this.actionsApi, this.name, {
                  triggerCooldown: this.cfg.triggerCooldown,
                });
                this.aiApi.init();
              } catch (_) { return; }
            }
            this.initialized = true;
          }

          try {
            this._tick(game);
          } catch (err) {
            this.logger && this.logger.warn("[OriginalAiBot] Tick error: " + (err && err.message));
          }
        }

        _tick(game) {
          var tick = game.getCurrentTick();

          // ---- 1. AiApi 更新（触发器评估 + 队伍管理） ----
          if (this.aiApi) {
            this.aiApi.onTick();
          }

          // ---- 2. MCV 展开 ----
          this._tryDeployMCV(game, tick);

          // ---- 3. 建造与生产 ----
          if (tick - this.lastBuildCheck >= this.cfg.buildCheckInterval) {
            this.lastBuildCheck = tick;
            this._handleProduction(game, tick);
          }

          // ---- 4. 侦查 ----
          if (this.cfg.scoutEarly && tick - this.lastScoutTick > 600) {
            this.lastScoutTick = tick;
            this._tryScout(game);
          }

          // ---- 5. 单位任务（攻击/防守） ----
          this._handleUnits(game, tick);

          // ---- 5.5 部队回收厂：缴获单位换资金 ----
          this._tryGrind(game, tick);

          // ---- 6. 诊断输出 ----
          if (this.getDebugMode()) {
            this._pushDebug(game);
          }
        }

        // ============================================================
        // MCV 展开
        // ============================================================
        _tryDeployMCV(game, tick) {
          try {
            var baseUnit = game.getGeneralRules().baseUnit || [];
            var mcvIds = game.getVisibleUnits(this.name, "self", function (r) {
              return baseUnit.indexOf(r.name) >= 0;
            });
            if (mcvIds.length > 0 && tick - this.lastDeployTick >= 10) {
              this.actionsApi.orderUnits([mcvIds[0]], OrderType.DeploySelected);
              this.lastDeployTick = tick;
            }
          } catch (_) {}
        }

        // ============================================================
        // 建造与生产（使用 AiApi 的建造建议）
        // ============================================================
        _handleProduction(game, tick) {
          try {
            var snap = this._makeSnapshot(game);
            if (!snap.hasCY) return; // 没展开之前不建造

            // 检查存活
            if (snap.buildings.length === 0 && snap.army.length === 0) {
              this.actionsApi.quitGame();
              return;
            }

            var buildAdvice = this.aiApi ? this.aiApi.getBuildAdvice() : null;
            var credits = snap.credits;

            // ---- 建筑建造 ----
            if (buildAdvice && buildAdvice.buildings.length > 0) {
              var nextBld = buildAdvice.buildings[0];
              if (nextBld && this._canAfford(game, nextBld.unitType, credits)) {
                this._queueBuilding(game, nextBld.unitType);
              }
            }

            // ---- 步兵生产 ----
            if (buildAdvice && buildAdvice.infantry.length > 0) {
              var nextInf = buildAdvice.infantry[0];
              if (nextInf && this._canAfford(game, nextInf.unitType, credits)) {
                this._queueUnit(QueueType.Infantry, nextInf.unitType, ObjectType.Infantry);
              }
            }

            // ---- 车辆生产 ----
            if (buildAdvice && buildAdvice.vehicles.length > 0) {
              var nextVeh = buildAdvice.vehicles[0];
              if (nextVeh && this._canAfford(game, nextVeh.unitType, credits)) {
                this._queueUnit(QueueType.Vehicles, nextVeh.unitType, ObjectType.Vehicle);
              }
            }

            // ---- 飞行器生产 ----
            if (buildAdvice && buildAdvice.aircraft.length > 0) {
              var nextAir = buildAdvice.aircraft[0];
              if (nextAir && this._canAfford(game, nextAir.unitType, credits)) {
                this._queueUnit(QueueType.Aircraft, nextAir.unitType, ObjectType.Aircraft);
              }
            }
          } catch (_) {}
        }

        // 加入建筑队列
        _queueBuilding(game, buildingName) {
          try {
            var queues = this._getQueueInfo(game);
            // 避免重复队列
            if (queues.Structures && queues.Structures.status === "active" && queues.Structures.size > 0) return;
            this.actionsApi.queueForProduction(QueueType.Structures, buildingName, ObjectType.Building, 1);
          } catch (_) {}
        }

        // 加入单位生产队列（检查队列是否已满）
        _queueUnit(queueType, unitName, objType) {
          try {
            this.actionsApi.queueForProduction(queueType, unitName, objType, 1);
          } catch (_) {}
        }

        // 检查是否能买得起
        _canAfford(game, unitType, credits) {
          try {
            var rules = game.rulesApi;
            var cost = 0;
            try {
              var obj = rules.getObject(unitType, ObjectType.Building);
              if (!obj) obj = rules.getObject(unitType, ObjectType.Vehicle);
              if (!obj) obj = rules.getObject(unitType, ObjectType.Infantry);
              if (!obj) obj = rules.getObject(unitType, ObjectType.Aircraft);
              if (obj) cost = obj.cost || 0;
            } catch (_) {}
            // 留 20% 余量
            return credits >= cost * 1.2;
          } catch (_) { return true; }
        }

        // 获取队列信息
        _getQueueInfo(game) {
          try {
            return {
              Structures: this.productionApi.getQueueData(QueueType.Structures),
              Infantry: this.productionApi.getQueueData(QueueType.Infantry),
              Vehicles: this.productionApi.getQueueData(QueueType.Vehicles),
              Aircraft: this.productionApi.getQueueData(QueueType.Aircraft),
            };
          } catch (_) { return {}; }
        }

        // ============================================================
        // 侦查
        // ============================================================
        _tryScout(game) {
          try {
            var dogs = game.getVisibleUnits(this.name, "self", function (r) {
              return r.name === "DOG" || r.name === "YARI" || r.sight >= 8;
            });
            if (dogs.length > 0) {
              // 派狗往敌方方向侦查
              var players = game.getPlayers();
              for (var pi = 0; pi < players.length; pi++) {
                if (players[pi] !== this.name) {
                  var pData = game.getPlayerData(players[pi]);
                  if (pData && pData.startLocation) {
                    this.actionsApi.orderUnits([dogs[0]], OrderType.Move,
                      pData.startLocation.x, pData.startLocation.y);
                    break;
                  }
                }
              }
            }
          } catch (_) {}
        }

        // ============================================================
        // 单位任务
        // ============================================================
        _handleUnits(game, tick) {
          try {
            // 获取 aiApi 的战术建议
            var tac = this.aiApi ? this.aiApi.getTacticalAdvice() : null;
            var activeTeams = this.aiApi ? this.aiApi.getActiveTeams() : [];

            // 如果有活跃队伍在执行，让 AiEngine 管理，Bot 不干预
            if (activeTeams.length > 0) return;

            // 没有活跃队伍时，收集空闲单位进行自主进攻
            if (!tac || !tac.shouldAttack) return;

            var enemyUnits = game.getVisibleUnits(this.name, "enemy", function (r) {
              return r.isSelectableCombatant;
            });

            if (enemyUnits.length === 0) return;

            // 收集我方战斗单位
            var attackForce = game.getVisibleUnits(this.name, "self", function (r) {
              return r.isSelectableCombatant && r.canMove !== false;
            });

            if (attackForce.length >= this.cfg.minAttackGroup) {
              // 攻击最近敌人
              var target = game.getUnitData(enemyUnits[0]);
              if (target) {
                this.actionsApi.orderUnits(attackForce, OrderType.AttackMove, target.tile.rx, target.tile.ry);
              }
            }
          } catch (_) {}
        }

        // ============================================================
        // 部队回收厂：把心控缴获的单位送去回收成资金
        // ============================================================
        _tryGrind(game, tick) {
          try {
            if (tick - this.lastGrindTick < this.cfg.grindInterval) return;
            this.lastGrindTick = tick;

            // 找到己方部队回收厂（Grinding=yes 建筑）
            var grinderId = null;
            var selfIds = game.getVisibleUnits(this.name, "self", function () { return true; });
            for (var i = 0; i < selfIds.length; i++) {
              var ud = game.getUnitData(selfIds[i]);
              if (ud && ud.rules && ud.rules.type === ObjectType.Building && ud.rules.grinding) {
                grinderId = selfIds[i];
                break;
              }
            }
            if (!grinderId) return;

            // 资金充足时保留缴获单位用于作战；缺钱时送去回收厂换钱
            if (this._makeSnapshot(game).credits > 3000) return;

            var grindIds = [];
            for (var j = 0; j < selfIds.length; j++) {
              var d = game.getUnitData(selfIds[j]);
              if (!d || !d.rules || d.rules.type === ObjectType.Building) continue;
              if (!d.mindControlledBy) continue; // 仅处理被己方心控的缴获单位
              if (d.rules.movementZone === MovementZone.Fly) continue; // 空中单位不能进回收厂
              grindIds.push(selfIds[j]);
              if (grindIds.length >= 3) break; // 每次送少量，避免一次性损失过多兵力
            }
            if (grindIds.length === 0) return;

            this.actionsApi.orderUnits(grindIds, OrderType.Occupy, grinderId);
          } catch (_) {}
        }

        // ============================================================
        // 快照
        // ============================================================
        _makeSnapshot(game) {
          var r = { tick: game.getCurrentTick(), buildings: [], army: [], harvs: [], credits: 0,
            power: { total: 0, drain: 0 }, hasCY: false, queues: {} };

          try {
            var pd = game.getPlayerData(this.name);
            if (pd) {
              r.credits = pd.credits;
              r.power = pd.power;
            }
          } catch (_) {}

          try {
            r.queues = this._getQueueInfo(game);
          } catch (_) {}

          try {
            var selfUnits = game.getVisibleUnits(this.name, "self", function (rr) { return true; });
            for (var ui = 0; ui < selfUnits.length; ui++) {
              var ud = game.getUnitData(selfUnits[ui]);
              if (!ud) continue;
              if (ud.rules && ud.rules.type === ObjectType.Building) {
                r.buildings.push(ud);
                if (ud.rules.constructionYard) r.hasCY = true;
                if (ud.rules.harvester) r.harvs.push(ud);
              } else if (ud.isSelectableCombatant) {
                r.army.push(ud);
                if (ud.rules && ud.rules.harvester) r.harvs.push(ud);
              }
            }
          } catch (_) {}

          return r;
        }

        // ============================================================
        // 诊断
        // ============================================================
        _pushDebug(game) {
          try {
            var tac = this.aiApi ? this.aiApi.getTacticalAdvice() : null;
            var tl = this.aiApi ? this.aiApi.getTechLevel() : 0;
            var teams = this.aiApi ? this.aiApi.getActiveTeams() : [];
            var snap = this._makeSnapshot(game);

            var d = "[AiBot " + this.difficulty + "] TL=" + tl +
              " $" + Math.floor(snap.credits) +
              " B=" + snap.buildings.length +
              " A=" + snap.army.length;
            if (tac) d += " S=" + tac.stance + " T=" + tac.threatLevel;
            if (teams.length > 0) d += " Teams=" + teams.length;
            this.actionsApi.setGlobalDebugText(d);
          } catch (_) {}
        }

        // 聊天钩子（预留）
        onChatMessage(senderName, message, gameApi) {}
      };

      e("OriginalAiBot", OriginalAiBot);
    },
  };
});
