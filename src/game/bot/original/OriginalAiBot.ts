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
import { findPlacement } from "game/bot/original/Util"; // 通用螺旋选址

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
  /** 上次放置诊断日志 tick。 */
  lastPlaceDiagTick: number;
  /** 选址失败计数（按建筑名）。 */
  placeFailCounts: any;
  /**
   * 上一次"已就绪待放置"的类型与目标格（`类型@x,y`）。
   * 用途：识别 canPlaceBuilding 放行、但 placeBuilding 不落地的死循环。
   */
  lastPlaceAttempt: any;
  /** 上次生产诊断日志 tick。 */
  lastProdDiagTick: number;
  /** 上次单位生产 tick（30t 节流）。 */
  lastUnitProdTick: number;
  /** 上次矿车排产 tick（30t 节流，防 action 生效延迟期间重复请求）。 */
  lastHarvTick: number;
  /** 上次矿车诊断 tick（300t）。 */
  lastHarvDiagTick: number;
  /** 上次小队保留金计算 tick（30t 节流）。 */
  lastTeamReserveTick: number;
  /** 小队缺员单位的保留金额（最贵可生产缺员单价 × 1.2；0=无缺员）。 */
  teamReserveCost: number;
  /** 批次 5：当前基地警报（被攻击的建筑位置）。 */
  baseAlert: any;
  /** 批次 5：己方建筑血量快照（掉血检测）。 */
  buildingHealth: any;
  /** 批次 5：上次遇袭检测 tick。 */
  lastBaseAlertCheck: number;
  /** 批次 5：上次防御派遣 tick。 */
  lastDefenseOrderTick: number;
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
    this.lastPlaceDiagTick = 0;
    this.placeFailCounts = {};
    this.lastPlaceAttempt = {};
    this.lastProdDiagTick = 0;
    this.lastUnitProdTick = 0;
    this.lastHarvTick = 0;
    this.lastHarvDiagTick = 0;
    this.lastTeamReserveTick = 0;
    this.teamReserveCost = 0;
    this.baseAlert = null;
    this.buildingHealth = new Map();
    this.lastBaseAlertCheck = 0;
    this.lastDefenseOrderTick = 0;
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
        // 数值难度：0=简单 1=中等 2=困难（触发器难度列 + TeamDelays 索引用）
        difficulty: { Easy: 0, Medium: 1, Brutal: 2 }[this.difficulty] ?? 1,
        // 难度分层上限：引擎 canSpawnTriggerTeam 读取（原 TotalAITeamCap=30
        // 只是全局天花板，Easy/Medium 的”最大活跃队伍数”以前是死配置）
        maxActiveTeams: this.cfg.maxActiveTeams,
      });
      this.aiApi.init();
      // 注入生产 API（Build* 组按”本 house 可生产”过滤用）
      this.aiApi.engine.productionApi = this.productionApi;
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
          difficulty: { Easy: 0, Medium: 1, Brutal: 2 }[this.difficulty] ?? 1,
          maxActiveTeams: this.cfg.maxActiveTeams,
        });
          this.aiApi.init();
          this.aiApi.engine.productionApi = this.productionApi;
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

    // ---- 4.5 基地遇袭检测与响应（批次 5：被攻击 → 防御队/附近部队扑向警报点）----
    if (tick - (this.lastBaseAlertCheck || 0) >= 100) {
      this.lastBaseAlertCheck = tick;
      this._checkBaseAttack(game, tick);
    }
    if (
      this.baseAlert &&
      tick - this.baseAlert.tick < 600 &&
      tick - (this.lastDefenseOrderTick || 0) >= 100
    ) {
      this.lastDefenseOrderTick = tick;
      this._dispatchDefense(game, tick);
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
      // 己方已拥有任意建筑（基地车部署完成即 GACNST）→ 不再下达展开，
      // 否则 DeploySelected 的开关语义会把已展开的基地收回去（展开/收起循环根因）。
      // 注意不能用 rules.baseNormal 判断——它缺省为 true，连 MCV 自己都是。
      var hasBuilding =
        game.getVisibleUnits(
          this.name,
          "self",
          function (r: any) {
            return r.type === ObjectType.Building;
          },
        ).length > 0;
      if (hasBuilding) return;
      var mcvIds = game.getVisibleUnits(this.name, "self", function (r: any) {
        return baseUnit.indexOf(r.name) >= 0;
      });
      // 节流 200 tick：避开展开动画窗口（动画期 isDeployed 已为真，
      // 10 tick 节流的第二条指令会把车折回）。
      if (mcvIds.length > 0 && tick - this.lastDeployTick >= 200) {
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
      // 建筑有两条生产队列：普通建筑 → Structures，BuildCat=Combat 的防御
      // → Armory（Production.getQueueTypeForObject 按 buildCat 分流，人类玩家
      // 侧栏同样按这两个 tab 入队）。诊断/去重/放置/放弃必须按"目标建筑自己
      // 那条"处理——早先把防御硬排进 Structures，而 PlaceBuildingAction 放置时
      // 去 Armory 找 Ready 条目，防御永远落不了地还占死 Structures（容量 1），
      // 拖垮全部基建（2026-10-02 实测：AI 整局 0 防御、bldgs 冻结的根因）。
      var stStruct: any = this._getQueueData(QueueType.Structures);
      var stArmory: any = this._getQueueData(QueueType.Armory);
      // 飞行器队列只进诊断：容量 = 停机坪泊位 − 已占飞机（ProductionTrait），
      // 初始 0；demand 卡飞行器时先看它的 size/maxSize。
      var stAircraft: any = this._getQueueData(QueueType.Aircrafts);
      // 步兵/载具队列进诊断：demand 缺员"可生产(Y)但没产"时，用它们分辨
      // 是队列里有同名条目（去重挡住）还是买不起（credits 不足）。
      var stInfantry: any = this._getQueueData(QueueType.Infantry);
      var stVehicles: any = this._getQueueData(QueueType.Vehicles);
      // 批次 5 诊断：每 300 tick 打一次生产链路状态
      if (tick - (this.lastProdDiagTick || 0) >= 300) {
        this.lastProdDiagTick = tick;
        var advB = 0;
        try {
          advB = this.aiApi ? this.aiApi.getBuildAdvice().buildings.length : -1;
        } catch (_) {}
        // 诊断：当前科技等级 + 每条缺员需求是否"可生产"（N = 被引擎判定不可造，
        // 常见于该局 TechLevel 偏低或缺少对应工厂，此时队伍会一直等到超龄解散）
        var tl: any = "-";
        try {
          tl = this.aiApi ? this.aiApi.getTechLevel() : "-";
        } catch (_) {}
        var dSummary = "-";
        try {
          var dm = this.aiApi && this.aiApi.engine
            ? this.aiApi.engine.getUnitDemands()
            : [];
          var self2 = this;
          dSummary = dm
            .map(function (d: any) {
              var flag = "?";
              try {
                var o = self2._resolveRulesObject(game, d.unitType, [
                  ObjectType.Infantry,
                  ObjectType.Vehicle,
                  ObjectType.Aircraft,
                ]);
                flag = !o
                  ? "noObj"
                  : self2.productionApi.isAvailableForProduction(o)
                    ? "Y"
                    : "N";
              } catch (_) {}
              return d.unitType + "x" + d.count + ":" + flag;
            })
            .join("|");
        } catch (_) {}
        var qBrief = function (q: any) {
          if (!q) return "noApi";
          var items = q.items
            ? q.items
                .map(function (i: any) {
                  return (i.rules && i.rules.name) || "?";
                })
                .join("|")
            : "";
          return "status=" + q.status + " size=" + q.size + "/" + q.maxSize + " items=" + items;
        };
        console.log(
          "[OriginalAiBot] prod diag[" + this.name + "]: hasCY=" + snap.hasCY +
            " bldgs=" + snap.buildings.length +
            " credits=" + snap.credits +
            " adviceB=" + advB +
            " TL=" + tl +
            " demand{" + dSummary + "}" +
            " Q{S{" + qBrief(stStruct) + "} A{" + qBrief(stArmory) + "} AIR{" + qBrief(stAircraft) +
              "} INF{" + qBrief(stInfantry) + "} VEH{" + qBrief(stVehicles) + "}}",
        );
      }
      if (!snap.hasCY) return; // 没展开之前不建造

      // 检查存活
      if (snap.buildings.length === 0 && snap.army.length === 0) {
        this.actionsApi.quitGame();
        return;
      }

      var buildAdvice = this.aiApi ? this.aiApi.getBuildAdvice() : null;
      var credits = snap.credits;

      // ---- 小队资金保留（2026-10-04 实测修复）：缺员单位没钱排产时，建筑让位 ----
      // Brutal 的防御目标 25（原版 rulesmd *BaseDefenseCounts）+ 本函数建筑块
      // 先于单位生产执行，Structures/Armory 两条队列把收入持续抽干，credits
      // 常驻 200~800——小队缺员的昂贵单位（TELE=磁电 1000、MIND=1750，排产
      // 门槛是 cost×1.2）永远排不进生产队列；而 updateRecruiting 按原版语义
      // 对有部分成员的队伍永不解散 → 队伍永卡 recruiting（实测 Yuri
      // Finishers 8/13 卡了 2300+ tick）、AI 失去全部进攻压力。
      // 修法：存在"引擎判定可生产"的缺员单位时，只有 credits 买得起
      // （最贵缺员 × 1.2 + 本建筑 × 1.2）才允许入队新建筑。已在产条目照常
      // 走完，建筑队列排空后收入自然积累到门槛，缺员单位由下方单位生产块
      // 优先吃掉资金。查不到价/不可生产的缺员类型不参与保留——它们本来就
      // 排不了产，不能反过来把基建永久卡死。
      if (tick - this.lastTeamReserveTick >= 30) {
        this.lastTeamReserveTick = tick;
        var reserve = 0;
        try {
          var demandsR = this.aiApi && this.aiApi.engine
            ? this.aiApi.engine.getUnitDemands()
            : [];
          for (var ri = 0; ri < demandsR.length; ri++) {
            var rObj = this._resolveRulesObject(game, demandsR[ri].unitType, [
              ObjectType.Infantry,
              ObjectType.Vehicle,
              ObjectType.Aircraft,
            ]);
            if (
              rObj &&
              rObj.cost > 0 &&
              this.productionApi.isAvailableForProduction(rObj)
            ) {
              reserve = Math.max(reserve, rObj.cost * 1.2);
            }
          }
        } catch (_) {}
        this.teamReserveCost = reserve;
      }
      var teamReserve = this.teamReserveCost || 0;

      // ---- 建筑建造 ----
      if (buildAdvice && buildAdvice.buildings.length > 0) {
        var nextBld = buildAdvice.buildings[0];
        // 该建筑应排入的建造队列（BuildCat=Combat 防御 → Armory，其余 →
        // Structures）；去重也只看这一条——排错队列 = 放置时引擎按 buildCat
        // 回正确队列找 Ready 条目找不到，条目永停 Ready 占死整条队列。
        var nextBldQt = this._buildingQueueTypeFor(game, nextBld.unitType);
        var nextBldQ = nextBldQt === QueueType.Armory ? stArmory : stStruct;
        // 目标队列在产中（容量 1，size>=maxSize）时入队会被 UpdateQueueAction
        // 静默拒绝——不判满会对着忙队列每 30t 空转一次（实测 NAPSIS×44、
        // NALASR×24 刷屏；等在产条目 Ready→放置后下一轮自然排进去）
        var queueFull =
          !!nextBldQ &&
          typeof nextBldQ.size === "number" &&
          typeof nextBldQ.maxSize === "number" &&
          nextBldQ.size >= nextBldQ.maxSize;
        // 去重：引擎生产队列里已有同名条目（在产或待放置）时不重复入队——
        // 否则 Active 状态下引擎允许叠加数量，同款建筑会连造两三个
        var alreadyHave =
          !!nextBldQ &&
          !!nextBldQ.items &&
          nextBldQ.items.some(function (i: any) {
            return i.rules && i.rules.name === nextBld.unitType;
          });
        if (
          nextBld &&
          !alreadyHave &&
          !queueFull &&
          this._canAfford(game, nextBld.unitType, credits) &&
          // 保留金门槛：缺员单位还没钱排产时不再起新建筑（teamReserve=0
          // 时恒放行）。建筑从 advice 来、造价必能解析，解析失败按 0 处理
          // （= 只要求保留金本身，见 _objectCost）。
          credits >= this._objectCost(game, nextBld.unitType) * 1.2 + teamReserve
        ) {
          console.log(
            "[OriginalAiBot] queueing " + nextBld.unitType +
              " (queue=" + QueueType[nextBldQt] +
              " credits=" + credits + ")",
          );
          this._queueBuilding(game, nextBld.unitType, nextBldQt);
        }
      }

      // ---- 矿车维持（经济命脉：有精炼厂却没矿车 = 零收入，基建永久卡死）----
      this._maintainHarvesters(game, snap, credits);

      // ---- 单位生产（批次 5：小队缺员驱动，对齐原版招募-生产联动）----
      try {
        if (tick - (this.lastUnitProdTick || 0) >= 30) {
          this.lastUnitProdTick = tick;
          var demands = this.aiApi.engine.getUnitDemands();
          var rulesApi2 = game.rulesApi;
          var prodApi = this.productionApi;
          var produced = 0;
          // 不再加 `credits > 700` 这种拍脑袋地板：买得起与否一律交给下面
          // `_canAfford`（真实造价 × 1.2 余量，含 20% 预留）。那个硬地板会挡住
          // 便宜单位的正常生产——实测 AI4 只有 650 时，BRUTE（500，需 600）明明
          // 买得起，却因 650 < 700 整段循环不执行，队伍永远等不到兵。
          for (
            var di = 0;
            di < demands.length && produced < 2;
            di++
          ) {
          var dName = demands[di].unitType;
          var dTeams = (demands[di].teams || []).join("/");
          // 【不要在这里按名字硬跳过单位类型】曾经有一行 `if (dName === "YTNK") continue;`，
          // 理由是"YTNK 不在 [Units] 生产索引，原版引擎不创建该类型"——该前提是错的：
          // rulesmd.ini 的 [VehicleTypes] 第 63 项就是 YTNK（Gattling Tank，
          // Prerequisite=YAWEAP / TechLevel=4 / Owner=YuriCountry / Cost=600），
          // 引擎侧的 prod diag 也一直把它报成可用（`YTNKx3:Y`）。
          // 硬跳过导致两条尤里任务力（05FFBD7C-G "Yuri Armor - 1"、
          // 061183BC-G "Yuri Refinery Guards"）永远缺 1~2 台 YTNK，队伍卡在
          // recruiting 里直到永久（recruit diag 的 need=YTNK|YTNK 不消失）。
          // 生产/去重/买得起三关都由下面的通用逻辑兜住，无需特例。
          // 先解析对象与队列类型——去重要用的 qt 必须在这里就位。
          // （旧实现把 getQueueData(qt) 写在 `var qt = ...` 之前，var 提升使其为
          //  undefined → getQueue(undefined) 抛错被 catch 吞掉 → 去重永远失效 →
          //  quantity 被反复叠加，第一个兵永远造不完，队伍永远缺员。）
          var uObj = this._resolveRulesObject(game, dName, [
            ObjectType.Infantry,
            ObjectType.Vehicle,
            ObjectType.Aircraft,
          ]);
          if (!uObj) continue;
          if (!prodApi.isAvailableForProduction(uObj)) continue;
          var qt = prodApi.getQueueTypeForObject(uObj);
          // 该类型已在对应生产队列里 → 等它造完，绝不再叠 quantity
          // （重复入队会把生产进度拉长，单位永远造不出来 → 无限烧钱）
          var qData: any = null;
          try {
            qData = prodApi.getQueueData(qt);
          } catch (_) {
            qData = null;
          }
          if (
            qData &&
            qData.items &&
            qData.items.some(function (it: any) {
              return it.rules && it.rules.name === dName;
            })
          ) {
            continue;
          }
          // 队列已满：UpdateQueueAction 会静默拒绝入队，别再空转刷屏
          if (
            qData &&
            typeof qData.size === "number" &&
            typeof qData.maxSize === "number" &&
            qData.size >= qData.maxSize
          ) {
            continue;
          }
          var uObjType =
            qt === QueueType.Infantry
              ? ObjectType.Infantry
              // 枚举成员是 **Aircrafts**（ProductionQueue.ts: `Aircrafts = 4`），
              // 写成 Aircraft 会取到 undefined：本行永远不成立 → 飞行器被当成
              // Vehicle 传给 ActionsApi.queueForProduction → 其内部
              // `rules.getObject(name, Vehicle)` 对飞行器抛
              // `Missing rules for object "ORCA"` → 整个单位生产块每 30t 崩一次
              // （顺带把同轮其它单位的排产也一起中断）→ 日志刷屏 + AI 造不出任何飞机。
              : qt === QueueType.Aircrafts
                ? ObjectType.Aircraft
                : ObjectType.Vehicle;
          if (!this._canAfford(game, dName, credits)) continue;
          this.actionsApi.queueForProduction(qt, dName, uObjType, 1);
          produced++;
          console.log(
            "[OriginalAiBot] produce " + dName +
              " (demand=" + demands[di].count + ", teams=" + dTeams + ")",
          );
          }
        }
      } catch (e) {
        console.warn(
          "[OriginalAiBot] unit production failed: " + ((e && e.message) || e),
        );
      }

      // ---- 建筑落地（生产完成 Ready → 螺旋选址放置）----
      // 两条建造队列独立处理：Structures（普通建筑）与 Armory（防御）容量各
      // 1、并行建造（对齐原版两张建造页各造各的）。PlaceBuildingAction 按
      // buildCat 回对应队列找 Ready 条目——读哪条队列就往哪条 unqueue。
      try {
        var buildQueues = [QueueType.Structures, QueueType.Armory];
        var qBriefs: any[] = [];
        var placeBusy = false;
        for (var qi2 = 0; qi2 < buildQueues.length; qi2++) {
          var stDiag: any = this._getQueueData(buildQueues[qi2]);
          if (stDiag && stDiag.status !== 0 /* QueueStatus.Idle */) placeBusy = true;
          qBriefs.push(
            QueueType[buildQueues[qi2]] + "{status=" +
              (stDiag ? stDiag.status : "-") +
              " items=" + (stDiag && stDiag.items ? stDiag.items.length : "-") +
              "}",
          );
        }
        // 诊断降噪：有队列在产/待放置时 100t 一打；全空闲（status=0 恒定，
        // 无信息量）降频到 600t 心跳——真信号不被空转行淹没
        var placeDiagEvery = placeBusy ? 100 : 600;
        if (tick - (this.lastPlaceDiagTick || 0) >= placeDiagEvery) {
          this.lastPlaceDiagTick = tick;
          console.log("[OriginalAiBot] place diag: " + qBriefs.join(" "));
        }
        for (var qi3 = 0; qi3 < buildQueues.length; qi3++) {
          var placeQt = buildQueues[qi3];
          var st: any = this._getQueueData(placeQt);
          if (
            !st ||
            st.status !== 3 /* QueueStatus.Ready */ ||
            !st.items ||
            st.items.length === 0
          ) {
            continue;
          }
          var placeName = st.items[0].rules && st.items[0].rules.name;
          if (!placeName) continue;
          var cyTile = this._findCYTile(snap);
          var tile = findPlacement(this.game, this.name, placeName, cyTile);
          console.log(
            "[OriginalAiBot] place " + placeName + " (" + QueueType[placeQt] + "): tile=" +
              (tile ? tile.rx + "," + tile.ry : "null") +
              " cy=" + (cyTile ? cyTile.rx + "," + cyTile.ry : "null"),
          );
          if (!tile) {
            // 选址连续失败（基地周围没空位）→ 放弃该条目，别让它堵死
            // 整条建造队列（原版 FailedToPlaceNode 计数超限即取消的同语义）
            this.placeFailCounts[placeName] =
              (this.placeFailCounts[placeName] || 0) + 1;
            if (this.placeFailCounts[placeName] >= 3) {
              delete this.placeFailCounts[placeName];
              try {
                this.actionsApi.unqueueFromProduction(
                  placeQt,
                  placeName,
                  ObjectType.Building,
                  1,
                );
                console.log(
                  "[OriginalAiBot] gave up placing " + placeName +
                    " after repeated failures",
                );
              } catch (_) {}
            }
            continue;
          }
          // 死循环护栏：`canPlaceBuilding` 放行但 `placeBuilding` 不落地时，
          // 该生产项会一直停在 Ready，bot 每 tick 重试同一格 → 整条建造队列被
          // 永久占死。判据 = **同一类型连续落在同一格**（findPlacement 是确定
          // 性的，选址逻辑与放置判定一旦脱节就恒定返回同一格）。阈值 10 ≈
          // 10×建造间隔 tick，占队代价可控；真被临时单位挡格时选格会变化、
          // 计数自然清零，不会误伤。
          var attemptKey = placeName + "@" + tile.rx + "," + tile.ry;
          if (this.lastPlaceAttempt[placeName] === attemptKey) {
            this.placeFailCounts[placeName] =
              (this.placeFailCounts[placeName] || 0) + 1;
          } else {
            this.lastPlaceAttempt[placeName] = attemptKey;
            this.placeFailCounts[placeName] = 0;
          }
          if (this.placeFailCounts[placeName] >= 10) {
            this.placeFailCounts[placeName] = 0;
            delete this.lastPlaceAttempt[placeName];
            try {
              this.actionsApi.unqueueFromProduction(
                placeQt,
                placeName,
                ObjectType.Building,
                1,
              );
              console.log(
                "[OriginalAiBot] gave up placing " + placeName +
                  " (stuck at " + tile.rx + "," + tile.ry + ")",
              );
            } catch (_) {}
          } else {
            this.actionsApi.placeBuilding(placeName, tile.rx, tile.ry);
            // 从运行时队列移除已放置条目（防重复建造；被拆时维护器会重新追加）。
            // 队列挂在 AiEngine 上（this.productionQueue 是 AiEngine 的字段）。
            var engine = this.aiApi && this.aiApi.engine;
            var pq = engine && engine.productionQueue;
            if (pq) {
              for (var qi4 = pq.length - 1; qi4 >= 0; qi4--) {
                if (pq[qi4].typeName === placeName) {
                  pq.splice(qi4, 1);
                  break;
                }
              }
            }
          }
        }
      } catch (e) {
        console.warn(
          "[OriginalAiBot] place failed: " + ((e && e.message) || e),
        );
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
          // 同上：队列类型枚举是 Aircrafts（复数）
          this._queueUnit(QueueType.Aircrafts, nextAir.unitType, ObjectType.Aircraft);
        }
      }
    } catch (_) {}
  }

  /**
   * 加入建筑队列。queueType 必须是目标建筑自己的建造队列
   * （_buildingQueueTypeFor：BuildCat=Combat 防御 → Armory，其余 →
   * Structures）——PlaceBuildingAction 放置时按 getQueueForObject 回同一条
   * 队列找 Ready 条目，排错队列 = 永远落不了地（2026-10-02 实测防御建筑
   * 整局卡死的根因）。引擎侧 UpdateQueueAction 自带去重/前置校验。
   */
  _queueBuilding(game: any, buildingName: any, queueType: any): void {
    try {
      this.actionsApi.queueForProduction(
        queueType === undefined ? QueueType.Structures : queueType,
        buildingName,
        ObjectType.Building,
        1,
      );
    } catch (e: any) {
      console.warn(
        "[OriginalAiBot] queue " + buildingName + " failed: " + ((e && e.message) || e),
      );
    }
  }

  /** 找己方建造厂 tile 作为选址锚点（批次 5）；无则取第一个建筑。 */
  _findCYTile(snap: any): any {
    try {
      var list = (snap && snap.buildings) || [];
      for (var i = 0; i < list.length; i++) {
        var b = list[i];
        if (b && b.rules && b.rules.constructionYard && b.tile) return b.tile;
      }
      for (var j = 0; j < list.length; j++) {
        if (list[j] && list[j].tile) return list[j].tile;
      }
    } catch (_) {}
    return null;
  }

  /** 加入单位生产队列（引擎侧校验容量/前置）。 */
  _queueUnit(queueType: any, unitName: any, objType: any): void {
    try {
      this.actionsApi.queueForProduction(queueType, unitName, objType, 1);
    } catch (_) {}
  }

  /**
   * 维持矿车数量：每座精炼厂 2 台（原版遭遇战 AI 的配比）。
   * 缺了这一段，AI 造完精炼厂后没有任何收入来源，资金会停在初始值/被建筑
   * 耗尽后永远不再增长，基建与出兵全部停摆（表现为 credits 长期不动）。
   * 矿车出厂后的找矿由 HarvesterTrait 自动接管，无需 bot 手工派单。
   */
  _maintainHarvesters(game: any, snap: any, credits: any): void {
    try {
      var tick = snap.tick || 0;
      // 节流 30t：入队 action 到引擎生效有一帧延迟，不节流会在延迟窗口内
      // 反复请求（表现为每 tick 一条 queueing 日志、资金被瞬间榨干）。
      if (tick && this.lastHarvTick && tick - this.lastHarvTick < 30) return;

      // 精炼厂判定：优先 rules.refinery，但尤里 [YAREFN] 在 rulesmd 里
      // **没有写 Refinery=yes**（对照 GAREFN/NAREFN 有），所以再用
      // [AI] BuildRefinery 组名单兜底，否则尤里永远算不出精炼厂 = 零矿车。
      var refineryNames: any[] = [];
      try {
        var eng = this.aiApi && this.aiApi.engine;
        if (eng && eng.generalGroupByName) {
          refineryNames = eng.generalGroupByName("BuildRefinery") || [];
        }
      } catch (_) {}
      var refineryCount = 0;
      var refNames: any[] = [];
      // 诊断计数：ref 的来源必须可分辨（尤里阵营最容易误判）。
      // 关键结论：**不能用 rules.slaveMiner 排除任何建筑**。[YAREFN] 段自己就写着
      // `SlavesNumber=5`（TechnoRules.slaveMiner 就是看这个键），所以
      // 「真尤里精炼厂」与「奴隶矿车 SMIN 部署后的 YAREFN 形态」在该字段上完全一样，
      // 用它做排除会把尤里的精炼厂一并排除掉。实测（2026-10-01 日志）：AI4 明明
      // place 了 YAREFN，ref 却算成 0 → 连 harv diag 都不打（下面 refineryCount===0
      // 提前 return）→ 永不排矿车 → credits 长期钉在 650。
      // 语义上也站得住：部署体同样在采矿，本来就是精炼厂。数量另有 target 上限 4 兜底。
      var byFlag = 0;      // 命中 rules.refinery
      var byName = 0;      // 命中 [AI] BuildRefinery 名单（YAREFN 无 Refinery=yes，走这条）
      // 带奴隶矿工字段（rules.slaveMiner = 有 SlavesNumber/Slaves）的精炼厂数。
      // 注意：**它不能用来区分"真 YAREFN"和"奴隶矿车部署体"** —— [YAREFN] 段
      // 自己就有 SlavesNumber=5，两者恒等；对尤里而言该值 == ref，对盟军/苏军恒为 0。
      // 保留它只是为了确认"尤里的精炼厂识别没被 slaveMiner 逻辑排除掉"。
      var slaveCapable = 0;
      for (var bi = 0; bi < snap.buildings.length; bi++) {
        var b = snap.buildings[bi];
        if (!b) continue;
        var hasSlaveField = !!(b.rules && b.rules.slaveMiner);
        if (b.rules && b.rules.refinery) {
          refineryCount++;
          byFlag++;
          if (hasSlaveField) slaveCapable++;
          refNames.push(b.name);
        } else if (b.name && refineryNames.indexOf(b.name) >= 0) {
          refineryCount++;
          byName++;
          if (hasSlaveField) slaveCapable++;
          refNames.push(b.name);
        }
      }
      if (refineryCount === 0) return;
      // 上限 4 台：maintainPrerequisiteGroups 可能补出多座精炼厂，
      // 无上限时会一路排到十几台矿车，把资金彻底榨干。
      var target = Math.min(refineryCount * 2, 4);

      // 已在队列里的矿车（在产/待产）计入，避免重复排产
      var qData: any = null;
      try {
        qData = this.productionApi.getQueueData(QueueType.Vehicles);
      } catch (_) {
        qData = null;
      }
      var queued = 0;
      var harvNames2 = this._harvesterNames(game);
      if (qData && qData.items) {
        for (var qi = 0; qi < qData.items.length; qi++) {
          var it = qData.items[qi];
          if (!it || !it.rules) continue;
          // 同上：SMIN 不带 Harvester=yes，队列去重也要认奴隶矿车与名单
          if (
            it.rules.harvester ||
            it.rules.slaveMiner ||
            harvNames2.indexOf(it.rules.name) >= 0
          ) {
            queued += it.quantity || 1;
          }
        }
      }

      if (tick - (this.lastHarvDiagTick || 0) >= 300) {
        this.lastHarvDiagTick = tick;
        var refAgg: any = {};
        for (var ri = 0; ri < refNames.length; ri++) {
          var rn = refNames[ri] || "?";
          refAgg[rn] = (refAgg[rn] || 0) + 1;
        }
        var refSummary = Object.keys(refAgg)
          .map(function (k) {
            return refAgg[k] > 1 ? k + "x" + refAgg[k] : k;
          })
          .join(",");
        console.log(
          "[OriginalAiBot] harv diag[" + this.name + "]: ref=" + refineryCount +
            "(" + refSummary + ")" +
            " src{flag=" + byFlag + " name=" + byName + " slaveCapable=" + slaveCapable + "}" +
            " have=" + snap.harvs.length + " queued=" + queued + "/" + target +
            " Q{" + (qData
              ? "status=" + qData.status + " size=" + qData.size + "/" + qData.maxSize +
                " items=" + qData.items.map(function (i: any) {
                  return (i.rules && i.rules.name) + "x" + i.quantity;
                }).join("|")
              : "noApi") + "}",
        );
      }

      if (snap.harvs.length + queued >= target) return;

      var harv = this._findHarvesterType(game);
      if (!harv || !harv.name) return;
      // 队列已满时入队会被静默拒绝，别空转
      if (
        qData &&
        typeof qData.size === "number" &&
        typeof qData.maxSize === "number" &&
        qData.size >= qData.maxSize
      ) {
        return;
      }
      // 造价必须来自生产 API 拿到的 rules 对象：走 _canAfford 的名字查询时，
      // getObject 取不到造价会把 cost 记成 0，于是 credits=0 也判定"买得起"
      // → 无限排产把资金彻底榨干。
      var cost = typeof harv.cost === "number" ? harv.cost : 0;
      var need = cost > 0 ? cost : 1500;
      if (credits < need) return;

      this.actionsApi.queueForProduction(
        QueueType.Vehicles,
        harv.name,
        ObjectType.Vehicle,
        1,
      );
      this.lastHarvTick = tick;
      console.log(
        "[OriginalAiBot] queueing harvester " + harv.name +
          " (have=" + snap.harvs.length + "+" + queued + "/" + target +
          ", cost=" + cost + ", credits=" + credits + ")",
      );
    } catch (e: any) {
      console.warn(
        "[OriginalAiBot] harvester maintenance failed: " + ((e && e.message) || e),
      );
    }
  }

  /**
   * 挑矿车（返回 rules 对象本体，调用方要用它的真实 cost）。
   * 首选 [General] HarvesterUnit 名单：尤里的奴隶矿车 SMIN 靠奴隶采矿，
   * **不带 Harvester=yes**，只扫 rules.harvester 会让尤里永远造不出矿车
   * （表现为该阵营 credits 只降不升、经济彻底停摆）。
   * 名单取不到时回退到 rules.harvester 扫描。
   */
  /** [General] HarvesterUnit 名单（去掉 ini 内联注释后 trim）。 */
  _harvesterNames(game: any): any[] {
    var out: any[] = [];
    var pushName = function (s: any) {
      var n = String(s).split(";")[0].trim();
      if (n.length > 0 && out.indexOf(n) < 0) out.push(n);
    };
    try {
      var gen =
        game && game.rulesApi && game.rulesApi.general
          ? game.rulesApi.general
          : null;
      if (gen && gen.harvesterUnit && gen.harvesterUnit.length) {
        gen.harvesterUnit.forEach(pushName);
      }
    } catch (_) {}
    // 补充：[General] PrerequisiteProcAlternate=SMIN（原注释就写着
    // "still counts under a PROC listing"）。HarvesterUnit 那行带 `;gs ` 内联
    // 注释，SMIN 常在解析时被丢掉，这条是明确的兜底来源。
    try {
      var eng = this.aiApi && this.aiApi.engine;
      if (eng && eng.generalGroupByName) {
        (eng.generalGroupByName("PrerequisiteProcAlternate") || []).forEach(pushName);
      }
    } catch (_) {}
    return out;
  }

  /**
   * 是否采矿单位。三个信号任一命中即可：
   * rules.harvester（HARV/CMIN）、rules.slaveMiner（尤里 SMIN，靠奴隶采矿）、
   * 或 [General] HarvesterUnit / PrerequisiteProcAlternate 名单。
   */
  _isHarvesterUnit(ud: any, harvNames: any[]): boolean {
    if (!ud) return false;
    if (ud.rules && (ud.rules.harvester || ud.rules.slaveMiner)) return true;
    return !!ud.name && harvNames.indexOf(ud.name) >= 0;
  }

  _findHarvesterType(game: any): any {
    try {
      var objs = this.productionApi.getAvailableObjects(QueueType.Vehicles) || [];
      var names = this._harvesterNames(game);
      var ni = 0;
      for (ni = 0; ni < names.length; ni++) {
        for (var i = 0; i < objs.length; i++) {
          if (
            objs[i] &&
            objs[i].name === names[ni] &&
            this.productionApi.isAvailableForProduction(objs[i])
          ) {
            return objs[i];
          }
        }
      }
      for (var j = 0; j < objs.length; j++) {
        if (!objs[j] || !objs[j].harvester) continue;
        if (this.productionApi.isAvailableForProduction(objs[j])) return objs[j];
      }
    } catch (_) {}
    return null;
  }

  /** rules 造价；解析失败返回 0（调用方按可买得起处理，与 _canAfford 同语义）。 */
  _objectCost(game: any, unitType: any): any {
    try {
      var obj = this._resolveRulesObject(game, unitType, [
        ObjectType.Building,
        ObjectType.Vehicle,
        ObjectType.Infantry,
        ObjectType.Aircraft,
      ]);
      return (obj && obj.cost) || 0;
    } catch (_) {
      return 0;
    }
  }

  /** 造价 * 1.2 留 20% 余量；查价失败按可买得起处理。 */
  _canAfford(game: any, unitType: any, credits: any): any {    try {
      var cost = 0;
      var obj = this._resolveRulesObject(game, unitType, [
        ObjectType.Building,
        ObjectType.Vehicle,
        ObjectType.Infantry,
        ObjectType.Aircraft,
      ]);
      if (obj) cost = obj.cost || 0;
      // 留 20% 余量
      return credits >= cost * 1.2;
    } catch (_) {
      return true;
    }
  }

  /**
   * 按候选类型依次解析 rules 对象。
   * **`Rules.getObject` 在类型不匹配时是抛错，不是返回 undefined**（Rules.ts:118
   * `throw new Error("Missing rules for object ...")`），所以
   * `getObject(n, Infantry) || getObject(n, Vehicle)` 这种短路写法会在第一个
   * 候选就抛出，后面的类型永远不会被尝试——表现为只有步兵能被解析，
   * 载具/飞行器全部被静默跳过（AI 永远造不出坦克/飞机）。改成逐个 try。
   */
  _resolveRulesObject(game: any, name: any, types: any[]): any {
    if (!game || !game.rulesApi || !name) return null;
    for (var i = 0; i < types.length; i++) {
      try {
        var o = game.rulesApi.getObject(name, types[i]);
        if (o) return o;
      } catch (_) {}
    }
    return null;
  }

  /** 读一条生产队列的摊平状态（异常/缺队列返回 null）。 */
  _getQueueData(queueType: any): any {
    try {
      return this.productionApi.getQueueData(queueType);
    } catch (_) {
      return null;
    }
  }

  /**
   * 建筑应排入的建造队列：按该建筑 rules 的 buildCat 分流
   * （BuildCat=Combat → Armory，其余 → Structures），与人类玩家侧栏、
   * PlaceBuildingAction 的 getQueueForObject 同一套语义。rules 解析失败
   * 回落 Structures（宁可排错也不能静默不入队）。
   */
  _buildingQueueTypeFor(game: any, buildingName: any): any {
    var obj = this._resolveRulesObject(game, buildingName, [
      ObjectType.Building,
    ]);
    if (!obj) return QueueType.Structures;
    try {
      return this.productionApi.getQueueTypeForObject(obj);
    } catch (_) {
      return QueueType.Structures;
    }
  }

  /** 读取四条生产队列状态（异常时返回空对象）。 */
  _getQueueInfo(game: any): any {
    try {
      return {
        Structures: this.productionApi.getQueueData(QueueType.Structures),
        Infantry: this.productionApi.getQueueData(QueueType.Infantry),
        Vehicles: this.productionApi.getQueueData(QueueType.Vehicles),
        Aircraft: this.productionApi.getQueueData(QueueType.Aircrafts),
      };
    } catch (_) {
      return {};
    }
  }

  // ============================================================
  // 侦查
  // ============================================================
  /** 开局侦查：把首个高视野/犬单位派向第一个非己方起点。 */
  /** 基地遇袭检测：己方建筑血量下降 → 警报点=受损建筑位置（批次 5）。 */
  _checkBaseAttack(game: any, tick: any): void {
    try {
      var bldgIds =
        game.getVisibleUnits(this.name, "self", function (r: any) {
          return r && r.type === ObjectType.Building;
        }) || [];
      var damaged: any = null;
      var damagedAmount = 0;
      var seen: any = {};
      for (var i = 0; i < bldgIds.length; i++) {
        var id = bldgIds[i];
        seen[id] = true;
        var ud = game.getUnitData(id);
        if (!ud || ud.hitPoints === undefined) continue;
        var prev = this.buildingHealth.get(id);
        if (prev !== undefined && ud.hitPoints < prev && !damaged) {
          damaged = ud;
          damagedAmount = prev - ud.hitPoints;
        }
        this.buildingHealth.set(id, ud.hitPoints);
      }
      // 清理已消失建筑的缓存
      var keys = [];
      this.buildingHealth.forEach(function (v: any, k: any) {
        if (!seen[k]) keys.push(k);
      });
      for (var ki = 0; ki < keys.length; ki++) this.buildingHealth.delete(keys[ki]);

      if (damaged && damaged.tile) {
        // 怒气归因：警报点附近可见的敌方单位记为嫌疑人（UpdateAngerNodes 语义）。
        // 增量按伤害占比（0x701900 真版=威胁值×伤害/造价，此处以血量差为
        // 伤害量、purchaseValue 为权重，clamp [1,100]）
        try {
          var engine = this.aiApi && this.aiApi.engine;
          if (engine && engine.noteAnger) {
            var angerHit = damagedAmount > 0 ? Math.max(1, Math.min(100, damagedAmount)) : 20;
            var suspects =
              game.getVisibleUnits(this.name, "enemy", function (r: any) {
                return !!r;
              }) || [];
            for (var si = 0; si < suspects.length; si++) {
              var sud = game.getUnitData(suspects[si]);
              if (!sud || !sud.tile || !sud.owner) continue;
              var ddx = sud.tile.rx - damaged.tile.rx;
              var ddy = sud.tile.ry - damaged.tile.ry;
              if (ddx * ddx + ddy * ddy <= 36) {
                engine.noteAnger(sud.owner, angerHit);
                break;
              }
            }
          }
        } catch (_) {}
        if (!this.baseAlert || this.baseAlert.x !== damaged.tile.rx || this.baseAlert.y !== damaged.tile.ry) {
          console.log(
            "[OriginalAiBot] base under attack at " +
              damaged.tile.rx + "," + damaged.tile.ry +
              " (" + (damaged.name || "?") + " damaged)",
          );
        }
        this.baseAlert = {
          tick: tick,
          x: damaged.tile.rx,
          y: damaged.tile.ry,
        };
      }
    } catch (_) {}
  }

  /** 防御响应：派最近的机动战斗单位（≤8，排除已在进攻队里的）AttackMove 到警报点。 */
  _dispatchDefense(game: any, tick: any): void {
    try {
      var alert = this.baseAlert;
      var inTeam: any = {};
      if (this.aiApi && this.aiApi.engine) {
        var teams = this.aiApi.engine.activeTeams || [];
        for (var ti = 0; ti < teams.length; ti++) {
          var ids = teams[ti].unitIds || [];
          for (var ui = 0; ui < ids.length; ui++) inTeam[ids[ui]] = true;
        }
      }
      var units =
        game.getVisibleUnits(this.name, "self", function (r: any) {
          return (
            r &&
            r.isSelectableCombatant &&
            r.canMove !== false &&
            r.type !== ObjectType.Building
          );
        }) || [];
      var scored: any[] = [];
      for (var i = 0; i < units.length; i++) {
        if (inTeam[units[i]]) continue; // 进攻队成员不参与防御响应
        var ud = game.getUnitData(units[i]);
        if (!ud || !ud.tile) continue;
        var dx = ud.tile.rx - alert.x;
        var dy = ud.tile.ry - alert.y;
        scored.push({ id: units[i], d: dx * dx + dy * dy });
      }
      scored.sort(function (a: any, b: any) {
        return a.d - b.d;
      });
      var pick = scored.slice(0, 8).map(function (s: any) {
        return s.id;
      });
      if (pick.length) {
        this.actionsApi.orderUnits(
          pick,
          OrderType.AttackMove,
          alert.x,
          alert.y,
        );
        console.log(
          "[OriginalAiBot] defending base: " +
            pick.length +
            " units -> " +
            alert.x + "," + alert.y,
        );
      }
    } catch (_) {}
  }

  _tryScout(game: any): void {
    try {
      var baseUnit = game.getGeneralRules().baseUnit || [];
      var dogs = game.getVisibleUnits(this.name, "self", function (r: any) {
        // 只挑真正的移动侦查单位。必须排除建筑（sight>=8 会匹配到基地！
        // 对基地下 Move 指令会触发 UndeployIntoTask 把它收回成基地车）
        // 和基地车（把基地车开去侦查等于循环拆家）。
        return (
          r.type !== ObjectType.Building &&
          baseUnit.indexOf(r.name) < 0 &&
          (r.name === "DOG" || r.name === "YARI" || r.sight >= 8)
        );
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

      // 收集我方战斗单位（排除建筑与基地车：给基地下移动令会把它收回成车）
      var bu = game.getGeneralRules().baseUnit || [];
      var attackForce = game.getVisibleUnits(this.name, "self", function (r: any) {
        return (
          r.isSelectableCombatant &&
          r.canMove !== false &&
          r.type !== ObjectType.Building &&
          bu.indexOf(r.name) < 0
        );
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
      // 矿车名单来自 [General] HarvesterUnit：尤里奴隶矿车 SMIN 不带
      // Harvester=yes，只按 rules.harvester 统计会永远看不到它。
      var harvNames = this._harvesterNames(game);
      for (var ui = 0; ui < selfUnits.length; ui++) {
        var ud = game.getUnitData(selfUnits[ui]);
        if (!ud) continue;
        if (ud.rules && ud.rules.type === ObjectType.Building) {
          r.buildings.push(ud);
          if (ud.rules.constructionYard) r.hasCY = true;
          // 奴隶矿车 SMIN 部署后是建筑形态，判定必须与载具分支一致
          if (this._isHarvesterUnit(ud, harvNames)) r.harvs.push(ud);
        } else {
          // 矿车统计不能挂在 isSelectableCombatant 上：矿车是"可选但不可战斗"的
          // 单位，该标志为 false，导致造出来的矿车永远进不了 harvs → 维持逻辑
          // 以为一台都没有 → 反复排产把资金榨干（credits 一路掉到 0）。
          // 注意字段在 rules 上（getUnitData 快照本体没有），读 ud.rules.*。
          if (ud.rules && ud.rules.isSelectableCombatant) r.army.push(ud);
          if (this._isHarvesterUnit(ud, harvNames)) r.harvs.push(ud);
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
