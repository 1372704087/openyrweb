/**
 * AiTriggerRuntime — 原版 AITrigger 触发层移植（批次 2）。
 *
 * 依据 gamemd.exe 1.001 反编译（产物 G:\ida-yr-work\out\ai_survey\dec\batch2_*.c）：
 * - 条件求值   ConditionMet            0x41E720
 * - 条件 helper EnemyHouseOwns        0x41EAF0   OwnerHouseOwns      0x41EE90
 *              CivilianHouseOwns     0x41EC90   IronCurtainCharged  0x41F0D0
 *              ChronoSphereCharged   0x41F180   HouseCredits        0x41F230
 * - 权重涨落   RegisterSuccess        0x41FD60   RegisterFailure     0x41FE20
 * - 逐 house 扫描+加权分布 0x6F0AB0（HouseClass::AI 直接调用）
 * - 成功/失败登记挂点：TeamClass 析构 0x6E8DE0（队伍消亡时按 +132 成功标志登记）
 *
 * 语义要点（与旧自创 checkTriggers 的差异）：
 * - 条件号：-1=恒真, 0=敌方拥有对象, 1=己方拥有对象, 2=敌方电力黄, 3=敌方电力红,
 *   4=敌方金钱, 5=铁幕充能, 6=超时空充能, 7=中立拥有对象。
 * - 比较器：操作数 + 算子（0=<,1=<=,2==,3=>=,4=>,5=!=）。
 * - 权重即分布权重：WeightCurrent 成功/失败按 TrackRecord 涨落，钳位 [Min,Max]；
 *   =5000 表示无视其余立即单独点火。
 * - 基地防御优先（ConditionMet 0x41E720 门控块，三分支）：
 *   有目标 house 且防御不缺 → 非防御触发放行、防御触发看 enoughBaseDefense；
 *   有目标 house 且防御缺 → 非防御触发拒绝、防御触发看 enoughBaseDefense；
 *   无目标 house → 非防御触发拒绝、防御触发看 enoughBaseDefense。
 * - 触发节拍：TeamDelays[难度]（原版 2000,2500,3500 tick）。
 * - 原版全局触发（aimd.ini 来源）在战役中禁用（LoadFromINIList +156/Scenario 13492）。
 *
 * world 查询不可用时（电力/超武等 AiApi 尚未暴露），条件按不满足处理。
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

/** 触发器权重状态（原版字段在 AITriggerTypeClass 上，全局一份，非每 house）。 */
export interface TriggerWeightState {
  weightCurrent: number;
  minWeight: number;
  maxWeight: number;
  successCount: number;
  totalCount: number;
}

/** rulesmd.ini [General] 中与触发器相关的参数（键名与原版偏移已互证）。 */
export interface TriggerGeneralParams {
  /** AITriggerSuccessWeightDelta=20（General +192） */
  successWeightDelta: number;
  /** AITriggerFailureWeightDelta=-50（General +200） */
  failureWeightDelta: number;
  /** AITriggerTrackRecordCoefficient=1（General +208） */
  trackRecordCoefficient: number;
  /** TeamDelays=2000,2500,3500（easy,medium,hard） */
  teamDelays: number[];
  /** TotalAITeamCap=30,30,30（General +5068，原版注释由难到易） */
  totalTeamCap: number[];
  /** 每难度基地防御队上限（General +5040/+5012 两处数组；原版键名待考证，暂用缺省） */
  baseDefenseTeamCap: number[];
  /** AIMinorSuperReadyPercent=.7（General +3440） */
  minorSuperReadyPercent: number;
  /** 基地防御优先总开关（General 字节 6131；键名待考证）。
   *  开=防御队没到上限前压制全部进攻触发器（易卡死进攻）；默认关=放行进攻。 */
  baseDefensePriority: boolean;
}

