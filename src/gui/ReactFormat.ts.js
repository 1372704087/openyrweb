// === Reconstructed SystemJS module: gui/ReactFormat ===
// deps: ["react"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/ReactFormat", ["react"], function (e, t) {
  "use strict";
  var a, n, o, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        a = e;
      },
    ],
    execute: function () {
      ((n = /(\[(?:[^\]]+)\]\((?:https?:\/\/[^\s]+|mailto:[^\s]+)\))|(https?:\/\/[^\s]+|mailto:[^\s]+)/g),
        (o = /^\[([^\]]+)\]\((https?:\/\/[^\s]+|mailto:[^\s]+)\)$/),
        e(
          "ReactFormat",
          (i = class {
            static formatMultiline(e, i) {
              return e
                .split(/\n/g)
                .map((e, t) => (t ? a.createElement(a.Fragment, { key: t }, a.createElement("br", null), i(e)) : e));
            }
            static formatUrls(e) {
              return a.createElement(
                a.Fragment,
                null,
                e
                  .split(n)
                  .filter(Boolean)
                  .map((e, t) => {
                    if (!n.test(e)) return e;
                    let i, r;
                    var s = e.match(o);
                    return (
                      s ? ([, i, r] = s) : (i = r = e),
                      a.createElement("a", { key: t, href: r, rel: "noopener noreferrer", target: "_blank" }, i)
                    );
                  }),
              );
            }
          }),
        ));
    },
  };
});
