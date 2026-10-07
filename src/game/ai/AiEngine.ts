/**
 * AiEngine — AIMD.INI 运行时引擎：评估触发器、管理队伍、执行脚本。
 *
 * 提供统一接口供各类 Bot 使用（OriginalAiBot / ScenarioTeamBot 均可接入）。
 * 主循环 onTick：更新科技等级 →（可选）检查 AITrigger → 推进活跃队伍状态机
 * （recruiting → executing → done），并清理已完成队伍。
 *
 * 由 game/ai/AiEngine.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as GameApiModule from "game/api/index"; // 孪生（any-shim，未转换）
import * as AiData from "game/ai/AiData"; // 已转换
import * as AiTriggerRuntime from "game/ai/AiTriggerRuntime"; // 批次 2：原版触发层
import * as RandomizerModule from "game/ai/Randomizer"; // 批次 3：表驱动 RNG
import * as AiTeamRuntime from "game/ai/AiTeamRuntime"; // 批次 3：招募语义
import * as AiProductionRuntime from "game/ai/AiProductionRuntime"; // 批次 4：生产层
import * as AiSuperWeaponRuntime from "game/ai/AiSuperWeaponRuntime"; // 批次 5：超武 AI

const Vector2 = (GameApiModule as any).Vector2;
const OrderType = (GameApiModule as any).OrderType;
const ObjectType = (GameApiModule as any).ObjectType;
const SpeedType = (GameApiModule as any).SpeedType;

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================
// 活跃队伍状态
// ============================================================

/** 运行中的小队实例（招募/执行状态机载体）。 */
export class ActiveTeam {
  /** TeamType 定义。 */
  teamType: any;
  /** 关联的 TaskForce。 */
  taskForce: any;
  /** 关联的 ScriptType。 */
  scriptType: any;
  /** 已招募的单位ID。 */
  unitIds: any[];
  /** 当前执行到脚本第几步。 */
  scriptIndex: any;
  /** recruiting / executing / done */
  state: any;
  recruitTicks: any;
  /** 集结点。 */
  rallyPoint: any;
  /** 攻击目标。 */
  attackTarget: any;
  createdAt: any;
  /** 当前任务是否已下发（原版 is_next 语义：首帧下发，之后只查完成条件）。 */
  missionStarted: any;
  /** 当前任务的锚定格/攻击目标 id（完成判定用）。 */
  missionCell: any;
  missionTargetId: any;
  /** 当前任务开始 tick（Guard 计时等）。 */
  missionStartTick: any;
  /** 上次成功补员的 tick（recruit diag 的 stall 用：stall 大=该缺员类型造不出来）。 */
  lastGrowTick: any;
  /** 是否曾达到满编（DissolveUnfilledTeamDelay 解散判定用）。 */
  fullStrengthEver: any;

  constructor(teamType: any) {
    this.teamType = teamType; // TeamType 定义
    this.taskForce = null; // 关联的 TaskForce
    this.scriptType = null; // 关联的 ScriptType
    this.unitIds = []; // 已招募的单位ID
    this.scriptIndex = 0; // 当前执行到脚本第几步
    this.state = "recruiting"; // recruiting / executing / done
    this.recruitTicks = 0;
    this.rallyPoint = null; // 集结点
    this.attackTarget = null; // 攻击目标
    this.createdAt = 0;
    this.missionStarted = false;
    this.missionCell = null;
    this.missionTargetId = 0;
    this.missionStartTick = 0;
    this.lastGrowTick = 0;
    this.fullStrengthEver = false;
  }
}

// ============================================================
// AiEngine — 主引擎
// ============================================================

/** AIMD.INI 运行时引擎。 */
export class AiEngine {
  gameApi: any;
  actionsApi: any;
  playerName: any;
  options: any;
  /** {taskForces, scriptTypes, teamTypes, triggers, defenses, queues, …} */
  parsed: any;
  /** 活跃队伍列表。 */
  activeTeams: any[];
  lastTriggerCheck: any;
  /** 每60tick检查一次触发器（可用 options.triggerCooldown 覆盖）。 */
  triggerCooldown: any;
  techLevel: any;
  lastTechUpdate: any;
  /** 记录已触发的触发器（防重复）。 */
  triggerFired: any;
  totalTeamsCreated: any;
  /** 批次 2：原版全行格式触发器（globalFlag=1）。 */
  originalTriggers: any[];
  /** 批次 2：触发器 → 权重状态（原版 AITriggerTypeClass +184..+264）。 */
  triggerStates: any;
  /** 批次 2：rules [General] 触发层参数。 */
  generalParams: any;
  /** 批次 2：上次原版扫描 tick（TeamDelays 节拍）。 */
  lastTriggerScanTick: any;
  _lastPurifierTick: any;
  /** 批次 3：表驱动 RNG（ScenarioClass::Random 同步通道移植）。 */
  rng: any;
  /** 批次 4：运行时建造队列（Prerequisite 组维护器产出，getBuildQueue 消费）。 */
  productionQueue: any[];
  /** 批次 4：上次生产维护 tick。 */
  lastProductionTick: any;
  /** 批次 4：初始组序是否已建（开局一次性；之后只由维护循环补被拆的组）。 */
  initialBuilt: any;
  /** 基地防御规格只打一次诊断（判"防御建筑为什么一座都不造"用）。 */
  defenseDiagLogged: any;
  /** 批次 5：上次超武检查 tick。 */
  lastSuperWeaponTick: any;
  /** 批次 5：生产 API 引用（由 OriginalAiBot 注入，供 canProduce 过滤）。 */
  productionApi: any;
  /** BuildingTypes 序号 → 名字缓存（脚本 46/47/58 选靶用）。 */
  buildingTypesByIndex: Map<number, string> | null;
  /** 单位 id → 所属活跃队（CanRecruitUnit"无主才可招"语义的归属登记）。 */
  unitTeamOwners: Map<any, any>;
  /** 怒气表：house 名 → 怒气值（UpdateAngerNodes 移植）。 */
  angerNodes: Record<string, number>;
  /** 当前最恨的敌人（原版 house+22016；触发层/超武共用）。 */
  focusEnemy: string | null;

  constructor(gameApi: any, actionsApi: any, playerName: any, options: any) {
    this.gameApi = gameApi;
    this.actionsApi = actionsApi;
    this.playerName = playerName;
    this.options = options || {};
    this.parsed = null; // {taskForces, scriptTypes, teamTypes, triggers, defenses, queues}
    this.activeTeams = []; // 活跃队伍列表
    this.lastTriggerCheck = 0;
    this.triggerCooldown = this.options.triggerCooldown || 60; // 每60tick检查一次触发器
    this.techLevel = 1;
    this.lastTechUpdate = 0;
    this.triggerFired = {}; // 记录已触发的触发器（防重复，旧自创路径用）
    this.totalTeamsCreated = 0;
    // 批次 2：原版触发层状态
    this.originalTriggers = []; // 原版全行格式触发器（globalFlag=1）
    this.triggerStates = new Map(); // 触发器 → TriggerWeightState（原版 +184..+264）
    this.generalParams = AiTriggerRuntime.DEFAULT_GENERAL;
    this.lastTriggerScanTick = -1000000;
    this.rng = new RandomizerModule.Randomizer(
      this.options.rngSeed === undefined ? undefined : this.options.rngSeed,
    );
    this.productionQueue = [];
    this.lastProductionTick = -1000000;
    this.initialBuilt = false;
    this.defenseDiagLogged = false;
    this.lastSuperWeaponTick = -1000000;
    this.productionApi = null;
    this.buildingTypesByIndex = null;
    this.unitTeamOwners = new Map();
    this.angerNodes = {};
    this.focusEnemy = null;
  }

  /** 初始化：传入 aiIni 或使用 gameApi.getAiIni()；失败时降级为空解析结果。 */
  init(aiIni?: any): void {
    if (!aiIni) {
      try {
        aiIni = this.gameApi.getAiIni();
      } catch (e: any) {
        console.warn("[AiEngine] No AI Ini available (" + (e && e.message) + ")");
      }
    }
    if (!aiIni) {
      // 无地图/aimd AI 数据时降级为空解析结果，避免 parsed=null 导致小队系统整体不可用
      console.warn("[AiEngine] AI Ini is undefined — AI teams will not be creatable.");
      this.parsed = {
        groupWeights: {},
        taskForces: {},
        scriptTypes: {},
        teamTypes: {},
        triggers: {},
        defenses: {},
        buildQueues: {},
      };
      return;
    }
    try {
      this.parsed = {
        groupWeights: AiData.parseGroupWeights(aiIni),
        taskForces: AiData.parseTaskForces(aiIni),
        scriptTypes: AiData.parseScriptTypes(aiIni),
        teamTypes: AiData.parseTeamTypes(aiIni),
        triggers: AiData.parseAITriggerTypes(aiIni),
        defenses: AiData.parseAIDefenseTypes(aiIni),
        buildQueues: AiData.parseBuildQueues(aiIni),
      };
      console.log(
        "[AiEngine] Loaded " +
          Object.keys(this.parsed.teamTypes).length +
          " team types, " +
          Object.keys(this.parsed.triggers).length +
          " triggers, " +
          Object.keys(this.parsed.taskForces).length +
          " task forces, " +
          Object.keys(this.parsed.scriptTypes).length +
          " scripts",
      );
    } catch (e: any) {
      console.warn("[AiEngine] AI Ini parse failed: " + ((e && e.message) || e));
      this.parsed = {
        groupWeights: {},
        taskForces: {},
        scriptTypes: {},
        teamTypes: {},
        triggers: {},
        defenses: {},
        buildQueues: {},
      };
    }
    // 批次 2：收集原版全行格式触发器并初始化权重状态（原版 Weight/Min/Max）
    this.originalTriggers = [];
    const trigKeys = Object.keys(this.parsed.triggers || {});
    for (let i = 0; i < trigKeys.length; i++) {
      const tr = this.parsed.triggers[trigKeys[i]];
      if (tr && tr.globalFlag === 1) {
        this.originalTriggers.push(tr);
        this.triggerStates.set(tr, {
          weightCurrent: typeof tr.weight === "number" ? tr.weight : 1,
          minWeight: typeof tr.minWeight === "number" ? tr.minWeight : 0,
          maxWeight: typeof tr.maxWeight === "number" ? tr.maxWeight : 1,
          successCount: 0,
          totalCount: 0,
        });
      }
    }
    // 从 rules [General] 载入触发层参数（TeamDelays/TotalAITeamCap/权重增量等）
    try {
      // 注意：gameApi 没有 getRules()（旧写法恒为 null，参数一直是默认值），
      // 真实入口是 getRulesIni()；loadGeneralParams 内部按 DEFAULT_GENERAL
      // 逐项兜底，缺键不会退化成 0。
      const ini =
        this.gameApi && this.gameApi.getRulesIni
          ? this.gameApi.getRulesIni()
          : null;
      const general = ini && ini.getSection ? ini.getSection("General") : null;
      this.generalParams = AiTriggerRuntime.loadGeneralParams(general);
    } catch (_) {
      this.generalParams = AiTriggerRuntime.loadGeneralParams(null);
    }
  }

  /** 主更新循环（每tick调用）。 */
  onTick(): void {
    if (!this.parsed) return;
    const tick = this.gameApi.getCurrentTick();

    this.updateTechLevel(tick);
    // 批次 4：原版格式数据源时维护运行时建造队列（Prerequisite 组驱动）
    if (this.originalTriggers.length > 0) this.updateProduction(tick);
    this.updateSuperWeapons(tick);
    this.updateFocusEnemy(tick);
    // 战役人类阵营的 ScenarioTeamBot 关闭自主 AITrigger 评估：
    // 只执行显式 CreateTeam 创建的小队，避免引擎自发征用玩家单位。
    if (this.options.evaluateTriggers !== false) this.checkTriggers(tick);
    this.updateTeams(tick);

    // AIVirtualPurifiers：按难度给 AI 周期性资金奖励
    this.updateVirtualPurifiers(tick);

    // 清理完成的队伍
    this.activeTeams = this.activeTeams.filter(function (t: any) {
      return t.state !== "done";
    });
  }

  /** AIVirtualPurifiers：按难度周期性发钱（每 600 tick 发一次，金额=purifier值）。 */
  updateVirtualPurifiers(tick: any): void {
    if (tick - (this._lastPurifierTick || 0) < 600) return;
    this._lastPurifierTick = tick;
    const params = this.generalParams;
    if (!params) return;
    const diff = this.options.difficulty === 0 || this.options.difficulty === 2 ? this.options.difficulty : 1;
    const mult = (params.virtualPurifiers && params.virtualPurifiers[diff]) || 0;
    if (mult <= 0) return;
    try {
      const pd = this.gameApi.getPlayerData(this.playerName);
      if (pd && typeof pd.credits === "number") {
        this.actionsApi?.setCredits?.(pd.credits + mult * 100);
      }
    } catch (_) {}
  }

  /**
   * 更新科技等级（约每 120 tick）。
   * Production 用的是同一个数（遭遇战默认 10）。旧实现按"已有建筑名"反推
   * 1/3/4/5/10，与引擎科技等级无关：AI 没造出战车工厂前 techLevel 只有 3，
   * 会把所有 TechLevel>=4 的 AITrigger/队伍永久挡在门外。
   */
  updateTechLevel(tick: any): void {
    if (tick - this.lastTechUpdate < 120) return;
    this.lastTechUpdate = tick;

    const fromRules = this.readRulesTechLevel();
    if (fromRules !== null) {
      this.techLevel = fromRules;
      return;
    }

    // 回退：拿不到 rules 时才用建筑名启发式（保底，避免 AI 完全不动）
    try {
      const buildings = this.gameApi.getVisibleUnits(
        this.playerName,
        "self",
        function (r: any) {
          return r.type === ObjectType.Building;
        },
      );
      // 根据已有建筑推断科技等级
      const hasTech: any = {};
      let maxLv = 1;
      buildings.forEach(
        function (this: any, id: any) {
          const data = this.gameApi.getUnitData(id);
          if (data && data.name) hasTech[data.name] = true;
        }.bind(this),
      );
      // 科技等级映射（简化版）
      if (hasTech["NATECH"] || hasTech["GATECH"] || hasTech["YATECH"]) maxLv = 10;
      else if (hasTech["NAWEAP"] || hasTech["GAWEAP"] || hasTech["YAWEAP"]) maxLv = 5;
      else if (hasTech["NARADR"] || hasTech["GAAIRC"] || hasTech["NAPSIS"]) maxLv = 4;
      else if (hasTech["NAPOWR"] || hasTech["GAPOWR"] || hasTech["YAPOWR"]) maxLv = 3;
      this.techLevel = maxLv;
    } catch (_) {}
  }

