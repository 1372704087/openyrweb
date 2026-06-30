// === Reconstructed SystemJS module: gui/screen/game/gameMenu/QuitConfirmScreen ===
// deps: ["gui/screen/game/GameMenuScreen"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/game/gameMenu/QuitConfirmScreen", ["gui/screen/game/GameMenuScreen"], function (e, t) {
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
      ((r = class extends i.GameMenuScreen {
        constructor(e) {
          (super(), (this.strings = e));
        }
        onEnter(e) {
          this.initView(e);
        }
        initView(e) {
          let t = this.strings;
          var i = [
            { label: t.get("GUI:Quit"), onClick: e.onQuit },
            ...(e.observeAllowed ? [{ label: t.get("GUI:Observe"), onClick: e.onObserve }] : []),
            { label: t.get("GUI:ResumeMission"), isBottom: !0, onClick: e.onCancel },
          ];
          (this.controller.setSidebarButtons(i), this.controller.showSidebarButtons());
        }
        async onLeave() {
          this.controller.hideSidebarButtons();
        }
      }),
        e("QuitConfirmScreen", r));
    },
  };
});
