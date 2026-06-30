// === Reconstructed SystemJS module: gui/CanvasMetrics ===
// deps: ["util/disposable/CompositeDisposable","util/dom"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/CanvasMetrics", ["util/disposable/CompositeDisposable", "util/dom"], function (e, t) {
  "use strict";
  var i, r, s;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      e(
        "CanvasMetrics",
        (s = class {
          constructor(e, t) {
            ((this.canvas = e),
              (this.window = t),
              (this.x = 0),
              (this.y = 0),
              (this.width = 0),
              (this.height = 0),
              (this.disposables = new i.CompositeDisposable()),
              (this.updateCanvasBoxMetrics = () => {
                var e = r.getOffset(this.canvas);
                ((this.x = e.left),
                  (this.y = e.top),
                  (this.width = this.canvas.width),
                  (this.height = this.canvas.height));
              }));
          }
          init() {
            (this.updateCanvasBoxMetrics(),
              this.window.addEventListener("resize", this.updateCanvasBoxMetrics),
              this.disposables.add(() => this.window.removeEventListener("resize", this.updateCanvasBoxMetrics)));
          }
          notifyViewportChange() {
            this.updateCanvasBoxMetrics();
          }
          dispose() {
            this.disposables.dispose();
          }
        }),
      );
    },
  };
});
