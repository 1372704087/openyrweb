// === Reconstructed SystemJS module: engine/LazyResourceCollection ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/LazyResourceCollection", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "LazyResourceCollection",
        (i = class {
          constructor(e) {
            ((this.resourceFactory = e), (this.resources = new Map()));
          }
          setVfs(e) {
            this.vfs = e;
          }
          set(e, t) {
            this.resources.set(e, t);
          }
          has(e) {
            return !!this.resources.has(e) || (this.vfs?.fileExists(e) ?? !1);
          }
          get(e) {
            let t;
            return (
              (t = this.resources.get(e)),
              !t &&
                this.vfs?.fileExists(e) &&
                ((t = this.resourceFactory(this.vfs.openFile(e))), this.resources.set(e, t)),
              t
            );
          }
          clear(e) {
            e ? this.resources.delete(e) : this.resources.clear();
          }
        }),
      );
    },
  };
});
