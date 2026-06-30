// === Reconstructed SystemJS module: engine/renderable/fx/DamageSmokeFx ===
// deps: ["engine/AnimProps","engine/gfx/ImageUtils"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/fx/DamageSmokeFx", ["engine/AnimProps", "engine/gfx/ImageUtils"], function (e, t) {
  "use strict";
  var a, n, o, l, c;
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
      ((l = o = 1e3),
        e(
          "DamageSmokeFx",
          (c = class c {
            static clearTextureCache() {
              (this.textureCache.forEach((e) => e.dispose()), this.textureCache.clear());
            }
            constructor(e, t, i, r, s) {
              ((this.gameObject = e),
                (this.smokeArt = t),
                (this.shpFile = i),
                (this.palette = r),
                (this.gameSpeed = s),
                (this.lifetimeSeconds = Number.POSITIVE_INFINITY),
                (this.finishRequested = !1));
            }
            setContainer(e) {
              this.container = e;
            }
            create3DObject() {
              if (!this.particleGroup) {
                let e = c.textureCache.get(this.shpFile);
                (e ||
                  ((s = n.ImageUtils.convertShpToCanvas(this.shpFile, this.palette, !0)),
                  (e = new THREE.Texture(s)),
                  (e.minFilter = THREE.NearestFilter),
                  (e.magFilter = THREE.NearestFilter),
                  (e.needsUpdate = !0),
                  (e.flipY = !1),
                  c.textureCache.set(this.shpFile, e)),
                  (this.particleGroup = new SPE.Group({
                    texture: {
                      value: e,
                      frames: new THREE.Vector2(this.shpFile.numImages, 1),
                      frameCount: this.shpFile.numImages,
                      loop: 1,
                    },
                    maxParticleCount: o,
                    hasPerspective: !1,
                    transparent: !0,
                    alphaTest: 0,
                    blending: THREE.NormalBlending,
                  })),
                  (this.particleGroup.mesh.name = "fx_damage_smoke"));
                this.particleGroup.mesh.frustumCulled = !1;
                var t = new a.AnimProps(this.smokeArt.art, this.shpFile),
                  i = (this.smokeArt.art.getBool("Normalized") ? 2 : 1) * t.rate,
                  r = i / 10,
                  s = (this.particleMaxAge = (2 * this.shpFile.numImages) / t.rate),
                  t = 9 * i,
                  i = 0.05 * i,
                  t = (this.particleEmitter = new SPE.Emitter({
                    particleCount: l,
                    maxAge: { value: s },
                    activeMultiplier: r / (l / s),
                    position: { value: this.computeEmitterPosition() },
                    acceleration: { value: new THREE.Vector3(0, -i, 0), spread: new THREE.Vector3(2, 0, 2) },
                    velocity: { value: new THREE.Vector3(0, t, 0), spread: new THREE.Vector3(0.1 * t, 0, 0.1 * t) },
                    opacity: { value: 0.5 },
                    size: { value: Math.max(this.shpFile.height, this.shpFile.width) },
                  }));
                this.particleGroup.addEmitter(t);
              }
            }
            computeEmitterPosition() {
              return this.gameObject.position.worldPosition.clone().add(this.gameObject.rules.damageSmokeOffset);
            }
            get3DObject() {
              return this.particleGroup?.mesh;
            }
            update(e) {
              var t;
              ((this.particleEmitter.position.value = this.computeEmitterPosition()),
                this.lastUpdateMillis
                  ? ((t = e - this.lastUpdateMillis), this.particleGroup.tick((t / 1e3) * this.gameSpeed.value))
                  : ((this.firstUpdateMillis = e), this.particleGroup.tick(0)),
                (this.lastUpdateMillis = e),
                this.finishRequested &&
                  ((this.finishRequested = !1),
                  this.particleEmitter.alive &&
                    ((t = ((e - this.firstUpdateMillis) / 1e3) * this.gameSpeed.value),
                    (this.lifetimeSeconds = t + this.particleMaxAge),
                    this.particleEmitter.disable())),
                (this.timeLeft = Math.max(
                  0,
                  1 - (e - this.firstUpdateMillis) / ((1e3 * this.lifetimeSeconds) / this.gameSpeed.value),
                )),
                this.timeLeft || (this.container.remove(this), this.dispose()));
            }
            finishAndRemove() {
              this.finishRequested = !0;
            }
            dispose() {
              (this.particleGroup?.mesh.geometry.dispose(), this.particleGroup?.mesh.material.dispose());
            }
          }),
        ),
        (c.textureCache = new Map()));
    },
  };
});
