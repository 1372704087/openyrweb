// === Reconstructed SystemJS module: gui/component/Toasts ===
// deps: ["react"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/component/Toasts", ["react"], function (e, t) {
  "use strict";
  var r;
  t && t.id;
  return {
    setters: [
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      e("Toasts", ({ messages: e, viewport: t, zIndex: i }) => {
        return r.default.createElement(
          "div",
          { style: { position: "absolute", top: t.x, left: t.y, width: t.width, zIndex: i } },
          r.default.createElement(
            "div",
            { className: "toasts" },
            e.map((e, t) => r.default.createElement("div", { key: t, className: "toast" }, e)),
          ),
        );
      });
    },
  };
});
