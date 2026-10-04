/**
 * AiData — 原版 AIMD.INI 数据结构定义与解析器。
 *
 * 支持 TaskForce / TeamType / ScriptType / AITriggerType / BuildingType / BuildQueue。
 * 各 parse* 函数从 aiIni 的对应节中读出条目；索引循环在键缺失（undefined/null）时
 * 终止，与孪生一致。
 *
 * 由 game/ai/AiData.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as GameApiModule from "game/api/index"; // 孪生（any-shim，未转换）

// 孪生 setter 解构 GameApi/ObjectType；运行时值仅保证模块依赖边，解析路径不读。
const GameApi = (GameApiModule as any).GameApi;
const ObjectType = (GameApiModule as any).ObjectType;

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================
// 数据结构
// ============================================================

/** 小队构成（TaskForce）。 */
export class TaskForce {
  /** TaskForce 段名。 */
  name: any;
  /** 编成列表：[{unitType, count, group?}]。 */
  groups: any[];
  /** 展示名（原版段内 Name= 键，自创格式无）。 */
  displayName: any;
  /** 段级 Group（原版 -1，配合脚本按编组招募）。 */
  group: any;

  constructor(name: any) {
    this.name = name;
    this.groups = []; // [{unitType, count}]
    this.displayName = name;
    this.group = -1;
  }
}

/** 脚本动作（ScriptAction）。 */
export class ScriptAction {
  /** 动作码：0=Attack, 1=Move, 2=Guard, 3=Deploy, etc. */
  action: any;
  /** 目标字段：0=base, 1=enemy, 2=target coord（或路点号，视动作而定）。 */
  target: any;
  /** 第三字段参数，缺省 0。 */
  argument: any;

  constructor(action: any, target: any, argument: any) {
    this.action = action; // 0=Attack, 1=Move, 2=Guard, 3=Deploy, etc.
    this.target = target; // 0=base, 1=enemy, 2=target coord
    this.argument = argument || 0;
  }
}

/** 脚本（ScriptType）。 */
export class ScriptType {
  /** ScriptTypes 段名。 */
  name: any;
  /** 展示名（原版段内 Name= 键）。 */
  displayName: any;
  /** 在 ScriptTypes 列表中的序号（ChangeScript 跳转用）。 */
  index: any;
  /** 动作序列。 */
  actions: any[];

  constructor(name: any) {
    this.name = name;
    this.displayName = name;
    this.index = 0; // 在 ScriptTypes 列表中的序号（ChangeScript 跳转用）
    this.actions = [];
  }
}

/** 队伍类型（TeamType）。 */
export class TeamType {
  /** TeamTypes 段名。 */
  name: any;
  /** 归属阵营（House= 字段，可能为空/数字索引/阵营名）。 */
  house: any;
  /** 关联的 TaskForce 名。 */
  taskForce: any;
  /** 关联的 ScriptType 名。 */
  scriptType: any;
  /** 关联的 AITriggerType 名。 */
  aiTrigger: any;
  /** 0-10。 */
  priority: any;
  /** 同时最多执行次数。 */
  maxExecuted: any;
  mindControlDecision: any;
  loadable: any;
  full: any;
  annoyance: any;
  guardSlower: any;
  avoidThreat: any;
  transportReturn: any;
  /** 是否自动招募。 */
  recruiter: any;
  /** 触发条件满足时自动创建。 */
  autoCreate: any;
  prebuilt: any;
  unknown: any;
  group: any;
  /** 以下为原版 aimd.ini 字段（批次 1 对齐；键名以原版大小写为准）。 */
  displayName: any;
  veteranLevel: any;
  reinforce: any;
  droppod: any;
  useTransportOrigin: any;
  whiner: any;
  looseRecruit: any;
  aggressive: any;
  suicide: any;
  onTransOnly: any;
  ionImmune: any;
  areTeamMembersRecruitable: any;
  isBaseDefense: any;
  onlyTargetHouseEnemy: any;
  /** 招募该队所需科技等级（原版 TeamType TechLevel）。 */
  techLevel: any;

