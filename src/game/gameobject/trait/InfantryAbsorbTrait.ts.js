// === Reconstructed SystemJS module: game/gameobject/trait/InfantryAbsorbTrait ===
// deps: ["game/gameobject/trait/GarrisonTrait","game/gameobject/trait/interface/NotifyDestroy","game/gameobject/trait/interface/NotifyDamage","game/gameobject/trait/interface/NotifySell","game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/interface/NotifyOwnerChange","game/gameobject/task/EvacuateBioReactorTask"]
//
// OpenYRWeb: Bio Reactor (YABIOP, Yuri faction) — FIFO queue + mutex + LIFO unload.
//
// Entry: each infantry independently walks to the building's front queue point via
// MoveNextToTask, then registers into a FIFO queue. Only the unit at the head of the
// queue may claim the mutex and enter. Once absorbed, the next unit in queue is promoted.
// This ensures "排队等待" (queue up and wait in line) behaviour.
//
// Exit: evacuate() schedules an EvacuateBioReactorTask. LIFO order, one unit per
// second, spawned at the building center.

System.register(
  "game/gameobject/trait/InfantryAbsorbTrait",
  [
    "game/gameobject/trait/GarrisonTrait",
    "game/gameobject/trait/interface/NotifyDestroy",
    "game/gameobject/trait/interface/NotifyDamage",
    "game/gameobject/trait/interface/NotifySell",
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/trait/interface/NotifyOwnerChange",
    "game/gameobject/task/EvacuateBioReactorTask",
  ],
  function (e, t) {
    "use strict";
    var i, r, d, g, n, oc, Evt, s;
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
          d = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          oc = e;
        },
        function (e) {
          Evt = e;
        },
      ],
      execute: function () {
        ((s = class extends i.GarrisonTrait {
          constructor(e, t) {
            super(e, t);
            this._entryQueue = [];    // FIFO: [{task, unit}] — 排队队列
            this._activeTask = null;  // mutex: the head-of-queue unit currently entering
          }
          canBeOccupied() {
            return !0;
          }
          [d.NotifyDamage.onDamage]() {}
          [g.NotifySell.onSell](e, t) {
            for (var i of this.units) t.destroyObject(i, { player: e.owner });
            this.units = [];
            this._entryQueue.length = 0;
            this._activeTask = null;
          }
          [r.NotifyDestroy.onDestroy](e, t, i, r) {
            for (var s of this.units) {
              s.deathType = e.deathType;
              t.destroyObject(s, i, !0);
            }
            this.units = [];
            this._entryQueue.length = 0;
            this._activeTask = null;
          }
          [oc.NotifyOwnerChange.onChange](e, t, i) {
            this._cancelActive();
            this._entryQueue.length = 0;
          }
          _cancelActive() {
            if (this._activeTask) {
              this._activeTask.task.cancel();
              this._activeTask = null;
            }
          }
          // Per-tick: clean up dead/mind-controlled/despawned entries from the queue
          // and the active task, then promote the next if the slot is free.
          [n.NotifyTick.onTick](e, t) {
            // 1. 清理队列中已死/未生成/被心控的单位
            for (var i = this._entryQueue.length - 1; i >= 0; i--) {
              var r = this._entryQueue[i];
              if (this._isUnitInvalid(r.unit)) {
                r.task.cancel();
                this._entryQueue.splice(i, 1);
              }
            }
            // 2. 清理当前正在进入但已失效的单位
            if (this._activeTask && this._isUnitInvalid(this._activeTask.unit)) {
              this._activeTask.task.cancel();
              this._activeTask = null;
              this._promoteNext();
            }
          }
          _isUnitInvalid(e) {
            return !e || e.isDestroyed || !e.isSpawned || !!e.mindControllableTrait?.isActive();
          }
          // 注册到 FIFO 排队队列。总是返回 true（容量检查在上一层 isAllowed 中已完成）。
          registerEntry(e, t) {
            this._entryQueue.push({ task: e, unit: t });
            return !0;
          }
          // 互斥锁 + FIFO 队列头检查：只有队首任务且当前无活跃进入者时才能进入。
          unitMayEnterNow(e, t) {
            // 如果我已经持有锁（被中断后恢复），允许继续
            if (this._activeTask && this._activeTask.task === e) return !0;
            // 检查是否是队首
            if (!this._entryQueue.length || this._entryQueue[0].task !== e) return !1;
            // 队首且无活跃进入者，获取互斥锁
            if (!this._activeTask) {
              this._activeTask = { task: e, unit: t };
              return !0;
            }
            return !1;
          }
          // 单位成功进入生化炉：清除活跃锁，出队并提升下一个。
          onUnitEnteredBio(e) {
            if (this._activeTask && this._activeTask.task === e) {
              this._activeTask = null;
            }
            // 从队列中移除已完成的任务
            var t = this._entryQueue.findIndex(function (i) { return i.task === e; });
            if (t >= 0) this._entryQueue.splice(t, 1);
            this._promoteNext();
          }
          // 单位放弃进入（被移走/取消/死亡）：从队列移除，若是活跃者则提升下一个。
          onUnitAbortedEntry(e, t) {
            var i = this._entryQueue.findIndex(function (r) { return r.task === e; });
            if (i >= 0) this._entryQueue.splice(i, 1);
            if (this._activeTask && this._activeTask.task === e) {
              this._activeTask = null;
              this._promoteNext();
            }
          }
          // 将队列头部提升为新的活跃任务（跳过无效单位）
          _promoteNext() {
            while (this._entryQueue.length) {
              var e = this._entryQueue[0];
              if (this._isUnitInvalid(e.unit)) {
                e.task.cancel();
                this._entryQueue.shift();
                continue;
              }
              // 下一个有效单位将成为活跃进入者
              this._activeTask = { task: e.task, unit: e.unit };
              return;
            }
          }
          evacuate(e, t = !1) {
            this._cancelActive();
            this._entryQueue.length = 0;
            if (this.units.length && this.building) {
              this.building.unitOrderTrait.addTask(new Evt.EvacuateBioReactorTask(e));
            }
          }
        }),
          e("InfantryAbsorbTrait", s));
      },
    };
  },
);
