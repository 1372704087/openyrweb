/**
 * AiProductionRuntime — 原版 AI 生产层移植（批次 4 第一切片）。
 *
 * 依据 gamemd.exe 1.001 反编译（G:\ida-yr-work\out\ai_survey\dec\*.c）：
 * - AllPrerequisitesAvailable 0x505360：前置表逐项 any-of；负数索引 -1..-6 映射
 *   rules [General] 的替代组列表（+2248/+2276/+2304/+2332/+2360/+2612）。
 * - FirstBuildableFromArray 0x5051E0：按 country 位掩码（类型+1740）、必须位掩码
 *   （+3488）、排除位掩码（+3492）、侧位（+1744）选第一个可造类型。
 * - Update_FactoriesQueues 0x509140：按类别（3=建筑,7=步兵,16=载具,40=飞机）
 *   取 house 上对应 FactoryClass（+21420/+21436[+21452]/+21424/+21432[+21428]），
 *   逐项撤销不能维持的生产（vtbl+148），队列空且无在制品则挂起工厂（vtbl+32）。
 *
 * 尚未移植（后续切片）：
 * - AI_BaseConstructionUpdate 0x4FE3E0 全体：建造队列在 house+22276/22280/22292
 *   （16 字节条目），+22092=待放置节点索引；含 AllPrerequisitesAvailable 校验与
 *   RandomRanged 选择；条目由谁入队（BaseNode/触发需求）待下一轮考证。
 * - 步兵/飞机孪生 0x4FEEE0/0x4FF210（各 805B）、CanBuild 0x4F7870（536 行）。
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ProductionWorld {
  /** 己方 country 序号（country 位掩码用）。 */
  countryIndex(): number;
  /** 己方 side 序号（side 位掩码用）。 */
  sideIndex(): number;
  /** [General] 负数前置替代组：-1..-6 → 类型名数组。 */
  generalPrerequisiteGroup(index: number): string[];
  /** 己方拥有的建筑类型名集合。 */
  ownedBuildingTypes(): Set<string>;
  /** 类型的前置表（原版 +1596/+1608：数字项，负数=General 组）。 */
  prerequisitesOf(typeName: string): number[];
  /** FirstBuildable 的类型位掩码：{ sideBits, requiredBits, excludedBits, ownerSide }。 */
  typeMasks(typeName: string): {
    countryBits: number;
    requiredBits: number;
    excludedBits: number;
    ownerSide: number;
  };
  /** FactoryClass 队列视图：items + 在制品（按类别+变体取原版对应槽位）。 */
  factoryQueue(
    category: number,
    flag: boolean,
    subtype: number,
  ): {
    items: any[];
    active: any;
  } | null;
  /** 原版 vtbl+148：该生产项在当前 house 状态下能否维持（前置丢失/缺钱等）。 */
  factoryItemCanSustain(item: any): boolean;
  /** 挂起工厂（队列空且无在制品，vtbl+32）。 */
  suspendFactory(category: number): void;
}

/**
 * AllPrerequisitesAvailable 0x505360 移植。
 * @param prereqs 前置表（正数=类型索引语义由 world 解释，负数=-1..-6 General 组）
 */
export function allPrerequisitesAvailable(
  typeName: string,
  world: ProductionWorld,
): boolean {
  const prereqs = world.prerequisitesOf(typeName);
  const owned = world.ownedBuildingTypes();
  for (let i = 0; i < prereqs.length; i++) {
    const entry = prereqs[i];
    let alternatives: string[];
    if (entry < 0) {
      alternatives = world.generalPrerequisiteGroup(entry);
    } else {
      alternatives = [String(entry)];
    }
    let anyOk = false;
    for (let a = 0; a < alternatives.length; a++) {
      if (owned.has(alternatives[a])) {
        anyOk = true;
        break;
      }
    }
    if (!anyOk) return false;
  }
  return true;
}

/**
 * FirstBuildableFromArray 0x5051E0 移植：返回数组中第一个该 house 可造的类型名。
 * @param types 类型名数组（顺序即优先级）
 */