  /**
   * 读取引擎权威科技等级：rules.mpDialogSettings.techLevel。
   * 取不到再退到 rules.ini 的 [MultiplayerDialogSettings] TechLevel；
   * 都没有时返回 null（调用方回退到建筑名启发式）。
   */
  readRulesTechLevel(): any {
    try {
      const rulesApi =
        this.gameApi && (this.gameApi as any).rulesApi
          ? (this.gameApi as any).rulesApi
          : (this.gameApi as any).rules;
      const settings = rulesApi ? rulesApi.mpDialogSettings : null;
      if (settings && typeof settings.techLevel === "number" &&
        !Number.isNaN(settings.techLevel)) {
        return settings.techLevel;
      }
    } catch (_) {}

    try {
      const ini = this.gameApi.getRulesIni ? this.gameApi.getRulesIni() : null;
      const sec = ini && ini.getSection ? ini.getSection("MultiplayerDialogSettings") : null;
      if (sec && sec.getNumber) {
        const v = sec.getNumber("TechLevel");
        if (typeof v === "number" && !Number.isNaN(v)) return v;
      }
    } catch (_) {}

    return null;
  }

  /** 触发评估入口：原版格式走批次 2 运行时，旧自创格式走遗留路径。 */
  /** 触发评估入口：原版格式（aimd globalFlag=1）走批次 2 运行时。 */
  checkTriggers(tick: any): void {
    if (this.originalTriggers.length > 0) {
      this.checkOriginalTriggers(tick);
    }
    // 旧自创触发路径（GroupWeights/自创条件号）已随自研 AI 移除——
    // 外部数据源只有原版 aimd.ini，无自创格式回退需求
  }

  /**
   * 原版触发扫描（批次 2）：TeamDelays[难度] 节拍 → 加权分布选一个触发器 →
   * 为 Team1 **和 Team2** 各建一支队（两者同属本 house，见下方注释）。
   */
  checkOriginalTriggers(tick: any): void {
    const params = this.generalParams || AiTriggerRuntime.DEFAULT_GENERAL;
    const diff = this.options.difficulty === 0 || this.options.difficulty === 2
      ? this.options.difficulty
      : 1;
    const delay = (params.teamDelays && params.teamDelays[diff]) || 2500;
    // FillEarliestTeamProbability：开局前 N tick 不刷队
    const earliest = (params.fillEarliestTeamProbability && params.fillEarliestTeamProbability[diff]) || 0;
    if (this.gameApi.getCurrentTick() < earliest) return;
    if (tick - this.lastTriggerScanTick < delay) return;
    this.lastTriggerScanTick = tick;

    const world = this.buildTriggerWorld();
    const activeTeamCount = this.activeTeams.length;
    let defenseCount = 0;
    for (let i = 0; i < this.activeTeams.length; i++) {
      const t = this.activeTeams[i];
      if (t.teamType && t.teamType.isBaseDefense) defenseCount++;
    }
    const scanStats: any = {};
    const hit = AiTriggerRuntime.scanTriggers(
      this.originalTriggers,
      this.triggerStates,
      world,
      params,
      activeTeamCount,
      defenseCount,
      defenseCount,
      scanStats,
    );
    // 每轮扫描一行规模诊断（节拍 = TeamDelays[难度]，2000~3500 tick，不会刷屏）。
    // `met` 长期只有个位数 = 触发器在条件层就被大量拒掉，该去查条件实现，
    // 而不是怀疑生产端/招募端。
    console.log(
      "[AiEngine] AITrigger scan: met=" +
        (scanStats.met || 0) + "/" + (scanStats.scanned || 0) +
        " candidates=" + (scanStats.candidates || 0) +
        (scanStats.capBlocked ? " (team cap reached)" : ""),
    );
    if (!hit) return;
    // BaseDefenseDelay：守家队延迟 N 分钟才允许触发（1分钟=900 tick）
    const defDelayMin = params.baseDefenseDelay || 0;
    const defDelayTicks = defDelayMin * 900;
    if (defDelayTicks > 0 && this.gameApi.getCurrentTick() < defDelayTicks) {
        const tt1chk = this.parsed.teamTypes[hit.team1];
        const tt2chk = hit.team2 ? this.parsed.teamTypes[hit.team2] : null;
        const isDefTrig = (tt1chk && tt1chk.isBaseDefense) || (tt2chk && tt2chk.isBaseDefense);
        if (isDefTrig) return;
    }
    // 原版一次扫描会把该触发器的 **Team1 与 Team2 都建出来**：
    // `0x6F0AB0` 把 AITriggerTypeClass+220（Team1）与 +224（Team2）两个
    // TeamType 指针都塞进输出向量，调用方 `HouseClass::AI 0x4F8440` 再对
    // 每个元素调 `TeamTypeClass::CreateTeam 0x6F09C0(teamType, this)` ——
    // **两支都归本 house**（不是"team2 归敌方"）。aimd 里 165 条触发器中有
    // 49 条带真实 Team2，且全是同阵营的"支援/反应队"（Allied 触发配
    // Allied Harrier Support、Soviet 配 Soviet Terror Drone Attack…）。
    // 旧实现只打一行 `team2 pending cross-house` 就丢掉 → 每次点火少一支队，
    // 是"AI 部队长不起来"的直接来源之一。
    const wanted: any[] = [];
    const tt1 = this.parsed.teamTypes[hit.team1];
    if (tt1) wanted.push(tt1);
    if (hit.team2 && hit.team2 !== hit.team1) {
      const tt2 = this.parsed.teamTypes[hit.team2];
      if (tt2) wanted.push(tt2);
    }
    const ready: any[] = [];
    for (let i = 0; i < wanted.length; i++) {
      if (this.canSpawnTriggerTeam(wanted[i], world)) ready.push(wanted[i]);
    }
    if (ready.length === 0) {
      console.log(
        "[AiEngine] AITrigger skip: " + hit.team1 + " not spawnable (max or recruiting)",
      );
      return;
    }
    const names: string[] = [];
    for (let i = 0; i < ready.length; i++) names.push(ready[i].name);
    console.log(
      "[AiEngine] AITrigger fire: " +
        (hit.trigger.displayName || hit.trigger.name) +
        " -> " + names.join(" + "),
    );
    for (let i = 0; i < ready.length; i++) this.spawnTeam(ready[i], tick);
  }

  /**
   * 触发器建队门控（原版 `TeamTypeClass::CreateTeam 0x6F09C0`）。
   *
   * 原版两处判定都在**建队**而不是扫描层：
   *  1. `Max`（0x5095D0 活跃实例数 >= Max → 返回 nullptr，只丢这一支）；
   *  2. 本仓自加：同名队仍在 recruiting 时不重复开实例 —— 否则 activeTeams
   *     堆积同名缺员队，`getUnitDemands` 的需求被按实例数成倍放大，
   *     生产端被反复驱动却始终填不满任何一支。
   * 逐队调用（而不是把 Team2 的 Max 塞回扫描层），才能做到"Team2 满员只丢
   * Team2、主队照出"。
   */
  canSpawnTriggerTeam(tt: any, world?: any): boolean {
    if (!tt) return false;
    // 可招募门控（0x509610 CanBuild）：TaskForce 每个成员类型都要能生产，
    // 否则会建出永远填不满的队并永久占用 activeTeams（实测 aimd 的
    // `Soviet Bombard` 把 `V3ROCKET` 写进编成，队伍 age 1200+ 仍是 units=4/need=3）。
    // 扫描层只对 Team1 查过这一条，Team2 在这里补等价门控。
    if (world && typeof world.canProduceUnit === "function" && typeof world.resolveTeamType === "function") {
      const info = world.resolveTeamType(tt.name);
      const members = info && info.members;
      if (members && members.length > 0) {
        for (let i = 0; i < members.length; i++) {
          if (!world.canProduceUnit(members[i])) return false;
        }
      }
    }
    const max = tt.maxExecuted;
    if (typeof max === "number" && max >= 0) {
      let n = 0;
      for (let i = 0; i < this.activeTeams.length; i++) {
        const t = this.activeTeams[i];
        if (t.teamType && t.teamType.name === tt.name) n++;
      }
      if (n >= max) return false;
    }
    for (let i = 0; i < this.activeTeams.length; i++) {
      const t = this.activeTeams[i];
      if (t.teamType && t.teamType.name === tt.name && t.state === "recruiting") {
        return false;
      }
    }
    // Bot 难度分层上限（DIFFICULTY_CFG.maxActiveTeams 经 options 注入）：
    // 原版 TotalAITeamCap=30 只是全局天花板；Easy/Medium 的"最大活跃队伍数"
    // 以前是死配置——不接进来，Easy 也能攒满 30 支队，难度分层形同虚设。
    const maxTeams = Number(this.options && this.options.maxActiveTeams);
    if (Number.isFinite(maxTeams) && maxTeams > 0 && this.activeTeams.length >= maxTeams) {
      return false;
    }
    return true;
  }

  /** 触发层 world 适配：AiApi 现有能力优先，缺口给保守缺省（详见摸底文档批次 2 节）。 */
  buildTriggerWorld(): AiTriggerRuntime.TriggerWorld {
    const self = this;
    const safe = function (fn: any, def: any) {
      try {
        const v = fn();
        return v === undefined ? def : v;
      } catch (_) {
        return def;
      }
    };
    const countBy = function (relation: any, name: any) {
      return safe(function () {
        const units = self.gameApi.getVisibleUnits(
          self.playerName,
          relation,
          function (r: any) {
            return r && r.name === name;
          },
        );
        return (units || []).length;
      }, 0);
    };
    // 当前"目标 house"= 原版 house+22016（当前敌人）。优先取怒气选敌结果，
    // 退化到"第一个其它战斗方"；取不到返回 null（此时原版所有需要目标 house
    // 的条件 0/2/3/4/7 都按不满足处理，只有 -1/1 两条路径可成立）。
    const targetHouseName = function (): any {
      if (self.focusEnemy) return self.focusEnemy;
      return safe(function () {
        const players = self.gameApi.getPlayers() || [];
        for (let pi = 0; pi < players.length; pi++) {
          const nm = players[pi];
          if (nm === self.playerName) continue;
          // 盟友不可作目标 house（原版 house+22016 是怒气选敌结果，永不为盟友），
          // 否则组队战下条件 0/2/3/4 会拿盟友的数据求值，建出"针对盟友"的队
          try {
            if (self.gameApi.areAlliedPlayers(self.playerName, nm)) continue;
          } catch (_) {}
          const pd = self.gameApi.getPlayerData(nm);
          if (pd && pd.isCombatant) return nm;
        }
        return null;
      }, null);
    };
    // "某 house 名下各类型数"整轮扫描只建一次（最多 165 次查询共用一份快照）。
    // ⚠ 必须用真值版（不吃迷雾）：见 GameApi.getPlayerOwnedTypeCounts 注释。
    const ownedCache: any = {};
    const ownedCountsOf = function (who: any): any {
      if (!who) return null;
      if (!ownedCache[who]) {
        ownedCache[who] = safe(function () {
          return self.gameApi.getPlayerOwnedTypeCounts
            ? self.gameApi.getPlayerOwnedTypeCounts(who)
            : null;
        }, null);
      }
      return ownedCache[who];
    };
    const civilianPlayerName = function (): any {
      return safe(function () {
        return self.gameApi.getCivilianPlayerName
          ? self.gameApi.getCivilianPlayerName()
          : null;
      }, null);
    };
    return {
      // 批次 3：表驱动 RNG（ScenarioClass::Random 移植），同种子即同序列。
      randomRanged: function (min: any, max: any) {
        return self.rng.randomRanged(min, max);
      },
      resolveTeamType: function (name: any) {
        const tt = self.parsed.teamTypes[name];
        if (!tt) return null;
        // members = TaskForce 编成行的成员类型（0x509610 CanBuild 门控用）。
        const tf = tt.taskForce ? self.parsed.taskForces[tt.taskForce] : null;
        const members: string[] = [];
        if (tf && tf.groups) {
          for (let g = 0; g < tf.groups.length; g++) {
            const grp = tf.groups[g];
            if (grp && grp.unitType) members.push(grp.unitType);
          }
        }
        return { isBaseDefense: !!tt.isBaseDefense, max: tt.maxExecuted, members };
      },
      countActiveTeams: function (name: any) {
        let n = 0;
        for (let i = 0; i < self.activeTeams.length; i++) {
          const t = self.activeTeams[i];
          if (t.teamType && t.teamType.name === name) n++;
        }
        return n;
      },
      isAIHouseActive: function () {
        return true;
      },
      difficulty: function () {
        return self.options.difficulty === 0 || self.options.difficulty === 2
          ? self.options.difficulty
          : 1;
      },
      isSkirmishOrMP: function () {
        return true;
      },
      isCampaign: function () {
        return false;
      },
      sideIndex: function () {
        // SideType 0=盟军 1=苏军 2=尤里（触发器阵营门控用）
        return safe(function () {
          const pd = self.gameApi.getPlayerData(self.playerName);
          const side = pd && pd.country && pd.country.side;
          return typeof side === "number" ? side : 0;
        }, 0);
      },
      techLevel: function () {
        return self.techLevel;
      },
      credits: function () {
        return safe(function () {
          return self.gameApi.getPlayerData(self.playerName).credits;
        }, 0);
      },
      ownedCount: function (name: any) {
        return countBy("self", name);
      },
      houseMatches: function (countryName: any) {
        // 归属门控（AITriggerTypeClass OwnerHouse，CSV 第 3 字段）：国家名与本
        // house 的国家比对。取不到国家名时放行——宁可多触发，也不要因字段缺失
        // 把全部带 House 限制的触发器一次性灭掉。
        return safe(function () {
          const pd = self.gameApi.getPlayerData(self.playerName);
          const mine = pd && pd.country && pd.country.name;
          if (!mine) return true;
          return (
            String(mine).trim().toLowerCase() ===
            String(countryName).trim().toLowerCase()
          );
        }, true);
      },
      canProduceUnit: function (typeName: any) {
        // CanBuild（0x509610）：类型必须存在、且此刻本 house 能生产
        // （前置建筑/阵营归属/科技等级/对应工厂全查，用的是引擎真值）。
        // 取不到规则对象 = 该类型不存在 → 判不可招募（否则队伍永远填不满）。
        return safe(function () {
          const rulesApi: any = self.gameApi.rulesApi;
          if (!rulesApi || !self.productionApi) return true;
          const types = [
            ObjectType.Infantry,
            ObjectType.Vehicle,
            ObjectType.Aircraft,
            ObjectType.Building,
          ];
          for (let i = 0; i < types.length; i++) {
            let obj: any = null;
            try {
              obj = rulesApi.getObject(typeName, types[i]);
            } catch (_) {}
            if (obj) {
              return !!self.productionApi.isAvailableForProduction(obj);
            }
          }
          return false;
        }, true);
      },
      hasTargetHouse: function () {
        // 原版 ConditionMet 不吃迷雾（作弊读真实状态）——按"存在敌对存活玩家"
        // 判定，不能用可见性（否则开局迷雾下进攻触发器永远不点火）
        return targetHouseName() !== null;
      },
      /**
       * 目标 house 名下某类型对象的**真实**数量（原版 EnemyHouseOwns 0x41EAF0）。
       *
       * 这里曾是整套触发层最大的一个静默缺口：旧实现走
       * `getVisibleUnits(me, "enemy")`（可见性过滤），迷雾下计数恒 0，而 aimd 里
       * 50 条 `条件 0 = 敌方拥有对象`的算子绝大多数是 `>=1` ⇒ 整类永久恒假。
       * 后果就是"AI 只会打那几支无脑进攻队、针对性兵种（Grizzly/Prism/Miracle
       * 等按敌方建筑选择打法的队）永远不出" —— 见
       * `临时文件/audit-ai-trigger-roster.mjs` 的基线数字。
       */
      targetOwnedCount: function (name: any) {
        const counts = ownedCountsOf(targetHouseName());
        return counts && name ? counts[name] || 0 : 0;
      },
      /** 目标 house 真实金钱（条件 4；原版 HouseCredits 0x41F230）。 */
      targetCredits: function () {
        const nm = targetHouseName();
        if (!nm) return 0;
        return safe(function () {
          return self.gameApi.getPlayerData(nm).credits;
        }, 0);
      },
      /** 目标 house 电力余量（条件 2/3：<100 黄、<0 红）。 */
      targetPowerSurplus: function () {
        const nm = targetHouseName();
        if (!nm) return 0;
        return safe(function () {
          const p = self.gameApi.getPlayerData(nm).power;
          return p ? p.total - p.drain : 0;
        }, 0);
      },
      /** 己方指定超武充能进度 [0,1]（条件 5 铁幕 / 条件 6 超时空）。 */
      superWeaponCharge: function (swType: any) {
        return safe(function () {
          return self.gameApi.getPlayerSuperWeaponCharge
            ? self.gameApi.getPlayerSuperWeaponCharge(self.playerName, swType)
            : 0;
        }, 0);
      },
      /** 中立 house 名下该类型对象数（条件 7：工程师抢油井/科技机场）。 */
      civilianOwnedCount: function (objName: any) {
        const counts = ownedCountsOf(civilianPlayerName());
        return (counts && objName && counts[objName]) || 0;
      },
    };
  }

