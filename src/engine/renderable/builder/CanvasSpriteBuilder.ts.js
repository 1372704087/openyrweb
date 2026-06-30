// === Reconstructed SystemJS module: engine/renderable/builder/CanvasSpriteBuilder ===
// deps: ["engine/gfx/SpriteUtils","engine/renderable/builder/CanvasTextureAtlas"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/builder/CanvasSpriteBuilder",
  ["engine/gfx/SpriteUtils", "engine/renderable/builder/CanvasTextureAtlas"],
  function (e, t) {
    "use strict";
    var r, i, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        (e(
          "CanvasSpriteBuilder",
          (s = class s {
            static clearCaches() {
              s.textureCache.clear();
            }
            constructor(e, t) {
              ((this.images = e),
                (this.camera = t),
                (this.offset = { x: 0, y: 0 }),
                (this.align = { x: 0, y: 0 }),
                (this.opacity = 1),
                (this.forceTransparent = !1),
                (this.frustumCulled = !1),
                (this.frameGeometries = new Map()),
                this.setFrame(0));
            }
            setOffset(e) {
              this.offset = e;
            }
            setAlign(e, t) {
              var i;
              ((this.align = { x: e, y: t }),
                this.mesh &&
                  (this.frameGeometries.get(this.frameNo)?.dispose(),
                  (i = r.SpriteUtils.createSpriteGeometry(this.getSpriteGeometryOptions())),
                  this.frameGeometries.set(this.frameNo, i),
                  (this.mesh.geometry = i)));
            }
            initTexture() {
              if (s.textureCache.has(this.images)) this.atlas = s.textureCache.get(this.images);
              else {
                let e = new i.CanvasTextureAtlas();
                (e.pack(this.images), s.textureCache.set(this.images, e), (this.atlas = e));
              }
            }
            getSpriteGeometryOptions() {
              var e = this.images[this.frameNo],
                t = {
                  x: -e.width / 2 - this.align.x * (e.width / 2) + this.offset.x,
                  y: -e.height / 2 - this.align.y * (e.height / 2) + this.offset.y,
                };
              return {
                texture: this.atlas.getTexture(),
                textureArea: this.atlas.getImageRect(e),
                align: { x: 1, y: -1 },
                offset: t,
                camera: this.camera,
              };
            }
            setFrame(t) {
              if (this.frameNo !== t && ((this.frameNo = t), this.mesh)) {
                let e = this.frameGeometries.get(t);
                (e ||
                  ((e = r.SpriteUtils.createSpriteGeometry(this.getSpriteGeometryOptions())),
                  this.frameGeometries.set(t, e)),
                  (this.mesh.geometry = e));
              }
            }
            getFrame() {
              return this.frameNo;
            }
            getSize() {
              return { width: this.images[this.frameNo].width, height: this.images[this.frameNo].height };
            }
            get frameCount() {
              return this.images.length;
            }
            setOpacity(e) {
              var t = this.opacity;
              t !== e &&
                ((this.opacity = e),
                this.mesh && (this.mesh.material.opacity = e),
                Math.floor(t) === Math.floor(e) || this.forceTransparent || this.updateTransparency());
            }
            setForceTransparent(e) {
              this.forceTransparent !== e && ((this.forceTransparent = e), this.updateTransparency());
            }
            updateTransparency() {
              this.mesh && (this.mesh.material.transparent = this.forceTransparent || this.opacity < 1);
            }
            setExtraLight(e) {
              throw new Error("Not implemented");
            }
            setFrustumCulled(e) {
              ((this.frustumCulled = e), this.mesh && (this.mesh.frustumCulled = e));
            }
            build() {
              if (this.mesh) return this.mesh;
              this.initTexture();
              var e = r.SpriteUtils.createSpriteGeometry(this.getSpriteGeometryOptions());
              this.frameGeometries.set(this.frameNo, e);
              var t = new THREE.MeshBasicMaterial({
                map: this.atlas.getTexture(),
                flatShading: !0,
                opacity: this.opacity,
                transparent: this.opacity < 1 || this.forceTransparent,
              });
              let i = new THREE.Mesh(e, t);
              return ((i.matrixAutoUpdate = !1), (i.frustumCulled = this.frustumCulled), (this.mesh = i), i);
            }
            dispose() {
              (this.frameGeometries.forEach((e) => e.dispose()), this.mesh?.material?.dispose());
            }
          }),
        ),
          (s.textureCache = new Map()));
      },
    };
  },
);