export function firstBuildableFromArray(
  types: string[],
  world: ProductionWorld,
): string | null {
  const countryBit = 1 << world.countryIndex();
  const sideBit = 1 << world.sideIndex();
  for (let i = 0; i < types.length; i++) {
    const name = types[i];
    const m = world.typeMasks(name);
    // 类型 country/side 可造位掩码
    if ((countryBit & m.countryBits) === 0) continue;
    // 必须位掩码（-1 = 不限）
    if (m.requiredBits !== -1 && (sideBit & m.requiredBits) === 0) continue;
    // 排除位掩码（-1 = 不排除）
    if (m.excludedBits !== -1 && (sideBit & m.excludedBits) !== 0) continue;
    // 归属侧位（-1 = 不限）
    if (m.ownerSide !== -1 && m.ownerSide !== world.sideIndex()) continue;
    return name;
  }
  return null;
}

/**
 * Update_FactoriesQueues 0x509140 移植。
 * @param category AbsID：3=建筑, 7=步兵, 16=载具, 40=飞机
 * @param subtype 步兵时区分普通/变体（原版 a4==5），飞机时区分机场/机坪（a3）
 * @returns 实际动作："sustained"|"abandoned-items"|"suspended"|"idle"
 */
export function updateFactoriesQueues(
  world: ProductionWorld,
  category: number,
  flag: boolean,
  subtype: number,
): string {
  const q = world.factoryQueue(category, flag, subtype);
  if (!q) return "idle";
  // 逐项撤销不能维持的生产（前置丢失/资金不足）；原版撤销后继续走在制品处理
  let removed = false;
  const kept: any[] = [];
  for (let i = 0; i < q.items.length; i++) {
    if (world.factoryItemCanSustain(q.items[i])) kept.push(q.items[i]);
    else removed = true;
  }
  q.items.length = 0;
  for (const it of kept) q.items.push(it);
  // 无在制品且队列空 → 挂起工厂
  if (!q.active && q.items.length === 0) {
    world.suspendFactory(category);
    return "suspended";
  }
  return removed ? "abandoned-items" : "sustained";
}

/** 类别常量（AbstractType AbsID）。 */
export const ABS_BUILDING = 3;
export const ABS_INFANTRY = 7;
export const ABS_UNIT = 16;
export const ABS_AIRCRAFT = 40;

// ============================================================
// 建造队列维护器（批次 4 第二切片）
// 依据：0x5054B0 初始建造顺序 + 0x50A5C0 基地管理总巡 + 0x50C210 空队重建
// ============================================================

/** rulesmd [General] 前置组键名（真实文件逐字验证）。 */
export const PREREQ_GROUP_KEYS = [
  "PrerequisitePower",
  "PrerequisiteFactory",
  "PrerequisiteBarracks",
  "PrerequisiteRadar",
  "PrerequisiteTech",
  "PrerequisiteProc",
  "PrerequisiteProcAlternate",
];

/** 负数前置索引 → 组键（exe 解析 Prerequisite=<组名> 时换算）。 */
export const NEGATIVE_GROUP_INDEX: Record<number, string> = {
  [-1]: "PrerequisiteFactory",
  [-2]: "PrerequisiteBarracks",
  [-3]: "PrerequisiteRadar",
  [-4]: "PrerequisiteTech",
  [-5]: "PrerequisiteProc",
  [-6]: "PrerequisiteProcAlternate",
};

/** 建造队列条目（原版 house+22280 的 16 字节条目的语义层）。 */
export interface BuildQueueEntry {
  /** 来源组键（Power/Factory/...；显式类型入队时为 null）。 */
  groupName: string | null;
  /** 选定的具体建筑类型名。 */
  typeName: string;
  /** 建造位置锚点（原版取同类建筑旁，tile 坐标）。 */
  anchor?: { x: number; y: number };
  /**
   * 条目种类（用于各自的剪除规则；缺省视为 "group"）：
   *  - "group"   前置组驱动（初始序 / 缺组补建 / 电力插队）——建成即由步骤 1 剪除；
   *  - "defense" 基地防御——"已拥有防御数 ≥ 目标数"时剪除；
   *  - "clone"   按既有建筑补同类——"该类型已拥有数 ≥ 组上限"时剪除。
   * ⚠ 没有这两条剪除规则，防御/复制条目会在队列里永生（本仓建造队列没有
   * "建成即出队"机制，只有按组所有权的剪除），把队头和 8 条上限一起占死。
   */
  kind?: "group" | "defense" | "clone";
}

