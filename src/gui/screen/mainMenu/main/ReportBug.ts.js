// === Reconstructed SystemJS module: gui/screen/mainMenu/main/ReportBug ===
// deps: ["react"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/mainMenu/main/ReportBug", ["react"], function (e, t) {
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
      e("ReportBug", ({ strings: e, discordUrl: t }) =>
        i.createElement(
          "div",
          null,
          e.get("TS:ReportBugDesc"),
          i.createElement("br", null),
          i.createElement("br", null),
          i.createElement("a", { target: "_blank", href: t }, t),
        ),
      );
    },
  };
});
