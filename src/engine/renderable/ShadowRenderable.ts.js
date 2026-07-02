// === Reconstructed SystemJS module: engine/renderable/ShadowRenderable ===
// deps: ["data/Palette","engine/renderable/builder/ShpBuilder","game/Coords","engine/IsoCoords","engine/renderable/entity/map/MapSurface"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/ShadowRenderable",
  [
    "data/Palette",
    "engine/renderable/builder/ShpBuilder",
    "game/Coords",
    "engine/IsoCoords",
    "engine/renderable/entity/map/MapSurface",
  ],
  function (e, t) {
    "use strict";
    var i, s, a, n, o, l;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
      ],
      execute: function () {
        e(
          "ShadowRenderable",
          (l = class l {
            static getOrCreateShadowPalette() {
              let e = l.shadowPalette;
              return (e || ((e = new i.Palette(new Array(768).fill(0))), (l.shadowPalette = e)), e);
            }
            constructor(e, t, i, r = 0) {
              ((this.shpFile = e),
                (this.camera = t),
                (this.shadowHeightTileAdjust = r),
                (this.baseFrameNo = 0),
                (this.frameOffset = 0),
                (this.visible = !0),
                (this.useBatching = !1),
                (this.drawOffset = { ...i }));
            }
            setVisible(e) {
              var t;
              ((this.visible = e),
                this.object3d &&
                  ((t = this.computeShadowFrameNo(this.baseFrameNo)),
                  (this.object3d.visible = e && t >= 0 && this.frameHasShadowData(t))));
            }
            setSize(e) {
              ((this.shpSize = e), this.builder?.setSize(e));
            }
            setBatched(e) {
              ((this.useBatching = e), this.builder?.setBatched(e));
            }
            setBaseFrame(e) {
              var t;
              ((this.baseFrameNo = e),
                this.builder &&
                  ((t = this.computeShadowFrameNo(e)),
                  t >= 0
                    ? (this.builder.setFrame(t),
                      (this.object3d.visible = this.visible && this.frameHasShadowData(t)))
                    : (this.object3d.visible = !1)));
            }
            setFrameOffset(e) {
              ((this.frameOffset = e), this.builder && this.builder.setFrameOffset(e));
            }
            computeShadowFrameNo(e) {
              let t = this.shpFile.numImages / 2 + e;
              return Number.isInteger(t) && t < this.shpFile.numImages ? t : -1;
            }
            create3DObject() {
              if (!this.object3d) {
                var i = l.getOrCreateShadowPalette();
                let e = new s.ShpBuilder(this.shpFile, i, this.camera, a.Coords.ISO_WORLD_SCALE);
                (this.shpSize && e.setSize(this.shpSize),
                  e.setFrameOffset(this.frameOffset),
                  e.setBatched(this.useBatching),
                  this.useBatching && e.setBatchPalettes([i]),
                  (e.flat = !0));
                var r = this.computeShadowFrameNo(this.baseFrameNo);
                (e.setFrame(Math.max(0, r)),
                  this.shadowHeightTileAdjust &&
                    ((i = n.IsoCoords.tileHeightToScreen(this.shadowHeightTileAdjust)), (this.drawOffset.y += -i)),
                  e.setOffset(this.drawOffset),
                  e.setOpacity(0.5));
                let t = e.build();
                (this.shadowHeightTileAdjust &&
                  ((t.position.y += a.Coords.tileHeightToWorld(-this.shadowHeightTileAdjust)), t.updateMatrix()),
                  (t.visible = this.visible && r >= 0 && this.frameHasShadowData(r)),
                  (t.position.y += o.MAGIC_OFFSET / 5),
                  (t.material.polygonOffset = !0),
                  (t.material.polygonOffsetFactor = -1),
                  (t.material.polygonOffsetUnits = -1),
                  t.updateMatrix(),
                  (this.builder = e),
                  (this.object3d = t));
              }
            }
            frameHasShadowData(e) {
              return e >= 0 && !!this.shpFile.getImage(this.frameOffset + e).imageData.length;
            }
            get3DObject() {
              return this.object3d;
            }
            update(e) {}
            dispose() {
              this.builder?.dispose();
            }
          }),
        );
      },
    };
  },
);
