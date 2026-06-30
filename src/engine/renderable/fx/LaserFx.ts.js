// === Reconstructed SystemJS module: engine/renderable/fx/LaserFx ===
// deps: ["three.meshline","game/Coords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/fx/LaserFx", ["three.meshline", "game/Coords"], function (e, t) {
  "use strict";
  var a, n, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        a = e;
      },
      function (e) {
        n = e;
      },
    ],
    execute: function () {
      e(
        "LaserFx",
        (i = class {
          constructor(e, t, i, r, s, a) {
            ((this.camera = e),
              (this.sourcePos = t),
              (this.targetPos = i),
              (this.color = r),
              (this.durationSeconds = s),
              (this.width = a));
          }
          setContainer(e) {
            this.container = e;
          }
          get3DObject() {
            return this.lineMesh;
          }
          create3DObject() {
            this.lineMesh || ((this.lineMesh = this.createObject()), (this.lineMesh.name = "fx_laser"));
          }
          update(e) {
            (this.firstUpdateMillis || (this.firstUpdateMillis = e),
              (this.timeLeft = Math.max(0, 1 - (e - this.firstUpdateMillis) / (1e3 * this.durationSeconds))),
              (this.lineMesh.material.uniforms.opacity.value = +this.timeLeft),
              this.isFinished() && (this.container.remove(this), this.dispose()));
          }
          createObject() {
            var e = this.sourcePos.clone(),
              t = this.targetPos.clone();
            let i = new THREE.Geometry();
            i.vertices.push(e, t);
            let r = new a.MeshLine();
            r.setGeometry(i);
            var s = this.camera.top,
              e = this.camera.right / this.camera.top,
              t = (2 * s) / Math.cos(this.camera.rotation.y),
              e = t * e,
              s = new a.MeshLineMaterial({
                color: this.color.clone(),
                lineWidth: this.width,
                resolution: new THREE.Vector2(e, t).multiplyScalar(
                  (s * Math.cos(this.camera.rotation.x)) / n.Coords.ISO_WORLD_SCALE,
                ),
                transparent: !0,
                sizeAttenuation: 0,
                blending: THREE.AdditiveBlending,
              });
            return new THREE.Mesh(r.geometry, s);
          }
          isFinished() {
            return 0 === this.timeLeft;
          }
          dispose() {
            this.lineMesh && (this.lineMesh.geometry.dispose(), this.lineMesh.material.dispose());
          }
        }),
      );
    },
  };
});
