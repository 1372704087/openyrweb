/**
 * IraqBot — 竞技级伊拉克 1v1 AI（专精 Tour of Egypt）。
 *
 * 打法：电→兵营→矿→重工 序列 → 3狗探全图 → 重工后1矿车+纯犀牛不断 →
 *       按经济补矿/补重工 → 攒够犀牛集团平推。雷达+辐射仅作步兵海对策。不追高科。
 * 反作弊：所有 enemy 信息来自 getVisibleUnits("enemy")（引擎按我方 fog 过滤），
 *         生产/建造强校验 prereq/BuildLimit/canPlaceAt/造价，无加钱/开图。
 *
 * 由 game/bot/iraq/IraqBot.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Bot } from "game/bot/Bot"; // 已转换
import * as ApiIndexModule from "game/api/index"; // 孪生
import { Config, dist, countName, makeSnapshot, Blackboard } from "game/bot/iraq/Util"; // 已转换
import { Economy } from "game/bot/iraq/Economy"; // 已转换
import { Military } from "game/bot/iraq/Military"; // 已转换

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const A: any = ApiIndexModule as any;

/* eslint-disable @typescript-eslint/no-explicit-any */

export class IraqBot extends Bot {
  /** 共享黑板（跨 Economy/Military）。 */
  bb: any;
  /** 规则缓存（NAPOWR/HTK/…）。 */
  R: any;
  /** 经济子系统。 */
  econ: any;
  /** 军事子系统。 */
  mil: any;
  /** 上次 MCV 展开指令 tick（节流）。 */
  lastDeployTick: number;

  constructor(name: any, country: any) {
    super(name, country);
    this.bb = new Blackboard();
    this.bb.name = name;
    this.R = null;
    this.econ = null;
    this.mil = null;
    this.lastDeployTick = -999;
  }

  // 缓存内码 → 规则对象（cost/prereq 等），供 isAvailableForProduction 与造价判断
  /**
   * 构建规则对象缓存：建筑用 getBuilding，单位用 getObject；
   * 查询失败吞异常返回 undefined（avail 层再兜底）。
   */
  buildRulesCache(g: any): any {
    var ra = g.rulesApi;
    function b(n: any) {
      try {
        return ra.getBuilding(n);
      } catch (e) {
        return undefined;
      }
    }
    function o(n: any, ty: any) {
      try {
        return ra.getObject(n, ty);
      } catch (e) {
        return undefined;
      }
    }
    return {
      NAPOWR: b("NAPOWR"),
      NAHAND: b("NAHAND"),
      NAREFN: b("NAREFN"),
      NAWEAP: b("NAWEAP"),
      NARADR: b("NARADR"),
      HTK: o("HTK", A.ObjectType.Vehicle),
      HARV: o("HARV", A.ObjectType.Vehicle),
      DOG: o("DOG", A.ObjectType.Infantry),
      DESO: o("DESO", A.ObjectType.Infantry),
    };
  }

  /** 开局：记录起点、推断敌方起点、建规则缓存并装配 Economy/Military。 */
  onGameStart(g: any): void {
    var pd = g.getPlayerData(this.name);
    this.bb.myStart = pd && pd.startLocation ? { x: pd.startLocation.x, y: pd.startLocation.y } : null;
    // 推断敌方起点（最近非己方起点）
    var starts = g.mapApi.getStartingLocations() || [];
    var ms = this.bb.myStart;
    var others: any[] = [];
    for (var i = 0; i < starts.length; i++) {
      var s = starts[i];
      if (!ms || dist(s.x, s.y, ms.x, ms.y) > 6) others.push(s);
    }
    if (ms)
      others.sort(function (p, q) {
        return dist(p.x, p.y, ms.x, ms.y) - dist(q.x, q.y, ms.x, ms.y);
      });
    if (others.length) this.bb.enemyStartGuess = { x: others[0].x, y: others[0].y };
    this.R = this.buildRulesCache(g);
    this.econ = new Economy(this.gameApi, this.actionsApi, this.productionApi, this.R, this.bb);
    this.mil = new Military(this.gameApi, this.actionsApi, this.productionApi, this.R, this.bb);
  }

