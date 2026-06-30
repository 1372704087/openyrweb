// === Reconstructed SystemJS module: engine/renderable/entity/UnitCastBarSprite ===
// deps: ["engine/gfx/SpriteUtils","game/Coords","util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/UnitCastBarSprite",
  ["engine/gfx/SpriteUtils", "game/Coords", "util/math"],
  function (e, t) {
    "use strict";
    var a, n, i, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        e(
          "UnitCastBarSprite",
          (r = class {
            constructor(e, t, i, r, s, a) {
              ((this.castProgressTrait = e),
                (this.camera = t),
                (this.barWidth = i),
                (this.screenOffsetX = r),
                (this.screenOffsetY = s),
                (this.worldOffsetY = a));
            }
            get3DObject() {
              return this.mesh;
            }
            create3DObject() {
              if (!this.mesh) {
                let e = document.createElement("canvas");
                ((e.width = this.barWidth + 2), (e.height = 4), (this.ctx = e.getContext("2d", { alpha: !0 })));
                let t = (this.texture = new THREE.Texture(e));
                ((t.minFilter = THREE.NearestFilter), (t.magFilter = THREE.NearestFilter), (t.flipY = !0));
                var r = a.SpriteUtils.createSpriteGeometry({
                    texture: t,
                    camera: this.camera,
                    align: { x: 0, y: -1 },
                    scale: n.Coords.ISO_WORLD_SCALE,
                  }),
                  s = new THREE.MeshBasicMaterial({
                    map: t,
                    side: THREE.DoubleSide,
                    transparent: !0,
                    depthTest: !1,
                    flatShading: !0,
                  });
                let i = (this.mesh = new THREE.Mesh(r, s));
                ((i.matrixAutoUpdate = !1), (i.renderOrder = 999998));
                s = n.Coords.screenDistanceToWorld(this.screenOffsetX, this.screenOffsetY);
                ((i.position.x = s.x),
                  (i.position.y = this.worldOffsetY),
                  (i.position.z = s.y),
                  i.updateMatrix(),
                  (i.visible = !1));
              }
            }
            update(e) {
              if (this.mesh && this.ctx && this.texture) {
                let e = this.castProgressTrait;
                var t = e.isCasting() ? this.getFillWidth(e.getProgress()) : void 0;
                this.lastBarWidth !== t &&
                  (void 0 !== (this.lastBarWidth = t) && (this.redraw(t), (this.texture.needsUpdate = !0)),
                  (this.mesh.visible = void 0 !== t));
              }
            }
            redraw(e) {
              this.ctx &&
                (this.ctx.clearRect(0, 0, this.barWidth + 2, 4),
                (this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)"),
                this.ctx.fillRect(0, 0, this.barWidth + 2, 4),
                0 < e && ((this.ctx.fillStyle = "cyan"), this.ctx.fillRect(1, 1, e, 2)));
            }
            getFillWidth(e) {
              return i.clamp(Math.ceil(this.barWidth * e), 1, this.barWidth);
            }
            dispose() {
              (this.texture?.dispose(), this.mesh?.material?.dispose(), this.mesh?.geometry.dispose());
            }
          }),
        );
      },
    };
  },
);
