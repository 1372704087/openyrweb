/**
 * AiEngine — AIMD.INI 运行时引擎：评估触发器、管理队伍、执行脚本。
 *
 * 提供统一接口供各类 Bot 使用（CustomAiBot / IraqBot / ScenarioTeamBot 均可接入）。
 * 主循环 onTick：更新科技等级 →（可选）检查 AITrigger → 推进活跃队伍状态机
 * （recruiting → executing → done），并清理已完成队伍。
 *
 * 由 game/ai/AiEngine.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as GameApiModule from "game/api/index"; // 孪生（any-shim，未转换）
import * as AiData from "game/ai/AiData"; // 已转换

const Vector2 = (GameApiModule as any).Vector2;
const OrderType = (GameApiModule as any).OrderType;
const ObjectType = (GameApiModule as any).ObjectType;
const SpeedType = (GameApiModule as any).SpeedType;

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================
// 活跃队伍状态
// ============================================================

/** 运行中的小队实例（招募/执行状态机载体）。 */
export class ActiveTeam {
  /** TeamType 定义。 */
  teamType: any;
  /** 关联的 TaskForce。 */
  taskForce: any;
  /** 关联的 ScriptType。 */
  scriptType: any;
  /** 已招募的单位ID。 */
  unitIds: any[];
  /** 当前执行到脚本第几步。 */
  scriptIndex: any;
  /** recruiting / executing / done */
  state: any;
  recruitTicks: any;
  /** 集结点。 */
  rallyPoint: any;
  /** 攻击目标。 */
  attackTarget: any;
  createdAt: any;

  constructor(teamType: any) {
    this.teamType = teamType; // TeamType 定义
    this.taskForce = null; // 关联的 TaskForce
    this.scriptType = null; // 关联的 ScriptType
    this.unitIds = []; // 已招募的单位ID
    this.scriptIndex = 0; // 当前执行到脚本第几步
    this.state = "recruiting"; // recruiting / executing / done
    this.recruitTicks = 0;
    this.rallyPoint = null; // 集结点
    this.attackTarget = null; // 攻击目标
    this.createdAt = 0;
  }
}

// ============================================================
// AiEngine — 主引擎
// ============================================================

/** AIMD.INI 运行时引擎。 */
export class AiEngine {
  gameApi: any;
  actionsApi: any;
  playerName: any;
  options: any;
  /** {taskForces, scriptTypes, teamTypes, triggers, defenses, queues, …} */
  parsed: any;
  /** 活跃队伍列表。 */
  activeTeams: any[];
  lastTriggerCheck: any;
  /** 每60tick检查一次触发器（可用 options.triggerCooldown 覆盖）。 */
  triggerCooldown: any;
  techLevel: any;
  lastTechUpdate: any;
  /** 记录已触发的触发器（防重复）。 */
  triggerFired: any;
  totalTeamsCreated: any;

  constructor(gameApi: any, actionsApi: any, playerName: any, options: any) {
    this.gameApi = gameApi;
    this.actionsApi = actionsApi;
    this.playerName = playerName;
    this.options = options || {};
    this.parsed = null; // {taskForces, scriptTypes, teamTypes, triggers, defenses, queues}
    this.activeTeams = []; // 活跃队伍列表
    this.lastTriggerCheck = 0;
    this.triggerCooldown = this.options.triggerCooldown || 60; // 每60tick检查一次触发器
    this.techLevel = 1;
    this.lastTechUpdate = 0;
    this.triggerFired = {}; // 记录已触发的触发器（防重复）
    this.totalTeamsCreated = 0;
  }

