// === Reconstructed SystemJS module: game/gameobject/trait/UnitOrderTrait ===
// deps: ["game/gameobject/task/system/TaskRunner","game/gameobject/task/system/TaskStatus","game/gameobject/trait/interface/NotifyTick","game/gameobject/task/system/WaitTicksTask","game/gameobject/trait/interface/NotifyOwnerChange","game/gameobject/task/system/CallbackTask","game/gameobject/trait/interface/NotifyTeleport","game/gameobject/trait/interface/NotifyOrder"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/UnitOrderTrait",
  [
    "game/gameobject/task/system/TaskRunner",
    "game/gameobject/task/system/TaskStatus",
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/task/system/WaitTicksTask",
    "game/gameobject/trait/interface/NotifyOwnerChange",
    "game/gameobject/task/system/CallbackTask",
    "game/gameobject/trait/interface/NotifyTeleport",
    "game/gameobject/trait/interface/NotifyOrder",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, o, a, l, n, c, h;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          c = e;
        },
      ],
      execute: function () {
        ((h = class {
          constructor(e) {
            ((this.gameObject = e),
              (this.orders = []),
              (this.queuedOrders = new Set()),
              (this.tasks = []),
              (this.taskRunner = new i.TaskRunner()));
          }
          [s.NotifyTick.onTick](i, e) {
            if (i.isSpawned) {
              // OpenYRWeb: berserk units ignore all player orders. Their auto-attack
              // behavior is handled by AttackTrait's tick handler (passive berserk scan).
              // Continue to process tasks (added by AttackTrait via addTask) so the
              // berserk AttackTask actually executes.
              if (i.berserkTrait?.isBerserk()) {
                this.clearOrders();
              }
              var r = this.hasTasks(),
                t = this.tasks.find((e) => !e.isCancelling());
              if ((r && this.taskRunner.tick(this.tasks, i), i.isSpawned)) {
                var s,
                  a = this.orders.length;
                if (a && (!r || !t)) {
                  let e,
                    t = !1;
                  for (; (e = this.orders[0]);) {
                    if (
                      (e.isValid() &&
                        e.isAllowed() &&
                        ((s = e.process()) &&
                          (this.queuedOrders.has(e) &&
                            (this.tasks.push(new o.WaitTicksTask(5)),
                            this.tasks.push(
                              new l.CallbackTask(() => {
                                i.resetGuardModeToIdle();
                              }),
                            )),
                          this.tasks.push(...s),
                          r || this.taskRunner.tick(this.tasks, i)),
                        (t = !0)),
                      this.orders.shift(),
                      this.queuedOrders.delete(e),
                      !i.isSpawned)
                    )
                      return;
                    if (
                      (this.waypointPath &&
                        (this.currentWaypoint
                          ? (this.cleanupWaypoint(this.currentWaypoint, this.waypointPath),
                            (this.currentWaypoint = this.currentWaypoint?.next))
                          : (this.currentWaypoint = this.waypointPath.waypoints[0]),
                        this.currentWaypoint || this.cleanupWaypointPath()),
                      t)
                    )
                      break;
                  }
                }
                !a &&
                  !r &&
                  this.waypointPath &&
                  this.currentWaypoint &&
                  (this.cleanupWaypoint(this.currentWaypoint, this.waypointPath), this.cleanupWaypointPath());
                let e = t;
                for (; e?.useChildTargetLines;) {
                  var n = e.children.find((e) => !e.isCancelling());
                  if (!n) break;
                  e = n;
                }
                this.targetLinesTask !== e &&
                  ((this.targetLinesTask = e), (this.targetLinesConfig = e?.getTargetLinesConfig(this.gameObject)));
              }
            }
          }
          [a.NotifyOwnerChange.onChange]() {
            (this.clearOrders(), this.cancelAllTasks());
          }
          [n.NotifyTeleport.onBeforeTeleport](e, t, i, r) {
            i && !r && (this.clearOrders(), (this.tasks.length = 0));
          }
          addOrder(t, e = !1) {
            // OpenYRWeb: berserk units cannot receive orders.
            if (this.gameObject.berserkTrait?.isBerserk()) return;
            !1 !== t.onAdd(this.tasks, e)
              ? (e ||
                  (this.clearOrders(),
                  (this.tasks = this.tasks.filter((e) => e.status !== r.TaskStatus.NotStarted)),
                  this.tasks.forEach((e) => e.cancel())),
                this.orders.push(t),
                e && this.queuedOrders.add(t),
                this.gameObject.traits.filter(c.NotifyOrder).forEach((e) => {
                  e[c.NotifyOrder.onPush](this.gameObject, t.orderType);
                }))
              : (this.targetLinesTask = void 0);
          }
          clearOrders() {
            ((this.orders.length = 0),
              this.queuedOrders.clear(),
              this.currentWaypoint &&
                this.waypointPath &&
                this.cleanupWaypoint(this.currentWaypoint, this.waypointPath),
              this.cleanupWaypointPath(),
              this.gameObject.resetGuardModeToIdle());
          }
          unmarkNextQueuedOrder() {
            this.orders.length && this.queuedOrders.delete(this.orders[0]);
          }
          hasTasks() {
            return !!this.tasks.length;
          }
          isIdle() {
            return !this.orders.length && !this.tasks.length;
          }
          getCurrentTask() {
            return this.tasks[0];
          }
          cancelAllTasks() {
            this.tasks.forEach((e) => e.cancel());
          }
          addTask(e) {
            this.tasks.push(e);
          }
          addTasks(...e) {
            e.forEach((e) => this.addTask(e));
          }
          addTaskToFront(e) {
            this.tasks.unshift(e);
          }
          addTaskNext(e) {
            this.tasks.splice(1, 0, e);
          }
          getTasks() {
            return [...this.tasks];
          }
          dispose() {
            (this.clearOrders(), (this.tasks.length = 0), (this.gameObject = void 0));
          }
          cleanupWaypointPath() {
            (this.waypointPath &&
              (this.waypointPath.units.splice(this.waypointPath.units.indexOf(this.gameObject), 1),
              this.waypointPath.units.length ||
                (this.waypointPath.waypoints.forEach((e) => (e.next = void 0)),
                (this.waypointPath.waypoints.length = 0)),
              (this.waypointPath = void 0)),
              (this.currentWaypoint = void 0));
          }
          cleanupWaypoint(t, e) {
            if (
              !e.units.find(
                (e) =>
                  e !== this.gameObject &&
                  (e.unitOrderTrait.currentWaypoint ?? e.unitOrderTrait.waypointPath?.waypoints[0]) === t,
              ) &&
              !e.waypoints.find((e) => e.next === t)
            ) {
              var i = e.waypoints.indexOf(t);
              if (-1 === i) throw new Error("Given waypoint not found in waypoint path");
              e.waypoints.splice(i, 1);
            }
          }
        }),
          e("UnitOrderTrait", h));
      },
    };
  },
);
