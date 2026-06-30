// === Reconstructed SystemJS module: gui/screen/game/component/hud/SidebarPower ===
// deps: ["gui/jsx/jsx","gui/UiObject","gui/jsx/UiComponent","gui/HtmlContainer","data/Bitmap","engine/gfx/SpriteUtils","util/math","engine/gfx/TextureUtils","engine/renderable/entity/HighlightAnimRunner","util/BoxedVar","util/array","engine/gfx/material/PaletteBasicMaterial"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/component/hud/SidebarPower",
  [
    "gui/jsx/jsx",
    "gui/UiObject",
    "gui/jsx/UiComponent",
    "gui/HtmlContainer",
    "data/Bitmap",
    "engine/gfx/SpriteUtils",
    "util/math",
    "engine/gfx/TextureUtils",
    "engine/renderable/entity/HighlightAnimRunner",
    "util/BoxedVar",
    "util/array",
    "engine/gfx/material/PaletteBasicMaterial",
  ],
  function (t, e) {
    "use strict";
    var i, r, s, a, n, o, h, l, c, u, d, g, p, m, f;
    e && e.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
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
        function (e) {
          h = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
      ],
      execute: function () {
        var e;
        ((p = (e, t) => e.green === t.green && e.yellow === t.yellow && e.red === t.red),
          ((e = m = m || {})[(e.None = 0)] = "None"),
          (e[(e.Green = 1)] = "Green"),
          (e[(e.Yellow = 2)] = "Yellow"),
          (e[(e.Red = 3)] = "Red"),
          (e[(e.Highlight = 4)] = "Highlight"),
          (f = class extends s.UiComponent {
            constructor() {
              (super(...arguments),
                (this.visible = !0),
                (this.pipHighlightAnimRunner = new c.HighlightAnimRunner(new u.BoxedVar(1), 1, 2, 15)));
            }
            createUiObject() {
              let e = new r.UiObject(new THREE.Object3D(), new a.HtmlContainer());
              (e.setPosition(this.props.x || 0, this.props.y || 0), (this.pips = this.createPips(this.props.powerImg)));
              var t = this.props.powerImg.width,
                i = this.props.height;
              return (
                (this.textureBitmap = new n.IndexedBitmap(t, i)),
                (this.texture = this.createDataTexture(this.textureBitmap.data, t, i)),
                (this.mesh = this.createMesh(t, i)),
                e
              );
            }
            createPips(e) {
              let t = [];
              for (let r = 0; r < e.numImages; r++) {
                var i = e.getImage(r);
                t.push(new n.IndexedBitmap(i.width, i.height, i.imageData));
              }
              return t;
            }
            createDataTexture(e, t, i) {
              let r = new THREE.DataTexture(e, t, i, THREE.AlphaFormat);
              return (
                (r.needsUpdate = !0),
                (r.minFilter = THREE.NearestFilter),
                (r.magFilter = THREE.NearestFilter),
                r
              );
            }
            createMesh(e, t) {
              let i = o.SpriteUtils.createRectGeometry(e, t);
              (o.SpriteUtils.addRectUvs(i, { x: 0, y: 0, width: e, height: t }, { width: e, height: t }),
                i.translate(e / 2, t / 2, 0));
              var r = new g.PaletteBasicMaterial({
                map: this.texture,
                palette: l.TextureUtils.textureFromPalette(this.props.palette),
                side: THREE.DoubleSide,
              });
              let s = new THREE.Mesh(i, r);
              return ((s.frustumCulled = !1), s);
            }
            defineChildren() {
              return i.jsx(
                "mesh",
                { zIndex: this.props.zIndex, ref: (e) => (this.meshEvtTarget = e), onClick: () => {} },
                this.mesh,
              );
            }
            onFrame(e) {
              let t = this.getUiObject().get3DObject();
              t.visible = this.visible;
              var i = this.props["sidebarModel"],
                r = i.powerDrained,
                i = i.powerGenerated;
              let s = !1;
              (this.lastPowerDrained === r && this.lastPowerGenerated === i) ||
                ((this.lastPowerDrained = r),
                (this.lastPowerGenerated = i),
                this.meshEvtTarget.setTooltip(this.props.strings.get("TXT_POWER_DRAIN", i, r)),
                (a = (c = Math.max(i, r)) ? Math.min(1, r / c) : 1),
                (l = c ? Math.min(1, h.clamp(i - r, 0, 100) / c) : 0),
                (o = this.pips[0].height + 1),
                (n = c ? this.computeHeightFromPowerLevel(Math.max(100, c)) : 1),
                (this.targetPipCount = {
                  green: Math.floor(((1 - a - l) * n) / o),
                  yellow: Math.floor((l * n) / o),
                  red: c ? Math.floor((a * n) / o) : 1,
                }),
                this.pipHighlightAnimRunner.animation.stop(),
                (s = !0));
              var a,
                n,
                o,
                l = this.targetPipCount,
                c = this.pipCount && p(this.pipCount, l);
              ((this.lastPipUpdate && !(50 <= e - this.lastPipUpdate)) ||
                c ||
                ((this.lastPipUpdate = e),
                this.pipCount
                  ? ((a = Math.sign(l.red - this.pipCount.red)),
                    (n = Math.sign(l.yellow - this.pipCount.yellow)),
                    (o = Math.sign(l.green - this.pipCount.green)),
                    a
                      ? 0 < a &&
                        (this.pipCount.yellow > a
                          ? (this.pipCount.yellow = Math.max(0, this.pipCount.yellow - a))
                          : (this.pipCount.green = Math.max(0, this.pipCount.green - a)))
                      : (n
                          ? 0 < n && (this.pipCount.green = Math.max(0, this.pipCount.green - n))
                          : (this.pipCount.green += o),
                        (this.pipCount.yellow += n)),
                    (this.pipCount.red += a))
                  : (this.pipCount = { red: 1, yellow: 0, green: 0 }),
                this.updateTexture(this.pipCount, !0),
                p(this.pipCount, l) && this.pipHighlightAnimRunner.animate(10)),
                c &&
                  (s && this.pipHighlightAnimRunner.animate(10),
                  this.pipHighlightAnimRunner.shouldUpdate() &&
                    ((l = !!this.pipHighlightAnimRunner.getValue()),
                    this.pipHighlightAnimRunner.tick(e),
                    (c = !!this.pipHighlightAnimRunner.getValue()) != l && this.updateTexture(this.pipCount, c))));
            }
            computeHeightFromPowerLevel(e) {
              return h.clamp((Math.log10((e / 100 + 5) / 5e7) / (e / 100 + 3) + 2) / 2, 0, 1) * this.props.height;
            }
            updateTexture(e, t) {
              var i,
                r = this.pips[0].height,
                s = this.props.height,
                a = r + 1;
              let n = [
                [[m.None, Math.floor(s / r), r]],
                [
                  [m.Red, e.red, a],
                  [m.Yellow, e.yellow, a],
                  [m.Green, e.green, a],
                ],
              ];
              if (t) {
                let e = d.findReverse(n[1], ([, e]) => 0 < e);
                (e && e[1]--, n[1].push([m.Highlight, 1, a]));
              }
              for (i of n) {
                let t = s - r;
                for (var [o, l, c] of i) {
                  var h = this.pips[o];
                  for (let e = 0; e < l; e++) (this.textureBitmap.drawIndexedImage(h, 0, t), (t -= c));
                }
              }
              this.texture.needsUpdate = !0;
            }
            hide() {
              this.visible = !1;
            }
            show() {
              this.visible = !0;
            }
            onDispose() {
              (this.mesh.geometry.dispose(), this.mesh.material.dispose(), this.texture.dispose());
            }
          }),
          t("SidebarPower", f));
      },
    };
  },
);
