// === Reconstructed SystemJS module: gui/screen/game/component/hud/SidebarCredits ===
// deps: ["gui/jsx/jsx","gui/UiObject","gui/jsx/UiComponent","gui/HtmlContainer","gui/component/UiText"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/component/hud/SidebarCredits",
  ["gui/jsx/jsx", "gui/UiObject", "gui/jsx/UiComponent", "gui/HtmlContainer", "gui/component/UiText"],
  function (e, t) {
    "use strict";
    var s, i, r, a, n, o;
    t && t.id;
    return {
      setters: [
        function (e) {
          s = e;
        },
        function (e) {
          i = e;
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
      ],
      execute: function () {
        ((o = class extends r.UiComponent {
          createUiObject() {
            return new i.UiObject(new THREE.Object3D(), new a.HtmlContainer());
          }
          defineChildren() {
            var { textColor: e, width: t, height: i, zIndex: r } = this.props;
            return s.jsx(n.UiText, {
              ref: (e) => (this.text = e),
              value: "",
              textColor: e,
              width: t,
              height: i,
              zIndex: r,
            });
          }
          onFrame(e) {
            var {
              sidebarModel: { credits: t, topTextLeftAlign: i },
            } = this.props;
            this.targetCredits !== t &&
              ((this.targetCredits = t),
              (s = Math.abs(t - (this.renderedCredits ?? 0))),
              (r = THREE.Math.lerp(300, 2e3, Math.min(1, s / 5e3))),
              (this.tickSpeed = s / r));
            var r,
              s = this.tickSpeed;
            (!this.lastUpdate || 50 <= e - this.lastUpdate) &&
              ((r = this.lastUpdate ? e - this.lastUpdate : 0),
              (this.lastUpdate = e),
              this.renderedCredits !== t &&
                (void 0 === this.renderedCredits
                  ? (this.renderedCredits = 0)
                  : ((t = t - this.renderedCredits),
                    (r = s * r),
                    (this.renderedCredits += Math.abs(t) >= r ? Math.sign(t) * r : t),
                    this.props.onTick(1 === Math.sign(t) ? "up" : "down")),
                this.text.setValue("" + Math.floor(this.renderedCredits))),
              i !== this.lastLeftAligned &&
                (i
                  ? (this.text.setTextAlign("left"), this.text.getUiObject().setPosition(15, 0))
                  : (this.text.setTextAlign("center"), this.text.getUiObject().setPosition(0, 0)),
                (this.lastLeftAligned = i)));
          }
        }),
          e("SidebarCredits", o));
      },
    };
  },
);
