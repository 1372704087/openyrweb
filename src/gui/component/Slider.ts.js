// === Reconstructed SystemJS module: gui/component/Slider ===
// deps: ["react"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/component/Slider", ["react"], function (e, t) {
  "use strict";
  var s;
  t && t.id;
  return {
    setters: [
      function (e) {
        s = e;
      },
    ],
    execute: function () {
      e("Slider", ({ getLabel: e, ...t }) => {
        let [i, r] = s.useState(() => t.value);
        s.useEffect(() => {
          i !== t.value && r(t.value);
        }, [t.value]);
        return s.default.createElement(
          "div",
          { style: { display: "inline-block", verticalAlign: "middle" } },
          s.default.createElement("input", {
            type: "range",
            ...t,
            value: i,
            onChange: (e) => {
              (r(e.target.value), t.onChange?.(e));
            },
          }),
          s.default.createElement("input", { type: "text", disabled: !0, readOnly: !0, value: e?.(i) ?? i }),
        );
      });
    },
  };
});
