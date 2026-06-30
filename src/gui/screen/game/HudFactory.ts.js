// === Reconstructed SystemJS module: gui/screen/game/HudFactory ===
// deps: ["gui/screen/game/component/Hud","engine/Engine"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/game/HudFactory", ["gui/screen/game/component/Hud", "engine/Engine"], function (e, t) {
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
        "HudFactory",
        (s = class {
          constructor(e, t, i, r, s, a, n, o, l, c, h, u, d, g, p) {
            ((this.sideType = e),
              (this.uiScene = t),
              (this.sidebarModel = i),
              (this.messageList = r),
              (this.chatHistory = s),
              (this.debugText = a),
              (this.debugTextEnabled = n),
              (this.localPlayer = o),
              (this.players = l),
              (this.stalemateDetectTrait = c),
              (this.countdownTimer = h),
              (this.cameoFilenames = u),
              (this.jsxRenderer = d),
              (this.strings = g),
              (this.commandBarButtons = p));
          }
          setSidebarModel(e) {
            this.sidebarModel = e;
          }
          create() {
            return new i.Hud(
              this.sideType,
              this.uiScene.viewport,
              r.Engine.getImages(),
              r.Engine.getPalettes(),
              this.cameoFilenames,
              this.sidebarModel,
              this.messageList,
              this.chatHistory,
              this.debugText,
              this.debugTextEnabled,
              this.localPlayer,
              this.players,
              this.stalemateDetectTrait,
              this.countdownTimer,
              this.jsxRenderer,
              this.strings,
              this.commandBarButtons,
            );
          }
        }),
      );
    },
  };
});
