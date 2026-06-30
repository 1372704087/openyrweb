// === Reconstructed SystemJS module: engine/renderable/fx/RallyPointFx ===
// deps: ["three.meshline","game/Coords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/fx/RallyPointFx", ["three.meshline", "game/Coords"], function (e, t) {
  "use strict";
  var s, a, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        s = e;
      },
      function (e) {
        a = e;
      },
    ],
    execute: function () {
      e(
        "RallyPointFx",
        (i = class {
          constructor(e, t, i, r, s) {
            ((this.camera = e),
              (this.sourcePos = t),
              (this.targetPos = i),
              (this.color = r),
              (this.renderOrder = s),
              (this.needsUpdate = !1),
              (this.visible = !0),
              (this.cameraHash = this.camera.top + "_" + this.camera.right));
          }
          setContainer(e) {
            this.container = e;
          }
          get3DObject() {
            return this.wrapper;
          }
          create3DObject() {
            this.wrapper ||
              ((this.wrapper = new THREE.Object3D()),
              (this.wrapper.matrixAutoUpdate = !1),
              (this.lineMesh = this.createLineMesh()),
              (this.lineMesh.name = "fx_rallypoint"),
              (this.lineMesh.matrixAutoUpdate = !1),
              (this.shadowLineMesh = this.createLineShadowMesh()),
              (this.shadowLineMesh.name = "fx_rallypoint_shadow"),
              (this.shadowLineMesh.matrixAutoUpdate = !1),
              this.wrapper.add(this.lineMesh),
              this.wrapper.add(this.shadowLineMesh));
          }
          update(e) {
            this.lastUpdateMillis || (this.lastUpdateMillis = e);
            let i = (e - this.lastUpdateMillis) / (1e3 / 120);
            ((this.lastUpdateMillis = e), (this.wrapper.visible = this.visible));
            var t = this.camera.top + "_" + this.camera.right;
            if (
              (t !== this.cameraHash &&
                ((this.cameraHash = t),
                [this.lineMesh, this.shadowLineMesh].forEach((e) => {
                  e.material.uniforms.resolution.value.copy(this.computeResolution(this.camera));
                })),
              this.needsUpdate)
            ) {
              ((this.needsUpdate = !1),
                (this.lineMesh.geometry = this.createLineGeometry(this.sourcePos, this.targetPos)),
                (this.shadowLineMesh.geometry = this.createShadowLineGeometry(this.sourcePos, this.targetPos)),
                (this.lineMesh.material.uniforms.color.value = this.color.clone()));
              let i = this.sourcePos.distanceTo(this.targetPos);
              ([this.lineMesh, this.shadowLineMesh].forEach((e) => {
                let t = e.material;
                ((t.uniforms.dashArray.value = this.computeDashArray(i)), (t.depthTest = void 0 === this.renderOrder));
              }),
                (this.lineMesh.renderOrder = this.renderOrder ?? 0),
                (this.shadowLineMesh.renderOrder = void 0 !== this.renderOrder ? this.renderOrder - 1 : 0));
            }
            [this.lineMesh, this.shadowLineMesh].forEach((e) => {
              let t = e.material;
              t.uniforms.dashOffset.value -= (t.uniforms.dashArray.value / 50) * i;
            });
          }
          createLineMesh() {
            let e = this.sourcePos.clone();
            var t = this.targetPos.clone();
            let i = new THREE.Mesh(
              this.createLineGeometry(e, t),
              this.createLineMaterial(this.color.clone(), e.distanceTo(t)),
            );
            return (this.renderOrder && (i.renderOrder = this.renderOrder), i);
          }
          createLineShadowMesh() {
            let e = new THREE.Mesh(
              this.createShadowLineGeometry(this.sourcePos, this.targetPos),
              this.createLineMaterial(new THREE.Color(0), this.sourcePos.distanceTo(this.targetPos)),
            );
            return (this.renderOrder && (e.renderOrder = this.renderOrder - 1), e);
          }
          createShadowLineGeometry(e, t) {
            var i = new THREE.Vector3(+a.Coords.ISO_WORLD_SCALE, 0, +a.Coords.ISO_WORLD_SCALE);
            return this.createLineGeometry(e.clone().add(i), t.clone().add(i));
          }
          createLineGeometry(e, t) {
            let i = new THREE.Geometry();
            i.vertices.push(e, t);
            let r = new s.MeshLine();
            return (r.setGeometry(i), r.geometry);
          }
          createLineMaterial(e, t) {
            return new s.MeshLineMaterial({
              color: e,
              lineWidth: 2,
              resolution: this.computeResolution(this.camera),
              transparent: !0,
              sizeAttenuation: 0,
              dashArray: this.computeDashArray(t),
              depthTest: void 0 === this.renderOrder,
            });
          }
          computeDashArray(e) {
            return Math.min(1, 5 / e) * a.Coords.ISO_WORLD_SCALE;
          }
          computeResolution(e) {
            var t = e.top,
              i = e.right / e.top,
              r = (2 * t) / Math.cos(e.rotation.y);
            return new THREE.Vector2(r * i, r).multiplyScalar(
              (t * Math.cos(this.camera.rotation.x)) / a.Coords.ISO_WORLD_SCALE,
            );
          }
          remove() {
            this.container.remove(this);
          }
          dispose() {
            this.wrapper &&
              [this.lineMesh, this.shadowLineMesh].forEach((e) => {
                e && (e.geometry.dispose(), e.material.dispose());
              });
          }
        }),
      );
    },
  };
});
