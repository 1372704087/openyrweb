// === Reconstructed SystemJS module: gui/screen/options/component/Resolution ===
// deps: ["gui/component/Select","gui/component/Option","react"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/options/component/Resolution",
  ["gui/component/Select", "gui/component/Option", "react"],
  function (e, t) {
    "use strict";
    var p, m, f, y;
    t && t.id;
    return {
      setters: [
        function (e) {
          p = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          f = e;
        },
      ],
      execute: function () {
        ((y = [
          { width: 1920, height: 1080 },
          { width: 1600, height: 900 },
          { width: 1280, height: 1024 },
          { width: 1366, height: 768 },
          { width: 1024, height: 768 },
          { width: 800, height: 600 },
        ]),
          e("ResolutionSelect", ({ resolution: i, fullScreen: e, strings: t }) => {
            const r = (e) => e.width + " x " + e.height,
              s = () => ({
                width: Math.max(y[y.length - 1].width, window.innerWidth),
                height: Math.max(y[y.length - 1].height, window.innerHeight),
              }),
              a = (i) => y.filter((e, t) => (e.height <= i.height && e.width <= i.width) || t === y.length - 1),
              [n, o] = f.useState(() => s()),
              [l, c] = f.useState(i.value),
              [h, u] = f.useState(() => a(n));
            var d = e.isFullScreen(),
              g = l && !h.find((e) => e.height === l.height && e.width === l.width);
            return (
              f.useEffect(() => {
                const e = () => {
                  var e = s();
                  (o(e), u(a(e)));
                };
                return (
                  window.addEventListener("resize", e),
                  i.onChange.subscribe(c),
                  () => {
                    (window.removeEventListener("resize", e), i.onChange.unsubscribe(c));
                  }
                );
              }, []),
              d
                ? f.createElement(
                    p.Select,
                    { className: "resolution-select", initialValue: "", disabled: !0, onSelect: () => {} },
                    f.createElement(m.Option, { value: "", label: t.get("TS:ResolutionFullScreen", r(n)) }),
                  )
                : f.createElement(
                    p.Select,
                    {
                      className: "resolution-select",
                      initialValue: l ? r(l) : "",
                      onSelect: (e) => {
                        var t = "" !== e ? e.split(" x ").map((e) => Number(e)) : void 0,
                          t = t ? { width: t[0], height: t[1] } : void 0;
                        i.value = t;
                      },
                    },
                    g &&
                      f.createElement(m.Option, {
                        value: r(l),
                        label: `${r(l)} (${r({ width: Math.min(l.width, n.width), height: Math.min(l.height, n.height) })})`,
                      }),
                    f.createElement(m.Option, { value: "", label: t.get("TS:ResolutionFit", r(n)) }),
                    h.map((e) => {
                      var t = r(e);
                      return f.createElement(m.Option, { key: t, value: t, label: t });
                    }),
                  )
            );
          }));
      },
    };
  },
);