/**
 * 初始建造顺序（原版 [General] Build* 列表语义，按用户实测原版节奏：
 * 电力→兵营→矿场→重工→雷达。依赖链校验：兵营/矿场仅需电力，
 * 重工需电力+矿场，雷达需矿场——全部满足）。
 * 键名对应 [General] 的 AI 开局建造列表（教程《AI的艺♂术》与 rulesmd 实测一致）。
 */
export const INITIAL_BUILD_ORDER = [
  "BuildPower",
  "BuildBarracks",
  "BuildRefinery",
  "BuildWeapons",
  "BuildRadar",
];

/**
 * 维持/发展用的建造顺序 = 初始序 + 科技组（BuildTech=NATECH,GATECH,YATECH）。
 *
 * 原版 0x5054B0 的初始序里确实没有 Tech（首轮不该排实验室），但基地管理总巡
 * 0x50A5C0 在基础组齐备之后必须继续解锁 PrerequisiteTech；本文件此前把
 * maintainPrerequisiteGroups 也绑在 INITIAL_BUILD_ORDER 上，于是"解锁"这一步
 * 从未发生。后果（2026-10-01 实测三家 AI 日志确认）：
 *  - 高科建筑永不存在 → 需要 GATECH/YATECH 的单位（SREF 光棱、MGTK 幻影 等）
 *    在 isAvailableForProduction 里恒为假（prod diag 里 `MGTKx1:N|SREFx1:N`）；
 *  - 引用这些单位的任务力永远招不满（recruit diag 的 need=MGTK|SREF 不消失，
 *    队伍 age 一路涨到 5900+ 仍停在 recruiting）；
 *  - 基地建筑数永久停在 6 座（建造厂+电力+兵营+矿场+重工+雷达），
 *    prod diag 恒为 adviceB=0 —— AI 从此再不发展。
 */
export const MAINTENANCE_BUILD_ORDER = [...INITIAL_BUILD_ORDER, "BuildTech"];

/** 建造队列维护器的 world 扩展。 */
export interface BuildQueueWorld extends ProductionWorld {
  /** 读取 [General] 组列表（键名 → 类型名数组）。 */
  generalGroup(key: string): string[];
  /** 电力是否不足（原版 GetPowerPercentage 低于阈值）。 */
  powerLow(): boolean;
  /** 己方建造队列（可变引用）。 */
  queue(): BuildQueueEntry[];
  /** 同种子随机（变体挑选）。 */
  randomRanged(min: number, max: number): number;
  /**
   * 基建让位预算（**可缺省**）：当前可用于"非必需基建"的额度。
   *
   * ⚠ 2026-10-04 新增。实测事故（build 20261004-005627）：步骤 5（基地防御）
   * 与步骤 6（按既有建筑补同类）**只按数量判定、完全不看钱**，每轮无条件把
   * 建造队列塞满 ⇒ 三家 AI 的 `credits` 全程归零（AI2 连续 `credits=0`），
   * 而同期 `bldgs` 一路涨到 18~20、缺员单位一条也造不出来
   * （`recruit diag` 的 `stall` 阶梯涨到 1500）。
   * 建造队列（`BuildQueue`）与生产队列是**两条独立队列**：入队本身不扣钱，
   * 扣钱发生在 `queueForProduction`；但一旦条目 Ready，bot 会连续起
   * `credits >= cost*1.2 + teamReserve` 的建筑（`OriginalAiBot` 建筑段），
   * 实际把预算吃光 ⇒ 缺员单位永远排不上。
   *
   * 语义：返回 **剩余可花的钱**；`undefined`/负数 = 不限（保持旧行为，
   * 让既有单测与未接 world 的调用方不受影响）。
   */
  baseGrowthBudget?(): number;
}

/** 基建入队前的预算门控：基建额度用尽则本轮不追加（不改变已在队的条目）。 */
export function baseGrowthBudgetAllows(world: BuildQueueWorld): boolean {
  if (!world || typeof world.baseGrowthBudget !== "function") return true;
  let budget = 0;
  try {
    budget = world.baseGrowthBudget();
  } catch (_) {
    return true;
  }
  if (typeof budget !== "number" || !isFinite(budget)) return true;
  return budget > 0;
}

