// === Reconstructed SystemJS module: game/GameEventBus ===
// deps: ["util/event"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/GameEventBus", ["util/event"], function (e, t) {
  "use strict";
  var r, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      e(
        "GameEventBus",
        (i = class {
          constructor() {
            ((this.dispatcher = new r.EventDispatcher()), (this.dispatchersByType = new Map()));
          }
          dispatch(e) {
            (this.dispatcher.dispatch(void 0, e), this.dispatchersByType.get(e.type)?.dispatch(void 0, e));
          }
          subscribe(e, t) {
            let i = void 0,
              r;
            return (
              (r = "function" == typeof e ? e : ((i = e), t)),
              void 0 === i ? (this.dispatcher.subscribe(r), () => this.unsubscribe(r)) : this.subscribeType(i, r)
            );
          }
          unsubscribe(e, t) {
            let i = void 0,
              r;
            ((r = "function" == typeof e ? e : ((i = e), t)),
              void 0 === i ? this.dispatcher.unsubscribe(r) : this.unsubscribeType(i, r));
          }
          subscribeType(e, t) {
            let i = this.dispatchersByType.get(e);
            return (
              i || ((i = new r.EventDispatcher()), this.dispatchersByType.set(e, i)),
              i.subscribe(t),
              () => this.unsubscribeType(e, t)
            );
          }
          unsubscribeType(e, t) {
            this.dispatchersByType.get(e)?.unsubscribe(t);
          }
        }),
      );
    },
  };
});
