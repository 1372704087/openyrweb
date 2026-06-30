// === Reconstructed SystemJS module: engine/renderable/builder/vxlGeometry/VxlGeometryNaiveBuilder ===
// deps: ["engine/gfx/BufferGeometryUtils"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/builder/vxlGeometry/VxlGeometryNaiveBuilder",
  ["engine/gfx/BufferGeometryUtils"],
  function (e, t) {
    "use strict";
    var o, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          o = e;
        },
      ],
      execute: function () {
        e(
          "VxlGeometryNaiveBuilder",
          (i = class {
            build(e) {
              var { voxels: t, voxelField: i } = e.getAllVoxels();
              let r = new THREE.BoxBufferGeometry(1, 1, 1);
              var s = r.getAttribute("position").array.length / 3,
                a = r.getAttribute("normal").array;
              let n = new THREE.BufferGeometry();
              return (
                n.setIndex(this.createIndexAttr(t, r, s)),
                n.addAttribute("position", this.createPositionAttr(e, t, r)),
                n.addAttribute("normal", this.createNormalAttr(e, t, s)),
                n.addAttribute("color", this.createColorAttr(t, s, a, i)),
                (n = o.BufferGeometryUtils.mergeVertices(n)),
                n.computeBoundingBox(),
                n
              );
            }
            createPositionAttr(e, i, t) {
              var r = t.getAttribute("position").array,
                s = r.length;
              let a = new Float32Array(r.length * i.length);
              var n = e.minBounds,
                o = e.scale;
              for (let h = 0, u = i.length; h < u; h++) {
                var l = h * s,
                  c = i[h];
                for (let e = 0, t = r.length; e < t; e += 3)
                  ((a[l + e] = n.x + c.x * o.x + r[e]),
                    (a[l + e + 1] = n.y + c.y * o.y + r[e + 1]),
                    (a[l + e + 2] = n.z + c.z * o.z + r[e + 2]));
              }
              return new THREE.BufferAttribute(a, 3);
            }
            createNormalAttr(e, i, r) {
              let s = new Float32Array(r * i.length * 3);
              var a = e.getNormals();
              for (let l = 0, t = i.length; l < t; l++) {
                var n = l * r * 3,
                  o = a[Math.min(i[l].normalIndex, a.length - 1)];
                for (let e = 0, t = 3 * r; e < t; e += 3)
                  ((s[n + e] = o.x), (s[n + e + 1] = o.y), (s[n + e + 2] = o.z));
              }
              return new THREE.BufferAttribute(s, 3);
            }
            createColorAttr(i, r, s, a) {
              let n = new Float32Array(r * i.length * 3);
              for (let h = 0, e = i.length; h < e; h++) {
                var o = h * r * 3,
                  l = i[h];
                for (let e = 0, t = 3 * r; e < t; e += 3) {
                  var c = a.get(l.x + s[e], l.y + s[e + 1], l.z + s[e + 2]);
                  ((n[o + e] = c ? 0 : l.colorIndex / 255), (n[o + e + 1] = 0), (n[o + e + 2] = 0));
                }
              }
              return new THREE.BufferAttribute(n, 3);
            }
            createIndexAttr(i, e, r) {
              var s = e.getIndex().array;
              let a = new Uint32Array(i.length * s.length);
              for (let n = 0, o = i.length; n < o; n++)
                for (let e = 0, t = s.length; e < t; e++) a[n * t + e] = n * r + s[e];
              return new THREE.BufferAttribute(a, 1);
            }
          }),
        );
      },
    };
  },
);