  constructor(name: any) {
    this.name = name;
    this.house = ""; // 归属阵营（House= 字段，可能为空/数字索引/阵营名）
    this.taskForce = null; // 关联的 TaskForce 名
    this.scriptType = null; // 关联的 ScriptType 名
    this.aiTrigger = null; // 关联的 AITriggerType 名
    this.priority = 5; // 0-10
    this.maxExecuted = 1; // 同时最多执行次数
    this.mindControlDecision = 0;
    this.loadable = 0;
    this.full = 0;
    this.annoyance = 0;
    this.guardSlower = 0;
    this.avoidThreat = 0;
    this.transportReturn = 0;
    this.recruiter = 1; // 是否自动招募
    this.autoCreate = 1; // 触发条件满足时自动创建
    this.prebuilt = 0;
    this.unknown = 0;
    this.group = -1;
    this.displayName = name;
    this.veteranLevel = 0;
    this.reinforce = 0;
    this.droppod = 0;
    this.useTransportOrigin = 0;
    this.whiner = 0;
    this.looseRecruit = 0;
    this.aggressive = 0;
    this.suicide = 0;
    this.onTransOnly = 0;
    this.ionImmune = 0;
    this.areTeamMembersRecruitable = 0;
    this.isBaseDefense = 0;
    this.onlyTargetHouseEnemy = 0;
    this.techLevel = -1;
  }
}

/** AI 触发条件（AITriggerType）。 */
export class AITriggerType {
  /** AITriggerTypes 中登记的键名（触发器 ID）。 */
  name: any;
  /** 旧自创字段：0=时间, 1=单位数, 3=金钱…（注意：原版条件号语义不同，见下）。 */
  condition: any;
  /** 旧自创字段：0=self, 1=enemy, 2=ally。 */
  owner: any;
  house: any;
  /** 旧自创字段：0=less, 1=equal, 2=greater（由原版比较器算子折算，仅作过渡）。 */
  comparison: any;
  /** 触发阈值（原版=比较器操作数）。 */
  value: any;
  /** 触发的队伍1。 */
  team1: any;
  /** 触发的队伍2。 */
  team2: any;
  unknown1: any;
  /** -1=any。 */
  techLevel: any;
  unknown2: any;
  /** 以下为原版全行格式字段（批次 1 对齐，ModEnc 18 字段 + 实测互证）。 */
  displayName: any;
  /** 原版条件号：0=敌方拥有对象, 1=己方拥有, 2/3=敌方低电力, 4=敌方金钱, 5=铁幕充能, 6=超时空充能, 7=中立拥有。 */
  conditionType: any;
  /** 条件对象（建筑/单位类型名或 <none>）。 */
  conditionObject: any;
  /** 比较器操作数（比较器 hex 前 4 字节 LE）。 */
  comparatorOperand: any;
  /** 比较器算子（第 5 字节）：0=<, 1=<=, 2==, 3=>=, 4=>, 5=!=。 */
  comparatorOperator: any;
  /** 初始权重（WeightCurrent 起点）。 */
  weight: any;
  /** 权重下限。 */
  minWeight: any;
  /** 权重上限。 */
  maxWeight: any;
  /** 非零=除单人战役外全模式启用（遭遇战标记）。 */
  isForSkirmish: any;
  /** 0=全部阵营可用，正数=限定阵营序号。 */
  side: any;
  isBaseDefense: any;
  /** 难度开关：0=该难度禁用。 */
  enabledEasy: any;
  enabledMedium: any;
  enabledHard: any;
  /** 原版 +156：全局触发（aimd.ini 来源）=1，战役中禁用。 */
  globalFlag: any;
  /** 原版 +164：[AITriggerTypesEnable] 总开关，缺省 1。 */
  enabled: any;

  constructor(name: any) {
    this.name = name;
    this.condition = 0;
    this.owner = 0;
    this.house = 0;
    this.comparison = 0;
    this.value = 1;
    this.team1 = "";
    this.team2 = "";
    this.unknown1 = 0;
    this.techLevel = -1;
    this.unknown2 = 0;
    this.displayName = name;
    this.conditionType = 0;
    this.conditionObject = "";
    this.comparatorOperand = 0;
    this.comparatorOperator = 0;
    this.weight = 0;
    this.minWeight = 0;
    this.maxWeight = 0;
    this.isForSkirmish = 0;
    this.side = 0;
    this.isBaseDefense = 0;
    this.enabledEasy = 1;
    this.enabledMedium = 1;
    this.enabledHard = 1;
    this.globalFlag = 0;
    this.enabled = 1;
  }
}

