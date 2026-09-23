/**
 * AiApi — 统一 AI 接口（AIMD.INI 策略/建造/战术门面）。
 *
 * 封装 AiEngine，提供高层 API 供 Bot 调用；Bot 不需要直接操作 AiEngine 或
 * AiData 的内部结构。CustomAiBot / IraqBot / 其他 Bot 均可通过此接口使用
 * 原版 AIMD.INI 配置。
 *
 * 使用方式：
 *   1. 构造：var ai = new AiApi(gameApi, actionsApi, playerName);
 *   2. 初始化：ai.init(aiIni);  // 或用 gameApi.getAiIni()
 *   3. 每tick更新：ai.onTick();
 *   4. 查询策略：ai.getBuildAdvice() / ai.getTacticalAdvice() 等
 *
 * 由 game/ai/AiApi.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as GameApiModule from "game/api/index"; // 孪生（any-shim，未转换）
import * as AiEngineModule from "game/ai/AiEngine"; // 已转换
import * as AiDataModule from "game/ai/AiData"; // 已转换

const OrderType = (GameApiModule as any).OrderType;
const ObjectType = (GameApiModule as any).ObjectType;
const SpeedType = (GameApiModule as any).SpeedType;
const AiEngine = (AiEngineModule as any).AiEngine;
const AiData = AiDataModule as any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 建造建议缓存（按类别分组的建造项列表）。 */
export interface BuildAdvice {
  buildings: any[];
  infantry: any[];
  vehicles: any[];
  aircraft: any[];
  naval: any[];
}

/** 战术建议缓存。 */
export interface TacticalAdvice {
  /** "aggressive" / "defensive" / "balanced" */
  stance: string;
  threatLevel: number;
  shouldAttack: boolean;
  priorityTarget: any;
}

/** 统一 AI 接口门面。 */
export class AiApi {
  gameApi: any;
  actionsApi: any;
  playerName: any;
  options: any;
  engine: any;
  initialized: any;
  /** 策略输出缓存（供 Bot 读取）。 */
  _buildAdvice: BuildAdvice;
  _tacticalAdvice: TacticalAdvice;
  _lastAdviceUpdate: any;
  /** 每 N tick 刷新一次策略（默认 60）。 */
  _adviceCooldown: any;

  constructor(gameApi: any, actionsApi: any, playerName: any, options?: any) {
    this.gameApi = gameApi;
    this.actionsApi = actionsApi;
    this.playerName = playerName;
    this.options = options || {};
    this.engine = new AiEngine(gameApi, actionsApi, playerName, options);
    this.initialized = false;

    // 策略输出缓存（供 Bot 读取）
    this._buildAdvice = {
      buildings: [], // [{unitType, priority}]
      infantry: [],
      vehicles: [],
      aircraft: [],
      naval: [],
    };
    this._tacticalAdvice = {
      stance: "balanced", // "aggressive" / "defensive" / "balanced"
      threatLevel: 0,
      shouldAttack: false,
      priorityTarget: null,
    };
    this._lastAdviceUpdate = 0;
    this._adviceCooldown = this.options.adviceCooldown || 60; // 每60tick刷新一次策略
  }

  // ============================================================
  // 生命周期
  // ============================================================

  /** 初始化：传入 aiIni（可选，不传则自动从 gameApi 获取）。 */
  init(aiIni?: any): void {
    this.engine.init(aiIni);
    this.initialized = true;
    console.log("[AiApi] Initialized for player " + this.playerName);
  }

  /** 每 tick 更新（Bot 的 onGameTick 中调用）；按冷却刷新策略缓存。 */
  onTick(): void {
    if (!this.initialized) return;
    this.engine.onTick();

    // 定期刷新策略缓存
    const tick = this.gameApi.getCurrentTick();
    if (tick - this._lastAdviceUpdate >= this._adviceCooldown) {
      this._refreshAdvice(tick);
      this._lastAdviceUpdate = tick;
    }
  }

  /** 重置（新游戏开始）。 */
  reset(): void {
    this.engine.reset();
    this._buildAdvice = {
      buildings: [],
      infantry: [],
      vehicles: [],
      aircraft: [],
      naval: [],
    };
    this._tacticalAdvice = {
      stance: "balanced",
      threatLevel: 0,
      shouldAttack: false,
      priorityTarget: null,
    };
    this._lastAdviceUpdate = 0;
  }

