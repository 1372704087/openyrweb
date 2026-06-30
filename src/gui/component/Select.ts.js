// === Reconstructed SystemJS module: gui/component/Select ===
// deps: ["react","classnames","util/dom"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/component/Select", ["react", "classnames", "util/dom"], function (e, t) {
  "use strict";
  var f, y, T;
  t && t.id;
  return {
    setters: [
      function (e) {
        f = e;
      },
      function (e) {
        y = e;
      },
      function (e) {
        T = e;
      },
    ],
    execute: function () {
      e(
        "Select",
        ({ initialValue: e, disabled: t, tooltip: i, className: r, onSelect: s, labelStyle: a, children: n }) => {
          let [o, l] = f.useState(() => e),
            [c, h] = f.useState(() => e),
            [u, d] = f.useState(!1),
            g = f.useRef(null);
          f.useEffect(() => {
            o !== e && (l(e), h(o));
          }, [e]);
          f.useEffect(() => {
            if (u) {
              h(o);
              const e = (e) => {
                T.contains(g.current, e.target) || d(!1);
              };
              return (
                document.addEventListener("click", e),
                () => {
                  document.removeEventListener("click", e);
                }
              );
            }
          }, [u]);
          var p, m;
          return f.default.createElement(
            "div",
            { style: { display: "inline-block", verticalAlign: "middle" }, className: r },
            f.default.createElement(
              "div",
              { className: y.default("select", { disabled: t }), "data-r-tooltip": i, ref: g },
              f.default.createElement(
                "div",
                { className: "select-value", onClick: () => !t && d(!u) },
                f.default.createElement(
                  "div",
                  { style: a?.(o) },
                  ((p = o), (m = f.default.Children.toArray(n).find((e) => e.props.value === p)) ? m.props.label : ""),
                ),
              ),
              u &&
                f.default.createElement(
                  "div",
                  { className: "select-layer" },
                  f.default.Children.map(n, (e) => {
                    if (!e) return null;
                    const t = e.props.value,
                      i = e.props.disabled;
                    return f.default.createElement(
                      "div",
                      { onMouseEnter: () => !i && h(t) },
                      f.default.cloneElement(e, {
                        selected: t === c,
                        labelStyle: a?.(t),
                        onClick: () => {
                          var e;
                          ((e = t), l(e), h(e), s?.(e), d(!1));
                        },
                      }),
                    );
                  }),
                ),
            ),
          );
        },
      );
    },
  };
});
