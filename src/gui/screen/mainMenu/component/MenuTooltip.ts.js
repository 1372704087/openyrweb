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
          [i, r] = a.useState(!1),
          [l, o] = a.useState(0),
          u = a.useRef(null);
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
            o(0);
            const t = setTimeout(() => {
              // 提示条自身宽度在展开动画中(从 0 过渡到 100%),不能用它测终宽;
              // 用外层定宽容器的内容宽减去提示条 padding,才是动画结束后的可用宽度
              const e = u.current,
                n = e && e.parentElement,
                i = n && n.parentElement;
              if (e && n && i) {
                const s = getComputedStyle(i),
                  a2 = getComputedStyle(n);
                const r2 =
                  i.clientWidth -
                  parseFloat(s.paddingLeft) -
                  parseFloat(s.paddingRight) -
                  parseFloat(a2.paddingLeft) -
                  parseFloat(a2.paddingRight);
                const n2 = e.offsetWidth - r2;
                n2 > 2 && o(Math.ceil(n2));
              }
              r(!0);
            }, 10);
            return () => clearTimeout(t);
          }, [e]),
          a.default.createElement(
            "div",
            { className: n.default("menu-tooltip", { anim: i }) },
            a.default.createElement(
              "span",
              {
                ref: u,
                className: l > 0 ? "menu-tooltip-text scroll" : "menu-tooltip-text",
                style: l > 0 ? { "--tooltip-shift": -l + "px" } : void 0,
              },
              e,
            ),
          )
        );
      });
    },
  };
});