  // ============================================================
  // 建造建议（供经济/建造模块使用）
  // ============================================================

  /**
   * 获取当前推荐的建造列表（基于 AIMD.INI BuildQueue + 科技等级）。
   * 每项都是 [{unitType, priority, isHighPriority}]，按优先级降序。
   */
  getBuildAdvice(): BuildAdvice {
    return this._buildAdvice;
  }

  /**
   * 获取下一个最推荐的建造项（给生产队列用）。
   * @param botType - "Structures" / "Infantry" / "Vehicles" / "Aircraft" / "Naval"
   */
  getNextBuildItem(botType: any): any {
    const queue = this._getQueueForType(botType);
    if (!queue || queue.length === 0) return null;
    return queue[0]; // 返回优先级最高的
  }

  /** 获取当前科技等级。 */
  getTechLevel(): any {
    return this.engine.getTechLevel();
  }

  /** 获取建造队列（原始格式）。 */
  getBuildQueue(): any {
    return this.engine.getBuildQueue();
  }

  // ============================================================
  // 战术建议（供军事模块使用）
  // ============================================================

  /** 获取战术建议：{ stance, threatLevel, shouldAttack, priorityTarget }。 */
  getTacticalAdvice(): TacticalAdvice {
    return this._tacticalAdvice;
  }

  /** 获取活跃队伍列表。 */
  getActiveTeams(): any {
    return this.engine.getActiveTeamInfo();
  }

  /**
   * 获取 AIMD.INI 定义的 TaskForce 列表（按科技等级过滤语义由调用方结合
   * getTechLevel 使用）。可用于组建攻击部队。
   */
  getAvailableTaskForces(): any[] {
    if (!this.engine.parsed) return [];
    const tfs = this.engine.parsed.taskForces;
    const tl = this.engine.getTechLevel();
    const result: any[] = [];
    const keys = Object.keys(tfs);
    for (let ki = 0; ki < keys.length; ki++) {
      const tf = tfs[keys[ki]];
      result.push({
        name: tf.name,
        groups: tf.groups,
        totalUnits: tf.groups.reduce(function (s: any, g: any) {
          return s + g.count;
        }, 0),
      });
    }
    return result;
  }

  // ============================================================
  // 主动操作（供 Bot 调用）
  // ============================================================

  // 命令活跃队伍执行脚本（由 AiEngine 自动管理，无需 Bot 手动调用）
  // 但 Bot 可以覆盖或补充队伍行为

  /** 强制触发指定队伍（无条件）。 */
  forceSpawnTeam(teamName: any): boolean {
    if (!this.engine.parsed) return false;
    const tm = this.engine.parsed.teamTypes[teamName];
    if (!tm) return false;
    this.engine.spawnTeam(tm, this.gameApi.getCurrentTick());
    return true;
  }

  // ============================================================
  // 内部方法
  // ============================================================

  /** 刷新策略缓存（失败不影响游戏运行）。 */
  _refreshAdvice(tick: any): void {
    try {
      this._refreshBuildAdvice();
      this._refreshTacticalAdvice(tick);
    } catch (e) {
      // 策略刷新失败不影响游戏运行
    }
  }

  /** 刷新建造建议：按类别归类并按优先级降序。 */
  _refreshBuildAdvice(): void {
    const queue = this.engine.getBuildQueue();
    const tl = this.engine.getTechLevel();

    // 清空
    this._buildAdvice = {
      buildings: [],
      infantry: [],
      vehicles: [],
      aircraft: [],
      naval: [],
    };

    if (!queue || queue.length === 0) return;

    // 分类队列项
    for (let qi = 0; qi < queue.length; qi++) {
      const item = queue[qi];
      const unitType = typeof item === "string" ? item : (item.unitType || "");
      const priority = typeof item === "object" ? item.priority || 0 : 0;

      if (!unitType) continue;

      // 通过规则系统判断单位类别
      const category = this._categorizeUnit(unitType);
      if (category) {
        this._buildAdvice[category].push({
          unitType: unitType,
          priority: priority,
          isHighPriority: priority >= 5,
        });
      }
    }

    // 按优先级降序排列
    const cats = ["buildings", "infantry", "vehicles", "aircraft", "naval"];
    for (let ci = 0; ci < cats.length; ci++) {
      this._buildAdvice[cats[ci]].sort(function (a: any, b: any) {
        return b.priority - a.priority;
      });
    }
  }

