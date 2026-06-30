// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/Tooltip ===
// deps: ["gui/UiObject","engine/gfx/SpriteUtils","engine/gfx/CanvasUtils"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/worldInteraction/Tooltip",
  ["gui/UiObject", "engine/gfx/SpriteUtils", "engine/gfx/CanvasUtils"],
  function (e, t) {
    "use strict";
    var i, n, c, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          c = e;
        },
      ],
      execute: function () {
        ((r = class extends i.UiObject {
          constructor(e, t, i, r) {
            (super(new THREE.Object3D()), (this.text = e), (this.color = t), (this.pointer = i), (this.viewport = r));
          }
          create3DObject() {
            if (!this.mesh) {
              let e = this.get3DObject();
              var i = (this.texture = this.createTexture(this.text, this.color)),
                r = { width: i.image.width, height: i.image.height };
              let t = (this.mesh = this.createMesh(i, r.width, r.height));
              r = this.computePosition(this.pointer, this.viewport, r);
              ((t.position.x = r.x), (t.position.y = r.y), e.add(t), t.updateMatrix());
            }
            super.create3DObject();
          }
          createMesh(e, t, i) {
            let r = n.SpriteUtils.createRectGeometry(t, i);
            (n.SpriteUtils.addRectUvs(r, { x: 0, y: 0, width: t, height: i }, { width: t, height: i }),
              r.translate(t / 2, i / 2, 0));
            var s = new THREE.MeshBasicMaterial({ map: e, side: THREE.DoubleSide });
            let a = new THREE.Mesh(r, s);
            return ((a.matrixAutoUpdate = !1), (a.frustumCulled = !1), a);
          }
          createTexture(e, t) {
            let i = document.createElement("canvas");
            i.width = i.height = 0;
            let r = i.getContext("2d", { willReadFrequently: !0 }),
              s = 0;
            for (var a of e.split("\n")) {
              a = c.CanvasUtils.drawText(r, a, 0, s, {
                color: t,
                fontFamily: "'Fira Sans Condensed', Arial, sans-serif",
                fontSize: 12,
                fontWeight: "500",
                paddingTop: 5,
                paddingBottom: 5,
                paddingLeft: 2,
                paddingRight: 4,
                autoEnlargeCanvas: !0,
              });
              s += a.height;
            }
            var n = i.width,
              o = i.height,
              o = r.getImageData(0, 0, n, o);
            ((i.width += 1),
              (i.height += 1),
              r.putImageData(o, 1, 1),
              (r.globalCompositeOperation = "destination-over"),
              (r.fillStyle = "black"),
              r.fillRect(0, 0, i.width, i.height),
              (r.globalCompositeOperation = "source-over"),
              (r.strokeStyle = t),
              r.strokeRect(0.5, 0.5, i.width - 1, i.height - 1));
            let l = new THREE.Texture(i);
            return (
              (l.minFilter = THREE.NearestFilter),
              (l.magFilter = THREE.NearestFilter),
              (l.needsUpdate = !0),
              (l.flipY = !1),
              l
            );
          }
          computePosition(e, t, i) {
            let r = { ...e.getPosition() };
            return (
              r.x + 20 + i.width > t.x + t.width ? (r.x -= 20 + i.width) : (r.x += 20),
              r.y + 20 + i.height > t.x + t.height ? (r.y -= 20 + i.height) : (r.y += 20),
              r
            );
          }
          destroy() {
            (super.destroy(),
              this.texture?.dispose(),
              this.mesh && (this.mesh.material.dispose(), this.mesh.geometry.dispose()));
          }
        }),
          e("Tooltip", r));
      },
    };
  },
);
