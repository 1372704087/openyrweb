// === Reconstructed SystemJS module: game/gameobject/task/system/Task ===
// deps: ["game/gameobject/task/system/TaskStatus"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/gameobject/task/system/Task", ["game/gameobject/task/system/TaskStatus"], function (e, t) {
  "use strict";
  var i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      e(
        "Task",
        (r = class {
          constructor() {
            ((this.status = i.TaskStatus.NotStarted),
              (this.children = []),
              (this.cancellable = !0),
              (this.useChildTargetLines = !1),
              (this.blocking = !0),
              (this.waitingForChildrenToFinish = !1),
              (this.preventOpportunityFire = !0),
              (this.preventLanding = !0),
              (this.isAttackMove = !1));
          }
          isRunning() {
            return this.status === i.TaskStatus.Running;
          }
          isCancelling() {
            return this.status === i.TaskStatus.Cancelling;
          }
          setCancellable(e) {
            return ((this.cancellable = e), this);
          }
          setBlocking(e) {
            return ((this.blocking = e), this);
          }
          onStart(e) {}
          onEnd(e) {}
          cancel() {
            if (this.cancellable)
              if (this.status === i.TaskStatus.Running)
                ((this.status = i.TaskStatus.Cancelling),
                  this.children.length && this.children.forEach((e) => e.cancel()));
              else if (
                this.status === i.TaskStatus.NotStarted &&
                ((this.status = i.TaskStatus.Cancelled), this.children.length)
              )
                throw new Error("Should't have any children before starting a task");
          }
          getTargetLinesConfig(e) {}
        }),
      );
    },
  };
});
