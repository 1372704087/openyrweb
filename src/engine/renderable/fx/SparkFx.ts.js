// === Reconstructed SystemJS module: engine/renderable/fx/SparkFx ===
// deps: ["game/Coords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/fx/SparkFx", ["game/Coords"], function (e, t) {
  "use strict";
  var i, s, r, a, n;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      ((s = 1),
        (a = r = 100),
        e(
          "SparkFx",
          (n = class n {
            constructor(e, t, i, r) {
              ((this.pos = e),
                (this.color = t),
                (this.spawnDurationSeconds = i),
                (this.gameSpeed = r),
                (this.totalDurationSeconds = i + s));
            }
            setContainer(e) {
              this.container = e;
            }
            create3DObject() {
              var e;
              this.particleGroup ||
                (n.sparkTex ||
                  ((n.sparkTex = new THREE.DataTexture(new Uint8Array(4).fill(255), 1, 1, THREE.RGBAFormat)),
                  (n.sparkTex.needsUpdate = !0)),
                (this.particleGroup = new SPE.Group({ texture: { value: n.sparkTex }, maxParticleCount: r })),
                (this.particleGroup.mesh.name = "fx_spark"),
                (this.particleGroup.mesh.frustumCulled = !1),
                (e = this.particleEmitter =
                  new SPE.Emitter({
                    maxAge: { value: s },
                    position: {
                      value: this.pos,
                      spread: new THREE.Vector3(10, 0, 10).multiplyScalar(i.Coords.ISO_WORLD_SCALE),
                    },
                    acceleration: {
                      value: new THREE.Vector3(0, -50, 0).multiplyScalar(i.Coords.ISO_WORLD_SCALE),
                      spread: new THREE.Vector3(0, 0, 0),
                    },
                    velocity: {
                      value: new THREE.Vector3(0, 30, 0).multiplyScalar(i.Coords.ISO_WORLD_SCALE),
                      spread: new THREE.Vector3(40, 5, 40).multiplyScalar(i.Coords.ISO_WORLD_SCALE),
                    },
                    color: { value: [this.color] },
                    opacity: { value: [1, 0.5] },
                    size: { value: 1 },
                    particleCount: a,
                  })),
                this.particleGroup.addEmitter(e));
            }
            get3DObject() {
              return this.particleGroup?.mesh;
            }
            update(e) {
              var t;
              (this.lastUpdateMillis
                ? ((t = e - this.lastUpdateMillis), this.particleGroup.tick((t / 1e3) * this.gameSpeed.value))
                : ((this.firstUpdateMillis = e), this.particleGroup.tick(0)),
                (this.lastUpdateMillis = e),
                this.particleEmitter.alive &&
                  e - this.firstUpdateMillis >= (1e3 * this.spawnDurationSeconds) / this.gameSpeed.value &&
                  this.particleEmitter.disable(),
                (this.timeLeft = Math.max(
                  0,
                  1 - (e - this.firstUpdateMillis) / ((1e3 * this.totalDurationSeconds) / this.gameSpeed.value),
                )),
                this.timeLeft || (this.container.remove(this), this.dispose()));
            }
            dispose() {
              (this.particleGroup?.mesh.geometry.dispose(), this.particleGroup?.mesh.material.dispose());
            }
          }),
        ));
    },
  };
});
