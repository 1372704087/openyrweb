// === Reconstructed SystemJS module: gui/screen/mainMenu/component/Iframe ===
// deps: ["react"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/mainMenu/component/Iframe", ["react"], function (e, t) {
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
      e("Iframe", ({ src: e, className: t }) => i.createElement("iframe", { src: e, className: t }));
    },
  };
});
