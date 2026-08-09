// === Reconstructed SystemJS module: game/order/UnloadAllOrder ===
// deps: ["game/order/Order","game/order/OrderType","engine/type/PointerType","game/order/OrderFeedbackType","game/gameobject/task/EvacuateTransportTask"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// OpenYRWeb: Bio Reactor (YAPOWR) "Unload All" sidebar command. The player selects a friendly bio
// reactor that has absorbed infantry inside, presses Ctrl+E, and the building drains everyone LIFO
// (last in, first out) via the SAME EvacuateTransportTask the Battle Fortress uses — one infantry
// at a time, spawned on an exit tile outside the footprint.

System.register(
  "game/order/UnloadAllOrder",
  [
    "game/order/Order",
    "game/order/OrderType",
    "engine/type/PointerType",
    "game/order/OrderFeedbackType",
    "game/gameobject/task/EvacuateTransportTask",
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
          // Hand off the LIFO drain to EvacuateTransportTask — the same task the Battle
          // Fortress uses to unload passengers. It runs on the building's update loop
          // (sourceObject = the building), spawning one infantry at a time on an exit tile
          // outside the footprint. Soft mode: if the building is fully boxed in, units stay
          // inside instead of being destroyed.
          process() {
            return [new o.EvacuateTransportTask(this.game, !0)];
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
