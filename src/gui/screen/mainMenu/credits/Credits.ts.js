// === Reconstructed SystemJS module: gui/screen/mainMenu/credits/Credits ===
// deps: ["react"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/mainMenu/credits/Credits", ["react"], function (e, t) {
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
      e("Credits", ({ contentTpl: e, strings: i }) => {
        var t = e
          .replace(/\{([^}]+)\}/g, (e, t) => i.get(t))
          .replace(/<([^>]+)>/g, (e, t) =>
            t.match(/^(https?|mailto):(\/\/)?/)
              ? `<a href='${encodeURI(t)}' target='_blank' rel='noopener'>${encodeURI(t)}</a>`
              : "",
          )
          .replace(/\t*\r?\n/g, "<br />")
          .replace(
            /([^>]+)\t+([^<]+)<br \/>/g,
            `<div class='def'>
                <span class='title'>$1</span>
                <span class='filler'></span>
                <span class='name'>$2</span>
            </div>`,
          );
        return r.createElement(
          "div",
          { className: "credits-container" },
          r.createElement("div", { className: "credits", dangerouslySetInnerHTML: { __html: t } }),
        );
      });
    },
  };
});
