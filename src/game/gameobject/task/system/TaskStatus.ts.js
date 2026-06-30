// === Reconstructed SystemJS module: game/gameobject/task/system/TaskStatus ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/gameobject/task/system/TaskStatus", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("TaskStatus", (i = {})))[(e.NotStarted = 0)] = "NotStarted"),
        (e[(e.Running = 1)] = "Running"),
        (e[(e.Finished = 2)] = "Finished"),
        (e[(e.Cancelling = 3)] = "Cancelling"),
        (e[(e.Cancelled = 4)] = "Cancelled"));
    },
  };
});
