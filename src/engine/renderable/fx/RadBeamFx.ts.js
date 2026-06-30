// === Reconstructed SystemJS module: engine/renderable/fx/RadBeamFx ===
// deps: ["three.meshline","game/Coords","util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/fx/RadBeamFx", ["three.meshline", "game/Coords", "util/math"], function (e, t) {
  "use strict";
  var h, u, i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        h = e;
      },
      function (e) {
        u = e;
      },
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      e(
        "RadBeamFx",
        (r = class {
          constructor(e, t, i, r, s, a) {
            ((this.camera = e),
              (this.sourcePos = t),
              (this.targetPos = i),
              (this.color = r),
              (this.durationSeconds = s),
              (this.width = a),
              (this.amplitude = 0));
          }
          setContainer(e) {
            this.container = e;
          }
          get3DObject() {
            return this.lineMesh;
          }
          create3DObject() {
            this.lineMesh || ((this.lineMesh = this.createObject()), (this.lineMesh.name = "fx_radbeam"));
          }
          update(e) {
            (this.firstUpdateMillis || (this.firstUpdateMillis = e),
              (this.timeLeft = Math.max(0, 1 - (e - this.firstUpdateMillis) / (1e3 * this.durationSeconds))));
            var t = i.truncToDecimals((u.Coords.LEPTONS_PER_TILE / 6) * (1 - this.timeLeft), 1);
            (t !== this.amplitude &&
              ((this.amplitude = t),
              this.lineMesh.geometry.dispose(),
              (this.lineMesh.geometry = this.createLineGeometry(this.sourcePos, this.targetPos, t))),
              this.isFinished() && (this.container.remove(this), this.dispose()));
          }
          createObject() {
            var e = this.sourcePos.clone(),
              t = this.targetPos.clone(),
              i = this.createLineGeometry(e, t, this.amplitude),
              r = this.camera.top,
              e = this.camera.right / this.camera.top,
              t = (2 * r) / Math.cos(this.camera.rotation.y),
              e = t * e,
              r = new h.MeshLineMaterial({
                color: this.color.clone(),
                lineWidth: this.width,
                resolution: new THREE.Vector2(e, t).multiplyScalar(
                  (r * Math.cos(this.camera.rotation.x)) / u.Coords.ISO_WORLD_SCALE,
                ),
                transparent: !0,
                sizeAttenuation: 0,
              });
            return new THREE.Mesh(i, r);
          }
          createLineGeometry(e, t, i) {
            let r = [];
            var s = t.clone().sub(e).length() / u.Coords.LEPTONS_PER_TILE,
              a = 15 * s;
            let n = new THREE.Vector3();
            for (let c = 0; c <= a; c++) {
              var o = c / a;
              (n.lerpVectors(e, t, o),
                (n.y += i * Math.sin(o * s * (u.Coords.LEPTONS_PER_TILE / Math.PI))),
                r.push(n.x, n.y, n.z));
            }
            let l = new h.MeshLine();
            return (l.setGeometry(r), l.geometry);
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
