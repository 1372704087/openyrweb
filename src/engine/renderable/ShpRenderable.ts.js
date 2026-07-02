// === Reconstructed SystemJS module: engine/renderable/ShpRenderable ===
// deps: ["engine/renderable/builder/ShpBuilder","engine/renderable/ShadowRenderable","game/Coords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/ShpRenderable",
  ["engine/renderable/builder/ShpBuilder", "engine/renderable/ShadowRenderable", "game/Coords"],
  function (e, t) {
    "use strict";
    var g, p, m, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          m = e;
        },
      ],
      execute: function () {
        e(
          "ShpRenderable",
          (i = class {
            static factory(e, t, i, r, s = !1, a = 0, n = !1, o = 0, l = !1) {
              var c = s ? new p.ShadowRenderable(e, i, r, a) : void 0,
                h = m.Coords.ISO_WORLD_SCALE;
              let u = new g.ShpBuilder(e, t, i, h, n, o);
              u.setOffset(r);
              let d;
              return (
                l && ((d = new g.ShpBuilder(e, t, i, h, n, o)), d.setOffset(r), (d.flat = !0)),
                new this(u, c, d)
              );
            }
            constructor(e, t, i) {
              ((this.builder = e), (this.shadowRenderable = t), (this.zShapeFixBuilder = i));
            }
            get3DObject() {
              return this.target;
            }
            setBatched(e) {
              (this.builder.setBatched(e), this.zShapeFixBuilder?.setBatched(e), this.shadowRenderable?.setBatched(e));
            }
            setBatchPalettes(e) {
              (this.builder.setBatchPalettes(e), this.zShapeFixBuilder?.setBatchPalettes(e));
            }
            setSize(e) {
              (this.builder.setSize(e), this.zShapeFixBuilder?.setSize(e), this.shadowRenderable?.setSize(e));
            }
            getFlat() {
              return this.builder.flat;
            }
            setFlat(e) {
              this.builder.flat = e;
            }
            setFrame(e) {
              this.builder.getFrame() !== e &&
                (this.builder.setFrame(e), this.zShapeFixBuilder?.setFrame(e), this.shadowRenderable?.setBaseFrame(e));
            }
            setFrameOffset(e) {
              (this.builder.setFrameOffset(e),
                this.zShapeFixBuilder?.setFrameOffset(e),
                this.shadowRenderable?.setFrameOffset(e));
            }
            setPalette(e) {
              (this.builder.setPalette(e), this.zShapeFixBuilder?.setPalette(e));
            }
            setExtraLight(e) {
              (this.builder.setExtraLight(e), this.zShapeFixBuilder?.setExtraLight(e));
            }
            setOpacity(e) {
              (this.builder.setOpacity(e), this.zShapeFixBuilder?.setOpacity(e));
            }
            setForceTransparent(e) {
              (this.builder.setForceTransparent(e), this.zShapeFixBuilder?.setForceTransparent(e));
            }
            get frameCount() {
              return this.shadowRenderable ? this.builder.frameCount / 2 : this.builder.frameCount;
            }
            getShapeMesh() {
              return this.shapeMesh;
            }
            getShadowMesh() {
              return this.shadowMesh;
            }
            setShadowVisible(e) {
              this.shadowRenderable?.setVisible(e);
            }
            create3DObject() {
              if (!this.target) {
                var t,
                  i = (this.shapeMesh = this.builder.build());
                if (this.shadowRenderable || this.zShapeFixBuilder) {
                  let e = new THREE.Object3D();
                  ((e.matrixAutoUpdate = !1),
                    e.add(i),
                    this.shadowRenderable &&
                      (this.shadowRenderable.create3DObject(),
                      (t = this.shadowMesh = this.shadowRenderable.get3DObject()),
                      e.add(t)),
                    this.zShapeFixBuilder && ((t = this.zShapeFixBuilder.build()), e.add(t)),
                    (this.target = e));
                } else this.target = i;
              }
            }
            update(e) {}
            dispose() {
              (this.builder.dispose(), this.zShapeFixBuilder?.dispose(), this.shadowRenderable?.dispose());
            }
          }),
        );
      },
    };
  },
);