/** 从组里选出该 house 可造的第一个类型（FirstBuildableFromArray 复用）。 */
export function pickFromGroup(world: BuildQueueWorld, key: string): string | null {
  const list = world.generalGroup(key);
  if (!list || list.length === 0) return null;
  return firstBuildableFromArray(list, world);
}

/**
 * 初始建造队列（0x5054B0 简化保真版）：按实测组序逐组选型入队。
 * 原版另有按难度数量（General+1232/+1246）与 RandomRanged 变体挑选，此处每组 1 项，
 * 数量扩展留待对照确认。
 */
export function buildInitialQueue(world: BuildQueueWorld): BuildQueueEntry[] {
  const entries: BuildQueueEntry[] = [];
  for (const key of INITIAL_BUILD_ORDER) {
    const typeName = pickFromGroup(world, key);
    if (typeName) entries.push({ groupName: key, typeName });
  }
  return entries;
}

/**
 * 前置组维持检查（"被拆即补"）：按维持序（Power/Factory/Radar/Proc/Barracks/Tech）
 * 检查组失去所有权且队列中尚无该组条目 → 追加。科技组排在最后，只有在五个基础组
 * 齐备后才会被选中（即"基础打满才升高科"），与 INITIAL_BUILD_ORDER 的首轮语义共存。
 * @returns 本次追加的条目
 */
export function maintainPrerequisiteGroups(world: BuildQueueWorld): BuildQueueEntry | null {
  const queue = world.queue();
  for (const key of MAINTENANCE_BUILD_ORDER) {
    const list = world.generalGroup(key);
    if (!list || list.length === 0) continue;
    const owned = world.ownedBuildingTypes();
    let has = false;
    for (const t of list) {
      if (owned.has(t)) {
        has = true;
        break;
      }
    }
    if (has) continue;
    const inQueue = queue.some(function (e) {
      return e.groupName === key;
    });
    if (inQueue) continue;
    const typeName = pickFromGroup(world, key);
    if (typeName) {
      const entry: BuildQueueEntry = { groupName: key, typeName };
      queue.push(entry);
      return entry;
    }
  }
  return null;
}

/**
 * 电力插队（0x50A5C0 电力分支）：电力不足且队列中无电站 → 插入队列中部
 * （原版为 memcpy 后移+计数递增，语义=优先于排在其后的常规建造）。
 * @returns 插入的条目或 null
 */
export function insertPowerIfLow(world: BuildQueueWorld): BuildQueueEntry | null {
  if (!world.powerLow()) return null;
  const queue = world.queue();
  const hasPower = queue.some(function (e) {
    return e.groupName === "PrerequisitePower";
  });
  if (hasPower) return null;
  const typeName = pickFromGroup(world, "PrerequisitePower");
  if (!typeName) return null;
  const entry: BuildQueueEntry = { groupName: "PrerequisitePower", typeName };
  const at = Math.floor(queue.length / 2);
  queue.splice(at, 0, entry);
  return entry;
}

// ============================================================
// 基地防御（0x50A5C0 第二段循环）—— 2026-10-01 新增
// ============================================================
//
// 反编译实证：`0x50A5C0` 第二段循环遍历**己方建筑**，先用
// `if (v83[953] >= 0) skip` 过滤掉"没有防御属性"的建筑，再对合格建筑
// 按 `+3808 / +3812` 两个累加值与 `house+90292`（力预估预算）比较，
// 决定是否在队列中插入该建筑类型的**又一份**。
// 配合 rulesmd 里这段原版注释：
//   ;gs To decide what base defense to use, ... The AI will analyze the Enemy's
//   force (in money terms) and pick Air Armor or Infantry ... all currently
//   buildable base defenses will be made into a weighted distribution based on
//   their AntiXXXValue numbers.
// ⇒ **"防御建筑"的判定就是该类型在 rulesmd 里写了 AntiAir/Armor/InfantryValue
//   （其余建筑缺省 -1，正好被上面那个 `>= 0` 过滤掉）**。已实测：
//   [GAPILL] AntiInfantryValue=25 AntiArmorValue=10 AntiAirValue=0；
//   [NASAM]/[NAFLAK] AntiAirValue=25；[ATESLA] 25/25/0；[YAGGUN] 25/10/25。
//
// ⚠ 与原版的偏离（已确认无法逐字复刻，明确记录）：
//   `house+90292`（力预估预算）与 `+3808/+3812` 到底对应 [General] 哪个键尚未定案，
//   所以"该造几座防御"改用 rulesmd **显式**给出的数量表：
//     [General] AlliedBaseDefenseCounts=25,20,6 / SovietBaseDefenseCounts /
//               ThirdBaseDefenseCounts      （原版注释：h,m,e 顺序）
//   这正是这两个键存在的目的（注释里还写着"取代旧的 arcane formula"）。
//   加权挑选用三个 Anti*Value 之和做权重（原版按敌方兵种构成选 Air/Armor/Infantry，
//   需要力预估数据，此处退化为"越全面越优先"）。