export const DEFAULT_GENERAL: TriggerGeneralParams = {
  successWeightDelta: 20,
  failureWeightDelta: -50,
  trackRecordCoefficient: 1,
  teamDelays: [2000, 2500, 3500],
  totalTeamCap: [30, 30, 30],
  baseDefenseTeamCap: [4, 3, 2],
  minorSuperReadyPercent: 0.7,
  baseDefensePriority: false,
};

/** 触发层对世界的查询接口（由 AiEngine/上层适配；不支持的查询给保守缺省）。 */
export interface TriggerWorld {
  /** 随机整数 [min,max]（原版为 ScenarioClass::Random.RandomRanged，同步通道）。 */
  randomRanged(min: number, max: number): number;
  /** 解析 TeamType 名 → { isBaseDefense, max, members }；未解析到返回 null。
   *  members = 该队 TaskForce 的成员类型名（可重复，按编成行展开）。 */
  resolveTeamType(name: any): { isBaseDefense: boolean; max: number; members?: string[] } | null;
  /** 某 TeamType 当前活动实例数（原版 0x5095D0）。 */
  countActiveTeams(teamName: any): number;
  /** 该 house 是否为 AI house 且生产活动开启（原版 house+498）。 */
  isAIHouseActive(): boolean;
  /** 难度 0/1/2。 */
  difficulty(): number;
  /** 己方 side 序号（SideType 0=盟军 1=苏军 2=尤里）。 */
  sideIndex(): number;
  /**
   * 归属门控（原版 AITriggerTypeClass 的 OwnerHouse，0x41FEE0）：
   * CSV 第 3 字段指名国家时，仅该国家可触发本触发器。
   * 未实现时返回 undefined（调用方按"不限"放行）。
   */
  houseMatches?(countryName: string): boolean;
  /**
   * 队伍可招募门控（原版 0x509610 CanBuild）：本 house 此刻能否生产该类型。
   * 未实现时返回 undefined（调用方按"可招募"放行）。
   */
  canProduceUnit?(typeName: string): boolean;
  /** 是否遭遇战/多人（非单人战役）。 */
  isSkirmishOrMP(): boolean;
  /** 是否战役。 */
  isCampaign(): boolean;
  /** 己方科技等级。 */
  techLevel(): number;
  /** 己方金钱。 */
  credits(): number;
  /** 己方某类型对象拥有数。 */
  ownedCount(objectType: string): number;
  /** 目标 house 是否存在（原版 a3）。 */
  hasTargetHouse(): boolean;
  /** 目标 house 对象拥有数。 */
  targetOwnedCount(objectType: string): number;
  /** 目标 house 金钱。 */
  targetCredits(): number;
  /** 目标 house 电力余量（Provided-Drained）；不可用返回 0。 */
  targetPowerSurplus(): number;
  /** 己方指定超武类型的充能进度 [0,1]；不可用返回 0。传入的是
   *  `SuperWeaponType` 原值（铁幕=1、超时空=3，见上面两个常量）。 */
  superWeaponCharge(swType: number): number;
  /** 中立方是否拥有对象（条件 7）。 */
  civilianOwnedCount(objectType: string): number;
}

/** 比较器算子求值（0x41F230 HouseCredits 尾部六档 switch，各 helper 通用）。 */
function compare(value: number, operator: number, operand: number): boolean {
  switch (operator) {
    case 0: return value < operand;
    case 1: return value <= operand;
    case 2: return value === operand;
    case 3: return value >= operand;
    case 4: return value > operand;
    case 5: return value !== operand;
    default: return false;
  }
}

/**
 * 超武类型号（与 `game/type/SuperWeaponType` 一致，这里用字面量避免多一条
 * 模块依赖）：条件 5 找铁幕、条件 6 找超时空。
 *
 * ⚠ 反编译实证：`IronCurtainCharged 0x41F0D0` 在 house 超武表里找
 * `type == 1`，`ChronoSphereCharged 0x41F180` 找 `type == 3`。
 * 条件 6 曾按"1=铁幕, 2=超时空"的想当然写法传 2 —— 而 2 是 LightningStorm，
 * 于是 3 条 w=5000（立即点火）的超时空触发器永远充能 0，恒不可点火。
 */
