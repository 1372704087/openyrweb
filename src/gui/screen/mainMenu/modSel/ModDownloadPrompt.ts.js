// === Reconstructed SystemJS module: gui/screen/mainMenu/modSel/ModDownloadPrompt ===
// deps: ["react"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/mainMenu/modSel/ModDownloadPrompt", ["react"], function (e, t) {
  "use strict";
  var a;
  t && t.id;
  return {
    setters: [
      function (e) {
        a = e;
      },
    ],
    execute: function () {
      e("ModDownloadPrompt", ({ url: e, sizeMb: t, isUpdate: i, strings: r, onClick: s }) =>
        a.createElement(
          "div",
          null,
          i && a.createElement("p", { style: { marginTop: 0 } }, r.get("GUI:ModUpdateAvail")),
          a.createElement("p", null, r.get("GUI:ManualDownloadModPrompt")),
          a.createElement("a", { href: e, rel: "nofollow noopener", target: "_blank", onClick: s }, e),
          a.createElement("br", null),
          a.createElement("br", null),
          a.createElement("em", null, r.get("ts:gameres_download_size", t)),
        ),
      );
    },
  };
});
