// === Reconstructed SystemJS module: gui/component/Option ===
// deps: ["classnames","react"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/component/Option", ["classnames", "react"], function (e, t) {
  "use strict";
  var l, c;
  t && t.id;
  return {
    setters: [
      function (e) {
        l = e;
      },
      function (e) {
        c = e;
      },
    ],
    execute: function () {
      e(
        "Option",
        ({ selected: e, disabled: t, label: i, style: r, labelStyle: s, className: a, tooltip: n, onClick: o }) =>
          c.createElement(
            "div",
            {
              className: l.default("option", { selected: e, disabled: t }, a),
              style: r,
              onClick: t ? void 0 : o,
              "data-r-tooltip": n,
            },
            c.createElement("div", { style: s }, i),
          ),
      );
    },
  };
});