const SW_IRON_CURTAIN = 1;
const SW_CHRONO_SPHERE = 3;

/** 单一"拥有对象"条件（0x41EAF0/0x41EE90/0x41EC90 同构：数对象 → 六档算子）。 */
function houseOwnsMet(
  count: number,
  operator: number,
  operand: number,
): boolean {
  return compare(count, operator, operand);
}

/**
 * ConditionMet 0x41E720 移植。
 * @param defenseTeamCount 己方活动基地防御队数（原版 house+22124 计数）
 * @param enoughBaseDefense 扫描层传入：防御队数是否超过上限（原版 a4）
 */
export function conditionMet(
  tr: any,
  world: TriggerWorld,
  params: TriggerGeneralParams,
  defenseTeamCount: number,
  enoughBaseDefense: boolean,
): boolean {
  const team1 = world.resolveTeamType(tr.team1);
  if (!team1) return false; // 原版 team1 必须存在
  const team2 = tr.team2 ? world.resolveTeamType(tr.team2) : null;
  // v7：team1/team2 任一为基地防御队（TeamTypeClass+246）
  const isDefenseTrigger = !!(team1.isBaseDefense || (team2 && team2.isBaseDefense));

  const targetHouse = world.hasTargetHouse();
  const diff = world.difficulty();
  const defCap = params.baseDefenseTeamCap[diff] ?? 4;
  const defenseFull =
    !params.baseDefensePriority || defenseTeamCount >= defCap;

  // ===== 门控块（ConditionMet 前 60 行）=====
  if (targetHouse) {
    if (defenseFull) {
      // 防御不缺（或总开关关闭）：非防御放行；防御触发看 a4
      if (isDefenseTrigger && enoughBaseDefense) return false;
    } else {
      // 防御缺：非防御触发让位；防御触发看 a4
      if (!isDefenseTrigger) return false;
      if (enoughBaseDefense) return false;
    }
  } else {
    // 无目标 house：非防御触发拒绝
    if (!isDefenseTrigger) return false;
    if (enoughBaseDefense) return false;
  }

  // ===== LABEL_17 起的门控 =====
  // 全局触发（aimd.ini 来源，+156==1）在战役中禁用
  if (tr.globalFlag && world.isCampaign()) return false;
  // [AITriggerTypesEnable]（+164）
  if (tr.enabled === 0) return false;
  // 难度开关（+210/+211/+212，战役用 Scenario 难度、遭遇战用 house 难度）
  const enableByDiff = [tr.enabledEasy, tr.enabledMedium, tr.enabledHard];
  if (!enableByDiff[diff]) return false;
  // 阵营门控（+172）：CSV side 1/2/3 → 要求 house side 0/1/2；0=不限
  if (tr.side >= 1 && tr.side <= 3 && world.sideIndex() !== tr.side - 1) {
    return false;
  }
  // 归属门控（OwnerHouse，CSV 第 3 字段 = tr.house）：
  // `<none>`/`<all>`/空 = 不限；其余为具体国家名（British/Alliance/Korea…），
  // 只有该国家才能触发。缺这道门控时，非英国的 AI 照样触发
  // "Nation British - Hard"（团队 0CAC27DC-G，TaskForce 含 British 专属的
  // SNIPE），建出来的队伍永远招不满 → 永久卡在 recruiting（实测 age 涨到 26729
  // 仍 units=13/need=SNIPE）。国家名取不到时放行，避免误杀全部触发器。
  if (
    typeof tr.house === "string" &&
    tr.house.length > 0 &&
    tr.house.charAt(0) !== "<" &&
    typeof world.houseMatches === "function" &&
    !world.houseMatches(tr.house)
  ) {
    return false;
  }
  // 科技等级（+176）
  if (tr.techLevel >= 0 && world.techLevel() < tr.techLevel) return false;

  // ===== 条件 switch（+152：-1..7）=====
  const cond = tr.conditionType | 0;
  let met = false;
  if (targetHouse) {
    switch (cond) {
      case -1:
        met = true;
        break;
      case 0: // 敌方拥有对象
        met = houseOwnsMet(
          world.targetOwnedCount(tr.conditionObject),
          tr.comparatorOperator,
          tr.comparatorOperand,
        );
        break;
      case 1: // 己方拥有对象
        met = houseOwnsMet(
          world.ownedCount(tr.conditionObject),
          tr.comparatorOperator,
          tr.comparatorOperand,
        );
        break;
      case 2: // 敌方电力黄：余量 < 100
        met = world.targetPowerSurplus() < 100;
        break;
      case 3: // 敌方电力红：余量 < 0
        met = world.targetPowerSurplus() < 0;
        break;
      case 4: // 敌方金钱
        met = compare(
          world.targetCredits(),
          tr.comparatorOperator,
          tr.comparatorOperand,
        );
        break;
      case 5: // 铁幕充能 ≥ AIMinorSuperReadyPercent
        met = world.superWeaponCharge(SW_IRON_CURTAIN) >= params.minorSuperReadyPercent;
        break;
      case 6: // 超时空充能（SuperWeaponType.ChronoSphere = 3）
        met = world.superWeaponCharge(SW_CHRONO_SPHERE) >= params.minorSuperReadyPercent;
        break;
      case 7: // 中立拥有对象——与条件 0/1/4 同走六档算子；旧实现恒按布尔
        // （等价 >=1），"中立拥有 X == 0"（中立没有才触发）会反向误判
        met = houseOwnsMet(
          world.civilianOwnedCount(tr.conditionObject),
          tr.comparatorOperator,
          tr.comparatorOperand,
        );
        break;
      default:
        met = false;
        break;
    }
  } else {
    // 无目标 house：仅 -1 恒真 / 1 己方拥有 两条路径
    if (cond === -1) {
      met = true;
    } else if (cond === 1) {
      met = houseOwnsMet(
        world.ownedCount(tr.conditionObject),
        tr.comparatorOperator,
        tr.comparatorOperand,
      );
    }
  }
  if (!met) return false;

  // ===== 队伍可用性（LABEL_67：0x41FEE0 归属 + 0x509610 可招募 + Max 上限）=====
  // 可招募门控（0x509610 CanBuild）：TaskForce 里每个成员类型都必须可由本 house
  // 生产，否则整支队不放行。缺这道门控会建出"永远填不满"的队伍并永久占用
  // activeTeams 名额 —— 实测 aimd 的 Soviet Bombard Hard → 0CA1683C-G，
  // TaskForce 写的是 `0=3,V3ROCKET`（名字叫 "3 V3"，本意是 V3 发射车，
  // 却写成了 V3 的导弹弹体 [V3ROCKET]，TechLevel=-1 恒不可产）：
  // 队伍 age 1200+ 仍停在 units=4/need=V3ROCKET×3，需求里永远挂着 V3ROCKETx3。
  if (
    team1.members &&
    team1.members.length > 0 &&
    typeof world.canProduceUnit === "function"
  ) {
    for (let mi = 0; mi < team1.members.length; mi++) {
      if (!world.canProduceUnit(team1.members[mi])) return false;
    }
  }
  // Max 实例上限（0x5095D0）——只对 Team1 在扫描层拒绝。
  // ⚠ Team2 的 Max 判定**不能**放在这里：原版是 `CreateTeam 0x6F09C0` 在建队时
  // 判（超限返回 nullptr，只丢那一支）。若在扫描层连 Team2 一起判，某触发的
  // 支援队一旦满员，整个触发器（含主队）就被永久拒掉 —— 把主队一起封死。
  // Team2 的 Max 门控在 `AiEngine.canSpawnTriggerTeam` 里逐队判。
  const max1 = team1.max;
  if (max1 >= 0 && world.countActiveTeams(tr.team1) >= max1) return false;
  return true;
}