  /** 初始化：传入 aiIni 或使用 gameApi.getAiIni()；失败时降级为空解析结果。 */
  init(aiIni?: any): void {
    if (!aiIni) {
      try {
        aiIni = this.gameApi.getAiIni();
      } catch (e: any) {
        console.warn("[AiEngine] No AI Ini available (" + (e && e.message) + ")");
      }
    }
    if (!aiIni) {
      // 无地图/aimd AI 数据时降级为空解析结果，避免 parsed=null 导致小队系统整体不可用
      console.warn("[AiEngine] AI Ini is undefined — AI teams will not be creatable.");
      this.parsed = {
        groupWeights: {},
        taskForces: {},
        scriptTypes: {},
        teamTypes: {},
        triggers: {},
        defenses: {},
        buildQueues: {},
      };
      return;
    }
    try {
      this.parsed = {
        groupWeights: AiData.parseGroupWeights(aiIni),
        taskForces: AiData.parseTaskForces(aiIni),
        scriptTypes: AiData.parseScriptTypes(aiIni),
        teamTypes: AiData.parseTeamTypes(aiIni),
        triggers: AiData.parseAITriggerTypes(aiIni),
        defenses: AiData.parseAIDefenseTypes(aiIni),
        buildQueues: AiData.parseBuildQueues(aiIni),
      };
      console.log(
        "[AiEngine] Loaded " +
          Object.keys(this.parsed.teamTypes).length +
          " team types, " +
          Object.keys(this.parsed.triggers).length +
          " triggers, " +
          Object.keys(this.parsed.taskForces).length +
          " task forces, " +
          Object.keys(this.parsed.scriptTypes).length +
          " scripts",
      );
    } catch (e: any) {
      console.warn("[AiEngine] AI Ini parse failed: " + ((e && e.message) || e));
      this.parsed = {
        groupWeights: {},
        taskForces: {},
        scriptTypes: {},
        teamTypes: {},
        triggers: {},
        defenses: {},
        buildQueues: {},
      };
    }
  }

  /** 主更新循环（每tick调用）。 */
  onTick(): void {
    if (!this.parsed) return;
    const tick = this.gameApi.getCurrentTick();

    this.updateTechLevel(tick);
    // 战役人类阵营的 ScenarioTeamBot 关闭自主 AITrigger 评估：
    // 只执行显式 CreateTeam 创建的小队，避免引擎自发征用玩家单位。
    if (this.options.evaluateTriggers !== false) this.checkTriggers(tick);
    this.updateTeams(tick);

    // 清理完成的队伍
    this.activeTeams = this.activeTeams.filter(function (t: any) {
      return t.state !== "done";
    });
  }

  /** 更新科技等级（约每 120 tick，按已有建筑名启发式推断 1-10）。 */
  updateTechLevel(tick: any): void {
    if (tick - this.lastTechUpdate < 120) return;
    this.lastTechUpdate = tick;
    try {
      const buildings = this.gameApi.getVisibleUnits(
        this.playerName,
        "self",
        function (r: any) {
          return r.type === ObjectType.Building;
        },
      );
      // 根据已有建筑推断科技等级
      const hasTech: any = {};
      let maxLv = 1;
      buildings.forEach(
        function (this: any, id: any) {
          const data = this.gameApi.getUnitData(id);
          if (data && data.name) hasTech[data.name] = true;
        }.bind(this),
      );
      // 科技等级映射（简化版）
      if (hasTech["NATECH"] || hasTech["GATECH"] || hasTech["YATECH"]) maxLv = 10;
      else if (hasTech["NAWEAP"] || hasTech["GAWEAP"] || hasTech["YAWEAP"]) maxLv = 5;
      else if (hasTech["NARADR"] || hasTech["GAAIRC"] || hasTech["NAPSIS"]) maxLv = 4;
      else if (hasTech["NAPOWR"] || hasTech["GAPOWR"] || hasTech["YAPOWR"]) maxLv = 3;
      this.techLevel = maxLv;
    } catch (_) {}
  }

  /** 按冷却周期评估全部 AITriggerType，满足条件则 fireTrigger。 */
  checkTriggers(tick: any): void {
    if (tick - this.lastTriggerCheck < this.triggerCooldown) return;
    this.lastTriggerCheck = tick;

    const triggers = this.parsed.triggers;
    const teamTypes = this.parsed.teamTypes;
    let selfUnits = 0;
    let enemyUnits = 0;
    let credits = 0;

    try {
      selfUnits = this.gameApi.getVisibleUnits(
        this.playerName,
        "self",
        function (r: any) {
          return r.isSelectableCombatant;
        },
      ).length;
      enemyUnits = this.gameApi.getVisibleUnits(
        this.playerName,
        "enemy",
        function (r: any) {
          return r.isSelectableCombatant;
        },
      ).length;
      credits = this.gameApi.getPlayerData(this.playerName).credits;
    } catch (_) {}

    const triggerKeys = Object.keys(triggers);
    for (let ti = 0; ti < triggerKeys.length; ti++) {
      const tr = triggers[triggerKeys[ti]];
      if (!tr) continue;

      // 科技等级检查
      if (tr.techLevel >= 0 && this.techLevel < tr.techLevel) continue;

      // 防重复触发
      const fireKey = tr.team1 + "|" + tr.team2;
      if (this.triggerFired[fireKey]) continue;

      // 检查条件
      let met = false;
      switch (tr.condition) {
        case 0: // 时间条件
          met = tick >= tr.value * 900; // value 单位是分钟
          break;
        case 1: {
          // 单位数
          const count = tr.owner === 1 ? enemyUnits : selfUnits;
          met =
            tr.comparison === 2
              ? count >= tr.value
              : tr.comparison === 0
                ? count <= tr.value
                : count === tr.value;
          break;
        }
        case 3: // 金钱
          met = tr.comparison === 2 ? credits >= tr.value : credits <= tr.value;
          break;
        default:
          met = tick > 300; // 默认：游戏开始一段时间后
      }

      if (met) {
        this.fireTrigger(tr, tick);
      }
    }
  }

