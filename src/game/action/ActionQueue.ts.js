// === Reconstructed SystemJS module: game/action/ActionQueue ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/action/ActionQueue", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "ActionQueue",
        (i = class {
          constructor() {
            this.actions = [];
          }
          push(...e) {
            this.actions.push(...e);
          }
          getLast() {
            return this.actions[this.actions.length - 1];
          }
          dequeueAll() {
            var e = [...this.actions];
            return ((this.actions.length = 0), e);
          }
          dequeueLast() {
            return this.actions.pop();
          }
          clear() {
            this.actions.length = 0;
          }
        }),
      );
    },
  };
});
