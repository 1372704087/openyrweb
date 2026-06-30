// === Reconstructed SystemJS module: engine/renderable/fx/TrailerSmokeFx ===
// deps: ["engine/AnimProps","engine/gfx/ImageUtils"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/fx/TrailerSmokeFx", ["engine/AnimProps", "engine/gfx/ImageUtils"], function (e, t) {
  "use strict";
  var r, s, a, n, o;
  t && t.id;
  return {
    setters: [
      function (e) {
        r = e;
      },
      function (e) {
        s = e;
      },
    ],
    execute: function () {
      ((n = a = 1e3),
        e(
          "TrailerSmokeFx",
          (o = class o {
            static clearTextureCache() {
              (this.textureCache.forEach((e) => e.dispose()), this.textureCache.clear());
            }
            constructor(e, t, i, r, s, a) {
              ((this.pos = e),
                (this.spawnDelayFrames = t),
                (this.smokeArt = i),
                (this.shpFile = r),
                (this.palette = s),
                (this.gameSpeed = a),
                (this.lifetimeSeconds = Number.POSITIVE_INFINITY),
                (this.finishRequested = !1),
                (this.finishProcessed = !1));
            }
            setContainer(e) {
              this.container = e;
            }
            create3DObject() {
              if (!this.particleGroup) {
                let e = o.textureCache.get(this.shpFile);
                (e ||
                  ((i = s.ImageUtils.convertShpToCanvas(this.shpFile, this.palette, !0)),
                  (e = new THREE.Texture(i)),
                  (e.minFilter = THREE.NearestFilter),
                  (e.magFilter = THREE.NearestFilter),
                  (e.needsUpdate = !0),
                  (e.flipY = !0),
                  o.textureCache.set(this.shpFile, e)),
                  (this.particleGroup = new SPE.Group({
                    texture: {
                      value: e,
                      frames: new THREE.Vector2(this.shpFile.numImages, 1),
                      frameCount: this.shpFile.numImages,
                      loop: 1,
                    },
                    maxParticleCount: a,
                    hasPerspective: !1,
                    transparent: !0,
                    alphaTest: 0,
                    blending: THREE.NormalBlending,
                  })),
                  (this.particleGroup.mesh.name = "fx_trailer_smoke"),
                  (this.particleGroup.mesh.frustumCulled = !1));
                var t = new r.AnimProps(this.smokeArt.art, this.shpFile),
                  i = ((this.smokeArt.art.getBool("Normalized") ? 2 : 1) * t.rate) / this.spawnDelayFrames,
                  t = (this.particleMaxAge = this.shpFile.numImages / t.rate),
                  t = (this.particleEmitter = new SPE.Emitter({
                    particleCount: n,
                    maxAge: { value: t },
                    activeMultiplier: i / (n / t),
                    position: { value: this.pos },
                    acceleration: { value: new THREE.Vector3() },
                    velocity: { value: new THREE.Vector3() },
                    opacity: { value: this.smokeArt.translucent ? [1, 0] : 1 - this.smokeArt.translucency },
                    size: { value: Math.max(this.shpFile.height, this.shpFile.width) },
                  }));
                this.particleGroup.addEmitter(t);
              }
            }
            get3DObject() {
              return this.particleGroup?.mesh;
            }
            update(e) {
              var t;
              ((this.particleEmitter.position.value = this.pos),
                this.lastUpdateMillis
                  ? ((t = e - this.lastUpdateMillis), this.particleGroup.tick((t / 1e3) * this.gameSpeed.value))
                  : ((this.firstUpdateMillis = e), this.particleGroup.tick(0)),
                (this.lastUpdateMillis = e),
                this.finishRequested &&
                  ((this.finishRequested = !1),
                  this.finishProcessed ||
                    ((this.finishProcessed = !0),
                    (t = ((e - this.firstUpdateMillis) / 1e3) * this.gameSpeed.value),
                    (this.lifetimeSeconds = t + this.particleMaxAge)),
                  this.particleEmitter.alive && this.particleEmitter.disable()),
                (this.timeLeft = Math.max(
                  0,
                  1 - (e - this.firstUpdateMillis) / ((1e3 * this.lifetimeSeconds) / this.gameSpeed.value),
                )),
                this.timeLeft || (this.container.remove(this), this.dispose()));
            }
            finishAndRemove() {
              this.finishRequested = !0;
            }
            disable() {
              this.particleEmitter.disable();
            }
            enable() {
              this.particleEmitter.enable();
            }
            dispose() {
              (this.particleGroup?.mesh.geometry.dispose(), this.particleGroup?.mesh.material.dispose());
            }
          }),
        ),
        (o.textureCache = new Map()));
    },
  };
});