  /**
   * 队伍消亡登记（TeamClass 析构 0x6E8DE0：按 Team1 匹配登记成功/失败，
   * 驱动 WeightCurrent 涨落）。原版触发器为全局一份状态，非每 house。
   */
  finishTeam(team: any, success: boolean): void {
    // 解散即释放成员归属（原版 TeamClass 析构把成员打回无主状态，
    // 之后可被其它队伍招募）；先释放再登记成败
    if (team) this.releaseTeam(team);
    if (this.originalTriggers.length === 0) return;
    if (!team || team.outcomeRegistered) return;
    team.outcomeRegistered = true;
    const params = this.generalParams || AiTriggerRuntime.DEFAULT_GENERAL;
    const name = (team.teamType && team.teamType.name) || "";
    for (let i = 0; i < this.originalTriggers.length; i++) {
      const tr = this.originalTriggers[i];
      if (tr.team1 !== name) continue;
      let st = this.triggerStates.get(tr);
      if (!st) {
        st = {
          weightCurrent: typeof tr.weight === "number" ? tr.weight : 1,
          minWeight: typeof tr.minWeight === "number" ? tr.minWeight : 0,
          maxWeight: typeof tr.maxWeight === "number" ? tr.maxWeight : 1,
          successCount: 0,
          totalCount: 0,
        };
        this.triggerStates.set(tr, st);
      }
      if (success) AiTriggerRuntime.registerSuccess(st, params);
      else AiTriggerRuntime.registerFailure(st, params);
    }
  }

  /**
   * 单位归属登记（CanRecruitUnit 0x6EA610 核心："无主才可招"+**优先级
   * 抢人**——已在其它队时，本队 TeamType.Priority 更高则允许夺走，
   * 旧队名册同步移除；平级/低级不放行）。
   * @returns true=登记成功；false=被其它队占用且优先级不足
   */
  claimUnit(team: any, unitId: any): boolean {
    if (unitId === undefined || unitId === null) return false;
    const owner = this.unitTeamOwners.get(unitId);
    if (owner === team) {
      // 已在本队名册 = 不是"无主"，不得重复认领（2026-10-04 实测致命 bug：
      // findFreeUnits 返回全部同名己方单位、含本队已在编成员，这里直接放行
      // → 同一 id 被 push N 次 → 缺员统计把 1 台算成 N 台 → "demand=4 只造
      // 1 台就 fully recruited(4 units)"（日志 0EC24B7C-G/078F3A3C-G 实证），
      // 队伍幽灵满编、AI 波次只剩一两个真单位。
      return false;
    }
    if (owner && owner !== team) {
      // 优先级抢人：原版比较 TeamType.Priority（+180），高者得
      const myPri = Number(team.teamType && team.teamType.priority) || 0;
      const oldPri = Number(owner.teamType && owner.teamType.priority) || 0;
      if (myPri <= oldPri) return false;
      const oldIds = owner.unitIds || [];
      const idx = oldIds.indexOf(unitId);
      if (idx >= 0) oldIds.splice(idx, 1);
    }
    this.unitTeamOwners.set(unitId, team);
    return true;
  }

  /** 队伍解散：清空其全部成员的归属登记。 */
  releaseTeam(team: any): void {
    if (!team || !this.unitTeamOwners) return;
    const ids = team.unitIds || [];
    for (let i = 0; i < ids.length; i++) {
      if (this.unitTeamOwners.get(ids[i]) === team) {
        this.unitTeamOwners.delete(ids[i]);
      }
    }
  }

  /**
   * 清理队伍名册里的死亡单位（原版成员阵亡时由 Register_Kill/Detach 自动
   * 从队伍摘除；本引擎没有该回调，等价清理在招募/补员扫描前做）。
   * 不清的后果：unitIds 只进不出，尸体占满 30 招募上限 → 缺员永远补不进 →
   * 队伍永卡 recruiting、缺员需求永不消失 → 生产端无限供员（烧钱+刷屏）。
   * 判据：getUnitData 取不到（对象已从世界移除）或血量 ≤0（垂死残留）。
   */
  pruneDeadMembers(team: any): void {
    if (!team || !team.unitIds || team.unitIds.length === 0) return;
    const kept: any[] = [];
    for (let i = 0; i < team.unitIds.length; i++) {
      const id = team.unitIds[i];
      let alive = false;
      try {
        const ud = this.gameApi.getUnitData(id);
        alive =
          !!ud &&
          !(typeof ud.hitPoints === "number" && ud.hitPoints <= 0);
      } catch (_) {
        alive = false; // id 已失效（getUnitData 对非法/非 Techno 抛错）
      }
      if (alive) {
        kept.push(id);
      } else if (this.unitTeamOwners && this.unitTeamOwners.get(id) === team) {
        this.unitTeamOwners.delete(id);
      }
    }
    if (kept.length !== team.unitIds.length) team.unitIds = kept;
  }

  /** 受害记怒（原版受害事件→UpdateAngerNodes(+delta)；YR 内建增量取 20）。 */
  noteAnger(house: string, delta: number): void {
    try {
      AiTriggerRuntime.addAnger(this.angerNodes, house, delta);
    } catch (_) {}
  }

  /** 选当前敌人（900t 节拍）：怒气最高的非盟友/非自己/非观察者。 */
  updateFocusEnemy(tick: any): void {
    // AIHateDelays=X,Y,Z（困难、中等、简单），默认 450/375/300 帧
    const diff = this.options.difficulty === 0 || this.options.difficulty === 2 ? this.options.difficulty : 1;
    const hateDelay = (this.generalParams?.aiHateDelays && this.generalParams.aiHateDelays[diff]) || 900;
    if (tick % hateDelay !== 0) return;
    try {
      const self = this;
      const excluded = function (house: string): boolean {
        if (house === self.playerName) return true;
        // 盟友排除：GameApi.areAlliedPlayers 就是引擎的直接查询（旧注释
        // "盟友判定引擎无直接查询"有误）——怒气选敌原版永不会选到盟友
        try {
          if (self.gameApi.areAlliedPlayers(self.playerName, house)) return true;
        } catch (_) {}
        // 观察者/已出局排除
        let alive = false;
        try {
          const pd = self.gameApi.getPlayerData(house);
          alive = !!(pd && pd.isCombatant);
        } catch (_) {
          alive = false;
        }
        return !alive;
      };
      this.focusEnemy = AiTriggerRuntime.selectAngriest(
        this.angerNodes,
        excluded,
      );
    } catch (_) {}
  }

  /**
   * 基建让位预算：当前还能用于"非必需基建"（基地防御 / 按既有建筑补同类）的钱。
   *
   * 口径：`credits - 缺员单位排产预留`。
   * - 缺员预留 = `getUnitDemands()` 里最贵的那条缺员单价 × 1.2（与
   *   `OriginalAiBot._canAfford` 的余量口径一致，避免两处各算一套）。
   * - 没有缺员需求时，预留为 0 ⇒ 基建照旧全速推进（不拖慢正常发展）。
   * - 取不到 credits / 造价时按"不限"处理，绝不因预算判断失败而停摆基建。
   *
   * 2026-10-04 实测（build 20261004-005627）：不限额时三家 AI `credits` 全程
   * 归零、AI2 连续 `credits=0`，`bldgs` 涨到 18~20 而
   * `recruit diag` 的 `stall` 阶梯涨到 1500 —— 钱全变成防御建筑，
   * 缺员单位（ORCA / MGTK / APOC…）一条也造不出来。
   */
  baseGrowthBudget(): number {
    // 取不到 credits 时按"不限"处理（返回 Infinity），绝不因预算判断失败停摆基建。
    // 注意：不能用类底的 `safeCall` —— 它失败时返回 null，无法表达"无限"这个语义。
    let credits: any = null;
    try {
      credits = this.gameApi.getPlayerData(this.playerName).credits;
    } catch (_) {
      credits = null;
    }
    if (typeof credits !== "number" || !isFinite(credits)) return Infinity;
    let reserve = 0;
    try {
      const demands = this.getUnitDemands() || [];
      for (const d of demands) {
        const name = d && d.unitType;
        if (!name) continue;
        // 逐个类型 try：Rules.getObject 类型不匹配会抛错（不是返回 undefined），
        // 写成 `getObject(a) || getObject(b)` 只会解析到排最前的那个类型。
        let cost = 0;
        for (const t of [
          ObjectType.Infantry,
          ObjectType.Vehicle,
          ObjectType.Aircraft,
        ]) {
          try {
            const obj = this.gameApi.rulesApi.getObject(name, t);
            if (obj && typeof obj.cost === "number" && obj.cost > 0) {
              cost = obj.cost;
              break;
            }
          } catch (_) {
            /* 换下一个类型试 */
          }
        }
        if (cost > 0) reserve = Math.max(reserve, cost * 1.2);
      }
    } catch (_) {
      return Infinity;
    }
    return credits - reserve;
  }

