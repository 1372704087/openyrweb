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
            // 裁切层宽度随展开动画(0.4s)从 0 过渡,须等动画结束再测溢出量;
            // 滚动动画自身有 0.6s 延迟,460ms 时测量不会漏拍
            const t = setTimeout(() => r(!0), 10);
            const n = setTimeout(() => {
              const i = u.current,
                s = i && i.parentElement;
              if (i && s) {
                const a2 = i.offsetWidth - s.clientWidth;
                a2 > 2 && o(Math.ceil(a2));
              }
            }, 460);
            return () => {
              (clearTimeout(t), clearTimeout(n));
            };
          }, [e]),
          a.default.createElement(
            "div",
            { className: n.default("menu-tooltip", { anim: i }) },
            a.default.createElement(
              "div",
              { className: "menu-tooltip-clip" },
              a.default.createElement(
                "span",
                {
                  ref: u,
                  className: l > 0 ? "menu-tooltip-text scroll" : "menu-tooltip-text",
                  style: l > 0 ? { "--tooltip-shift": -l + "px" } : void 0,
                },
                e,
              ),
            ),
          )
        );
      });
    },
  };
});
