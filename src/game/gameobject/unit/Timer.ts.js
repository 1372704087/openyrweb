// === Reconstructed SystemJS module: game/gameobject/unit/Timer ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/gameobject/unit/Timer", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "Timer",
        (i = class {
          constructor() {
            this.activeTicks = 0;
          }
          isActive() {
            return 0 < this.activeTicks;
          }
          setActiveFor(e, t) {
            ((this.activeTicks = e), (this.activeFor = e), (this.activeSince = t));
          }
          reset() {
            ((this.activeTicks = 0), (this.activeSince = void 0), (this.activeFor = void 0));
          }
          getTicksLeft() {
            return this.activeTicks;
          }
          getInitialTicks() {
            return this.activeFor ?? 0;
          }
          tick(e) {
            return (
              0 < this.activeTicks &&
              (this.activeTicks--,
              this.activeTicks <= 0 || (void 0 !== this.activeSince && e - this.activeSince > this.activeFor)) &&
              (this.reset(), !0)
            );
          }
        }),
      );
    },
  };
});