  /**
   * 批次 4：运行时建造队列维护（0x50A5C0 基地管理总巡的 TS 版）。
   * 节拍 900 tick（1 游戏分钟，对齐原版 General 间隔的量级）：
   * 剪掉已建成组的条目 → 空队建初始队列 → 补建缺失组 → 电力插队。
   * 产出经 getBuildQueue() 供 bot 层生产消费，bot 层零改动。
   */
  updateProduction(tick: any): void {
    if (tick - this.lastProductionTick < 900) return;
    this.lastProductionTick = tick;
    try {
      const world = this.buildProductionWorld();
      const self = this;
      const queue = world.queue();
      // 基建让位预算（2026-10-04，见 AiProductionRuntime.BuildQueueWorld
      // .baseGrowthBudget 注释里的实测事故）：缺员单位还要钱时，
      // 步骤 5/6（基地防御 / 补同类）本轮就让位，否则 credits 被基建吃光、
      // recruit stall 一路涨到 1500 单位一条也造不出来。
      (world as any).baseGrowthBudget = function (): number {
        return self.baseGrowthBudget();
      };
      const diff = self.playDifficulty();
      const side = self.productionSideIndex();
      // 防御规格（步骤 1b 剪除与步骤 5 入队共用同一份口径）
      const defListKey =
        AiProductionRuntime.DEFENSE_LIST_KEYS[side] ||
        AiProductionRuntime.DEFENSE_LIST_KEYS[0];
      const defCountKey =
        AiProductionRuntime.DEFENSE_COUNT_KEYS[side] ||
        AiProductionRuntime.DEFENSE_COUNT_KEYS[0];
      const defCandidates = self.buildableBuildingTypes(
        self.generalGroupByName(defListKey),
      );
      const defCounts = self.generalGroupByName(defCountKey).map(function (
        x: any,
      ) {
        return parseInt(String(x), 10);
      });
      const defTarget = AiProductionRuntime.defenseTargetFor(defCounts, diff);
      // 一次性诊断：防御建筑一座都不造时，一眼能看出是"列表没读到"还是"目标数 0"。
      if (!this.defenseDiagLogged && this.initialBuilt) {
        this.defenseDiagLogged = true;
        console.log(
          "[AiEngine] Base defense spec (feature " +
            (AiProductionRuntime.BASE_GROWTH_ENABLED ? "ON" : "OFF") +
            "): side=" + side +
            " list=" + defListKey + " counts=" + defCountKey +
            " candidates=[" + defCandidates.join(",") + "] target=" + defTarget,
        );
      }
      // 本轮己方建筑实例与各类型计数（锚点 + 剪除都要用）
      const instances = self.ownBuildingInstances();
      const ownedCountMap = new Map<string, number>();
      for (let ii = 0; ii < instances.length; ii++) {
        const nm = instances[ii].name;
        ownedCountMap.set(nm, (ownedCountMap.get(nm) || 0) + 1);
      }
      const ownedCountOf = function (t: string): number {
        return ownedCountMap.get(t) || 0;
      };
      const cloneCapOf = function (key: string): number {
        return AiProductionRuntime.cloneCapFor(key, diff);
      };
      // 持续扩张参数（rulesmd [General] RefineryRatio/Limit 等真键）
      const expansionParams = (function () {
        try {
          const ini = self.gameApi.getRulesIni();
          const sec = ini && ini.getSection ? ini.getSection("General") : null;
          return AiProductionRuntime.loadExpansionParams(sec);
        } catch (_) {
          return AiProductionRuntime.loadExpansionParams(null);
        }
      })();
      const totalBuildings = instances.length;
      // 组口径扩张判定：组候选内 owned 总数 ≥ min(floor(total×ratio), limit)
      const cloneSatisfiedOf = function (typeName: string): boolean {
        for (const key of Object.keys(AiProductionRuntime.CLONE_CAPS)) {
          const list = world.generalGroup(key) || [];
          if (list.indexOf(typeName) < 0) continue;
          let target = AiProductionRuntime.expansionTargetFor(
            key,
            totalBuildings,
            expansionParams,
          );
          if (target < 0) target = cloneCapOf(key);
          if (!(target > 1)) return true;
          let have = 0;
          for (const t of list) have += ownedCountOf(t);
          return have >= target;
        }
        return false;
      };
      const capOfType = function (t: string): number {
        for (const key of Object.keys(AiProductionRuntime.CLONE_CAPS)) {
          const list = world.generalGroup(key) || [];
          if (list.indexOf(t) >= 0) return cloneCapOf(key);
        }
        return 1;
      };
      void capOfType;
      // 1. 剪除：组已拥有 → 条目完成使命
      for (let i = queue.length - 1; i >= 0; i--) {
        const e = queue[i];
        if (!e.groupName || e.kind === "defense") continue;
        const group = world.generalGroup(e.groupName) || [];
        for (let gi = 0; gi < group.length; gi++) {
          if (world.ownedBuildingTypes().has(group[gi])) {
            queue.splice(i, 1);
            break;
          }
        }
      }
      // 1b. 剪除"已超额满足"的防御/复制条目（本仓建造队列没有"建成即出队"，
      //     不剪就会永生占位；详见 AiProductionRuntime.BuildQueueEntry.kind）。
      const pruned = AiProductionRuntime.pruneSupersededEntries(
        queue,
        ownedCountOf,
        defCandidates,
        defTarget,
        cloneSatisfiedOf,
      );
      void pruned;
      // 2. 初始组序只在开局建一轮（原版 0x5054B0 语义）。之后队空=基建完成，
      //    不再重复初始化——被拆的组由步骤 3 的维护补建，否则会无限循环
      //    重建同一套电/兵营/矿/重工/雷达。
      //    门控：必须已拥有建筑（即 MCV 已展开成建造厂）才初始化——原版
      //    基地管理只在有 CY 后运转；提前初始化时所有建筑的生产可用性
      //    校验（hasFactoryFor）都为假，得到空链/混链并被 initialBuilt 锁死。
      if (queue.length === 0 && !this.initialBuilt) {
        if (world.ownedBuildingTypes().size === 0) return;
        const initial = AiProductionRuntime.buildInitialQueue(world);
        for (let i = 0; i < initial.length; i++) queue.push(initial[i]);
        this.initialBuilt = true;
        if (initial.length > 0) {
          const chain = initial
            .map(function (e: any) {
              return e.typeName;
            })
            .join(" -> ");
          console.log(
            "[AiEngine] Build queue initialized with " +
              initial.length +
              " entries: " +
              chain,
          );
        } else {
          console.warn(
            "[AiEngine] Build queue init EMPTY — [General] 前置组读取失败？" +
              " powerGroup=" +
              JSON.stringify(self.generalGroupByName("PrerequisitePower")),
          );
        }
      }
      // 3. 缺组补建（每次至多一条，对齐原版逐条节奏）
      const added = AiProductionRuntime.maintainPrerequisiteGroups(world);
      if (added) {
        // 诊断：补建时打印 owned 集合是否命中该 typeName——若 ownedHit=false
        // 而基地里明明有这座建筑，就是 ownedBuildingTypes 的收集口径有问题
        // （表现为同一座建筑被反复补建）。
        let ownedHit = false;
        let ownedList = "-";
        try {
          const owned = world.ownedBuildingTypes();
          ownedHit = !!owned.has(added.typeName);
          ownedList = Array.from(owned).slice(0, 12).join(",");
        } catch (_) {}
        console.log(
          "[AiEngine] Rebuild needed: " + added.groupName + " -> " + added.typeName +
            " ownedHit=" + ownedHit + " owned=[" + ownedList + "]",
        );
      }
      // 4. 电力插队
      const powerEntry = AiProductionRuntime.insertPowerIfLow(world);
      if (powerEntry) {
        console.log("[AiEngine] Low power: inserted " + powerEntry.typeName);
      }
      const QUEUE_CAP = 8;
      // ⚠ 5/6 两步（基地防御 / 按既有建筑补同类）默认**关闭**：
      // 逻辑已实现+单测，但接线打开会让防御条目卡在 Ready 不落地、占死建造
      // 工厂（实测整局 bldgs 冻在 2）。原因与打开条件见
      // `AiProductionRuntime.BASE_GROWTH_ENABLED` 的注释。
      if (AiProductionRuntime.BASE_GROWTH_ENABLED) {
        // 5. 基地防御（0x50A5C0 第二段循环）：候选 = [AI] Allied/Soviet/ThirdBaseDefenses
        //    （按 side 取一条、滤到当前可生产），目标数 = [General] 对应
        //    *BaseDefenseCounts 按难度折出的值。加权按三个 Anti*Value 之和。
        if (queue.length < QUEUE_CAP) {
          const defEntry = AiProductionRuntime.insertDefenseIfNeeded(
            world,
            defCandidates,
            defCounts,
            diff,
            function (t: any) {
              return self.defenseWeight(t);
            },
          );
          if (defEntry) {
            console.log(
              "[AiEngine] Base defense queued: " + defEntry.typeName +
                " target=" + defTarget +
                " have=" + AiProductionRuntime.countBaseDefenses(
                  defCandidates,
                  world.ownedBuildingTypes(),
                  queue.map(function (e: any) { return e.typeName; }),
                ) +
                " candidates=[" + defCandidates.join(",") + "]",
            );
          }
        }
        // 6. 按既有建筑补同类（0x50A5C0 第一段循环）。
        //    原版对每座己方合格建筑在队列里插一条"同类型 + 该建筑格子坐标作锚点"
        //    的条目；这里用 AiProductionRuntime.CLONE_CAPS 的按组上限做预算，
        //    每轮至多追加 1 条（对齐原版逐条插入的节奏）。
        //    ⚠ 同样要让位缺员单位的排产预算（2026-10-04 实测：不限额时
        //    credits 全程归零、recruit stall 涨到 1500，见 baseGrowthBudget）。
        if (queue.length < QUEUE_CAP && AiProductionRuntime.baseGrowthBudgetAllows(world)) {
          const groups: any = {};
          for (const key of Object.keys(AiProductionRuntime.CLONE_CAPS)) {
            groups[key] = world.generalGroup(key);
          }
          const added = AiProductionRuntime.cloneExistingBuildings(
            instances,
            world.ownedBuildingTypes(),
            queue,
            groups,
            cloneCapOf,
            1,
            { params: expansionParams, totalBuildings: totalBuildings },
          );
          for (let ai2 = 0; ai2 < added.length; ai2++) {
            const e = added[ai2];
            queue.push(e);
            console.log(
              "[AiEngine] Clone existing building: " + e.typeName +
                " anchor=" + (e.anchor ? e.anchor.x + "," + e.anchor.y : "-"),
            );
          }
        }
      }
      // 7. 上限保护：从**队尾**裁。队头是正在推进的建造链（初始序/补建/插队），
      //    旧写法 `queue.shift()` 丢队头会把在建链直接砍掉；防御/复制条目都在
      //    队尾，裁掉它们只是下一轮重试，代价可控。
      while (queue.length > QUEUE_CAP) queue.pop();
      void self;
    } catch (e: any) {
      console.warn(
        "[AiEngine] updateProduction failed: " + ((e && e.message) || e),
      );
    }
  }

  /** 生产层 world 适配：电力/所属国取真数据，规则位掩码缺失时给保守缺省。 */
  buildProductionWorld(): any {
    const self = this;
    const safe = function (fn: any, def: any) {
      try {
        const v = fn();
        return v === undefined ? def : v;
      } catch (_) {
        return def;
      }
    };
    const ownedBuildings = function (): Set<string> {
      const set = new Set<string>();
      try {
        // 不再用 filter 的 r.type 预筛建筑：该字段对部分建筑（实测尤里 YAREFN）
        // 与 ObjectType.Building 不相等，导致 ownedBuildingTypes 里始终没有它 →
        // maintainPrerequisiteGroups 每轮都判定"缺精炼厂"并补建一座
        // （表现为尤里 AI 一路造出八九座 YAREFN、资金彻底崩溃）。
        // 改为取全部己方单位、按 getUnitData().rules.type 判定后收名字。
        const all = self.gameApi.getVisibleUnits(
          self.playerName,
          "self",
          function () {
            return true;
          },
        );
        const list = all || [];
        for (let i = 0; i < list.length; i++) {
          const ud = safe(function () {
            return self.gameApi.getUnitData(list[i]);
          }, null);
          if (!ud || !ud.name) continue;
          if (ud.rules && ud.rules.type === ObjectType.Building) {
            set.add(ud.name);
          } else if (ud.type === ObjectType.Building) {
            set.add(ud.name);
          }
        }
      } catch (_) {}
      return set;
    };
    const generalSection = function () {
      // 同上：gameApi 无 getRules()，真实入口是 getRulesIni()。
      // 这里拿不到 [General] 时，Prerequisite* / Build* 前置组会全部读空，
      // 建造链只能靠维护循环逐条补齐（表现为初始队列只有 1 条）。
      const ini =
        self.gameApi && self.gameApi.getRulesIni
          ? self.gameApi.getRulesIni()
          : null;
      return ini && ini.getSection ? ini.getSection("General") : null;
    };
    // 阵营前缀（SideType 0=盟军 G / 1=苏军 N / 2=尤里 Y），用于在组列表里
    // 优先挑选本阵营型号（位掩码暂不可用时的兜底选型）。
    const sidePrefix = (function (): string | null {
      const side = safe(function () {
        const pd = self.gameApi.getPlayerData(self.playerName);
        return pd && pd.country && pd.country.side;
      }, null);
      if (side === 0) return "GA";
      if (side === 1) return "NA";
      if (side === 2) return "YA";
      return null;
    })();
    return {
      countryIndex: function () {
        return 0;
      },
      generalPrerequisiteGroup: function (i: any) {
        const key = AiProductionRuntime.NEGATIVE_GROUP_INDEX[i];
        return key ? self.generalGroupByName(key) : [];
      },
      ownedBuildingTypes: ownedBuildings,
      prerequisitesOf: function (typeName: any) {
        // 规则对象若暴露 Prerequisite 再精确化；当前返回空=不阻断
        return [];
      },
      typeMasks: function (name: any) {
        // TODO(nation-aware): 规则对象补 country/side 位后精确化；当前全放行，
        // 组列表经 generalGroup 的阵营前缀过滤兜底。
        return {
          countryBits: -1,
          requiredBits: -1,
          excludedBits: -1,
          ownerSide: -1,
        };
      },
      factoryQueue: function () {
        return null;
      },
      factoryItemCanSustain: function () {
        return true;
      },
      suspendFactory: function () {},
      generalGroup: function (key: any) {
        const list = self.generalGroupByName(key);
        if (!list.length) return list;
      // 按"本 house 当前可生产"过滤（引擎原生校验：前置/阵营/科技全查）——
      // 这解决跨阵营列表（如 BuildRadar 里 Yuri 用 NAPSIS）的选型问题。
      // 禁止回退原始列表：跨阵营条目入队必被引擎校验拒绝，卡死队头；
      // 全不可产时返回空表，组由 maintainPrerequisiteGroups 下轮重试。
      const ok = list.filter(function (n: any) {
        try {
          var obj = null;
          try {
            obj = self.gameApi.rulesApi.getObject(n, ObjectType.Building);
          } catch (_) {}
          if (!obj) return false;
          return (
            !!self.productionApi &&
            self.productionApi.isAvailableForProduction(obj)
          );
        } catch (_) {
          return false;
        }
      });
      return ok;
      },
      powerLow: function () {
        return safe(function () {
          const pd = self.gameApi.getPlayerData(self.playerName);
          return !!(pd && pd.power && pd.power.isLowPower);
        }, false);
      },
      queue: function () {
        return self.productionQueue;
      },
      randomRanged: function (min: any, max: any) {
        return self.rng.randomRanged(min, max);
      },
      resolveTeamType: function (name: any) {
        const tt = self.parsed.teamTypes[name];
        if (!tt) return null;
        // members = TaskForce 编成行的成员类型（0x509610 CanBuild 门控用）。
        const tf = tt.taskForce ? self.parsed.taskForces[tt.taskForce] : null;
        const members: string[] = [];
        if (tf && tf.groups) {
          for (let g = 0; g < tf.groups.length; g++) {
            const grp = tf.groups[g];
            if (grp && grp.unitType) members.push(grp.unitType);
          }
        }
        return { isBaseDefense: !!tt.isBaseDefense, max: tt.maxExecuted, members };
      },
      countActiveTeams: function (name: any) {
        let n = 0;
        for (let i = 0; i < self.activeTeams.length; i++) {
          const t = self.activeTeams[i];
          if (t.teamType && t.teamType.name === name) n++;
        }
        return n;
      },
      isAIHouseActive: function () {
        return true;
      },
      difficulty: function () {
        return self.options.difficulty === 0 || self.options.difficulty === 2
          ? self.options.difficulty
          : 1;
      },
      isSkirmishOrMP: function () {
        return true;
      },
      isCampaign: function () {
        return false;
      },
      sideIndex: function () {
        // SideType 0=盟军 1=苏军 2=尤里（触发器阵营门控用）
        return safe(function () {
          const pd = self.gameApi.getPlayerData(self.playerName);
          const side = pd && pd.country && pd.country.side;
          return typeof side === "number" ? side : 0;
        }, 0);
      },
      techLevel: function () {
        return self.techLevel;
      },
      credits: function () {
        return safe(function () {
          return self.gameApi.getPlayerData(self.playerName).credits;
        }, 0);
      },
      hasTargetHouse: function () {
        return safe(function () {
          const enemies = self.gameApi.getVisibleUnits(
            self.playerName,
            "enemy",
          );
          return (enemies || []).length > 0;
        }, false);
      },
      targetOwnedCount: function () {
        return 0;
      },
      targetCredits: function () {
        return 0;
      },
      targetPowerSurplus: function () {
        return Number.POSITIVE_INFINITY;
      },
      superWeaponCharge: function () {
        return 0;
      },
      civilianOwnedCount: function () {
        return 0;
      },
    };
  }