/** 防御建筑配置（AIDefenseType）。 */
export class AIDefenseType {
  /** 段名。 */
  name: any;
  /** 关联建筑类型名。 */
  building: any;
  /** 0=不要求相邻 */
  adjacent: any;
  /** 0=不要求掩护 */
  cover: any;

  constructor(name: any) {
    this.name = name;
    this.building = "";
    this.adjacent = 0; // 0=不要求相邻
    this.cover = 0; // 0=不要求掩护
  }
}

/** 建造队列项。 */
export class BuildQueueItem {
  /** 单位/建筑类型名。 */
  unitType: any;
  /** 优先级，缺省 0。 */
  priority: any;

  constructor(unitType: any, priority: any) {
    this.unitType = unitType;
    this.priority = priority || 0;
  }
}

// ============================================================
// AIMD.INI 解析器
// ============================================================

/**
 * 解析 GroupWeight 节。
 * @returns techLevel→{weightMax, infantry, vehicle, aircraft, naval, budget}
 */
export function parseGroupWeights(aiIni: any): any {
  const result: any = {};
  const sec = aiIni.getSection("GroupWeights");
  if (!sec) return result;
  for (let i = 0; i <= 10; i++) {
    const val = sec.get(i.toString());
    if (val !== undefined && val !== null) {
      const parts = String(val).split(",");
      result[i] = {
        weightMax: parseInt(parts[0]) || 0,
        infantry: parseInt(parts[1]) || 0,
        vehicle: parseInt(parts[2]) || 0,
        aircraft: parseInt(parts[3]) || 0,
        naval: parseInt(parts[4]) || 0,
        budget: parseInt(parts[5]) || 0,
      };
    }
  }
  return result;
}

/**
 * 解析 TaskForces 节。
 * 原版格式：[TaskForces] 0=TFID 列表 → 段内 Name= 展示名、编号键 0=count,type[,group]、段级 Group=。
 * 兼容旧自创格式（Group1=count,type 键，无编号键时回退）。
 */
export function parseTaskForces(aiIni: any): any {
  const tasks: any = {};
  const sec = aiIni.getSection("TaskForces");
  if (!sec) return tasks;
  // TaskForces 节： 0=TF001, 1=TF002, ...
  for (let i = 0; ; i++) {
    let name: any = sec.get(i.toString());
    if (name === undefined || name === null) break;
    name = String(name).trim();
    const tfSec = aiIni.getSection(name);
    if (!tfSec) continue;
    const tf = new TaskForce(name);
    if (tfSec.get("Name") !== undefined && tfSec.get("Name") !== null) {
      tf.displayName = String(tfSec.get("Name")).trim();
    }
    tf.group = tfSec.getNumber("Group", -1);
    // 原版：编号键 0=3,E1（[,group] 第三字段可选，0-9 编组）
    let sawOriginal = false;
    for (let g = 0; ; g++) {
      const gv = tfSec.get(g.toString());
      if (gv === undefined || gv === null) break;
      const parts = String(gv).split(",");
      const count = parseInt(parts[0]) || 0;
      const unitType = (parts[1] || "").trim();
      if (unitType) {
        sawOriginal = count > 0 || sawOriginal;
        tf.groups.push({
          unitType: unitType,
          count: count,
          group: parts.length > 2 ? parseInt(parts[2]) || -1 : -1,
        });
      }
      sawOriginal = true;
    }
    if (!sawOriginal) {
      // 旧自创格式：Group1=1,E1, Group2=2,HTK
      for (let g = 1; ; g++) {
        const gv = tfSec.get("Group" + g);
        if (gv === undefined || gv === null) break;
        const parts = String(gv).split(",");
        const count = parseInt(parts[0]) || 1;
        const unitType = (parts[1] || "").trim();
        if (unitType) {
          tf.groups.push({ unitType: unitType, count: count });
        }
      }
    }
    tasks[name] = tf;
  }
  return tasks;
}