  /** 触发触发器：按 maxExecuted 限制为 team1/team2 创建活跃小队并记防重。 */
  fireTrigger(trigger: any, tick: any): void {
    // 触发队伍
    const teamNames = [trigger.team1];
    if (trigger.team2) teamNames.push(trigger.team2);

    for (let ti = 0; ti < teamNames.length; ti++) {
      const tm = this.parsed.teamTypes[teamNames[ti]];
      if (!tm) continue;

      // 检查是否已达最大执行次数
      let activeCount = 0;
      for (let ai = 0; ai < this.activeTeams.length; ai++) {
        if (this.activeTeams[ai].teamType.name === tm.name) activeCount++;
      }
      if (activeCount >= tm.maxExecuted) continue;

      this.spawnTeam(tm, tick);
    }

    this.triggerFired[trigger.team1 + "|" + trigger.team2] = true;
  }

  /** 创建队伍（进入 recruiting；TaskForce 无效则直接 done）。 */
  spawnTeam(teamType: any, tick: any): void {
    const at = new ActiveTeam(teamType);
    at.taskForce = this.parsed.taskForces[teamType.taskForce] || null;
    at.scriptType = this.parsed.scriptTypes[teamType.scriptType] || null;

    if (!at.taskForce || at.taskForce.groups.length === 0) {
      at.state = "done";
      return;
    }

    at.createdAt = tick;
    this.activeTeams.push(at);
    this.totalTeamsCreated++;
    console.log(
      "[AiEngine] Spawn team " + teamType.name + " (TF=" + teamType.taskForce + ")",
    );
  }

  /**
   * 战役援军/CreateReinforcement 专用 — 用已经直接生成的单位建立小队。
   * 与 spawnTeam 的区别：不经过招募阶段，单位已经由触发器创建并放置在地图上。
   */
  spawnTeamWithUnits(teamType: any, tick: any, unitIds: any): any {
    const at = new ActiveTeam(teamType);
    at.taskForce = this.parsed.taskForces[teamType.taskForce] || null;
    at.scriptType = this.parsed.scriptTypes[teamType.scriptType] || null;
    at.unitIds = Array.isArray(unitIds) ? unitIds.slice() : [];
    at.createdAt = tick;
    this.activeTeams.push(at);
    this.totalTeamsCreated++;
    if (at.taskForce && at.scriptType && at.unitIds.length) {
      at.state = "executing";
      at.scriptIndex = 0;
      this.setRallyPoint(at);
    } else if (!at.taskForce || at.taskForce.groups.length === 0 || !at.unitIds.length) {
      at.state = "done";
    } else {
      at.state = "executing";
      at.scriptIndex = 0;
      this.setRallyPoint(at);
    }
    console.log(
      "[AiEngine] Spawn reinforcement team " +
        teamType.name +
        " (TF=" +
        teamType.taskForce +
        ", units=" +
        at.unitIds.length +
        ")",
    );
    return at;
  }

  /**
   * DestroyTeam 动作 — 将同名活跃小队标记为完成并停止脚本推进。
   * 单位本身保留在地图上（原版 DestroyTeam 只解散小队/回收脚本控制）。
   * @returns 被标记 done 的实例数
   */
  destroyTeam(teamName: any): any {
    if (!teamName) return 0;
    const lower = String(teamName).toLowerCase();
    let count = 0;
    for (let i = this.activeTeams.length - 1; i >= 0; i--) {
      const t = this.activeTeams[i];
      if (!t || t.state === "done") continue;
      const name = (t.teamType && t.teamType.name) || "";
      if (name.toLowerCase() === lower) {
        t.state = "done";
        count++;
      }
    }
    if (count)
      console.log(
        "[AiEngine] Destroyed team " + teamName + " (" + count + " active instance(s))",
      );
    return count;
  }

