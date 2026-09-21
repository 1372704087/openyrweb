// === 援军动作 (CreateReinforcementExecutor) ===
// 动作 7 CreateReinforcement / 75 ReinforceTeam — 按地图 [TeamTypes]/[TaskForces]
// 直接生成单位到指定路径点（不经过招募），并把生成单位交给 AI 引擎执行脚本。
// 参考临时源码（werhd.min.js @2760481 reinforceTeam / @2795037 spawnTaskForce）：
//   - teamId 取 params[1]，路径点取 params[6]；
//   - 运输载具先装载可容纳乘客，再统一生成；
//   - 步兵子格交错放置，生成位置在路径点附近查找可通行格。
// deps: ["game/trigger/TriggerExecutor","game/api/index","game/map/tileFinder/RadialTileFinder"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/executor/CreateReinforcementExecutor",
  ["game/trigger/TriggerExecutor", "game/api/index", "game/map/tileFinder/RadialTileFinder"],
  function (e, t) {
    "use strict";
    var i, a, s, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        ((r = class extends i.TriggerExecutor {
          // 解析阵营名/索引到 Player（与 CreateTeamExecutor 同一套规则）
          resolveHousePlayer(e, name) {
            if (!name) return void 0;
            let s = String(name).trim();
            if (!s) return void 0;
            var p = e.housePlayers.get(s);
            if (p) return p;
            if (/^\d+$/.test(s)) {
              let h = e.campaignHouses && e.campaignHouses[Number(s)];
              if (h) p = e.housePlayers.get(h.name);
              if (p) return p;
            }
            p = e.getAllPlayers().find((q) => !q.defeated && q.country?.name === s);
            if (p) return p;
            let lower = s.toLowerCase();
            for (var [k, v] of e.housePlayers) if (k.toLowerCase() === lower) return v;
            p = e
              .getAllPlayers()
              .find(
                (q) =>
                  q.name === s ||
                  (q.scenarioAliases || []).some((a) => String(a).toLowerCase() === lower),
              );
            return p;
          }
          findTeamType(eng, teamName) {
            if (!eng || !eng.parsed) return void 0;
            var tm = eng.parsed.teamTypes[teamName];
            if (tm) return tm;
            let lower = String(teamName).toLowerCase();
            return Object.keys(eng.parsed.teamTypes).reduce(
              (acc, k) => acc || (k.toLowerCase() === lower ? eng.parsed.teamTypes[k] : void 0),
              void 0,
            );
          }
          findObjectType(game, name) {
            for (var type of [a.ObjectType.Infantry, a.ObjectType.Vehicle, a.ObjectType.Aircraft])
              if (game.rules.hasObject(name, type)) return type;
            throw new Error(`Scenario unit rules "${name}" were not found`);
          }
          findReinforcementSpawnTile(game, unit, startTile, used) {
            try {
              if (!game.map.tiles || !game.map.mapBounds || !game.map.terrain || unit.rules.speedType === void 0)
                return startTile;
              var finder = new s.RadialTileFinder(
                game.map.tiles,
                game.map.mapBounds,
                startTile,
                { width: 1, height: 1 },
                0,
                8,
                (tile) =>
                  !used.has(tile) &&
                  (unit.isAircraft() ||
                    game.map.terrain.getPassableSpeed(tile, unit.rules.speedType, unit.isInfantry(), !1) > 0),
                !1,
              );
              return finder.getNextTile() ?? startTile;
            } catch (_) {
              return startTile;
            }
          }
          execute(e) {
            var teamName = String(this.action.params[1] || "").trim();
            if (!teamName || "0" === teamName || /^(?:none|<none>)$/i.test(teamName)) {
              console.warn(`CreateReinforcement has no team id (${this.getDebugName()}).`);
              return;
            }
            var waypoint = Number(this.action.params[6]) || 0;
            var waypointTile = e.map.getTileAtWaypoint(waypoint);
            if (!waypointTile) {
              console.warn(
                `CreateReinforcement: no valid location for waypoint ${waypoint}. Skipping ${this.getDebugName()}.`,
              );
              return;
            }
            // 战役增援：用 ScenarioTeamRuntime 读取地图 [TaskForces] 并生成单位，
            // 生成后交给 startInstance 走完整 cQe 脚本执行路径（quarry 协调攻击/
            // 小队同步/航空器延续等）。AiEngine 仅作兜底。
            if (e.scenarioTeamRuntime) {
              var scenarioDef = e.scenarioTeamRuntime.getTeam(teamName);
              if (scenarioDef) {
                var scenarioOwner = this.resolveHousePlayer(e, scenarioDef.houseName);
                if (!scenarioOwner) {
                  console.warn(`CreateReinforcement: no owner for house "${scenarioDef.houseName}" — cannot spawn "${teamName}".`);
                  return;
                }
                var scenarioUnits = e.scenarioTeamRuntime.spawnTaskForce(scenarioDef, scenarioOwner, waypointTile);
                if (scenarioUnits.length) {
                  if (e.scenarioTeamRuntime.startInstance(scenarioDef, scenarioUnits, scenarioOwner)) {
                    console.warn(
                      `[OpenYRWeb] CreateReinforcement: "${teamName}" (house=${scenarioDef.houseName}, waypoint=${waypoint}, ` +
                        `units=${scenarioUnits.length}) via scenarioTeamRuntime @ tick ${e.currentTick} — trigger ${this.getDebugName()}`,
                    );
                    return;
                  }
                  var bots = e.botManager && e.botManager.bots ? e.botManager.bots : void 0;
                  for (var [player, bot] of bots ? bots : []) {
                    var eng = bot && bot.aiApi ? bot.aiApi.engine : void 0;
                    if (!eng || !eng.parsed) continue;
                    if (player !== scenarioOwner && player.name !== scenarioOwner.name) continue;
                    var scenarioTm = this.findTeamType(eng, teamName);
                    if (!scenarioTm) continue;
                    eng.spawnTeamWithUnits(scenarioTm, e.currentTick, scenarioUnits.map((u) => u.id));
                    console.warn(
                      `[OpenYRWeb] CreateReinforcement: "${teamName}" (house=${scenarioDef.houseName}, waypoint=${waypoint}, ` +
                        `units=${scenarioUnits.length}) via AiEngine fallback @ tick ${e.currentTick} — trigger ${this.getDebugName()}`,
                    );
                    return;
                  }
                }
              }
            }
            var bots = e.botManager && e.botManager.bots ? e.botManager.bots : void 0;
            var firstEngine,
              botCount = 0,
              parsedCount = 0;
            for (var [player, bot] of bots ? bots : []) {
              botCount++;
              var eng = bot && bot.aiApi ? bot.aiApi.engine : void 0;
              if (!eng || !eng.parsed) continue;
              parsedCount++;
              firstEngine || (firstEngine = eng);
              var tm = this.findTeamType(eng, teamName);
              if (!tm) continue;
              // 归属阵营：TeamType.House= 优先，其次触发器 houseName
              var ownerName = (tm.house || this.trigger.houseName || "").toString().trim();
              var owner = this.resolveHousePlayer(e, ownerName);
              if (owner && owner !== player) continue;
              if (!owner && this.trigger.houseName && this.trigger.houseName.trim()) {
                let tp = this.resolveHousePlayer(e, this.trigger.houseName);
                if (tp && tp !== player) continue;
              }
              if (!owner) {
                console.warn(
                  `CreateReinforcement: no owner for house "${this.trigger.houseName}" — cannot spawn "${teamName}".`,
                );
                return;
              }
              var tf = eng.parsed.taskForces[tm.taskForce];
              if (!tf || !tf.groups.length) {
                console.warn(`CreateReinforcement: team "${teamName}" has no TaskForce "${tm.taskForce}".`);
                return;
              }
              // 直接生成单位
              var units = [],
                subCell = 0,
                used = new Set();
              for (var gi = 0; gi < tf.groups.length; gi++) {
                var group = tf.groups[gi];
                for (var n = 0; n < group.count; n++) {
                  var objType = this.findObjectType(e, group.unitType);
                  var rulesObj = e.rules.getObject(group.unitType, objType);
                  var unit = e.createUnitForPlayer(rulesObj, owner);
                  if (unit.isInfantry()) unit.position.subCell = subCell++ % 5;
                  units.push(unit);
                }
              }
              // 运输载具装载（与 spawnTaskForce 一致：可容纳乘客先入舱）
              var transports = units.filter((u) => !!u.transportTrait);
              var loaded = new Map();
              for (var u of units.filter((u) => !u.transportTrait)) {
                var t = transports.find((t) => t.transportTrait.unitFitsInside(u));
                if (t) {
                  t.transportTrait.units.push(u);
                  u.transport = t;
                  loaded.set(u, t);
                }
              }
              // 生成：未装载单位与运输载具在路径点附近找格，已装载乘客在载具格生成后 limbo
              for (var u of units.filter((u) => !loaded.has(u))) {
                var st = this.findReinforcementSpawnTile(e, u, waypointTile, used);
                e.spawnObject(u, st);
                used.add(st);
              }
              for (var [u, t] of loaded) {
                e.spawnObject(u, t.tile);
                e.limboObject(u, { selected: !1, inTransport: !0 });
              }
              eng.spawnTeamWithUnits(tm, e.currentTick, units.map((u) => u.id));
              console.warn(
                `[OpenYRWeb] CreateReinforcement: "${teamName}" (house=${ownerName || "?"}, waypoint=${waypoint}, ` +
                  `units=${units.length}) via ${player.name} @ tick ${e.currentTick} — trigger ${this.getDebugName()}`,
              );
              return;
            }
            if (firstEngine) {
              console.warn(`TeamType "${teamName}" not found in any AI engine's map data.`);
              return;
            }
            console.warn(
              `No AI engine available for house "${this.trigger.houseName}" — cannot reinforce team "${teamName}" ` +
                `(bots=${botCount}, parsed engines=${parsedCount}).`,
            );
          }
        }),
          e("CreateReinforcementExecutor", r));
      },
    };
  },
);
