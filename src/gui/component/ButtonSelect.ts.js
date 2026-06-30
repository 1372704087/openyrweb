// === Reconstructed SystemJS module: gui/component/ButtonSelect ===
// deps: ["react","classnames"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/component/ButtonSelect", ["react", "classnames"], function (e, t) {
  "use strict";
  var d, g;
  t && t.id;
  return {
    setters: [
      function (e) {
        d = e;
      },
      function (e) {
        g = e;
      },
    ],
    execute: function () {
      e(
        "ButtonSelect",
        ({ initialValue: e, disabled: r, tooltip: t, className: i, onSelect: s, labelStyle: a, children: n }) => {
          let [o, l] = d.useState(() => e),
            [c, h] = d.useState(() => e);
          var u = d.useRef(null);
          d.useEffect(() => {
            o !== e && (l(e), h(e));
          }, [e]);
          return (
            d.useEffect(() => {
              h(o);
            }, []),
            d.default.createElement(
              "div",
              { className: g.default("button-select", { disabled: r }, i), "data-r-tooltip": t, ref: u },
              d.default.Children.map(n, (e) => {
                if (!e) return null;
                const t = e.props.value,
                  i = e.props.disabled;
                return d.default.createElement(
                  "div",
                  { onMouseEnter: () => !i && h(t), onMouseLeave: () => c === t && h(void 0) },
                  d.default.cloneElement(e, {
                    selected: t === o || t === c,
                    disabled: i || r,
                    labelStyle: a?.(t),
                    onClick: () => {
                      var e;
                      ((e = t), l(e), h(e), s(e));
                    },
                  }),
                );
              }),
            )
          );
        },
      );
    },
  };
});
