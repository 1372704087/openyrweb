// === Reconstructed SystemJS module: data/vxl/VxlHeader ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/vxl/VxlHeader", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      (e(
        "VxlHeader",
        (i = class {
          read(e) {
            ((this.fileName = e.readCString(16)),
              (this.paletteCount = e.readUint32()),
              (this.headerCount = e.readUint32()),
              (this.tailerCount = e.readUint32()),
              (this.bodySize = e.readUint32()),
              (this.paletteRemapStart = e.readUint8()),
              (this.paletteRemapEnd = e.readUint8()),
              e.seek(e.position + 768));
          }
        }),
      ),
        (i.size = 32));
    },
  };
});
