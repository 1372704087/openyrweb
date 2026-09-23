/**
 * Util — IraqBot 共享工具：配置阈值、黑板、态势快照、选址、威胁评估、诊断。
 *
 * 视野/反作弊约定（用户钦定）：
 *   - 地图静态信息（矿点分布、地形、起点）对 AI 全开 —— YR 地图固定，假设人人背图。
 *     故矿场选址等用 getAllTilesResourceData() 全图扫描，合法且符合竞技直觉。
 *   - 敌方动态单位/建筑仍按 AI 自己的 fog（getVisibleUnits("enemy")，引擎强制）。
 *
 * 由 game/bot/iraq/Util.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ApiIndexModule from "game/api/index"; // 孪生

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间整体
const A: any = ApiIndexModule as any;

/* eslint-disable @typescript-eslint/no-explicit-any */

// ---- 可调阈值 ----
/** IraqBot 可调阈值表（竞技参数，改动会影响打法）。 */
export const Config = {
  /** 电力安全余量：低于 drain+margin 即补电厂。 */
  powerMargin: 60,
  /** 车间内至少保持的犀牛排队数。 */
  rhinoKeepMin: 2,
  /** 单次排队补犀牛数量。 */
  rhinoBatch: 5,
  /** 进攻门槛（犀牛数量）。 */
  attackThreshold: 8,
  /** 敌方步兵数量触发辐射工兵对策。 */
  desolatorTrigger: 8,
  /** 辐射工兵数量上限。 */
  desoCap: 6,
  /** 最大重工数。 */
  maxWarFactories: 4,
  /** 低资金阈值（优先补矿场）。 */
  lowCredits: 400,
  /** 高资金阈值（可扩重工/持续犀牛）。 */
  highCredits: 1500,
  /** 开局探路狗数量。 */
  scoutDogs: 3,
  /** 基地防守半径（tile）。 */
  baseRadius: 14,
  /** attack-move 最小间隔 tick。 */
  attackMoveGap: 3,
};

/**
 * 黑板 — 跨 tick 共享的 AI 状态（阶段、起点推断、狗路由、威胁等）。
 */
export class Blackboard {
  /** 当前对局 tick。 */
  tick: number = 0;
  /** 状态机阶段名（Deploying/Massing/Attacking/UnderAttack/Defeated）。 */
  phase: string = "Deploying";
  /** 己方起点。 */
  myStart: any = null;
  /** 推断的敌方起点。 */
  enemyStartGuess: any = null;
  /** 本 tick 是否已补过额外矿车。 */
  bonusHarvQueued: boolean = false;
  /** 是否已一次性下达探路狗生产。 */
  dogsAssigned: boolean = false;
  /** 单位 id → 路由 tag。 */
  dogRole: any = {};
  /** 探路狗路由列表。 */
  dogRoutes: any[] = [];
  /** 集结点（预留）。 */
  rally: any = null;
  /** 威胁等级 LOW/MED/HIGH。 */
  threat: any = "LOW";
  /** 已探明的敌方主基地 tile。 */
  enemyMainTile: any = null;
  /** 上次集团指令 tick。 */
  lastArmyOrder: number = 0;
  /** 是否已进入进攻（预留）。 */
  activatedAttack: boolean = false;
  /** 诊断文本（debug 用）。 */
  diag: string = ""; // 诊断文本（debug 用）
}

