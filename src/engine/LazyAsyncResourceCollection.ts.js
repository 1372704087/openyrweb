// === Reconstructed SystemJS module: engine/LazyAsyncResourceCollection ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/LazyAsyncResourceCollection", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "LazyAsyncResourceCollection",
        (i = class {
          constructor(e, t = !0) {
            ((this.resourceFactory = e), (this.cache = t), (this.resources = new Map()));
          }
          setDir(e) {
            this.rfsDir = e;
          }
          set(e, t) {
            this.resources.set(e, t);
          }
          async has(e) {
            return !!this.resources.has(e) || ((await this.rfsDir?.containsEntry(e)) ?? !1);
          }
          async get(e) {
            let t;
            return (
              (t = this.resources.get(e)),
              !t &&
                (await this.rfsDir?.containsEntry(e)) &&
                ((t = await this.resourceFactory(await this.rfsDir.getRawFile(e))),
                this.cache && this.resources.set(e, t)),
              t
            );
          }
          clear() {
            this.resources.clear();
          }
        }),
      );
    },
  };
});
