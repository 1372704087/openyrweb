// === Reconstructed SystemJS module: gui/screen/mainMenu/login/LoginBox ===
// deps: ["react","gui/screen/mainMenu/login/ServerList","gui/screen/mainMenu/login/LoginDebugUi","@puzzl/core/lib/async/Task","network/HttpRequest","network/WolConfig"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/login/LoginBox",
  [
    "react",
    "gui/screen/mainMenu/login/ServerList",
    "gui/screen/mainMenu/login/LoginDebugUi",
    "@puzzl/core/lib/async/Task",
    "network/HttpRequest",
    "network/WolConfig",
  ],
  function (e, t) {
    "use strict";
    var y, T, v, b, S, w, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          y = e;
        },
        function (e) {
          T = e;
        },
        function (e) {
          v = e;
        },
        function (e) {
          b = e;
        },
        function (e) {
          S = e;
        },
        function (e) {
          w = e;
        },
      ],
      execute: function () {
        ((i = (
          {
            regions: e,
            selectedRegion: t,
            selectedUser: i,
            pings: r,
            breakingNewsUrl: s,
            strings: a,
            devMode: n,
            onRegionChange: o,
            onRequestRegionRefresh: l,
            onSubmit: c,
          },
          h,
        ) => {
          let u = y.useRef(null),
            d = y.useRef(null),
            g = y.useRef(null),
            [p, m] = y.useState();
          (y.useEffect(() => {
            setTimeout(() => d.current?.focus(), 50);
          }, []),
            y.useEffect(() => {
              if (s) {
                let e = new b.Task(async (e) => {
                  let t = await new S.HttpRequest().fetchHtml(s, e);
                  ((t = t.trim()), t.length && m(t));
                });
                return (e.start().catch((e) => console.error(e)), () => e.cancel());
              }
            }, [s]));
          const f = () => {
            d.current && g.current && c(d.current.value, g.current.value);
          };
          y.useImperativeHandle(h, () => ({
            submit() {
              u.current?.requestSubmit ? u.current.requestSubmit() : f();
            },
          }));
          return y.default.createElement(
            "div",
            { className: "login-wrapper" },
            y.default.createElement("div", { className: "title" }, a.get("GUI:Login")),
            y.default.createElement(
              "form",
              {
                onSubmit: (e) => {
                  (e.preventDefault(), f());
                },
                className: "login-form login-box",
                ref: u,
              },
              y.default.createElement(
                "div",
                { className: "field" },
                y.default.createElement("label", null, a.get("TS:Region")),
                i && t
                  ? y.default.createElement("input", { type: "text", value: t.label, readOnly: !0 })
                  : y.default.createElement(
                      y.default.Fragment,
                      null,
                      y.default.createElement(T.ServerList, {
                        regionId: t?.id,
                        regions: e,
                        pings: r,
                        strings: a,
                        onChange: (e) => {
                          o(e);
                        },
                      }),
                      y.default.createElement("button", {
                        type: "button",
                        className: "icon-button refresh-button",
                        onClick: l,
                      }),
                    ),
              ),
              y.default.createElement(
                "div",
                { className: "field" },
                y.default.createElement("label", null, a.get("GUI:Nickname")),
                y.default.createElement("input", {
                  name: "user",
                  type: "text",
                  required: !0,
                  minLength: w.MIN_USERNAME_LEN,
                  maxLength: w.MAX_USERNAME_LEN,
                  pattern: "[a-zA-Z0-9_\\-]+",
                  ref: d,
                  value: i,
                  readOnly: !!i,
                }),
              ),
              y.default.createElement(
                "div",
                { className: "field" },
                y.default.createElement("label", null, a.get("GUI:Password")),
                y.default.createElement("input", {
                  name: "pass",
                  type: "password",
                  required: !0,
                  maxLength: w.MAX_PASS_LEN,
                  ref: g,
                }),
              ),
              y.default.createElement("button", {
                type: "submit",
                style: { visibility: "hidden", position: "absolute", width: 0, height: 0 },
              }),
            ),
            n && y.default.createElement(v.LoginDebugUi, { onSubmit: c }),
            p &&
              y.default.createElement(
                "fieldset",
                { className: "news" },
                y.default.createElement("legend", null, a.get("GUI:BreakingNews")),
                y.default.createElement("div", { dangerouslySetInnerHTML: { __html: p } }),
              ),
          );
        }),
          e("LoginBox", y.forwardRef(i)));
      },
    };
  },
);
