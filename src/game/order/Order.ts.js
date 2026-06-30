// === Reconstructed SystemJS module: game/order/Order ===
// deps: ["engine/type/PointerType","game/order/OrderFeedbackType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/order/Order", ["engine/type/PointerType", "game/order/OrderFeedbackType"], function (e, t) {
  "use strict";
  var i, r, s;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      e(
        "Order",
        (s = class {
          constructor(e) {
            ((this.orderType = e),
              (this.targetOptional = !0),
              (this.minimapAllowed = !0),
              (this.singleSelectionRequired = !1),
              (this.terminal = !1),
              (this.feedbackType = r.OrderFeedbackType.None));
          }
          getPointerType(e, t) {
            return e ? i.PointerType.Mini : i.PointerType.Default;
          }
          set(e, t) {
            return ((this.sourceObject = e), (this.target = t), this);
          }
          isValid() {
            return !0;
          }
          isAllowed() {
            return !0;
          }
          onAdd(e, t) {
            return !0;
          }
        }),
      );
    },
  };
});
