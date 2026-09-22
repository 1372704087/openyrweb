/**
 * AutoLoad — 自动装车扩展（源码内置，跟随 ExtensionHost 的 Ares/Phobos 框架）。
 *
 * 移植自AutoLoad.dll v2.6（AutoLoad.c）：把【选中的步兵/载具】按类型
 * 均衡分配进【选中、范围内、有空位且装载等级达标】的可载员载具。只下发引擎标准
 * EnterTransport 指令，不引入自定义事件状态，故联机各端行为一致。
 *
 * 框架接入：
 *  - 以 ExtensionDefinition 注册（id: "autoload"），总开关由设置页 Expand 控制；
 *  - onMatchStart：对局开始后挂载全局 Ctrl+D 快捷键；
 *  - onMatchEnd：对局结束/退出时卸载快捷键，避免跨对局残留。
 *  - 默认总开关开启：用户未改动设置时开局即生效。
 *
 * 说明：
 *  - 建筑（碉堡/回收站/磁能电厂）的装载走 engine 的 Garrison/Occupy/Absorb
 *    管线，不属于 EnterTransport 指令，故本扩展只处理载具互载。
 *  - 热键默认 Ctrl+D；当前框架(ExtensionConfig)仅支持布尔开关，键位定制
 *    留待未来接入任意值配置（例如在 LocalPrefs 增加 hotkey 字段）。
 */
import { ExtensionDefinition } from "extensions/ExtensionDefinition";
import { ExtensionHookContext } from "extensions/ExtensionContext";
import { ZoneType } from "game/gameobject/unit/ZoneType";
// EnterTransportOrder 尚无 .ts 改写，走 game/* 通配 shim（export=any）：
// 具名导入会被 TS 拒绝，故用命名空间导入后取成员属性。
import * as EnterTransportNs from "game/order/EnterTransportOrder";

/* eslint-disable @typescript-eslint/no-explicit-any */

const DEFAULT_RANGE_CELLS = 30;
const DEFAULT_MAX_EVENTS = 512;

/* ------------------------------------------------------------------ */
/* 纯算法：均衡分组分配（无副作用，便于单测）                           */
/* ------------------------------------------------------------------ */

interface Passenger {
  id: any;
  type: any;
  cost: number;
  isInf: boolean;
  x: number;
  y: number;
}
interface Transport {
  id: any;
  isUnit: boolean;
  freeSlots: number;
  sizeLimit: number;
  x: number;
  y: number;
}
interface Assignment {
  unitId: any;
  trnId: any;
}

