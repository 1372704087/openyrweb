// === Reconstructed SystemJS module: data/vxl/VoxelField ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/vxl/VoxelField", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "VoxelField",
        (i = class {
          constructor(e, t, i) {
            ((this.sizeX = e), (this.sizeY = t), (this.sizeZ = i), (this.arr = new Array(e * t * i)));
          }
          add(e) {
            this.arr[e.x + e.y * this.sizeX + e.z * this.sizeX * this.sizeY] = e;
          }
          get(e, t, i) {
            if (!(e >= this.sizeX || t >= this.sizeY || i >= this.sizeZ))
              return this.arr[e + t * this.sizeX + i * this.sizeX * this.sizeY];
          }
        }),
      );
    },
  };
});
