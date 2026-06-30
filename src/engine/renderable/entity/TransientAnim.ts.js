// === Reconstructed SystemJS module: engine/renderable/entity/TransientAnim ===
// deps: ["engine/renderable/entity/Anim"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/entity/TransientAnim", ["engine/renderable/entity/Anim"], function (e, t) {
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
      ((r = class extends i.Anim {
        constructor(e, t, i, r, s, a, n, o, l, c, h) {
          (super(e, t, i, r, s, a, n, o, l, void 0, h), (this.container = c));
        }
        update(e) {
          var t;
          (!this.isAnimNotStarted() ||
            ((t = this.objectArt.report) && this.worldSound?.playEffect(t, this.getPosition())),
            super.update(e),
            this.isAnimFinished() && (this.remove(), this.dispose()));
        }
        remove() {
          this.container.remove(this);
        }
      }),
        e("TransientAnim", r));
    },
  };
});
