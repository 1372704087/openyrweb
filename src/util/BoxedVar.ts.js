// === Reconstructed SystemJS module: util/BoxedVar ===
// deps: ["util/event"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("util/BoxedVar", ["util/event"], function (e, t) {
  "use strict";
  var i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      e(
        "BoxedVar",
        (r = class {
          constructor(e) {
            ((this._onChange = new i.EventDispatcher()), (this.value = e));
          }
          get value() {
            return this._value;
          }
          set value(e) {
            var t = e !== this._value;
            ((this._value = e), t && this._onChange.dispatch(this, e));
          }
          get onChange() {
            return this._onChange.asEvent();
          }
        }),
      );
    },
  };
});