  /** 更新所有活跃队伍（按 state 分发）。 */
  updateTeams(tick: any): void {
    for (let ti = 0; ti < this.activeTeams.length; ti++) {
      const team = this.activeTeams[ti];
      if (team.state === "done") continue;

      switch (team.state) {
        case "recruiting":
          this.updateRecruiting(team, tick);
          break;
        case "executing":
          this.updateExecuting(team, tick);
          break;
      }
    }
  }

  /** 招募阶段：收集需要的单位；超时或齐装后转入 executing/done。 */
  updateRecruiting(team: any, tick: any): void {
    team.recruitTicks++;

    // 超时放弃招募
    if (team.recruitTicks > 300) {
      if (team.unitIds.length > 0) {
        team.state = "executing";
        team.scriptIndex = 0;
      } else {
        team.state = "done";
      }
      return;
    }

    if (!team.taskForce) {
      team.state = "done";
      return;
    }

    // 检查是否已招募足够单位
    const needed: any[] = [];
    for (let gi = 0; gi < team.taskForce.groups.length; gi++) {
      const group = team.taskForce.groups[gi];
      let haveCount = 0;
      for (let ui = 0; ui < team.unitIds.length; ui++) {
        try {
          const ud = this.gameApi.getUnitData(team.unitIds[ui]);
          if (ud && ud.name === group.unitType) haveCount++;
        } catch (_) {}
      }
      if (haveCount < group.count) {
        needed.push({ unitType: group.unitType, count: group.count - haveCount });
      }
    }

    if (needed.length === 0) {
      // 招募完毕，开始执行
      team.state = "executing";
      team.scriptIndex = 0;
      this.setRallyPoint(team);
      console.log(
        "[AiEngine] Team " +
          team.teamType.name +
          " fully recruited (" +
          team.unitIds.length +
          " units)",
      );
      return;
    }

    // 从空闲单位中招募
    if (tick % 30 === 0) {
      for (let ni = 0; ni < needed.length; ni++) {
        const need = needed[ni];
        const freeUnits = this.findFreeUnits(need.unitType);
        for (let fi = 0; fi < freeUnits.length && team.unitIds.length < 30; fi++) {
          if (team.unitIds.indexOf(freeUnits[fi]) < 0) {
            team.unitIds.push(freeUnits[fi]);
            if (
              team.unitIds
                .filter(
                  function (this: any, uid: any) {
                    try {
                      const u = this.gameApi.getUnitData(uid);
                      return u && u.name === need.unitType;
                    } catch (_) {
                      return false;
                    }
                  }.bind(this),
                ).length >= need.count
            )
              break;
          }
        }
      }
    }
  }

  /** 寻找空闲单位（己方可选战斗单位且类型名匹配）。 */
  findFreeUnits(unitType: any): any[] {
    try {
      const allUnits = this.gameApi.getVisibleUnits(
        this.playerName,
        "self",
        function (r: any) {
          return r.isSelectableCombatant && r.name === unitType;
        },
      );
      return allUnits || [];
    } catch (_) {
      return [];
    }
  }

  /** 设置集结点（出生点 +5,+5）。 */
  setRallyPoint(team: any): void {
    try {
      const playerData = this.gameApi.getPlayerData(this.playerName);
      team.rallyPoint = new Vector2(
        playerData.startLocation.x + 5,
        playerData.startLocation.y + 5,
      );
    } catch (_) {}
  }

  /** 选择攻击目标（第一个可见敌人 tile；否则回落集结点）。 */
  pickTarget(team: any): any {
    try {
      const enemyUnits = this.gameApi.getVisibleUnits(
        this.playerName,
        "enemy",
        function (r: any) {
          return r.isSelectableCombatant || r.type === ObjectType.Building;
        },
      );
      if (enemyUnits.length > 0) {
        // 选第一个可见敌人
        const targetData = this.gameApi.getUnitData(enemyUnits[0]);
        if (targetData) {
          return new Vector2(targetData.tile.rx, targetData.tile.ry);
        }
      }
    } catch (_) {}
    return team.rallyPoint;
  }

  /** 执行阶段：每 30 tick 推进一步脚本。 */
  updateExecuting(team: any, tick: any): void {
    if (!team.scriptType || team.unitIds.length === 0) {
      team.state = "done";
      return;
    }

    // 每30tick执行一步脚本
    if (tick % 30 !== 0) return;

    const actions = team.scriptType.actions;
    if (team.scriptIndex >= actions.length) {
      team.state = "done";
      return;
    }

    const action = actions[team.scriptIndex];
    if (!action) {
      team.scriptIndex++;
      return;
    }

    const result = this.executeAction(team, action, tick);
    if (result === "done") team.state = "done";
    else if (result !== "jump") team.scriptIndex++;
  }

