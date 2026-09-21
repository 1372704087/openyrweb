/**
 * MoveTask — 移动任务（寻路/走点/避障/碰撞/推挤的核心状态机）。
 *
 * 单位"移动到某格"指令的完整实现，内部是三态循环：
 *  - ReachedNextWaypoint（到达途经点）：从 path 里清掉已走到的节点，
 *    选下一个途经点并让移动器（locomotor）初始化；到达最终目的地时
 *    调 canStopAtTile 判断能否停下（不能就找就近可停落点重新规划）；
 *  - PlanMove（规划中）：逐节点检查剩余路径——桥被毁/被挡/有箱子/
 *    有静态障碍都会触发重规划（needsPathUpdate）；对可碾压单位按
 *    原版碾压规则直接碾过去，对挡路的单位依次尝试绕行（局部寻路）、
 *    开火清除、等待让路、请求它 MoveAside 让开；
 *  - Moving（移动中）：调 locomotor.tick 得到本 tick 位移并应用
 *    （含高度变化/瞬移），tile 变化时广播 handleTileChange。
 *
 * 寻路分三类：飞行单位直飞两点路径（computeAirPath）；ignoresTerrain
 * 的移动器用径向搜索直达（computeDirectJumpPath）；常规地面单位走
 * A*（terrain.computePath，含伪装敌人反制/码头建筑特殊处理）。
 *
 * 常量：HEAD_ON_SPEED_FACTOR=1.5（对冲速度比）、PLAN_TIMEOUT_TICKS=200
 * （规划超时→强制把所有障碍视为阻断重规划）、BLOCKED_WAIT_TICKS=40
 * （让路等待步长）、MAX_UNREACHABLE_TARGETS=5（放弃前最多尝试迁就点数）。
 *
 * 由 game/gameobject/task/move/MoveTask.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { Task } from "game/gameobject/task/system/Task"; // 已转换
import { Infantry } from "game/gameobject/Infantry"; // 已转换
import { MovementZone } from "game/type/MovementZone"; // 已转换
import * as arrayModule from "util/array"; // 未转换（any-shim）
import { SpeedType } from "game/type/SpeedType"; // 已转换
import { MoveState, MoveResult, CollisionState } from "game/gameobject/trait/MoveTrait"; // 已转换
import { WaitTicksTask } from "game/gameobject/task/system/WaitTicksTask"; // 已转换
import * as MoveAsideTaskModule from "game/gameobject/task/move/MoveAsideTask"; // 未转换（any-shim）
import * as MovePositionHelperModule from "game/gameobject/unit/MovePositionHelper"; // 未转换（any-shim）
import { RadialTileFinder } from "game/map/tileFinder/RadialTileFinder"; // 已转换
import * as RangeHelperModule from "game/gameobject/unit/RangeHelper"; // 未转换（any-shim）
import * as LoggerModule from "util/Logger"; // 未转换（any-shim）
import { Coords } from "game/Coords"; // 已转换
import { TaskStatus } from "game/gameobject/task/system/TaskStatus"; // 已转换
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import { LocomotorFactory } from "game/gameobject/locomotor/LocomotorFactory"; // 已转换
import * as RandomTileFinderModule from "game/map/tileFinder/RandomTileFinder"; // 未转换（any-shim）
import * as ObjectTeleportEventModule from "game/event/ObjectTeleportEvent"; // 未转换（any-shim）
import * as NotifyTeleportModule from "game/gameobject/trait/interface/NotifyTeleport"; // 已转换
import * as PowerupTypeModule from "game/type/PowerupType"; // 未转换（any-shim）
import { ScatterTask } from "game/gameobject/task/ScatterTask"; // 已转换
import { VeteranAbility } from "game/gameobject/unit/VeteranAbility"; // 已转换
import { Vector2 } from "game/math/Vector2"; // 已转换
import { LocomotorType } from "game/type/LocomotorType"; // 已转换

/** 对冲速度比：双方相向而行且对方速度 ×1.5 仍小于己方速度时视为可推过。 */
const HEAD_ON_SPEED_FACTOR = 1.5;
/** 规划超时（tick 数）：超过后强制"所有障碍都按阻断处理"重新寻路。 */
const PLAN_TIMEOUT_TICKS = 200;
/** 避障等待步长（tick 数）：让路/绕行失败时挂 WaitTicksTask 的时长。 */
const BLOCKED_WAIT_TICKS = 40;
/** 放弃前最多记录的"不可达目标"数量（超过直接 Fail）。 */
const MAX_UNREACHABLE_TARGETS = 5;

/* eslint-disable @typescript-eslint/no-explicit-any */
export class MoveTask extends Task {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值，TS 的字段
  // 初始化器会被提升到 super() 之后立刻执行，改变 Object.keys() 顺序。
  game: any;
  /** 目标 tile（任务 constructor 参数）。 */
  targetTile: any;
  /** 目标是否在桥上（配合 targetTile 精确到桥面）。 */
  toBridge: any;
  /** 移动选项（forceMove/ignoredBlockers/closeEnoughTiles/strictCloseEnough 等）。 */
  options: any;
  preventOpportunityFire: boolean;
  logger: any;
  /** 最终目的地的 lepton 坐标（tile 中心 + targetOffset）。 */
  destinationLeptons: Vector2;
  /** 当前途经点的 lepton 坐标（喂给 locomotor.tick 的第 2 参）。 */
  currentWaypointLeptons: Vector2;
  /** 下一 tick 需要重新寻路（由 updateTarget/避障失败置位）。 */
  needsPathUpdate: boolean;
  /** 重规划时把所有障碍都按阻断处理（多次被挡后的兜底模式）。 */
  allObstaclesAreBlockers: boolean;
  /** 寻路时视为阻断的 {node, obj} 列表（历史被挡记录）。 */
  blockedPathNodes: any[];
  /** 不可达目标记录（findRelocationTile 反复失败时累计）。 */
  unreachableTargets: any[];
  pushTried: boolean;
  /** 取消流程已处理过迁就点（防止取消时死循环重定位）。 */
  cancelProcessed: boolean;
  /** 取消后还要先挪到可停位置（cancelRepositionPending 期间不视为完成）。 */
  cancelRepositionPending: boolean;
  /** 调试用目标路径线配置（{pathNodes, isRecalc}）。 */
  targetLinesConfig: any;
  /** tile 内的落点偏移（步兵 subcell / 载具 subcell 偏移）。 */
  targetOffset: any;
  /** 剩余路径节点（[最终目的地, …, 下一步] 顺序，末端是最近的一步）。 */
  path: any;
  /** 地面路径预案（取消重定位时预计算的路径，onStart 时复用）。 */
  groundPathPlan: any;
  /** updateTarget 缓存的目标变更请求（下一 tick 的 needsPathUpdate 消费）。 */
  targetChangeRequested: any;
  /** 已在 PlanMove 状态停留的 tick 数（超时强制重规划）。 */
  inPlanningForTicks: number;

  constructor(game: any, targetTile: any, toBridge: any, options?: any) {
    super();
    this.game = game;
    this.targetTile = targetTile;
    this.toBridge = toBridge;
    this.options = options;
    this.preventOpportunityFire = false;
    this.logger = LoggerModule.AppLogger.get("move");
    this.destinationLeptons = new Vector2();
    this.currentWaypointLeptons = new Vector2();
    this.needsPathUpdate = false;
    this.allObstaclesAreBlockers = false;
    this.blockedPathNodes = [];
    this.unreachableTargets = [];
    this.pushTried = false;
    this.cancelProcessed = false;
    this.cancelRepositionPending = false;
    this.targetLinesConfig = { pathNodes: [] };
  }

