// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/ArrowScrollHandler ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/game/worldInteraction/ArrowScrollHandler", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "ArrowScrollHandler",
        (i = class {
          constructor(e) {
            ((this.mapScrollHandler = e),
              (this.isPaused = !1),
              (this.scrollDir = new THREE.Vector2()),
              (this.pressedKeys = new Set()));
          }
          handleKeyDown(e) {
            !this.isPaused &&
              ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) &&
              (e.preventDefault(),
              e.stopPropagation(),
              e.repeat ||
                (this.pressedKeys.add(e.key),
                this.updateScrollDir(),
                this.mapScrollHandler.requestForceScroll(this.scrollDir)));
          }
          handleKeyUp(e) {
            ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) &&
              (e.preventDefault(),
              e.stopPropagation(),
              this.pressedKeys.delete(e.key),
              this.updateScrollDir(),
              this.scrollDir.length() || this.mapScrollHandler.cancelForceScroll());
          }
          cancel() {
            (this.pressedKeys.clear(),
              this.updateScrollDir(),
              this.scrollDir.length() || this.mapScrollHandler.cancelForceScroll());
          }
          updateScrollDir() {
            this.scrollDir.set(0, 0);
            for (var e of this.pressedKeys)
              switch (e) {
                case "ArrowUp":
                  --this.scrollDir.y;
                  break;
                case "ArrowDown":
                  this.scrollDir.y += 1;
                  break;
                case "ArrowLeft":
                  --this.scrollDir.x;
                  break;
                case "ArrowRight":
                  this.scrollDir.x += 1;
                  break;
                default:
                  throw new Error("Should never reach this line");
              }
          }
          pause() {
            this.isPaused = !0;
          }
          unpause() {
            this.isPaused = !1;
          }
        }),
      );
    },
  };
});
