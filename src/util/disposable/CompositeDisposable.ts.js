// === Reconstructed SystemJS module: util/disposable/CompositeDisposable ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("util/disposable/CompositeDisposable", [], function (e, t) {
  "use strict";
  var i, r;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      ((i = (e) => !e.dispose),
        e(
          "CompositeDisposable",
          (r = class {
            constructor() {
              this.disposables = new Set();
            }
            add(...e) {
              e.map((e) => this.disposables.add("function" == typeof e ? { dispose: e } : e));
            }
            remove(...e) {
              e.map((e) => this.disposables.delete(e));
            }
            dispose() {
              (this.disposables.forEach((e) => {
                "function" == typeof e ? e() : i(e) ? e.destroy() : e.dispose();
              }),
                this.disposables.clear());
            }
          }),
        ));
    },
  };
});