/** 解析 ScriptTypes 节（序号→段名，段内 0=action,target[,arg]）。 */
export function parseScriptTypes(aiIni: any): any {
  const scripts: any = {};
  const sec = aiIni.getSection("ScriptTypes");
  if (!sec) return scripts;
  for (let i = 0; ; i++) {
    let name: any = sec.get(i.toString());
    if (name === undefined || name === null) break;
    name = String(name).trim();
    const scSec = aiIni.getSection(name);
    if (!scSec) continue;
    const sc = new ScriptType(name);
    sc.index = i;
    if (scSec.get("Name") !== undefined && scSec.get("Name") !== null) {
      sc.displayName = String(scSec.get("Name")).trim();
    }
    // 读取动作: 0=0,1, 1=5,2, 2=49,0 等（YR ScriptType 动作码，第二字段为路点/参数）
    for (let a = 0; ; a++) {
      const av = scSec.get(a.toString());
      if (av === undefined || av === null) break;
      const parts = String(av).split(",");
      const action = parseInt(parts[0]) || 0;
      const target = parseInt(parts[1]) || 0;
      const arg = parts.length > 2 ? parseInt(parts[2]) || 0 : 0;
      sc.actions.push(new ScriptAction(action, target, arg));
    }
    scripts[name] = sc;
  }
  return scripts;
}

/** 解析 TeamTypes 节。原版键名以 aimd.ini 实测为准（大小写敏感）：
 * Autocreate/Prebuild/AvoidThreats/TransportsReturnOnUnload 等；旧自创键名作回退。 */
export function parseTeamTypes(aiIni: any): any {
  const teams: any = {};
  const sec = aiIni.getSection("TeamTypes");
  if (!sec) return teams;
  // 原版 AIMD.INI / 地图 AI 数据中，布尔字段写成 yes/no；这里统一兼容两种写法。
  const boolOrNumber = function (tmSec: any, key: any, def: any) {
    const raw = String(tmSec.get(key) || "").trim().toLowerCase();
    if (!raw) return def;
    if ("yes" === raw || "true" === raw || "on" === raw || "1" === raw) return 1;
    if ("no" === raw || "false" === raw || "off" === raw || "0" === raw) return 0;
    return tmSec.getNumber(key, def);
  };
  // 多键名取值（原版键优先，旧自创键回退）。
  const pickBool = function (tmSec: any, keys: any, def: any) {
    for (let i = 0; i < keys.length; i++) {
      if (tmSec.get(keys[i]) !== undefined && tmSec.get(keys[i]) !== null) {
        return boolOrNumber(tmSec, keys[i], def);
      }
    }
    return def;
  };
  for (let i = 0; ; i++) {
    let name: any = sec.get(i.toString());
    if (name === undefined || name === null) break;
    name = String(name).trim();
    const tmSec = aiIni.getSection(name);
    if (!tmSec) continue;
    const tm = new TeamType(name);
    tm.house = String(tmSec.get("House") || "").trim();
    tm.taskForce = String(tmSec.get("TaskForce") || "").trim();
    tm.scriptType = String(tmSec.get("Script") || "").trim();
    tm.aiTrigger = String(tmSec.get("AITrigger") || "").trim();
    if (tmSec.get("Name") !== undefined && tmSec.get("Name") !== null) {
      tm.displayName = String(tmSec.get("Name")).trim();
    }
    tm.priority = tmSec.getNumber("Priority", 5);
    tm.maxExecuted = tmSec.getNumber("Max", 1);
    tm.mindControlDecision = tmSec.getNumber("MindControlDecision", 0);
    tm.loadable = boolOrNumber(tmSec, "Loadable", 0);
    tm.full = boolOrNumber(tmSec, "Full", 0);
    tm.annoyance = boolOrNumber(tmSec, "Annoyance", 0);
    tm.guardSlower = boolOrNumber(tmSec, "GuardSlower", 0);
    tm.avoidThreat = pickBool(tmSec, ["AvoidThreats", "AvoidThreat"], 0);
    tm.transportReturn = pickBool(
      tmSec,
      ["TransportsReturnOnUnload", "TransportReturn"],
      0,
    );
    tm.recruiter = boolOrNumber(tmSec, "Recruiter", 1);
    tm.autoCreate = pickBool(tmSec, ["Autocreate", "AutoCreate"], 1);
    tm.prebuilt = pickBool(tmSec, ["Prebuild", "Prebuilt"], 0);
    tm.group = tmSec.getNumber("Group", -1);
    // 原版扩充字段（批次 1 新增；批次 2/3 的招募/基地防御逻辑消费）
    tm.veteranLevel = tmSec.getNumber("VeteranLevel", 0);
    tm.reinforce = boolOrNumber(tmSec, "Reinforce", 0);
    tm.droppod = boolOrNumber(tmSec, "Droppod", 0);
    tm.useTransportOrigin = boolOrNumber(tmSec, "UseTransportOrigin", 0);
    tm.whiner = boolOrNumber(tmSec, "Whiner", 0);
    tm.looseRecruit = boolOrNumber(tmSec, "LooseRecruit", 0);
    tm.aggressive = boolOrNumber(tmSec, "Aggressive", 0);
    tm.suicide = boolOrNumber(tmSec, "Suicide", 0);
    tm.onTransOnly = boolOrNumber(tmSec, "OnTransOnly", 0);
    tm.ionImmune = boolOrNumber(tmSec, "IonImmune", 0);
    tm.areTeamMembersRecruitable = boolOrNumber(
      tmSec,
      "AreTeamMembersRecruitable",
      0,
    );
    tm.isBaseDefense = boolOrNumber(tmSec, "IsBaseDefense", 0);
    tm.onlyTargetHouseEnemy = boolOrNumber(tmSec, "OnlyTargetHouseEnemy", 0);
    tm.techLevel = tmSec.getNumber("TechLevel", -1);
    teams[name] = tm;
  }
  return teams;
}