  /** 复制任务（攻击移动等需要同参数多份任务时用）。 */
  duplicate(): MoveTask {
    return new MoveTask(this.game, this.targetTile, this.toBridge, this.options);
  }

  /** 强制移动开关（forceMove：无视可停性直接开过去，如气球悬浮强停）。 */
  setForceMove(force: any): void {
    if (force) {
      this.options ?? (this.options = {});
      this.options.forceMove = true;
    } else if (this.options?.forceMove) {
      this.options.forceMove = undefined;
    }
  }

  /**
   * 任务启动：
   *  - 禁止嵌套移动任务（currentWaypoint 还挂着说明上一个没走完）；
   *  - 首次运行时给单位创建移动器（locomotor）；
   *  - 复用上次移动残留的落点偏移/速度（forceCancel 保留的现场）；
   *  - 没有现成路径时：有地面路径预案且预案终点还是当前 tile → 直接用
   *    预案，否则现场寻路；
   *  - 算出目的地 lepton 坐标，进入 ReachedNextWaypoint 状态。
   */
  onStart(object: any): void {
    if (object.moveTrait.currentWaypoint) throw new Error("Nested move tasks are not supported");
    if (object.moveTrait.locomotor === undefined) {
      object.moveTrait.locomotor = new LocomotorFactory(this.game).create(object);
    }
    if (object.moveTrait.lastTargetOffset) {
      this.targetOffset = object.moveTrait.lastTargetOffset;
    } else {
      this.targetOffset = this.computeTargetOffset(object);
    }
    if (object.moveTrait.lastVelocity) object.moveTrait.velocity = object.moveTrait.lastVelocity;
    if (!this.path) {
      if (this.groundPathPlan) {
        if (this.groundPathPlan.path[this.groundPathPlan.path.length - 1].tile === object.tile) {
          this.path = this.applyGroundPathPlan(this.groundPathPlan);
        } else {
          this.computePath(object, object.moveTrait.locomotor);
        }
        this.groundPathPlan = undefined;
      } else {
        this.computePath(object, object.moveTrait.locomotor);
      }
      this.targetLinesConfig.isRecalc = false;
    }
    this.updateDestination(this.path, this.targetOffset);
    object.moveTrait.moveState = MoveState.ReachedNextWaypoint;
    object.moveTrait.lastMoveResult = undefined;
    object.moveTrait.lastTargetOffset = undefined;
    object.moveTrait.lastVelocity = undefined;
  }

  /**
   * 计算落点偏移：优先用调用方指定的 options.targetOffset；
   * 步兵取当前 subcell 偏移，载具取 subcell 0 的偏移。
   */
  computeTargetOffset(object: any): any {
    return (
      this.options?.targetOffset ??
      (object.isInfantry() ? object.position.getTileOffset() : object.position.computeSubCellOffset(0))
    );
  }

  /**
   * 寻路总入口，返回是否成功（false 仅在 onlyIfPathExists 且地面寻路
   * 失败时出现——用于"能走到才改变目标"的场景）。
   *  - 目标越界且未允许越界目标 → 空路径；
   *  - 飞行单位 → 两点直线路径；
   *  - ignoresTerrain 移动器（瞬移/跳跃）→ 径向搜索直达路径；
   *  - 常规 → A* 地面寻路并 applyGroundPathPlan 落库。
   * 同时刷新 targetLinesConfig.pathNodes 供调试画线（飞行单位额外把
   * 首节点的 onBridge 按目标桥面修正）。
   */
  computePath(object: any, locomotor: any, onlyIfPathExists = false): boolean {
    let path: any;
    if (this.options?.allowOutOfBoundsTarget || this.game.map.mapBounds.isWithinBounds(this.targetTile)) {
      if (object.rules.movementZone === MovementZone.Fly) {
        path = this.computeAirPath(object);
      } else if (locomotor.ignoresTerrain) {
        path = this.computeDirectJumpPath(object);
      } else {
        const plan = this.computeGroundPath(object);
        if (onlyIfPathExists && !plan.path.length) return false;
        path = this.applyGroundPathPlan(plan);
      }
    } else {
      path = [];
    }
    if (object.rules.movementZone === MovementZone.Fly) {
      this.targetLinesConfig.pathNodes = path.map(({ tile, onBridge }: any) => ({ tile, onBridge }));
      if (path.length) {
        this.targetLinesConfig.pathNodes[0].onBridge = this.toBridge
          ? this.game.map.tileOccupation.getBridgeOnTile(this.targetTile)
          : undefined;
      }
    } else {
      this.targetLinesConfig.pathNodes = path;
    }
    this.path = path;
    return true;
  }

  /** 飞行单位路径：目标点 + 当前点两个节点（直飞，不绕地形）。 */
  computeAirPath(object: any): any[] {
    return [
      { tile: this.targetTile, onBridge: undefined },
      { tile: object.tile, onBridge: undefined },
    ];
  }

  /**
   * ignoresTerrain 移动器（如铁幕装置内的瞬移单位）的直达路径：
   * 从目标 tile 径向搜索一个可通行且无（未忽略）障碍的落点——
   * 因为这类移动器可以无视中途地形，只需要一个能停下的终点。
   * 找不到 → 空路径。
   */
  computeDirectJumpPath(object: any): any[] {
    const map = this.game.map;
    const currentBridge = object.onBridge ? map.tileOccupation.getBridgeOnTile(object.tile) : undefined;
    let target = this.targetTile;
    let targetBridge = this.toBridge ? map.tileOccupation.getBridgeOnTile(this.targetTile) : undefined;
    const ignoredBlockers = this.options?.ignoredBlockers;
    const found = new RadialTileFinder(
      map.tiles,
      map.mapBounds,
      target,
      { width: 1, height: 1 },
      0,
      5,
      (tile: any) =>
        0 < map.terrain.getPassableSpeed(tile, object.rules.speedType, object.isInfantry(), !!tile.onBridgeLandType, ignoredBlockers) &&
        !map.terrain
          .findObstacles({ tile, onBridge: !!tile.onBridgeLandType }, object)
          .find((obstacle: any) => !ignoredBlockers?.includes(obstacle.obj)),
    ).getNextTile();
    if (!found) return [];
    if (found !== target) {
      target = found;
      targetBridge = map.tileOccupation.getBridgeOnTile(target);
    }
    return [
      { tile: target, onBridge: targetBridge },
      { tile: object.tile, onBridge: currentBridge },
    ];
  }

