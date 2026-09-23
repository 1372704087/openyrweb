/**
 * Economy — IraqBot 经济/建造/生产子系统。
 *
 * 序列：电→兵营→矿→重工；重工后矿车:重工=2:1 + 纯犀牛不断；雷达+辐射对策。
 * 反作弊：指令走 actionsApi（生产/建造），引擎强校验 prereq/BuildLimit/canPlaceAt/造价。
 * 健壮性：所有 isAvailableForProduction 调用前先确认 rules 对象存在，避免 undefined 抛错崩溃。
 *
 * 由 game/bot/iraq/Economy.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ApiIndexModule from "game/api/index"; // 孪生
import {
  Config,
  dist,
  countName,
  myCYTile,
  findPlacement,
  findRefineryPlacement,
  nearestOreAnchor,
  scanOre,
} from "game/bot/iraq/Util"; // 已转换

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const A: any = ApiIndexModule as any;

/* eslint-disable @typescript-eslint/no-explicit-any */

export class Economy {
  /** GameApi。 */
  game: any;
  /** ActionsApi（placeBuilding / queueForProduction / sellObject…）。 */
  actions: any;
  /** ProductionApi。 */
  prod: any;
  /** 规则缓存（NAPOWR/HTK/…）。 */
  R: any;
  /** 共享黑板。 */
  bb: any;
  /** 矿区方向锚点（节流缓存）。 */
  oreAnchor: any;
  /** 锚点刷新 tick。 */
  oreAnchorTick: number;

  constructor(game: any, actions: any, production: any, R: any, bb: any) {
    this.game = game;
    this.actions = actions;
    this.prod = production;
    this.R = R;
    this.bb = bb;
    this.oreAnchor = null;
    this.oreAnchorTick = -999;
  }

  /** 安全的可用性检查（rules 不存在时返回 false，绝不抛错）。 */
  avail(rules: any): any {
    return !!rules && this.prod.isAvailableForProduction(rules);
  }

  /** 电力是否低于安全余量。 */
  lowPower(snap: any): any {
    return snap.power.total < snap.power.drain + Config.powerMargin;
  }

  // ---- 补矿 vs 补重工 ----
  /**
   * 经济决策：返回下一个应补的建筑内码，或 null 表示无紧迫项。
   * 优先级：低钱补矿场 → 高钱+积压补重工 → 重工不足补重工 →
   * 矿车相对重工不足补矿场。
   */
  econDecision(snap: any): any {
    var wf = countName(snap.buildings, "NAWEAP");
    var ref = countName(snap.buildings, "NAREFN");
    var harv = snap.harvs.length;
    var c = snap.credits;
    var backlog = snap.queues.Vehicles.size;
    if (c < Config.lowCredits && harv <= 2 * ref) return "NAREFN";
    if (c > Config.highCredits && backlog >= 2) return "NAWEAP";
    if (wf < 2) return "NAWEAP";
    if (wf < Config.maxWarFactories && c > Config.highCredits && harv >= 2 * wf && backlog >= 1) return "NAWEAP";
    if (harv < Math.min(6, Math.max(2, 2 * wf))) return "NAREFN";
    return null;
  }

  // ---- 下一栋建筑（序列驱动）----
  /**
   * 决定下一栋建筑：强制序列 电厂→兵营→矿→重工，
   * 之后走 econDecision + 辐射对策 + 电力余量。
   */
  decideNextBuilding(snap: any): any {
    if (this.lowPower(snap)) return "NAPOWR";
    if (countName(snap.buildings, "NAPOWR") < 1) return "NAPOWR";
    if (countName(snap.buildings, "NAHAND") < 1) return "NAHAND";
    if (countName(snap.buildings, "NAREFN") < 1) return "NAREFN";
    if (countName(snap.buildings, "NAWEAP") < 1) return "NAWEAP";
    var dec = this.econDecision(snap);
    if (dec) return dec;
    if (snap.enemyInfantry.length > Config.desolatorTrigger) {
      // 辐射对策：若 DESO 可造则不必造雷达；否则需要雷达开门
      if (!this.avail(this.R.DESO) && countName(snap.buildings, "NARADR") < 1) return "NARADR";
    }
    if (snap.power.total < snap.power.drain + Config.powerMargin + 60) return "NAPOWR";
    return null;
  }

  // ---- 建造调度 ----
  /** Ready 则落子；Idle 则排下一栋（含造价 60% 现金门槛，开局电厂除外）。 */
  tickBuild(snap: any): void {
    var sq = snap.queues.Structures;
    // Ready → 落子
    if (sq.status === A.QueueStatus.Ready && sq.items.length > 0) {
      var name = sq.items[0].rules.name;
      var cy = myCYTile(snap);
      var tile: any;
      if (name === "NAREFN") {
        // 矿场紧贴富矿
        tile = findRefineryPlacement(this.game, this.bb.name, name, cy.x, cy.y);
      } else {
        // 其它建筑朝矿区方向延伸（第一电厂/兵营尤其）
        tile = findPlacement(this.game, this.bb.name, name, this.getOreAnchor(snap) || cy);
      }
      if (tile) this.actions.placeBuilding(name, tile.rx, tile.ry);
      return;
    }
    // Idle → 排下一栋
    if (sq.status === A.QueueStatus.Idle) {
      var want = this.decideNextBuilding(snap);
      if (!want) return;
      var rules = this.R[want];
      if (!rules) return;
      if (!this.prod.isAvailableForProduction(rules)) return;
      var opening = countName(snap.buildings, "NAWEAP") < 1;
      if (!opening && snap.credits < (rules.cost || 0) * 0.6) return;
      this.actions.queueForProduction(A.QueueType.Structures, want, A.ObjectType.Building, 1);
    }
  }

