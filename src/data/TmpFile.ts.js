// === Reconstructed SystemJS module: data/TmpFile ===
// deps: ["data/TmpImage","data/vfs/VirtualFile"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/TmpFile", ["data/TmpImage", "data/vfs/VirtualFile"], function (e, t) {
  "use strict";
  var n, i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        n = e;
      },
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      e(
        "TmpFile",
        (r = class {
          constructor(e) {
            ((this.images = []), e instanceof i.VirtualFile && this.fromVirtualFile(e));
          }
          fromVirtualFile(e) {
            let t = e.stream;
            ((this.width = t.readInt32()),
              (this.height = t.readInt32()),
              (this.blockWidth = t.readInt32()),
              (this.blockHeight = t.readInt32()));
            var i = this.width * this.height,
              r = new Uint8Array(t.buffer, t.byteOffset + t.position, 4 * i);
            this.images = [];
            for (let a = 0; a < i; a++) {
              var s = (r[4 * a + 3] << 24) | (r[4 * a + 2] << 16) | (r[4 * a + 1] << 8) | r[4 * a];
              t.seek(s);
              s = new n.TmpImage(t, this.blockWidth, this.blockHeight);
              this.images.push(s);
            }
          }
        }),
      );
    },
  };
});