/**
 * 「基地防御 + 按既有建筑补同类」总开关（**2026-10-01 打开**）。
 *
 * 历史：逻辑先实现并有单测（`临时文件/check-ai-base-growth.mjs`，36 断言），
 * 2026-10-01 实测打开会打崩基地建设（防御建筑 placeBuilding 不落地 → 条目
 * 永停 Ready → 建造厂被占死，AI 整局 bldgs 卡在 2），故曾长期关闭。
 *
 * 打开依据——卡死三要素逐一被治：
 *  1. Ready 占死 → bot 层"同格 50 次"护栏（批次 5）会 unqueue 卡死条目；
 *  2. 选址错格（返回 CY 自身格）→ findPlacement pad 随底盘动态 + 中心只认
 *     真建筑（批次 10）；
 *  3. tile=null 堵队 → "3 次失败放弃"已上线；
 * 另：扩张目标从发明值 CLONE_CAPS 换成 rulesmd [General] 真 Ratio/Limit 键
 * （RefineryRatio/Limit、BarracksRatio/Limit、WarRatio/Limit，组口径判定）。
 * 回归时连同 `临时文件/check-ai-base-growth.mjs` 一起验证。
 */
export const BASE_GROWTH_ENABLED = true;

/** [AI] 段三条基地防御候选列表（按 side 取一条）。 */
export const DEFENSE_LIST_KEYS = [
  "AlliedBaseDefenses",
  "SovietBaseDefenses",
  "ThirdBaseDefenses",
];
/** [General] 段三条防御数量上限（值形如 `25,20,6`，h,m,e 顺序）。 */
export const DEFENSE_COUNT_KEYS = [
  "AlliedBaseDefenseCounts",
  "SovietBaseDefenseCounts",
  "ThirdBaseDefenseCounts",
];
/** 防御条目的 groupName 标记（不是 [General] 前置组键，避免被"剪除"步骤误删）。 */
export const DEFENSE_GROUP = "BaseDefense";

/** 把 `"25,20,6"`（h,m,e）折到难度 0=easy/1=medium/2=hard 的单个目标值。 */
export function defenseTargetFor(counts: any[], difficulty: number): number {
  if (!counts || counts.length === 0) return 0;
  const idx = counts.length >= 3 ? 2 - (difficulty | 0) : 0;
  const v = counts[idx >= 0 ? idx : 0];
  const n = typeof v === "number" ? v : parseInt(String(v), 10);
  return isNaN(n) ? 1 : n;
}

/** 己方已拥有 + 队列中已排的该阵营防御建筑总数。 */
export function countBaseDefenses(
  candidates: string[],
  owned: Set<string>,
  queuedTypes: string[],
): number {
  let n = 0;
  for (const t of candidates) {
    if (owned.has(t)) n++;
  }
  for (const t of queuedTypes) {
    if (candidates.indexOf(t) >= 0) n++;
  }
  return n;
}

/**
 * 选下一座防御建筑：候选按 Anti 权重加权抽签（原版 DiscreteDistribution 语义）。
 * @param weights 类型名 → 权重（≤0 视为 1，保证仍有机会入选）
 * @param roll 同种子随机 [1,total]
 * @returns 选中的类型名，或 null（候选为空/无权重）
 */
