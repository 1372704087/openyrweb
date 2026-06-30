// === Reconstructed SystemJS module: gui/screen/game/gameMenu/GameMenuHomeScreen ===
// deps: ["gui/screen/game/gameMenu/ScreenType","gui/FullScreen","gui/screen/options/component/getHumanReadableKey","gui/screen/game/GameMenuScreen"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/gameMenu/GameMenuHomeScreen",
  [
    "gui/screen/game/gameMenu/ScreenType",
    "gui/FullScreen",
    "gui/screen/options/component/getHumanReadableKey",
    "gui/screen/game/GameMenuScreen",
  ],
  function (e, t) {
    "use strict";
    var r, s, a, i, n;
    t && t.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        ((n = class extends i.GameMenuScreen {
          constructor(e, t) {
            (super(), (this.strings = e), (this.fullScreen = t));
          }
          onEnter(e) {
            ((this.params = e), this.controller.toggleContentAreaVisibility(!0), this.initView(e));
          }
          initView(e) {
            let t = this.strings;
            var i = [
              {
                label: t.get("GUI:Options"),
                onClick: () => {
                  this.controller?.pushScreen(r.ScreenType.Options);
                },
              },
              {
                label: t.get("GUI:Fullscreen", a.getHumanReadableKey(s.FullScreen.hotKey)),
                tooltip: t.get("STT:Fullscreen"),
                disabled: !this.fullScreen.isAvailable(),
                onClick: () => this.fullScreen.toggle(),
              },
              {
                label: t.get("GUI:AbortMission"),
                onClick: () => {
                  this.controller?.pushScreen(r.ScreenType.QuitConfirm, this.params);
                },
              },
              { label: t.get("GUI:ResumeMission"), isBottom: !0, onClick: e.onCancel },
            ];
            (this.controller.setSidebarButtons(i), this.controller.showSidebarButtons());
          }
          async onLeave() {
            (this.controller.hideSidebarButtons(), this.controller.toggleContentAreaVisibility(!1));
          }
          async onStack() {
            this.controller.hideSidebarButtons();
          }
          onUnstack() {
            this.initView(this.params);
          }
        }),
          e("GameMenuHomeScreen", n));
      },
    };
  },
);
