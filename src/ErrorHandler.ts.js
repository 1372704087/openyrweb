// === Reconstructed SystemJS module: ErrorHandler ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("ErrorHandler", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "ErrorHandler",
        (i = class {
          constructor(e, t) {
            ((this.messageBoxApi = e), (this.strings = t));
          }
          handle(e, t, i) {
            (this.isErrorState ||
              (i
                ? this.messageBoxApi.show(t, this.strings.get("GUI:Ok"), () => {
                    ((this.isErrorState = !1), i());
                  })
                : this.messageBoxApi.show(t)),
              console.error("Handled error:", e),
              (this.isErrorState = !0));
          }
        }),
      );
    },
  };
});
