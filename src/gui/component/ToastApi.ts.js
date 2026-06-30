// === Reconstructed SystemJS module: gui/component/ToastApi ===
// deps: ["gui/jsx/jsx","gui/jsx/HtmlView","util/disposable/CompositeDisposable","gui/component/Toasts"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/component/ToastApi",
  ["gui/jsx/jsx", "gui/jsx/HtmlView", "util/disposable/CompositeDisposable", "gui/component/Toasts"],
  function (e, t) {
    "use strict";
    var i, r, s, a, n;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
      ],
      execute: function () {
        e(
          "ToastApi",
          (n = class {
            constructor(e, t, i) {
              ((this.viewport = e),
                (this.uiScene = t),
                (this.jsxRenderer = i),
                (this.messages = []),
                (this.disposables = new s.CompositeDisposable()),
                (this.handleViewportChange = (t) => {
                  this.innerComponent && this.innerComponent.applyOptions((e) => (e.viewport = t));
                }));
            }
            push(e) {
              var t = Date.now();
              (this.messages.push({ text: e, timestamp: t }),
                this.updateTimeoutId && (clearTimeout(this.updateTimeoutId), (this.updateTimeoutId = void 0)),
                this.update());
            }
            update() {
              if (
                ((this.messages = this.messages.filter((e) => e.timestamp > Date.now() - 5e3)),
                (this.messages = this.messages.slice(-5)),
                this.messages.length)
              ) {
                let t = this.messages.map((e) => e.text);
                if (this.uiToasts) this.innerComponent?.applyOptions((e) => (e.messages = t));
                else {
                  let [e] = this.jsxRenderer.render(
                    i.jsx(r.HtmlView, {
                      innerRef: (e) => (this.innerComponent = e),
                      component: a.Toasts,
                      props: { messages: t, viewport: this.viewport.value, zIndex: 101 },
                    }),
                  );
                  ((this.uiToasts = e),
                    this.uiScene.add(e),
                    this.viewport.onChange.subscribe(this.handleViewportChange),
                    this.disposables.add(
                      e,
                      () => this.uiScene.remove(e),
                      () => this.viewport.onChange.unsubscribe(this.handleViewportChange),
                      () => (this.innerComponent = void 0),
                      () => (this.uiToasts = void 0),
                    ));
                }
                this.updateTimeoutId = setTimeout(() => this.update(), 5e3);
              } else this.destroy();
            }
            destroy() {
              (this.updateTimeoutId && (clearTimeout(this.updateTimeoutId), (this.updateTimeoutId = void 0)),
                this.disposables.dispose());
            }
          }),
        );
      },
    };
  },
);
