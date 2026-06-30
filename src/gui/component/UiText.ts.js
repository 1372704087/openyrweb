// === Reconstructed SystemJS module: gui/component/UiText ===
// deps: ["gui/jsx/jsx","gui/UiObject","gui/jsx/UiComponent","gui/HtmlContainer","engine/gfx/SpriteUtils","engine/gfx/CanvasUtils"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/component/UiText",
  [
    "gui/jsx/jsx",
    "gui/UiObject",
    "gui/jsx/UiComponent",
    "gui/HtmlContainer",
    "engine/gfx/SpriteUtils",
    "engine/gfx/CanvasUtils",
  ],
  function (e, t) {
    "use strict";
    var i, s, r, a, n, o, l;
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
          r = e;
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
        ((l = class extends r.UiComponent {
          constructor() {
            (super(...arguments), (this.value = this.props.value), (this.textAlign = this.props.textAlign));
          }
          createUiObject() {
            let e = new s.UiObject(new THREE.Object3D(), new a.HtmlContainer());
            e.setPosition(this.props.x || 0, this.props.y || 0);
            var t = this.props.width,
              i = this.props.height;
            let r = document.createElement("canvas");
            return (
              (r.width = t),
              (r.height = i),
              (this.ctx = r.getContext("2d", { alpha: !0 })),
              (this.texture = this.createTexture(r)),
              this.updateTexture(this.value, this.textAlign, this.props.textColor),
              (this.mesh = this.createMesh(t, i)),
              e
            );
          }
          createTexture(e) {
            let t = new THREE.Texture(e);
            return (
              (t.needsUpdate = !0),
              (t.flipY = !1),
              (t.minFilter = THREE.NearestFilter),
              (t.magFilter = THREE.NearestFilter),
              t
            );
          }
          createMesh(e, t) {
            let i = n.SpriteUtils.createRectGeometry(e, t);
            (n.SpriteUtils.addRectUvs(i, { x: 0, y: 0, width: e, height: t }, { width: e, height: t }),
              i.translate(e / 2, t / 2, 0));
            var r = new THREE.MeshBasicMaterial({ map: this.texture, side: THREE.DoubleSide, transparent: !0 });
            let s = new THREE.Mesh(i, r);
            return ((s.frustumCulled = !1), s);
          }
          defineChildren() {
            return i.jsx("mesh", { zIndex: this.props.zIndex, onClick: this.props.onClick }, this.mesh);
          }
          updateTexture(e, t, i) {
            (this.ctx.clearRect(0, 0, this.props.width, this.props.height),
              o.CanvasUtils.drawText(this.ctx, e, 0, 0, {
                color: i,
                fontFamily: "'Fira Sans Condensed', Arial, sans-serif",
                fontSize: 12,
                fontWeight: "500",
                paddingTop: 6,
                textAlign: t ?? "center",
                width: this.props.width,
                height: this.props.height,
              }),
              (this.texture.needsUpdate = !0));
          }
          setValue(e) {
            this.value !== e && ((this.value = e), this.updateTexture(e, this.textAlign, this.props.textColor));
          }
          setTextAlign(e) {
            e !== this.textAlign && ((this.textAlign = e), this.updateTexture(this.value, e, this.props.textColor));
          }
          onDispose() {
            (this.mesh.geometry.dispose(), this.mesh.material.dispose(), this.texture.dispose());
          }
        }),
          e("UiText", l));
      },
    };
  },
);
