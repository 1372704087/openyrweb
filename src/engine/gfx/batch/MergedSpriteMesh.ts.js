// === Reconstructed SystemJS module: engine/gfx/batch/MergedSpriteMesh ===
// deps: ["util/array","engine/gfx/material/PaletteBasicMaterial"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/gfx/batch/MergedSpriteMesh",
  ["util/array", "engine/gfx/material/PaletteBasicMaterial"],
  function (e, t) {
    "use strict";
    var p, l, u, d, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          p = e;
        },
        function (e) {
          l = e;
        },
      ],
      execute: function () {
        ((u = new THREE.Vector3()),
          (d = new THREE.Vector4()),
          (r = class r extends THREE.Mesh {
            static createMergedGeometry(i, t, e) {
              let r = new THREE.BufferGeometry();
              for (var s of Object.keys(i.attributes)) {
                let e = i.getAttribute(s);
                var a = new e.array.constructor(t * e.array.length);
                r.addAttribute(s, new THREE.BufferAttribute(a, e.itemSize, e.normalized));
              }
              var n,
                o = i.getAttribute("position").count;
              (e instanceof l.PaletteBasicMaterial &&
                r.addAttribute("vertexColorMult", new THREE.BufferAttribute(new Float32Array(o * t * 4), 4)),
                e.palette &&
                  r.addAttribute("vertexPaletteOffset", new THREE.BufferAttribute(new Float32Array(o * t), 1)));
              for (n of Object.values(r.attributes)) n.setDynamic(!0);
              if (i.index) {
                r.setIndex(new THREE.BufferAttribute(new Uint32Array(t * i.index.array.length), 1));
                for (let e = 0; e < t; e++) {
                  let t = e * o;
                  r.index.array.set(
                    Uint32Array.from(i.index.array, (e) => e + t),
                    e * i.index.array.length,
                  );
                }
              }
              return r;
            }
            constructor(e, t, i) {
              (super(r.createMergedGeometry(e, i, t)),
                (this.maxInstances = i),
                (this.material = this.decorateMaterial(t.clone())),
                (this.verticesPerItem = e.getAttribute("position").count),
                (this.indicesPerItem = e.index?.count),
                (this.frustumCulled = !1));
            }
            decorateMaterial(e) {
              let t = e;
              return (
                t.defines ?? (t.defines = {}),
                e.palette && (t.defines.VERTEX_PALETTE_OFFSET = ""),
                e instanceof l.PaletteBasicMaterial && (t.useVertexColorMult = !0),
                e
              );
            }
            updateFromMeshes(t) {
              var e,
                i = this.geometry.attributes,
                r = i.position,
                s = i.uv,
                a = i.vertexColorMult,
                n = i.vertexPaletteOffset,
                o = t.length;
              if (o > this.maxInstances) throw new RangeError("Exceeded maximum number of instances");
              for (let h = 0; h < o; h++) {
                var l = h * this.verticesPerItem;
                let e = t[h];
                this.setGeometryAt(l, e.geometry, u.setFromMatrixPosition(e.matrixWorld), r, s);
                var c = e.getExtraLight();
                (a && this.setColorMultAt(l, d.set(1 + c.x, 1 + c.y, 1 + c.z, e.getOpacity()), a),
                  n && this.setPaletteIndexAt(l, e.getPaletteIndex(), n));
              }
              this.geometry.setDrawRange(0, o * (this.geometry.index ? this.indicesPerItem : this.verticesPerItem));
              for (e of Object.values(i))
                e.dynamic && (e.updateRange.count = o < this.maxInstances ? o * this.verticesPerItem * e.itemSize : -1);
            }
            setGeometryAt(e, t, i, r, s) {
              var a = t.attributes,
                n = a.position.array;
              let o = r.array;
              for (let g = 0; g < this.verticesPerItem; g++) {
                var l = 3 * (e + g),
                  c = Math.fround(n[3 * g] + Math.fround(i.x)),
                  h = Math.fround(n[3 * g + 1] + Math.fround(i.y)),
                  u = Math.fround(n[3 * g + 2] + Math.fround(i.z));
                (c === o[l] && h === o[1 + l] && u === o[2 + l]) ||
                  ((o[l] = c), (o[1 + l] = h), (o[2 + l] = u), (r.needsUpdate = !0));
              }
              let d = s.array;
              a = a.uv.array;
              p.equals(a, d.subarray(2 * e, 2 * e + a.length)) || (d.set(a, 2 * e), (s.needsUpdate = !0));
            }
            setColorMultAt(t, i, r) {
              if (r.getX(t) !== i.x || r.getY(t) !== i.y || r.getZ(t) !== i.z || r.getW(t) !== i.w) {
                r.needsUpdate = !0;
                for (let e = 0; e < this.verticesPerItem; e++) r.setXYZW(t + e, i.x, i.y, i.z, i.w);
              }
            }
            setPaletteIndexAt(t, i, r) {
              if (r.getX(t) !== i) {
                r.needsUpdate = !0;
                for (let e = 0; e < this.verticesPerItem; e++) r.setX(t + e, i);
              }
            }
            dispose() {
              (this.geometry.dispose(), this.material.dispose());
            }
          }),
          e("MergedSpriteMesh", r));
      },
    };
  },
);