  /** 路点 → 瓦片坐标（MapApi.getTileAtWaypoint）。 */
  getWaypointTile(wp: any): any {
    try {
      const tile = this.gameApi.mapApi.getTileAtWaypoint(wp);
      return tile ? { x: tile.rx, y: tile.ry } : void 0;
    } catch (_) {
      return void 0;
    }
  }

  /** 攻击最近可见敌人（Attack 回退/攻击建筑用）。 */
  pickAndAttack(team: any): void {
    let target = team.attackTarget;
    if (!target) {
      target = this.pickTarget(team);
      team.attackTarget = target;
    }
    if (target) this.orderUnits(team.unitIds, OrderType.AttackMove, target.x, target.y);
  }

  /**
   * 在路点格查找攻击目标（含中立/民用目标，如自由女神像——参考临时源码 queueAttackWaypoint）。
   */
  findWaypointAttackTarget(rx: any, ry: any): any {
    try {
      const ids = this.gameApi.getAllUnits();
      for (var id of ids) {
        const d = this.gameApi.getGameObjectData(id);
        if (!d || !d.tile) continue;
        if (Number.isFinite(d.hitPoints) && d.hitPoints <= 0) continue;
        // 参考临时源码：不可作为合法目标的对象不参与路点攻击
        if (d.rules && d.rules.legalTarget === false) continue;
        const f = d.foundation || { width: 1, height: 1 };
        const covered =
          rx >= d.tile.rx &&
          rx < d.tile.rx + (f.width || 1) &&
          ry >= d.tile.ry &&
          ry < d.tile.ry + (f.height || 1);
        if (covered) return { id: id, name: d.name, owner: d.owner };
      }
    } catch (_) {}
    return void 0;
  }

  /** 命令单位攻击指定对象（经 actionsApi，按 5 个一批入队）。 */
  orderUnitsTarget(unitIds: any, order: any, targetId: any): void {
    if (!unitIds || !unitIds.length || !targetId) return;
    const batchSize = 5;
    for (let i = 0; i < unitIds.length; i += batchSize) {
      try {
        this.actionsApi.orderUnits(unitIds.slice(i, i + batchSize), order, targetId);
      } catch (_) {}
    }
  }

  /**
   * 执行单个脚本动作（YR ScriptType 动作码，参考临时源码 Tt 枚举）。
   * @returns "done" 结束脚本 / "jump" 表示 scriptIndex 已被改写 / 其它正常推进
   */
  executeAction(team: any, action: any, tick: any): any {
    try {
      const p = action.target; // 第二字段：路点编号/参数
      switch (action.action) {
        case 0: // Attack — 攻击最近可见敌人
          this.pickAndAttack(team);
          break;
        case 1: {
          // AttackWaypoint — 攻击指定路点（优先直接攻击路点格上的对象，含中立目标）
          // 参考临时源码 queueAttackWaypoint：对路点目标使用 force attack，
          // 否则普通 Attack 可能因目标是中立/民用（如自由女神像）而拒绝开火。
          const wp1 = this.getWaypointTile(p);
          if (wp1) {
            const tgt1 = this.findWaypointAttackTarget(wp1.x, wp1.y);
            if (tgt1) this.orderUnitsTarget(team.unitIds, OrderType.ForceAttack, tgt1.id);
            else this.orderUnits(team.unitIds, OrderType.ForceAttack, wp1.x, wp1.y);
            // 登记攻击目标标记（GUI 层渲染脉冲光环，方便玩家看到指定攻击目标）
            try {
              this.gameApi.addAttackTargetMarker(
                wp1.x,
                wp1.y,
                team.teamType ? team.teamType.name : "",
              );
            } catch (_) {}
          } else this.pickAndAttack(team);
          break;
        }
        case 2: // GoBerserk
        case 13: // IdleAnimation
        case 19: // Panic
        case 21: // Scatter
        case 22: // MoveToShroud
        case 42: // ForceFacing
          break;
        case 3: // MoveToWaypoint
        case 16: {
          // PatrolToWaypoint
          const wp3 = this.getWaypointTile(p);
          if (wp3) this.orderUnits(team.unitIds, OrderType.Move, wp3.x, wp3.y);
          break;
        }
        case 4: {
          // MoveToCell — 参数为路点/坐标，简化按路点处理
          const wp4 = this.getWaypointTile(p);
          if (wp4) this.orderUnits(team.unitIds, OrderType.Move, wp4.x, wp4.y);
          break;
        }
        case 5: // GuardArea — 守卫当前区域
          this.orderUnits(team.unitIds, OrderType.Guard);
          break;
        case 6: // JumpToLine — 跳转到指定脚本行（1-based）
          team.scriptIndex = Math.max(0, p - 1);
          return "jump";
        case 8: // Unload
          this.orderUnits(team.unitIds, OrderType.UnloadAll);
          break;
        case 9: // Deploy
          this.orderUnits(team.unitIds, OrderType.DeploySelected);
          break;
        case 10: // FollowFriendlies
        case 11: // AssignMission
        case 14: // LoadOntoTransport
        case 15: // SpyOnBuildingAtWaypoint
        case 20: // ChangeHouse
        case 43: // WaitUntilFullyLoaded
          break;
        case 17: {
          // ChangeScript — 切换到另一脚本（按 ScriptTypes 序号）
          const scs = this.parsed.scriptTypes;
          for (const sk in scs) {
            if (scs[sk].index === p) {
              team.scriptType = scs[sk];
              team.scriptIndex = 0;
              return "jump";
            }
          }
          break;
        }
        case 46: // AttackEnemyBuilding
          this.pickAndAttack(team);
          break;
        case 47: // MoveToEnemyBuilding
        case 48: // Scout
          this.pickAndAttack(team);
          break;
        case 49: // Success — 脚本成功完成
          return "done";
        case 54: {
          // GatherAtBase
          try {
            const pd = this.gameApi.getPlayerData(this.playerName);
            this.orderUnits(
              team.unitIds,
              OrderType.Move,
              pd.startLocation.x,
              pd.startLocation.y,
            );
          } catch (_) {}
          break;
        }
      }
    } catch (_) {}
  }

