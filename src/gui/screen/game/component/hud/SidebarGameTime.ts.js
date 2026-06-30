// === Reconstructed SystemJS module: gui/screen/game/component/hud/SidebarGameTime ===
// deps: ["gui/jsx/jsx","gui/UiObject","gui/jsx/UiComponent","gui/HtmlContainer","gui/component/UiText","util/format"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/component/hud/SidebarGameTime",
  ["gui/jsx/jsx", "gui/UiObject", "gui/jsx/UiComponent", "gui/HtmlContainer", "gui/component/UiText", "util/format"],
  function (e, t) {
    "use strict";
    var s, i, r, a, n, o, l;
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
        function (e) {
          o = e;
        },
      ],
      execute: function () {
        ((l = class extends r.UiComponent {
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
              sidebarModel: { currentGameTime: t, replayTime: i, topTextLeftAlign: r },
            } = this.props;
            (!this.lastUpdate || 50 <= e - this.lastUpdate) &&
              ((this.lastUpdate = e),
              this.lastGameTime !== t &&
                (this.text.setValue(o.formatTimeDuration(t) + (i ? " / " + o.formatTimeDuration(i) : "")),
                (this.lastGameTime = t)),
              r !== this.lastLeftAligned &&
                (r
                  ? (this.text.setTextAlign("left"), this.text.getUiObject().setPosition(15, 0))
                  : (this.text.setTextAlign("center"), this.text.getUiObject().setPosition(0, 0)),
                (this.lastLeftAligned = r)));
          }
        }),
          e("SidebarGameTime", l));
      },
    };
  },
);
