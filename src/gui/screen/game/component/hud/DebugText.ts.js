// === Reconstructed SystemJS module: gui/screen/game/component/hud/DebugText ===
// deps: ["gui/jsx/jsx","gui/UiObject","gui/jsx/UiComponent","gui/HtmlContainer","engine/gfx/SpriteUtils","engine/gfx/CanvasUtils"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/component/hud/DebugText",
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
            return i.jsx("mesh", { zIndex: this.props.zIndex }, this.mesh);
          }
          onFrame(t) {
            if (!this.lastUpdate || t - this.lastUpdate >= 1e3 / 30) {
              this.lastUpdate = t;
              let e = this.props.text.value;
              var i;
              (this.props.visible.value !== this.getUiObject().isVisible() &&
                this.getUiObject().setVisible(this.props.visible.value),
                this.lastText !== e && ((this.lastText = e), (i = e.split(/\r?\n/g)), this.drawLines(i)));
            }
          }
          drawLines(e) {
            this.ctx.clearRect(0, 0, this.props.width, this.props.height);
            var t,
              i,
              r = Math.floor((110 * this.props.width) / 600);
            let s = 0;
            for (t of e) for (i of this.wrapText(t, r)) s += this.drawLine(i, this.props.color, s);
            this.texture.needsUpdate = !0;
          }
          drawLine(e, t, i) {
            var r = {
                fontFamily: "'Fira Sans Condensed', Arial, sans-serif",
                fontSize: 12,
                fontWeight: "400",
                paddingTop: 6,
                height: 20,
              },
              s = 0.5 < 0.299 * t.r + 0.587 * t.g + 0.114 * t.b ? "black" : "white";
            return o.CanvasUtils.drawText(this.ctx, e, 0, i, {
              color: "#" + t.getHexString(),
              outlineColor: s,
              outlineWidth: 2,
              ...r,
              paddingLeft: 4,
              paddingRight: 4,
            }).height;
          }
          wrapText(t, i) {
            let r = [];
            for (; t.length > i;) {
              let e = t.slice(0, i).search(/\s[^\s]*$/);
              ((-1 !== e && 0 !== e) || (e = Math.min(t.length, i)), r.push(t.substr(0, e)), (t = t.slice(e)));
            }
            return (t.length && r.push(t), r);
          }
          onDispose() {
            (this.mesh.geometry.dispose(), this.mesh.material.dispose(), this.texture.dispose());
          }
        }),
          e("DebugText", l));
      },
    };
  },
);