  /** 矿区锚点（200 tick 内复用缓存）。 */
  getOreAnchor(snap: any): any {
    if (this.oreAnchor && snap.tick - this.oreAnchorTick < 200) return this.oreAnchor;
    var cy = myCYTile(snap);
    this.oreAnchor = nearestOreAnchor(this.game, cy.x, cy.y);
    this.oreAnchorTick = snap.tick;
    return this.oreAnchor;
  }

  // ---- 生产调度：矿车:重工=2:1 + 纯犀牛不断 ----
  // 关键：补矿车时不阻塞犀牛生产——犀牛与矿车共享 Vehicle 队列（maxSize 允许多项）。
  // 矿车不足 → 优先排矿车；犀牛不足 → 排犀牛。两者可在同 tick 并排（队列容量内）。
  /**
   * 车辆/步兵生产：
   * 1) 矿车 < 2*重工 → 取消犀牛改排矿车；
   * 2) 矿车够了 → 纯犀牛不断；
   * 3) 雷达+敌步兵海 → 辐射工兵对策。
   */
  tickProduction(snap: any): void {
    var wf = countName(snap.buildings, "NAWEAP");
    if (wf < 1) return; // 无重工，Vehicle 队列不可用
    var q = snap.queues.Vehicles;
    var rhinoQ = 0,
      harvQ = 0;
    for (var i = 0; i < q.items.length; i++) {
      var nm = q.items[i].rules.name;
      if (nm === "HTK") rhinoQ += q.items[i].quantity;
      else if (nm === "HARV") harvQ += q.items[i].quantity;
    }
    var harvHave = snap.harvs.length;
    var targetHarv = 2 * wf; // 严格 2:1

    // 1) 矿车不足 → 取消犀牛改排矿车（用户钦定优先级）
    if (harvHave + harvQ < targetHarv) {
      if (rhinoQ > 0)
        this.actions.unqueueFromProduction(A.QueueType.Vehicles, "HTK", A.ObjectType.Vehicle, rhinoQ);
      if (harvQ === 0 && this.avail(this.R.HARV))
        this.actions.queueForProduction(A.QueueType.Vehicles, "HARV", A.ObjectType.Vehicle, 1);
      this.bb.bonusHarvQueued = true;
      return; // 本 tick 专注补矿车；补够后下 tick 自动恢复犀牛
    }

    // 2) 矿车够了 → 纯犀牛不断（核心）
    if (this.avail(this.R.HTK)) {
      if (q.size < q.maxSize && rhinoQ < Config.rhinoKeepMin) {
        var add = Math.min(q.maxSize - q.size, Config.rhinoBatch);
        this.actions.queueForProduction(A.QueueType.Vehicles, "HTK", A.ObjectType.Vehicle, add);
      }
    }

    // 3) 辐射对策
    if (
      countName(snap.buildings, "NARADR") >= 1 &&
      this.avail(this.R.DESO) &&
      snap.enemyInfantry.length > Config.desolatorTrigger
    ) {
      var iq = snap.queues.Infantry;
      var desoHave = countName(snap.army, "DESO");
      var cap = Math.min(Math.ceil(snap.enemyInfantry.length / 4), Config.desoCap);
      if (iq.size === 0 && desoHave < cap)
        this.actions.queueForProduction(A.QueueType.Infantry, "DESO", A.ObjectType.Infantry, 1);
    }
  }

  /** 每 30 tick：把闲置矿车派往最近富矿。 */
  tickHarvest(snap: any): void {
    if (snap.tick % 30 !== 0) return;
    for (var i = 0; i < snap.harvs.length; i++) {
      var h = snap.harvs[i];
      if (!h.isIdle) continue;
      var ore = nearestOreAnchor(this.game, h.tile.rx, h.tile.ry);
      if (ore) this.actions.orderUnits([h.id], A.OrderType.Gather, ore.x, ore.y);
    }
  }

  // ---- 富矿采完后变卖离矿区最远的冗余矿场（至少留 2）----
  /** 每 90 tick：矿场 >2 时变卖离最近矿最远且距离 >16 的冗余矿场。 */
  tickRefinerySell(snap: any): void {
    if (snap.tick % 90 !== 0) return;
    var refs: any[] = [];
    for (var i = 0; i < snap.buildings.length; i++) {
      var b = snap.buildings[i];
      if (b.name === "NAREFN" && b.tile) refs.push(b);
    }
    if (refs.length <= 2) return;
    var ores = scanOre(this.game);
    if (!ores.length) return;
    var worst: any = null,
      worstD = -1;
    for (var r = 0; r < refs.length; r++) {
      var nd = Infinity;
      for (var m = 0; m < ores.length; m++) {
        var d = dist(refs[r].tile.rx, refs[r].tile.ry, ores[m].rx, ores[m].ry);
        if (d < nd) nd = d;
      }
      if (nd > worstD) {
        worstD = nd;
        worst = refs[r];
      }
    }
    if (worst && worstD > 16) this.actions.sellObject(worst.id);
  }
}