  /**
   * A* 地面寻路（薄封装，返回 {path, ignoredBlockers, blockedPathNodes} 预案）：
   *  1. 起点选当前 tile；移动中且有当前途经点时改用途经点 tile
   *     （避免从身后重新规划）；
   *  2. 起点上有挡路建筑且不可通行 → 把它加入 ignoredBlockers
   *     （允许踩过去）；若它带码头，把非码头部分标记为阻断节点；
   *  3. 目标格上有带地形伪装的敌军步兵/载具（己方无法看穿）→
   *     把目标格标记为阻断节点（别撞上去）；
   *  4. 调 terrain.computePath：多次被挡（allObstaclesAreBlockers）时
   *     限制扩展节点数并强制排除阻断格；默认 bestEffort（走不到
   *     目标就给最近点），strictCloseEnough 才严格要求到达。
   */
  computeGroundPath(object: any): any {
    let startTile = object.tile;
    let startBridge = object.onBridge ? this.game.map.tileOccupation.getBridgeOnTile(startTile) : undefined;
    if (object.moveTrait.moveState === MoveState.Moving && object.moveTrait.currentWaypoint) {
      startTile = object.moveTrait.currentWaypoint.tile;
      startBridge = object.moveTrait.currentWaypoint.onBridge;
    }
    const plan = { path: [], ignoredBlockers: [], blockedPathNodes: [] };
    // 起点上的挡路建筑特殊处理。
    const startBuilding = this.game.map.getObjectsOnTile(startTile).find((obj: any) => obj.isBuilding());
    if (
      startBuilding &&
      !this.game.map.terrain.getPassableSpeed(startTile, object.rules.speedType, object.isInfantry(), false, undefined, undefined, undefined, object)
    ) {
      const alreadyIgnored = this.options?.ignoredBlockers?.includes(startBuilding);
      if (!alreadyIgnored) plan.ignoredBlockers.push(startBuilding);
      if (!alreadyIgnored && startBuilding.dockTrait) {
        // 带码头的建筑：只有码头格可以停，其余格子标记为阻断。
        const dockTiles = new Set(startBuilding.dockTrait?.getAllDockTiles());
        const buildingTiles = this.game.map.tileOccupation.calculateTilesForGameObject(startBuilding.tile, startBuilding);
        buildingTiles
          .filter((tile: any) => !dockTiles.has(tile))
          .forEach((tile: any) => plan.blockedPathNodes.push({ node: { tile, onBridge: undefined }, obj: startBuilding }));
      }
    }
    // 目标格上伪装的敌军（共享情报或被反伪装单位识破的除外）。
    const disguised = this.game.map
      .getGroundObjectsOnTile(this.targetTile)
      .find(
        (obj: any) =>
          (obj.isInfantry() || obj.isVehicle()) &&
          obj.disguiseTrait?.hasTerrainDisguise() &&
          !(
            this.game.alliances.haveSharedIntel(object.owner, obj.owner) || obj.owner.sharedDetectDisguiseTrait?.has(object)
          ),
      );
    if (disguised) {
      const targetBridge = this.toBridge ? this.game.map.tileOccupation.getBridgeOnTile(this.targetTile) : undefined;
      plan.blockedPathNodes.push({ node: { tile: this.targetTile, onBridge: targetBridge }, obj: disguised });
    }
    const ignoredBlockers = [...new Set([...(this.options?.ignoredBlockers ?? []), ...plan.ignoredBlockers])];
    const blockedNodes = [...this.blockedPathNodes, ...plan.blockedPathNodes];
    const path = this.game.map.terrain.computePath(
      object.rules.speedType,
      object.isInfantry(),
      startTile,
      !!startBridge,
      this.targetTile,
      this.toBridge,
      {
        maxExpandedNodes: this.allObstaclesAreBlockers
          ? Math.min(300, this.options?.maxExpandedPathNodes ?? Number.POSITIVE_INFINITY)
          : this.options?.maxExpandedPathNodes,
        bestEffort: !this.options?.strictCloseEnough,
        ignoredBlockers: [...new Set([...ignoredBlockers, ...(this.options?.pathFinderIgnoredBlockers ?? [])])],
        excludeTiles:
          this.allObstaclesAreBlockers || blockedNodes.length
            ? (node: any) => this.nodeIsBlockedForPathfinding(node, object, ignoredBlockers, blockedNodes)
            : undefined,
        // 把移动者传给寻路器，让 OmniCrusher（战斗要塞）可以
        // 穿过它能碾压的载具寻路，与原版 YR 一致。
        mover: object,
      },
    );
    plan.path = path;
    return plan;
  }

  /** 寻路排除判定：allObstaclesAreBlockers 模式下有任何未忽略障碍即阻断；否则按历史阻断记录匹配。 */
  nodeIsBlockedForPathfinding(node: any, object: any, ignoredBlockers: any, blockedNodes: any[]): boolean {
    if (this.allObstaclesAreBlockers) {
      return !!this.game.map.terrain.findObstacles(node, object).find((obstacle: any) => !ignoredBlockers?.includes(obstacle.obj));
    }
    return !!blockedNodes.find(({ node: blockedNode }: any) => blockedNode.tile === node.tile && blockedNode.onBridge === node.onBridge);
  }

  /**
   * 应用地面路径预案：清理失效的历史阻断记录（对象已死或已挪走），
   * 把预案新增的 ignoredBlockers 合并进 options，阻断记录并入本任务，
   * 返回预案路径。
   */
  applyGroundPathPlan(plan: any): any {
    this.blockedPathNodes = this.blockedPathNodes.filter((entry: any) => entry.obj.isSpawned && entry.node.tile === entry.obj.tile);
    if (plan.ignoredBlockers.length) {
      this.options ?? (this.options = {});
      this.options.ignoredBlockers ?? (this.options.ignoredBlockers = []);
      this.options.ignoredBlockers.push(...plan.ignoredBlockers);
    }
    this.blockedPathNodes.push(...plan.blockedPathNodes);
    return plan.path;
  }

  /** 刷新目的地 lepton 坐标：路径首节点（= 最终目的地）的 tile 中心 + 落点偏移。 */
  updateDestination(path: any, targetOffset: any): void {
    const destTile = path.length ? path[0].tile : this.targetTile;
    this.destinationLeptons.set(destTile.rx * Coords.LEPTONS_PER_TILE, destTile.ry * Coords.LEPTONS_PER_TILE).add(targetOffset);
  }

  /**
   * 能否停在 tile 上（到达判定/就近停车的合法性检查）：
   *  - 空中单位：非机场系/非召唤物/非强停气球时，要求落点可通行
   *    （两栖判断）且没有被（未预订的）建筑或静止单位占用；
   *  - 步兵：同格静止步兵 ≤2 且没有占同一个 subcell 的；
   *  - 通用：体型太大（tooBigToFitUnderBridge）不能停在桥下；
   *  - strictCloseEnough 模式下，非取消时还必须真的足够接近目标。
   */
  canStopAtTile(object: any, tile: any, onBridge: any): boolean {
    if (object.zone === ZoneType.Air) {
      if (
        (!object.isAircraft() || !object.airportBoundTrait) &&
        !object.rules.spawned &&
        (!this.options?.forceMove || !object.rules.balloonHover || object.rules.hoverAttack) &&
        (!this.game.map.terrain.getPassableSpeed(tile, SpeedType.Amphibious, false, onBridge) ||
          this.game.map
            .getObjectsOnTile(tile)
            .filter(
              (obj: any) =>
                (obj.isBuilding() &&
                  !obj.isDestroyed &&
                  !obj.dockTrait?.hasReservedDockForUnit(object) &&
                  !object.rules.dock.includes(obj.name)) ||
                (obj.isUnit() && obj.tile === tile && obj.moveTrait.moveState !== MoveState.Moving && obj !== object),
            )
            .length)
      )
        return false;
    } else if (object.isInfantry()) {
      const idleInfantry = this.game.map
        .getGroundObjectsOnTile(tile)
        .filter(
          (obj: any) =>
            obj.isInfantry() &&
            obj.tile === tile &&
            obj.onBridge === onBridge &&
            obj.moveTrait.moveState !== MoveState.Moving &&
            obj !== object,
        );
      if (2 < idleInfantry.length || idleInfantry.find((obj: any) => obj.position.subCell === object.position.subCell)) return false;
    }
    return !(
      object.zone !== ZoneType.Air &&
      object.rules.tooBigToFitUnderBridge &&
      !onBridge &&
      tile.onBridgeLandType &&
      this.game.map.tileOccupation.getBridgeOnTile(tile)?.isHighBridge()
    ) &&
      !(
        !this.isCancelling() &&
        this.options?.strictCloseEnough &&
        undefined !== this.options?.closeEnoughTiles &&
        !this.isCloseEnoughToDest(object, tile, this.options.closeEnoughTiles)
      );
  }

