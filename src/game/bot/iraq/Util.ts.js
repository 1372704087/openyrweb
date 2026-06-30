// === Reconstructed SystemJS module: game/bot/iraq/Util ===
// OpenYRWeb IraqBot — shared utilities: config, blackboard, snapshot, placement, threat, diag.
//
// 视野/反作弊约定（用户钦定）：
//   - 地图静态信息（矿点分布、地形、起点）对 AI 全开 —— YR 地图固定，假设人人背图。
//     故矿场选址等用 getAllTilesResourceData() 全图扫描，合法且符合竞技直觉。
//   - 敌方动态单位/建筑仍按 AI 自己的 fog（getVisibleUnits("enemy")，引擎强制）。
//
// deps: ["game/api/index"]
System.register("game/bot/iraq/Util", ["game/api/index"], function (e, t) {
  "use strict";
  var A;
  t && t.id;
  return {
    setters: [
      function (x) {
        A = x;
      },
    ],
    execute: function () {
      // ---- 可调阈值 ----
      var Config = {
        powerMargin: 60,
        rhinoKeepMin: 2,
        rhinoBatch: 5,
        attackThreshold: 8,
        desolatorTrigger: 8,
        desoCap: 6,
        maxWarFactories: 4,
        lowCredits: 400,
        highCredits: 1500,
        scoutDogs: 3,
        baseRadius: 14,
        attackMoveGap: 3,
      };
      e("Config", Config);

      var Blackboard = class {
        constructor() {
          this.tick = 0;
          this.phase = "Deploying";
          this.myStart = null;
          this.enemyStartGuess = null;
          this.bonusHarvQueued = false;
          this.dogsAssigned = false;
          this.dogRole = {};
          this.dogRoutes = [];
          this.rally = null;
          this.threat = "LOW";
          this.enemyMainTile = null;
          this.lastArmyOrder = 0;
          this.activatedAttack = false;
          this.diag = ""; // 诊断文本（debug 用）
        }
      };
      e("Blackboard", Blackboard);

      function dist(ax, ay, bx, by) {
        var dx = ax - bx,
          dy = ay - by;
        return Math.sqrt(dx * dx + dy * dy);
      }
      e("dist", dist);

      function countName(arr, name) {
        var n = 0;
        for (var i = 0; i < arr.length; i++) if (arr[i].name === name) n++;
        return n;
      }
      e("countName", countName);

      function myCYTile(snap) {
        for (var i = 0; i < snap.buildings.length; i++) {
          var b = snap.buildings[i];
          if (b.rules && b.rules.constructionYard) return { x: b.tile.rx, y: b.tile.ry };
        }
        return snap.myStart ? { x: snap.myStart.x, y: snap.myStart.y } : { x: 0, y: 0 };
      }
      e("myCYTile", myCYTile);

      // ---- 全图富矿扫描（地图静态信息，合法）----
      // 返回所有非空矿格 [{rx,ry,ore,gems}]，按到 (fx,fy) 距离排序。
      function scanOre(game, fx, fy) {
        var ores = game.mapApi.getAllTilesResourceData();
        var list = [];
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
      e("scanOre", scanOre);

      function nearestOreAnchor(game, fx, fy) {
        var list = scanOre(game, fx, fy);
        return list.length ? { x: list[0].rx, y: list[0].ry } : null;
      }
      e("nearestOreAnchor", nearestOreAnchor);

      // ---- 通用选址：贴己方 baseNormal 建筑周围，按到 anchor 距离排序 ----
      function findPlacement(game, playerName, name, anchor) {
        var pd = game.getBuildingPlacementData(name);
        if (!pd || !pd.foundation) return null;
        var myBIds = game.getVisibleUnits(playerName, "self", function (r) {
          return r.baseNormal;
        });
        var cand = [];
        var seen = {};
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
      e("findPlacement", findPlacement);

      // ---- 矿场专用选址：必须紧贴富矿格（矿车出门即采）----
      // 在每个富矿格周围螺旋找能放下 NAREFN 的位置，优先距基地近的富矿区。
      function findRefineryPlacement(game, playerName, name, fromX, fromY) {
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
      e("findRefineryPlacement", findRefineryPlacement);

      // ---- 火力公式（抄 SupalosaBot mt()）----
      function firepower(u) {
        if (!u || !u.hitPoints || !u.maxHitPoints) return 0;
        var s = u.hitPoints / Math.max(1, u.maxHitPoints);
        var v = 0;
        function add(w) {
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
      e("firepower", firepower);

      function assessThreat(snap) {
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
      e("assessThreat", assessThreat);

      // ---- 态势快照（enemy* 严格来自 getVisibleUnits("enemy")）----
      function makeSnapshot(game, name, prod) {
        var pd = game.getPlayerData(name);
        var myAll = game.getVisibleUnits(name, "self");
        var buildings = [],
          army = [],
          harvs = [],
          dogs = [];
        for (var i = 0; i < myAll.length; i++) {
          var u = game.getUnitData(myAll[i]);
          if (!u) continue;
          if (u.type === A.ObjectType.Building) buildings.push(u);
          if (u.rules && u.rules.isSelectableCombatant) army.push(u);
          if (u.rules && u.rules.harvester) harvs.push(u);
          if (u.name === "DOG") dogs.push(u);
        }
        var eIds = game.getVisibleUnits(name, "enemy");
        var enemyCombat = [],
          enemyInfantry = [],
          enemyVehicles = [],
          enemyBuildings = [];
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
        var snap = {
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
      e("makeSnapshot", makeSnapshot);

      e("A", A);
    },
  };
});
