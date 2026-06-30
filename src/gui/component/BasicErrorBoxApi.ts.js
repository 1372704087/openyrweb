// === Reconstructed SystemJS module: gui/component/BasicErrorBoxApi ===
// deps: ["gui/HtmlReactElement","util/disposable/CompositeDisposable","gui/component/Dialog","gui/ReactFormat"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/component/BasicErrorBoxApi",
  ["gui/HtmlReactElement", "util/disposable/CompositeDisposable", "gui/component/Dialog", "gui/ReactFormat"],
  function (e, t) {
    "use strict";
    var a, r, n, o, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
      ],
      execute: function () {
        e(
          "BasicErrorBoxApi",
          (i = class {
            constructor(e, t, i) {
              ((this.viewport = e),
                (this.strings = t),
                (this.rootEl = i),
                (this.disposables = new r.CompositeDisposable()));
            }
            async show(r, s = !1) {
              return new Promise((e) => {
                let t = (this.component = a.HtmlReactElement.factory(n.Dialog, {
                    children: o.ReactFormat.formatMultiline(r, (e) => o.ReactFormat.formatUrls(e)),
                    className: "basic-error-box",
                    viewport: this.viewport.value,
                    buttons: s
                      ? []
                      : [
                          {
                            label: this.strings.get("GUI:Ok"),
                            onClick: () => {
                              (this.destroy(), e());
                            },
                          },
                        ],
                  })),
                  i = (t) => {
                    (this.component.setSize(t.width, t.height), this.component.applyOptions((e) => (e.viewport = t)));
                  };
                (this.viewport.onChange.subscribe(i),
                  t.setSize(this.viewport.value.width, this.viewport.value.height),
                  t.render(),
                  this.rootEl.appendChild(t.getElement()),
                  this.disposables.add(
                    () => this.viewport.onChange.unsubscribe(i),
                    () => this.component.getElement() && this.rootEl.removeChild(this.component.getElement()),
                    () => this.component.unrender(),
                    () => (this.component = void 0),
                  ));
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
