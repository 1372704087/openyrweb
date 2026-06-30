// === Reconstructed SystemJS module: game/bot/iraq/Military ===
// OpenYRWeb IraqBot — 军事子系统：3狗探全图、集结、集团 attack-move、集中火力微操、
// DESO 展开、被入侵防守。战术目标严格来自 getVisibleUnits("enemy")（引擎按我方 fog 过滤）。
// deps: ["game/api/index", "game/bot/iraq/Util"]
System.register(
  "game/bot/iraq/Military",
  ["game/api/index", "game/bot/iraq/Util"],
  function (e, t) {
    "use strict";
    var A, U;
    t && t.id;
    return {
      setters: [
        function (x) {
          A = x;
        },
        function (x) {
          U = x;
        },
      ],
      execute: function () {
        var Config = U.Config;
        var dist = U.dist;
        var countName = U.countName;
        var myCYTile = U.myCYTile;
        var firepower = U.firepower;

        var Military = class {
          constructor(game, actions, production, R, bb) {
            this.game = game;
            this.actions = actions;
            this.prod = production;
            this.R = R;
            this.bb = bb;
          }

          // ---------- 3 狗探全图 ----------
          setupDogRoutes(snap) {
            var bb = this.bb;
            var starts = this.game.mapApi.getStartingLocations() || [];
            var ms = bb.myStart;
            var others = [];
            for (var i = 0; i < starts.length; i++) {
              var s = starts[i];
              if (!ms || dist(s.x, s.y, ms.x, ms.y) > 6) others.push(s);
            }
            // 按距己方起点排序（近的先探）
            if (ms)
              others.sort(function (p, q) {
                return dist(p.x, p.y, ms.x, ms.y) - dist(q.x, q.y, ms.x, ms.y);
              });
            var routes = [];
            for (var k = 0; k < Math.min(Config.scoutDogs, others.length); k++)
              routes.push({ tag: "start" + k, tile: { x: others[k].x, y: others[k].y } });
            // 不足 3 个起点 → 用扇形方向补足
            var cx = ms ? ms.x : 0,
              cy = ms ? ms.y : 0;
            while (routes.length < Config.scoutDogs) {
              var ang = routes.length * ((2 * Math.PI) / Config.scoutDogs);
              routes.push({
                tag: "fan" + routes.length,
                tile: {
                  x: Math.round(cx + 32 * Math.cos(ang)),
                  y: Math.round(cy + 32 * Math.sin(ang)),
                },
              });
            }
            bb.dogRoutes = routes;
          }

          tickScout(snap) {
            var bb = this.bb;
            var haveBarracks = countName(snap.buildings, "NAHAND") >= 1;
            // 兵营就绪 → 排 3 狗 + 设路由（一次性）
            if (haveBarracks && !bb.dogsAssigned) {
              this.setupDogRoutes(snap);
              if (this.prod.isAvailableForProduction(this.R.DOG)) {
                this.actions.queueForProduction(
                  A.QueueType.Infantry,
                  "DOG",
                  A.ObjectType.Infantry,
                  Config.scoutDogs,
                );
              }
              bb.dogsAssigned = true;
            }
            // 派发未分配的狗（attack-move 沿各自路由，遇敌能咬）
            var unassigned = [];
            for (var i = 0; i < snap.dogs.length; i++) {
              var d = snap.dogs[i];
              if (!bb.dogRole[d.id]) unassigned.push(d);
            }
            for (var j = 0; j < unassigned.length && bb.dogRoutes.length; j++) {
              var route = bb.dogRoutes[j % bb.dogRoutes.length];
              this.actions.orderUnits([unassigned[j].id], A.OrderType.AttackMove, route.tile.x, route.tile.y);
              bb.dogRole[unassigned[j].id] = route.tag;
            }
            // 记录已探明敌方主基地（优先建造厂）
            if (!bb.enemyMainTile && snap.enemyBuildings.length) {
              var best = null;
              for (var m = 0; m < snap.enemyBuildings.length; m++) {
                var eb = snap.enemyBuildings[m];
                if (eb.rules && eb.rules.constructionYard) {
                  best = eb;
                  break;
                }
                if (!best) best = eb;
              }
              if (best && best.tile) bb.enemyMainTile = { x: best.tile.rx, y: best.tile.ry };
            }
          }

          // ---------- 集结点 ----------
          computeRally(snap) {
            var bb = this.bb;
            var cy = myCYTile(snap);
            var target = bb.enemyMainTile || bb.enemyStartGuess || { x: cy.x, y: cy.y };
            // 集结点在己方半场、朝目标方向 35%
            var rx = Math.round(cy.x + (target.x - cy.x) * 0.35);
            var ry = Math.round(cy.y + (target.y - cy.y) * 0.35);
            return { x: rx, y: ry };
          }

          pickAttackTarget(snap) {
            var bb = this.bb;
            var cy = myCYTile(snap);
            // 用户钦定进攻优先级：①敌方矿车 HARV ②敌方重工 NAWEAP ③敌方建造厂 CY
            var pri = function (eb) {
              if (eb.name === "HARV") return 0;
              if (eb.name === "NAWEAP") return 1;
              if (eb.rules && eb.rules.constructionYard) return 2;
              if (eb.rules && eb.rules.refinery) return 3;
              return 4;
            };
            // 优先可见敌方单位/建筑中的矿车、重工、建造厂（按 pri 排序，近的优先）
            var all = snap.enemyCombat.concat(snap.enemyBuildings);
            var cands = [];
            for (var i = 0; i < all.length; i++) {
              var en = all[i];
              if (!en.tile) continue;
              var p = pri(en);
              if (p > 2) continue; // 只考虑矿车/重工/建造厂（含矿场作冸底）
              cands.push({ tile: { x: en.tile.rx, y: en.tile.ry }, pri: p, d: dist(en.tile.rx, en.tile.ry, cy.x, cy.y), id: en.id });
            }
            cands.sort(function (a, b) {
              if (a.pri !== b.pri) return a.pri - b.pri;
              return a.d - b.d;
            });
            if (cands.length) return cands[0];
            // 都不可见 → 已探明主基地 / 推断起点
            if (bb.enemyMainTile) return { tile: bb.enemyMainTile, id: null };
            if (bb.enemyStartGuess) return { tile: bb.enemyStartGuess, id: null };
            return { tile: { x: cy.x, y: cy.y }, id: null };
          }

          // ---------- 集团推进 + 微操 ----------
          // 关键：每 tick 都指挥闲置犀牛（高 APM），不让单位闲置。
          tickArmy(snap) {
            var bb = this.bb;
            if (bb.phase === "UnderAttack" || bb.phase === "Deploying" || bb.phase === "Defeated") return;
            var tanks = snap.army.filter(function (u) {
              return u.name === "HTK";
            });
            var idleTanks = tanks.filter(function (u) {
              return u.isIdle;
            });
            // 先做交火微操（有可见敌人时集中火力/DESO展开）
            this.micro(snap);
            // 集结阶段：把闲置犀牛 move 到集结点（每 tick，高 APM 替代 rally-point）
            if (bb.phase === "Massing") {
              if (idleTanks.length) {
                var rp = this.computeRally(snap);
                var ids = idleTanks.slice(0, 128).map(function (u) {
                  return u.id;
                });
                this.actions.orderUnits(ids, A.OrderType.Move, rp.x, rp.y);
              }
              if (tanks.length >= Config.attackThreshold) bb.phase = "Attacking";
              return;
            }
            // 进攻阶段：闲置犀牛 attack-move 到目标（每 tick，节流仅防重复同指令）
            if (bb.phase === "Attacking") {
              if (idleTanks.length) {
                var tgt = this.pickAttackTarget(snap);
                var mids = idleTanks.slice(0, 128).map(function (u) {
                  return u.id;
                });
                if (tgt.id) this.actions.orderUnits(mids, A.OrderType.Attack, tgt.id);
                else this.actions.orderUnits(mids, A.OrderType.AttackMove, tgt.tile.x, tgt.tile.y);
                bb.lastArmyOrder = snap.tick;
              }
              // 我方坦克不再占优 → 重集结
              if (tanks.length < Math.max(3, Math.floor(Config.attackThreshold / 2))) bb.phase = "Massing";
              return;
            }
          }

          // 集中火力 + DESO 展开（每 tick 有可见敌人时做）
          micro(snap) {
            if (!snap.enemyCombat.length) return;
            var self = this;
            var handled = {};
            for (var i = 0; i < snap.enemyCombat.length; i++) {
              var en = snap.enemyCombat[i];
              if (!en.tile) continue;
              var eng = [];
              for (var j = 0; j < snap.army.length; j++) {
                var m = snap.army[j];
                if (handled[m.id]) continue;
                var rng = (m.primaryWeapon && m.primaryWeapon.maxRange != null ? m.primaryWeapon.maxRange : 5) + 2;
                if (dist(m.tile.rx, m.tile.ry, en.tile.rx, en.tile.ry) < rng) eng.push(m);
              }
              if (!eng.length) continue;
              var deso = [];
              var rest = [];
              for (var k = 0; k < eng.length; k++) {
                if (eng[k].name === "DESO") deso.push(eng[k]);
                else rest.push(eng[k]);
                handled[eng[k].id] = 1;
              }
              if (deso.length)
                this.actions.orderUnits(
                  deso.map(function (u) {
                    return u.id;
                  }),
                  A.OrderType.DeploySelected,
                );
              if (rest.length)
                this.actions.orderUnits(
                  rest.map(function (u) {
                    return u.id;
                  }),
                  A.OrderType.Attack,
                  en.id,
                );
            }
          }

          // ---------- 被入侵防守 ----------
          tickDefense(snap) {
            var bb = this.bb;
            var cy = myCYTile(snap);
            // 近基地的可见敌军
            var invaders = [];
            for (var i = 0; i < snap.enemyCombat.length; i++) {
              var en = snap.enemyCombat[i];
              if (dist(en.tile.rx, en.tile.ry, cy.x, cy.y) < Config.baseRadius) invaders.push(en);
            }
            if (!invaders.length) return;
            // 选附近防守单位（优先近基地的，必要时拉前线）
            var pool = snap.army.slice();
            pool.sort(function (a, b) {
              return dist(a.tile.rx, a.tile.ry, cy.x, cy.y) - dist(b.tile.rx, b.tile.ry, cy.x, cy.y);
            });
            var def = pool.slice(0, Math.min(24, pool.length));
            if (!def.length) return;
            // 打最近入侵者
            invaders.sort(function (a, b) {
              return dist(a.tile.rx, a.tile.ry, cy.x, cy.y) - dist(b.tile.rx, b.tile.ry, cy.x, cy.y);
            });
            var tgt = invaders[0];
            this.actions.orderUnits(
              def.map(function (u) {
                return u.id;
              }),
              A.OrderType.Attack,
              tgt.id,
            );
          }
        };
        e("Military", Military);
      },
    };
  },
);
