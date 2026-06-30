// === Reconstructed SystemJS module: engine/renderable/AlphaRenderable ===
// deps: ["data/Palette","engine/renderable/builder/ShpBuilder","util/Color","game/Coords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/AlphaRenderable",
  ["data/Palette", "engine/renderable/builder/ShpBuilder", "util/Color", "game/Coords"],
  function (e, t) {
    "use strict";
    var s, a, n, o, l;
    t && t.id;
    return {
      setters: [
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
          "AlphaRenderable",
          (l = class l {
            static getOrCreateAlphaPalette() {
              let i = l.alphaPalette;
              if (!i) {
                i = new s.Palette(new Array(768).fill(0));
                let e = [];
                for (let t = 0; t < 256; t++) {
                  var r = 127 < t ? 2 * (t - 127) : 0;
                  e.push(new n.Color(r, r, r));
                }
                (i.setColors(e), (l.alphaPalette = i));
              }
              return i;
            }
            constructor(e, t, i) {
              ((this.shpFile = e), (this.camera = t), (this.visible = !0), (this.drawOffset = { ...i }));
            }
            setVisible(e) {
              ((this.visible = e), this.object3d && (this.object3d.visible = e));
            }
            setSize(e) {
              ((this.shpSize = e), this.builder?.setSize(e));
            }
            create3DObject() {
              if (!this.object3d) {
                var r = l.getOrCreateAlphaPalette();
                let e = new a.ShpBuilder(this.shpFile, r, this.camera, o.Coords.ISO_WORLD_SCALE);
                (this.shpSize && e.setSize(this.shpSize), e.setFrame(0), e.setOffset(this.drawOffset));
                let t = e.build();
                ((t.visible = this.visible), (t.renderOrder = 999995));
                let i = t.material;
                ((i.depthTest = !1),
                  (i.depthWrite = !0),
                  (i.transparent = !0),
                  (i.blending = THREE.CustomBlending),
                  (i.blendEquation = THREE.AddEquation),
                  (i.blendSrc = THREE.DstColorFactor),
                  (i.blendDst = THREE.OneFactor),
                  (this.builder = e),
                  (this.object3d = t));
              }
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
