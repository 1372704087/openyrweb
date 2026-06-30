// === Reconstructed SystemJS module: data/vxl/Section ===
// deps: ["data/vxl/normals","data/vxl/VoxelField"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/vxl/Section", ["data/vxl/normals", "data/vxl/VoxelField"], function (e, t) {
  "use strict";
  var i, o, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
      function (e) {
        o = e;
      },
    ],
    execute: function () {
      e(
        "Section",
        (r = class {
          get spanX() {
            return this.maxBounds.x - this.minBounds.x;
          }
          get spanY() {
            return this.maxBounds.y - this.minBounds.y;
          }
          get spanZ() {
            return this.maxBounds.z - this.minBounds.z;
          }
          get scaleX() {
            return this.spanX / this.sizeX;
          }
          get scaleY() {
            return this.spanY / this.sizeY;
          }
          get scaleZ() {
            return this.spanZ / this.sizeZ;
          }
          get scale() {
            return new THREE.Vector3(this.scaleX, this.scaleY, this.scaleZ);
          }
          getAllVoxels() {
            let i = [],
              r = new o.VoxelField(this.sizeX + 1, this.sizeY + 1, this.sizeZ + 1);
            for (let n = 0, e = this.spans.length; n < e; n++) {
              var s = this.spans[n].voxels;
              for (let e = 0, t = s.length; e < t; e++) {
                var a = s[e];
                (i.push(a), r.add(a));
              }
            }
            return { voxels: i, voxelField: r };
          }
          getNormals() {
            switch (this.normalsMode) {
              case 1:
                return i.normals1;
              case 2:
                return i.normals2;
              case 3:
                return i.normals3;
              case 4:
                return i.normals4;
              default:
                throw new Error("Invalid normalsmode " + this.normalsMode);
            }
          }
          scaleHvaMatrix(e) {
            return (
              ((e = e.clone()).elements[12] *= this.hvaMultiplier),
              (e.elements[13] *= this.hvaMultiplier),
              (e.elements[14] *= this.hvaMultiplier),
              e
            );
          }
          toPlain() {
            return {
              name: this.name,
              normalsMode: this.normalsMode,
              minBounds: this.minBounds.toArray(),
              maxBounds: this.maxBounds.toArray(),
              sizeX: this.sizeX,
              sizeY: this.sizeY,
              sizeZ: this.sizeZ,
              hvaMultiplier: this.hvaMultiplier,
              transfMatrix: this.transfMatrix.toArray(),
              spans: this.spans,
            };
          }
          fromPlain(e) {
            return (
              (this.name = e.name),
              (this.normalsMode = e.normalsMode),
              (this.minBounds = new THREE.Vector3().fromArray(e.minBounds)),
              (this.maxBounds = new THREE.Vector3().fromArray(e.maxBounds)),
              (this.sizeX = e.sizeX),
              (this.sizeY = e.sizeY),
              (this.sizeZ = e.sizeZ),
              (this.hvaMultiplier = e.hvaMultiplier),
              (this.transfMatrix = new THREE.Matrix4().fromArray(e.transfMatrix)),
              (this.spans = e.spans),
              this
            );
          }
        }),
      );
    },
  };
});
