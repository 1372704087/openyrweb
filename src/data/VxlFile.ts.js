// === Reconstructed SystemJS module: data/VxlFile ===
// deps: ["data/vfs/VirtualFile","data/vxl/Section","data/vxl/VxlHeader"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/VxlFile", ["data/vfs/VirtualFile", "data/vxl/Section", "data/vxl/VxlHeader"], function (e, t) {
  "use strict";
  var i, c, r, s;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
      function (e) {
        c = e;
      },
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      e(
        "VxlFile",
        (s = class {
          constructor(e) {
            ((this.voxelCount = 0), e instanceof i.VirtualFile && this.fromVirtualFile(e));
          }
          fromVirtualFile(e) {
            this.filename = e.filename;
            let n = e.stream;
            if (((this.sections = []), !(n.byteLength < r.VxlHeader.size))) {
              let a = new r.VxlHeader();
              if ((a.read(n), a.headerCount && a.tailerCount && a.tailerCount === a.headerCount)) {
                for (let i = 0; i < a.headerCount; ++i) {
                  const l = new c.Section();
                  (this.readSectionHeader(l, n),
                    this.sections.find((e) => e.name === l.name) &&
                      console.warn(`Duplicate section name "${l.name}" found in VXL "${this.filename}".`),
                    this.sections.push(l));
                }
                var o = n.position;
                n.seek(n.position + a.bodySize);
                let e = [];
                for (let r = 0; r < a.tailerCount; ++r) e[r] = this.readSectionTailer(this.sections[r], n);
                let t = 0;
                for (let s = 0; s < a.headerCount; ++s)
                  (n.seek(o), (t += this.readSectionBodySpans(this.sections[s], e[s], n)));
                this.voxelCount = t;
              }
            }
          }
          readSectionHeader(e, t) {
            ((e.name = t.readCString(16)), t.readUint32(), t.readUint32(), t.readUint32());
          }
          readSectionTailer(e, t) {
            var i = t.readUint32(),
              r = t.readUint32(),
              s = t.readUint32();
            return (
              (e.hvaMultiplier = t.readFloat32()),
              (e.transfMatrix = this.readTransfMatrix(t)),
              (e.minBounds = new THREE.Vector3(t.readFloat32(), t.readFloat32(), t.readFloat32())),
              (e.maxBounds = new THREE.Vector3(t.readFloat32(), t.readFloat32(), t.readFloat32())),
              (e.sizeX = t.readUint8()),
              (e.sizeY = t.readUint8()),
              (e.sizeZ = t.readUint8()),
              (e.normalsMode = t.readUint8()),
              { startingSpanOffset: i, endingSpanOffset: r, dataSpanOffset: s }
            );
          }
          readTransfMatrix(e) {
            let t = [];
            for (let i = 0; i < 3; ++i) t.push(e.readFloat32(), e.readFloat32(), e.readFloat32(), e.readFloat32());
            return (t.push(0, 0, 0, 1), new THREE.Matrix4().fromArray(t).transpose());
          }
          readSectionBodySpans(e, t, i) {
            i.seek(i.position + t.startingSpanOffset);
            var { sizeX: r, sizeY: s, sizeZ: a } = e;
            let n = new Array(s);
            for (let u = 0; u < s; ++u) {
              n[u] = new Array(r);
              for (let e = 0; e < r; ++e) n[u][e] = i.readInt32();
            }
            let o = new Array(s);
            for (let d = 0; d < s; ++d) {
              o[d] = new Array(r);
              for (let e = 0; e < r; ++e) o[d][e] = i.readInt32();
            }
            let l = (e.spans = []),
              c = 0;
            for (let g = 0; g < s; ++g)
              for (let e = 0; e < r; ++e) {
                var h = { x: e, y: g, voxels: this.readSpanVoxels(n[g][e], o[g][e], e, g, a, i) };
                (l.push(h), (c += h.voxels.length));
              }
            return c;
          }
          readSpanVoxels(e, t, i, r, s, a) {
            if (-1 === e || -1 === t) return [];
            let n = [];
            for (let c = 0; c < s;) {
              c += a.readUint8();
              var o = a.readUint8();
              for (let e = 0; e < o; ++e) {
                var l = { x: i, y: r, z: c++, colorIndex: a.readUint8(), normalIndex: a.readUint8() };
                n.push(l);
              }
              a.readUint8();
            }
            return n;
          }
          fromPlain(e) {
            return (
              (this.sections = e.sections.map((e) => new c.Section().fromPlain(e))),
              (this.voxelCount = e.voxelCount),
              this
            );
          }
          toPlain() {
            return { sections: this.sections.map((e) => e.toPlain()), voxelCount: this.voxelCount };
          }
          getSection(e) {
            return this.sections[e];
          }
        }),
      );
    },
  };
});
