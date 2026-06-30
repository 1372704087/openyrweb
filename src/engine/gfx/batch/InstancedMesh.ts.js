// === Reconstructed SystemJS module: engine/gfx/batch/InstancedMesh ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gfx/batch/InstancedMesh", [], function (e, t) {
  "use strict";
  var a, i, r, n, s;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      (((a = new THREE.MeshDepthMaterial()).depthPacking = THREE.RGBADepthPacking),
        (a.clipping = !0),
        (a.defines = { INSTANCE_TRANSFORM: "" }),
        (s = THREE.ShaderLib.distanceRGBA),
        (i = THREE.UniformsUtils.clone(s.uniforms)),
        (r = { USE_SHADOWMAP: "", INSTANCE_TRANSFORM: "" }),
        (n = new THREE.ShaderMaterial({
          defines: r,
          uniforms: i,
          vertexShader: s.vertexShader,
          fragmentShader: s.fragmentShader,
          clipping: !0,
        })),
        (s = class extends THREE.Mesh {
          constructor(e, t, i, r, s = !1) {
            (super(new THREE.InstancedBufferGeometry().copy(e)),
              (this.maxInstances = i),
              (this.uniformScale = r),
              (this.useInstanceColor = s),
              this.initAttributes(this.geometry),
              (this.material = this.decorateMaterial(t.clone())),
              (this.frustumCulled = !1),
              (this.customDepthMaterial = a),
              (this.customDistanceMaterial = n));
          }
          initAttributes(i) {
            let e = [];
            for (let n = 0; n < 4; n++)
              e.push({
                name: "instanceMatrix" + n,
                data: new Float32Array(4 * this.maxInstances),
                itemSize: 4,
                normalized: !0,
              });
            (this.useInstanceColor &&
              e.push({
                name: "instanceColor",
                data: new Uint8Array(3 * this.maxInstances),
                itemSize: 3,
                normalized: !0,
              }),
              e.push({
                name: "instanceOpacity",
                data: new Float32Array(this.maxInstances).fill(1),
                itemSize: 1,
                normalized: !0,
              }));
            for (var { name: t, data: r, itemSize: s, normalized: a } of e) {
              let e = new THREE.InstancedBufferAttribute(r, s, a, 1);
              ((e.dynamic = !0), i.addAttribute(t, e));
            }
            this.instanceMatrixAttributes = new Array(4).fill(0).map((e, t) => i.getAttribute("instanceMatrix" + t));
          }
          decorateMaterial(e) {
            let t = e;
            return (
              t.defines ?? (t.defines = {}),
              (t.defines.INSTANCE_TRANSFORM = ""),
              this.uniformScale ? (t.defines.INSTANCE_UNIFORM = "") : delete t.defines.INSTANCE_UNIFORM,
              this.useInstanceColor ? (t.defines.INSTANCE_COLOR = "") : delete t.defines.INSTANCE_COLOR,
              (t.defines.INSTANCE_OPACITY = ""),
              e
            );
          }
          setRenderCount(e) {
            if (e > this.maxInstances) throw new RangeError("Exceeded maximum number of instances");
            this.geometry.maxInstancedCount = e;
          }
          setMatrixAt(e, t) {
            for (let r = 0; r < 4; r++) {
              var i = 4 * r;
              this.instanceMatrixAttributes[r].setXYZW(
                e,
                t.elements[i++],
                t.elements[i++],
                t.elements[i++],
                t.elements[+i],
              );
            }
          }
          updateFromMeshes(t) {
            var e,
              i = !!t[0].material.palette,
              r = this.geometry.attributes;
            let s = r.instanceOpacity,
              a = r.instancePaletteOffset,
              n = r.instanceExtraLight;
            for (let h = 0, u = t.length; h < u; h++) {
              let e = t[h];
              this.setMatrixAt(h, e.matrixWorld);
              var o,
                l,
                c = e.getOpacity();
              (s.getX(h) !== c && (s.setX(h, c), (s.needsUpdate = !0)),
                i &&
                  ((o = e.getPaletteIndex()),
                  a.getX(h) !== o && (a.setX(h, o), (a.needsUpdate = !0)),
                  (l = e.getExtraLight()),
                  (c = Math.fround(l.x)),
                  (o = Math.fround(l.y)),
                  (l = Math.fround(l.z)),
                  (c === n.getX(h) && o === n.getY(h) && l === n.getZ(h)) ||
                    (n.setXYZ(h, c, o, l), (n.needsUpdate = !0))));
            }
            this.setRenderCount(t.length);
            for (e of this.instanceMatrixAttributes) e.needsUpdate = !0;
          }
          dispose() {
            (this.geometry.dispose(), this.material.dispose());
          }
        }),
        e("InstancedMesh", s));
    },
  };
});
