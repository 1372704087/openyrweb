// === Reconstructed SystemJS module: util/event ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("util/event", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "EventDispatcher",
        (i = class {
          constructor() {
            this.listeners = new Set();
          }
          subscribe(e) {
            this.listeners.add(e);
          }
          subscribeOnce(i) {
            let r = (e, t) => {
              (i(e, t), this.unsubscribe(r), (r = void 0));
            };
            this.subscribe(r);
          }
          unsubscribe(e) {
            this.listeners.delete(e);
          }
          dispatch(t, i) {
            this.listeners.forEach((e) => e(i, t));
          }
          asEvent() {
            return this;
          }
        }),
      );
    },
  };
});
