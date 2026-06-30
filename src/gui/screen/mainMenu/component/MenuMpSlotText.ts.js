// === Reconstructed SystemJS module: gui/screen/mainMenu/component/MenuMpSlotText ===
// deps: ["react","gui/component/Image"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/mainMenu/component/MenuMpSlotText", ["react", "gui/component/Image"], function (e, t) {
  "use strict";
  var r, s;
  t && t.id;
  return {
    setters: [
      function (e) {
        r = e;
      },
      function (e) {
        s = e;
      },
    ],
    execute: function () {
      e("MenuMpSlotText", ({ text: e, icon: t, tooltip: i }) =>
        r.default.createElement(
          "div",
          { className: "menu-mp-slot" },
          r.default.createElement("pre", { className: "menu-mp-slot-text" }, e),
          t &&
            r.default.createElement(
              "div",
              { className: "menu-mp-slot-icon", "data-r-tooltip": i },
              r.default.createElement(s.Image, { src: t }),
            ),
        ),
      );
    },
  };
});