  /** 刷新战术建议：按敌我可战单位比估威胁并决定姿态。 */
  _refreshTacticalAdvice(tick: any): void {
    let selfUnits = 0;
    let enemyUnits = 0;
    try {
      selfUnits = this.gameApi.getVisibleUnits(
        this.playerName,
        "self",
        function (r: any) {
          return r.isSelectableCombatant;
        },
      ).length;
      enemyUnits = this.gameApi.getVisibleUnits(
        this.playerName,
        "enemy",
        function (r: any) {
          return r.isSelectableCombatant;
        },
      ).length;
    } catch (_) {}

    // 计算威胁等级
    let threatLevel = 0;
    if (enemyUnits > 0) {
      const ratio = selfUnits > 0 ? enemyUnits / selfUnits : 2;
      if (ratio > 2) threatLevel = 3; // 严重威胁
      else if (ratio > 1.2) threatLevel = 2; // 中等威胁
      else if (ratio > 0.5) threatLevel = 1; // 轻微威胁
    }

    // 判断战术姿态
    let stance = "balanced";
    if (threatLevel >= 2) stance = "defensive";
    else if (selfUnits > enemyUnits * 1.5 && selfUnits >= 10) stance = "aggressive";

    // 是否有已触发的进攻队伍
    const activeTeams = this.engine.getActiveTeamInfo();
    const hasAttackTeam = activeTeams.some(function (t: any) {
      return t.state === "executing";
    });

    this._tacticalAdvice = {
      stance: stance,
      threatLevel: threatLevel,
      shouldAttack: stance === "aggressive" && !hasAttackTeam,
      priorityTarget: null,
    };
  }

  /** 判断单位类别（先走规则系统，失败则名称启发式）。 */
  _categorizeUnit(unitType: any): any {
    try {
      const rules = this.gameApi.rulesApi;
      // 尝试判断类型
      try {
        const b = rules.getBuilding(unitType);
        if (b) return "buildings";
      } catch (_) {}
      try {
        const o = rules.getObject(unitType, ObjectType.Infantry);
        if (o) return "infantry";
      } catch (_) {}
      try {
        const o = rules.getObject(unitType, ObjectType.Vehicle);
        if (o) {
          // 区分飞行器
          if (o.speedType === SpeedType.Winged || o.speedType === SpeedType.Hover) {
            return "aircraft";
          }
          return "vehicles";
        }
      } catch (_) {}
      try {
        const o = rules.getObject(unitType, ObjectType.Aircraft);
        if (o) return "aircraft";
      } catch (_) {}
    } catch (_) {}

    // 回退：通过名称启发式判断
    if (
      unitType.startsWith("GA") ||
      unitType.startsWith("NA") ||
      unitType.startsWith("YA") ||
      unitType.startsWith("CA") ||
      unitType.startsWith("SA") ||
      unitType.startsWith("UA")
    ) {
      return "buildings";
    }
    if (unitType.startsWith("E") || unitType.startsWith("C") || unitType.indexOf("DOG") >= 0) {
      return "infantry";
    }
    if (unitType === "BEAG" || unitType.indexOf("AIRC") >= 0) {
      return "aircraft";
    }
    return "vehicles"; // 默认视为车辆
  }

  /** 根据 Bot 类型获取对应队列。 */
  _getQueueForType(botType: any): any {
    switch (botType) {
      case "Structures":
        return this._buildAdvice.buildings;
      case "Infantry":
        return this._buildAdvice.infantry;
      case "Vehicles":
        return this._buildAdvice.vehicles;
      case "Aircraft":
        return this._buildAdvice.aircraft;
      case "Naval":
        return this._buildAdvice.naval;
      default:
        return null;
    }
  }
}

void OrderType;
