// === Reconstructed SystemJS module: gui/screen/mainMenu/component/PrefetchProgress ===
// deps: ["react"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/mainMenu/component/PrefetchProgress", ["react"], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      e("PrefetchProgress", ({ progress: e, statusText: t }) =>
        i.default.createElement(
          "div",
          { className: "prefetch-progress" },
          i.default.createElement(
            "div",
            null,
            i.default.createElement("label", null, t),
            i.default.createElement("progress", { value: e, max: 100 }),
          ),
        ),
      );
    },
  };
});
