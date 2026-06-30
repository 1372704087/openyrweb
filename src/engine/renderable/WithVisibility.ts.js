// === Reconstructed SystemJS module: engine/renderable/WithVisibility ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/WithVisibility", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "WithVisibility",
        (i = class {
          constructor() {
            this.visible = !0;
          }
          setVisible(e) {
            ((this.visible = e), this.updateVisibility());
          }
          isVisible() {
            return this.visible;
          }
          updateVisibility() {
            if (this.target) {
              let e = this.target.get3DObject();
              e && (e.visible = this.visible);
            }
          }
          applyTo(e) {
            ((this.target = e), this.updateVisibility());
          }
        }),
      );
    },
  };
});
