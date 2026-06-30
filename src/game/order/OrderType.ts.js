// === Reconstructed SystemJS module: game/order/OrderType ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/order/OrderType", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("OrderType", (i = {})))[(e.Move = 0)] = "Move"),
        (e[(e.ForceMove = 1)] = "ForceMove"),
        (e[(e.Attack = 2)] = "Attack"),
        (e[(e.ForceAttack = 3)] = "ForceAttack"),
        (e[(e.AttackMove = 4)] = "AttackMove"),
        (e[(e.Guard = 5)] = "Guard"),
        (e[(e.GuardArea = 6)] = "GuardArea"),
        (e[(e.Capture = 7)] = "Capture"),
        (e[(e.Occupy = 8)] = "Occupy"),
        (e[(e.Deploy = 9)] = "Deploy"),
        (e[(e.DeploySelected = 10)] = "DeploySelected"),
        (e[(e.Stop = 11)] = "Stop"),
        (e[(e.Cheer = 12)] = "Cheer"),
        (e[(e.Dock = 13)] = "Dock"),
        (e[(e.Gather = 14)] = "Gather"),
        (e[(e.Repair = 15)] = "Repair"),
        (e[(e.Scatter = 16)] = "Scatter"),
        (e[(e.EnterTransport = 17)] = "EnterTransport"),
        (e[(e.PlaceBomb = 18)] = "PlaceBomb"));
    },
  };
});
