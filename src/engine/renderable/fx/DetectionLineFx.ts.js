// === Reconstructed SystemJS module: engine/renderable/fx/DetectionLineFx ===
// deps: ["three.meshline","game/Coords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/fx/DetectionLineFx", ["three.meshline", "game/Coords"], function (e, t) {
  "use strict";
  var s, a, n, i;
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
      ((n = new THREE.Color(16777215)),
        e(
          "DetectionLineFx",
          (i = class i {
            constructor(e, t, i, r, s) {
              ((this.camera = e),
                (this.sourcePos = t),
                (this.targetPos = i),
                (this.color = r),
                (this.renderOrder = s),
                (this.needsUpdate = !1),
                (this.cameraHash = this.camera.top + "_" + this.camera.right),
                (this.computedColor = r),
                (this.lineHeadMaterial = new THREE.MeshBasicMaterial({
                  color: 16777215,
                  transparent: !0,
                  depthTest: !1,
                  depthWrite: !1,
                })));
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
                (this.wrapper.name = "fx_detectionline"),
                (this.lineMesh = this.createLineMesh()),
                (this.srcLineHead = this.createLineHead()),
                (this.destLineHead = this.createLineHead()),
                this.wrapper.add(this.srcLineHead),
                this.wrapper.add(this.destLineHead),
                this.wrapper.add(this.lineMesh),
                (this.needsUpdate = !0));
            }
            update(e) {
              this.lastUpdateMillis || (this.lastUpdateMillis = e);
              var t = (e - this.lastUpdateMillis) / (1e3 / 120);
              this.lastUpdateMillis = e;
              var i = this.camera.top + "_" + this.camera.right;
              i !== this.cameraHash &&
                ((this.cameraHash = i),
                this.lineMesh.material.uniforms.resolution.value.copy(this.computeResolution(this.camera)));
              let r = this.lineMesh.material;
              (this.needsUpdate &&
                ((this.needsUpdate = !1),
                this.lineMesh.geometry.dispose(),
                (this.lineMesh.geometry = this.createLineGeometry(this.sourcePos, this.targetPos)),
                (i = this.sourcePos.distanceTo(this.targetPos)),
                (r.uniforms.dashArray.value = this.computeDashArray(i)),
                this.srcLineHead.position.copy(this.sourcePos),
                this.destLineHead.position.copy(this.targetPos)),
                (r.uniforms.dashOffset.value -= (r.uniforms.dashArray.value / 50) * t));
              t = Math.sin(((e % 1e3) / 1e3) * Math.PI);
              let s = this.computedColor.copy(this.color).lerp(n, t);
              ((this.lineMesh.material.uniforms.color.value = s.clone()), this.lineHeadMaterial.color.set(s));
            }
            createLineMesh() {
              let e = this.sourcePos.clone();
              var t = this.targetPos.clone();
              let i = new THREE.Mesh(
                this.createLineGeometry(e, t),
                this.createLineMaterial(this.color.clone(), e.distanceTo(t)),
              );
              return ((i.renderOrder = this.renderOrder), i);
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
                lineWidth: 1,
                resolution: this.computeResolution(this.camera),
                transparent: !0,
                sizeAttenuation: 0,
                dashArray: this.computeDashArray(t),
                depthTest: !1,
              });
            }
            createLineHead() {
              let e = new THREE.Mesh(i.lineHeadGeometry, this.lineHeadMaterial);
              var t = new THREE.Quaternion().setFromEuler(this.camera.rotation);
              return (e.setRotationFromQuaternion(t), (e.renderOrder = this.renderOrder), e);
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
                (this.lineMesh.geometry.dispose(), this.lineMesh.material.dispose(), this.lineHeadMaterial.dispose());
            }
          }),
        ),
        (i.lineHeadGeometry = new THREE.PlaneGeometry(3 * a.Coords.ISO_WORLD_SCALE, 3 * a.Coords.ISO_WORLD_SCALE)));
    },
  };
});
