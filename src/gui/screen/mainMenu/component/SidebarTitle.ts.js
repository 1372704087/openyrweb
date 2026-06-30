// === Reconstructed SystemJS module: gui/screen/mainMenu/component/SidebarTitle ===
// deps: ["react"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/mainMenu/component/SidebarTitle", ["react"], function (e, t) {
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
      e("SidebarTitle", ({ title: e }) => i.default.createElement("div", { className: "sidebar-title" }, e));
    },
  };
});