  /** 快照中是否存在建造厂。 */
  hasCY(snap: any): any {
    for (var i = 0; i < snap.buildings.length; i++) {
      var b = snap.buildings[i];
      if (b.rules && b.rules.constructionYard) return true;
    }
    return false;
  }

  onGameTick(g: any): void {
    if (!this.econ) this.onGameStart(g); // 兜底
    // 整个 tick 包 try/catch：任何异常都不能让 AI 停摆（否则单位闲置/不爆兵）
    try {
      this._tick(g);
    } catch (err) {
      // 记录到诊断，不向外抛
      this.bb.diag = "ERR: " + (err && (err as any).message ? (err as any).message : err);
      this.pushDiag(g);
    }
  }

  // 诊断输出（debug 模式下显示在画面顶部）
  /** debug 模式下输出 phase/规则缓存就绪度/最新 diag。 */
  pushDiag(g: any): void {
    if (!this.getDebugMode()) return;
    var r = this.R || {};
    var d =
      "[IraqBot] " +
      this.bb.phase +
      " | HTK:" +
      !!r.HTK +
      " HARV:" +
      !!r.HARV +
      " DOG:" +
      !!r.DOG +
      " | " +
      this.bb.diag;
    this.actionsApi.setGlobalDebugText(d);
  }

  /**
   * 主 tick：
   * MCV 展开 → 认输判定 → 经济四连 → 状态机（威胁/优势/集结）→ 军事三连 → 诊断。
   */
  _tick(g: any): void {
    var snap = makeSnapshot(g, this.name, this.productionApi);
    this.bb.tick = snap.tick;

    // ---- MCV 展开（开局）----
    var baseUnit = g.getGeneralRules().baseUnit || [];
    var mcvIds = g.getVisibleUnits(this.name, "self", function (r: any) {
      return baseUnit.indexOf(r.name) >= 0;
    });
    if (!this.hasCY(snap) && mcvIds.length) {
      this.bb.phase = "Deploying";
      if (snap.tick - this.lastDeployTick >= 10) {
        this.actionsApi.orderUnits([mcvIds[0]], A.OrderType.DeploySelected);
        this.lastDeployTick = snap.tick;
      }
      this.bb.diag = "deploying MCV";
      this.pushDiag(g);
      return;
    }

    // ---- 认输判定 ----
    if (snap.buildings.length === 0 && snap.army.length === 0 && mcvIds.length === 0) {
      this.bb.phase = "Defeated";
      this.actionsApi.quitGame();
      return;
    }

    // ---- 常驻经济约束 + 建造 + 生产 ----
    this.econ.tickHarvest(snap);
    this.econ.tickBuild(snap);
    this.econ.tickProduction(snap);
    this.econ.tickRefinerySell(snap);

    // ---- 状态机转移：我方犀牛 > 敌方坦克 → 进攻 ----
    var myTanks = countName(snap.army, "HTK");
    var enemyTanks = countName(snap.enemyVehicles, "HTK");
    if (snap.threat === "HIGH") this.bb.phase = "UnderAttack";
    else if (myTanks > enemyTanks && myTanks >= 4) this.bb.phase = "Attacking";
    else this.bb.phase = "Massing";

    // ---- 侦查 / 防守 / 集团推进 ----
    this.mil.tickScout(snap);
    this.mil.tickDefense(snap);
    this.mil.tickArmy(snap);

    // 诊断汇总
    this.bb.diag =
      "phase=" +
      this.bb.phase +
      " tanks=" +
      myTanks +
      " harv=" +
      snap.harvs.length +
      " wf=" +
      countName(snap.buildings, "NAWEAP") +
      " ref=" +
      countName(snap.buildings, "NAREFN") +
      " $=" +
      Math.floor(snap.credits) +
      " vehQ=" +
      snap.queues.Vehicles.size +
      " strQ=" +
      snap.queues.Structures.status +
      " threat=" +
      snap.threat;
    this.pushDiag(g);
  }

  onGameEvent(ev: any, g: any): void {
    // 事件驱动更新可在此扩展（如建筑完成/被攻击）。当前以 tick 驱动为主。
  }
}