/** 欧氏距离（tile 平面）。 */
export function dist(ax: any, ay: any, bx: any, by: any): any {
  var dx = ax - bx,
    dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

/** 按 name 字段统计数组中出现次数。 */
export function countName(arr: any, name: any): any {
  var n = 0;
  for (var i = 0; i < arr.length; i++) if (arr[i].name === name) n++;
  return n;
}

/** 取己方建造厂 tile；无建造厂时退回起点 / (0,0)。 */
export function myCYTile(snap: any): any {
  for (var i = 0; i < snap.buildings.length; i++) {
    var b = snap.buildings[i];
    if (b.rules && b.rules.constructionYard) return { x: b.tile.rx, y: b.tile.ry };
  }
  return snap.myStart ? { x: snap.myStart.x, y: snap.myStart.y } : { x: 0, y: 0 };
}

// ---- 全图富矿扫描（地图静态信息，合法）----
/**
 * 全图富矿扫描。
 * 返回所有非空矿格 [{rx,ry,ore,gems}]，按到 (fx,fy) 距离排序；
 * 省略 fx 时保持原序（不排序）。
 */
export function scanOre(game: any, fx?: any, fy?: any): any[] {
  var ores = game.mapApi.getAllTilesResourceData();
  var list: any[] = [];
  for (var i = 0; i < ores.length; i++) {
    var o = ores[i];
    var val = (o.ore || 0) + (o.gems || 0);
    if (val > 0 || o.spawnsOre) list.push({ rx: o.tile.rx, ry: o.tile.ry, val: val });
  }
  if (fx != null)
    list.sort(function (p, q) {
      return dist(p.rx, p.ry, fx, fy) - dist(q.rx, q.ry, fx, fy);
    });
  return list;
}

/** 最近富矿锚点 {x,y}；无矿返回 null。 */
export function nearestOreAnchor(game: any, fx: any, fy: any): any {
  var list = scanOre(game, fx, fy);
  return list.length ? { x: list[0].rx, y: list[0].ry } : null;
}

// ---- 通用选址：贴己方 baseNormal 建筑周围，按到 anchor 距离排序 ----
/**
 * 在己方 baseNormal 建筑外扩矩形内收集候选 tile，
 * 按到 anchor 的距离升序，返回第一个 canPlaceBuilding 通过的格子。
 */
export function findPlacement(game: any, playerName: any, name: any, anchor: any): any {
  var pd = game.getBuildingPlacementData(name);
  if (!pd || !pd.foundation) return null;
  var myBIds = game.getVisibleUnits(playerName, "self", function (r: any) {
    return r.baseNormal;
  });
  var cand: any[] = [];
  var seen: any = {};
  for (var i = 0; i < myBIds.length; i++) {
    var b = game.getUnitData(myBIds[i]);
    if (!b || !b.tile) continue;
    var bw = (b.foundation && b.foundation.width) || 1;
    var bh = (b.foundation && b.foundation.height) || 1;
    var pad = 2;
    var rect = {
      x: b.tile.rx - pad,
      y: b.tile.ry - pad,
      width: bw + 2 * pad,
      height: bh + 2 * pad,
    };
    var tiles = game.mapApi.getTilesInRect(rect);
    if (!tiles) continue;
    for (var k = 0; k < tiles.length; k++) {
      var tt = tiles[k];
      var key = tt.rx + "," + tt.ry;
      if (seen[key]) continue;
      seen[key] = 1;
      cand.push(tt);
    }
  }
  var ax2 = anchor ? anchor.x : 0,
    ay2 = anchor ? anchor.y : 0;
  cand.sort(function (p, q) {
    return dist(p.rx, p.ry, ax2, ay2) - dist(q.rx, q.ry, ax2, ay2);
  });
  for (var j = 0; j < cand.length; j++) {
    if (game.canPlaceBuilding(playerName, name, cand[j])) return cand[j];
  }
  return null;
}

// ---- 矿场专用选址：必须紧贴富矿格（矿车出门即采）----
/**
 * 矿场专用选址：必须紧贴富矿格（矿车出门即采）。
 * 在每个富矿格周围螺旋找能放下 NAREFN 的位置，优先距基地近的富矿区；
 * 失败时兜底通用选址朝最近矿。
 */
export function findRefineryPlacement(game: any, playerName: any, name: any, fromX: any, fromY: any): any {
  var pd = game.getBuildingPlacementData(name);
  if (!pd || !pd.foundation) return null;
  var fw = pd.foundation.width,
    fh = pd.foundation.height;
  var ores = scanOre(game, fromX, fromY); // 按距基地近→远
  var RADIUS = 3; // 矿场中心距矿格 ≤3 视为紧贴
  for (var oi = 0; oi < ores.length; oi++) {
    var o = ores[oi];
    // 在矿格周围 RADIUS 范围螺旋找放置点
    for (var dy = -RADIUS; dy <= RADIUS; dy++) {
      for (var dx = -RADIUS; dx <= RADIUS; dx++) {
        var tx = o.rx + dx,
          ty = o.ry + dy;
        var tile = game.mapApi.getTile(tx, ty);
        if (!tile) continue;
        if (game.canPlaceBuilding(playerName, name, tile)) return tile;
      }
    }
  }
  // 兜底：通用选址朝最近矿
  return findPlacement(game, playerName, name, nearestOreAnchor(game, fromX, fromY));
}

// ---- 火力公式（抄 SupalosaBot mt()）----
/**
 * 火力估算（抄 SupalosaBot mt()）：
 * 残血比例 * (伤害+1) * √射程 / 射速，主副武器累加，上限 800。
 */
export function firepower(u: any): any {
  if (!u || !u.hitPoints || !u.maxHitPoints) return 0;
  var s = u.hitPoints / Math.max(1, u.maxHitPoints);
  var v = 0;
  function add(w: any) {
    if (!w || !w.rules) return;
    var dmg = w.rules.damage || 0;
    var rng = (w.maxRange != null ? w.maxRange : 5) + 1;
    var rof = Math.max(1, w.rules.rof || 1);
    v += (s * (dmg + 1) * Math.sqrt(rng)) / rof;
  }
  add(u.primaryWeapon);
  add(u.secondaryWeapon);
  return Math.min(800, v);
}

/** 按基地半径内敌/我火力比评估威胁：LOW / MED / HIGH。 */
export function assessThreat(snap: any): any {
  var cy = myCYTile(snap);
  var enemyVal = 0,
    myVal = 0;
  for (var i = 0; i < snap.enemyCombat.length; i++) {
    var u = snap.enemyCombat[i];
    if (dist(u.tile.rx, u.tile.ry, cy.x, cy.y) < Config.baseRadius) enemyVal += firepower(u);
  }
  for (var j = 0; j < snap.army.length; j++) {
    var m = snap.army[j];
    if (dist(m.tile.rx, m.tile.ry, cy.x, cy.y) < Config.baseRadius) myVal += firepower(m);
  }
  if (enemyVal <= 0.0001) return "LOW";
  if (enemyVal < myVal * 0.5) return "MED";
  return "HIGH";
}

// ---- 态势快照（enemy* 严格来自 getVisibleUnits("enemy")）----
/**
 * 态势快照：己方建筑/军队/矿车/狗 + 敌方可见单位/建筑 + 生产队列 + 威胁。
 * 敌方信息严格来自 getVisibleUnits("enemy")（引擎按我方 fog 过滤）。
 */
export function makeSnapshot(game: any, name: any, prod: any): any {
  var pd = game.getPlayerData(name);
  var myAll = game.getVisibleUnits(name, "self");
  var buildings: any[] = [],
    army: any[] = [],
    harvs: any[] = [],
    dogs: any[] = [];
  for (var i = 0; i < myAll.length; i++) {
    var u = game.getUnitData(myAll[i]);
    if (!u) continue;
    if (u.type === A.ObjectType.Building) buildings.push(u);
    if (u.rules && u.rules.isSelectableCombatant) army.push(u);
    if (u.rules && u.rules.harvester) harvs.push(u);
    if (u.name === "DOG") dogs.push(u);
  }
  var eIds = game.getVisibleUnits(name, "enemy");
  var enemyCombat: any[] = [],
    enemyInfantry: any[] = [],
    enemyVehicles: any[] = [],
    enemyBuildings: any[] = [];
  for (var k = 0; k < eIds.length; k++) {
    var x = game.getUnitData(eIds[k]);
    if (!x || !x.tile) continue;
    if (x.type === A.ObjectType.Building) enemyBuildings.push(x);
    else {
      enemyCombat.push(x);
      if (x.type === A.ObjectType.Infantry) enemyInfantry.push(x);
      else if (x.type === A.ObjectType.Vehicle) enemyVehicles.push(x);
    }
  }
  var snap: any = {
    tick: game.getCurrentTick(),
    credits: pd.credits,
    power: pd.power,
    myStart: pd.startLocation ? { x: pd.startLocation.x, y: pd.startLocation.y } : null,
    buildings: buildings,
    army: army,
    harvs: harvs,
    dogs: dogs,
    enemyCombat: enemyCombat,
    enemyInfantry: enemyInfantry,
    enemyVehicles: enemyVehicles,
    enemyBuildings: enemyBuildings,
    queues: {
      Structures: prod.getQueueData(A.QueueType.Structures),
      Infantry: prod.getQueueData(A.QueueType.Infantry),
      Vehicles: prod.getQueueData(A.QueueType.Vehicles),
    },
  };
  snap.threat = assessThreat(snap);
  return snap;
}

/** 再导出 api/index 命名空间（与孪生 e("A", A) 一致，供外部取枚举）。 */
export { A };