export function pickDefenseType(
  candidates: string[],
  weights: (typeName: string) => number,
  roll: (min: number, max: number) => number,
): string | null {
  if (!candidates || candidates.length === 0) return null;
  let total = 0;
  const w: number[] = [];
  for (const t of candidates) {
    let v = 0;
    try {
      v = weights(t) | 0;
    } catch (_) {
      v = 0;
    }
    if (v <= 0) v = 1;
    w.push(v);
    total += v;
  }
  const r = roll(1, total);
  let acc = 0;
  for (let i = 0; i < candidates.length; i++) {
    acc += w[i];
    if (acc >= r) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

/**
 * 基地防御入队：目标数未达成且队列里没有待建防御时，追加一条。
 * @param candidates 本阵营防御候选（调用方已按"当前可生产"过滤）
 * @returns 追加的条目或 null
 */
export function insertDefenseIfNeeded(
  world: BuildQueueWorld,
  candidates: string[],
  counts: any[],
  difficulty: number,
  weights: (typeName: string) => number,
): BuildQueueEntry | null {
  if (!candidates || candidates.length === 0) return null;
  const target = defenseTargetFor(counts, difficulty);
  if (target <= 0) return null;
  // ⚠ 预算门控：基地防御是"锦上添花"，绝不能把缺员单位的排产预算吃光
  // （见 BuildQueueWorld.baseGrowthBudget 注释里的实测事故）。
  if (!baseGrowthBudgetAllows(world)) return null;
  const queue = world.queue();
  const queuedTypes = queue.map(function (e) {
    return e.typeName;
  });
  const have = countBaseDefenses(candidates, world.ownedBuildingTypes(), queuedTypes);
  if (have >= target) return null;
  const typeName = pickDefenseType(candidates, weights, function (min, max) {
    return world.randomRanged(min, max);
  });
  if (!typeName) return null;
  const entry: BuildQueueEntry = {
    groupName: DEFENSE_GROUP,
    typeName,
    kind: "defense",
  };
  queue.push(entry);
  return entry;
}

/**
 * 剪除已被"超额满足"的防御/复制条目（见 BuildQueueEntry.kind 注释）。
 * @param ownedCountOf 类型名 → 己方已拥有数
 * @param cloneSatisfiedOf 类型名 → 该类型所属组的扩张目标是否已达成
 *        （组口径：组候选内 owned 总数 ≥ Ratio/Limit 目标）
 * @returns 被剪除的条目数
 */
export function pruneSupersededEntries(
  queue: BuildQueueEntry[],
  ownedCountOf: (typeName: string) => number,
  defenseCandidates: string[],
  defenseTarget: number,
  cloneSatisfiedOf: (typeName: string) => boolean,
): number {
  let removed = 0;
  let ownedDefenses = 0;
  for (const t of defenseCandidates) ownedDefenses += ownedCountOf(t);
  for (let i = queue.length - 1; i >= 0; i--) {
    const e = queue[i];
    if (e.kind === "defense") {
      // 已拥有数单独就达到目标 ⇒ 队里还排着的防御是多余的
      if (defenseTarget > 0 && ownedDefenses >= defenseTarget) {
        queue.splice(i, 1);
        removed++;
      }
    } else if (e.kind === "clone") {
      // 所属组的扩张目标已达成 ⇒ 本轮复制已完成
      let satisfied = false;
      try {
        satisfied = !!cloneSatisfiedOf(e.typeName);
      } catch (_) {
        satisfied = false;
      }
      if (satisfied) {
        queue.splice(i, 1);
        removed++;
      }
    }
  }
  return removed;
}

// ============================================================
// 按既有建筑补同类（0x50A5C0 第一段循环）—— 2026-10-01 新增
// ============================================================
//
// 反编译实证（`0x50A5C0` 第一段循环）：遍历己方**非 limbo 建筑**，对每座
// 合格建筑在建造队列里插入一条"**同类型 + 该建筑自身格子坐标作为锚点**"的
// 条目（`v26+156` 就是那座建筑的 rx/ry，写进队列条目 +4 处）。
// 建 ConYard 时另走一条分支（按 `+1512 + 4*index` 取该阵营的 MCV/ConYard 类型）
// —— 即"第二基地"。本实现只做前者（同类复制），第二基地需要 MCV 部署链路，
// 另开切片。
//
// ⚠ 偏离：原版的"该不该再复制一份"由 `house+90292`（力预估预算）与
// `+3808/+3812` 累加值比较决定，键名未定案；这里改用**按组的显式上限**，
// 取值保守（能明显扩容产能，又不会像无上限复制那样把 AI 经济拖垮）。
// 同一类型同时只允许队列里挂一条待建条目（原版逐条插入也是这个节奏）。

/** 按组给的"同类复制"上限（含第一座）。**fallback 值**——[General] 有
 * Ratio/Limit 真键时（loadExpansionParams）优先用真键。 */
export const CLONE_CAPS: Record<string, number> = {
  BuildPower: 4,
  BuildBarracks: 2,
  BuildWeapons: 3,
  BuildRefinery: 3,
  BuildRadar: 1,
  BuildTech: 1,
};

// ============================================================
// 持续扩张参数（rulesmd [General] 真键，2026-10-01 考证）
//   RefineryRatio=.16 / RefineryLimit=4
//   BarracksRatio=.16 / BarracksLimit=2
//   WarRatio=.1 / WarLimit=2
// 原版语义（rulesmd 注释）："ratio of base that should be composed of X"，
// 目标数 = floor(基地建筑总数 × ratio)，clamp 到 limit；各比例之和 >100%
// ⇒ "the base will always try to grow"。
// ============================================================

/** [General] 持续扩张参数（缺省=rulesmd 实测值）。 */
export interface ExpansionParams {
  refineryRatio: number;
  refineryLimit: number;
  barracksRatio: number;
  barracksLimit: number;
  warRatio: number;
  warLimit: number;
}

export const DEFAULT_EXPANSION: ExpansionParams = {
  refineryRatio: 0.16,
  refineryLimit: 4,
  barracksRatio: 0.16,
  barracksLimit: 2,
  warRatio: 0.1,
  warLimit: 2,
};

/** 组键 → 参数槽位。 */
const EXPANSION_GROUP_KEYS: Record<
  string,
  { ratio: keyof ExpansionParams; limit: keyof ExpansionParams }
> = {
  BuildRefinery: { ratio: "refineryRatio", limit: "refineryLimit" },
  BuildBarracks: { ratio: "barracksRatio", limit: "barracksLimit" },
  BuildWeapons: { ratio: "warRatio", limit: "warLimit" },
};

/** 从 [General] 段读扩张参数（IniSection.entries 或 get 皆容）。 */
export function loadExpansionParams(general: any): ExpansionParams {
  const params = { ...DEFAULT_EXPANSION };
  try {
    const read = function (key: string): number {
      let v: any;
      if (general && general.get) v = general.get(key);
      else if (general && general.entries) v = general.entries.get(key);
      if (v === undefined || v === null) return NaN;
      const n = parseFloat(String(v).replace("%", ""));
      return isNaN(n) ? NaN : n;
    };
    const pairs: [keyof ExpansionParams, string][] = [
      ["refineryRatio", "RefineryRatio"],
      ["refineryLimit", "RefineryLimit"],
      ["barracksRatio", "BarracksRatio"],
      ["barracksLimit", "BarracksLimit"],
      ["warRatio", "WarRatio"],
      ["warLimit", "WarLimit"],
    ];
    for (const [slot, key] of pairs) {
      const n = read(key);
      if (!isNaN(n) && n >= 0) params[slot] = n;
    }
  } catch (_) {}
  return params;
}

/**
 * 组的扩张目标数 = min(floor(基地建筑总数 × ratio), limit)；
 * 无 ratio 语义的组返回 -1（调用方回落 CLONE_CAPS）。
 */
export function expansionTargetFor(
  groupKey: string,
  totalBuildings: number,
  params: ExpansionParams,
): number {
  const slot = EXPANSION_GROUP_KEYS[groupKey];
  if (!slot) return -1;
  const ratio = (params as any)[slot.ratio] as number;
  const limit = (params as any)[slot.limit] as number;
  const byRatio = Math.floor((totalBuildings || 0) * ratio);
  return Math.min(byRatio, limit | 0);
}

/**
 * 高难度额外放宽的组（原版按难度放量，这里只给"产能类"组加码）。
 * Radar / Tech 不加：第二座雷达/高科没有任何收益，只会白烧钱。
 */
export const CLONE_CAP_DIFFICULTY_BONUS: Record<string, number> = {
  BuildPower: 1,
  BuildBarracks: 1,
  BuildWeapons: 1,
  BuildRefinery: 1,
};

/** 组在指定难度下的复制上限（0=easy/1=medium/2=hard）。 */
export function cloneCapFor(groupKey: string, difficulty: number): number {
  const base = CLONE_CAPS[groupKey] || 1;
  const bonus = difficulty === 2 ? CLONE_CAP_DIFFICULTY_BONUS[groupKey] || 0 : 0;
  return base + bonus;
}

/** 一座己方建筑的实例（复制锚点用）。 */
export interface BuildingInstance {
  name: string;
  /** 该建筑左上角格子坐标（原版写进队列条目的 +156）。 */
  rx: number;
  ry: number;
}

/**
 * 生成"同类复制"条目：对每座己方建筑，若其类型在 [General] 的某个建造组里、
 * 且该类型的（已拥有 + 队内待建）数量未到该组上限，就追加一条带锚点的条目。
 * @param groups 组键 → 该组的类型名数组（调用方已按可生产过滤）
 * @param capOf 类型名 → 上限（缺省 1 = 不复制）
 * @param maxEntries 本轮最多追加多少条（防一轮灌满队列）
 */
export function cloneExistingBuildings(
  instances: BuildingInstance[],
  ownedTypes: Set<string>,
  queue: BuildQueueEntry[],
  groups: Record<string, string[]>,
  capOf: (groupKey: string) => number,
  maxEntries: number,
  expansion?: {
    params: ExpansionParams;
    totalBuildings: number;
  },
): BuildQueueEntry[] {
  const added: BuildQueueEntry[] = [];
  if (!instances || instances.length === 0 || maxEntries <= 0) return added;
  // 类型 → 组键（同一类型可能同时在多组，取第一个命中的）
  const groupOf = new Map<string, string>();
  for (const key of Object.keys(groups)) {
    const list = groups[key] || [];
    for (const t of list) if (!groupOf.has(t)) groupOf.set(t, key);
  }
  // 组候选类型集合（组口径"已有数"用：组内全部类型的 owned 总数）
  const groupTypes = new Map<string, Set<string>>();
  for (const key of Object.keys(groups)) {
    groupTypes.set(key, new Set(groups[key] || []));
  }
  // 已拥有各类型计数
  const ownedCount = new Map<string, number>();
  for (const inst of instances) {
    ownedCount.set(inst.name, (ownedCount.get(inst.name) || 0) + 1);
  }
  // 队内待建各类型计数
  const queuedCount = new Map<string, number>();
  for (const e of queue) {
    queuedCount.set(e.typeName, (queuedCount.get(e.typeName) || 0) + 1);
  }
  for (const inst of instances) {
    if (added.length >= maxEntries) break;
    const key = groupOf.get(inst.name);
    if (!key) continue;
    // 组口径目标数：rulesmd Ratio/Limit 真键优先，无 ratio 语义的组回落 cap
    let target = -1;
    if (expansion) {
      target = expansionTargetFor(key, expansion.totalBuildings, expansion.params);
    }
    if (target < 0) target = capOf(key);
    if (!(target > 1)) continue;
    const pending = (queuedCount.get(inst.name) || 0) + (added.filter((e) => e.typeName === inst.name).length);
    // 同一类型同时只挂一条待建条目：原版逐条插入也是这个节奏，避免一轮灌满
    if (pending > 0) continue;
    // 组口径已有数 = 组候选集内全部类型的 owned 总数 + 队内同组待建数
    const types = groupTypes.get(key) || new Set<string>();
    let have = 0;
    for (const t of types) {
      have += ownedCount.get(t) || 0;
      have += queuedCount.get(t) || 0;
    }
    if (have >= target) continue;
    const entry: BuildQueueEntry = {
      groupName: null,
      typeName: inst.name,
      anchor: { x: inst.rx, y: inst.ry },
      kind: "clone",
    };
    added.push(entry);
  }
  return added;
}
