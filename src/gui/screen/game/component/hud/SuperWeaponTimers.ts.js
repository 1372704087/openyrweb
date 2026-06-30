// === Reconstructed SystemJS module: gui/screen/game/component/hud/SuperWeaponTimers ===
// deps: ["gui/jsx/jsx","gui/UiObject","gui/jsx/UiComponent","gui/HtmlContainer","engine/gfx/SpriteUtils","engine/gfx/CanvasUtils","game/GameSpeed","util/format"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/component/hud/SuperWeaponTimers",
  [
    "gui/jsx/jsx",
    "gui/UiObject",
    "gui/jsx/UiComponent",
    "gui/HtmlContainer",
    "engine/gfx/SpriteUtils",
    "engine/gfx/CanvasUtils",
    "game/GameSpeed",
    "util/format",
  ],
  function (e, t) {
    "use strict";
    var i, s, r, a, n, o, y, T, l;
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
        function (e) {
          y = e;
        },
        function (e) {
          T = e;
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
          onFrame(i) {
            if (!this.lastUpdate || 100 <= i - this.lastUpdate) {
              this.lastUpdate = i;
              let t = [];
              var r, s;
              this.props.stalemateDetectTrait?.isStale() &&
                ((r = Math.floor(
                  this.props.stalemateDetectTrait.getCountdownTicks() / y.GameSpeed.BASE_TICKS_PER_SECOND,
                )),
                (r = this.props.strings.get("TS:StalemateTimer") + "   " + T.formatTimeDuration(r, !0)),
                t.push({ text: r, color: "red", flash: !0 }));
              let e = this.props.countdownTimer;
              e.isRunning() &&
                ((g = e.getSeconds()),
                (g = (void 0 !== e.text ? this.props.strings.get(e.text) + "   " : "") + T.formatTimeDuration(g, !0)),
                t.push({ text: g, color: this.props.localPlayer?.color.asHexString() ?? "white", flash: !1 }));
              for (s of this.props.players)
                if (!s.defeated) {
                  var a = s.superWeaponsTrait?.getAll(),
                    n = (s.powerTrait?.getBlackoutDuration() ?? 0) / y.GameSpeed.BASE_TICKS_PER_SECOND;
                  if (a?.length || n) {
                    var o,
                      l,
                      c = s.color.asHexString();
                    let e = [];
                    if (a)
                      for (var h of a)
                        h.rules.showTimer &&
                          e.push({ seconds: h.getTimerSeconds(), label: this.props.strings.get(h.rules.uiName) });
                    n && e.push({ seconds: n, label: this.props.strings.get("MSG:BlackoutTimer") });
                    for ({ seconds: o, label: l } of e) {
                      var u = Math.floor(o),
                        d = l + "   " + T.formatTimeDuration(u, !0);
                      t.push({ text: d, color: c, flash: 0 === u });
                    }
                  }
                }
              var g = !!t.length;
              if (g !== this.lastHasTimers || g) {
                ((this.lastHasTimers = g), this.ctx.clearRect(0, 0, this.props.width, this.props.height));
                let e = this.props.height - 20;
                for (var { text: p, color: m, flash: f } of t)
                  (f && (m = Math.floor(i / 1e3) % 2 ? m : "orange"), (e -= this.drawLine(p, m, e)));
                this.texture.needsUpdate = !0;
              }
            }
          }
          drawLine(e, t, i) {
            return o.CanvasUtils.drawText(this.ctx, e, 0, i, {
              color: t,
              ...{
                fontFamily: "'Fira Sans Condensed', Arial, sans-serif",
                fontSize: 12,
                fontWeight: "500",
                paddingTop: 6,
                height: 20,
                backgroundColor: "rgba(0, 0, 0, .75)",
                textAlign: "right",
              },
              paddingLeft: 4,
              paddingRight: 4,
            }).height;
          }
          onDispose() {
            (this.mesh.geometry.dispose(), this.mesh.material.dispose(), this.texture.dispose());
          }
        }),
          e("SuperWeaponTimers", l));
      },
    };
  },
);
