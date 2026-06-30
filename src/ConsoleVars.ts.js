// === Reconstructed SystemJS module: ConsoleVars ===
// deps: ["util/BoxedVar"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("ConsoleVars", ["util/BoxedVar"], function (e, t) {
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
        "ConsoleVars",
        (r = class {
          constructor() {
            ((this.debugWireframes = new i.BoxedVar(!1)),
              (this.debugPaths = new i.BoxedVar(!1)),
              (this.debugText = new i.BoxedVar(!1)),
              (this.debugBotIndex = new i.BoxedVar(0)),
              (this.debugLogging = new i.BoxedVar(!1)),
              (this.debugGameState = new i.BoxedVar(!1)),
              (this.forceResolution = new i.BoxedVar(void 0)),
              (this.freeCamera = new i.BoxedVar(!1)),
              (this.fps = new i.BoxedVar(!1)),
              (this.cheatsEnabled = new i.BoxedVar(!1)));
          }
        }),
      );
    },
  };
});