/**
 * 解析 AITriggerTypes 节。
 * 原版全行格式（键=触发器 ID，值为 18 字段 CSV，ModEnc 文档与真实 aimd.ini 实测互证）：
 *   ID=Name,Team1,OwnerHouse,TechLevel,ConditionType,ConditionObject,ComparatorHex,
 *      Weight,MinWeight,MaxWeight,IsForSkirmish,unused,Side,IsBaseDefense,Team2,
 *      EnabledEasy,EnabledMedium,EnabledHard
 * ComparatorHex 为 64 位 hex：前 4 字节 LE=操作数，第 5 字节=算子（0=<,1=<=,2==,3=>=,4=>,5=!=）。
 * 旧自创格式（数字键 + 11 字段 CSV）作回退。
 * 注意：原版条件号语义（0=敌方拥有对象等）与旧自创条件号不同，触发求值对齐在批次 2。
 */
export function parseAITriggerTypes(aiIni: any): any {
  const triggers: any = {};
  const sec = aiIni.getSection("AITriggerTypes");
  if (!sec) return triggers;
  // 比较器 hex → {operand, operator}；hex 形如 "0100000003000000..."（8 字节 LE）。
  const parseComparator = function (hex: any) {
    const out: any = { operand: 0, operator: 0 };
    const s = String(hex || "").trim();
    if (s.length >= 10) {
      const byte = function (i: any) {
        return parseInt(s.substr(i * 2, 2), 16) || 0;
      };
      out.operand =
        byte(0) + (byte(1) << 8) + (byte(2) << 16) + (byte(3) << 24);
      out.operator = byte(4);
    }
    return out;
  };
  // 原版算子 → 旧自创 comparison（0=less,1=equal,2=greater），仅作过渡。
  const mapOperator = function (op: any) {
    if (op <= 1) return 0; // < / <=
    if (op === 2) return 1; // =
    return 2; // >= / > / !=
  };
  const putTrigger = function (triggers: any, key: any, parts: any) {
    // 原版格式：key=触发器 ID；旧格式：ID 在 CSV 首字段。
    const isOriginal = parts.length >= 14;
    const name = isOriginal ? String(key).trim() : (parts[0] || "").trim();
    if (!name) return;
    const tr = new AITriggerType(name);
    if (isOriginal) {
      // 原版全行格式
      tr.displayName = parts[0].trim();
      tr.team1 = (parts[1] || "").trim();
      tr.house = (parts[2] || "").trim(); // <none>/<all>/阵营
      tr.techLevel = parseInt(parts[3]) || -1;
      tr.conditionType = parseInt(parts[4]) || 0;
      tr.conditionObject = (parts[5] || "").trim();
      const cmp = parseComparator(parts[6]);
      tr.comparatorOperand = cmp.operand;
      tr.comparatorOperator = cmp.operator;
      tr.weight = parseFloat(parts[7]) || 0;
      tr.minWeight = parseFloat(parts[8]) || 0;
      tr.maxWeight = parseFloat(parts[9]) || 0;
      tr.isForSkirmish = parseInt(parts[10]) || 0;
      tr.side = parseInt(parts[12]) || 0;
      tr.isBaseDefense = parseInt(parts[13]) || 0;
      tr.team2 = (parts[14] || "").trim();
      tr.enabledEasy = parts.length > 15 ? parseInt(parts[15]) || 0 : 1;
      tr.enabledMedium = parts.length > 16 ? parseInt(parts[16]) || 0 : 1;
      tr.enabledHard = parts.length > 17 ? parseInt(parts[17]) || 0 : 1;
      // aimd.ini 来源=全局触发（原版 +156=1，战役中禁用）
      tr.globalFlag = 1;
      // 旧字段过渡映射：value=比较器操作数；comparison=算子折算
      tr.condition = tr.conditionType;
      tr.value = cmp.operand;
      tr.comparison = mapOperator(cmp.operator);
    } else {
      // 旧自创格式: condition,owner,house,comparison,value,team1,team2,unknown,techlevel,unknown2
      tr.condition = parseInt(parts[1]) || 0;
      tr.owner = parseInt(parts[2]) || 0;
      tr.house = parseInt(parts[3]) || 0;
      tr.comparison = parseInt(parts[4]) || 0;
      tr.value = parseFloat(parts[5]) || 1;
      tr.team1 = (parts[6] || "").trim();
      tr.team2 = (parts[7] || "").trim();
      tr.unknown1 = parseInt(parts[8]) || 0;
      tr.techLevel = parseInt(parts[9]) || -1;
      tr.unknown2 = parseInt(parts[10]) || 0;
    }
    triggers[name] = tr;
  };
  let found = 0;
  // 先按旧数字键迭代（旧格式 0=csv,1=csv…）
  for (let i = 0; ; i++) {
    const val = sec.get(i.toString());
    if (val === undefined || val === null) break;
    putTrigger(triggers, i.toString(), String(val).split(","));
    found++;
  }
  if (found === 0 && sec.entries) {
    // 原版全行格式：键=触发器 ID（非数字序号），遍历全部键值
    sec.entries.forEach(function (val: any, key: any) {
      if (val === undefined || val === null) return;
      putTrigger(triggers, key, String(val).split(","));
    });
  }
  return triggers;
}

