// === Reconstructed SystemJS module: gui/jsx/UiComponent ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/jsx/UiComponent", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "UiComponent",
        (i = class {
          constructor(e) {
            ((this.props = e), (this.uiObject = this.createUiObject(e)));
          }
          getUiObject() {
            return this.uiObject;
          }
        }),
      );
    },
  };
});
