/**
 * OriginalAiBot — 基于 AIMD.INI 的原版 AI Bot（Easy / Medium / Brutal）。
 *
 * 所有策略由 AiApi 从 AIMD.INI 配置驱动；本类负责生命周期、节流调度、
 * MCV 展开、建造/生产入队、侦查、闲置进攻与部队回收厂等外围逻辑。
 *
 * 由 game/bot/original/OriginalAiBot.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */
import * as ApiIndexModule from "game/api/index"; // 孪生
import { AiApi } from "game/ai/AiApi"; // 已转换

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const A: any = ApiIndexModule as any;
const Bot: any = A.Bot;
const ObjectType: any = A.ObjectType;
const OrderType: any = A.OrderType;
const QueueType: any = A.QueueType;
const SpeedType: any = A.SpeedType;
const MovementZone: any = A.MovementZone;

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================
// 难度配置
// ============================================================
/** 单档难度参数。 */
interface DifficultyCfg {
  /** 触发器检查间隔（tick）。 */
  triggerCooldown: number;
  /** 建造检查间隔。 */
  buildCheckInterval: number;
  /** 最小进攻编队。 */
  minAttackGroup: number;
  /** 是否开局侦查。 */
  scoutEarly: boolean;
  /** 收入倍率。 */
  incomeMultiplier: number;
  /** 最大活跃队伍数。 */
  maxActiveTeams: number;
  /** 缴获单位送回收厂的检查间隔。 */
  grindInterval: number;
}

