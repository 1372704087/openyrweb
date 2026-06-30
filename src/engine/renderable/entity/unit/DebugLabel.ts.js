// === Reconstructed SystemJS module: engine/renderable/entity/unit/DebugLabel ===
// deps: ["engine/gfx/SpriteUtils","engine/gfx/CanvasUtils","game/Coords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/unit/DebugLabel",
  ["engine/gfx/SpriteUtils", "engine/gfx/CanvasUtils", "game/Coords"],
  function (e, t) {
    "use strict";
    var s, h, a, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          s = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          a = e;
        },
      ],
      execute: function () {
        e(
          "DebugLabel",
          (i = class {
            constructor(e, t, i) {
              ((this.text = e), (this.color = t), (this.camera = i));
            }
            get3DObject() {
              return this.mesh;
            }
            create3DObject() {
              if (!this.mesh) {
                let e = new THREE.Color(this.color);
                var t = 0.5 < 0.299 * e.r + 0.587 * e.g + 0.114 * e.b ? "black" : "white",
                  t = (this.texture = this.createTexture(this.text, "#" + e.getHexString(), t));
                this.mesh = this.createMesh(t);
              }
            }
            createMesh(e) {
              var t = s.SpriteUtils.createSpriteGeometry({
                  texture: e,
                  camera: this.camera,
                  align: { x: 0, y: -1 },
                  offset: { x: 0, y: a.Coords.ISO_TILE_SIZE / 4 },
                  scale: a.Coords.ISO_WORLD_SCALE,
                }),
                i = new THREE.MeshBasicMaterial({
                  map: e,
                  side: THREE.DoubleSide,
                  transparent: !0,
                  depthTest: !1,
                  flatShading: !0,
                });
              let r = new THREE.Mesh(t, i);
              return ((r.matrixAutoUpdate = !1), r);
            }
            createTexture(e, t, i) {
              let r = document.createElement("canvas");
              r.width = r.height = 0;
              let s = r.getContext("2d"),
                a = 0;
              for (var n of e.split("\n")) {
                n = h.CanvasUtils.drawText(s, n, 0, a, {
                  color: t,
                  outlineColor: i,
                  outlineWidth: 2,
                  fontFamily: "'Fira Sans Condensed', Arial, sans-serif",
                  fontSize: 10,
                  fontWeight: "400",
                  paddingTop: 3,
                  paddingBottom: 3,
                  paddingLeft: 3,
                  paddingRight: 3,
                  autoEnlargeCanvas: !0,
                });
                a += n.height;
              }
              var o = r.width,
                l = r.height,
                l = s.getImageData(0, 0, o, l);
              ((r.width += 1), (r.height += 1), s.putImageData(l, 1, 1));
              let c = new THREE.Texture(r);
              return (
                (c.minFilter = THREE.NearestFilter),
                (c.magFilter = THREE.NearestFilter),
                (c.needsUpdate = !0),
                (c.flipY = !0),
                c
              );
            }
            update() {}
            dispose() {
              (this.texture?.dispose(), this.mesh?.material?.dispose(), this.mesh?.geometry.dispose());
            }
          }),
        );
      },
    };
  },
);
