// === Reconstructed SystemJS module: engine/UiAnimationLoop ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/UiAnimationLoop", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "UiAnimationLoop",
        (i = class {
          constructor(e) {
            ((this.renderer = e),
              (this.isStarted = !1),
              (this.doBackgroundFrame = (e) => {
                this.isStarted && this.paused && this.renderer.update(e);
              }),
              (this.doFrame = (t) => {
                if (this.isStarted && !this.paused) {
                  let e = this.renderer.getStats();
                  (e && e.begin(),
                    this.renderer.update(t),
                    this.renderer.render(),
                    e && e.end(),
                    (this.rafId = requestAnimationFrame(this.doFrame)));
                }
              }),
              (this.handleVisibilityChange = () => {
                var e = document.hidden;
                this.paused !== e &&
                  ((this.paused = e),
                  this.paused
                    ? (this.rafId && (cancelAnimationFrame(this.rafId), (this.rafId = void 0)),
                      (this.backgroundIntervalId = setInterval(() => {
                        var e = performance.now();
                        this.doBackgroundFrame(e);
                      }, 1e3)))
                    : (this.backgroundIntervalId &&
                        (clearInterval(this.backgroundIntervalId), (this.backgroundIntervalId = void 0)),
                      (this.rafId = requestAnimationFrame(this.doFrame))));
              }));
          }
          start() {
            this.isStarted ||
              ((this.isStarted = !0),
              (this.paused = !1),
              document.hidden ? this.handleVisibilityChange() : (this.rafId = requestAnimationFrame(this.doFrame)),
              document.addEventListener("visibilitychange", this.handleVisibilityChange));
          }
          stop() {
            this.isStarted &&
              ((this.isStarted = !1),
              this.rafId && (cancelAnimationFrame(this.rafId), (this.rafId = void 0)),
              this.backgroundIntervalId &&
                (clearInterval(this.backgroundIntervalId), (this.backgroundIntervalId = void 0)),
              document.removeEventListener("visibilitychange", this.handleVisibilityChange));
          }
          destroy() {
            (this.stop(), this.renderer.flush());
          }
        }),
      );
    },
  };
});