  /** [General] 组键 → 类型名数组（走引擎已解析的 GeneralRules.prereqCategories）。 */
  generalGroupByName(key: any): string[] {
    const gr = safeCall(this, function (e: any) {
      return e.gameApi.getGeneralRules();
    });
    const catMap: any = {
      PrerequisitePower: 0,
      PrerequisiteFactory: 1,
      PrerequisiteBarracks: 2,
      PrerequisiteRadar: 3,
      PrerequisiteTech: 4,
      PrerequisiteProc: 5,
    };
    const cat = catMap[key];
    if (gr && gr.prereqCategories && cat !== undefined) {
      const list = gr.prereqCategories.get(cat);
      return Array.isArray(list) ? list : [];
    }
    // 回退：直接读 rules INI 原始键——Build* 系列在 [AI] 段（不在 [General]），
    // 两个段都试（AiRules 只解析了 Power/Refinery/Tech，其余键只有原始 INI 有）
    const ini = safeCall(this, function (e: any) {
      return e.gameApi.getRulesIni ? e.gameApi.getRulesIni() : null;
    });
    for (const secName of ["General", "AI"]) {
      const sec = ini && ini.getSection ? ini.getSection(secName) : null;
      if (!sec) continue;
      const raw = sec.get ? sec.get(key) : null;
      if (raw === undefined || raw === null) continue;
      return String(raw)
        .split(",")
        .map(function (x: any) {
          return x.trim();
        })
        .filter(function (x: any) {
          return x.length > 0;
        });
    }
    return [];

    function safeGetSection(engine: any, name: any): any {
      try {
        const ini =
          engine.gameApi && engine.gameApi.getRulesIni
            ? engine.gameApi.getRulesIni()
            : null;
        return ini && ini.getSection ? ini.getSection(name) : null;
      } catch (_) {
        return null;
      }
    }
  }

  /** 归一化难度：0=easy, 1=medium, 2=hard（原版三档，AI 为 Brutal 时取 2）。 */
  playDifficulty(): number {
    const d = this.options && this.options.difficulty;
    return d === 0 || d === 2 ? d : 1;
  }

  /** 己方 side 序号（0=盟军 / 1=苏军 / 2=尤里），用于取阵营专属建造/防御列表。 */
  productionSideIndex(): number {
    try {
      const pd = this.gameApi.getPlayerData(this.playerName);
      const side = pd && pd.country && pd.country.side;
      return typeof side === "number" ? side : 0;
    } catch (_) {
      return 0;
    }
  }

  /**
   * 己方建筑实例（名字 + 左上角格子坐标）——"按既有建筑补同类"要用坐标做锚点，
   * 所以不能只取 `ownedBuildingTypes()` 那张名字集合。
   */
  ownBuildingInstances(): any[] {
    const self = this;
    const out: any[] = [];
    try {
      const ids = this.gameApi.getVisibleUnits(
        this.playerName,
        "self",
        function () {
          return true;
        },
      );
      const list = ids || [];
      for (let i = 0; i < list.length; i++) {
        let ud: any = null;
        try {
          ud = self.gameApi.getUnitData(list[i]);
        } catch (_) {
          ud = null;
        }
        if (!ud || !ud.name) continue;
        const isBuilding =
          (ud.rules && ud.rules.type === ObjectType.Building) ||
          ud.type === ObjectType.Building;
        if (!isBuilding) continue;
        const t = ud.tile || {};
        out.push({
          name: ud.name,
          rx: typeof t.rx === "number" ? t.rx : 0,
          ry: typeof t.ry === "number" ? t.ry : 0,
        });
      }
    } catch (_) {}
    return out;
  }

  /** 从候选列表里滤出"此刻本 house 可生产"的建筑类型（引擎原生校验）。 */
  buildableBuildingTypes(list: any[]): string[] {
    const self = this;
    const out: string[] = [];
    for (let i = 0; i < (list || []).length; i++) {
      const n = list[i];
      try {
        let obj: any = null;
        try {
          obj = self.gameApi.rulesApi.getObject(n, ObjectType.Building);
        } catch (_) {
          obj = null;
        }
        if (!obj) continue;
        if (
          self.productionApi &&
          self.productionApi.isAvailableForProduction(obj)
        ) {
          out.push(n);
        }
      } catch (_) {}
    }
    return out;
  }

  /**
   * 防御建筑的 Anti 权重 = AntiAirValue + AntiArmorValue + AntiInfantryValue。
   *
   * 这三个键**只有基地防御建筑有**（其余建筑缺省 -1 / 未写），原版
   * `0x50A5C0` 正是用 `类型字段 >= 0` 这一条把它们从普通建筑里筛出来的；
   * 加权挑选用它们的和（原版还会按敌方兵种构成选 Air/Armor/Infantry，
   * 需要力预估数据，此处退化为"越全面越优先"）。
   */
  defenseWeight(typeName: any): number {
    try {
      const ini = this.gameApi.getRulesIni
        ? this.gameApi.getRulesIni()
        : null;
      const sec = ini && ini.getSection ? ini.getSection(typeName) : null;
      if (!sec || !sec.get) return 1;
      const num = function (k: string): number {
        const v = sec.get(k);
        const n = parseInt(String(v), 10);
        return isNaN(n) ? 0 : n;
      };
      const total =
        num("AntiAirValue") + num("AntiArmorValue") + num("AntiInfantryValue");
      return total > 0 ? total : 1;
    } catch (_) {
      return 1;
    }
  }

  /**
   * 批次 5：汇总所有活跃小队的缺员需求（GetTaskForceMissingMemberTypes 语义），
   * 供生产层驱动工厂补员。返回 [{unitType, count, teams:[队伍名]}]。
   */
  getUnitDemands(): any[] {
    const demandMap = new Map();
    for (let ti = 0; ti < this.activeTeams.length; ti++) {
      const team = this.activeTeams[ti];
      if (!team || team.state === "done" || !team.taskForce) continue;
      // 需求必须"有代码路径能兑现"，否则生产端会永不停歇地造一支拿不到货的队伍。
      //   recruiting 队的货由 updateRecruiting 领取；
      //   executing 队的货只由 updateExecuting 的补员块领取，而那块带
      //   `team.teamType.reinforce !== 0` 门槛。
      // aimd.ini 里**没有任何 TeamType 写 Reinforce=**（AiData 默认 0）⇒ 补员块
      // 对所有原版队伍都是死代码。若这里仍把 executing 队算进需求，就产生
      // "永远无法兑现的需求"：
      // 实测本机日志 —— AI2 的 Allied Mirage Tanks（TaskForce = 2×MGTK，1000/台）
      // 满编转入 executing 后成员阵亡，需求从此常年为 MGTKx2，生产端每 30t 造一台、
      // 无人认领，credits 14800 → 400 被榨干。
      if (
        team.state === "executing" &&
        !(
          team.teamType &&
          team.teamType.reinforce !== 0 &&
          team.unitIds.length < 30
        )
      ) {
        continue;
      }
      const teamName = (team.teamType && team.teamType.name) || "?";
      const have = new Map();
      for (let ui = 0; ui < team.unitIds.length; ui++) {
        try {
          const ud = this.gameApi.getUnitData(team.unitIds[ui]);
          this._addMemberNames(have, ud);
        } catch (_) {}
      }
      const missing = AiTeamRuntime.getTaskForceMissingMemberTypes(
        team.taskForce.groups,
        have,
      );
      for (let mi = 0; mi < missing.length; mi++) {
        const t = missing[mi].unitType;
        let d = demandMap.get(t);
        if (!d) {
          d = { unitType: t, count: 0, teams: [] };
          demandMap.set(t, d);
        }
        d.count++;
        if (d.teams.indexOf(teamName) < 0) d.teams.push(teamName);
      }
    }
    // 扣掉已有闲置单位：如果基地里已经有同类型但无主的单位，
    // 招募周期会直接认领它们，不需要再生产。
    // 否则会出现：队伍需要2台MGTK → 开始生产 → 招募认领了已有的2台 → 队伍走人 → 新造的MGTK堆在家。
    const out: any[] = [];
    demandMap.forEach((d: any) => {
      let freeCount = 0;
      try {
        const allOfType = this.findFreeUnits(d.unitType);
        // findFreeUnits 返回全部同类型单位（含已被其他队认领的），
        // 这里只数无主的（unitTeamOwners 里没有记录的）。
        for (let i = 0; i < allOfType.length; i++) {
          if (!this.unitTeamOwners.has(allOfType[i])) {
            freeCount++;
          }
        }
      } catch (_) {}
      d.count -= freeCount;
      if (d.count > 0) {
        out.push(d);
      }
    });
    return out;
  }

