// === Reconstructed SystemJS module: data/PcxFile ===
// deps: ["pcx-js","engine/gfx/CanvasUtils"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/PcxFile", ["pcx-js", "engine/gfx/CanvasUtils"], function (e, t) {
  "use strict";
  var s, i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        s = e;
      },
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      e(
        "PcxFile",
        (r = class {
          constructor(e) {
            this.file = e;
            var t = this.file.stream;
            let i = new s.default(new Uint8Array(t.buffer, t.byteOffset, t.byteLength));
            var r = i.decode(),
              t = r.pixelArray;
            (this.fixAlpha(t), (this.width = r.width), (this.height = r.height), (this.data = t));
          }
          async toPngBlob() {
            var e = this.toCanvas();
            return await i.CanvasUtils.canvasToBlob(e);
          }
          toDataUrl() {
            return this.toCanvas().toDataURL();
          }
          toCanvas() {
            return i.CanvasUtils.canvasFromRgbaImageData(this.data, this.width, this.height);
          }
          fixAlpha(e) {
            for (let t = 0, i = e.length; t < i; t += 4)
              255 === e[t] && 0 === e[t + 1] && 255 === e[t + 2] && (e[t + 3] = 0);
          }
        }),
      );
    },
  };
});
