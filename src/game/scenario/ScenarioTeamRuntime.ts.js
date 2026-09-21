// === 战役场景小队运行时 (ScenarioTeamRuntime) ===
// 完整移植临时源码 werhd.min.js 的 cQe 类（战役动作脚本执行系统）：
//   - 小队生命周期：createTeam / reinforceTeam / destroyTeam / allToHunt / startInstance
//   - 脚本执行：executeScriptAction 覆盖全部 YR ScriptTypes 动作（Tt 枚举）
//   - quarry 协调攻击：startOrJoinQuarryMission / coordinateQuarryMember（全队同步攻同一目标）
//   - 小队级同步：queueTeamWaypointMove / advanceTeamWideScript（等待全队到达再继续脚本）
//   - 目标选择器：selectQuarryTarget / createQuarryFilter / createBuildingTargetSelector /
//     findReachableFiringTile / findEnemyTarget / issueAttackOnKnownTarget
//   - 特勤任务分流：驻军(Garrison)/修桥(Repair)/占领(Capture)/C4(PlantC4)/渗透(Infiltrate)/
//     伪装(Disguise)
//   - 航空器延续：deferAircraftAttackContinuation / runPendingAircraftAttacks（弹药耗尽回机场装填）
//   - 运输装卸：LoadOntoTransport / WaitUntilFullyLoaded / Unload（EvacuateTransportTask）
//   - 地图边缘进出：queueMove 边缘传送 + findConnectedMapEntryTile 岛屿连通
// 该运行时挂在 game.scenarioTeamRuntime，通过 NotifyTick 每帧驱动各子系统。
// deps: 见下方注册表中的依赖列表。
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/scenario/ScenarioTeamRuntime",
  [
    "game/trait/interface/NotifyTick",
    "game/gameobject/task/system/CallbackTask",
    "game/gameobject/task/system/WaitTicksTask",
    "game/gameobject/task/AttackTask",
    "game/gameobject/task/move/MoveTask",
    "game/gameobject/task/move/MoveInWeaponRangeTask",
    "game/gameobject/task/EnterTransportTask",
    "game/gameobject/task/EvacuateTransportTask",
    "game/gameobject/task/GarrisonBuildingTask",
    "game/gameobject/task/CaptureBuildingTask",
    "game/gameobject/task/InfiltrateBuildingTask",
    "game/gameobject/task/PlantC4Task",
    "game/gameobject/task/RepairBuildingTask",
    "game/gameobject/task/morph/DeployIntoTask",
    "game/gameobject/task/ScatterTask",
    "game/gameobject/task/TurnTask",
    "game/gameobject/task/MoveToDockTask",
    "game/map/tileFinder/RadialTileFinder",
    "game/gameobject/unit/RangeHelper",
    "game/gameobject/unit/LosHelper",
    "game/GameSpeed",
    "game/event/TriggerEvaEvent",
    "game/event/TriggerSoundFxEvent",
    "game/event/TriggerAnimEvent",
    "game/event/EventType",
    "game/type/MovementZone",
    "game/type/SuperWeaponType",
    "game/trait/SuperWeaponsTrait",
    "util/bresenham",
    "engine/Engine",
    "game/api/index",
  ],
  function (e, t) {
    "use strict";
    var n, r, s, a, o, l, c, h, u, d, g, p, m, f, y, T, v, b, S, w, E, C, x, I, O, U, D, R, B, A, V;
    t && t.id;
    return {
      setters: [
        function (e) { n = e; },
        function (e) { r = e; },
        function (e) { s = e; },
        function (e) { a = e; },
        function (e) { o = e; },
        function (e) { l = e; },
        function (e) { c = e; },
        function (e) { h = e; },
        function (e) { u = e; },
        function (e) { d = e; },
        function (e) { g = e; },
        function (e) { p = e; },
        function (e) { m = e; },
        function (e) { f = e; },
        function (e) { y = e; },
        function (e) { T = e; },
        function (e) { v = e; },
        function (e) { b = e; },
        function (e) { S = e; },
        function (e) { w = e; },
        function (e) { E = e; },
        function (e) { C = e; },
        function (e) { x = e; },
        function (e) { I = e; },
        function (e) { O = e; },
        function (e) { U = e; },
        function (e) { D = e; },
        function (e) { R = e; },
        function (e) { B = e; },
        function (e) { A = e; },
        function (e) { V = e; },
      ],
      execute: function () {
        e(
          "ScenarioTeamRuntime",
          (class {
            constructor(game, map) {
              this.game = game;
              this.map = map;
              this.assignedUnits = new WeakSet();
              this.teamTagByUnit = new WeakMap();
              this.initialHoldUnits = new WeakSet();
              this.initialUnitMetadata = new WeakMap();
              this.instances = new Map(); // id -> { id, definition, owner, units:Set, stopped, scriptUnits:Set, aiTriggerId, aiOutcomeRecorded }
              this.instancesByDefinition = new Map(); // teamId -> Set<instanceId>
              this.transportOrigins = new WeakMap();
              this.reinforcementOrigins = new WeakMap();
              this.recentlyUnloadedUnits = new WeakSet();
              this.unloadingInstances = new Map();
              this.pendingTeamRemoval = new WeakMap();
              this.huntingUnits = new Set();
              this.quarryMissions = new Map();
              this.scriptTargets = new Map();
              this.scriptProgress = new Map();
              this.guardAreaWaits = new Map();
              this.pendingAircraftAttacks = new Map();
              this.aircraftAttackHistory = [];
              this.ironCurtainAttempts = [];
              this.landingAlignments = [];
              this.mapEdgeTransitions = [];
              this.shroudEscapeTransitions = [];
              this.teamMovementBarriers = [];
              this.teamWideScriptStates = new WeakMap(); // instance -> Map<actionKey, {actionKey, completed, continuationQueued, dispatched, nextIndex, script}>
              this.recruitmentRequests = [];
              this.pendingRecruitments = new Map(); // teamId -> { def, owner }（招募延迟重试）
              this.nextInstanceId = 1;
              this.rangeHelper = new S.RangeHelper(map.tileOccupation);
              this.losHelper = new w.LosHelper(map.tiles, map.tileOccupation);
              this.isScenarioUnit = (obj) => "unitOrderTrait" in obj && "owner" in obj && "name" in obj && "isSpawned" in obj;
              this.unsubscribeObjectDestroy = game.events.subscribe(O.EventType.ObjectDestroy, (evt) => {
                this.handleObjectDestroyed(evt.target);
              });
            }
            dispose() {
              this.unsubscribeObjectDestroy && this.unsubscribeObjectDestroy();
            }
            // ============ 查询 ============
            getTeam(id) {
              return this.map.getScenarioTeam(id);
            }
            getScript(id) {
              return this.map.getScenarioScript(id);
            }
            getTeamUnits(teamId) {
              return [...(this.instancesByDefinition.get(teamId) ?? [])]
                .flatMap((id) => [...(this.instances.get(id)?.units ?? [])])
                .filter((t) => t.isSpawned && !t.isDestroyed);
            }
            // 注意：与参考实现（cQe）一致，触发器 CreateTeam 不限制 TeamType.Max ——
            // Max 仅用于 AI 自动创建调度。同一触发器内多次 CreateTeam 同一队伍会
            // 按动作次数生成多支队伍（受可用单位数限制）。
            findPlayerByName(name) {
              const all = this.game.getAllPlayers();
              return (
                all.find((p) => p.scenarioHouseName === name || p.country?.name === name) ??
                all.find((p) => (p.scenarioAliases || []).includes(name))
              );
            }
            findPlayer(name) {
              const p = this.findPlayerByName(name);
              if (!p) throw new Error(`Scenario house "${name}" was not found`);
              return p;
            }
            findPlayerByHouseId(houseId) {
              const all = this.game.getAllPlayers();
              return all.find((p) => p.country?.id === houseId) ?? all.find((p) => p.scenarioHouseId === houseId);
            }
            getCanonicalHouseId(player) {
              const id = player?.country?.id ?? player?.scenarioHouseId;
              return typeof id === "number" ? id : void 0;
            }
            // ============ 小队生命周期 ============
            createTeam(teamId, tick, unitIds, force) {
              const def = this.getTeam(teamId);
              if (!def) {
                console.warn(`Scenario team "${teamId}" was not found`);
                return false;
              }
              const owner = this.findPlayerByName(def.houseName);
              if (!owner) {
                console.warn(`Scenario team "${teamId}" owner "${def.houseName}" was not found`);
                return false;
              }
              let units;
              if (unitIds && unitIds.length) {
                units = unitIds
                  .map((id) => this.game.getObjectById(id))
                  .filter((u) => u && u.isSpawned && !u.isDestroyed);
              } else {
                units = this.recruitUnits(def, owner);
              }
              if (!units.length) {
                // 单位尚未就绪（tick 0 地图初始单位可能还没生成）：挂起招募请求，
                // 记录期望创建次数，后续每帧重试（对齐参考实现：不限制 Max）。
                const req = this.pendingRecruitments.get(teamId);
                if (req) req.desired++;
                else {
                  this.pendingRecruitments.set(teamId, { def, owner, desired: 1 });
                  console.debug(
                    `Scenario team "${teamId}" has no recruitable units yet — deferred recruitment queued`,
                  );
                }
                return true;
              }
              return this.startInstance(def, units, owner);
            }
            runPendingRecruitments() {
              for (const [teamId, req] of [...this.pendingRecruitments]) {
                while (req.desired > 0) {
                  const units = this.recruitUnits(req.def, req.owner);
                  if (!units.length) break;
                  req.desired--;
                  console.warn(
                    `[OpenYRWeb] Scenario team "${teamId}" deferred recruitment resolved (units=${units.length}) @ tick ${this.game.currentTick}`,
                  );
                  this.startInstance(req.def, units, req.owner);
                }
                if (req.desired <= 0) this.pendingRecruitments.delete(teamId);
              }
            }
            reinforceTeam(teamId, waypoint, chrono = false, aiTriggerId, owner) {
              const def = this.getTeam(teamId);
              if (!def) {
                console.warn(`Scenario team "${teamId}" was not found`);
                return false;
              }
              const o = owner ?? this.findPlayer(def.houseName);
              const wp = waypoint ?? def.waypoint ?? 0;
              const tile = this.map.getTileAtWaypoint(wp);
              if (!tile) throw new Error(`Scenario team "${teamId}" has an invalid reinforcement waypoint ${wp}`);
              const units = this.spawnTaskForce(def, o, tile);
              if (chrono) for (const u of units) u.moveTrait.teleportUnitToTile(tile, void 0, true, false, this.game);
              return this.startInstance(def, units, o, aiTriggerId);
            }
            destroyTeam(teamId) {
              const ids = [...(this.instancesByDefinition.get(teamId) ?? [])];
              for (const id of ids) this.releaseInstance(id);
              this.pendingRecruitments.delete(teamId);
              return ids.length > 0;
            }
            allToHunt(house) {
              const owner = typeof house === "string" ? this.findPlayerByName(house) : this.findPlayerByHouseId(house);
              if (!owner) return false;
              let count = 0;
              for (const obj of owner.getOwnedObjects(!0)) {
                if (!this.isScenarioUnit(obj) || !obj.isUnit?.() || !obj.isSpawned || obj.isDestroyed) continue;
                if (!obj.unitOrderTrait) continue;
                obj.unitOrderTrait.cancelAllTasks();
                this.queueHunt(obj, owner);
                count++;
              }
              return count > 0;
            }
            startInstance(def, units, owner, aiTriggerId, aiAutomated) {
              if (!units.length) {
                for (const u of units) this.assignedUnits.delete(u);
                return false;
              }
              for (const u of units)
                if (this.initialHoldUnits.has(u)) {
                  u.unitOrderTrait.cancelAllTasks();
                  this.initialHoldUnits.delete(u);
                }
              for (const u of units) this.clearScenarioGuardHoldPosition(u);
              const inst = {
                id: this.nextInstanceId++,
                definition: def,
                owner: owner ?? units[0].owner,
                units: new Set(units),
                stopped: false,
                scriptUnits: new Set(units.filter((u) => u.isSpawned && !u.isDestroyed)),
                aiTriggerId,
                aiAutomated,
                aiOutcomeRecorded: false,
              };
              this.instances.set(inst.id, inst);
              const byDef = this.instancesByDefinition.get(def.id) ?? new Set();
              byDef.add(inst.id);
              this.instancesByDefinition.set(def.id, byDef);
              this.registerTeamTag(inst);
              this.runScript(inst);
              return true;
            }
            releaseInstance(id, outcome) {
              const inst = this.instances.get(id);
              if (!inst) return;
              inst.stopped = true;
              this.unregisterTeamTag(inst);
              for (const u of inst.units) {
                if (!u.isDestroyed) u.unitOrderTrait.cancelAllTasks();
                this.assignedUnits.delete(u);
                this.scriptProgress.delete(u.id);
                this.guardAreaWaits.delete(u);
                this.pendingAircraftAttacks.delete(u);
                this.reinforcementOrigins.delete(u);
              }
              this.instances.delete(id);
              this.quarryMissions.delete(id);
              const byDef = this.instancesByDefinition.get(inst.definition.id);
              byDef?.delete(id);
              if (byDef && byDef.size === 0) this.instancesByDefinition.delete(inst.definition.id);
            }
            completeInstance(id) {
              const inst = this.instances.get(id);
              if (!inst) return;
              inst.stopped = true;
              this.unregisterTeamTag(inst);
              for (const u of inst.units) {
                this.assignedUnits.delete(u);
                this.scriptProgress.delete(u.id);
                this.guardAreaWaits.delete(u);
                this.pendingAircraftAttacks.delete(u);
              }
              this.instances.delete(id);
              this.quarryMissions.delete(id);
              const byDef = this.instancesByDefinition.get(inst.definition.id);
              byDef?.delete(id);
              if (byDef && byDef.size === 0) this.instancesByDefinition.delete(inst.definition.id);
            }
            // ============ 小队标签 ============
            registerTeamTag(inst) {
              const tag = inst.definition.tagId;
              if (tag) for (const u of inst.units) {
                this.game.triggers?.attachTargetToTag?.(tag, u);
                this.teamTagByUnit.set(u, tag);
              }
            }
            unregisterTeamTag(inst) {
              for (const u of inst.units) this.detachTeamTag(inst, u);
            }
            detachTeamTag(inst, unit) {
              const tag = inst.definition.tagId;
              if (!tag || this.teamTagByUnit.get(unit) !== tag) return;
              if (!unit.owner.scenarioPlayerControl) this.game.triggers?.detachTargetFromTag?.(tag, unit);
              this.teamTagByUnit.delete(unit);
            }
            // ============ 招募/生成 ============
            recruitUnits(def, owner) {
              const tf = this.map.getScenarioTaskForce(def.taskForceId);
              if (!tf) throw new Error(`Scenario task force "${def.taskForceId}" was not found`);
              const needByName = new Map();
              for (const entry of tf.entries) {
                const key = String(entry.objectName).toLowerCase();
                needByName.set(key, (needByName.get(key) ?? 0) + entry.count);
              }
              const candidates = [...owner.getOwnedObjects(!0)].filter(
                (u) => this.isScenarioUnit(u) && u.isUnit?.() && u.isSpawned && !u.isDestroyed,
              );
              const wp = def.waypoint === void 0 ? void 0 : this.map.getTileAtWaypoint(def.waypoint);
              if (wp)
                candidates.sort(
                  (a, b) =>
                    Math.hypot(a.tile.rx - wp.rx, a.tile.ry - wp.ry) -
                      Math.hypot(b.tile.rx - wp.rx, b.tile.ry - wp.ry) || a.id - b.id,
                );
              const recruited = [];
              for (const u of candidates) {
                if (needByName.size === 0) break;
                if (this.assignedUnits.has(u)) continue;
                const name = String(u.rules?.name ?? u.name ?? "").toLowerCase();
                const need = needByName.get(name);
                if (!need) continue;
                needByName.set(name, need - 1);
                if (need - 1 <= 0) needByName.delete(name);
                this.assignedUnits.add(u);
                recruited.push(u);
              }
              return recruited;
            }
            spawnTaskForce(def, owner, tile) {
              const tf = this.map.getScenarioTaskForce(def.taskForceId);
              if (!tf) throw new Error(`Scenario task force "${def.taskForceId}" was not found`);
              const units = [];
              const used = new Set();
              let subCell = 0;
              for (const entry of tf.entries) {
                for (let i = 0; i < entry.count; i++) {
                  const objType = this.findObjectType(entry.objectName);
                  const rulesObj = this.game.rules.getObject(entry.objectName, objType);
                  const unit = this.game.createUnitForPlayer(rulesObj, owner);
                  if (unit.isInfantry()) unit.position.subCell = subCell++ % 5;
                  units.push(unit);
                }
              }
              // 运输载具装载（与 cQe spawnTaskForce 一致：可容纳乘客先入舱）
              const transports = units.filter((u) => !!u.transportTrait);
              const loaded = new Map();
              for (const u of units.filter((u) => !u.transportTrait)) {
                const t = transports.find((t) => t.transportTrait.unitFitsInside(u));
                if (t) {
                  t.transportTrait.units.push(u);
                  u.transport = t;
                  loaded.set(u, t);
                }
              }
              const offMap = tile && !this.game.map.mapBounds.isWithinBounds(tile);
              // 只对直接在地图外生成的单位（运输载具/未装载单位）记录地图外来源；
              // 装载进运输载具的乘客从载具内卸载后已位于地图内，若保留地图外 origin，
              // queueMove 会把卸载后的步兵误判为"从地图外进入"，瞬移到边缘入口格（可能落在悬崖上）。
              for (const u of units) if (offMap && !loaded.has(u)) this.reinforcementOrigins.set(u, tile);
              for (const u of units.filter((u) => !loaded.has(u))) {
                const st = this.findReinforcementSpawnTile(u, tile, used);
                this.game.spawnObject(u, st);
                used.add(st);
                if (u.transportTrait) this.transportOrigins.set(u, st);
              }
              for (const [u, t] of loaded) {
                this.game.spawnObject(u, t.tile);
                this.game.limboObject(u, { selected: !1, inTransport: !0 });
              }
              for (const u of units) this.assignedUnits.add(u);
              return units;
            }
            findObjectType(name) {
              for (const type of [V.ObjectType.Infantry, V.ObjectType.Vehicle, V.ObjectType.Aircraft])
                if (this.game.rules.hasObject(name, type)) return type;
              throw new Error(`Scenario unit rules "${name}" were not found`);
            }
            findReinforcementSpawnTile(unit, tile, used) {
              const m = this.map;
              if (!m.tiles || !m.mapBounds || !m.terrain || unit.rules.speedType === void 0) return tile;
              try {
                const finder = new b.RadialTileFinder(
                  m.tiles,
                  m.mapBounds,
                  tile,
                  { width: 1, height: 1 },
                  0,
                  8,
                  (n) =>
                    !used.has(n) &&
                    (unit.isAircraft() || m.terrain.getPassableSpeed(n, unit.rules.speedType, unit.isInfantry(), !1) > 0) &&
                    !m.terrain.findObstacles({ tile: n, onBridge: void 0 }, unit).length,
                  !1,
                );
                return finder.getNextTile() ?? tile;
              } catch (_) {
                return tile;
              }
            }
            isInfantryOnlyTaskForce(def) {
              const tf = this.map.getScenarioTaskForce(def.taskForceId);
              return (
                !!tf?.entries.length &&
                tf.entries.every((s) => this.game.rules.hasObject(s.objectName, V.ObjectType.Infantry))
              );
            }
            hasPendingRecruitmentForInstance(id) {
              return this.recruitmentRequests.some((t) => t.instanceId === id && t.remainingByName.size > 0);
            }
            // ============ 实例/脚本 ============
            runScript(inst) {
              const script = this.getScript(inst.definition.scriptId);
              if (!script) {
                console.warn(`Scenario team "${inst.definition.id}" has no script "${inst.definition.scriptId}"`);
                inst.stopped = true;
                return;
              }
              for (const u of inst.scriptUnits) this.queueScriptStep(inst, u, script, 0);
            }
            queueScriptStep(inst, unit, script, index) {
              if (
                inst.stopped ||
                !inst.units.has(unit) ||
                !inst.scriptUnits.has(unit) ||
                (this.pendingTeamRemoval.has(unit) && this.pendingTeamRemoval.get(unit) === inst.id) ||
                unit.isDestroyed ||
                !unit.isSpawned
              )
                return;
              if (index < 0 || index >= script.actions.length) {
                this.finishUnitScript(inst, unit);
                return;
              }
              const action = script.actions[index];
              unit.unitOrderTrait.addTask(
                new r.CallbackTask(() => {
                  if (
                    inst.stopped ||
                    !inst.units.has(unit) ||
                    !inst.scriptUnits.has(unit) ||
                    (this.pendingTeamRemoval.has(unit) && this.pendingTeamRemoval.get(unit) === inst.id) ||
                    unit.isDestroyed ||
                    !unit.isSpawned
                  )
                    return;
                  // 卸载进行中：等待卸载完成再继续脚本（避免与卸载任务冲突）
                  if ((this.unloadingInstances.get(inst.id) ?? 0) > 0) {
                    unit.unitOrderTrait.addTask(new s.WaitTicksTask(1));
                    unit.unitOrderTrait.addTask(new r.CallbackTask(() => this.queueScriptStep(inst, unit, script, index)));
                    return;
                  }
                  const result = this.executeScriptAction(inst, unit, script, index, action);
                  if (result) {
                    if (result.when === "next-scenario-tick") unit.unitOrderTrait.addTask(new s.WaitTicksTask(1));
                    unit.unitOrderTrait.addTask(
                      new r.CallbackTask(() => this.queueScriptStep(inst, unit, result.script, result.index)),
                    );
                  }
                }),
              );
            }
            executeScriptAction(inst, unit, script, index, action) {
              const p = action.parameter;
              this.scriptProgress.set(unit.id, { actionIndex: index, actionParameter: p, actionType: action.type, scriptId: script.id });
              let nextScript = script;
              let nextIndex = index + 1;
              let when = "after-queued-tasks";
              switch (action.type) {
                case 0: {
                  // Attack
                  if (unit.owner.scenarioPlayerControl) {
                    const attacked = this.queueAttack(
                      unit,
                      unit.owner,
                      this.createQuarryFilter(p),
                      true,
                      "nearest",
                      false,
                      false,
                      () => this.finishUnitScript(inst, unit),
                    );
                    if (!attacked) nextIndex = this.continueAfterMissingAttackTarget(unit, index);
                    else {
                      if (this.deferAircraftAttackContinuation(inst, unit, script, index, attacked)) return;
                      if (this.shouldRepeatAttackQuarry(unit, attacked)) {
                        nextIndex = index;
                        when = "next-scenario-tick";
                      }
                    }
                    break;
                  }
                  return this.startOrJoinQuarryMission(inst, unit, script, index, action, {
                    allowAlliedBridgeRepair: false,
                    filter: this.createQuarryFilter(p),
                    includeInsignificant: false,
                    includeNeutral: false,
                    preference: "nearest",
                  });
                }
                case 1: // AttackWaypoint
                  if (!this.queueAttackWaypoint(unit, p)) nextIndex = this.continueAfterMissingAttackTarget(unit, index);
                  break;
                case 3: // MoveToWaypoint
                  this.queueTeamWaypointMove(inst, script, index, p, false);
                  return;
                case 16: // PatrolToWaypoint
                  this.queueTeamWaypointMove(inst, script, index, p, true);
                  return;
                case 4: // MoveToCell（按路径点号解析）
                  this.queueMoveToCell(unit, p);
                  break;
                case 5: // GuardArea
                  unit.guardMode = true;
                  unit.guardArea = { tile: unit.tile, onBridge: !!unit.onBridge };
                  if (p <= 0) return;
                  this.guardAreaWaits.set(unit, {
                    deadlineTick: this.game.currentTick + p * E.GameSpeed.BASE_TICKS_PER_SECOND,
                    index,
                    instance: inst,
                    script,
                    unit,
                  });
                  return;
                case 6: // JumpToLine
                  nextIndex = Math.max(0, p - 1);
                  when = "next-scenario-tick";
                  break;
                case 8: // Unload
                  this.queueUnload(inst, unit, p, { script, index: nextIndex });
                  return;
                case 44: // TruckUnload
                  if (unit.isVehicle() && ["TRUCKA", "TRUCKB"].includes(unit.name.toUpperCase()))
                    unit.scenarioTruckLoaded = false;
                  break;
                case 9: // Deploy
                  if (unit.isVehicle() && unit.rules.deploysInto) {
                    if (
                      this.queueDeploy(unit, (ok) => {
                        if (inst.stopped || !inst.units.has(unit) || unit.isDestroyed) return;
                        if (ok) {
                          this.finishUnitScript(inst, unit);
                          return;
                        }
                        if (!unit.isSpawned || !inst.scriptUnits.has(unit)) return;
                        unit.unitOrderTrait.addTask(new s.WaitTicksTask(15));
                        unit.unitOrderTrait.addTask(new r.CallbackTask(() => this.queueScriptStep(inst, unit, script, index)));
                      })
                    )
                      return;
                    unit.unitOrderTrait.addTask(new s.WaitTicksTask(15));
                    nextIndex = index;
                  } else {
                    unit.unitOrderTrait.addTask(new r.CallbackTask((u) => u.deployerTrait?.toggleDeployed?.()));
                  }
                  break;
                case 10: // FollowFriendlies
                  this.prepareAiAutoDeployedUnitForMove(unit);
                  this.queueMoveToFriendly(unit);
                  break;
                case 11: // AssignMission
                  this.assignMission(unit, p);
                  break;
                case 12: // SetGlobal
                  if (this.isInstanceLeader(inst, unit)) this.game.triggers.toggleGlobalVariable(p, true);
                  break;
                case 38: // ClearGlobal
                  if (this.isInstanceLeader(inst, unit)) this.game.triggers.toggleGlobalVariable(p, false);
                  break;
                case 39: // SetLocal
                  if (this.isInstanceLeader(inst, unit)) this.game.triggers.toggleLocalVariable(p, true);
                  break;
                case 40: // ClearLocal
                  if (this.isInstanceLeader(inst, unit)) this.game.triggers.toggleLocalVariable(p, false);
                  break;
                case 13: // IdleAnimation
                  unit.unitOrderTrait.addTask(new r.CallbackTask((u) => u.idleActionTrait?.doIdleAction?.(u, this.game)));
                  break;
                case 14: // LoadOntoTransport
                  if (unit.transportTrait) {
                    if (this.isTeamFullyLoaded(inst)) {
                      this.finishLoadedPassengerScripts(inst);
                      when = "next-scenario-tick";
                    } else {
                      nextIndex = index;
                      when = "next-scenario-tick";
                    }
                  } else this.queueEnterTeamTransport(inst, unit);
                  break;
                case 45: // TruckLoad
                  if (unit.isVehicle() && ["TRUCKA", "TRUCKB"].includes(unit.name.toUpperCase()))
                    unit.scenarioTruckLoaded = true;
                  break;
                case 43: // WaitUntilFullyLoaded
                  if (!this.isTeamFullyLoaded(inst)) {
                    nextIndex = index;
                    when = "next-scenario-tick";
                  }
                  break;
                case 17: {
                  // ChangeScript
                  const sc = this.map.getScenarioScriptByIndex(p);
                  if (sc) {
                    nextScript = sc;
                    nextIndex = 0;
                    when = "next-scenario-tick";
                  }
                  break;
                }
                case 18: {
                  // ChangeTeam
                  const tm = this.map.getScenarioTeamByIndex(p);
                  if (tm) {
                    if (this.isInstanceLeader(inst, unit)) this.changeInstanceDefinition(inst, tm);
                    const sc = this.map.getScenarioScript(tm.scriptId);
                    if (sc) {
                      nextScript = sc;
                      nextIndex = 0;
                      when = "next-scenario-tick";
                    }
                  }
                  break;
                }
                case 19: // Panic
                  if (unit.isInfantry()) unit.isPanicked = true;
                  this.prepareAiAutoDeployedUnitForMove(unit);
                  unit.unitOrderTrait.addTask(new y.ScatterTask(this.game));
                  break;
                case 21: // Scatter
                  this.prepareAiAutoDeployedUnitForMove(unit);
                  unit.unitOrderTrait.addTask(new y.ScatterTask(this.game));
                  break;
                case 22: // MoveToShroud
                  this.queueTeamMoveToShroud(inst, script, index, p);
                  return;
                case 20: {
                  // ChangeHouse
                  const ch = this.findPlayerByHouseId(p);
                  if (ch && ch !== unit.owner) {
                    this.game.changeObjectOwner(unit, ch);
                    this.queueScriptStep(inst, unit, script, nextIndex);
                    return;
                  }
                  break;
                }
                case 24: // PlaySpeech
                  if (this.isInstanceLeader(inst, unit)) this.dispatchIndexedSpeech(p);
                  break;
                case 25: // PlaySound
                  if (this.isInstanceLeader(inst, unit)) this.dispatchIndexedSound(p, unit.tile);
                  break;
                case 34: // CenterViewOnTeam
                  if (this.isInstanceLeader(inst, unit)) this.ui?.centerViewOnTeam?.([...inst.units], p);
                  break;
                case 37: // DeleteTeamMembers
                  if (this.isInstanceLeader(inst, unit)) {
                    const members = [...inst.units];
                    this.releaseInstance(inst.id);
                    for (const m of members)
                      if (!m.isDestroyed) {
                        if (m.isSpawned) this.game.unspawnObject(m);
                        else if (m.limboData && m.owner) m.owner.removeOwnedObject(m);
                        m.dispose();
                      }
                  }
                  return;
                case 41: // Unpanic
                  if (unit.isInfantry()) unit.isPanicked = false;
                  break;
                case 42: // ForceFacing
                  this.forceFacing(unit, p);
                  break;
                case 46: // AttackEnemyBuilding
                case 56: {
                  // ChronoAttackEnemyBuilding
                  const sel = this.createBuildingTargetSelector(p);
                  return this.startOrJoinQuarryMission(inst, unit, script, index, action, {
                    allowAlliedBridgeRepair: true,
                    filter: sel.filter,
                    includeInsignificant: true,
                    includeNeutral: unit.isInfantry() && (!!unit.rules.engineer || !!unit.rules.occupier || !!unit.rules.infiltrate),
                    preference: sel.preference,
                  });
                }
                case 57: // ChronoAttack
                  return this.startOrJoinQuarryMission(inst, unit, script, index, action, {
                    allowAlliedBridgeRepair: false,
                    filter: this.createQuarryFilter(p),
                    includeInsignificant: false,
                    includeNeutral: false,
                    preference: "nearest",
                  });
                case 47: {
                  // MoveToEnemyBuilding
                  this.prepareAiAutoDeployedUnitForMove(unit);
                  const sel = this.createBuildingTargetSelector(p);
                  this.queueMoveToEnemy(unit, unit.owner, sel.filter, sel.preference, true);
                  break;
                }
                case 48: // Scout
                case 53: // GatherAtEnemy
                  this.prepareAiAutoDeployedUnitForMove(unit);
                  this.queueMoveToEnemy(unit, unit.owner, (c) => c.isBuilding());
                  break;
                case 49: // Success（AI 触发权重由 AI 层处理）
                  break;
                case 50: // Flash
                  if (this.isInstanceLeader(inst, unit))
                    this.ui?.flashTeam?.(
                      [...inst.units].filter((h) => h.isSpawned && !h.isDestroyed),
                      p,
                    );
                  break;
                case 51: {
                  // PlayAnimation
                  const name = this.game.rules.getAnimationName(p);
                  if (name) this.game.events.dispatch(new x.TriggerAnimEvent(name, unit.tile));
                  break;
                }
                case 54: // GatherAtBase
                case 58: // MoveToOwnBuilding
                  this.prepareAiAutoDeployedUnitForMove(unit);
                  this.queueMoveToOwnBuilding(unit);
                  break;
                case 55: // IronCurtainTeam
                  if (this.ironCurtainTeam(inst, unit, script.actions[nextIndex]) === "waiting") {
                    nextIndex = index;
                    when = "next-scenario-tick";
                  }
                  break;
                default:
                  console.warn(`Scenario script action ${action.type} is not used by RA2 campaign maps`);
              }
              return { script: nextScript, index: nextIndex, when };
            }
            finishUnitScript(inst, unit) {
              inst.scriptUnits.delete(unit);
              this.scriptProgress.delete(unit.id);
              this.guardAreaWaits.delete(unit);
              if (!inst.scriptUnits.size && !this.hasPendingRecruitmentForInstance(inst.id)) this.completeInstance(inst.id);
            }
            continueAfterMissingAttackTarget(unit, index) {
              const pc = unit.owner.scenarioPlayerControl;
              unit.unitOrderTrait.addTask(new s.WaitTicksTask(pc ? 15 : 1));
              return pc ? index : index + 1;
            }
            isInstanceLeader(inst, unit) {
              return [...inst.units].find((s) => s.isSpawned && !s.isDestroyed) === unit;
            }
            changeInstanceDefinition(inst, def) {
              if (inst.definition.id === def.id) return;
              this.unregisterTeamTag(inst);
              const byDef = this.instancesByDefinition.get(inst.definition.id);
              byDef?.delete(inst.id);
              if (byDef && byDef.size === 0) this.instancesByDefinition.delete(inst.definition.id);
              inst.definition = def;
              this.registerTeamTag(inst);
              const newSet = this.instancesByDefinition.get(def.id) ?? new Set();
              newSet.add(inst.id);
              this.instancesByDefinition.set(def.id, newSet);
            }
            // ============ 移动/小队同步 ============
            queueMove(inst, unit, waypoint, patrol, onComplete) {
              const tile = this.map.getTileAtWaypoint(waypoint);
              if (!tile) {
                onComplete?.();
                return;
              }
              if (!patrol) this.prepareAiAutoDeployedUnitForMove(unit);
              if (this.recentlyUnloadedUnits.delete(unit)) this.alignUnloadedUnitToDestination(unit, tile, waypoint);
              const hasBounds =
                typeof this.map.isWithinBounds === "function" && typeof this.map.clampWithinBounds === "function";
              const origin = this.reinforcementOrigins.get(unit);
              const from = origin && hasBounds && !this.map.isWithinBounds(origin) ? origin : unit.tile;
              const fromOutside = hasBounds && !this.map.isWithinBounds(from);
              const destOutside = hasBounds && !this.map.isWithinBounds(tile);
              if (fromOutside && !destOutside) {
                const clamped = this.map.clampWithinBounds(from);
                const entry = this.findConnectedMapEntryTile(unit, clamped, tile, from);
                this.recordMapEdgeTransition({
                  kind: "entry",
                  unitId: unit.id,
                  name: unit.name,
                  waypoint,
                  fromRx: from.rx,
                  fromRy: from.ry,
                  edgeRx: entry.rx,
                  edgeRy: entry.ry,
                });
                if (unit.moveTrait) unit.moveTrait.teleportUnitToTile(entry, void 0, !1, !1, this.game);
                this.reinforcementOrigins.delete(unit);
              }
              const dest = destOutside ? this.findReinforcementSpawnTile(unit, this.map.clampWithinBounds(tile), new Set()) : tile;
              unit.unitOrderTrait.addTask(new o.MoveTask(this.game, dest, !1));
              if (destOutside)
                unit.unitOrderTrait.addTask(
                  new r.CallbackTask((g) => {
                    if (!g.isSpawned || g.isDestroyed) return;
                    this.recordMapEdgeTransition({
                      kind: "exit",
                      unitId: g.id,
                      name: g.name,
                      waypoint,
                      fromRx: g.tile.rx,
                      fromRy: g.tile.ry,
                      targetRx: tile.rx,
                      targetRy: tile.ry,
                    });
                    this.detachTeamMember(inst, g);
                    this.game.unspawnObject(g);
                    if (!inst.scriptUnits.size && !this.hasPendingRecruitmentForInstance(inst.id))
                      this.completeInstance(inst.id);
                  }),
                );
              if (onComplete) unit.unitOrderTrait.addTask(new r.CallbackTask(onComplete));
            }
            queueTeamWaypointMove(inst, script, index, waypoint, patrol) {
              const key = `${script.id}:${index}`;
              let states = this.teamWideScriptStates.get(inst);
              if (!states) {
                states = new Map();
                this.teamWideScriptStates.set(inst, states);
              }
              let state = states.get(key);
              if (!state) {
                state = { actionKey: key, completed: new Set(), continuationQueued: false, dispatched: new Set(), nextIndex: index + 1, script };
                states.set(key, state);
              }
              if (state.continuationQueued) return;
              const members = [...inst.scriptUnits].filter((m) => m.isSpawned && !m.isDestroyed && !state.dispatched.has(m.id));
              for (const m of members) state.dispatched.add(m.id);
              for (const m of members) {
                this.scriptProgress.set(m.id, { actionIndex: index, actionParameter: waypoint, actionType: patrol ? 16 : 3, scriptId: script.id });
                m.unitOrderTrait.cancelAllTasks();
                this.prepareAiAutoDeployedUnitForMove(m);
                this.queueMove(inst, m, waypoint, patrol, () => {
                  state.completed.add(m.id);
                  this.advanceTeamWideScript(inst, state);
                });
              }
              this.advanceTeamWideScript(inst, state);
            }
            queueMoveToCell(unit, cell) {
              const tile = this.map.getTileAtWaypoint(cell);
              if (tile && unit.unitOrderTrait) unit.unitOrderTrait.addTask(new o.MoveTask(this.game, tile, !1));
            }
            queueMoveToShroud(inst, unit, script, index, onComplete) {
              this.prepareAiAutoDeployedUnitForMove(unit);
              unit.resetGuardModeToIdle();
              unit.attackTrait?.cancelOpportunityFire?.();
              const escape = this.findShroudEscapeTile(unit);
              if (!escape) {
                this.recordShroudEscapeTransition({ kind: "no-destination", tick: this.game.currentTick, unitId: unit.id, name: unit.name, teamId: inst.definition.id, scriptId: script.id, actionIndex: index });
                onComplete?.();
                return;
              }
              const move = new o.MoveTask(this.game, escape.tile, !1);
              move.preventOpportunityFire = true;
              this.recordShroudEscapeTransition({ kind: "start", tick: this.game.currentTick, unitId: unit.id, name: unit.name, teamId: inst.definition.id, scriptId: script.id, actionIndex: index, reason: escape.reason, fromRx: unit.tile.rx, fromRy: unit.tile.ry, toRx: escape.tile.rx, toRy: escape.tile.ry });
              unit.unitOrderTrait.addTask(move);
              unit.unitOrderTrait.addTask(
                new r.CallbackTask((g) => {
                  this.recordShroudEscapeTransition({ kind: "finish", tick: this.game.currentTick, unitId: g.id, name: g.name, teamId: inst.definition.id, scriptId: script.id, actionIndex: index, reason: escape.reason, rx: g.tile.rx, ry: g.tile.ry, toRx: escape.tile.rx, toRy: escape.tile.ry });
                  onComplete?.();
                }),
              );
            }
            queueTeamMoveToShroud(inst, script, index, param) {
              const key = `${script.id}:${index}`;
              let states = this.teamWideScriptStates.get(inst);
              if (!states) {
                states = new Map();
                this.teamWideScriptStates.set(inst, states);
              }
              let state = states.get(key);
              if (!state) {
                state = { actionKey: key, completed: new Set(), continuationQueued: false, dispatched: new Set(), nextIndex: index + 1, script };
                states.set(key, state);
              }
              if (state.continuationQueued) return;
              const members = [...inst.units].filter((m) => m.isSpawned && !m.isDestroyed && !state.dispatched.has(m.id));
              for (const m of members) state.dispatched.add(m.id);
              for (const m of members) {
                inst.scriptUnits.add(m);
                this.scriptProgress.set(m.id, { actionIndex: index, actionParameter: param, actionType: 22, scriptId: script.id });
                m.unitOrderTrait.cancelAllTasks();
                this.queueMoveToShroud(inst, m, script, index, () => {
                  state.completed.add(m.id);
                  this.advanceTeamWideScript(inst, state);
                });
              }
              this.advanceTeamWideScript(inst, state);
            }
            advanceTeamWideScript(inst, state) {
              if (state.continuationQueued || inst.stopped) return;
              const byId = new Map([...inst.units].map((a) => [a.id, a]));
              for (const id of state.dispatched) {
                const u = byId.get(id);
                if (u && (u.isDestroyed || !u.isSpawned)) {
                  inst.scriptUnits.delete(u);
                  this.scriptProgress.delete(u.id);
                  this.guardAreaWaits.delete(u);
                  this.pendingAircraftAttacks.delete(u);
                }
              }
              if (
                [...state.dispatched].some((id) => {
                  const u = byId.get(id);
                  return u && u.isSpawned && !u.isDestroyed && !state.completed.has(id);
                })
              )
                return;
              state.continuationQueued = true;
              const actionIdx = state.nextIndex - 1;
              const action = state.script.actions[actionIdx];
              if (action?.type === 3 || action?.type === 16)
                this.teamMovementBarriers.push({
                  actionIndex: actionIdx,
                  actionType: action.type,
                  members: [...state.dispatched].flatMap((id) => {
                    const u = byId.get(id);
                    return u && u.isSpawned && !u.isDestroyed ? [{ id, name: u.name, rx: u.tile.rx, ry: u.tile.ry }] : [];
                  }),
                  scriptId: state.script.id,
                  teamId: inst.definition.id,
                  tick: this.game.currentTick,
                  waypoint: action.parameter,
                });
              if (this.teamMovementBarriers.length > 128) this.teamMovementBarriers.shift();
              this.teamWideScriptStates.get(inst)?.delete(state.actionKey);
              for (const id of state.dispatched) {
                const u = byId.get(id);
                if (u && !u.isDestroyed && u.isSpawned) this.queueScriptStep(inst, u, state.script, state.nextIndex);
              }
            }
            runTeamWideScriptBarriers() {
              for (const inst of this.instances.values())
                for (const state of [...(this.teamWideScriptStates.get(inst)?.values() ?? [])])
                  this.advanceTeamWideScript(inst, state);
            }
            findShroudEscapeTile(unit) {
              const tiles = this.game.map.tiles;
              const size = tiles.getMapSize();
              const maxDist = Math.max(size.width, size.height);
              const shroud = this.game.localPlayer ? this.game.mapShroudTrait.getPlayerShroud(this.game.localPlayer) : void 0;
              let islandFilter;
              if (unit.rules.movementZone === U.MovementZone.Fly || unit.rules.speedType === void 0)
                islandFilter = () => true;
              else {
                const islandMap = this.game.map.terrain.getIslandIdMap(unit.rules.speedType, unit.isInfantry());
                const island = islandMap.get(unit.tile, unit.onBridge);
                if (island === void 0) return;
                islandFilter = (f) => islandMap.get(f, !1) === island;
              }
              const find = (pred) =>
                new b.RadialTileFinder(
                  tiles,
                  this.game.map.mapBounds,
                  unit.tile,
                  { width: 1, height: 1 },
                  0,
                  maxDist,
                  (d) => islandFilter(d) && pred(d),
                ).getNextTile();
              if (shroud) {
                const t = find((h) => shroud.isShrouded(h, 0));
                if (t) return { reason: "shroud", tile: t };
              }
              const edge = find((h) => this.isMapBoundaryTile(h));
              return edge ? { reason: "map-edge", tile: edge } : void 0;
            }
            recordShroudEscapeTransition(entry) {
              this.shroudEscapeTransitions.push(entry);
              if (this.shroudEscapeTransitions.length > 64) this.shroudEscapeTransitions.shift();
            }
            findConnectedMapEntryTile(unit, clampedStart, destTile, authoredOrigin) {
              const fallback = this.findReinforcementSpawnTile(unit, clampedStart, new Set());
              if (unit.isAircraft() || unit.rules.movementZone === U.MovementZone.Fly || unit.rules.speedType === void 0)
                return fallback;
              const terrain = this.game.map.terrain;
              const islandMap = terrain.getIslandIdMap(unit.rules.speedType, unit.isInfantry());
              const passable = (y) => terrain.getPassableSpeed(y, unit.rules.speedType, unit.isInfantry(), !1, [unit]) > 0;
              const connected =
                islandMap.get(destTile, !1) === void 0
                  ? new b.RadialTileFinder(
                      this.game.map.tiles,
                      this.game.map.mapBounds,
                      destTile,
                      { width: 1, height: 1 },
                      1,
                      15,
                      (y) => passable(y) && islandMap.get(y, !1) !== void 0,
                    ).getNextTile()
                  : destTile;
              const destIsland = connected && islandMap.get(connected, !1);
              let entry;
              if (authoredOrigin && destIsland !== void 0)
                for (const { x, y } of B.bresenham(authoredOrigin.rx, authoredOrigin.ry, destTile.rx, destTile.ry)) {
                  const w = this.game.map.tiles.getByMapCoords(x, y);
                  if (!w || !this.game.map.mapBounds.isWithinBounds(w) || islandMap.get(w, !1) !== destIsland || !passable(w))
                    continue;
                  if (terrain.findObstacles({ tile: w, onBridge: void 0 }, unit).length) break;
                  entry = w;
                  break;
                }
              const tile =
                entry ??
                (destIsland === void 0
                  ? void 0
                  : new b.RadialTileFinder(
                      this.game.map.tiles,
                      this.game.map.mapBounds,
                      clampedStart,
                      { width: 1, height: 1 },
                      0,
                      32,
                      (y) =>
                        islandMap.get(y, !1) === destIsland &&
                        passable(y) &&
                        !terrain.findObstacles({ tile: y, onBridge: void 0 }, unit).length,
                    ).getNextTile()) ??
                (destIsland === void 0
                  ? void 0
                  : new b.RadialTileFinder(
                      this.game.map.tiles,
                      this.game.map.mapBounds,
                      clampedStart,
                      { width: 1, height: 1 },
                      0,
                      512,
                      (y) =>
                        islandMap.get(y, !1) === destIsland &&
                        passable(y) &&
                        !terrain.findObstacles({ tile: y, onBridge: void 0 }, unit).length &&
                        this.isMapBoundaryTile(y),
                    ).getNextTile());
              return tile ?? fallback;
            }
            isMapBoundaryTile(tile) {
              const rect = this.game.map.mapBounds.mapBuildableSize;
              const x = tile.dx;
              const y = tile.dy - tile.z;
              return x === rect.x || x === rect.x + rect.width - 1 || y === rect.y || y === rect.y + rect.height - 1;
            }
            recordMapEdgeTransition(entry) {
              this.mapEdgeTransitions.push(entry);
              if (this.mapEdgeTransitions.length > 128) this.mapEdgeTransitions.shift();
            }
            alignUnloadedUnitToDestination(unit, destTile, waypoint) {
              if (!unit.isSpawned || unit.isDestroyed || !unit.moveTrait) return;
              const rec = { unitId: unit.id, waypoint, currentIsland: void 0, targetIsland: void 0, result: "unsupported" };
              if (unit.rules.movementZone === U.MovementZone.Fly || unit.rules.speedType === void 0) {
                this.recordLandingAlignment(rec);
                return;
              }
              const terrain = this.game.map.terrain;
              const islandMap = terrain.getIslandIdMap(unit.rules.speedType, unit.isInfantry());
              const currentIsland = islandMap.get(unit.tile, !1);
              rec.currentIsland = currentIsland;
              if (currentIsland === void 0) {
                rec.result = "missing-current-island";
                this.recordLandingAlignment(rec);
                return;
              }
              let targetIsland = islandMap.get(destTile, !1);
              if (targetIsland === void 0) {
                const near = new b.RadialTileFinder(
                  this.game.map.tiles,
                  this.game.map.mapBounds,
                  destTile,
                  { width: 1, height: 1 },
                  1,
                  15,
                  (d) => terrain.getPassableSpeed(d, unit.rules.speedType, unit.isInfantry(), !1, [unit]) > 0 && islandMap.get(d, !1) !== void 0,
                ).getNextTile();
                targetIsland = near ? islandMap.get(near, !1) : void 0;
                rec.nearbyDestination = near ? { rx: near.rx, ry: near.ry } : void 0;
              }
              rec.targetIsland = targetIsland;
              if (targetIsland === void 0 || targetIsland === currentIsland) {
                rec.result = targetIsland === currentIsland ? "already-connected" : "missing-target-island";
                this.recordLandingAlignment(rec);
                return;
              }
              const landing = new b.RadialTileFinder(
                this.game.map.tiles,
                this.game.map.mapBounds,
                unit.tile,
                { width: 1, height: 1 },
                1,
                12,
                (h) =>
                  islandMap.get(h, !1) === targetIsland &&
                  terrain.getPassableSpeed(h, unit.rules.speedType, unit.isInfantry(), !1, [unit]) > 0 &&
                  !terrain.findObstacles({ tile: h, onBridge: void 0 }, unit).length,
              ).getNextTile();
              rec.landingTile = landing ? { rx: landing.rx, ry: landing.ry } : void 0;
              rec.result = landing ? "realigned" : "no-nearby-target-island";
              this.recordLandingAlignment(rec);
              if (landing) unit.moveTrait.teleportUnitToTile(landing, void 0, !1, !1, this.game);
            }
            recordLandingAlignment(entry) {
              this.landingAlignments.push(entry);
              if (this.landingAlignments.length > 64) this.landingAlignments.shift();
            }
            // ============ 目标选择 ============
            selectQuarryTarget(unit, owner, opts) {
              const visibleOnly = opts.visibleOnly ?? false;
              const maxRange = visibleOnly
                ? Math.max(unit.rules.guardRange || 0, unit.primaryWeapon?.range ?? 0, unit.secondaryWeapon?.range ?? 0)
                : void 0;
              return (
                (opts.allowAlliedBridgeRepair
                  ? this.findScenarioBridgeRepairTarget(unit, opts.filter, opts.preference)
                  : void 0) ??
                this.findEnemyTarget(
                  owner,
                  unit,
                  opts.filter,
                  visibleOnly,
                  maxRange,
                  opts.preference,
                  opts.includeNeutral,
                  true,
                  opts.includeInsignificant,
                )
              );
            }
            createQuarryFilter(param) {
              switch (param) {
                case 0:
                case 1:
                  return () => true;
                case 2:
                  return (t) => t.isBuilding();
                case 3:
                  return (t) => !!t.rules.harvester;
                case 4:
                  return (t) => t.isInfantry();
                case 5:
                  return (t) => t.isVehicle() && !t.rules.naval && !t.rules.consideredAircraft;
                case 6:
                  return (t) => t.isBuilding() && !!t.rules.factory;
                case 7:
                  return (t) => t.isBuilding() && !!t.attackTrait;
                case 8:
                  return (t) => !!t.attackTrait || !!t.rules.harvester;
                case 9:
                  return (t) => t.isBuilding() && t.rules.power > 0;
                case 10:
                  return (t) => t.isBuilding() && t.rules.maxNumberOccupants > 0;
                case 11:
                  return (t) => t.isBuilding() && !!t.rules.needsEngineer;
                default:
                  return () => true;
              }
            }
            createBuildingTargetSelector(param) {
              const typeIndex = Math.floor(param / 65536);
              const buildingIndex = param % 65536;
              const preference = ["least-threat", "greatest-threat", "nearest", "farthest"][typeIndex];
              const name =
                typeIndex <= 3 && buildingIndex >= 0
                  ? this.game.rules.ini.getSection("BuildingTypes")?.getString(String(buildingIndex + 1))
                  : void 0;
              return {
                filter: (o) => o.isBuilding() && !!name && o.name.toUpperCase() === name.toUpperCase(),
                preference: preference ?? "nearest",
              };
            }
            findEnemyTarget(owner, unit, filter = () => true, visibleOnly = false, maxRange, preference = "nearest", includeNeutral = false, includeInsignificant = false, canEngage = false) {
              const list = this.game
                .getAllPlayers()
                .filter((v) => v !== owner && (includeNeutral || !v.isNeutral) && !v.defeated && !this.game.alliances.areAllied(owner, v))
                .flatMap((v) => v.getOwnedObjects())
                .filter(
                  (v) =>
                    v.rules.legalTarget !== false &&
                    (includeInsignificant || (!v.rules.insignificant && !v.rules.dontScore) || !!v.attackTrait || (includeNeutral && v.isBuilding() && v.rules.capturable)) &&
                    (!v.isBuilding() || !v.rules.invisibleInGame),
                )
                .filter(filter)
                .filter((v) => !visibleOnly || this.isVisibleTo(v, owner))
                .filter((v) => !unit || maxRange === void 0 || Math.hypot(v.tile.rx - unit.tile.rx, v.tile.ry - unit.tile.ry) <= maxRange)
                .filter((v) => v.isSpawned && !v.isDestroyed);
              if (!unit) return list[0];
              const dist = (v) => Math.hypot(v.tile.rx - unit.tile.rx, v.tile.ry - unit.tile.ry);
              const threat = (v) => (v.rules.threatPosed ?? 0) + (v.rules.specialThreatValue ?? 0);
              const sorted = list.sort((v, w) => {
                const d = dist(v) - dist(w);
                switch (preference) {
                  case "farthest":
                    return -d;
                  case "greatest-threat":
                    return threat(w) - threat(v) || d;
                  case "least-threat":
                    return threat(v) - threat(w) || d;
                  default:
                    return d;
                }
              });
              return canEngage ? sorted.find((v) => this.canEngageScenarioTarget(unit, v)) : sorted[0];
            }
            isVisibleTo(obj, player) {
              const shroud = this.game.mapShroudTrait.getPlayerShroud(player);
              return shroud
                ? obj.isBuilding()
                  ? this.game.map.tileOccupation.calculateTilesForGameObject(obj.tile, obj).some((r) => !shroud.isShrouded(r, obj.tileElevation))
                  : !shroud.isShrouded(obj.tile, obj.tileElevation)
                : true;
            }
            canEngageScenarioTarget(unit, target) {
              if (
                this.canGarrisonScenarioTarget(unit, target) ||
                this.canRepairScenarioBridge(unit, target) ||
                (unit.isInfantry() && unit.rules.engineer && target.isBuilding() && target.rules.capturable && !this.game.areFriendly(unit, target)) ||
                (unit.c4 && target.isBuilding() && target.c4ChargeTrait && !this.game.areFriendly(unit, target)) ||
                (unit.isInfantry() && unit.rules.infiltrate && target.isBuilding() && target.rules.spyable && !this.game.areFriendly(unit, target))
              )
                return true;
              const ref = this.game.createTarget(target, target.tile);
              const weapon = unit.attackTrait?.selectWeaponVersus(unit, ref, this.game, !1);
              return weapon
                ? unit.rules.movementZone === U.MovementZone.Fly || !!this.findReachableFiringTile(unit, target, weapon)
                : false;
            }
            canGarrisonScenarioTarget(unit, target) {
              if (!unit.isInfantry() || !unit.rules.occupier || !target.isBuilding() || !target.garrisonTrait) return false;
              const g = target.garrisonTrait;
              return (
                g.canBeOccupied() &&
                g.units.length < g.maxOccupants &&
                !(g.units.length && g.units[0].owner !== unit.owner) &&
                !unit.mindControllableTrait?.isActive()
              );
            }
            canRepairScenarioBridge(unit, target) {
              return (
                unit.isInfantry() &&
                !!unit.rules.engineer &&
                target.isBuilding() &&
                !target.isDestroyed &&
                !!target.cabHutTrait &&
                (!target.owner.isCombatant() || this.game.areFriendly(unit, target)) &&
                target.cabHutTrait.canRepairBridge()
              );
            }
            findScenarioBridgeRepairTarget(unit, filter, preference) {
              const list = this.game
                .getAllPlayers()
                .flatMap((o) => o.getOwnedObjects())
                .filter((o) => o !== unit && o.isSpawned && o.isBuilding?.())
                .filter(filter)
                .filter((o) => this.canRepairScenarioBridge(unit, o));
              const dist = (o) => Math.hypot(o.tile.rx - unit.tile.rx, o.tile.ry - unit.tile.ry);
              const threat = (o) => (o.rules.threatPosed ?? 0) + (o.rules.specialThreatValue ?? 0);
              return list.sort((o, l) => {
                const c = dist(o) - dist(l);
                switch (preference) {
                  case "farthest":
                    return -c;
                  case "greatest-threat":
                    return threat(l) - threat(o) || c;
                  case "least-threat":
                    return threat(o) - threat(l) || c;
                  default:
                    return c;
                }
              })[0];
            }
            findReachableFiringTile(unit, target, weapon) {
              if (weapon === void 0)
                weapon = unit.attackTrait?.selectWeaponVersus(unit, this.game.createTarget(target, target.tile), this.game, !1);
              if (!weapon) return;
              if (unit.rules.movementZone === U.MovementZone.Fly) return unit.tile;
              const terrain = this.game.map.terrain;
              const islandMap = terrain.getIslandIdMap(unit.rules.speedType, unit.isInfantry());
              const island = islandMap.get(unit.tile, unit.onBridge);
              if (island === void 0) return unit.tile;
              const { range } = this.rangeHelper.computeWeaponRangeVsTarget(unit, target, weapon, this.game.rules);
              const foundation = target.isBuilding() ? target.getFoundation() : { width: 1, height: 1 };
              return new b.RadialTileFinder(
                this.game.map.tiles,
                this.game.map.mapBounds,
                target.tile,
                foundation,
                0,
                Math.max(0, Math.ceil(range)),
                (f) =>
                  islandMap.get(f, !1) === island &&
                  terrain.getPassableSpeed(f, unit.rules.speedType, unit.isInfantry(), !1, [unit]) > 0 &&
                  this.rangeHelper.isInWeaponRange(unit, target, weapon, this.game.rules, f) &&
                  this.losHelper.hasLineOfSight(f, target, weapon),
              ).getNextTile();
            }
            // ============ 攻击/特勤 ============
            issueAttackOnKnownTarget(unit, target, onComplete) {
              const firingTile = this.findReachableFiringTile(unit, target);
              this.scriptTargets.set(unit.id, {
                id: target.id,
                name: target.name,
                owner: target.owner?.scenarioHouseName ?? target.owner?.country?.name,
                rx: target.tile.rx,
                ry: target.tile.ry,
                approachRx: firingTile?.rx,
                approachRy: firingTile?.ry,
              });
              if (this.canGarrisonScenarioTarget(unit, target)) {
                unit.unitOrderTrait.addTask(new u.GarrisonBuildingTask(this.game, target));
                if (onComplete) unit.unitOrderTrait.addTask(new r.CallbackTask(() => onComplete()));
                return;
              }
              if (this.canRepairScenarioBridge(unit, target)) {
                unit.unitOrderTrait.addTask(new m.RepairBuildingTask(this.game, target));
                if (onComplete) unit.unitOrderTrait.addTask(new r.CallbackTask(() => onComplete()));
                return;
              }
              if (unit.isInfantry() && unit.rules.engineer && target.isBuilding() && target.rules.capturable && !this.game.areFriendly(unit, target)) {
                unit.unitOrderTrait.addTask(new d.CaptureBuildingTask(this.game, target));
                if (onComplete) unit.unitOrderTrait.addTask(new r.CallbackTask(() => onComplete()));
                return;
              }
              if (unit.c4 && target.isBuilding() && target.c4ChargeTrait && !this.game.areFriendly(unit, target)) {
                unit.unitOrderTrait.addTask(new p.PlantC4Task(this.game, target));
                if (onComplete) unit.unitOrderTrait.addTask(new r.CallbackTask(() => onComplete()));
                return;
              }
              if (unit.isInfantry() && unit.rules.infiltrate && target.isBuilding() && target.rules.spyable && !this.game.areFriendly(unit, target)) {
                unit.unitOrderTrait.addTask(new g.InfiltrateBuildingTask(this.game, target));
                if (onComplete) unit.unitOrderTrait.addTask(new r.CallbackTask(() => onComplete()));
                return;
              }
              const ref = this.game.createTarget(target, target.tile);
              const weapon = unit.attackTrait?.selectWeaponVersus(unit, ref, this.game, !1);
              if (weapon?.warhead?.rules?.makesDisguise && unit.disguiseTrait && target.isUnit() && target.type === unit.type) {
                unit.unitOrderTrait.addTask(
                  new r.CallbackTask(() => {
                    if (!unit.isDestroyed && unit.isSpawned && !target.isDestroyed && target.isSpawned)
                      unit.disguiseTrait?.disguiseAs(target, unit, this.game);
                  }),
                );
                return;
              }
              unit.unitOrderTrait.addTask(
                weapon ? new a.AttackTask(this.game, ref, weapon) : new o.MoveTask(this.game, target.tile, !1),
              );
            }
            queueAttack(unit, owner, filter = () => true, visibleOnly = false, preference = "nearest", includeNeutral = false, includeInsignificant = false, onComplete, allowAlliedBridgeRepair = false) {
              this.prepareAiAutoDeployedUnitForAttack(unit);
              const target = this.selectQuarryTarget(unit, owner, {
                allowAlliedBridgeRepair,
                filter,
                includeInsignificant,
                includeNeutral,
                preference,
                visibleOnly,
              });
              if (!target) {
                this.scriptTargets.delete(unit.id);
                return;
              }
              this.issueAttackOnKnownTarget(unit, target, onComplete);
              return target;
            }
            queueAttackWaypoint(unit, waypoint) {
              this.prepareAiAutoDeployedUnitForAttack(unit);
              const tile = this.map.getTileAtWaypoint(waypoint);
              if (!tile) return false;
              const candidates = this.game
                .getAllPlayers()
                .flatMap((l) => l.getOwnedObjects())
                .filter(
                  (l) =>
                    l !== unit &&
                    l.isSpawned &&
                    !l.isDestroyed &&
                    l.rules.legalTarget !== false &&
                    (l.tile === tile || (l.isBuilding() && this.game.map.tileOccupation.calculateTilesForGameObject(l.tile, l).includes(tile))),
                )
                .sort((l, c) => Number(this.game.areFriendly(unit, l)) - Number(this.game.areFriendly(unit, c)) || l.id - c.id);
              let target, targetRef, weapon;
              for (const l of candidates) {
                const ref = this.game.createTarget(l, l.tile);
                const w = unit.attackTrait?.selectWeaponVersus(unit, ref, this.game, true);
                if (!w) continue;
                const friendly = this.game.areFriendly(unit, l);
                const invalid = w.rules.damage < 0 || w.warhead?.rules?.electricAssault;
                if (friendly && invalid) continue;
                target = l;
                targetRef = ref;
                weapon = w;
                break;
              }
              if (!targetRef) {
                targetRef = this.game.createTarget(void 0, tile);
                weapon = unit.attackTrait?.selectWeaponVersus(unit, targetRef, this.game, true);
              }
              if (weapon) {
                this.scriptTargets.set(unit.id, {
                  id: target?.id,
                  name: target?.name ?? `waypoint:${waypoint}`,
                  owner: target?.owner?.scenarioHouseName ?? target?.owner?.country?.name,
                  rx: tile.rx,
                  ry: tile.ry,
                });
                unit.unitOrderTrait.addTask(new a.AttackTask(this.game, targetRef, weapon, { force: true }));
                return true;
              }
              this.scriptTargets.delete(unit.id);
              return false;
            }
            // ============ quarry 协调攻击 ============
            startOrJoinQuarryMission(inst, unit, script, index, action, opts) {
              const existing = this.quarryMissions.get(inst.id);
              if (existing && existing.script.id === script.id && existing.actionIndex === index && existing.actionType === action.type) {
                if ((!this.isQuarryTargetLive(existing.missionTarget) || !existing.filter(existing.missionTarget)) && this.refreshQuarryTarget(existing), !existing.missionTarget)
                  return this.completeQuarryMission(existing, unit), {
                    script,
                    index: this.continueAfterMissingAttackTarget(unit, index),
                    when: "after-queued-tasks",
                  };
                this.coordinateQuarryMember(existing, unit);
                return;
              }
              this.prepareAiAutoDeployedUnitForAttack(unit);
              const target = this.selectQuarryTarget(unit, inst.owner ?? unit.owner, opts);
              if (!target)
                return { script, index: this.continueAfterMissingAttackTarget(unit, index), when: "after-queued-tasks" };
              if (!this.shouldRepeatAttackQuarry(unit, target)) {
                const attacked = this.queueAttack(
                  unit,
                  unit.owner,
                  opts.filter,
                  false,
                  opts.preference,
                  opts.includeNeutral,
                  opts.includeInsignificant,
                  () => this.finishUnitScript(inst, unit),
                  opts.allowAlliedBridgeRepair,
                );
                if (attacked && this.deferAircraftAttackContinuation(inst, unit, script, index, attacked)) return;
                return { script, index: index + 1, when: "after-queued-tasks" };
              }
              if (unit.isAircraft?.() && unit.airportBoundTrait && unit.ammoTrait?.maxAmmo) {
                const attacked = this.queueAttack(
                  unit,
                  unit.owner,
                  opts.filter,
                  false,
                  opts.preference,
                  opts.includeNeutral,
                  opts.includeInsignificant,
                  () => this.finishUnitScript(inst, unit),
                  opts.allowAlliedBridgeRepair,
                );
                if (attacked && this.deferAircraftAttackContinuation(inst, unit, script, index, attacked)) return;
              }
              const mission = {
                actionIndex: index,
                actionType: action.type,
                allowAlliedBridgeRepair: opts.allowAlliedBridgeRepair,
                filter: opts.filter,
                includeInsignificant: opts.includeInsignificant,
                includeNeutral: opts.includeNeutral,
                instance: inst,
                missionTarget: target,
                preference: opts.preference,
                script,
              };
              this.quarryMissions.set(inst.id, mission);
              this.coordinateQuarryMember(mission, unit);
            }
            runQuarryMissions() {
              for (const mission of [...this.quarryMissions.values()]) {
                if (mission.instance.stopped) {
                  this.quarryMissions.delete(mission.instance.id);
                  continue;
                }
                if ((!this.isQuarryTargetLive(mission.missionTarget) || !mission.filter(mission.missionTarget)) && this.refreshQuarryTarget(mission), !mission.missionTarget) {
                  this.completeQuarryMission(mission);
                  continue;
                }
                this.coordinateQuarryTeam(mission);
              }
            }
            refreshQuarryTarget(mission) {
              const leader = this.fetchQuarryLeader(mission.instance);
              if (!leader) {
                mission.missionTarget = void 0;
                return;
              }
              mission.missionTarget = this.selectQuarryTarget(leader, mission.instance.owner ?? leader.owner, {
                allowAlliedBridgeRepair: mission.allowAlliedBridgeRepair,
                filter: mission.filter,
                includeInsignificant: mission.includeInsignificant,
                includeNeutral: mission.includeNeutral,
                preference: mission.preference,
              });
            }
            fetchQuarryLeader(inst) {
              const all = [...inst.units].filter((n) => n.isSpawned && !n.isDestroyed);
              const scripted = inst.scriptUnits ? all.filter((n) => inst.scriptUnits.has(n)) : all;
              const pool = scripted.length ? scripted : all;
              return pool.find((n) => this.unitCanLeadQuarry(n)) ?? pool[0];
            }
            unitCanLeadQuarry(unit) {
              return !!(unit.attackTrait || unit.primaryWeapon || unit.secondaryWeapon);
            }
            isQuarryTargetLive(target) {
              return !!target && target.isSpawned && !target.isDestroyed;
            }
            quarryMembers(mission) {
              return [...mission.instance.units].filter((t) => {
                if (t.isDestroyed || !t.isSpawned || (mission.instance.scriptUnits && !mission.instance.scriptUnits.has(t))) return false;
                const prog = this.scriptProgress.get(t.id);
                return prog?.scriptId === mission.script.id && prog.actionIndex === mission.actionIndex && prog.actionType === mission.actionType;
              });
            }
            coordinateQuarryTeam(mission) {
              for (const t of this.quarryMembers(mission)) this.coordinateQuarryMember(mission, t);
            }
            coordinateQuarryMember(mission, unit) {
              if (!mission.missionTarget || unit.isDestroyed || !unit.isSpawned) return;
              this.prepareAiAutoDeployedUnitForAttack(unit);
              if (this.scriptTargets.get(unit.id)?.id === mission.missionTarget.id && !unit.unitOrderTrait.isIdle()) return;
              unit.unitOrderTrait.cancelAllTasks();
              this.issueAttackOnKnownTarget(unit, mission.missionTarget);
            }
            completeQuarryMission(mission, exceptUnit) {
              this.quarryMissions.delete(mission.instance.id);
              const next = mission.actionIndex + 1;
              for (const member of this.quarryMembers(mission))
                if (member !== exceptUnit) {
                  member.unitOrderTrait.cancelAllTasks();
                  member.unitOrderTrait.addTask(new s.WaitTicksTask(1));
                  this.queueScriptStep(mission.instance, member, mission.script, next);
                }
            }
            shouldRepeatAttackQuarry(unit, target) {
              return !(
                this.canGarrisonScenarioTarget(unit, target) ||
                this.canRepairScenarioBridge(unit, target) ||
                unit.attackTrait?.selectWeaponVersus(unit, this.game.createTarget(target, target.tile), this.game, !1)?.warhead?.rules?.makesDisguise ||
                (unit.isInfantry() && target.isBuilding() && !this.game.areFriendly(unit, target) && (unit.rules.engineer && target.rules.capturable || unit.rules.infiltrate && target.rules.spyable)) ||
                (unit.c4 && target.isBuilding() && target.c4ChargeTrait && !this.game.areFriendly(unit, target)) ||
                (unit.isAircraft?.() && unit.airportBoundTrait && unit.ammoTrait?.maxAmmo && !this.findScenarioAircraftAirport(unit))
              );
            }
            // ============ 猎杀 ============
            queueHunt(unit, owner) {
              this.huntingUnits.add(unit);
              this.queueHuntStep(unit, owner);
            }
            runHuntMissions() {
              for (const unit of this.huntingUnits) {
                if (unit.isDestroyed) {
                  this.huntingUnits.delete(unit);
                  continue;
                }
                if (unit.isSpawned && unit.unitOrderTrait.isIdle()) this.queueHuntStep(unit, unit.owner);
              }
            }
            queueHuntStep(unit, owner) {
              if (unit.isDestroyed || !this.huntingUnits.has(unit)) {
                this.huntingUnits.delete(unit);
                return;
              }
              if (!unit.isSpawned) return;
              this.prepareAiAutoDeployedUnitForAttack(unit);
              const target = this.findEnemyTarget(owner, unit, () => true, false, void 0, "nearest", false, true);
              const weapon = target ? unit.attackTrait?.selectWeaponVersus(unit, this.game.createTarget(target, target.tile), this.game, !1) : void 0;
              const firingTile = target && weapon ? this.findReachableFiringTile(unit, target, weapon) : void 0;
              if (target && weapon && firingTile)
                unit.unitOrderTrait.addTask(new l.MoveInWeaponRangeTask(this.game, firingTile, !1, weapon));
              else unit.unitOrderTrait.addTask(new s.WaitTicksTask(15));
              unit.unitOrderTrait.addTask(new s.WaitTicksTask(1));
              unit.unitOrderTrait.addTask(new r.CallbackTask(() => this.queueHuntStep(unit, owner)));
            }
            queueMoveToEnemy(unit, owner, filter = () => true, preference = "nearest", includeNeutral = false) {
              this.prepareAiAutoDeployedUnitForMove(unit);
              const target = this.findEnemyTarget(owner, unit, filter, false, void 0, preference, includeNeutral, false, includeNeutral);
              if (!target) {
                this.scriptTargets.delete(unit.id);
                return;
              }
              this.scriptTargets.set(unit.id, {
                id: target.id,
                name: target.name,
                owner: target.owner?.scenarioHouseName ?? target.owner?.country?.name,
                rx: target.tile.rx,
                ry: target.tile.ry,
              });
              unit.unitOrderTrait.addTask(new o.MoveTask(this.game, target.tile, !1));
            }
            // ============ 运输装卸 ============
            queueEnterTeamTransport(inst, unit) {
              if (unit.transportTrait || this.isLoadedIntoTeamTransport(inst, unit)) return;
              const transport = [...inst.units].find(
                (r) => r !== unit && r.isSpawned && !r.isDestroyed && r.transportTrait?.unitFitsInside(unit),
              );
              if (transport?.transportTrait) {
                this.transportOrigins.set(transport, transport.tile);
                this.prepareAiAutoDeployedUnitForMove(unit);
                unit.unitOrderTrait.addTask(new c.EnterTransportTask(this.game, transport));
              }
            }
            queueUnload(inst, unit, param, scriptInfo) {
              if (!unit.transportTrait) {
                if (scriptInfo) this.queueScriptStep(inst, unit, scriptInfo.script, scriptInfo.index);
                return;
              }
              const passengers = [...unit.transportTrait.units];
              // 参数位：bit0=0 保留乘客在队；bit1=0 保留运输载具在队（与 cQe 的 SG/x6e 一致）
              const keepPassengers = (param & 1) === 0;
              const keepTransport = (param & 2) === 0;
              if (!keepPassengers) for (const p of passengers) this.pendingTeamRemoval.set(p, inst.id);
              const evac = new h.EvacuateTransportTask(this.game, !1);
              evac.forceEvac();
              this.unloadingInstances.set(inst.id, (this.unloadingInstances.get(inst.id) ?? 0) + 1);
              unit.unitOrderTrait.addTask(evac);
              unit.unitOrderTrait.addTask(
                new r.CallbackTask(() => {
                  const keep = [];
                  if (keepPassengers) {
                    for (const p of passengers)
                      if (inst.units.has(p) && p.isSpawned && !p.isDestroyed) {
                        inst.scriptUnits.add(p);
                        keep.push(p);
                      }
                  } else {
                    for (const p of passengers) this.detachTeamMember(inst, p);
                  }
                  if (keepTransport) keep.push(unit);
                  else {
                    this.detachTeamMember(inst, unit);
                    if (inst.definition.transportsReturnOnUnload) {
                      const origin = this.transportOrigins.get(unit);
                      if (origin && unit.isSpawned && !unit.isDestroyed)
                        unit.unitOrderTrait.addTask(new o.MoveTask(this.game, origin, !1));
                    }
                  }
                  const left = (this.unloadingInstances.get(inst.id) ?? 1) - 1;
                  if (left > 0) this.unloadingInstances.set(inst.id, left);
                  else this.unloadingInstances.delete(inst.id);
                  if (scriptInfo) for (const p of keep) this.queueScriptStep(inst, p, scriptInfo.script, scriptInfo.index);
                  if (!inst.scriptUnits.size && !this.hasPendingRecruitmentForInstance(inst.id))
                    this.completeInstance(inst.id);
                }),
              );
            }
            detachTeamMember(inst, unit) {
              this.detachTeamTag(inst, unit);
              inst.units.delete(unit);
              inst.scriptUnits.delete(unit);
              if (this.pendingTeamRemoval.get(unit) === inst.id) this.pendingTeamRemoval.delete(unit);
              this.assignedUnits.delete(unit);
              this.scriptProgress.delete(unit.id);
              this.guardAreaWaits.delete(unit);
              this.pendingAircraftAttacks.delete(unit);
              this.reinforcementOrigins.delete(unit);
            }
            isLoadedIntoTeamTransport(inst, unit) {
              return [...inst.units].some((s) => s.transportTrait?.units.includes(unit));
            }
            isTeamFullyLoaded(inst) {
              const transports = [...inst.units].filter((r) => !!r.transportTrait && !r.isDestroyed);
              if (!transports.length) return true;
              const missing = this.getMissingTaskForceCounts(inst.definition, [...inst.units].filter((r) => !r.isDestroyed));
              for (const [name, count] of missing) {
                if (count <= 0) continue;
                let objType;
                try {
                  objType = this.findObjectType(name);
                } catch (_) {
                  continue;
                }
                const rulesObj = this.game.rules.getObject(name, objType);
                if (transports.some((t) => rulesObj.size <= t.rules.sizeLimit && rulesObj.size <= t.transportTrait.getMaxCapacity()))
                  return false;
              }
              return [...inst.units].every((r) =>
                r.isDestroyed || r.transportTrait
                  ? true
                  : !transports.some((a) => r.rules.size <= a.rules.sizeLimit && r.rules.size <= a.transportTrait.getMaxCapacity()) ||
                    this.isLoadedIntoTeamTransport(inst, r),
              );
            }
            getMissingTaskForceCounts(def, units) {
              const missing = new Map();
              const tf = this.map.getScenarioTaskForce(def.taskForceId);
              if (!tf) return missing;
              for (const entry of tf.entries) {
                const name = String(entry.objectName);
                let have = 0;
                for (const u of units) {
                  const uname = String(u.rules?.name ?? u.name ?? "");
                  if (uname.toLowerCase() === name.toLowerCase()) have++;
                }
                const need = entry.count - have;
                if (need > 0) missing.set(name, need);
              }
              return missing;
            }
            finishLoadedPassengerScripts(inst) {
              for (const t of inst.units)
                for (const s of t.transportTrait?.units ?? []) {
                  inst.scriptUnits.delete(s);
                  this.scriptProgress.delete(s.id);
                  this.guardAreaWaits.delete(s);
                  this.pendingAircraftAttacks.delete(s);
                }
            }
            // ============ 展开 ============
            queueDeploy(unit, onComplete) {
              const deploysInto = unit.rules.deploysInto;
              if (!deploysInto) return false;
              const worker = this.game.getConstructionWorker(unit.owner);
              const canPlace = (tile) => worker.canPlaceAt(deploysInto, tile, { ignoreAdjacent: true, ignoreObjects: [unit] });
              const tile = canPlace(unit.tile)
                ? unit.tile
                : new b.RadialTileFinder(
                    this.game.map.tiles,
                    this.game.map.mapBounds,
                    unit.tile,
                    { width: 1, height: 1 },
                    1,
                    8,
                    canPlace,
                  ).getNextTile();
              if (!tile) return false;
              if (tile !== unit.tile)
                unit.unitOrderTrait.addTask(new o.MoveTask(this.game, tile, !1, { closeEnoughTiles: 0, strictCloseEnough: true }));
              unit.unitOrderTrait.addTask(new f.DeployIntoTask(this.game));
              if (onComplete)
                unit.unitOrderTrait.addTask(
                  new r.CallbackTask(() => {
                    onComplete(!!unit.replacedBy || !unit.isSpawned || unit.isDestroyed);
                  }),
                );
              return true;
            }
            queueMoveToFriendly(unit) {
              this.prepareAiAutoDeployedUnitForMove(unit);
              const friendly = unit.owner.getOwnedObjects().filter((o) => this.isScenarioUnit(o)).find((o) => o !== unit);
              if (friendly) unit.unitOrderTrait.addTask(new o.MoveTask(this.game, friendly.tile, !1));
            }
            queueMoveToOwnBuilding(unit) {
              this.prepareAiAutoDeployedUnitForMove(unit);
              const b = unit.owner.getOwnedObjects().find((o) => o.isBuilding() && o.isSpawned && !o.isDestroyed && !!o.tile);
              if (b) unit.unitOrderTrait.addTask(new o.MoveTask(this.game, b.tile, !1));
            }
            // ============ 任务指派 / 杂项 ============
            assignMission(unit, missionType) {
              if (missionType !== 5 && missionType !== 11) this.clearScenarioGuardHoldPosition(unit);
              switch (missionType) {
                case 1: // Attack
                case 29: // AttackMove
                case 14: // Ambush
                  this.queueAttack(unit, unit.owner);
                  break;
                case 15: // Hunt
                  this.queueHunt(unit, unit.owner);
                  break;
                case 16: // Unload
                  if (unit.transportTrait) unit.unitOrderTrait.addTask(new h.EvacuateTransportTask(this.game, !1));
                  break;
                case 0: // Sleep
                case 23: // Harmless
                case 28: // Wait
                  unit.unitOrderTrait.addTask(new s.WaitTicksTask(15));
                  break;
                case 5: // Guard
                  unit.guardMode = true;
                  unit.guardArea = { tile: unit.tile, onBridge: !!unit.onBridge, holdGround: true };
                  unit.unitOrderTrait.addTask(new s.WaitTicksTask(15));
                  break;
                case 11: // AreaGuard
                  unit.unitOrderTrait.addTask(
                    new r.CallbackTask((u) => {
                      u.guardMode = true;
                      u.guardArea = { tile: u.tile, onBridge: !!u.onBridge };
                    }),
                  );
                  break;
                case 13: // Stop
                  unit.unitOrderTrait.cancelAllTasks();
                  break;
              }
            }
            clearScenarioGuardHoldPosition(unit) {
              if (unit.guardArea?.holdGround) unit.resetGuardModeToIdle();
            }
            forceFacing(unit, facing) {
              const dir = ((8 - (facing & 7)) % 8) * 45;
              if (unit.rules.rot > 0) unit.unitOrderTrait.addTask(new T.TurnTask(dir));
              else {
                unit.direction = dir;
                unit.spinVelocity = 0;
              }
            }
            dispatchIndexedSpeech(index) {
              try {
                const entries = [...(A.Engine.getIni(A.Engine.getFileNameVariant("eva.ini")).getSection("DialogList")?.entries.values() ?? [])];
                const name = entries[index];
                if (typeof name === "string") this.game.events.dispatch(new C.TriggerEvaEvent(name));
              } catch (_) {}
            }
            dispatchIndexedSound(index, tile) {
              try {
                const entries = [...(A.Engine.getSoundIni().getSection("SoundList")?.entries.values() ?? [])];
                const name = entries[index];
                if (typeof name === "string") this.game.events.dispatch(new x.TriggerSoundFxEvent(name, tile));
              } catch (_) {}
            }
            ironCurtainTeam(inst, unit, nextAction) {
              const units = [...inst.units].filter((y) => y.isSpawned && !y.isDestroyed);
              const a = unit && units.includes(unit) ? unit : units[0];
              const owner = a?.owner;
              const sw = owner?.superWeaponsTrait?.getAll?.().find((y) => y.rules.type === D.SuperWeaponType.IronCurtain);
              const ready = sw?.status === 2; // SuperWeaponStatus.Ready
              if (ready) {
                const tile = a ? this.getTeamCenterTile(inst) ?? a.tile : void 0;
                if (tile && owner) this.game.traits.get(R.SuperWeaponsTrait)?.activateSuperWeapon(D.SuperWeaponType.IronCurtain, owner, this.game, tile);
                this.ironCurtainAttempts.push({ fired: true, owner: owner?.scenarioHouseName ?? owner?.country?.name, teamId: inst.definition?.id, tick: this.game.currentTick });
                if (this.ironCurtainAttempts.length > 200) this.ironCurtainAttempts.shift();
                return "fired";
              }
              const charging =
                (sw?.status === 0 || sw?.status === 1) &&
                Number.isFinite(sw.chargeTicks) &&
                Number.isFinite(sw.rechargeTicks) &&
                (sw.rechargeTicks ?? 0) > 0;
              return charging ? "waiting" : "skipped";
            }
            getTeamCenterTile(inst) {
              const units = [...inst.units].filter((n) => n.isSpawned && !n.isDestroyed && !!n.tile);
              if (!units.length) return;
              const cx = Math.round(units.reduce((n, a) => n + a.tile.rx, 0) / units.length);
              const cy = Math.round(units.reduce((n, a) => n + a.tile.ry, 0) / units.length);
              return this.game.map?.tiles?.getByMapCoords?.(cx, cy) ?? units[0].tile;
            }
            // ============ AI 驻守展开辅助（简化） ============
            prepareAiAutoDeployedUnitForMove(unit) {
              this.clearScenarioGuardHoldPosition(unit);
              if (unit.owner?.scenarioPlayerControl === false && unit.isInfantry?.() && unit.deployerTrait?.isDeployed())
                unit.deployerTrait.setDeployed(!1);
            }
            prepareAiAutoDeployedUnitForAttack(unit) {
              this.prepareAiAutoDeployedUnitForMove(unit);
            }
            // ============ 航空器延续 ============
            deferAircraftAttackContinuation(inst, unit, script, index, target) {
              if (!unit.isAircraft?.() || !unit.airportBoundTrait || !unit.ammoTrait?.maxAmmo) return false;
              const airport = this.findScenarioAircraftAirport(unit);
              this.recordAircraftAttack({
                kind: "attack",
                tick: this.game.currentTick,
                unitId: unit.id,
                teamId: inst.definition.id,
                scriptId: script.id,
                actionIndex: index,
                targetId: target.id,
                targetName: target.name,
                ammo: unit.ammoTrait.ammo,
                maxAmmo: unit.ammoTrait.maxAmmo,
                airportId: airport?.id,
                airportName: airport?.name,
              });
              if (!airport) return false;
              this.pendingAircraftAttacks.set(unit, {
                actionIndex: index,
                airport,
                airportId: airport.id,
                airportName: airport.name,
                dockQueued: false,
                instance: inst,
                script,
                target,
                unit,
              });
              unit.unitOrderTrait.addTask(
                new r.CallbackTask(() => {
                  const info = this.pendingAircraftAttacks.get(unit);
                  if (!info || info.actionIndex !== index || info.script !== script) return;
                  const airport2 = this.findScenarioAircraftAirport(unit, info.airport);
                  if (airport2) {
                    info.airport = airport2;
                    info.airportId = airport2.id;
                    info.airportName = airport2.name;
                    return;
                  }
                  this.continueAircraftPastUnavailableAirport(unit, info);
                }),
              );
              return true;
            }
            runPendingAircraftAttacks() {
              for (const [unit, info] of [...this.pendingAircraftAttacks]) {
                const { actionIndex, instance, script, target } = info;
                if (instance.stopped || !instance.units.has(unit) || unit.isDestroyed || !unit.isSpawned) {
                  this.pendingAircraftAttacks.delete(unit);
                  continue;
                }
                if (target.isDestroyed || !target.isSpawned) {
                  this.continueAircraftPastLostTarget(unit, info);
                  continue;
                }
                if (this.game.areFriendly(unit, target)) {
                  if (!unit.unitOrderTrait.isIdle()) unit.unitOrderTrait.cancelAllTasks();
                  this.pendingAircraftAttacks.delete(unit);
                  this.queueScriptStep(instance, unit, script, actionIndex);
                  continue;
                }
                if (!unit.unitOrderTrait.isIdle()) continue;
                const ammo = unit.ammoTrait;
                if (ammo && ammo.ammo < ammo.maxAmmo) {
                  const airport = this.findScenarioAircraftAirport(unit, info.airport);
                  if (airport) {
                    info.airport = airport;
                    info.airportId = airport.id;
                    info.airportName = airport.name;
                  }
                  if (!airport) {
                    this.continueAircraftPastUnavailableAirport(unit, info);
                    continue;
                  }
                  if (airport?.dockTrait?.isDocked(unit)) continue;
                  if (info.dockQueued) {
                    info.dockQueued = false;
                    continue;
                  }
                  if (airport?.isSpawned && unit.moveTrait && unit.moveTrait.moveState !== 2 && unit.moveTrait.moveState !== 3) {
                    info.dockQueued = true;
                    unit.unitOrderTrait.addTask(new v.MoveToDockTask(this.game, airport));
                  }
                  continue;
                }
                this.recordAircraftAttack({
                  kind: "reload-complete",
                  tick: this.game.currentTick,
                  unitId: unit.id,
                  teamId: instance.definition.id,
                  scriptId: script.id,
                  actionIndex,
                  targetId: target.id,
                  targetName: target.name,
                  airportId: info.airportId,
                  airportName: info.airportName,
                  docked: info.airport?.dockTrait?.isDocked(unit) === true,
                  ammo: ammo?.ammo,
                  maxAmmo: ammo?.maxAmmo,
                });
                this.pendingAircraftAttacks.delete(unit);
                this.queueScriptStep(instance, unit, script, actionIndex);
              }
            }
            findScenarioAircraftAirport(unit, preferred) {
              const live = (a) => !!a && a.isSpawned && !a.isDestroyed;
              if (live(preferred)) return preferred;
              const pref = unit.airportBoundTrait?.preferredAirport;
              if (live(pref)) return pref;
              const found = unit.airportBoundTrait?.findAvailableAirport?.(unit);
              return live(found) ? found : void 0;
            }
            continueAircraftPastUnavailableAirport(unit, info) {
              const { actionIndex, instance, script, target } = info;
              if (instance.stopped || !instance.units.has(unit) || unit.isDestroyed || !unit.isSpawned || this.pendingAircraftAttacks.get(unit) !== info) {
                this.pendingAircraftAttacks.delete(unit);
                return;
              }
              if (!target || target.isDestroyed || !target.isSpawned) {
                this.continueAircraftPastLostTarget(unit, info);
                return;
              }
              if (this.game.areFriendly(unit, target)) {
                this.pendingAircraftAttacks.delete(unit);
                if (!unit.unitOrderTrait.isIdle()) unit.unitOrderTrait.cancelAllTasks();
                this.queueScriptStep(instance, unit, script, actionIndex);
                return;
              }
              this.recordAircraftAttack({
                kind: "no-airport",
                tick: this.game.currentTick,
                unitId: unit.id,
                teamId: instance.definition.id,
                scriptId: script.id,
                actionIndex,
                targetId: target.id,
                targetName: target.name,
                ammo: unit.ammoTrait?.ammo,
                maxAmmo: unit.ammoTrait?.maxAmmo,
              });
              this.pendingAircraftAttacks.delete(unit);
              unit.unitOrderTrait.cancelAllTasks();
              this.queueScriptStep(instance, unit, script, actionIndex);
            }
            continueAircraftPastLostTarget(unit, info) {
              const { actionIndex, instance, script } = info;
              this.pendingAircraftAttacks.delete(unit);
              if (!unit.isDestroyed && unit.isSpawned && instance.units.has(unit)) {
                unit.unitOrderTrait.cancelAllTasks();
                this.queueScriptStep(instance, unit, script, actionIndex);
              }
            }
            recordAircraftAttack(entry) {
              this.aircraftAttackHistory.push(entry);
              if (this.aircraftAttackHistory.length > 128) this.aircraftAttackHistory.shift();
            }
            // ============ 驻守等待 ============
            runGuardAreaWaits(currentTick) {
              for (const [unit, wait] of [...this.guardAreaWaits]) {
                if (this.guardAreaWaits.get(unit) !== wait) continue;
                if (wait.instance.stopped || !wait.instance.units.has(unit) || unit.isDestroyed || !unit.isSpawned) {
                  this.guardAreaWaits.delete(unit);
                  continue;
                }
                if (currentTick < wait.deadlineTick) continue;
                const ready = [...this.guardAreaWaits]
                  .filter(([, w]) => w.instance === wait.instance && w.script === wait.script && w.index === wait.index)
                  .flatMap(([u, w]) => {
                    this.guardAreaWaits.delete(u);
                    return !w.instance.stopped && w.instance.units.has(u) && u.isSpawned && !u.isDestroyed ? [u] : [];
                  });
                for (const u of ready) {
                  u.resetGuardModeToIdle();
                  u.unitOrderTrait.cancelAllTasks();
                }
                for (const u of ready) this.queueScriptStep(wait.instance, u, wait.script, wait.index + 1);
              }
            }
            // ============ 对象销毁事件 ============
            handleObjectDestroyed(target) {
              for (const [unit, info] of [...this.pendingAircraftAttacks]) {
                if (unit === target) {
                  this.pendingAircraftAttacks.delete(unit);
                  continue;
                }
                if (info.target === target) {
                  this.continueAircraftPastLostTarget(unit, info);
                  continue;
                }
                if (info.airport !== target && unit.airportBoundTrait?.preferredAirport !== target) continue;
                const airport = this.findScenarioAircraftAirport(unit);
                if (!airport) {
                  this.continueAircraftPastUnavailableAirport(unit, info);
                  continue;
                }
                info.airport = airport;
                info.airportId = airport.id;
                info.airportName = airport.name;
                if (unit.airportBoundTrait) unit.airportBoundTrait.preferredAirport = airport;
              }
              if (this.isScenarioUnit(target)) {
                const unit = target;
                for (const inst of this.instances.values())
                  if (inst.units.has(unit))
                    for (const state of this.teamWideScriptStates.get(inst)?.values() ?? [])
                      if (state.dispatched.has(unit.id)) {
                        state.completed.add(unit.id);
                        this.advanceTeamWideScript(inst, state);
                      }
              }
            }
            // ============ Trait tick ============
            [n.NotifyTick.onTick](game) {
              this.runPendingRecruitments();
              this.runGuardAreaWaits(game.currentTick);
              this.runQuarryMissions();
              this.runHuntMissions();
              this.runPendingAircraftAttacks();
              this.runTeamWideScriptBarriers();
              for (const id of [...this.instances.keys()]) {
                const inst = this.instances.get(id);
                if (!inst) continue;
                if (inst.stopped) this.releaseInstance(id);
                else if (inst.scriptUnits.size === 0 && !this.hasPendingRecruitmentForInstance(id)) this.completeInstance(id);
              }
            }
            // ============ 调试 ============
            getDebugState() {
              return {
                activeTeams: [...this.instances.values()].map((t) => ({
                  id: t.id,
                  teamId: t.definition.id,
                  name: t.definition.id,
                  units: [...t.units].map((s) => s.name),
                  scriptUnits: [...t.scriptUnits].map((s) => ({ id: s.id, name: s.name, rx: s.tile?.rx, ry: s.tile?.ry })),
                })),
                huntingUnits: [...this.huntingUnits].filter((t) => t.isSpawned && !t.isDestroyed).map((t) => t.id),
                quarryMissions: [...this.quarryMissions.values()].map((t) => ({
                  instanceId: t.instance.id,
                  teamId: t.instance.definition?.id,
                  scriptId: t.script.id,
                  actionIndex: t.actionIndex,
                  actionType: t.actionType,
                  targetId: t.missionTarget?.id,
                  targetName: t.missionTarget?.name,
                  targetDestroyed: t.missionTarget?.isDestroyed,
                })),
                scriptTargets: [...this.scriptTargets].map(([k, v]) => ({ unitId: k, ...v })),
                scriptProgress: [...this.scriptProgress].map(([k, v]) => ({ unitId: k, ...v })),
              };
            }
          }),
        );
      },
    };
  },
);
