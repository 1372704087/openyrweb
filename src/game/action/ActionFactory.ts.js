// === Reconstructed SystemJS module: game/action/ActionFactory ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/action/ActionFactory", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "ActionFactory",
        (i = class {
          constructor() {
            this.factories = new Map();
          }
          registerFactory(e, t) {
            this.factories.set(e, t);
          }
          create(e) {
            let t = this.factories.get(e);
            if (!t) throw new Error("No factory registered for action type " + e);
            return t.create();
          }
        }),
      );
    },
  };
});
