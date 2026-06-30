// === Reconstructed SystemJS module: gui/screen/mainMenu/component/MenuTooltip ===
// deps: ["react","classnames"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/mainMenu/component/MenuTooltip", ["react", "classnames"], function (e, t) {
  "use strict";
  var a, n;
  t && t.id;
  return {
    setters: [
      function (e) {
        a = e;
      },
      function (e) {
        n = e;
      },
    ],
    execute: function () {
      e("MenuTooltip", ({ monitorContainer: t }) => {
        const [e, s] = a.useState(""),
          [i, r] = a.useState(!1);
        return (
          a.useEffect(() => {
            let i = t.getElement(),
              r;
            const e = (e) => {
              let t = e.target;
              if (t !== r) {
                r = t;
                let e = t.getAttribute?.("data-r-tooltip");
                for (; t && t !== i && !e;) ((t = t.parentElement), (e = t.getAttribute("data-r-tooltip")));
                s(e || "");
              }
            };
            return (
              i.addEventListener("mousemove", e),
              i.addEventListener("mouseleave", e),
              () => {
                (i.removeEventListener("mousemove", e), i.removeEventListener("mouseleave", e));
              }
            );
          }, []),
          a.useEffect(() => {
            r(!1);
            const e = setTimeout(() => r(!0), 10);
            return () => clearTimeout(e);
          }, [e]),
          a.default.createElement("div", { className: n.default("menu-tooltip", { anim: i }) }, e)
        );
      });
    },
  };
});
