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
  /** 编成列表：[{unitType, count}]。 */
  groups: any[];

  constructor(name: any) {
    this.name = name;
    this.groups = []; // [{unitType, count}]
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
  /** 在 ScriptTypes 列表中的序号（ChangeScript 跳转用）。 */
  index: any;
  /** 动作序列。 */
  actions: any[];

  constructor(name: any) {
    this.name = name;
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
  }
}

/** AI 触发条件（AITriggerType）。 */
export class AITriggerType {
  /** AITriggerTypes 中登记的名字。 */
  name: any;
  /** 0=时间, 1=单位数, 2=科技等级, 3=金钱, etc. */
  condition: any;
  /** 0=self, 1=enemy, 2=ally */
  owner: any;
  house: any;
  /** 0=less, 1=equal, 2=greater */
  comparison: any;
  /** 触发阈值。 */
  value: any;
  /** 触发的队伍1。 */
  team1: any;
  /** 触发的队伍2。 */
  team2: any;
  unknown1: any;
  /** -1=any */
  techLevel: any;
  unknown2: any;

  constructor(name: any) {
    this.name = name;
    this.condition = 0; // 0=时间, 1=单位数, 2=科技等级, 3=金钱, etc.
    this.owner = 0; // 0=self, 1=enemy, 2=ally
    this.house = 0;
    this.comparison = 0; // 0=less, 1=equal, 2=greater
    this.value = 1; // 触发阈值
    this.team1 = ""; // 触发的队伍1
    this.team2 = ""; // 触发的队伍2
    this.unknown1 = 0;
    this.techLevel = -1; // -1=any
    this.unknown2 = 0;
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

/** 解析 TaskForces 节（0=TF001, 1=TF002, … 再读各段 GroupN=count,type）。 */
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
    // 读取 Group1=1,E1, Group2=2,HTK, ...
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

/** 解析 TeamTypes 节（yes/no 与 0/1 布尔字段兼容）。 */
export function parseTeamTypes(aiIni: any): any {
  const teams: any = {};
  const sec = aiIni.getSection("TeamTypes");
  if (!sec) return teams;
  // 原版 AIMD.INI / 地图 AI 数据中，Annoyance/GuardSlower/Recruiter/Loadable/Full/
  // AutoCreate/Prebuilt 等字段常写成 yes/no，而不是 1/0。这里统一兼容两种写法。
  const boolOrNumber = function (tmSec: any, key: any, def: any) {
    const raw = String(tmSec.get(key) || "").trim().toLowerCase();
    if (!raw) return def;
    if ("yes" === raw || "true" === raw || "on" === raw || "1" === raw) return 1;
    if ("no" === raw || "false" === raw || "off" === raw || "0" === raw) return 0;
    return tmSec.getNumber(key, def);
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
    tm.priority = tmSec.getNumber("Priority", 5);
    tm.maxExecuted = tmSec.getNumber("Max", 1);
    tm.mindControlDecision = tmSec.getNumber("MindControlDecision", 0);
    tm.loadable = boolOrNumber(tmSec, "Loadable", 0);
    tm.full = boolOrNumber(tmSec, "Full", 0);
    tm.annoyance = boolOrNumber(tmSec, "Annoyance", 0);
    tm.guardSlower = boolOrNumber(tmSec, "GuardSlower", 0);
    tm.avoidThreat = tmSec.getNumber("AvoidThreat", 0);
    tm.transportReturn = tmSec.getNumber("TransportReturn", 0);
    tm.recruiter = boolOrNumber(tmSec, "Recruiter", 1);
    tm.autoCreate = boolOrNumber(tmSec, "AutoCreate", 1);
    tm.prebuilt = boolOrNumber(tmSec, "Prebuilt", 0);
    tm.group = tmSec.getNumber("Group", -1);
    teams[name] = tm;
  }
  return teams;
}

/** 解析 AITriggerTypes 节（单行 CSV：name,condition,owner,…）。 */
export function parseAITriggerTypes(aiIni: any): any {
  const triggers: any = {};
  const sec = aiIni.getSection("AITriggerTypes");
  if (!sec) return triggers;
  for (let i = 0; ; i++) {
    const val = sec.get(i.toString());
    if (val === undefined || val === null) break;
    // 格式: condition,owner,house,comparison,value,team1,team2,unknown,techlevel,unknown2
    const parts = String(val).split(",");
    const name = parts[0] || "";
    if (!name) continue;
    const tr = new AITriggerType(name);
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
    triggers[name] = tr;
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
