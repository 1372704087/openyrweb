// === Reconstructed SystemJS module: game/action/ActionFactoryReg ===
// deps: ["game/action/OrderActionContext","game/action/ActionType","game/action/factories/NoActionFactory","game/action/factories/PlaceBuildingActionFactory","game/action/factories/SellObjectActionFactory","game/action/factories/SelectUnitsActionFactory","game/action/factories/OrderUnitsActionFactory","game/action/factories/UpdateQueueActionFactory","game/action/factories/DropPlayerActionFactory","game/action/factories/ToggleRepairActionFactory","game/action/factories/ToggleAllianceFactory","game/action/factories/ActivateSuperWeaponActionFactory","game/action/factories/PingLocationActionFactory","game/action/factories/ObserveGameActionFactory","game/action/factories/ResignGameActionFactory","game/action/factories/DebugActionFactory"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/action/ActionFactoryReg",
  [
    "game/action/OrderActionContext",
    "game/action/ActionType",
    "game/action/factories/NoActionFactory",
    "game/action/factories/PlaceBuildingActionFactory",
    "game/action/factories/SellObjectActionFactory",
    "game/action/factories/SelectUnitsActionFactory",
    "game/action/factories/OrderUnitsActionFactory",
    "game/action/factories/UpdateQueueActionFactory",
    "game/action/factories/DropPlayerActionFactory",
    "game/action/factories/ToggleRepairActionFactory",
    "game/action/factories/ToggleAllianceFactory",
    "game/action/factories/ActivateSuperWeaponActionFactory",
    "game/action/factories/PingLocationActionFactory",
    "game/action/factories/ObserveGameActionFactory",
    "game/action/factories/ResignGameActionFactory",
    "game/action/factories/DebugActionFactory",
  ],
  function (e, t) {
    "use strict";
    var s, a, n, o, l, c, h, u, d, g, p, m, f, y, T, v, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          f = e;
        },
        function (e) {
          y = e;
        },
        function (e) {
          T = e;
        },
        function (e) {
          v = e;
        },
      ],
      execute: function () {
        e(
          "ActionFactoryReg",
          (i = class {
            register(e, t, i) {
              var r = new s.OrderActionContext();
              (e.registerFactory(a.ActionType.NoAction, new n.NoActionFactory()),
                e.registerFactory(a.ActionType.PlaceBuilding, new o.PlaceBuildingActionFactory(t)),
                e.registerFactory(a.ActionType.SellObject, new l.SellObjectActionFactory(t)),
                e.registerFactory(a.ActionType.ToggleRepair, new g.ToggleRepairActionFactory(t)),
                e.registerFactory(a.ActionType.SelectUnits, new c.SelectUnitsActionFactory(t, r)),
                e.registerFactory(a.ActionType.OrderUnits, new h.OrderUnitsActionFactory(t, t.map, r)),
                e.registerFactory(a.ActionType.UpdateQueue, new u.UpdateQueueActionFactory(t)),
                e.registerFactory(a.ActionType.ToggleAlliance, new p.ToggleAllianceActionFactory(t)),
                e.registerFactory(a.ActionType.ActivateSuperWeapon, new m.ActivateSuperWeaponActionFactory(t)),
                e.registerFactory(a.ActionType.PingLocation, new f.PingLocationActionFactory(t)),
                e.registerFactory(a.ActionType.DropPlayer, new d.DropPlayerActionFactory(t, i)),
                e.registerFactory(a.ActionType.ObserveGame, new y.ObserveGameActionFactory(t)),
                e.registerFactory(a.ActionType.ResignGame, new T.ResignGameActionFactory(t, i)),
                e.registerFactory(a.ActionType.DebugCommand, new v.DebugActionFactory(t)));
            }
          }),
        );
      },
    };
  },
);