  /** 与目标 tile 的距离是否在 closeEnoughTiles 内（undefined 视为无限制）。 */
  isCloseEnoughToDest(object: any, tile: any, closeEnoughTiles: number | undefined): boolean {
    if (undefined === closeEnoughTiles) return true;
    const rangeHelper = new RangeHelperModule.RangeHelper(this.game.map.tileOccupation);
    return !(rangeHelper.tileDistance(this.targetTile, tile) > closeEnoughTiles);
  }

  /** 是否已到达最终目的地（路径清空即到达）。 */
  hasReachedDestination(object: any): boolean {
    return !this.path.length;
  }

  /** 请求更新目标（延迟到下一 tick 的 needsPathUpdate 处理，避免寻路重入）。 */
  updateTarget(tile: any, toBridge: any, onlyIfPathExists = false): void {
    this.needsPathUpdate = true;
    this.targetChangeRequested = { tile, toBridge, onlyIfPathExists };
  }

  /** 任务收尾：解决碰撞状态、清途经点；落点偏移有变化时留给下次移动复用。 */
  onEnd(object: any): void {
    object.moveTrait.collisionState = CollisionState.Resolved;
    object.moveTrait.currentWaypoint = undefined;
    if (!this.targetOffset?.equals?.(this.computeTargetOffset(object))) {
      if (typeof this.targetOffset?.equals === "function") {
        object.moveTrait.lastTargetOffset = this.targetOffset;
      }
    }
  }

  /**
   * 强制取消：仅当任务及其子任务都可取消、且目标在图内（或允许越界）
   * 时生效。运行中/取消中的任务会先清现场（解除路径占用、记下当前
   * 偏移和速度供下次移动复用），最后置 Cancelled 状态。
   */
  forceCancel(object: any): boolean {
    if (!this.cancellable || this.children.some((child: any) => !child.cancellable)) return false;
    if (!this.options?.allowOutOfBoundsTarget && !this.game.map.isWithinBounds(object.tile)) return false;
    if (this.status === TaskStatus.Running || this.status === TaskStatus.Cancelling) {
      object.moveTrait.unreservePathNodes();
      object.moveTrait.lastMoveResult = MoveResult.Cancel;
      this.onEnd(object);
      object.moveTrait.lastTargetOffset = typeof this.targetOffset?.equals === "function" ? this.targetOffset : undefined;
      object.moveTrait.lastVelocity = object.moveTrait.velocity.clone();
    }
    this.status = TaskStatus.Cancelled;
    return true;
  }