  /**
   * 批次 5：超武 AI（AI_TryFireSW 0x5098F0 移植）。
   * 每 300 tick 检查己方就绪超武，按类型分发（0 核弹点目标 / 2 风暴 / 5,6 空投 /
   * 7 心灵支配 / 9 突变器 / 8,11 侦察揭谍；1,3,4,10 原版 AI 不自动释放），
   * 经 actionsApi.activateSuperWeapon 下发。
   */
  updateSuperWeapons(tick: any): void {
    if (tick - this.lastSuperWeaponTick < 300) return;
    this.lastSuperWeaponTick = tick;
    if (!this.originalTriggers.length) return; // 仅原版路径启用
    const self = this;
    try {
      const all = this.gameApi.getAllSuperWeaponData
        ? this.gameApi.getAllSuperWeaponData()
        : [];
      const mine: AiSuperWeaponRuntime.SuperWeaponView[] = (all || [])
        .filter(function (s: any) {
          return s && s.playerName === self.playerName;
        })
        .map(function (s: any) {
          // status 2=Ready（SuperWeaponStatus.Ready）
          return { swType: s.type, ready: s.status === 2 };
        });
      if (mine.length === 0) return;

      const enemyTile = function (preferBuilding: any): any {
        return safe(function () {
          const enemies = self.gameApi.getVisibleUnits(
            self.playerName,
            "enemy",
            function (r: any) {
              if (!r) return false;
              if (preferBuilding) return r.type === ObjectType.Building;
              return true;
            },
          );
          const list = enemies || [];
          if (list.length === 0) return null;
          const ud = self.gameApi.getUnitData(list[0]);
          const tile = ud && ud.tile;
          return tile ? { x: tile.rx, y: tile.ry } : null;
        }, null);
      };
      // 超武目标评分（OpenTS AI_Ion_Cannon 对照）：敌方目标拼装评分视图
      const ionDamage = safe(function () {
        const ini = self.gameApi.getRulesIni();
        const sec = ini && ini.getSection ? ini.getSection("General") : null;
        const v = sec && sec.get ? Number(sec.get("IonCannonDamage")) : NaN;
        return Number.isFinite(v) && v > 0 ? v : 400;
      }, 400);
      const aiDifficulty = Number(this.options && this.options.difficulty) || 1;
      let buildConst: any = null;
      try {
        buildConst = this.generalGroupByName("BuildConst");
      } catch (_) {}
      const buildIonViews = function (): any[] {
        return safe(function () {
          const ids = self.gameApi.getVisibleUnits(
            self.playerName,
            "enemy",
            function (r: any) {
              return !!r;
            },
          );
          const list = ids || [];
          const focusViews: any[] = [];
          const otherViews: any[] = [];
          for (let i = 0; i < list.length; i++) {
            const ud = self.gameApi.getUnitData(list[i]);
            if (!ud || !ud.tile) continue;
            if (Number.isFinite(ud.hitPoints) && ud.hitPoints <= 0) continue;
            const rr = ud.rules || {};
            const view = {
              id: ud.id,
              tile: { x: ud.tile.rx, y: ud.tile.ry },
              hitPoints: ud.hitPoints,
              isInfantry: ud.type === ObjectType.Infantry,
              engineer: !!rr.engineer,
              harvester: !!rr.harvester,
              isMcv: !!(
                rr.deploysInto &&
                buildConst &&
                buildConst.indexOf(rr.deploysInto) >= 0
              ),
              isBuilding: ud.type === ObjectType.Building,
              constructionYard: !!rr.constructionYard,
              warFactory: rr.factory === 3,
              powerPlant: (rr.power || 0) > 0,
              baseDefense: !!rr.isBaseDefense,
              techCenter: false,
              cloaked: false,
            };
            // 怒气优先：当前最恨敌人的目标单列，有则只打它（原版 Enemy 语义）
            if (self.focusEnemy && ud.owner === self.focusEnemy) {
              focusViews.push(view);
            } else {
              otherViews.push(view);
            }
          }
          return focusViews.length > 0 ? focusViews : otherViews;
        }, []);
      };
      const pickScored = function (fallback: any): any {
        const winner = AiSuperWeaponRuntime.pickIonCannonTarget(
          buildIonViews(),
          ionDamage,
          aiDifficulty,
          function (a: number, b: number) {
            return self.rng.randomRanged(a, b);
          },
        );
        return winner ? winner.tile : fallback();
      };
      const world: AiSuperWeaponRuntime.SuperFireWorld = {
        hasTarget: function () {
          return !!enemyTile(false);
        },
        pickPointTarget: function (kind: any) {
          return pickScored(function () {
            // kind=1（MultiMissile）回落时优先建筑；评分主路径本就覆盖全部
            // 敌方目标，kind 只影响无评分结果时的回落顺序
            return kind === 1 ? enemyTile(true) || enemyTile(false) : enemyTile(false);
          });
        },
        pickCrowdTarget: function () {
          // 心灵支配/风暴/突变器：YR 同用 PickIonCannonTarget 家族评分
          return pickScored(function () {
            return enemyTile(false);
          });
        },
        pickSelfCastTarget: function () {
          // ⚠ 2026-10-04 修正：原先无条件返回 `ownTile()`（= 出生点），
          // 于是 type=5/6（空投）、8（侦察机）、11（心灵启示）全部打在自己
          // 家里 —— 实测 build 20261004-005627 日志三发全落在 startLocation
          // （`type=6 at 84,30` 而 AI2 起点就是 84,30），等于往自家空地放炸弹。
          // 这四类的正确语义都是**敌方区域**：
          //   - 5/6 空投：伞兵应投到敌方阵地后方；
          //   - 8 侦察机 / 11 心灵启示：应在敌方区域上空/范围内生效。
          // 无可见敌人时返回 null（`tryFireSupers` 会照常产出指令，但调用方
          // 的坐标校验会跳过；不擅自改成"打自己人"或硬造一个假目标）。
          return enemyTile(false) || enemyTile(true);
        },
      };
      const commands = AiSuperWeaponRuntime.tryFireSupers(mine, world);
      for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i];
        // 目标格必须是有效数字坐标（自施放类取不到己方出生点时跳过，
        // 否则 ActivateSuperWeaponAction 会对 undefined 坐标抛 Tile 警告）
        if (
          !cmd.target ||
          typeof cmd.target.x !== "number" ||
          typeof cmd.target.y !== "number"
        ) {
          continue;
        }
        console.log(
          "[AiEngine] SuperWeapon fire: type=" + cmd.swType +
            " at " + cmd.target.x + "," + cmd.target.y,
        );
        safe(function () {
          // activateSuperWeapon 期望地图 tile 形状（读 rx/ry），不是 {x,y}
          self.actionsApi.activateSuperWeapon(
            cmd.swType,
            { rx: cmd.target.x, ry: cmd.target.y },
          );
        }, null);
      }
    } catch (e: any) {
      console.warn(
        "[AiEngine] updateSuperWeapons failed: " + ((e && e.message) || e),
      );
    }

    function safe(fn: any, def: any) {
      try {
        const v = fn();
        return v === undefined ? def : v;
      } catch (_) {
        return def;
      }
    }
  }

  /** 创建队伍（进入 recruiting；TaskForce 无效则直接 done）。 */
  spawnTeam(teamType: any, tick: any): void {
    // CreateTeam 0x6F09C0 语义：TeamType.Max 是第二层上限（遭遇战按
    // 该类型活跃实例数计数），超出则拒绝创建。
    // 字段是 maxExecuted（AiData 从 `Max=` 解析；旧代码读 teamType.max
    // 恒 undefined → Number()=NaN → 门从未生效）
    const maxAllowed = Number(teamType.maxExecuted);
    if (Number.isFinite(maxAllowed) && maxAllowed >= 0) {
      let active = 0;
      for (let i = 0; i < this.activeTeams.length; i++) {
        const t = this.activeTeams[i];
        if (t.teamType === teamType && t.state !== "done") active++;
      }
      if (active >= maxAllowed) return;
    }
    const at = new ActiveTeam(teamType);
    at.taskForce = this.parsed.taskForces[teamType.taskForce] || null;
    at.scriptType = this.parsed.scriptTypes[teamType.scriptType] || null;

    if (!at.taskForce || at.taskForce.groups.length === 0) {
      at.state = "done";
      this.finishTeam(at, false);
      return;
    }

    at.createdAt = tick;
    at.lastGrowTick = tick;
    this.activeTeams.push(at);
    this.totalTeamsCreated++;
    console.log(
      "[AiEngine] Spawn team " + teamType.name + " (TF=" + teamType.taskForce + ")",
    );
  }

  /**
   * 战役援军/CreateReinforcement 专用 — 用已经直接生成的单位建立小队。
   * 与 spawnTeam 的区别：不经过招募阶段，单位已经由触发器创建并放置在地图上。
   */
  spawnTeamWithUnits(teamType: any, tick: any, unitIds: any): any {
    const at = new ActiveTeam(teamType);
    at.taskForce = this.parsed.taskForces[teamType.taskForce] || null;
    at.scriptType = this.parsed.scriptTypes[teamType.scriptType] || null;
    at.unitIds = Array.isArray(unitIds) ? unitIds.slice() : [];
    // 登记成员归属：不登记的话这些单位是"无主"的，会被任意 recruiting 队
    // claimUnit 抢走，而本队名册不知情（双名册漂移）；releaseTeam 也清不掉。
    for (let ui = 0; ui < at.unitIds.length; ui++) {
      this.unitTeamOwners.set(at.unitIds[ui], at);
    }
    at.createdAt = tick;
    this.activeTeams.push(at);
    this.totalTeamsCreated++;
    if (at.taskForce && at.scriptType && at.unitIds.length) {
      at.state = "executing";
      at.scriptIndex = 0;
      this.setRallyPoint(at);
    } else if (!at.taskForce || at.taskForce.groups.length === 0 || !at.unitIds.length) {
      at.state = "done";
      this.finishTeam(at, false); // 空编成增援队按失败登记（原版析构语义）
    } else {
      at.state = "executing";
      at.scriptIndex = 0;
      this.setRallyPoint(at);
    }
    console.log(
      "[AiEngine] Spawn reinforcement team " +
        teamType.name +
        " (TF=" +
        teamType.taskForce +
        ", units=" +
        at.unitIds.length +
        ")",
    );
    return at;
  }

  /**
   * DestroyTeam 动作 — 将同名活跃小队标记为完成并停止脚本推进。
   * 单位本身保留在地图上（原版 DestroyTeam 只解散小队/回收脚本控制）。
   * @returns 被标记 done 的实例数
   */
  destroyTeam(teamName: any): any {
    if (!teamName) return 0;
    const lower = String(teamName).toLowerCase();
    let count = 0;
    for (let i = this.activeTeams.length - 1; i >= 0; i--) {
      const t = this.activeTeams[i];
      if (!t || t.state === "done") continue;
      const name = (t.teamType && t.teamType.name) || "";
      if (name.toLowerCase() === lower) {
        t.state = "done";
        this.finishTeam(t, true); // 脚本走到 DestroyTeam=按剧本完成
        count++;
      }
    }
    if (count)
      console.log(
        "[AiEngine] Destroyed team " + teamName + " (" + count + " active instance(s))",
      );
    return count;
  }

  /** 更新所有活跃队伍（按 state 分发）。 */
  updateTeams(tick: any): void {
    // 已解散队出列（finishTeam 已在置 done 处调用并释放成员归属）——
    // 否则 activeTeams 无限累积，且触发层的活跃队计数虚高挤占队伍上限
    for (let i = this.activeTeams.length - 1; i >= 0; i--) {
      if (this.activeTeams[i].state === "done") this.activeTeams.splice(i, 1);
    }
    for (let ti = 0; ti < this.activeTeams.length; ti++) {
      const team = this.activeTeams[ti];
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
  }

  /** 招募阶段：收集需要的单位；超时或齐装后转入 executing/done。 */
  updateRecruiting(team: any, tick: any): void {
    team.recruitTicks++;

    // 招募节流 30t（与补员扫描同频）
    if (team.recruitTicks % 30 !== 0) return;

    // 死亡成员清理：与招募同节拍、且必须在缺员统计/上限判定之前——
    // unitIds 只进不出，成员阵亡后 id 仍占编制，会把 30 上限撑满、
    // 队伍永卡 recruiting 并无限驱动生产（2026-10-03 实测：units=30
    // need=INIT×10，活成员仅 4，stall 一路涨到 6840）
    this.pruneDeadMembers(team);

    // 原版 DissolveUnfilledTeamDelay（rules 默认 5000t）：从未满编的队伍
    // 超时解散——期间生产持续供员，不轻易放弃
    // 原版 DissolveUnfilledTeamDelay 语义（OpenTS team.cpp）：
    // 仅当队伍【没有任何成员】且（曾满编 或 遭遇战下超龄）时才解散——
    // 有部分成员的队持续等待生产供员，绝不轻易放弃
    const age = tick - (team.createdAt || tick);
    const dissolveDelay = (this.generalParams && this.generalParams.dissolveUnfilledTeamDelay) || 5000;
    if (
      team.unitIds.length === 0 &&
      (team.fullStrengthEver || age > dissolveDelay)
    ) {
      team.state = "done";
      this.finishTeam(team, false);
      return;
    }
    if (!team.taskForce) {
      team.state = "done";
      this.finishTeam(team, false);
      return;
    }

    // 注意：原版没有"900t 强制转执行"——队伍会一直等生产供员
    // （OpenTS TeamClass::AI：Member==NULL 时才按 DissolveUnfilledTeamDelay 解散；
    //   有部分成员的队持续招募/等待，生产把单位造出来后自然补入）

    // 缺员清单（GetTaskForceMissingMemberTypes 0x6EF4D0 语义：按编成行减现有同类型）
    const existingCounts = new Map();
    for (let ui = 0; ui < team.unitIds.length; ui++) {
      try {
        const ud = this.gameApi.getUnitData(team.unitIds[ui]);
        this._addMemberNames(existingCounts, ud);
      } catch (_) {}
    }
    const needed = AiTeamRuntime.getTaskForceMissingMemberTypes(
      team.taskForce.groups,
      existingCounts,
    );

    if (needed.length === 0) {
      // 招募完毕，开始执行
      team.fullStrengthEver = true;
      team.state = "executing";
      team.scriptIndex = 0;
      this.setRallyPoint(team);
      console.log(
        "[AiEngine] Team " +
          team.teamType.name +
          " fully recruited (" +
          team.unitIds.length +
          " units)",
      );
      return;
    }

    // 从空闲单位中补员：每个缺员条目本轮至多补一人（CanRecruitUnit 过滤在 findFreeUnits）。
    // 本函数开头已用 `recruitTicks % 30` 做过节拍门控，这里不能再叠一层
    // `tick % 30 === 0`：两个相位只有在队伍创建 tick ≡ 1 (mod 30) 时才重合，
    // 其余 29/30 的情况补员与 recruit diag 永远不执行——队伍卡在 recruiting 空转，
    // 生产端被 demand 无限驱动，形成死循环。
    if (needed.length > 0) {
      // stall = 距上次成功补员的 tick 数。它比 age 更能说明"卡住"：
      // age 大但 stall 小 = 队伍在稳步进人（正常）；age/stall 都大 = 该缺员类型
      // 根本造不出来（前置建筑缺失/国家不对口/类型不存在），需要往上查生产链。
      const stall = tick - (team.lastGrowTick || team.createdAt || tick);
      // free = 首个缺员类型当前实际可招数：demand 标 Y（可生产）+ AIR/VEH 队列
      // 已排产时若 free 恒 0，说明产出没进"己方名下世界对象"（出生即损/泊位
      // 对象未注册/归属错），或产出后 claim 环节失败——一眼分辨卡点。
      let freeCount = -1;
      try {
        freeCount = this.findFreeUnits(needed[0].unitType).length;
      } catch (_) {}
      // 降噪（2026-10-04）：stall ≤60t 逐条打（进人正常，留观察窗），
      // 之后每 300t 一条——三个 AI 各挂几条长期缺员队时，每 30t 一条会把
      // 控制台刷满（实测 759 行日志里 recruit diag 占 2/3），把 queueing/
      // place/produce 这些真正有信息量的行淹掉。补员逻辑不受节流影响。
      if (stall <= 60 || stall % 300 === 0) {
        console.log(
          "[OriginalAiBot] recruit diag: team=" +
            (team.teamType && team.teamType.name) +
            " units=" + team.unitIds.length +
            " need=" + needed.map(function (n: any) { return n.unitType; }).join("|") +
            " free=" + freeCount +
            " age=" + age +
            " stall=" + stall,
        );
      }
    }
    const beforeCount = team.unitIds.length;
    for (let ni = 0; ni < needed.length; ni++) {
      const need = needed[ni];
      if (team.unitIds.length >= 30) break;
      const freeUnits = this.findFreeUnits(need.unitType);
      for (let fi = 0; fi < freeUnits.length; fi++) {
        // 双保险：claimUnit 已挡 owner===team，这里再显式跳过已在编 id，
        // 防止未来出现"登记了归属但未进名册"的旁路（如 spawnTeamWithUnits）。
        if (team.unitIds.indexOf(freeUnits[fi]) >= 0) continue;
        if (this.claimUnit(team, freeUnits[fi])) {
          team.unitIds.push(freeUnits[fi]);
          break;
        }
      }
    }
    if (team.unitIds.length > beforeCount) team.lastGrowTick = tick;
  }

  /**
   * 统计队伍成员时把"部署态/未部署态"当成同一单位（依 rules 的 UndeploysInto 映射）。
   *
   * 典型是尤里奴隶矿车：[SMIN] DeploysInto=YAREFN、[YAREFN] UndeploysInto=SMIN。
   * SMIN 一旦在矿区展开就变成 YAREFN 建筑，getUnitData(id).name 随之变成
   * "YAREFN"；不做别名时，引用 SMIN 的任务力（如 0611A33C-G "Yuri Slave Miners"）
   * 会永远"缺 1 个 SMIN"——GetTaskForceMissingMemberTypes 是按类型名相减的。
   * 后果是生产端反复补造奴隶矿车（每台 1500），每台展开后又是一座精炼厂：
   * 实测尤里 AI 攒出 15 座 YAREFN（harv diag ref=15）而资金长期停在 600 上下。
   */
  _addMemberNames(counts: Map<any, any>, ud: any): void {
    if (!ud || !ud.name) return;
    counts.set(ud.name, (counts.get(ud.name) || 0) + 1);
    try {
      const back = ud.rules && ud.rules.undeploysInto;
      if (back && back !== ud.name) {
        // 只在"真·部署对"时才把当前对象按 back 类型双计：back 自身的
        // deploysInto 必须指回 ud.name（SMIN↔YAREFN）。无条件别名会把带
        // UndeploysInto 的基地厂/前哨（rulesmd 实证：GACNST→AMCV、
        // SMCV/PCV 系）也计成"已有 1 个 MCV"，需要 MCV 的任务力缺员少算、
        // 甚至以 0 台转 executing。
        const rulesApi: any = (this.gameApi as any).rulesApi;
        const backRules = rulesApi
          ? rulesApi.getObject(back, ObjectType.Vehicle)
          : null;
        if (!backRules || backRules.deploysInto === ud.name) {
          counts.set(back, (counts.get(back) || 0) + 1);
        }
      }
    } catch (_) {}
  }

  /** 寻找空闲单位（招募取员只按类型名匹配——CanRecruitUnit 语义，
   *  工程师/信徒等非战斗人员也必须能被队伍招募）。 */
  findFreeUnits(unitType: any): any[] {
    try {
      const allUnits = this.gameApi.getVisibleUnits(
        this.playerName,
        "self",
        function (r: any) {
          return r && r.name === unitType;
        },
      );
      return allUnits || [];
    } catch (_) {
      return [];
    }
  }

  /**
   * BuildingTypes 序号 → 名字（46/47/58 的 arg 低 16 位）。
   * 引擎 Rules.buildingTypes 与 rulesmd [BuildingTypes] 同源同序，从原始
   * INI 建索引表缓存（AI 消费的数据引用不可信，逐条容忍缺失）。
   */
  buildingNameByIndex(index: number): string | null {
    if (!this.buildingTypesByIndex) {
      this.buildingTypesByIndex = new Map();
      try {
        const ini = this.gameApi.getRulesIni();
        const sec = ini && ini.getSection ? ini.getSection("BuildingTypes") : null;
        if (sec && sec.entries) {
          sec.entries.forEach(function (v: any, k: string) {
            const n = parseInt(k, 10);
            const s = v === null || v === undefined ? "" : String(v).trim();
            if (!Number.isNaN(n) && s) this.buildingTypesByIndex.set(n, s);
          }, this);
        }
      } catch (_) {}
    }
    return this.buildingTypesByIndex.get(index) || null;
  }

  /**
   * 等效类型族（FindBuildingByType 的"敌方同族等效"）：直接用 [AI] 段
   * Build* 跨阵营列表——GAREFN/NAREFN/YAREFN 等每列就是一族。
   */
  buildingFamily(name: string): string[] {
    for (const key of [
      "BuildConst",
      "BuildPower",
      "BuildRefinery",
      "BuildBarracks",
      "BuildTech",
      "BuildWeapons",
      "BuildRadar",
      "BuildNavalYard",
    ]) {
      const list = this.generalGroupByName(key);
      if (list.indexOf(name) >= 0) return list;
    }
    return [name];
  }

  /**
   * 找指定类型（含同族等效）建筑——FindBuildingByType 0x6EEBD0 简化：
   * 在可见单位里按名字/族匹配，owner 决定敌我（"enemy"/"self"）。
   * @returns {id, tile} 或 null
   */
  findBuildingByTypeFamily(
    typeName: string | null,
    houseFilter: string,
  ): any {
    if (!typeName) return null;
    const family = this.buildingFamily(typeName);
    try {
      const ids = this.gameApi.getVisibleUnits(
        this.playerName,
        houseFilter,
        function (r: any) {
          return r && r.type === ObjectType.Building;
        },
      );
      const list = ids || [];
      // 最近优先
      let best: any = null;
      let bestD = Infinity;
      let anchor: any = null;
      try {
        const pd = this.gameApi.getPlayerData(this.playerName);
        anchor = pd.startLocation;
      } catch (_) {}
      for (let i = 0; i < list.length; i++) {
        const ud = this.gameApi.getUnitData(list[i]);
        if (!ud || !ud.tile) continue;
        if (ud.name && family.indexOf(ud.name) >= 0) {
          const dx = anchor ? ud.tile.rx - anchor.x : 0;
          const dy = anchor ? ud.tile.ry - anchor.y : 0;
          const d = dx * dx + dy * dy;
          if (d < bestD) {
            bestD = d;
            best = { id: list[i], tile: ud.tile, name: ud.name };
          }
        }
      }
      return best;
    } catch (_) {
      return null;
    }
  }

  /** 设置集结点（出生点 +5,+5）。 */
  setRallyPoint(team: any): void {
    try {
      const playerData = this.gameApi.getPlayerData(this.playerName);
      const params = this.generalParams || {};
      const friendlyDist = params.aiFriendlyDistance || 5;
      team.rallyPoint = new Vector2(
        playerData.startLocation.x + friendlyDist,
        playerData.startLocation.y + friendlyDist,
      );
    } catch (_) {}
  }

  /** 选择攻击目标（第一个可见敌人 tile；否则回落集结点）。 */
  pickTarget(team: any): any {
    try {
      const enemyUnits = this.gameApi.getVisibleUnits(
        this.playerName,
        "enemy",
        function (r: any) {
          return r.isSelectableCombatant || r.type === ObjectType.Building;
        },
      );
      if (enemyUnits.length > 0) {
        // 选第一个可见敌人
        const targetData = this.gameApi.getUnitData(enemyUnits[0]);
        if (targetData) {
          return new Vector2(targetData.tile.rx, targetData.tile.ry);
        }
      }
    } catch (_) {}
    return team.rallyPoint;
  }

  /** 执行阶段：每 30 tick 推进一步脚本。 */
  updateExecuting(team: any, tick: any): void {
    if (!team.scriptType || team.unitIds.length === 0) {
      team.state = "done";
      this.finishTeam(team, false);
      return;
    }

    // 原版 TeamClass::AI（OpenTS team.cpp L551-558）：执行阶段不满员且
    // Reinforcable 时持续补员——攻击波损兵后从工厂/兵营继续拉人
    if (
      team.teamType &&
      team.teamType.reinforce !== 0 &&
      team.taskForce &&
      tick % 30 === 0 &&
      team.unitIds.length < 30
    ) {
      // 补员扫描前先清掉阵亡成员——尸体占编制会让 `< 30` 门与缺员统计
      // 全部失真（同 updateRecruiting，详见 pruneDeadMembers 注释）
      this.pruneDeadMembers(team);
      const have = new Map();
      for (let ui = 0; ui < team.unitIds.length; ui++) {
        try {
          const ud = this.gameApi.getUnitData(team.unitIds[ui]);
          if (ud && ud.name) have.set(ud.name, (have.get(ud.name) || 0) + 1);
        } catch (_) {}
      }
      const missing = AiTeamRuntime.getTaskForceMissingMemberTypes(
        team.taskForce.groups,
        have,
      );
      for (let mi = 0; mi < missing.length; mi++) {
        const freeUnits = this.findFreeUnits(missing[mi].unitType);
        for (let fi = 0; fi < freeUnits.length; fi++) {
          // 同 updateRecruiting：跳过已在编 id（claimUnit 也已挡 owner===team）
          if (team.unitIds.indexOf(freeUnits[fi]) >= 0) continue;
          if (this.claimUnit(team, freeUnits[fi])) {
            team.unitIds.push(freeUnits[fi]);
            break;
          }
        }
      }
    }

    // 每30tick执行一步脚本。原版 0x6E9140 语义：任务只在成为当前任务的
    // 下一帧执行一次（is_next），之后每帧只查完成条件，完成后才推进
    // （+128 标志）——而不是每 30t 重下发然后立即撕脚本
    if (tick % 30 !== 0) return;

    const actions = team.scriptType.actions;
    if (team.scriptIndex >= actions.length) {
      // 原版语义：脚本耗尽不解散队（成员按 LastMission 行动），且未置
      // 成功标志（+132 只由 49 号任务置位）→ 按失败登记
      team.state = "done";
      this.finishTeam(team, false);
      return;
    }

    const action = actions[team.scriptIndex];
    if (!action) {
      team.scriptIndex++;
      return;
    }

    // 防御队久蹲自动出击：在基地附近蹲太久（>1800t）且当前是防御动作
    // （5/54/58），就把全队拉去打最近的敌方建筑——原版靠新触发再生进攻队，
    // 但我们的自定义经济产了很多坦克却只分配给防御队，导致全堆在家里
    if (team.missionStarted && team.missionStartTick) {
      const defenseActions = [5, 54, 58];
      const aa = action.action;
      if (
        defenseActions.indexOf(aa) >= 0 &&
        tick - team.missionStartTick > 1800 &&
        !team.forcedOffensive
      ) {
        // 找最近的敌方建筑
        const enemyBld =
          this.findBuildingByTypeFamily(null, "enemy") ||
          (() => {
            try {
              const enemies = this.gameApi.getPlayers().filter(
                (n: string) => n !== this.playerName,
              );
              for (const en of enemies) {
                const pd = this.gameApi.getPlayerData(en);
                if (pd && pd.startLocation) {
                  return { tile: { rx: pd.startLocation.x, ry: pd.startLocation.y } };
                }
              }
            } catch (_) {}
            return null;
          })();
        if (enemyBld && enemyBld.tile) {
          const cx = enemyBld.tile.rx;
          const cy = enemyBld.tile.ry;
          console.log("[AiEngine] Defense team " + (team.teamType ? team.teamType.name : "?") +
            " sending to offensive at " + cx + "," + cy + " (units=" + team.unitIds.length + ")");
          this.orderUnits(team.unitIds, OrderType.AttackMove, cx, cy);
          team.forcedOffensive = true;
          team.missionCell = { x: cx, y: cy };
        }
      }
    }

    if (!team.missionStarted) {
      // 首帧：下发任务
      team.missionStarted = true;
      team.missionCell = null;
      team.missionTargetId = 0;
      team.missionStartTick = tick;
      console.log("[AiEngine] Executing " + (team.teamType ? team.teamType.name : "?") +
        " action=" + action.action + " p=" + action.target + " units=" + team.unitIds.length);
      const result = this.executeAction(team, action, tick);
      if (result === "done") {
        team.state = "done";
        this.finishTeam(team, true);
        return;
      }
      if (result === "advance") {
        // 即时动作（原版 case 内直接 +128=1 的全局/管理类任务）
        team.missionStarted = false;
        team.scriptIndex++;
      }
      // "jump"=scriptIndex 已被改写；其余=等待完成检查
      if (result === "jump") team.missionStarted = false;
    } else if (this.isMissionComplete(team, action, tick)) {
      team.missionStarted = false;
      team.scriptIndex++;
    } else {
      const aa = action.action;
      // 原版 0x6EB490/0x6EBAD0 每帧把走神/未到位/后补的成员拉向队伍目标
      // ——近似为攻击/移动类任务等待期每 150t 重下发一次（目标/锚点不变；
      // 补员进队的成员由此获得首条移动指令）
      const isMove = aa === 1 || aa === 3 || aa === 4 || aa === 16 || aa === 22 || aa === 47 || aa === 53 || aa === 54 || aa === 58;
      if (
        (aa === 0 || aa === 46 || isMove) &&
        (tick - (team.missionStartTick || tick)) % 150 === 0
      ) {
        try {
          if (team.missionTargetId && (aa === 0 || aa === 46)) {
            this.orderUnitsTarget(
              team.unitIds,
              OrderType.ForceAttack,
              team.missionTargetId,
            );
          } else if (team.missionCell) {
            this.orderUnits(
              team.unitIds,
              (isMove && aa !== 53 && !team.forcedOffensive) ? OrderType.Move : OrderType.AttackMove,
              team.missionCell.x,
              team.missionCell.y,
            );
          }
        } catch (_) {}
      }
    }
  }

  /**
   * 当前任务完成检查（原版各 TMission 子函数的收尾 + 6EBAD0 编队到位）。
   * 移动类=全员距锚点 ≤ CloseEnough（rulesmd [General] CloseEnough=2.25 格，
   * 集结类半径放宽）；攻击类=目标消亡；等待类=计时到期。
   */
  isMissionComplete(team: any, action: any, tick: any): boolean {
    const a = action.action;
    // 移动/集结类：6EBAD0 全员到位
    if (a === 1) {
      // AttWaypt（0x6EC9A0）：指到具体对象时按攻击族（目标消亡=完成），
      // 仅指到格子时按到位
      if (team.missionTargetId) {
        try {
          const d = this.gameApi.getGameObjectData(team.missionTargetId);
          if (!d || !d.tile || (Number.isFinite(d.hitPoints) && d.hitPoints <= 0)) return true;
        } catch (_) {
          return true;
        }
        return false;
      }
      // 无具体目标对象（executeAction 只在路点格上找到对象才设
      // missionTargetId）：按编队到位判定。不能落到末尾"其余=即时动作"的
      // return true——那会把 AttackWaypoint 变成瞬时完成，攻击步骤整步被跳过
      // （isMove 重下发列表包含 1，证明本意是移动等待类动作）。
      return this.teamArrived(team, 2.0);
    }
    if (a === 3 || a === 4 || a === 16 || a === 22 || a === 53 || a === 54 || a === 47 || a === 58) {
      // 到位半径=rulesmd 实测：Stray=2.0 格（普通），RelaxedStray=3.0
      // （53/54 集结命令专用，rulesmd 注释直说"Gather commands use this"）
      if (this.teamArrived(team, a === 53 || a === 54 ? 3.0 : 2.0)) return true;
      // 超时兜底：2400 tick（约2分钟）——跨地图行军需要更长时间
      if (tick - (team.missionStartTick || tick) > 2400) {
        console.log("[AiEngine] Team " + (team.teamType ? team.teamType.name : "?") + " action=" + a + " timed out after 2400t");
        return true;
      }
      return false;
    }
    if (a === 5) {
      // Guard：等待 15*arg ticks（RA2 15 帧=1 游戏秒）
      return tick - (team.missionStartTick || tick) >= 15 * (Number(action.target) || 0);
    }
    if (a === 0) {
      // Attack（0x6ED090/0x6EB490）：目标消亡，或**无成员处于攻击状态**
      // （原版完成判定=队里再没有有效攻击的成员），1800t 超时兜底
      if (team.missionTargetId) {
        try {
          const d = this.gameApi.getGameObjectData(team.missionTargetId);
          if (!d || !d.tile || (Number.isFinite(d.hitPoints) && d.hitPoints <= 0)) return true;
        } catch (_) {
          return true;
        }
      } else if (!team.missionCell) return true;
      if (this.teamAllAttacking(team)) return false;
      return (
        this.teamArrived(team, 6) ||
        tick - (team.missionStartTick || tick) >= 1800
      );
    }
    if (a === 11) return false; // DO=粘滞任务：派完成员 Mission 后队伍永驻此步
    if (a === 46) {
      // AttackBuildingWithProperty：队目标建筑没了=完成
      if (team.missionTargetId) {
        try {
          const d = this.gameApi.getGameObjectData(team.missionTargetId);
          return !d || !d.tile || (Number.isFinite(d.hitPoints) && d.hitPoints <= 0);
        } catch (_) {
          return true;
        }
      }
      return true;
    }
    // 装卸/部署/满载：固定观察窗后推进（乘客系统未建，无法逐成员判完成）
    if (a === 8 || a === 9 || a === 14 || a === 43) {
      return tick - (team.missionStartTick || tick) >= 90;
    }
    return true; // 其余=即时动作
  }

  /** 编队到位检查（6EBAD0 简化）：存活成员全部距锚点 ≤ radius 格。 */
  teamArrived(team: any, radius: number): boolean {
    if (!team.missionCell) return true;
    let arrived = 0;
    let alive = 0;
    let firstPos = "";
    for (let i = 0; i < team.unitIds.length; i++) {
      try {
        const ud = this.gameApi.getUnitData(team.unitIds[i]);
        if (!ud || !ud.tile) continue;
        if (Number.isFinite(ud.hitPoints) && ud.hitPoints <= 0) continue;
        alive++;
        if (i === 0) firstPos = ud.tile.rx + "," + ud.tile.ry;
        const dx = ud.tile.rx - team.missionCell.x;
        const dy = ud.tile.ry - team.missionCell.y;
        if (dx * dx + dy * dy <= radius * radius) arrived++;
      } catch (_) {}
    }
    if (alive > 0 && arrived < alive) {
      console.log("[AiEngine] teamArrived: need=" + team.missionCell.x + "," + team.missionCell.y +
        " r=" + radius + " have=" + arrived + "/" + alive + " firstUnit@" + firstPos);
    }
    return alive > 0 && arrived === alive;
  }

  /**
   * 是否有成员在攻击（attackState != Idle）。原版 0x6EB490 的完成判定
   * 等价物：全员脱离攻击状态=任务完成。
   */
  teamAllAttacking(team: any): boolean {
    for (let i = 0; i < team.unitIds.length; i++) {
      try {
        const ud = this.gameApi.getUnitData(team.unitIds[i]);
        if (!ud) continue;
        if (Number.isFinite(ud.hitPoints) && ud.hitPoints <= 0) continue;
        if ((ud.attackState || 0) !== 0) return true;
      } catch (_) {}
    }
    return false;
  }

  /** 路点 → 瓦片坐标（MapApi.getTileAtWaypoint）。 */
  getWaypointTile(wp: any): any {
    try {
      const tile = this.gameApi.mapApi.getTileAtWaypoint(wp);
      return tile ? { x: tile.rx, y: tile.ry } : void 0;
    } catch (_) {
      return void 0;
    }
  }

  /** 攻击最近可见敌人（Attack 回退/攻击建筑用）。 */
  pickAndAttack(team: any): void {
    let target = team.attackTarget;
    if (!target) {
      target = this.pickTarget(team);
      team.attackTarget = target;
    }
    if (target) this.orderUnits(team.unitIds, OrderType.AttackMove, target.x, target.y);
  }

  /**
   * 按猎物类别过滤可见敌人并选目标（script action 0 的 quarry 语义，
   * 类别表见教程 L349-360 / ModEnc ScriptActions）。
   * quarry：0=任何 1=任何 2=建筑 3=矿车 4=步兵 5=载具 6=工厂 7=防御建筑 9=电厂 11=科技建筑
   */
  pickTargetByQuarry(team: any, quarry: number): any {
    try {
      const t = ObjectType;
      const match = function (r: any) {
        if (!r) return false;
        switch (quarry) {
          case 2:
            return r.type === t.Building;
          case 3:
            return !!r.harvester;
          case 4:
            return r.type === t.Infantry;
          case 5:
            return r.type === t.Vehicle;
          case 6:
            return r.type === t.Building && !!r.factory;
          case 7:
            return !!r.isBaseDefense;
          case 9:
            return r.type === t.Building && r.buildCat === 3;
          case 11:
            return r.type === t.Building && !!r.needsEngineer;
          default:
            return true;
        }
      };
      const enemies = this.gameApi.getVisibleUnits(
        this.playerName,
        "enemy",
        match,
      );
      const list = enemies || [];
      if (list.length === 0) return null;
      const ud = this.gameApi.getUnitData(list[0]);
      return ud && ud.tile ? { x: ud.tile.rx, y: ud.tile.ry } : null;
    } catch (_) {
      return null;
    }
  }

  /**
   * 在路点格查找攻击目标（含中立/民用目标，如自由女神像——参考临时源码 queueAttackWaypoint）。
   */
  findWaypointAttackTarget(rx: any, ry: any): any {
    try {
      const ids = this.gameApi.getAllUnits();
      for (var id of ids) {
        const d = this.gameApi.getGameObjectData(id);
        if (!d || !d.tile) continue;
        if (Number.isFinite(d.hitPoints) && d.hitPoints <= 0) continue;
        // 己方/盟友不可作路点攻击目标——原版按敌我筛选，这里只有格子覆盖
        // 匹配，不排除会把压在路点格上的自家/盟军建筑 ForceAttack 掉
        if (d.owner === this.playerName) continue;
        try {
          if (d.owner && this.gameApi.areAlliedPlayers(this.playerName, d.owner)) continue;
        } catch (_) {}
        // 参考临时源码：不可作为合法目标的对象不参与路点攻击
        if (d.rules && d.rules.legalTarget === false) continue;
        const f = d.foundation || { width: 1, height: 1 };
        const covered =
          rx >= d.tile.rx &&
          rx < d.tile.rx + (f.width || 1) &&
          ry >= d.tile.ry &&
          ry < d.tile.ry + (f.height || 1);
        if (covered) return { id: id, name: d.name, owner: d.owner };
      }
    } catch (_) {}
    return void 0;
  }

  /** 命令单位攻击指定对象（经 actionsApi，按 5 个一批入队）。 */
  orderUnitsTarget(unitIds: any, order: any, targetId: any): void {
    if (!unitIds || !unitIds.length || !targetId) return;
    const batchSize = 5;
    for (let i = 0; i < unitIds.length; i += batchSize) {
      try {
        this.actionsApi.orderUnits(unitIds.slice(i, i + batchSize), order, targetId);
      } catch (_) {}
    }
  }

  /**
   * 执行单个脚本动作（YR ScriptType 动作码，参考临时源码 Tt 枚举）。
   * @returns "done" 结束脚本 / "jump" 表示 scriptIndex 已被改写 / 其它正常推进
   */
  executeAction(team: any, action: any, tick: any): any {
    try {
      const p = action.target; // 第二字段：路点编号/参数
      switch (action.action) {
        case 0: {
          // Attack — 按猎物类别攻击（arg=quarry：0/1=任何 2=建筑 3=矿车
          // 4=步兵 5=载具 6=工厂 7=防御 9=电厂 11=科技；见教程 L349-360）
          const quarry = Number(p) || 0;
          const byQuarry = this.pickTargetByQuarry(team, quarry);
          if (byQuarry) {
            team.missionCell = byQuarry;
            this.orderUnits(
              team.unitIds,
              OrderType.AttackMove,
              byQuarry.x,
              byQuarry.y,
            );
          } else {
            this.pickAndAttack(team);
            if (team.attackTarget) team.missionCell = team.attackTarget;
          }
          break;
        }
        case 1: {
          // AttackWaypoint — 攻击指定路点（优先直接攻击路点格上的对象，含中立目标）
          // 参考临时源码 queueAttackWaypoint：对路点目标使用 force attack，
          // 否则普通 Attack 可能因目标是中立/民用（如自由女神像）而拒绝开火。
          const wp1 = this.getWaypointTile(p);
          if (wp1) {
            team.missionCell = wp1;
            const tgt1 = this.findWaypointAttackTarget(wp1.x, wp1.y);
            if (tgt1) {
              team.missionTargetId = tgt1.id;
              this.orderUnitsTarget(team.unitIds, OrderType.ForceAttack, tgt1.id);
            } else this.orderUnits(team.unitIds, OrderType.ForceAttack, wp1.x, wp1.y);
            // 登记攻击目标标记（GUI 层渲染脉冲光环，方便玩家看到指定攻击目标）
            try {
              this.gameApi.addAttackTargetMarker(
                wp1.x,
                wp1.y,
                team.teamType ? team.teamType.name : "",
              );
            } catch (_) {}
          } else this.pickAndAttack(team);
          break;
        }
        case 2: // GoBerserk
        case 13: // IdleAnimation
        case 19: // Panic
        case 21: // Scatter
        case 22: // MoveToShroud
        case 42: // ForceFacing
          break;
        case 3: // MoveToWaypoint
        case 16: {
          // PatrolToWaypoint
          const wp3 = this.getWaypointTile(p);
          if (wp3) {
            team.missionCell = wp3;
            this.orderUnits(team.unitIds, OrderType.Move, wp3.x, wp3.y);
          }
          break;
        }
        case 4: {
          // MoveToCell — 参数为路点/坐标，简化按路点处理
          const wp4 = this.getWaypointTile(p);
          if (wp4) {
            team.missionCell = wp4;
            this.orderUnits(team.unitIds, OrderType.Move, wp4.x, wp4.y);
          }
          break;
        }
        case 5: // GuardArea — 守卫当前区域（完成=isMissionComplete 计时器）
          this.orderUnits(team.unitIds, OrderType.Guard);
          break;
        case 6: // JumpToLine — 跳转到指定脚本行（1-based）
          team.scriptIndex = Math.max(0, p - 1);
          return "jump";
        case 8: // Unload
          this.orderUnits(team.unitIds, OrderType.UnloadAll);
          break;
        case 9: // Deploy
          this.orderUnits(team.unitIds, OrderType.DeploySelected);
          break;
        case 11: {
          // DO（aimd 恒 arg=11=Area Guard）：粘滞守卫——原版给成员派
          // Mission 后队伍永驻此步（0x6ED7E0 不置完成标志），脚本不推进
          this.orderUnits(team.unitIds, OrderType.Guard);
          break;
        }
        case 14: // LoadOntoTransport
          this.orderUnits(team.unitIds, OrderType.DeploySelected);
          break;
        case 17: {
          // ChangeScript — 切换到另一脚本（按 ScriptTypes 序号）
          const scs = this.parsed.scriptTypes;
          for (const sk in scs) {
            if (scs[sk].index === p) {
              team.scriptType = scs[sk];
              team.scriptIndex = 0;
              return "jump";
            }
          }
          break;
        }
        case 49: // Success — 脚本成功完成（原版置 +132 成功标志）
          return "done";
        case 46: {
          // AttackBuildingWithProperty（aimd 45 处）：arg 低 16 位=
          // BuildingTypes 索引（实测 GAREFN/GACNST/GAWEAP/GATECH…），
          // 找敌方该类/同族等效建筑 → ForceAttack；无目标=本步完成
          const idx46 = Number(p) & 0xffff;
          const name46 = this.buildingNameByIndex(idx46);
          const tgt46 = this.findBuildingByTypeFamily(name46, "enemy");
          if (tgt46) {
            team.missionTargetId = tgt46.id;
            team.missionCell = { x: tgt46.tile.rx, y: tgt46.tile.ry };
            this.orderUnitsTarget(team.unitIds, OrderType.ForceAttack, tgt46.id);
          } else return "advance";
          break;
        }
        case 47: {
          // MoveToBuildingWithProperty（24 处）：找该类建筑（敌优先，
          // FindBuildingByType 含同族等效）移动到其旁，全员到位=完成
          const idx47 = Number(p) & 0xffff;
          const name47 = this.buildingNameByIndex(idx47);
          const tgt47 =
            this.findBuildingByTypeFamily(name47, "enemy") ||
            this.findBuildingByTypeFamily(name47, "self");
          if (tgt47) {
            team.missionCell = { x: tgt47.tile.rx, y: tgt47.tile.ry };
            this.orderUnits(
              team.unitIds,
              OrderType.Move,
              tgt47.tile.rx,
              tgt47.tile.ry,
            );
          } else return "advance";
          break;
        }
        case 48: // Scout：原版扫未侦查敌方基地——近似向最近敌方建筑推进
        case 53: {
          // GatherAtEnemyBase（22 处，0x6EF700 日志字符串实锤）：向敌基地
          // 中心+半径偏移的格子 AttackMove；无敌情=原地完成
          let anchor: any = null;
          const tgt53 =
            this.findBuildingByTypeFamily(
              this.buildingNameByIndex(3),
              "enemy",
            ) || this.findBuildingByTypeFamily(null, "enemy");
          if (tgt53) {
            anchor = { x: tgt53.tile.rx, y: tgt53.tile.ry };
          } else {
            try {
              const enemies = this.gameApi.getPlayers().filter(
                (n: string) => n !== this.playerName,
              );
              for (const en of enemies) {
                const pd = this.gameApi.getPlayerData(en);
                if (pd && pd.startLocation) {
                  anchor = { x: pd.startLocation.x, y: pd.startLocation.y };
                  break;
                }
              }
            } catch (_) {}
          }
          if (!anchor) return "advance";
          const cell53 = {
            x: Math.max(0, anchor.x + this.rng.randomRanged(-6, 6)),
            y: Math.max(0, anchor.y + this.rng.randomRanged(-6, 6)),
          };
          team.missionCell = cell53;
          this.orderUnits(
            team.unitIds,
            OrderType.AttackMove,
            cell53.x,
            cell53.y,
          );
          break;
        }
        case 54: {
          // GatherAtBase（34 处，0x6EFA10 镜像版）：向己方基地方向集结
          let own: any = null;
          const cy = this.findBuildingByTypeFamily(
            this.buildingNameByIndex(3),
            "self",
          );
          if (cy) own = { x: cy.tile.rx, y: cy.tile.ry };
          if (!own) {
            try {
              const pd = this.gameApi.getPlayerData(this.playerName);
              own = { x: pd.startLocation.x, y: pd.startLocation.y };
            } catch (_) {}
          }
          if (!own) return "advance";
          const cell54 = {
            x: Math.max(0, own.x + this.rng.randomRanged(-5, 5)),
            y: Math.max(0, own.y + this.rng.randomRanged(-5, 5)),
          };
          team.missionCell = cell54;
          this.orderUnits(
            team.unitIds,
            OrderType.Move,
            cell54.x,
            cell54.y,
          );
          break;
        }
        case 58: {
          // MoveToFriendlyStructure（49 处，0x6EE5C0=FindFriendlyBuilding）：
          // arg 低 16 位=建筑索引，移到己方该类（含同族）建筑旁驻守
          const idx58 = Number(p) & 0xffff;
          const name58 = this.buildingNameByIndex(idx58);
          const tgt58 =
            this.findBuildingByTypeFamily(name58, "self") ||
            this.findBuildingByTypeFamily(name58, "enemy");
          if (tgt58) {
            team.missionCell = { x: tgt58.tile.rx, y: tgt58.tile.ry };
            this.orderUnits(
              team.unitIds,
              OrderType.Move,
              tgt58.tile.rx,
              tgt58.tile.ry,
            );
          } else return "advance";
          break;
        }
        case 55: // IronCurtainOnTaskForce（超武联动，引擎 Ready 判定后释放）——占位
        case 57: // ChronoShiftToTargetType — 同上
          return "advance";
      }
    } catch (_) {}
  }

  /** 命令单位（经 actionsApi 入队，按 5 个一批；可选 x,y）。 */
  orderUnits(unitIds: any, order: any, x?: any, y?: any): void {
    if (!unitIds || unitIds.length === 0) return;
    // 分批发送命令（最多5个单位一组）
    const batchSize = 5;
    for (let i = 0; i < unitIds.length; i += batchSize) {
      const batch = unitIds.slice(i, i + batchSize);
      try {
        if (x !== undefined && y !== undefined) {
          console.log("[AiEngine] orderUnits: order=" + order + " x=" + x + " y=" + y + " units=[" + batch.join(",") + "]");
          this.actionsApi.orderUnits(batch, order, x, y);
        } else {
          this.actionsApi.orderUnits(batch, order);
        }
      } catch (e) {
        console.log("[AiEngine] orderUnits ERROR: " + e);
      }
    }
  }

  // ============================================================
  // 对外接口
  // ============================================================

  /** 获取当前科技等级。 */
  getTechLevel(): any {
    return this.techLevel;
  }

  /** 获取活跃队伍信息（供外部Bot决策）。 */
  getActiveTeamInfo(): any[] {
    return this.activeTeams
      .filter(function (t: any) {
        return t.state !== "done";
      })
      .map(function (t: any) {
        return {
          name: t.teamType.name,
          state: t.state,
          unitCount: t.unitIds.length,
          scriptIndex: t.scriptIndex,
          priority: t.teamType.priority,
        };
      });
  }

  /** 获取当前应建造的单位列表（按科技等级匹配 BuildQueueN，否则 __default__）。 */
  getBuildQueue(): any[] {
    // 批次 4：原版格式数据源 → 运行时建造队列（Prerequisite 组维护器产出）
    if (this.originalTriggers.length > 0) {
      const out: any[] = [];
      for (let i = 0; i < this.productionQueue.length; i++) {
        const e = this.productionQueue[i];
        out.push({ unitType: e.typeName, priority: 5 });
      }
      return out;
    }
    if (!this.parsed || !this.parsed.buildQueues) return [];
    const queues = this.parsed.buildQueues;
    const tl = this.techLevel;
    // 按科技等级查找最匹配的队列
    let bestKey: any = null;
    let bestMatch = -1;
    const keys = Object.keys(queues);
    for (let ki = 0; ki < keys.length; ki++) {
      // 尝试从键名提取科技等级（如 "BuildQueue3" → 3）
      const match = keys[ki].match(/(\d+)/);
      if (match) {
        const lv = parseInt(match[1]);
        if (lv <= tl && lv > bestMatch) {
          bestMatch = lv;
          bestKey = keys[ki];
        }
      }
    }
    if (bestKey && queues[bestKey]) return queues[bestKey];
    // 回退到默认队列
    return queues["__default__"] || [];
  }

  /** 重置所有触发器状态（用于新游戏开始）。 */
  reset(): void {
    this.activeTeams = [];
    this.triggerFired = {};
    this.totalTeamsCreated = 0;
    this.techLevel = 1;
    this.lastTriggerCheck = 0;
  }
}

void SpeedType;

/** 模块层安全调用（generalGroupByName 用）。 */
function safeCall(engine: any, fn: any) {
  try {
    return fn(engine);
  } catch (_) {
    return null;
  }
}
