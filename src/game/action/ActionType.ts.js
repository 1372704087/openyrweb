// === Reconstructed SystemJS module: game/action/ActionType ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/action/ActionType", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("ActionType", (i = {})))[(e.NoAction = 0)] = "NoAction"),
        (e[(e.DropPlayer = 1)] = "DropPlayer"),
        (e[(e.ObserveGame = 2)] = "ObserveGame"),
        (e[(e.ResignGame = 3)] = "ResignGame"),
        (e[(e.DebugCommand = 4)] = "DebugCommand"),
        (e[(e.PlaceBuilding = 5)] = "PlaceBuilding"),
        (e[(e.SellObject = 6)] = "SellObject"),
        (e[(e.ToggleRepair = 7)] = "ToggleRepair"),
        (e[(e.SelectUnits = 8)] = "SelectUnits"),
        (e[(e.OrderUnits = 9)] = "OrderUnits"),
        (e[(e.UpdateQueue = 10)] = "UpdateQueue"),
        (e[(e.ToggleAlliance = 11)] = "ToggleAlliance"),
        (e[(e.ActivateSuperWeapon = 12)] = "ActivateSuperWeapon"),
        (e[(e.PingLocation = 13)] = "PingLocation"));
    },
  };
});