  /**
   * 每 tick 驱动（核心状态机，见类注释）。
   * 返回 true 表示任务结束（到达/取消/失败），false 表示继续。
   */
  onTick(object: any): boolean {
    // 被瘫痪的单位停在途经点：只有取消流程才继续往下走。
    if (object.moveTrait.isDisabled() && object.moveTrait.moveState === MoveState.ReachedNextWaypoint) {
      if (!this.isCancelling()) return false;
      object.moveTrait.lastMoveResult = MoveResult.Cancel;
      return true;
    }
    // ===== 路径更新（updateTarget / 避障触发的重规划）=====
    if (this.needsPathUpdate) {
      if (object.moveTrait.moveState === MoveState.PlanMove) {
        // 正在规划中被要求重规划 → 回退到 ReachedNextWaypoint 重新选点。
        this.inPlanningForTicks = undefined;
        object.moveTrait.currentWaypoint = undefined;
        object.moveTrait.collisionState = CollisionState.Resolved;
        object.moveTrait.moveState = MoveState.ReachedNextWaypoint;
        object.moveTrait.velocity.set(0, 0, 0);
      }
      const savedTile = this.targetTile;
      const savedBridge = this.toBridge;
      if (this.targetChangeRequested) {
        this.targetTile = this.targetChangeRequested.tile;
        this.toBridge = this.targetChangeRequested.toBridge;
      }
      if (this.computePath(object, object.moveTrait.locomotor, this.targetChangeRequested?.onlyIfPathExists)) {
        // 寻路成功：空路径记为不可达目标，刷新目的地坐标，退出兜底模式。
        if (!this.path.length) {
          this.unreachableTargets.push({ tile: this.targetTile, toBridge: this.toBridge });
        }
        this.updateDestination(this.path, this.targetOffset);
        this.allObstaclesAreBlockers = false;
      } else {
        // onlyIfPathExists 且走不通：还原目标并刷新路径线（引用替换以通知 UI）。
        this.targetTile = savedTile;
        this.toBridge = savedBridge;
        this.targetLinesConfig.pathNodes = [...this.targetLinesConfig.pathNodes];
      }
      this.targetLinesConfig.isRecalc = !this.targetChangeRequested;
      this.targetChangeRequested = undefined;
      this.needsPathUpdate = false;
    }
    const map = this.game.map;
    // ===== 状态一：到达途经点 =====
    if (object.moveTrait.moveState === MoveState.ReachedNextWaypoint) {
      object.moveTrait.unreservePathNodes();
      // 从路径里清掉已走到的途经点（找不到就 pop 最近的一步）。
      const reachedIdx = this.path.findIndex((node: any) => node === object.moveTrait.currentWaypoint);
      if (-1 !== reachedIdx) {
        this.path.splice(reachedIdx);
      } else {
        this.path.pop();
      }
      object.moveTrait.currentWaypoint = undefined;
      // 取消流程看 cancelProcessed，正常移动看是否到达目的地。
      if (this.isCancelling() ? !this.cancelProcessed : this.hasReachedDestination(object)) {
        // 走到了（或取消到位）：尝试就地停下。
        const notCloseEnough = !this.isCancelling() && !this.isCloseEnoughToDest(object, object.tile, this.options?.closeEnoughTiles);
        if (!notCloseEnough && this.canStopAtTile(object, object.tile, object.onBridge)) {
          object.moveTrait.lastMoveResult = this.isCancelling() ? MoveResult.Cancel : MoveResult.Success;
          return true;
        }
        // 停不下来：找一个就近的可停 tile 重新规划（含目的地本身不可停的情况）。
        if (this.unreachableTargets.length > MAX_UNREACHABLE_TARGETS) {
          object.moveTrait.lastMoveResult = MoveResult.Fail;
          this.log(object, "bail_max_unreachable_dest");
          return true;
        }
        let relocateFromTile = object.tile;
        let relocateFromBridge = object.onBridge ? map.tileOccupation.getBridgeOnTile(relocateFromTile) : undefined;
        if (notCloseEnough) {
          relocateFromTile = this.targetTile;
          relocateFromBridge = this.toBridge ? map.tileOccupation.getBridgeOnTile(relocateFromTile) : undefined;
        }
        const relocationTile = this.findRelocationTile(relocateFromTile, relocateFromBridge, object);
        if (!relocationTile) {
          object.moveTrait.lastMoveResult = notCloseEnough ? MoveResult.Fail : MoveResult.CloseEnough;
          this.log(object, "bail_no_free_dest");
          return true;
        }
        // 新落点的桥面归属：只在原目标无桥/是高架桥时才查（普通桥保持桥下走）。
        const destBridge = !relocateFromBridge || relocateFromBridge.isHighBridge() ? map.tileOccupation.getBridgeOnTile(relocationTile) : undefined;
        this.updateTarget(relocationTile, !!destBridge);
        if (this.isCancelling()) {
          this.cancelProcessed = true;
          this.cancelRepositionPending = true;
        }
        return false;
      }
      if (this.cancelProcessed && !this.path.length) {
        object.moveTrait.lastMoveResult = MoveResult.Cancel;
        return true;
      }
      this.cancelProcessed = false;
      object.moveTrait.moveState = MoveState.PlanMove;
      // 选择下一个途经点并通知移动器。
      const locomotor = object.moveTrait.locomotor;
      object.moveTrait.currentWaypoint = locomotor.selectNextWaypoint
        ? locomotor.selectNextWaypoint(object, this.path)
        : this.path[this.path.length - 1];
      this.currentWaypointLeptons
        .set(object.moveTrait.currentWaypoint.tile.rx, object.moveTrait.currentWaypoint.tile.ry)
        .multiplyScalar(Coords.LEPTONS_PER_TILE)
        .add(this.targetOffset);
      const newTasks = locomotor.onNewWaypoint(object, this.currentWaypointLeptons, this.destinationLeptons);
      if (newTasks) {
        this.children.push(...newTasks);
        return false;
      }
    }
    // ===== 状态二：规划中（检查剩余路径，处理障碍/碰撞）=====
    if (object.moveTrait.moveState === MoveState.PlanMove) {
      if (this.isCancelling() && !this.cancelRepositionPending) {
        // 取消且不需要迁就：直接回 ReachedNextWaypoint 走收尾。
        object.moveTrait.currentWaypoint = undefined;
        object.moveTrait.moveState = MoveState.ReachedNextWaypoint;
        return this.onTick(object);
      }
      // 规划超时计数：超时 → 强制把所有障碍当阻断重新寻路。
      this.inPlanningForTicks = undefined === this.inPlanningForTicks ? 0 : this.inPlanningForTicks + 1;
      if (this.inPlanningForTicks > PLAN_TIMEOUT_TICKS) {
        this.needsPathUpdate = true;
        this.allObstaclesAreBlockers = true;
        object.moveTrait.velocity.set(0, 0, 0);
        this.log(object, "repath_plan_timeout");
        return false;
      }
      // 地面单位（飞行/瞬移移动器不做路径体检）。
      if (object.rules.movementZone !== MovementZone.Fly && !object.moveTrait.locomotor.ignoresTerrain) {
        // 剩余路径段（含当前途经点→最终目的地），按"最远优先"排列。
        const remainingNodes = this.path.slice(this.path.indexOf(object.moveTrait.currentWaypoint)).reverse();
        const ownSpeed = object.moveTrait.velocity.length();
        // 清掉引用已毁桥梁的节点标记。
        for (const node of remainingNodes) {
          if (node.onBridge?.isDestroyed) node.onBridge = undefined;
        }
        for (const node of remainingNodes) {          // 节点不可通行（地形变/被堵）→ 重规划；stopOnBlocker 命中则视为到位。
          if (
            !map.terrain.getPassableSpeed(
              node.tile,
              object.rules.speedType,
              object.isInfantry(),
              !!node.onBridge,
              this.options?.ignoredBlockers,
              undefined,
              undefined,
              object,
            )
          ) {
            if (this.options?.stopOnBlocker && map.terrain.findObstacles(node, object).some((obstacle: any) => obstacle.obj === this.options.stopOnBlocker)) {
              object.moveTrait.lastMoveResult = MoveResult.CloseEnough;
              return true;
            }
            this.needsPathUpdate = true;
            object.moveTrait.currentWaypoint = undefined;
            object.moveTrait.moveState = MoveState.ReachedNextWaypoint;
            return this.onTick(object);
          }
          // 路径上的箱子：捡到"单位补给箱"后如果脚下立即多出单位挡路 → 重规划。
          if (!node.onBridge) {
            let crate = map.getGroundObjectsOnTile(node.tile).find((obj: any) => obj.isOverlay() && obj.rules.crate);
            if (crate) {
              if (this.game.crateGeneratorTrait.peekInsideCrate(crate) === PowerupTypeModule.PowerupType.Unit) {
                this.game.crateGeneratorTrait.pickupCrate(object, crate, this.game);
                crate = this.game.map.getGroundObjectsOnTile(node.tile).find((obj: any) => obj.isUnit() && !obj.onBridge);
                if (crate) {
                  this.needsPathUpdate = true;
                  this.blockedPathNodes.push({ node, obj: crate });
                  object.moveTrait.currentWaypoint = undefined;
                  object.moveTrait.moveState = MoveState.ReachedNextWaypoint;
                  return this.onTick(object);
                }
              }
            }
          }
          // 逐个障碍处理（跳过已忽略的）。
          for (const obstacle of map.terrain.findObstacles(node, object).filter((entry: any) => !this.options?.ignoredBlockers?.includes(entry.obj))) {
            if (obstacle.static) {
              // 静态障碍（树/墙等）：重规划绕开。
              this.needsPathUpdate = true;
              object.moveTrait.currentWaypoint = undefined;
              object.moveTrait.moveState = MoveState.ReachedNextWaypoint;
              return this.onTick(object);
            }
            // 用完整的原版碾压判定，让 OmniCrusher（战斗要塞）
            // 也能碾载具，而 OmniCrushResistant 目标仍然挡路。内层判断保留
            // 原版 Crusher=yes 才真正穿行的要求。
            if (object.canCrushObject(obstacle.obj) || obstacle.obj.rules.crushable) {
              if (
                [SpeedType.Track, SpeedType.Hover].includes(object.rules.speedType) &&
                object.crusher &&
                // 强攻友方可碾压目标（墙/单位）时直接碾过去，
                // 而不是请它让路。
                (!obstacle.obj.isTechno() ||
                  !this.game.areFriendly(obstacle.obj, object) ||
                  (object.isForceAttacking && obstacle.obj === object.currentAttackTarget))
              ) {
                continue;
              }
              if (!obstacle.obj.isTechno()) {
                // 可碾压但自己是非履带/非悬浮等不该硬穿的情形：重规划。
                this.needsPathUpdate = true;
                object.moveTrait.currentWaypoint = undefined;
                object.moveTrait.moveState = MoveState.ReachedNextWaypoint;
                return this.onTick(object);
              }
            }
            if (obstacle.obj.isTerrain()) {
              // 地形障碍只对步兵出现：尝试挪 subcell（九宫格换位）。
              if (!object.isInfantry()) throw new Error(`Obstacle ${obstacle.obj.name} should be a blocker for non infantry`);
              const freeSubCell = this.findFreeSubCell(object, node);
              if (undefined !== freeSubCell) {
                this.relocateToSubCell(object, freeSubCell);
              } else {
                this.needsPathUpdate = true;
                this.blockedPathNodes.push({ node, obj: obstacle.obj });
                object.moveTrait.currentWaypoint = undefined;
                object.moveTrait.moveState = MoveState.ReachedNextWaypoint;
              }
              return this.onTick(object);
            }
            if (!obstacle.obj.isTechno()) throw new Error("Unexpected obstacle of type " + obstacle.obj.type);
            const blocker = obstacle.obj;
            const blockerSpeed = blocker.isUnit() ? blocker.moveTrait.velocity.length() : 0;
            // 机场里被忽略的停机载具不算挡路（友军机场飞机不会顶开友军车）。
            if (
              !blocker.isAircraft() ||
              blocker.zone !== ZoneType.Ground ||
              !this.options?.ignoredBlockers?.some((ignored: any) => ignored.isBuilding() && ignored.dockTrait?.isDocked(blocker))
            ) {
              // 对冲让行：只剩一个节点、对方在动且比我们快/同向/同格且
              // 它的下一站不是本格 → 它马上会走，跳过本格其它障碍等它。
              if (
                1 === remainingNodes.length &&
                blocker.isUnit() &&
                blockerSpeed &&
                ownSpeed &&
                ownSpeed <= blockerSpeed &&
                object.direction === blocker.direction &&
                blocker.tile === node.tile &&
                blocker.moveTrait.currentWaypoint?.tile !== node.tile
              ) {
                // 它马上会自己走开：跳出本格的障碍循环，继续检查下一节点。
                break;
              }
              // 挡路者属于"不会主动让路"的类型（建筑/待机/自己也在等）：
              if (
                blocker.isBuilding() ||
                blocker.moveTrait.moveState === MoveState.Idle ||
                blocker.moveTrait.collisionState !== CollisionState.Resolved
              ) {
                // 我们没在动且对方也在等：互相死锁，等到超时再强制重规划。
                if (
                  !ownSpeed &&
                  object.moveTrait.collisionState !== CollisionState.Resolved &&
                  blocker.isUnit() &&
                  blocker.moveTrait.collisionState !== CollisionState.Resolved
                ) {
                  if (this.inPlanningForTicks + 1 > PLAN_TIMEOUT_TICKS) {
                    this.needsPathUpdate = true;
                    this.allObstaclesAreBlockers = true;
                    this.log(object, "repath_waited_too_long_blocker " + blocker.id);
                    object.moveTrait.velocity.set(0, 0, 0);
                  }
                  return false;
                }
                {
                  // 双方都是步兵且对方已解决碰撞 → 我们换 subcell 让位。
                  if (blocker.isInfantry() && object.isInfantry() && blocker.moveTrait.collisionState === CollisionState.Resolved) {
                    const freeSubCell = this.findFreeSubCell(object, node);
                    if (undefined !== freeSubCell) {
                      this.relocateToSubCell(object, freeSubCell);
                      return this.onTick(object);
                    }
                  }
                  // 从路径前方找一个无障碍节点，尝试局部绕行到那里。
                  const blockedIdx = arrayModule.findIndexReverse(
                    this.path.slice(0, this.path.indexOf(node)),
                    (pathNode: any) =>
                      !map.terrain
                        .findObstacles(pathNode, object)
                        .filter((entry: any) => !this.options?.ignoredBlockers?.includes(entry.obj)).length,
                  );
                  if (-1 === blockedIdx) {
                    // 前方全部被挡：能"就近算赢"就收货，否则标记阻断重规划。
                    if (
                      this.canStopAtTile(object, object.tile, object.onBridge) &&
                      this.isCloseEnoughToDest(object, object.tile, this.options?.closeEnoughTiles)
                    ) {
                      object.moveTrait.lastMoveResult = MoveResult.CloseEnough;
                      this.log(object, "bail_waypoints_blocked_close_enough");
                      return true;
                    }
                    if (
                      !(
                        0 === this.options?.closeEnoughTiles ||
                        (Math.abs(object.tile.rx - this.targetTile.rx) <= 1 && Math.abs(object.tile.ry - this.targetTile.ry) <= 1)
                      )
                    ) {
                      // 目标还远：把到当前节点为止的路径连同首个障碍都标记阻断，重规划。
                      this.needsPathUpdate = true;
                      this.blockedPathNodes.push(
                        ...this.path
                          .slice(0, this.path.indexOf(node) + 1)
                          .map((pathNode: any) => ({ node: pathNode, obj: map.terrain.findObstacles(pathNode, object)[0].obj })),
                      );
                      object.moveTrait.velocity.set(0, 0, 0);
                      this.log(object, "repath_waypoints_blocked_too_far");
                      return false;
                    }
                  }
                  // 局部绕行：从安全节点重新寻一小段路（最多扩展 15 节点）。
                  let detourPath: any[] = [];
                  if (-1 !== blockedIdx) {
                    const safeNode = this.path[blockedIdx];
                    detourPath = map.terrain.computePath(
                      object.rules.speedType,
                      object.isInfantry(),
                      object.tile,
                      object.onBridge,
                      safeNode.tile,
                      !!safeNode.onBridge,
                      {
                        maxExpandedNodes: 15,
                        bestEffort: false,
                        excludeTiles: (excludeNode: any) =>
                          !!map.terrain
                            .findObstacles(excludeNode, object)
                            .filter((entry: any) => !this.options?.ignoredBlockers?.includes(entry.obj)).length,
                        ignoredBlockers: this.options?.ignoredBlockers,
                        mover: object,
                      },
                    );
                  }
                  if (detourPath.length || blocker.owner !== object.owner || 1 !== remainingNodes.length) {
                    if (detourPath.length) {
                      // 有绕行路：把安全节点之后整段替换成绕行路径。
                      this.path.splice(blockedIdx, this.path.length, ...detourPath);
                      object.moveTrait.currentWaypoint = undefined;
                      object.moveTrait.moveState = MoveState.ReachedNextWaypoint;
                      return this.onTick(object);
                    }
                    // 绕不了：有武器就开火清障；否则等待或标记阻断重规划。
                    const weapon = this.selectWeaponVsObstacle(object, blocker);
                    if (weapon) {
                      this.children.push(
                        object.attackTrait.createAttackTask(this.game, blocker, blocker.tile, weapon, {
                          passive: true,
                          holdGround: true,
                        }),
                      );
                      object.moveTrait.velocity.set(0, 0, 0);
                    } else if (this.options?.forceWaitOnPathBlocked) {
                      this.children.push(new WaitTicksTask(BLOCKED_WAIT_TICKS));
                      this.inPlanningForTicks = 0;
                      object.moveTrait.velocity.set(0, 0, 0);
                      object.moveTrait.collisionState = CollisionState.Waiting;
                    } else {
                      this.needsPathUpdate = true;
                      this.blockedPathNodes.push({ node, obj: blocker });
                      if (blocker.isBuilding()) this.allObstaclesAreBlockers = true;
                      this.log(object, "repath_unavoidable_blocker " + blocker.id);
                      object.moveTrait.velocity.set(0, 0, 0);
                    }
                    return false;
                  }
                  // 绕不了但挡路者是同阵营且只剩最后一格 → 走"让路/推挤"流程。
                  const blockerHasTasks = blocker.unitOrderTrait.hasTasks();
                  if (
                    this.pushTried ||
                    blocker.isBuilding() ||
                    blocker.moveTrait.collisionState === CollisionState.Waiting ||
                    blockerHasTasks ||
                    (blocker.isAircraft() && blocker.missileSpawnTrait)
                  ) {
                    // 对方让不了路：等一段时间后强制重规划；或继续等。
                    if (
                      !this.options?.forceWaitOnPathBlocked &&
                      (blocker.isBuilding() ||
                        (blockerHasTasks && blocker.moveTrait.moveState === MoveState.Idle) ||
                        this.inPlanningForTicks + BLOCKED_WAIT_TICKS > PLAN_TIMEOUT_TICKS)
                    ) {
                      this.needsPathUpdate = true;
                      this.allObstaclesAreBlockers = true;
                      this.log(object, "repath_blocker_busy_wait_timeout " + blocker.id);
                      object.moveTrait.velocity.set(0, 0, 0);
                    } else {
                      this.children.push(new WaitTicksTask(BLOCKED_WAIT_TICKS));
                      if (this.options?.forceWaitOnPathBlocked) {
                        this.inPlanningForTicks = 0;
                      } else {
                        this.inPlanningForTicks += BLOCKED_WAIT_TICKS;
                      }
                      object.moveTrait.velocity.set(0, 0, 0);
                      object.moveTrait.collisionState = CollisionState.Waiting;
                    }
                    return false;
                  }
                  // 请求对方挪一格让路，自己等 1 tick。
                  const asideDir = new Vector2(blocker.tile.rx - object.tile.rx, blocker.tile.ry - object.tile.ry);
                  this.pushTried = true;
                  blocker.unitOrderTrait.addTask(new MoveAsideTaskModule.MoveAsideTask(this.game, asideDir));
                  this.children.push(new WaitTicksTask(1));
                  object.moveTrait.velocity.set(0, 0, 0);
                  object.moveTrait.collisionState = CollisionState.Waiting;
                  this.log(object, "push " + blocker.id);
                  return false;
                }
              }
              // 双方都是步兵：换 subcell 错开。
              if (blocker.isInfantry() && object.isInfantry()) {
                const freeSubCell = this.findFreeSubCell(object, node);
                if (undefined !== freeSubCell) {
                  this.relocateToSubCell(object, freeSubCell);
                  return this.onTick(object);
                }
              }
              // 自己还没动：先等（连续等够 BLOCKED_WAIT_TICKS 才标记碰撞等待）。
              if (!ownSpeed) {
                if (this.inPlanningForTicks > BLOCKED_WAIT_TICKS) object.moveTrait.collisionState = CollisionState.Waiting;
                return false;
              }
              // 完全对头（180°）：谁也别想过去，停下等待。
              if (180 === Math.abs(object.direction - blocker.direction)) {
                object.moveTrait.velocity.set(0, 0, 0);
                object.moveTrait.collisionState = CollisionState.Waiting;
                return false;
              }
              // 小角度对峙且对方够慢：从更早的空节点绕行（防对堵死锁）。
              if (Math.abs(object.direction - blocker.direction) <= 45 && blockerSpeed * HEAD_ON_SPEED_FACTOR < ownSpeed) {
                const headOnIdx = this.path.indexOf(node);
                if (5 <= headOnIdx) {
                  const safeIdx = arrayModule.findIndexReverse(
                    this.path.slice(0, headOnIdx - 5),
                    (pathNode: any) => !map.terrain.findObstacles(pathNode, object).length,
                  );
                  if (-1 !== safeIdx) {
                    const safeNode = this.path[safeIdx];
                    const detourPath = map.terrain.computePath(
                      object.rules.speedType,
                      object.isInfantry(),
                      object.tile,
                      object.onBridge,
                      safeNode.tile,
                      !!safeNode.onBridge,
                      {
                        maxExpandedNodes: 15,
                        bestEffort: false,
                        excludeTiles: (excludeNode: any) =>
                          !!map.terrain.findObstacles(excludeNode, object).length ||
                          this.path.findIndex((pathNode: any) => pathNode.tile === excludeNode.tile && pathNode.onBridge === excludeNode.onBridge) > safeIdx,
                        mover: object,
                      },
                    );
                    if (detourPath.length) {
                      this.path.splice(safeIdx, this.path.length, ...detourPath);
                      object.moveTrait.currentWaypoint = undefined;
                      object.moveTrait.moveState = MoveState.ReachedNextWaypoint;
                      return this.onTick(object);
                    }
                  }
                }
                object.moveTrait.collisionState = CollisionState.Waiting;
                object.moveTrait.velocity.set(0, 0, 0);
                return false;
              }
              // 其它情况：停下等待对方先走。
              object.moveTrait.velocity.set(0, 0, 0);
              object.moveTrait.collisionState = CollisionState.Waiting;
              return false;
            }
          }
        }
        // 震慑散开：履带碾压单位移动时，吓跑路径上带 SCATTER 老兵能力
        // 的敌方可碾压单位（它们会自动散开让路）。
        if (object.rules.speedType === SpeedType.Track && ownSpeed) {
          const waypointIdx = this.path.indexOf(object.moveTrait.currentWaypoint);
          if (0 < waypointIdx) {
            const prevNode = this.path[waypointIdx - 1];
            for (const scatterer of map
              .getGroundObjectsOnTile(prevNode.tile)
              .filter(
                (obj: any) =>
                  obj.isUnit() &&
                  obj.onBridge === !!prevNode.onBridge &&
                  // 只吓跑本碾压单位真实可以碾掉的单位
                  // （SCATTER 老兵逃离真正的威胁，含 OmniCrusher）。
                  object.canCrushObject(obj) &&
                  obj.veteranTrait?.hasVeteranAbility(VeteranAbility.SCATTER) &&
                  !this.game.areFriendly(obj, object),
              )) {
              if (!scatterer.unitOrderTrait.hasTasks()) scatterer.unitOrderTrait.addTask(new ScatterTask(this.game));
            }
          }
        }
        // 预占剩余路径节点（防其它单位插进来）。
        if (!object.moveTrait.reservedPathNodes.length) {
          object.moveTrait.reservedPathNodes.push(...remainingNodes);
          remainingNodes.forEach((node: any) => {
            map.tileOccupation.occupySingleTile(node.tile, object);
          });
        }
      }
      // 规划完成，进入移动状态。
      object.moveTrait.moveState = MoveState.Moving;
      this.inPlanningForTicks = undefined;
      this.unreachableTargets.length = 0;
      this.pushTried = false;
      if (object.moveTrait.collisionState === CollisionState.Waiting) {
        object.moveTrait.collisionState = CollisionState.Resolved;
      }
    }
    // ===== 状态三：移动中 =====
    if (object.moveTrait.moveState === MoveState.Moving) {
      const locomotor = object.moveTrait.locomotor;
      const { distance, done, isTeleport } = locomotor.tick(
        object,
        this.currentWaypointLeptons,
        this.destinationLeptons,
        (this.isCancelling() || !this.path.length) && !this.cancelRepositionPending,
      );
      // 瞬移前先广播 onBeforeTeleport（超时空军团等特性依赖）。
      if (isTeleport) {
        object.traits.filter(NotifyTeleportModule.NotifyTeleport).forEach((trait: any) => {
          trait[NotifyTeleportModule.NotifyTeleport.onBeforeTeleport](object, this.game, true, true);
        });
      }
      if (distance.length()) {
        const oldTile = object.tile;
        const allowOutOfBounds = locomotor.allowOutOfBounds;
        if (distance.y) {
          // 有垂直分量：按三维位移移动（飞行/跳跃），处理高度变化。
          const prevElevation = object.tileElevation;
          object.position.moveByLeptons3(distance, allowOutOfBounds);
          object.moveTrait.handleElevationChange(prevElevation, this.game);
        } else {
          object.position.moveByLeptons(distance.x, distance.z, allowOutOfBounds);
        }
        // 跨 tile 了：处理桥面归属/占据变化广播。
        if (object.tile !== oldTile) {
          let oldBridge = object.onBridge ? this.game.map.tileOccupation.getBridgeOnTile(oldTile) : undefined;
          const pathNodeOnNewTile = arrayModule.findReverse(this.path, (node: any) => node.tile === object.tile);
          let newBridge = pathNodeOnNewTile
            ? pathNodeOnNewTile.onBridge
            : oldBridge || object.moveTrait.currentWaypoint.onBridge
              ? this.game.map.tileOccupation.getBridgeOnTile(object.tile)
              : undefined;
          if (newBridge?.isDestroyed) newBridge = undefined;
          object.moveTrait.handleTileChange(oldTile, newBridge, false, this.game, isTeleport);
          if (isTeleport) {
            object.moveTrait.lastTeleportTick = this.game.currentTick;
            this.game.events.dispatch(new ObjectTeleportEventModule.ObjectTeleportEvent(object, true, oldTile));
          }
          if (object.isDestroyed) return true;
        }
      }
      if (done) {
        object.moveTrait.moveState = MoveState.ReachedNextWaypoint;
        return this.onTick(object);
      }
    }
    return false;
  }

