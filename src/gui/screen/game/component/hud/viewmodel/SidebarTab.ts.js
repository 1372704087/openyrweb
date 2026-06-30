// === Reconstructed SystemJS module: gui/screen/game/component/hud/viewmodel/SidebarTab ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/game/component/hud/viewmodel/SidebarTab", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "SidebarTab",
        (i = class {
          constructor(e) {
            ((this.items = []), (this.needsUpdate = !0), (this.flashing = !1), (this.id = e));
          }
          get disabled() {
            return !this.items.length;
          }
        }),
      );
    },
  };
});
