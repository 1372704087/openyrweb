// === Reconstructed SystemJS module: game/order/DockOrder ===
// deps: ["game/order/Order","game/order/OrderType","engine/type/PointerType","game/gameobject/Building","game/gameobject/task/harvester/ReturnOreTask","game/order/OrderFeedbackType","game/gameobject/task/MoveToDockTask"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/order/DockOrder",
  [
    "game/order/Order",
    "game/order/OrderType",
    "engine/type/PointerType",
    "game/gameobject/Building",
    "game/gameobject/task/harvester/ReturnOreTask",
    "game/order/OrderFeedbackType",
    "game/gameobject/task/MoveToDockTask",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o, l, c;
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
      ],
      execute: function () {
        ((c = class extends i.Order {
          constructor(e) {
            (super(r.OrderType.Dock),
              (this.game = e),
              (this.targetOptional = !1),
              (this.feedbackType = o.OrderFeedbackType.Move));
          }
          getPointerType(e) {
            return e
              ? this.isAllowed()
                ? s.PointerType.OccupyMini
                : s.PointerType.NoActionMini
              : this.isAllowed()
                ? s.PointerType.Occupy
                : s.PointerType.NoOccupy;
          }
          isValid() {
            if (
              !this.target.obj?.isBuilding() ||
              this.target.obj.isDestroyed ||
              !this.target.obj.dockTrait ||
              this.target.obj.buildStatus !== a.BuildStatus.Ready ||
              !this.sourceObject.isUnit() ||
              this.target.obj.warpedOutTrait.isActive()
            )
              return !1;
            var e = !(this.target.obj.rules.refinery || this.target.obj.unitRepairTrait);
            return (
              this.game.areFriendly(this.target.obj, this.sourceObject) &&
              this.target.obj.dockTrait.isValidUnitForDock(this.sourceObject) &&
              !this.target.obj.dockTrait.isDocked(this.sourceObject) &&
              !(
                this.target.obj.unitRepairTrait &&
                !this.sourceObject.rules.dock.includes(this.target.obj.name) &&
                100 === this.sourceObject.healthTrait.health
              ) &&
              (!e ||
                0 < (this.target.obj.dockTrait.getAvailableDockCount() ?? 0) ||
                this.target.obj.dockTrait.hasReservedDockForUnit(this.sourceObject))
            );
          }
          isAllowed() {
            return !0;
          }
          process() {
            var e = this.target.obj;
            return e.rules.refinery && this.sourceObject.isVehicle() && this.sourceObject.harvesterTrait
              ? [new n.ReturnOreTask(this.game, e, !0, !0)]
              : e.unitRepairTrait || this.sourceObject.rules.dock.includes(e.name)
                ? [new l.MoveToDockTask(this.game, e)]
                : [];
          }
        }),
          e("DockOrder", c));
      },
    };
  },
);