  /**
   * 选一件能打挡路障碍的武器（仅对敌对目标）：要求攻击空闲、
   * 不是死亡武器、非 limboLaunch 寄生弹、非心灵控制弹。
   */
  selectWeaponVsObstacle(object: any, blocker: any): any {
    let weapon: any;
    if (
      !this.game.areFriendly(blocker, object) &&
      object.attackTrait &&
      !object.attackTrait.isDisabled() &&
      object.attackTrait.isIdle() &&
      (weapon = object.attackTrait.selectWeaponVersus(object, blocker, this.game, false, true)) &&
      weapon.name !== object.armedTrait?.deathWeapon?.name &&
      (!weapon.rules.limboLaunch || !weapon.warhead.rules.parasite) &&
      !weapon.warhead.rules.mindControl
    ) {
      return weapon;
    }
  }

  /**
   * 找就近的可停 tile（到达后停不下来时迁就用）：
   *  - 飞行单位：随机搜索无建筑/地形/岩石的 tile（跳跃机还要求
   *    下方可 amphibious 通行）；随机找不到改用径向搜索（2~15 格）；
   *  - 地面单位：用岛屿图保证新落点与当前位置在同一片连通陆地
   *    （跨不了海），且不在不可达记录里、无障碍、MovePositionHelper
   *    认可、canStopAtTile 通过。
   */
  findRelocationTile(fromTile: any, fromBridge: any, object: any): any {
    const map = this.game.map;
    let relocationTile: any;
    if (object.rules.movementZone === MovementZone.Fly) {
      const predicate = (tile: any) =>
        !map.tileOccupation
          .getGroundObjectsOnTile(tile)
          .some(
            (obj: any) => (obj.isBuilding() && !obj.isDestroyed) || obj.isTerrain() || (obj.isOverlay() && obj.rules.isARock),
          ) &&
        (object.rules.locomotor !== LocomotorType.Jumpjet ||
          0 <
            this.game.map.terrain.getPassableSpeed(
              tile,
              SpeedType.Amphibious,
              object.isInfantry(),
              !!tile.onBridgeLandType,
            ));
      const randomFinder = new RandomTileFinderModule.RandomTileFinder(map.tiles, map.mapBounds, fromTile, 1, this.game, predicate);
      relocationTile = randomFinder.getNextTile();
      if (!relocationTile) {
        const radialFinder = new RadialTileFinder(map.tiles, map.mapBounds, fromTile, object.getFoundation(), 2, 15, predicate);
        relocationTile = radialFinder.getNextTile();
      }
    } else {
      // 岛屿图：没有忽略障碍且当前格可通行时才取（否则 undefined = 不检查连通性）。
      const islandIdMap =
        !this.options?.ignoredBlockers?.length &&
        map.terrain.getPassableSpeed(object.tile, object.rules.speedType, object.isInfantry(), object.onBridge, undefined, undefined, undefined, object)
          ? this.game.map.terrain.getIslandIdMap(
              object.rules.speedType,
              object.isInfantry(),
              object.crusher && object.omniCrusher ? "omni" : "",
            )
          : undefined;
      const currentIslandId = islandIdMap?.get(object.tile, object.onBridge);
      const movePositionHelper = new MovePositionHelperModule.MovePositionHelper(map);
      const radialFinder = new RadialTileFinder(map.tiles, map.mapBounds, fromTile, { width: 1, height: 1 }, 0, 5, (tile: any) => {
        const tileBridge = !fromBridge || fromBridge.isHighBridge() ? map.tileOccupation.getBridgeOnTile(tile) : undefined;
        return (
          !this.unreachableTargets.find((entry: any) => entry.tile === tile && entry.toBridge === !!tileBridge) &&
          (object.zone === ZoneType.Air ||
            (islandIdMap?.get(tile, !!tileBridge) === currentIslandId &&
              !map.terrain.findObstacles({ tile, onBridge: tileBridge }, object).length &&
              movePositionHelper.isEligibleTile(tile, tileBridge, fromBridge, fromTile))) &&
          this.canStopAtTile(object, tile, !!tileBridge)
        );
      });
      relocationTile = radialFinder.getNextTile();
    }
    return relocationTile;
  }

