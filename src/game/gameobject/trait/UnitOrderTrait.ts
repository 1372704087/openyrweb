/**
 * UnitOrderTrait — 单位命令/任务队列 trait。
 *
 * orders 为玩家指令队列，tasks 为可取消任务栈，taskRunner 驱动执行。
 * 狂暴单位清空指令但仍处理 AttackTrait 压入的任务。路径点清理、
 * 换主/传送清指令、目标线任务选择与孪生一致。
 *
 * 由 game/gameobject/trait/UnitOrderTrait.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TaskRunner } from "game/gameobject/task/system/TaskRunner"; // 未转换（any-shim）
import { TaskStatus } from "game/gameobject/task/system/TaskStatus"; // 未转换（any-shim）
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import { WaitTicksTask } from "game/gameobject/task/system/WaitTicksTask"; // 未转换（any-shim）
import * as NotifyOwnerChangeModule from "game/gameobject/trait/interface/NotifyOwnerChange"; // 已转换
import { CallbackTask } from "game/gameobject/task/system/CallbackTask"; // 未转换（any-shim）
import * as NotifyTeleportModule from "game/gameobject/trait/interface/NotifyTeleport"; // 已转换
import * as NotifyOrderModule from "game/gameobject/trait/interface/NotifyOrder"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class UnitOrderTrait {
  /** 宿主对象。 */
  gameObject: any;
  /** 待处理玩家指令队列（FIFO）。 */
  orders: any[];
  /** 已排队（queued）指令集合。 */
  queuedOrders: Set<any>;
  /** 当前任务列表（front 执行）。 */
  tasks: any[];
  /** 任务运行器。 */
  taskRunner: TaskRunner;
  /** 路径点路径（多点移动）。 */
  waypointPath: any;
  /** 当前路径点节点。 */
  currentWaypoint: any;
  /** 当前目标线展示任务。 */
  targetLinesTask: any;
  /** 目标线配置缓存。 */
  targetLinesConfig: any;

  constructor(gameObject: any) {
    this.gameObject = gameObject;
    this.orders = [];
    this.queuedOrders = new Set();
    this.tasks = [];
    this.taskRunner = new TaskRunner();
  }

  /** 每 tick：狂暴清令 → 跑任务 → 消化指令 → 更新路径点/目标线。 */
  [NotifyTickModule.NotifyTick.onTick](obj: any, world: any): void {
    if (!obj.isSpawned) return;
    // berserk units ignore all player orders. Their auto-attack
    // behavior is handled by AttackTrait's tick handler (passive berserk scan).
    // Continue to process tasks (added by AttackTrait via addTask) so the
    // berserk AttackTask actually executes.
    if (obj.berserkTrait?.isBerserk()) {
      this.clearOrders();
    }
    const hasTasks = this.hasTasks();
    const firstLive = this.tasks.find((task) => !task.isCancelling());
    if (hasTasks) this.taskRunner.tick(this.tasks, obj);
    if (!obj.isSpawned) return;
    const orderCount = this.orders.length;
    if (orderCount && (!hasTasks || !firstLive)) {
      let advanced = false;
      let order;
      while ((order = this.orders[0])) {
        if (order.isValid() && order.isAllowed()) {
          const spawnedTasks = order.process();
          if (spawnedTasks) {
            if (this.queuedOrders.has(order)) {
              this.tasks.push(new WaitTicksTask(5));
              this.tasks.push(
                new CallbackTask(() => {
                  obj.resetGuardModeToIdle();
                }),
              );
            }
            this.tasks.push(...spawnedTasks);
            if (!hasTasks) this.taskRunner.tick(this.tasks, obj);
          }
          advanced = true;
        }
        this.orders.shift();
        this.queuedOrders.delete(order);
        if (!obj.isSpawned) return;
        if (this.waypointPath) {
          if (this.currentWaypoint) {
            this.cleanupWaypoint(this.currentWaypoint, this.waypointPath);
            this.currentWaypoint = this.currentWaypoint?.next;
          } else {
            this.currentWaypoint = this.waypointPath.waypoints[0];
          }
          if (!this.currentWaypoint) this.cleanupWaypointPath();
        }
        if (advanced) break;
      }
    }
    if (
      !orderCount &&
      !hasTasks &&
      this.waypointPath &&
      this.currentWaypoint
    ) {
      this.cleanupWaypoint(this.currentWaypoint, this.waypointPath);
      this.cleanupWaypointPath();
    }
    // 目标线任务：沿 useChildTargetLines 链下钻到首个未取消子任务。
    let lineTask: any = firstLive;
    while (lineTask?.useChildTargetLines) {
      const child = lineTask.children.find((c: any) => !c.isCancelling());
      if (!child) break;
      lineTask = child;
    }
    if (this.targetLinesTask !== lineTask) {
      this.targetLinesTask = lineTask;
      this.targetLinesConfig = lineTask?.getTargetLinesConfig?.(this.gameObject);
    }
  }

  /** 换主：清指令并取消全部任务。 */
  [NotifyOwnerChangeModule.NotifyOwnerChange.onChange](): void {
    this.clearOrders();
    this.cancelAllTasks();
  }

  /** 传送前（非 warp）：清指令与任务栈。 */
  [NotifyTeleportModule.NotifyTeleport.onBeforeTeleport](
    _obj: any,
    _world: any,
    from: any,
    warpFlag: any,
  ): void {
    if (from && !warpFlag) {
      this.clearOrders();
      this.tasks.length = 0;
    }
  }

  /**
   * 压入玩家指令。狂暴拒收；onAdd 返回 false 则仅清理目标线；
   * 非 queued 进入时先清旧令并取消未启动/进行中任务。
   */
  addOrder(order: any, queued = false): void {
    // berserk units cannot receive orders.
    if (this.gameObject.berserkTrait?.isBerserk()) return;
    if (order.onAdd(this.tasks, queued) !== !1) {
      if (!queued) {
        this.clearOrders();
        this.tasks = this.tasks.filter((task) => task.status !== TaskStatus.NotStarted);
        this.tasks.forEach((task) => task.cancel());
      }
      this.orders.push(order);
      if (queued) this.queuedOrders.add(order);
      this.gameObject.traits.filter(NotifyOrderModule.NotifyOrder).forEach((trait: any) => {
        trait[NotifyOrderModule.NotifyOrder.onPush](this.gameObject, order.orderType);
      });
    } else {
      this.targetLinesTask = void 0;
    }
  }

  /** 清空指令、路径点并复位警戒。 */
  clearOrders(): void {
    this.orders.length = 0;
    this.queuedOrders.clear();
    if (this.currentWaypoint && this.waypointPath) {
      this.cleanupWaypoint(this.currentWaypoint, this.waypointPath);
    }
    this.cleanupWaypointPath();
    this.gameObject.resetGuardModeToIdle();
  }

  /** 取消队首指令的 queued 标记。 */
  unmarkNextQueuedOrder(): void {
    if (this.orders.length) this.queuedOrders.delete(this.orders[0]);
  }

  /** 是否有任务。 */
  hasTasks(): boolean {
    return !!this.tasks.length;
  }

  /** 空闲（无指令且无任务）。 */
  isIdle(): boolean {
    return !this.orders.length && !this.tasks.length;
  }

  /** 当前（队首）任务。 */
  getCurrentTask(): any {
    return this.tasks[0];
  }

  /** 取消全部任务。 */
  cancelAllTasks(): void {
    this.tasks.forEach((task) => task.cancel());
  }

  /** 尾部追加任务。 */
  addTask(task: any): void {
    this.tasks.push(task);
  }

  /** 批量追加任务。 */
  addTasks(...tasks: any[]): void {
    tasks.forEach((task) => this.addTask(task));
  }

  /** 头部插入任务（优先执行）。 */
  addTaskToFront(task: any): void {
    this.tasks.unshift(task);
  }

  /** 插到队首任务之后。 */
  addTaskNext(task: any): void {
    this.tasks.splice(1, 0, task);
  }

  /** 任务列表浅拷贝。 */
  getTasks(): any[] {
    return [...this.tasks];
  }

  /** 清理：清令、空任务、释放宿主。 */
  dispose(): void {
    this.clearOrders();
    this.tasks.length = 0;
    this.gameObject = void 0;
  }

  /** 从路径中移除本单位；无人引用时整条路径作废。 */
  cleanupWaypointPath(): void {
    if (this.waypointPath) {
      this.waypointPath.units.splice(this.waypointPath.units.indexOf(this.gameObject), 1);
      if (!this.waypointPath.units.length) {
        this.waypointPath.waypoints.forEach((wp: any) => (wp.next = void 0));
        this.waypointPath.waypoints.length = 0;
      }
      this.waypointPath = void 0;
    }
    this.currentWaypoint = void 0;
  }

  /** 无人引用该路径点时从路径中删除它。 */
  cleanupWaypoint(waypoint: any, path: any): void {
    const stillReferenced =
      path.units.find(
        (unit: any) =>
          unit !== this.gameObject &&
          (unit.unitOrderTrait.currentWaypoint ?? unit.unitOrderTrait.waypointPath?.waypoints[0]) ===
            waypoint,
      ) || path.waypoints.find((wp: any) => wp.next === waypoint);
    if (stillReferenced) return;
    const idx = path.waypoints.indexOf(waypoint);
    if (idx === -1) throw new Error("Given waypoint not found in waypoint path");
    path.waypoints.splice(idx, 1);
  }
}