/**
 * RegisterSuccess 0x41FD60：成功 → 权重上升（TrackRecord 比例增量 + General 常数）。
 */
export function registerSuccess(
  s: TriggerWeightState,
  p: TriggerGeneralParams,
): void {
  let adjust = 0;
  if (s.totalCount > 0) {
    adjust = s.totalCount * (s.successCount / s.totalCount - 0.5);
    if (adjust < 0) adjust = 0;
  }
  let wc = adjust + p.successWeightDelta + s.weightCurrent;
  if (wc < s.minWeight) wc = s.minWeight;
  if (wc > s.maxWeight) wc = s.maxWeight;
  s.weightCurrent = wc;
  s.successCount++;
  s.totalCount++;
}

/**
 * RegisterFailure 0x41FE20：失败 → 权重下降（General 负增量 + TrackRecord 缩放）。
 */
export function registerFailure(
  s: TriggerWeightState,
  p: TriggerGeneralParams,
): void {
  let adjust = 0;
  if (s.totalCount > 0) {
    adjust =
      s.totalCount *
      ((s.successCount / s.totalCount - 0.5) * p.trackRecordCoefficient);
    if (adjust > 0) adjust = 0;
  }
  let wc = adjust + p.failureWeightDelta + s.weightCurrent;
  if (wc < s.minWeight) wc = s.minWeight;
  if (wc > s.maxWeight) wc = s.maxWeight;
  s.weightCurrent = wc;
  s.totalCount++;
}

