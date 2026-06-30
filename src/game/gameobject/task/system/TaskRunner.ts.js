// === Reconstructed SystemJS module: game/gameobject/task/system/TaskRunner ===
// deps: ["game/gameobject/task/system/TaskStatus"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/gameobject/task/system/TaskRunner", ["game/gameobject/task/system/TaskStatus"], function (e, t) {
  "use strict";
  var o, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        o = e;
      },
    ],
    execute: function () {
      e(
        "TaskRunner",
        (i = class {
          tick(e, t) {
            this.tickChildren(e, t);
          }
          startTask(e, t) {
            if (e.status !== o.TaskStatus.NotStarted)
              throw new Error("Attempted to start a task with status " + e.status);
            ((e.status = o.TaskStatus.Running), e.onStart(t));
          }
          tickTask(e, t) {
            let i = this.tickChildren(e.children, t);
            var r = e.children.find((e) => e.blocking);
            if (!i && r) return !1;
            if (!t.isSpawned) return !1;
            if (e.status === o.TaskStatus.NotStarted) throw new Error("Attempted tick on a non-started task");
            if (e.isRunning() || e.isCancelling()) {
              var s = e.isCancelling(),
                a = !!e.waitingForChildrenToFinish || e.onTick(t);
              e.children.length &&
                !r &&
                a &&
                ((i = e.children.every(
                  (e) => e.status === o.TaskStatus.Cancelled || e.status === o.TaskStatus.Finished,
                )),
                (e.waitingForChildrenToFinish = !i));
              a = a && i;
              return (a && (e.onEnd(t), (e.status = s ? o.TaskStatus.Cancelled : o.TaskStatus.Finished)), a);
            }
            return !0;
          }
          tickChildren(r, s) {
            let a = !0;
            if (r.length) {
              let t = new Set(),
                i;
              for (; s.isSpawned && (i = r.find((e) => !t.has(e)));) {
                let e;
                if (
                  (i.status === o.TaskStatus.NotStarted && this.startTask(i, s),
                  i.status === o.TaskStatus.Running || i.status === o.TaskStatus.Cancelling)
                )
                  e = !0 === this.tickTask(i, s);
                else {
                  if (i.status !== o.TaskStatus.Cancelled)
                    throw new Error("Unhandled task status " + o.TaskStatus[i.status]);
                  e = !0;
                }
                if (e) {
                  var n = r.indexOf(i);
                  -1 !== n && r.splice(n, 1);
                } else {
                  if (((a = !1), i.blocking)) break;
                  t.add(i);
                }
              }
            }
            return a;
          }
        }),
      );
    },
  };
});
