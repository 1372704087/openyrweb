// === Reconstructed SystemJS module: gui/screen/mainMenu/main/SinglePlayerScreen ===
// deps: ["gui/screen/mainMenu/ScreenType","engine/sound/Music","gui/screen/mainMenu/MainMenuScreen"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// OpenYRWeb: SinglePlayer hub — shows Campaign and Skirmish buttons.

System.register(
  "gui/screen/mainMenu/main/SinglePlayerScreen",
  [
    "gui/screen/mainMenu/ScreenType",
    "engine/sound/Music",
    "gui/screen/mainMenu/MainMenuScreen",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        ((a = class extends s.MainMenuScreen {
          constructor(e) {
            (super(),
              (this.strings = e),
              (this.title = this.strings.get("GUI:SinglePlayer")),
              (this.musicType = r.MusicType.Intro));
          }
          onEnter() {
            let e = this.strings;
            (this.controller.setSidebarButtons([
              // OpenYRWeb: 战役入口暂屏蔽（战役功能尚未完善）
              // {
              //   label: e.get("GUI:Campaign"),
              //   tooltip: e.get("STT:Campaign"),
              //   onClick: () => {
              //     this.controller?.goToScreen(i.ScreenType.Campaign);
              //   },
              // },
              {
                label: e.get("GUI:SkirmishGame"),
                tooltip: e.get("STT:Demo"),
                onClick: () => {
                  this.controller?.goToScreen(i.ScreenType.Skirmish);
                },
              },
              {
                label: e.get("GUI:Back"),
                isBottom: !0,
                onClick: () => {
                  this.controller?.goToScreen(i.ScreenType.Home);
                },
              },
            ]),
              this.controller.toggleMainVideo(!0),
              this.controller.showSidebarButtons());
          }
          async onLeave() {
            await this.controller.hideSidebarButtons();
          }
          async onStack() {
            await this.onLeave();
          }
          onUnstack() {
            this.onEnter();
          }
        }),
          e("SinglePlayerScreen", a));
      },
    };
  },
);