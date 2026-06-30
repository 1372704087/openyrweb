// === Reconstructed SystemJS module: engine/animation/SimpleRunner ===
// deps: ["engine/Animation"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/animation/SimpleRunner", ["engine/Animation"], function (e, t) {
  "use strict";
  var i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      e(
        "SimpleRunner",
        (r = class {
          tick(e) {
            let t = this.animation;
            if (t)
              switch (t.getState()) {
                case i.AnimationState.STOPPED:
                  return;
                case i.AnimationState.NOT_STARTED:
                  t.start(e);
                case i.AnimationState.RUNNING:
                default:
                  t.update(e);
              }
          }
          getCurrentFrame() {
            return this.animation.getCurrentFrame();
          }
          shouldUpdate() {
            return this.animation.getState() !== i.AnimationState.STOPPED;
          }
        }),
      );
    },
  };
});
