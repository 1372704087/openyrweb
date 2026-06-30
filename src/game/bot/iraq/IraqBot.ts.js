// === Reconstructed SystemJS module: game/bot/iraq/IraqBot ===
// OpenYRWeb IraqBot — 竞技级伊拉克 1v1 AI（专精 Tour of Egypt）。
// 打法：电→兵营→矿→重工 序列 → 3狗探全图 → 重工后1矿车+纯犀牛不断 →
//       按经济补矿/补重工 → 攒够犀牛集团平推。雷达+辐射仅作步兵海对策。不追高科。
// 反作弊：所有 enemy 信息来自 getVisibleUnits("enemy")（引擎按我方 fog 过滤），
//         生产/建造强校验 prereq/BuildLimit/canPlaceAt/造价，无加钱/开图。
// deps: ["game/bot/Bot", "game/api/index", "game/bot/iraq/Util", "game/bot/iraq/Economy", "game/bot/iraq/Military"]
System.register(
  "game/bot/iraq/IraqBot",
  ["game/bot/Bot", "game/api/index", "game/bot/iraq/Util", "game/bot/iraq/Economy", "game/bot/iraq/Military"],
  function (e, t) {
    "use strict";
    var Bot, A, U, Economy, Military;
    t && t.id;
    return {
      setters: [
        function (x) {
          Bot = x;
        },
        function (x) {
          A = x;
        },
        function (x) {
          U = x;
        },
        function (x) {
          Economy = x.Economy;
        },
        function (x) {
          Military = x.Military;
        },
      ],
      execute: function () {
        var Config = U.Config;
        var dist = U.dist;
        var countName = U.countName;
        var makeSnapshot = U.makeSnapshot;

        var IraqBot = class extends Bot.Bot {
          constructor(name, country) {
            super(name, country);
            this.bb = new U.Blackboard();
            this.bb.name = name;
            this.R = null;
            this.econ = null;
            this.mil = null;
            this.lastDeployTick = -999;
          }

          // 缓存内码 → 规则对象（cost/prereq 等），供 isAvailableForProduction 与造价判断
          buildRulesCache(g) {
            var ra = g.rulesApi;
            function b(n) {
              try {
                return ra.getBuilding(n);
              } catch (e) {
                return undefined;
              }
            }
            function o(n, ty) {
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

          onGameStart(g) {
            var pd = g.getPlayerData(this.name);
            this.bb.myStart = pd && pd.startLocation ? { x: pd.startLocation.x, y: pd.startLocation.y } : null;
            // 推断敌方起点（最近非己方起点）
            var starts = g.mapApi.getStartingLocations() || [];
            var ms = this.bb.myStart;
            var others = [];
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

          hasCY(snap) {
            for (var i = 0; i < snap.buildings.length; i++) {
              var b = snap.buildings[i];
              if (b.rules && b.rules.constructionYard) return true;
            }
            return false;
          }

          onGameTick(g) {
            if (!this.econ) this.onGameStart(g); // 兜底
            // 整个 tick 包 try/catch：任何异常都不能让 AI 停据（否则单位闲置/不爆兵）
            try {
              this._tick(g);
            } catch (err) {
              // 记录到诊断，不向外抛
              this.bb.diag = "ERR: " + (err && err.message ? err.message : err);
              this.pushDiag(g);
            }
          }

          // 诊断输出（debug 模式下显示在画面顶部）
          pushDiag(g) {
            if (!this.getDebugMode()) return;
            var r = this.R || {};
            var d =
              "[IraqBot] " + this.bb.phase +
              " | HTK:" + (!!r.HTK) + " HARV:" + (!!r.HARV) + " DOG:" + (!!r.DOG) +
              " | " + this.bb.diag;
            this.actionsApi.setGlobalDebugText(d);
          }

          _tick(g) {
            var snap = makeSnapshot(g, this.name, this.productionApi);
            this.bb.tick = snap.tick;

            // ---- MCV 展开（开局）----
            var baseUnit = g.getGeneralRules().baseUnit || [];
            var mcvIds = g.getVisibleUnits(this.name, "self", function (r) {
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
              "phase=" + this.bb.phase +
              " tanks=" + myTanks +
              " harv=" + snap.harvs.length +
              " wf=" + countName(snap.buildings, "NAWEAP") +
              " ref=" + countName(snap.buildings, "NAREFN") +
              " $=" + Math.floor(snap.credits) +
              " vehQ=" + snap.queues.Vehicles.size +
              " strQ=" + snap.queues.Structures.status +
              " threat=" + snap.threat;
            this.pushDiag(g);
          }

          onGameEvent(ev, g) {
            // 事件驱动更新可在此扩展（如建筑完成/被攻击）。当前以 tick 驱动为主。
          }
        };
        e("IraqBot", IraqBot);
      },
    };
  },
);