/** 解析 AIDefenseTypes 节（name,building,adjacent,cover）。 */
export function parseAIDefenseTypes(aiIni: any): any {
  const defs: any = {};
  const sec = aiIni.getSection("AIDefenseTypes");
  if (!sec) return defs;
  for (let i = 0; ; i++) {
    const val = sec.get(i.toString());
    if (val === undefined || val === null) break;
    const parts = String(val).split(",");
    const name = parts[0] || "";
    if (!name) continue;
    const d = new AIDefenseType(name);
    d.building = parts[1] || "";
    d.adjacent = parseInt(parts[2]) || 0;
    d.cover = parseInt(parts[3]) || 0;
    defs[name] = d;
  }
  return defs;
}

/**
 * 解析建造队列（BuildQueue / BuildQueueGroup）。
 * 默认队列键为 "__default__"，项为已 trim 的类型名字符串。
 */
export function parseBuildQueues(aiIni: any): any {
  const queues: any = {};
  // 读取 BuildQueueGroup 节
  const bgSec = aiIni.getSection("BuildQueueGroup");
  if (bgSec) {
    for (let gi = 0; ; gi++) {
      let name: any = bgSec.get(gi.toString());
      if (name === undefined || name === null) break;
      name = String(name).trim();
      const qSec = aiIni.getSection(name);
      if (!qSec) continue;
      const items: any[] = [];
      for (let j = 0; ; j++) {
        const uv = qSec.get(j.toString());
        if (uv === undefined || uv === null) break;
        const uparts = String(uv).split(",");
        items.push(new BuildQueueItem(uparts[0].trim(), parseInt(uparts[1]) || 0));
      }
      queues[name] = items;
    }
  }
  // 读取 BuildQueue 节
  const bqSec = aiIni.getSection("BuildQueue");
  if (bqSec) {
    const defaultQueue: any[] = [];
    for (let k = 0; ; k++) {
      const bv = bqSec.get(k.toString());
      if (bv === undefined || bv === null) break;
      defaultQueue.push(String(bv).trim());
    }
    if (defaultQueue.length > 0) queues["__default__"] = defaultQueue;
  }
  return queues;
}

void GameApi;
void ObjectType;
