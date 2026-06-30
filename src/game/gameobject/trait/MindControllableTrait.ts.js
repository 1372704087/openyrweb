// === Reconstructed SystemJS module: game/gameobject/trait/MindControllableTrait ===
// deps: ["game/gameobject/trait/interface/NotifyUnspawn"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/MindControllableTrait",
  ["game/gameobject/trait/interface/NotifyUnspawn"],
  function (e, t) {
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
        ((r = class {
          constructor(e) {
            this.gameObject = e;
          }
          getOriginalOwner() {
            return this.prevOwner;
          }
          isActive() {
            return !!this.controller;
          }
          getController() {
            return this.controller;
          }
          controlBy(e, t) {
            // OpenYRWeb: a unit already under mind control cannot be yanked by another controller
            // (vanilla: CaptureMindControlled=no by default). Earlier code threw here, which
            // crashed the tick driver if any caller forgot the isActive() pre-check. Silent
            // no-op matches vanilla and is crash-safe.
            if (this.controller) return;
            ((this.controller = e),
              (this.prevOwner = this.gameObject.owner),
              t.changeObjectOwner(this.gameObject, e.owner));
          }
          restore(t) {
            if (this.prevOwner) {
              let e = this.prevOwner;
              (this.prevOwner.defeated && (e = t.getCivilianPlayer()),
                t.changeObjectOwner(this.gameObject, e),
                (this.prevOwner = void 0),
                (this.controller = void 0));
            }
          }
          [i.NotifyUnspawn.onUnspawn](e, t) {
            this.controller &&
              (this.controller.mindControllerTrait.cleanTarget(e), !e.isDestroyed && e.limboData && this.restore(t));
          }
          dispose() {
            this.gameObject = void 0;
          }
        }),
          e("MindControllableTrait", r));
      },
    };
  },
);