/**
 * 扫描+加权分布（0x6F0AB0 核心）。
 * @param stats 可选出参：诊断用，回填本轮扫描规模。
 *   `scanned` = 参与评估的触发器数（有权重状态的）；
 *   `met` = 通过全部门控（含阵营/科技/可招募/Max）的触发器数；
 *   `candidates` = 其中权重 > 0、进入加权抽签的数量；
 *   `capBlocked` = 是否因 TotalAITeamCap 直接放弃本轮。
 *   **`met` 是判断"AI 为什么只会造那几个单位"的第一手数字**：
 *   它长期只有个位数 = 触发器在条件层就被大量拒掉，问题在条件实现而不在生产端。
 * @returns 命中触发器与 Team1/Team2 名；无命中返回 null
 */
export function scanTriggers(
  triggers: any[],
  states: Map<any, TriggerWeightState>,
  world: TriggerWorld,
  params: TriggerGeneralParams,
  activeTeamCount: number,
  activeDefenseTeamCount: number,
  defenseTeamCount: number,
  stats?: {
    scanned?: number;
    met?: number;
    candidates?: number;
    capBlocked?: boolean;
  },
): { trigger: any; team1: any; team2: any } | null {
  if (stats) {
    stats.scanned = 0;
    stats.met = 0;
    stats.candidates = 0;
    stats.capBlocked = false;
  }
  if (!world.isAIHouseActive()) return null;
  const diff = world.difficulty();
  const cap = params.totalTeamCap[diff] ?? 30;
  const defCap = params.baseDefenseTeamCap[diff] ?? 4;
  // 队伍总量上限（原版超限解散最低优先级队——解散归生产层，这里只拒绝新建）
  if (activeTeamCount >= cap) {
    if (stats) stats.capBlocked = true;
    return null;
  }
  const enoughBaseDefense = activeDefenseTeamCount > defCap;

  // 构建加权分布：WeightCurrent 为权重；5000=立即单独点火
  const candidates: { tr: any; weight: number }[] = [];
  let total = 0;
  let immediate: any = null;
  for (const tr of triggers) {
    const st = states.get(tr);
    if (!st) continue;
    if (stats) stats.scanned = (stats.scanned || 0) + 1;
    if (
      conditionMet(tr, world, params, defenseTeamCount, enoughBaseDefense)
    ) {
      if (stats) stats.met = (stats.met || 0) + 1;
      const w = Math.floor(st.weightCurrent);
      if (w === 5000) {
        immediate = tr;
        break;
      }
      if (w > 0) {
        candidates.push({ tr, weight: w });
        total += w;
      }
    }
  }
  if (stats) stats.candidates = candidates.length;
  let picked = immediate;
  if (!picked && candidates.length > 0 && total > 0) {
    const roll = world.randomRanged(1, total);
    let acc = 0;
    for (const c of candidates) {
      acc += c.weight;
      if (acc >= roll) {
        picked = c.tr;
        break;
      }
    }
  }
  if (!picked) return null;
  return { trigger: picked, team1: picked.team1, team2: picked.team2 || null };
}