  /**
   * 找一个空闲的步兵 subcell（九宫格 2/4/3）：
   * 排除已被同格静止步兵（的期望位）和地形物件占用的格子。
   */
  findFreeSubCell(object: any, node: any): number | undefined {
    const groundObjects = this.game.map.getGroundObjectsOnTile(node.tile);
    const takenByInfantry = groundObjects
      .filter((obj: any) => obj.isInfantry() && obj.onBridge === !!node.onBridge && obj !== object)
      .map((obj: any) => obj.position.desiredSubCell);
    const takenByTerrain = groundObjects
      .filter((obj: any) => obj.isTerrain())
      .map((obj: any) => obj.rules.getOccupiedSubCells(this.game.map.getTheaterType()))
      .flat();
    const taken = [...takenByInfantry, ...takenByTerrain];
    return Infantry.SUB_CELLS.find((subCell: number) => -1 === taken.indexOf(subCell));
  }

  /** 迁移到新的 subcell：更新落点偏移并刷新途经点/目的地坐标。 */
  relocateToSubCell(object: any, subCell: number): void {
    object.position.desiredSubCell = subCell;
    const subCellOffset = object.position.computeSubCellOffset(subCell);
    this.targetOffset = subCellOffset;
    this.currentWaypointLeptons
      .set(object.moveTrait.currentWaypoint.tile.rx, object.moveTrait.currentWaypoint.tile.ry)
      .multiplyScalar(Coords.LEPTONS_PER_TILE)
      .add(this.targetOffset);
    this.updateDestination(this.path, this.targetOffset);
    object.moveTrait.locomotor.onWaypointUpdate?.(object, this.currentWaypointLeptons, this.destinationLeptons);
  }

