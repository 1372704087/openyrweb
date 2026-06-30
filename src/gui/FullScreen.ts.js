// === Reconstructed SystemJS module: gui/FullScreen ===
// deps: ["util/disposable/CompositeDisposable","util/fullScreen","util/event"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/FullScreen",
  ["util/disposable/CompositeDisposable", "util/fullScreen", "util/event"],
  function (e, t) {
    "use strict";
    var i, r, s, a;
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
      ],
      execute: function () {
        (e(
          "FullScreen",
          (a = class a {
            static isFullScreenHotKey(e) {
              return (
                e.keyCode === this.hotKey.keyCode &&
                e.altKey === this.hotKey.altKey &&
                e.shiftKey === this.hotKey.shiftKey &&
                e.ctrlKey === this.hotKey.ctrlKey &&
                e.metaKey === this.hotKey.metaKey
              );
            }
            get onChange() {
              return this._onChange.asEvent();
            }
            constructor(e) {
              ((this.document = e),
                (this.disposables = new i.CompositeDisposable()),
                (this._onChange = new s.EventDispatcher()),
                (this.handleFullScreenChange = (e) => {
                  this._onChange.dispatch(this, e);
                }));
            }
            init() {
              const e = (e) => {
                a.isFullScreenHotKey(e) && (e.preventDefault(), e.stopPropagation(), this.toggle());
              };
              (this.document.addEventListener("keydown", e),
                this.disposables.add(() => this.document.removeEventListener("keydown", e)));
              var t = r.setupFullScreenChangeListener(this.document, this.handleFullScreenChange);
              t && this.disposables.add(t);
            }
            toggle() {
              this.toggleAsync().catch((e) => console.error(e));
            }
            isFullScreen() {
              return !!this.document.fullscreenElement;
            }
            isAvailable() {
              return this.document.fullscreenEnabled || this.document.webkitFullscreenEnabled;
            }
            async toggleAsync() {
              this.document.fullscreenElement
                ? await this.document.exitFullscreen()
                : await this.document.documentElement.requestFullscreen();
            }
            dispose() {
              this.disposables.dispose();
            }
          }),
        ),
          (a.hotKey = { altKey: !0, shiftKey: !1, ctrlKey: !1, metaKey: !1, keyCode: "F".charCodeAt(0) }));
      },
    };
  },
);
