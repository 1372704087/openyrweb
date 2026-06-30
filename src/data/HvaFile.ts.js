// === Reconstructed SystemJS module: data/HvaFile ===
// deps: ["data/hva/Section","data/vfs/VirtualFile"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/HvaFile", ["data/hva/Section", "data/vfs/VirtualFile"], function (e, t) {
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
        "HvaFile",
        (r = class {
          constructor(e) {
            e instanceof i.VirtualFile && this.fromVirtualFile(e);
          }
          fromVirtualFile(e) {
            this.filename = e.filename;
            let t = e.stream;
            ((this.sections = []), t.readCString(16));
            var i = t.readInt32(),
              r = t.readInt32();
            for (let s = 0; s < r; ++s) {
              let e = new n.Section();
              ((e.name = t.readCString(16)), (e.matrices = new Array(i)), this.sections.push(e));
            }
            for (let a = 0; a < i; ++a) for (let e = 0; e < r; ++e) this.sections[e].matrices[a] = this.readMatrix(t);
          }
          readMatrix(e) {
            let t = [];
            for (let i = 0; i < 3; ++i) t.push(e.readFloat32(), e.readFloat32(), e.readFloat32(), e.readFloat32());
            return (t.push(0, 0, 0, 1), new THREE.Matrix4().fromArray(t).transpose());
          }
        }),
      );
    },
  };
});
