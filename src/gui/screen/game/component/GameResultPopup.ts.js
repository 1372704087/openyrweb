// === Reconstructed SystemJS module: gui/screen/game/component/GameResultPopup ===
// deps: ["gui/jsx/jsx","gui/UiObject","gui/jsx/UiComponent","gui/HtmlContainer"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/component/GameResultPopup",
  ["gui/jsx/jsx", "gui/UiObject", "gui/jsx/UiComponent", "gui/HtmlContainer"],
  function (t, e) {
    "use strict";
    var r, i, s, a, n, o;
    e && e.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
      ],
      execute: function () {
        var e;
        (((e = n || t("GameResultType", (n = {})))[(e.SpVictory = 0)] = "SpVictory"),
          (e[(e.SpDefeat = 1)] = "SpDefeat"),
          (e[(e.MpVictory = 2)] = "MpVictory"),
          (e[(e.MpDefeat = 3)] = "MpDefeat"),
          (o = class extends s.UiComponent {
            createUiObject({ viewport: e }) {
              let t = new i.UiObject(new THREE.Object3D(), new a.HtmlContainer());
              return (t.setPosition(e.x, e.y), t.getHtmlContainer().setSize(e.width, e.height), t);
            }
            defineChildren() {
              let { viewport: i, type: e } = this.props;
              return r.jsx("sprite", {
                image: "grfxtxt.shp",
                palette: "grfxtxt.pal",
                ref: (e) => {
                  var t = e.getSize();
                  e.setPosition((i.width - t.width) / 2, (i.height - t.height) / 2);
                },
                frame: e,
              });
            }
          }),
          t("GameResultPopup", o));
      },
    };
  },
);
