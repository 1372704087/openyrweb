// === Reconstructed SystemJS module: game/order/UnloadAllOrder ===
// deps: ["game/order/Order","game/order/OrderType","engine/type/PointerType","game/order/OrderFeedbackType","game/gameobject/task/EvacuateBioReactorTask"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// OpenYRWeb: Bio Reactor (YAPOWR) "Unload All" sidebar command. The player selects a friendly bio
// reactor that has absorbed infantry inside, presses Ctrl+E, and the building drains everyone LIFO
// (last in, first out). Each infantry unlimbos inside the building footprint and walks out through
// the front entrance via MoveOutsideTask — the same animation EnterBuildingTask uses in reverse.
// Only one infantry walks out at a time (serialized by task children).

System.register(
  "game/order/UnloadAllOrder",
  [
    "game/order/Order",
    "game/order/OrderType",
    "engine/type/PointerType",
    "game/order/OrderFeedbackType",
    "game/gameobject/task/EvacuateBioReactorTask",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, o, ev;
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
          o = e;
        },
      ],
      execute: function () {
        ((ev = class extends i.Order {
          constructor(e) {
            (super(r.OrderType.UnloadAll),
              (this.game = e),
              (this.targetOptional = !0),
              (this.terminal = !0),
              (this.feedbackType = a.OrderFeedbackType.Enter),
              (this.getPointerType = () => s.PointerType.NoAction));
          }
          isValid() {
            var b = this.sourceObject;
            return (
              !!b &&
              !b.isDestroyed &&
              b.isBuilding() &&
              !!b.bioReactorPowerTrait &&
              !!b.garrisonTrait &&
              b.garrisonTrait.units.length > 0
            );
          }
          isAllowed() {
            return this.isValid();
          }
          // Hand off the LIFO drain to a dedicated Task that runs on the building's update
          // loop. Each onTick unlimbos one infantry inside the building, pushes MoveOutsideTask
          // to walk it out to the front, and the next infantry waits until the current one
          // finishes — serial queue matching the entry flow's "one at a time" behaviour.
          process() {
            return [new o.EvacuateBioReactorTask(this.game)];
          }
          onAdd() {
            // Always allow re-triggering. If the building is empty, the task self-completes on
            // onStart; if the user spam-clicks mid-drain, the existing task is cancelled and a
            // new one starts with whatever is still in garrisonTrait.units — matches vanilla
            // YR "restart the drain with whatever is still in".
            return !0;
          }
        }),
          e("UnloadAllOrder", ev));
      },
    };
  },
);
