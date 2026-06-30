// === Reconstructed SystemJS module: util/PointerLock ===
// deps: ["util/event","util/disposable/CompositeDisposable"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("util/PointerLock", ["util/event", "util/disposable/CompositeDisposable"], function (e, t) {
  "use strict";
  var i, r, s;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      e(
        "PointerLock",
        (s = class {
          get onChange() {
            return this._onChange.asEvent();
          }
          constructor(e, t) {
            ((this.element = e),
              (this.document = t),
              (this._onChange = new i.EventDispatcher()),
              (this.disposables = new r.CompositeDisposable()),
              (this.listening = !1));
          }
          async request(e) {
            if (e?.unadjustedMovement)
              try {
                await this.requestInternal({ unadjustedMovement: !0 });
              } catch (e) {
                if ("NotSupportedError" !== e.name) throw e;
                await this.requestInternal();
              }
            else await this.requestInternal();
          }
          async requestInternal(s) {
            if (!this.isActive()) {
              if (!this.listening) {
                this.listening = !0;
                const t = () => {
                  this._onChange.dispatch(this, this.isActive());
                };
                (this.document.addEventListener("pointerlockchange", t, !1),
                  this.disposables.add(() => this.document.removeEventListener("pointerlockchange", t, !1)));
                let e = () => {
                  this.exit().catch((e) => console.error(e));
                };
                (this.document.addEventListener("touchstart", e, !1),
                  this.disposables.add(() => this.document.removeEventListener("touchstart", e, !1)));
              }
              return new Promise((e, t) => {
                const i = () => {
                    (this.document.removeEventListener("pointerlockchange", i, !1),
                      this.document.removeEventListener("pointerlockerror", r, !1),
                      e());
                  },
                  r = (e) => {
                    (this.document.removeEventListener("pointerlockchange", i, !1),
                      this.document.removeEventListener("pointerlockerror", r, !1),
                      console.error(e),
                      t(new Error("Pointer lock error")));
                  };
                (this.document.addEventListener("pointerlockerror", r, !1),
                  this.document.addEventListener("pointerlockchange", i, !1),
                  this.element.requestPointerLock(s)?.catch?.(t));
              });
            }
          }
          async exit() {
            if (this.isActive())
              return new Promise((e, t) => {
                const i = () => {
                    (this.document.removeEventListener("pointerlockchange", i, !1),
                      this.document.removeEventListener("pointerlockerror", r, !1),
                      e());
                  },
                  r = (e) => {
                    (this.document.removeEventListener("pointerlockchange", i, !1),
                      this.document.removeEventListener("pointerlockerror", r, !1),
                      console.error(e),
                      t(new Error("Pointer lock error")));
                  };
                (this.document.addEventListener("pointerlockerror", r, !1),
                  this.document.addEventListener("pointerlockchange", i, !1),
                  this.document.exitPointerLock());
              });
          }
          isActive() {
            return this.element === this.document.pointerLockElement;
          }
          dispose() {
            this.disposables.dispose();
          }
        }),
      );
    },
  };
});