/**
 * 从 rulesmd.ini [General] 文本/节读取触发层参数；缺省用原版默认。
 * @param general 节对象（get(key) 可用），或 null
 */
export function loadGeneralParams(general: any): TriggerGeneralParams {
  const p: TriggerGeneralParams = { ...DEFAULT_GENERAL };
  if (!general || !general.get) return p;
  const numList = function (raw: any, def: number[]): number[] {
    if (raw === undefined || raw === null) return def;
    const parts = String(raw).split(",").map(function (x) { return parseFloat(x); });
    if (parts.some(function (x) { return isNaN(x); })) return def;
    return parts;
  };
  const v1 = general.get("AITriggerSuccessWeightDelta");
  if (v1 !== undefined && v1 !== null) p.successWeightDelta = parseFloat(v1) || 0;
  const v2 = general.get("AITriggerFailureWeightDelta");
  if (v2 !== undefined && v2 !== null) p.failureWeightDelta = parseFloat(v2) || 0;
  const v3 = general.get("AITriggerTrackRecordCoefficient");
  if (v3 !== undefined && v3 !== null) p.trackRecordCoefficient = parseFloat(v3) || 0;
  p.teamDelays = numList(general.get("TeamDelays"), p.teamDelays);
  p.totalTeamCap = numList(general.get("TotalAITeamCap"), p.totalTeamCap);
  const v4 = general.get("AIMinorSuperReadyPercent");
  if (v4 !== undefined && v4 !== null) p.minorSuperReadyPercent = parseFloat(v4) || 0.7;
  return p;
}

// ============================================================
// 怒气选敌（批次 8：UpdateAngerNodes 0x504790 移植）
// 原版每 house 一张怒气节点表（+22024，项={house, anger}）：受害时对
// 加害方累加；再选"最恨的非盟友"写入 +22016 作为当前敌人——触发层、
// 超武、进攻方向共用该判定。
// ============================================================

/** 怒气增量（YR 引擎内建值，rulesmd 无键；保守取 20 待原版考证）。 */
export const ANGER_DELTA = 20;

/** UpdateAngerNodes 第一段：对目标 house 的怒气累加（节点不存在则建）。 */
export function addAnger(
  nodes: Record<string, number>,
  house: string,
  delta: number,
): void {
  if (!nodes || !house || !delta) return;
  nodes[house] = (nodes[house] || 0) + delta;
}

/**
 * UpdateAngerNodes 第二段：选怒气最高且通过谓词（非自己/非盟友/非观察者）
 * 的 house 为当前敌人；表空或全被排除返回 null（原版写 -1）。
 */
export function selectAngriest(
  nodes: Record<string, number>,
  isExcluded: (house: string) => boolean,
): string | null {
  if (!nodes) return null;
  let best: string | null = null;
  let bestAnger = 0;
  for (const house of Object.keys(nodes)) {
    const anger = nodes[house];
    if (anger <= bestAnger) continue;
    if (isExcluded && isExcluded(house)) continue;
    best = house;
    bestAnger = anger;
  }
  return best;
}
