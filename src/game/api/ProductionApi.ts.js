// === Reconstructed SystemJS module: game/api/ProductionApi ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/api/ProductionApi", [], function (e, t) {
  "use strict";
  var i, r;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      (e(
        "ProductionApi",
        (r = class {
          constructor(e) {
            (i.set(this, void 0), __classPrivateFieldSet(this, i, e, "f"));
          }
          isAvailableForProduction(e) {
            return __classPrivateFieldGet(this, i, "f").isAvailableForProduction(e);
          }
          getAvailableObjects(t) {
            let e = __classPrivateFieldGet(this, i, "f").getAvailableObjects();
            return (void 0 !== t && (e = e.filter((e) => this.getQueueTypeForObject(e) === t)), e);
          }
          getQueueTypeForObject(e) {
            return __classPrivateFieldGet(this, i, "f").getQueueTypeForObject(e);
          }
          getQueueData(e) {
            let t = __classPrivateFieldGet(this, i, "f").getQueue(e);
            return {
              size: t.currentSize,
              maxSize: t.maxSize,
              status: t.status,
              type: t.type,
              items: t.getAll().map((e) => ({ rules: e.rules, quantity: e.quantity })),
            };
          }
        }),
      ),
        (i = new WeakMap()));
    },
  };
});
