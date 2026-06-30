// === Reconstructed SystemJS module: engine/gfx/BufferGeometryUtils ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gfx/BufferGeometryUtils", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "BufferGeometryUtils",
        (i = class {
          static mergeVertices(r, e = 1e-4) {
            e = Math.max(e, Number.EPSILON);
            const s = {},
              a = r.getIndex();
            var t = r.getAttribute("position"),
              i = (a || t).count;
            let n = 0;
            var o = Object.keys(r.attributes);
            const l = {},
              c = {},
              h = [],
              u = [(e, t) => e.getX(t), (e, t) => e.getY(t), (e, t) => e.getZ(t), (e, t) => e.getW(t)];
            for (let A = 0, M = o.length; A < M; A++) {
              var d = o[A];
              l[d] = [];
              var g = r.morphAttributes[d];
              g && (c[d] = new Array(g.length).fill(void 0).map(() => []));
            }
            var t = Math.log10(1 / e),
              p = Math.pow(10, t);
            for (let R = 0; R < i; R++) {
              var m = a ? a.getX(R) : R;
              let i = "";
              for (let t = 0, e = o.length; t < e; t++) {
                var f = o[t],
                  y = r.getAttribute(f),
                  T = y.itemSize;
                for (let e = 0; e < T; e++) i += ~~(u[e](y, m) * p) + ",";
              }
              if (i in s) h.push(s[i]);
              else {
                for (let t = 0, e = o.length; t < e; t++) {
                  var v = o[t],
                    b = r.getAttribute(v),
                    S = r.morphAttributes[v],
                    w = b.itemSize;
                  const P = l[v],
                    I = c[v];
                  for (let e = 0; e < w; e++) {
                    const k = u[e];
                    if ((P.push(k(b, m)), S)) for (let e = 0, t = S.length; e < t; e++) I[e].push(k(S[e], m));
                  }
                }
                ((s[i] = n), h.push(n), n++);
              }
            }
            const E = r.clone();
            for (let B = 0, N = o.length; B < N; B++) {
              var C = o[B];
              const j = r.getAttribute(C);
              var x = new j.array.constructor(l[C]),
                x = new THREE.BufferAttribute(x, j.itemSize, j.normalized);
              if ((E.addAttribute(C, x), C in c))
                for (let e = 0; e < c[C].length; e++) {
                  const L = r.morphAttributes[C][e];
                  var O = new L.array.constructor(c[C][e]),
                    O = new THREE.BufferAttribute(O, L.itemSize, L.normalized);
                  E.morphAttributes[C][e] = O;
                }
            }
            return (E.setIndex(new THREE.BufferAttribute(new Uint32Array(h), 1)), E);
          }
          static mergeBufferGeometries(r, t = !1) {
            var i = null !== r[0].index;
            const s = new Set(Object.keys(r[0].attributes)),
              a = {},
              n = new THREE.BufferGeometry();
            let o = 0;
            for (let c = 0; c < r.length; ++c) {
              var l = r[c];
              let e = 0;
              if (i != (null !== l.index))
                throw new Error(
                  "mergeBufferGeometries() failed with geometry at index " +
                    c +
                    ". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.",
                );
              if (Object.keys(l.morphAttributes).length)
                throw new Error(
                  "mergeBufferGeometries() failed with geometry at index " + c + ". Morph attributes are not supported",
                );
              for (const h in l.attributes) {
                if (!s.has(h))
                  throw new Error(
                    "mergeBufferGeometries() failed with geometry at index " +
                      c +
                      '. All geometries must have compatible attributes; make sure "' +
                      h +
                      '" attribute exists among all geometries, or in none of them.',
                  );
                (void 0 === a[h] && (a[h] = []), a[h].push(l.attributes[h]), e++);
              }
              if (e !== s.size)
                throw new Error(
                  "mergeBufferGeometries() failed with geometry at index " +
                    c +
                    ". Make sure all geometries have the same number of attributes.",
                );
              if (t) {
                let e;
                if (i) e = l.index.count;
                else {
                  if (void 0 === l.attributes.position)
                    throw new Error(
                      "mergeBufferGeometries() failed with geometry at index " +
                        c +
                        ". The geometry must have either an index or a position attribute",
                    );
                  e = l.attributes.position.count;
                }
                (n.addGroup(o, e, c), (o += e));
              }
            }
            if (i) {
              let t = 0;
              const u = [];
              for (let i = 0; i < r.length; ++i) {
                const d = r[i].index;
                for (let e = 0; e < d.count; ++e) u.push(d.getX(e) + t);
                t += r[i].attributes.position.count;
              }
              n.setIndex(new THREE.BufferAttribute(new (65535 < u.length ? Uint32Array : Uint16Array)(u), 1));
            }
            for (const g in a) {
              var e = this.mergeBufferAttributes(a[g]);
              if (!e) throw new Error("mergeBufferGeometries() failed while trying to merge the " + g + " attribute.");
              n.addAttribute(g, e);
            }
            return n;
          }
          static mergeBufferAttributes(e) {
            let t,
              i,
              r,
              s = 0;
            for (let l = 0; l < e.length; ++l) {
              var a = e[l];
              if (a.isInterleavedBufferAttribute)
                throw new Error("mergeBufferAttributes() failed. InterleavedBufferAttributes are not supported.");
              if ((void 0 === t && (t = a.array.constructor), t !== a.array.constructor))
                throw new Error(
                  "mergeBufferAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.",
                );
              if ((void 0 === i && (i = a.itemSize), i !== a.itemSize))
                throw new Error(
                  "mergeBufferAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.",
                );
              if ((void 0 === r && (r = a.normalized), r !== a.normalized))
                throw new Error(
                  "mergeBufferAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.",
                );
              s += a.array.length;
            }
            const n = new t(s);
            let o = 0;
            for (let c = 0; c < e.length; ++c) (n.set(e[c].array, o), (o += e[c].array.length));
            return new THREE.BufferAttribute(n, i, r);
          }
        }),
      );
    },
  };
});
