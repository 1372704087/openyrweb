// === Reconstructed SystemJS module: gui/component/List ===
// deps: ["react","classnames"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/component/List", ["react", "classnames"], function (e, t) {
  "use strict";
  var o, l;
  t && t.id;
  return {
    setters: [
      function (e) {
        o = e;
      },
      function (e) {
        l = e;
      },
    ],
    execute: function () {
      (e("List", ({ children: e, className: t, title: i, innerRef: r, tooltip: s }) =>
        o.default.createElement(
          o.default.Fragment,
          null,
          i && o.default.createElement("div", { className: "list-title" }, i),
          o.default.createElement("div", { ref: r, className: l.default("list", t), "data-r-tooltip": s }, e),
        ),
      ),
        e("ListItem", ({ children: e, selected: t, disabled: i, tooltip: r, className: s, innerRef: a, ...n }) =>
          o.default.createElement(
            "div",
            { ref: a, className: l.default("list-item", { selected: t, disabled: i }, s), "data-r-tooltip": r, ...n },
            e,
          ),
        ),
        e("ListHeader", ({ children: e, tooltip: t, className: i, innerRef: r, ...s }) =>
          o.default.createElement(
            "div",
            { ref: r, className: l.default("list-header", i), "data-r-tooltip": t, ...s },
            e,
          ),
        ));
    },
  };
});