  /** 命令单位（经 actionsApi 入队，按 5 个一批；可选 x,y）。 */
  orderUnits(unitIds: any, order: any, x?: any, y?: any): void {
    if (!unitIds || unitIds.length === 0) return;
    // 分批发送命令（最多5个单位一组）
    const batchSize = 5;
    for (let i = 0; i < unitIds.length; i += batchSize) {
      const batch = unitIds.slice(i, i + batchSize);
      try {
        if (x !== undefined && y !== undefined) {
          this.actionsApi.orderUnits(batch, order, void 0, x, y);
        } else {
          this.actionsApi.orderUnits(batch, order);
        }
      } catch (_) {}
    }
  }

  // ============================================================
  // 对外接口
  // ============================================================

  /** 获取当前科技等级。 */
  getTechLevel(): any {
    return this.techLevel;
  }

  /** 获取活跃队伍信息（供外部Bot决策）。 */
  getActiveTeamInfo(): any[] {
    return this.activeTeams
      .filter(function (t: any) {
        return t.state !== "done";
      })
      .map(function (t: any) {
        return {
          name: t.teamType.name,
          state: t.state,
          unitCount: t.unitIds.length,
          scriptIndex: t.scriptIndex,
          priority: t.teamType.priority,
        };
      });
  }

  /** 获取当前应建造的单位列表（按科技等级匹配 BuildQueueN，否则 __default__）。 */
  getBuildQueue(): any[] {
    if (!this.parsed || !this.parsed.buildQueues) return [];
    const queues = this.parsed.buildQueues;
    const tl = this.techLevel;
    // 按科技等级查找最匹配的队列
    let bestKey: any = null;
    let bestMatch = -1;
    const keys = Object.keys(queues);
    for (let ki = 0; ki < keys.length; ki++) {
      // 尝试从键名提取科技等级（如 "BuildQueue3" → 3）
      const match = keys[ki].match(/(\d+)/);
      if (match) {
        const lv = parseInt(match[1]);
        if (lv <= tl && lv > bestMatch) {
          bestMatch = lv;
          bestKey = keys[ki];
        }
      }
    }
    if (bestKey && queues[bestKey]) return queues[bestKey];
    // 回退到默认队列
    return queues["__default__"] || [];
  }

  /** 重置所有触发器状态（用于新游戏开始）。 */
  reset(): void {
    this.activeTeams = [];
    this.triggerFired = {};
    this.totalTeamsCreated = 0;
    this.techLevel = 1;
    this.lastTriggerCheck = 0;
  }
}

void SpeedType;
