// === Reconstructed SystemJS module: BattleControlApi ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("BattleControlApi", [], function (e, t) {
  "use strict";
  var i, r, s;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      (e(
        "BattleControlApi",
        (s = class {
          constructor() {
            (i.set(this, new Set()), r.set(this, void 0));
          }
          _setWorldInteraction(e) {
            __classPrivateFieldSet(this, r, e, "f");
          }
          _notifyToggle(e) {
            for (var t of __classPrivateFieldGet(this, i, "f"))
              try {
                t(e);
              } catch (e) {
                console.error(e);
              }
          }
          onToggle(e) {
            return (
              __classPrivateFieldGet(this, i, "f").add(e),
              () => {
                __classPrivateFieldGet(this, i, "f").delete(e);
              }
            );
          }
          requestPan(e, t) {
            var i = new THREE.Vector2(e, t);
            __classPrivateFieldGet(this, r, "f")?.customScrollHandler.requestScroll(i);
          }
          cancelPan() {
            __classPrivateFieldGet(this, r, "f")?.customScrollHandler.cancel();
          }
          executeKeyCommand(e) {
            __classPrivateFieldGet(this, r, "f")?.keyboardHandler.executeCommand(e);
          }
          applyKeyModifiers(e) {
            __classPrivateFieldGet(this, r, "f")?.applyKeyModifiers(e);
          }
        }),
      ),
        (i = new WeakMap()),
        (r = new WeakMap()));
    },
  };
});