  /** 调试目标路径线（无路径时按需补算，用于 UI 画目标线）。 */
  getTargetLinesConfig(object: any): any {
    if (!this.path) {
      const locomotorStub = new LocomotorFactory(this.game).create(object);
      if (
        (this.options?.allowOutOfBoundsTarget || this.game.map.mapBounds.isWithinBounds(this.targetTile)) &&
        object.rules.movementZone !== MovementZone.Fly &&
        !locomotorStub.ignoresTerrain &&
        object.unitOrderTrait.getCurrentTask()?.isCancelling()
      ) {
        // 取消中的地面单位：预计算路径预案（下一 tick 可能用到）。
        if (!this.groundPathPlan) {
          const plan = this.computeGroundPath(object);
          this.targetLinesConfig.pathNodes = plan.path;
          if (plan.path.length) this.groundPathPlan = plan;
        }
      } else {
        if (!object.moveTrait.locomotor) object.moveTrait.locomotor = locomotorStub;
        this.computePath(object, object.moveTrait.locomotor);
      }
      this.targetLinesConfig.isRecalc = false;
    }
    return this.targetLinesConfig;
  }

  /** 调试日志（move 通道）。 */
  log(object: any, message: string): void {
    this.logger.debug(`<${object.id}>: ` + message);
  }
}
