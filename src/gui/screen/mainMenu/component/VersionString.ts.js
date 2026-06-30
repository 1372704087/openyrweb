// === Reconstructed SystemJS module: gui/screen/mainMenu/component/VersionString ===
// deps: ["react"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/mainMenu/component/VersionString", ["react"], function (e, t) {
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
      e("VersionString", ({ value: e }) =>
        i.default.createElement("div", { className: "menu-version-string" }, "v", e),
      );
    },
  };
});
