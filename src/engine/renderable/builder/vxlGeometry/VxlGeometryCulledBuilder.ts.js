// === Reconstructed SystemJS module: engine/renderable/builder/vxlGeometry/VxlGeometryCulledBuilder ===
// deps: ["engine/gfx/BufferGeometryUtils"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/builder/vxlGeometry/VxlGeometryCulledBuilder",
  ["engine/gfx/BufferGeometryUtils"],
  function (e, t) {
    "use strict";
    var s, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        e(
          "VxlGeometryCulledBuilder",
          (i = class {
            build(e) {
              let { voxels: a, voxelField: n } = e.getAllVoxels(),
                t = new THREE.BoxBufferGeometry(1, 1, 1);
              var o = t.getAttribute("position").array,
                l = o.length / 3,
                c = t.getAttribute("normal").array,
                h = t.getIndex().array;
              let u = [],
                d = [],
                g = [],
                p = [];
              var m = e.minBounds,
                f = e.scale,
                y = e.getNormals();
              let T = 0;
              for (let C = 0, r = a.length; C < r; C++) {
                var v = a[C],
                  b = y[Math.min(a[C].normalIndex, y.length - 1)];
                let e = new Array(l);
                for (let t = 0, i = 3 * l; t < i; t += 3)
                  n.get(v.x + c[t], v.y + c[t + 1], v.z + c[t + 2]) ||
                    ((e[t / 3] = T),
                    u.push(m.x + v.x * f.x + o[t], m.y + v.y * f.y + o[t + 1], m.z + v.z * f.z + o[t + 2]),
                    d.push(b.x, b.y, b.z),
                    g.push(v.colorIndex / 255, 0, 0),
                    T++);
                for (let r = 0, s = h.length; r < s; r += 3) {
                  var S = e[h[r]],
                    w = e[h[r + 1]],
                    E = e[h[r + 2]];
                  void 0 !== S && void 0 !== w && void 0 !== E && p.push(S, w, E);
                }
              }
              let i = new THREE.BufferGeometry();
              return (
                i.setIndex(new THREE.BufferAttribute(new Uint32Array(p), 1)),
                i.addAttribute("position", new THREE.BufferAttribute(new Float32Array(u), 3)),
                i.addAttribute("normal", new THREE.BufferAttribute(new Float32Array(d), 3)),
                i.addAttribute("color", new THREE.BufferAttribute(new Float32Array(g), 3)),
                (i = s.BufferGeometryUtils.mergeVertices(i)),
                i.computeBoundingBox(),
                i
              );
            }
          }),
        );
      },
    };
  },
);
