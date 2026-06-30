// === Reconstructed SystemJS module: engine/renderable/entity/WaypointLine ===
// deps: ["three.meshline","game/Coords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/entity/WaypointLine", ["three.meshline", "game/Coords"], function (e, t) {
  "use strict";
  var i, s, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
      function (e) {
        s = e;
      },
    ],
    execute: function () {
      e(
        "WaypointLine",
        (r = class {
          constructor(e, t) {
            ((this.linePath = e),
              (this.camera = t),
              (this.lastColor = this.linePath.color),
              (this.lastBgColor = this.linePath.bgColor),
              (this.lineHeadMaterial = new THREE.PointsMaterial({
                size: 6,
                sizeAttenuation: !1,
                color: e.color,
                depthTest: !1,
                depthWrite: !1,
                transparent: !0,
              })),
              (this.lineHeadBgMaterial = new THREE.PointsMaterial({
                size: 8,
                sizeAttenuation: !1,
                color: e.bgColor,
                depthTest: !1,
                depthWrite: !1,
                transparent: !0,
              })));
          }
          get3DObject() {
            return this.wrapper;
          }
          create3DObject() {
            if (!this.wrapper) {
              ((this.wrapper = new THREE.Object3D()), (this.wrapper.name = "waypoint_line"));
              let e = (this.meshLine = new i.MeshLine()),
                t = this.linePath.vertices.filter((e) => e.enabled).map((e) => e.position);
              ((this.lastLineVertexCount = t.length),
                e.setGeometry(t.map((e) => [e.x, e.y, e.z]).flat()),
                (this.fgLineMesh = new THREE.Mesh(
                  e.geometry,
                  this.createFgLineMaterial(new THREE.Color(this.linePath.color), this.computeLineLength(t)),
                )),
                (this.fgLineMesh.renderOrder = 1000002),
                this.wrapper.add(this.fgLineMesh),
                (this.bgLineMesh = new THREE.Mesh(
                  e.geometry,
                  this.createBgLineMaterial(new THREE.Color(this.linePath.bgColor)),
                )),
                (this.bgLineMesh.renderOrder = 1000001),
                this.wrapper.add(this.bgLineMesh),
                (this.lineHeadMeshes = this.createLineHeads(
                  this.linePath.vertices.filter((e) => e.enabled && e.lineHead).map((e) => e.position),
                )),
                this.lineHeadMeshes.forEach((e) => this.wrapper.add(e)));
            }
          }
          update(e) {
            this.lastUpdateMillis || (this.lastUpdateMillis = e);
            let i = (e - this.lastUpdateMillis) / (1e3 / 120);
            this.lastUpdateMillis = e;
            var t = this.camera.top + "_" + this.camera.right;
            if (
              (t !== this.cameraHash &&
                ((this.cameraHash = t),
                [this.fgLineMesh, this.bgLineMesh].forEach((e) => {
                  e.material.uniforms.resolution.value.copy(this.computeResolution(this.camera));
                })),
              this.linePath.verticesNeedUpdate)
            ) {
              this.linePath.verticesNeedUpdate = !1;
              let e = this.linePath.vertices.filter((e) => e.enabled).map((e) => e.position);
              (this.lastLineVertexCount !== e.length &&
                ((this.lastLineVertexCount = e.length), (this.meshLine.attributes = void 0)),
                this.meshLine.setGeometry(e.map((e) => [e.x, e.y, e.z]).flat()));
              let i = this.computeLineLength(e);
              ([this.fgLineMesh].forEach((e) => {
                let t = e.material;
                t.uniforms.dashArray.value = this.computeDashArray(i);
              }),
                this.updateLineHeads(
                  this.linePath.vertices.filter((e) => e.enabled && e.lineHead).map((e) => e.position),
                ));
            }
            (this.linePath.color !== this.lastColor &&
              ((this.lastColor = this.linePath.color),
              (this.fgLineMesh.material.uniforms.color.value = new THREE.Color(this.linePath.color)),
              this.lineHeadMaterial.color.set(this.linePath.color)),
              this.linePath.bgColor !== this.lastBgColor &&
                ((this.lastBgColor = this.linePath.bgColor),
                (this.bgLineMesh.material.uniforms.color.value = new THREE.Color(this.linePath.bgColor)),
                this.lineHeadBgMaterial.color.set(this.linePath.bgColor)),
              [this.fgLineMesh].forEach((e) => {
                let t = e.material;
                t.uniforms.dashOffset.value -= (t.uniforms.dashArray.value / 50) * i;
              }));
          }
          computeLineLength(e) {
            let t = 0;
            for (let i = 1, r = e.length; i < r; i++) t += e[i].distanceTo(e[i - 1]);
            return t;
          }
          createFgLineMaterial(e, t) {
            return new i.MeshLineMaterial({
              color: e,
              lineWidth: 2,
              resolution: this.computeResolution(this.camera),
              transparent: !0,
              sizeAttenuation: 0,
              dashArray: this.computeDashArray(t),
              depthTest: !1,
            });
          }
          createBgLineMaterial(e) {
            return new i.MeshLineMaterial({
              color: e,
              lineWidth: 4,
              resolution: this.computeResolution(this.camera),
              transparent: !0,
              sizeAttenuation: 0,
              depthTest: !1,
            });
          }
          computeDashArray(e) {
            return Math.min(1, 5 / e) * s.Coords.ISO_WORLD_SCALE;
          }
          computeResolution(e) {
            var t = e.top,
              i = e.right / e.top,
              r = (2 * t) / Math.cos(e.rotation.y);
            return new THREE.Vector2(r * i, r).multiplyScalar(
              (t * Math.cos(this.camera.rotation.x)) / s.Coords.ISO_WORLD_SCALE,
            );
          }
          createLineHeads(e) {
            let t = new THREE.BufferGeometry();
            t.addAttribute(
              "position",
              new THREE.BufferAttribute(new Float32Array(e.map((e) => [e.x, e.y, e.z]).flat()), 3),
            );
            let i = new THREE.Points(t, this.lineHeadMaterial);
            i.renderOrder = 1000004;
            let r = new THREE.Points(t, this.lineHeadBgMaterial);
            return ((r.renderOrder = 1000003), [i, r]);
          }
          updateLineHeads(e) {
            var r = e.map((e) => [e.x, e.y, e.z]).flat();
            let t = this.lineHeadMeshes[0].geometry,
              s = t.getAttribute("position");
            if (s.array.length !== r.length)
              t.addAttribute("position", new THREE.BufferAttribute(new Float32Array(r), 3));
            else {
              let e = s.array;
              for (let t = 0, i = e.length; t < i; t++) e[t] = r[t];
              s.needsUpdate = !0;
            }
          }
          dispose() {
            ([this.fgLineMesh, this.bgLineMesh].forEach((e) => {
              e && (e.geometry.dispose(), e.material.dispose());
            }),
              this.lineHeadMeshes?.forEach((e) => e.geometry.dispose()),
              this.lineHeadMaterial.dispose(),
              this.lineHeadBgMaterial.dispose());
          }
        }),
      );
    },
  };
});