/** Easy / Medium / Brutal 三档参数表。 */
const DIFFICULTY_CFG: Record<string, DifficultyCfg> = {
  // Easy: 反应慢，经济弱，不积极
  Easy: {
    triggerCooldown: 120, // 触发器检查间隔（tick）
    buildCheckInterval: 90, // 建造检查间隔
    minAttackGroup: 6, // 最小进攻编队
    scoutEarly: false, // 是否开局侦查
    incomeMultiplier: 1.0, // 收入倍率
    maxActiveTeams: 2, // 最大活跃队伍数
    grindInterval: 600, // 缴获单位送回收厂的检查间隔
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
export class OriginalAiBot extends Bot {
  /** 难度键（Easy/Medium/Brutal；非法值回落 Medium）。 */
  difficulty: any;
  /** 当前难度参数（DIFFICULTY_CFG 查表结果）。 */
  cfg: DifficultyCfg;
  /** AIMD 策略引擎门面。 */
  aiApi: any;
  /** 是否已完成首次 tick 兜底初始化。 */
  initialized: boolean;
  /** 上次建造调度 tick。 */
  lastBuildCheck: number;
  /** 上次 MCV 展开指令 tick。 */
  lastDeployTick: number;
  /** 上次侦查 tick。 */
  lastScoutTick: number;
  /** 上次部队回收 tick。 */
  lastGrindTick: number;
  /** 建造/生产意向队列 [{unitType, count}]（孪生保留字段）。 */
  buildQueue: any[];
  /** 当前主要任务描述（预留）。 */
  currentTask: any;

  constructor(name: any, country: any, difficulty: any) {
    super(name, country);
    this.difficulty = difficulty || "Medium";
    this.cfg = DIFFICULTY_CFG[this.difficulty] || DIFFICULTY_CFG.Medium;
    this.aiApi = null;
    this.initialized = false;
    this.lastBuildCheck = 0;
    this.lastDeployTick = -999;
    this.lastScoutTick = 0;
    this.lastGrindTick = 0;
    this.buildQueue = []; // [{unitType, count}]
    this.currentTask = null; // 当前主要任务
  }

  // ============================================================
  // 生命周期
  // ============================================================

  /** 创建并初始化 AiApi（失败仅告警，不中断对局）。 */
  onGameStart(game: any): void {
    // 初始化 AiApi
    try {
      this.aiApi = new AiApi(game, this.actionsApi, this.name, {
        triggerCooldown: this.cfg.triggerCooldown,
      });
      this.aiApi.init();
      console.log(
        "[OriginalAiBot] " +
          this.difficulty +
          " initialized with AiApi (engine parsed=" +
          !!(this.aiApi.engine && this.aiApi.engine.parsed) +
          ")",
      );
      this.logger && this.logger.info("[OriginalAiBot] " + this.difficulty + " initialized with AiApi");
    } catch (e) {
      console.warn("[OriginalAiBot] AiApi init failed for " + this.name + ": " + ((e && e.message) || e));
      this.logger && this.logger.info("[OriginalAiBot] AiApi init failed: " + ((e as any).message || e));
    }
  }

  /** 每 tick：兜底初始化 + 分步调度。 */
  onGameTick(game: any): void {
    if (!this.initialized) {
      // 首次 tick 时确保 aiApi 已初始化（兜底）
      if (!this.aiApi) {
        try {
          this.aiApi = new AiApi(game, this.actionsApi, this.name, {
            triggerCooldown: this.cfg.triggerCooldown,
          });
          this.aiApi.init();
        } catch (_) {
          return;
        }
      }
      this.initialized = true;
    }

    try {
      this._tick(game);
    } catch (err) {
      this.logger && this.logger.warn("[OriginalAiBot] Tick error: " + ((err as any) && (err as any).message));
    }
  }

  /** 单 tick 主流程：引擎更新 → 展开 → 建造 → 侦查 → 单位任务 → 回收 → 诊断。 */
  _tick(game: any): void {
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
  /** 尝试对基地车下达 DeploySelected（10 tick 节流）。 */
  _tryDeployMCV(game: any, tick: any): void {
    try {
      var baseUnit = game.getGeneralRules().baseUnit || [];
      var mcvIds = game.getVisibleUnits(this.name, "self", function (r: any) {
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
  /** 按 AiApi.getBuildAdvice 将建筑/步兵/车辆/飞行器入队。 */
  _handleProduction(game: any, tick: any): void {
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

  /** 加入建筑队列（活跃且非空时跳过，避免重复）。 */
  _queueBuilding(game: any, buildingName: any): void {
    try {
      var queues = this._getQueueInfo(game);
      // 避免重复队列
      if (queues.Structures && queues.Structures.status === "active" && queues.Structures.size > 0) return;
      this.actionsApi.queueForProduction(QueueType.Structures, buildingName, ObjectType.Building, 1);
    } catch (_) {}
  }

  /** 加入单位生产队列（引擎侧校验容量/前置）。 */
  _queueUnit(queueType: any, unitName: any, objType: any): void {
    try {
      this.actionsApi.queueForProduction(queueType, unitName, objType, 1);
    } catch (_) {}
  }

  /** 造价 * 1.2 留 20% 余量；查价失败按可买得起处理。 */
  _canAfford(game: any, unitType: any, credits: any): any {
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
    } catch (_) {
      return true;
    }
  }

  /** 读取四条生产队列状态（异常时返回空对象）。 */
  _getQueueInfo(game: any): any {
    try {
      return {
        Structures: this.productionApi.getQueueData(QueueType.Structures),
        Infantry: this.productionApi.getQueueData(QueueType.Infantry),
        Vehicles: this.productionApi.getQueueData(QueueType.Vehicles),
        Aircraft: this.productionApi.getQueueData(QueueType.Aircraft),
      };
    } catch (_) {
      return {};
    }
  }

  // ============================================================
  // 侦查
  // ============================================================
  /** 开局侦查：把首个高视野/犬单位派向第一个非己方起点。 */
  _tryScout(game: any): void {
    try {
      var dogs = game.getVisibleUnits(this.name, "self", function (r: any) {
        return r.name === "DOG" || r.name === "YARI" || r.sight >= 8;
      });
      if (dogs.length > 0) {
        // 派狗往敌方方向侦查
        var players = game.getPlayers();
        for (var pi = 0; pi < players.length; pi++) {
          if (players[pi] !== this.name) {
            var pData = game.getPlayerData(players[pi]);
            if (pData && pData.startLocation) {
              this.actionsApi.orderUnits([dogs[0]], OrderType.Move, pData.startLocation.x, pData.startLocation.y);
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
  /**
   * 无活跃 AiEngine 队伍且战术建议允许进攻时，
   * 攒够 minAttackGroup 后 attack-move 最近可见敌人。
   */
  _handleUnits(game: any, tick: any): void {
    try {
      // 获取 aiApi 的战术建议
      var tac = this.aiApi ? this.aiApi.getTacticalAdvice() : null;
      var activeTeams = this.aiApi ? this.aiApi.getActiveTeams() : [];

      // 如果有活跃队伍在执行，让 AiEngine 管理，Bot 不干预
      if (activeTeams.length > 0) return;

      // 没有活跃队伍时，收集空闲单位进行自主进攻
      if (!tac || !tac.shouldAttack) return;

      var enemyUnits = game.getVisibleUnits(this.name, "enemy", function (r: any) {
        return r.isSelectableCombatant;
      });

      if (enemyUnits.length === 0) return;

      // 收集我方战斗单位
      var attackForce = game.getVisibleUnits(this.name, "self", function (r: any) {
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
  /** 资金 <3000 时把己方心控缴获的非建筑/非空军单位送入回收厂。 */
  _tryGrind(game: any, tick: any): void {
    try {
      if (tick - this.lastGrindTick < this.cfg.grindInterval) return;
      this.lastGrindTick = tick;

      // 找到己方部队回收厂（Grinding=yes 建筑）
      var grinderId: any = null;
      var selfIds = game.getVisibleUnits(this.name, "self", function () {
        return true;
      });
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

      var grindIds: any[] = [];
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
  /** 轻量态势快照：资金/电力/建筑/军队/矿车/建造厂/队列。 */
  _makeSnapshot(game: any): any {
    var r: any = {
      tick: game.getCurrentTick(),
      buildings: [],
      army: [],
      harvs: [],
      credits: 0,
      power: { total: 0, drain: 0 },
      hasCY: false,
      queues: {},
    };

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
      var selfUnits = game.getVisibleUnits(this.name, "self", function (rr: any) {
        return true;
      });
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
  /** debug 模式下向画面顶部输出一行摘要。 */
  _pushDebug(game: any): void {
    try {
      var tac = this.aiApi ? this.aiApi.getTacticalAdvice() : null;
      var tl = this.aiApi ? this.aiApi.getTechLevel() : 0;
      var teams = this.aiApi ? this.aiApi.getActiveTeams() : [];
      var snap = this._makeSnapshot(game);

      var d =
        "[AiBot " +
        this.difficulty +
        "] TL=" +
        tl +
        " $" +
        Math.floor(snap.credits) +
        " B=" +
        snap.buildings.length +
        " A=" +
        snap.army.length;
      if (tac) d += " S=" + tac.stance + " T=" + tac.threatLevel;
      if (teams.length > 0) d += " Teams=" + teams.length;
      this.actionsApi.setGlobalDebugText(d);
    } catch (_) {}
  }

  /** 聊天钩子（预留） */
  onChatMessage(senderName: any, message: any, gameApi: any) {}
}