function distSq(a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

/** 该单位到任一「当前可进」载具的最近距离（用于组内就近排序/距离优先）。 */
function nearestEligibleDist(p: Passenger, transports: Transport[]): number {
  let best = Infinity;
  for (const tr of transports) {
    if (tr.freeSlots < p.cost) continue;
    if (p.cost > tr.sizeLimit) continue; /* 引擎判 Size <= SizeLimit */
    if (!p.isInf && !tr.isUnit) continue; /* 载具乘客只进 Unit 装载 */
    const d = distSq(p, tr);
    if (d < best) best = d;
  }
  return best;
}

function trnIdKey(id: any): any {
  return typeof id === "object" && id !== null ? id : "__" + String(id);
}

/**
 * 计算分配方案。返回按「下发顺序」排列的 {unitId, trnId}。
 *
 * 负载均衡：按类型分组 -> 组内就近排序 -> 组间轮流占座；
 * 选车优先级：(同类型已分最少 -> 总已分最少 -> 距离最近)。
 */
function computeAssignments(
  passengers: Passenger[],
  transports: Transport[],
  opts?: { rangeCells?: number; maxEvents?: number },
): Assignment[] {
  const o = opts || {};
  const rangeCells = o.rangeCells || DEFAULT_RANGE_CELLS;
  const maxEvents = o.maxEvents || DEFAULT_MAX_EVENTS;
  const r2 = rangeCells * rangeCells;
  const np = passengers.length;

  /* 1. "附近"过滤：只保留与任一选中乘客距离 <= rangeCells 的载具 */
  const tIdx: number[] = [];
  outer: for (let j = 0; j < transports.length; j++) {
    for (let i = 0; i < np; i++) {
      if (distSq(transports[j], passengers[i]) <= r2) {
        tIdx.push(j);
        continue outer;
      }
    }
  }
  const nt = tIdx.length;
  if (np <= 0 || nt <= 0) return [];

  /* 2. 按类型分组（首次出现顺序），类型内保持选中顺序 */
  const groupHead: number[] = [];
  const nextInGroup: number[] = [];
  const tailInGroup: number[] = [];
  const groupOf = new Map<any, number>();
  let ngroups = 0;
  for (let i = 0; i < np; i++) {
    const p = passengers[i];
    let gi = groupOf.get(p.type);
    if (gi === undefined) {
      gi = ngroups++;
      groupOf.set(p.type, gi);
      groupHead[gi] = i;
      tailInGroup[gi] = i;
    } else {
      nextInGroup[tailInGroup[gi]] = i;
      tailInGroup[gi] = i;
    }
    nextInGroup[i] = -1;
  }

  /* 3. 组内按就近排序：超员时离可进载具近的先占座 */
  const nearT = tIdx.map((k) => transports[k]);
  const nearD: number[] = new Array(np);
  for (let m = 0; m < np; m++) nearD[m] = nearestEligibleDist(passengers[m], nearT);
  const ord: number[] = [];
  for (let g = 0; g < ngroups; g++) {
    ord.length = 0;
    for (let m = groupHead[g]; m !== -1; m = nextInGroup[m]) ord.push(m);
    /* 插入排序 (nearD, index) 升序 */
    for (let a = 1; a < ord.length; a++) {
      const cur = ord[a];
      let p2 = a - 1;
      while (
        p2 >= 0 &&
        (nearD[ord[p2]] > nearD[cur] || (nearD[ord[p2]] === nearD[cur] && ord[p2] > cur))
      ) {
        ord[p2 + 1] = ord[p2];
        p2--;
      }
      ord[p2 + 1] = cur;
    }
    groupHead[g] = ord[0];
    for (let a = 0; a < ord.length; a++)
      nextInGroup[ord[a]] = a + 1 < ord.length ? ord[a + 1] : -1;
  }

  /* 4. 下发——组间轮流，组内就近；选车主键 = 同类型最少 -> 总最少 -> 最近 */
  const trnFree: number[] = [];   /* 剩余空位预算 */
  const trnAssigned: number[] = []; /* 总已分配（辆次） */
  for (let j = 0; j < nt; j++) {
    trnFree[j] = transports[tIdx[j]].freeSlots;
    trnAssigned[j] = 0;
  }
  const typeAsg: number[][] = []; /* [group][k] 同类型已分配数 */
  for (let g = 0; g < ngroups; g++) {
    typeAsg[g] = new Array(nt).fill(0);
  }
  const usedAsTransport: Record<string, number> = {}; /* 已被用作运输工具的载具(id) */
  const cursor: number[] = [];
  const alive: number[] = [];
  let nalive = 0;
  for (let g = 0; g < ngroups; g++) {
    cursor[g] = groupHead[g];
    alive[g] = 1;
    nalive++;
  }
  const visited = new Map<any, boolean>();
  const isDone = (pi: number) => visited.has(passengers[pi].id);
  const out: Assignment[] = [];
  let events = 0;

  while (nalive > 0 && events < maxEvents) {
    for (let g = 0; g < ngroups && events < maxEvents; g++) {
      if (!alive[g]) continue;
      /* 跳过已处理成员；载具乘客一旦被用作运输工具即失去上车资格 */
      let m = cursor[g];
      while (m !== -1 && (isDone(m) || (!passengers[m].isInf && (usedAsTransport[trnIdKey(passengers[m].id)] || 0) > 0)))
        m = nextInGroup[m];
      if (m === -1) {
        alive[g] = 0;
        nalive--;
        continue;
      }
      let best = -1;
      let bestType = 0;
      let bestAssigned = 0;
      let bestDist = 0;
      for (let j = 0; j < nt; j++) {
        const tr = transports[tIdx[j]];
        const p = passengers[m];
        if (trnFree[j] < p.cost) continue;
        if (p.cost > tr.sizeLimit) continue;
        if (!p.isInf && !tr.isUnit) continue;
        const d = distSq(p, tr);
        if (
          best < 0 ||
          typeAsg[g][j] < bestType ||
          (typeAsg[g][j] === bestType && trnAssigned[j] < bestAssigned) ||
          (typeAsg[g][j] === bestType && trnAssigned[j] === bestAssigned && d < bestDist)
        ) {
          best = j;
          bestType = typeAsg[g][j];
          bestAssigned = trnAssigned[j];
          bestDist = d;
        }
      }
      if (best < 0 || trnFree[best] < passengers[m].cost) {
        alive[g] = 0;
        nalive--;
        continue;
      }
      const chosen = transports[tIdx[best]];
      out.push({ unitId: passengers[m].id, trnId: chosen.id });
      trnFree[best] -= passengers[m].cost;
      trnAssigned[best]++;
      typeAsg[g][best]++;
      usedAsTransport[trnIdKey(chosen.id)] = (usedAsTransport[trnIdKey(chosen.id)] || 0) + 1;
      visited.set(passengers[m].id, true);
      events++;
      cursor[g] = nextInGroup[m];
      if (cursor[g] === -1) {
        alive[g] = 0;
        nalive--;
      }
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* 引擎收集 + 指令下发                                                   */
/* ------------------------------------------------------------------ */

function collectPassenger(u: any): Passenger | null {
  const inf = !!u.isInfantry && u.isInfantry();
  const veh = !!u.isVehicle && u.isVehicle();
  if (!inf && !veh) return null;
  if (!!u.zone && u.zone === (ZoneType as any).Air) return null; /* 飞行单位自动跳过 */
  const rules = u.rules || {};
  const cost = Math.max(1, Math.floor(rules.size || 1));
  return {
    id: u.id,
    type: rules,
    cost,
    isInf: !!inf,
    x: u.tile ? u.tile.rx : 0,
    y: u.tile ? u.tile.ry : 0,
  };
}

function collectTransport(u: any): Transport | null {
  const veh = !!u.isVehicle && u.isVehicle();
  if (!veh) return null;
  const trait = u.transportTrait;
  const rules = u.rules || {};
  if (!trait) return null;
  if (!(rules.passengers > 0)) return null;
  if (!(rules.sizeLimit >= 1)) return null; /* 装载等级 < 1：谁都进不来 */
  const free = trait.getAvailableCapacity ? trait.getAvailableCapacity() : 0;
  if (!(free > 0)) return null;
  return {
    id: u.id,
    isUnit: true,
    freeSlots: free,
    sizeLimit: rules.sizeLimit,
    x: u.tile ? u.tile.rx : 0,
    y: u.tile ? u.tile.ry : 0,
  };
}

function runAutoLoad(game: any): void {
  const sel = game.getUnitSelection ? game.getUnitSelection() : null;
  const items = sel?.getSelectedUnits ? sel.getSelectedUnits() : [];
  if (!items || items.length === 0) return;

  const passengers: Passenger[] = [];
  const punits: any[] = [];
  const transports: Transport[] = [];
  const tunits: any[] = [];
  for (const u of items) {
    if (!u || u.isDestroyed || u.isDisposed || u.isSpawned === false) continue;
    // 一个「可载员的载具」既是候选乘客（可能被更大的运输工具装载），
    // 也是候选运输工具本身 —— 两类必须都收集，不能二选一（否则 transports 恒为空）。
    // 「已承担运输任务的载具不再上车」由分配阶段的 usedAsTransport 保证。
    const pc = collectPassenger(u);
    if (pc) {
      passengers.push(pc);
      punits.push(u);
    }
    const tc = collectTransport(u);
    if (tc) {
      transports.push(tc);
      tunits.push(u);
    }
  }
  if (passengers.length === 0 || transports.length === 0) return;

  const assigns = computeAssignments(passengers, transports, {
    rangeCells: DEFAULT_RANGE_CELLS,
    maxEvents: DEFAULT_MAX_EVENTS,
  });
  if (!assigns || assigns.length === 0) return;

  const pmap = new Map<any, any>();
  const tmap = new Map<any, any>();
  for (let i = 0; i < punits.length; i++) pmap.set(passengers[i].id, punits[i]);
  for (let i = 0; i < tunits.length; i++) tmap.set(transports[i].id, tunits[i]);

  for (const a of assigns) {
    const src = pmap.get(a.unitId);
    const dst = tmap.get(a.trnId);
    if (!src || !dst) continue;
    const order = new (EnterTransportNs as any).EnterTransportOrder(game);
    order.set(src, game.createTarget(dst, dst.tile));
    if (
      typeof order.isValid === "function" &&
      typeof order.isAllowed === "function" &&
      order.isValid() &&
      order.isAllowed()
    )
      src.unitOrderTrait.addOrder(order, false);
  }
}

/* ------------------------------------------------------------------ */
/* 热键：交给游戏键位系统（「键盘设置」界面可改键）                      */
/* ------------------------------------------------------------------ */

/**
 * 键位命令标识 —— 必须与 gui/screen/game/worldInteraction/keyboard/KeyCommandType
 * 的 AutoLoad 成员值一致（字符串枚举，值 === 成员名）。
 * 用户未改键时的默认键位（Ctrl+D）来自 KeyBinds.load() 的内置默认表。
 */
const KEY_COMMAND_AUTOLOAD = "AutoLoad";

/* 自建的 window keydown 监听已整体移除：热键改由游戏键位系统统一分发
   （KeyCommandType.AutoLoad → KeyboardHandler.registerCommand），
   好处是可在「键盘设置」界面改键，且 preventDefault/stopPropagation 由游戏统一处理，
   不再有浏览器原生快捷键（Ctrl+D=加书签）抢键的问题。 */

/* ------------------------------------------------------------------ */
/* 扩展定义：随 ExtensionHost 的 Ares/Phobos 框架分发                     */
/* ------------------------------------------------------------------ */

export const autoLoadExtension: ExtensionDefinition = {
  id: "autoload",
  name: "AutoLoad",
  descriptionKey: "STT:Ext.AutoLoad",
  // 依赖均为空；优先级取默认档（Ares=50, Phobos/NPext=100 之后执行利落）。
  priority: 150,
  features: [],
  keyCommands: [
    // 文案（cmnd:autoload / cmnd:autoloaddesc）由同目录 extension.manifest.json 提供，
    // 构建期合并进 locale；此处只声明命令结构，供运行期注入「键盘设置」界面。
    { id: KEY_COMMAND_AUTOLOAD, label: "cmnd:autoload", desc: "cmnd:autoloaddesc", default: "Ctrl+D" },
  ],
  hooks: {
    onMatchStart(ctx: ExtensionHookContext): void {
      // 把热键接进游戏自己的键位系统：命令会出现在「键盘设置」界面、可被用户改键，
      // 并由游戏统一在 keydown 中分发（自带 preventDefault + stopPropagation，
      // 因此不再有浏览器原生 Ctrl+D 抢键的问题）。
      // 注册是异步重试的（GUI 装配晚于对局创建），故这里捕获 game 供回调使用。
      const game = ctx.game;
      ctx.registerKeyCommand?.(KEY_COMMAND_AUTOLOAD, () => runAutoLoad(game));
    },
    onMatchEnd(): void {
      // 无需反注册：命令表随 KeyboardHandler.dispose() 在对局结束时清空。
    },
  },
};