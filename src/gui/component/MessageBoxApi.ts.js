// === Reconstructed SystemJS module: gui/component/MessageBoxApi ===
// deps: ["react","gui/jsx/jsx","gui/jsx/HtmlView","util/disposable/CompositeDisposable","gui/component/Dialog","gui/component/PromptDialog"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/component/MessageBoxApi",
  [
    "react",
    "gui/jsx/jsx",
    "gui/jsx/HtmlView",
    "util/disposable/CompositeDisposable",
    "gui/component/Dialog",
    "gui/component/PromptDialog",
  ],
  function (e, t) {
    "use strict";
    var i, n, o, r, a, l, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          l = e;
        },
      ],
      execute: function () {
        e(
          "MessageBoxApi",
          (s = class {
            constructor(e, t, i) {
              ((this.viewport = e),
                (this.uiScene = t),
                (this.jsxRenderer = i),
                (this.disposables = new r.CompositeDisposable()));
            }
            show(e, t, i) {
              this.destroy();
              var r = "function" != typeof i ? i : void 0;
              let [s] = this.jsxRenderer.render(
                n.jsx(o.HtmlView, {
                  innerRef: (e) => (this.component = e),
                  component: a.Dialog,
                  props: {
                    children: "string" != typeof e ? e : this.splitNewLines(e),
                    className: r?.className,
                    viewport: this.viewport,
                    zIndex: 101,
                    buttons:
                      "string" == typeof t
                        ? [
                            {
                              label: t,
                              onClick: () => {
                                (this.disposables.dispose(), "function" == typeof i && i());
                              },
                            },
                          ]
                        : (t ?? []).map((e) => ({
                            label: e.label,
                            disabled: e.disabled,
                            onClick: () => {
                              (this.disposables.dispose(), e.onClick?.());
                            },
                          })),
                  },
                }),
              );
              (this.uiScene.add(s),
                this.disposables.add(
                  s,
                  () => this.uiScene.remove(s),
                  () => (this.component = void 0),
                ));
            }
            splitNewLines(e) {
              return e
                .split(/\n/g)
                .map((e, t) =>
                  t
                    ? i.createElement(
                        i.Fragment,
                        { key: t },
                        i.createElement("br", null),
                        i.createElement("span", null, e),
                      )
                    : i.createElement("span", { key: t }, e),
                );
            }
            async confirm(t, i, r) {
              return await new Promise((e) => {
                this.show(t, [
                  { label: i, onClick: () => e(!0) },
                  { label: r, onClick: () => e(!1) },
                ]);
              });
            }
            async alert(t, i) {
              await new Promise((e) => this.show(t, i, e));
            }
            async prompt(e, r, s, a) {
              return (
                this.destroy(),
                await new Promise((t) => {
                  let [i] = this.jsxRenderer.render(
                    n.jsx(o.HtmlView, {
                      innerRef: (e) => (this.component = e),
                      component: l.PromptDialog,
                      props: {
                        promptText: e,
                        submitLabel: r,
                        cancelLabel: s,
                        inputProps: a,
                        onSubmit: (e) => {
                          (t(e), i.destroy());
                        },
                        onDismiss: () => {
                          (t(void 0), i.destroy());
                        },
                        viewport: this.uiScene.viewport,
                      },
                    }),
                  );
                  (this.uiScene.add(i),
                    this.disposables.add(
                      i,
                      () => this.uiScene.remove(i),
                      () => (this.component = void 0),
                    ));
                })
              );
            }
            updateViewport(t) {
              ((this.viewport = t), this.component && this.component.applyOptions((e) => (e.viewport = t)));
            }
            updateText(t) {
              this.component &&
                this.component.applyOptions((e) => {
                  e.promptText ? (e.promptText = t) : (e.children = "string" != typeof t ? t : this.splitNewLines(t));
                });
            }
            destroy() {
              this.disposables.dispose();
            }
          }),
        );
      },
    };
  },
);
