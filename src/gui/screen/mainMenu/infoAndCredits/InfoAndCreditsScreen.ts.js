// === Reconstructed SystemJS module: gui/screen/mainMenu/infoAndCredits/InfoAndCreditsScreen ===
// deps: ["react","gui/screen/mainMenu/main/ReportBug","gui/screen/mainMenu/MainMenuScreen","gui/screen/mainMenu/ScreenType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/infoAndCredits/InfoAndCreditsScreen",
  [
    "react",
    "gui/screen/mainMenu/main/ReportBug",
    "gui/screen/mainMenu/MainMenuScreen",
    "gui/screen/mainMenu/ScreenType",
  ],
  function (e, t) {
    "use strict";
    var r, s, i, a, n;
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
          i = e;
        },
        function (e) {
          a = e;
        },
      ],
      execute: function () {
        ((n = class extends i.MainMenuScreen {
          constructor(e, t, i) {
            (super(),
              (this.strings = e),
              (this.config = t),
              (this.messageBoxApi = i),
              (this.title = this.strings.get("TS:InfoAndCredits")));
          }
          onEnter() {
            let e = this.strings;
            const t = this.config.discordUrl,
              i = this.config.donateUrl;
            (this.controller.setSidebarButtons([
              ...(this.controller.hasScreen(a.ScreenType.PatchNotes)
                ? [
                    {
                      label: e.get("TS:PatchNotes"),
                      tooltip: e.get("STT:PatchNotes"),
                      onClick: () => {
                        this.controller?.pushScreen(a.ScreenType.PatchNotes);
                      },
                    },
                  ]
                : []),
              ...(t
                ? [
                    {
                      label: e.get("TS:ReportBug"),
                      tooltip: e.get("TS:ReportBugTT"),
                      onClick: () => {
                        this.messageBoxApi.show(
                          r.createElement(s.ReportBug, { discordUrl: t, strings: this.strings }),
                          this.strings.get("GUI:OK"),
                        );
                      },
                    },
                  ]
                : []),
              ...(i
                ? [
                    {
                      label: e.get("TS:Donate"),
                      onClick: () => {
                        (window.open(i, "_blank"), window.gtag?.("event", "donate_click"));
                      },
                    },
                  ]
                : []),
              {
                label: e.get("GUI:ViewCredits"),
                onClick: () => {
                  this.controller?.pushScreen(a.ScreenType.Credits);
                },
              },
              {
                label: this.strings.get("GUI:Back"),
                isBottom: !0,
                onClick: () => {
                  this.controller?.leaveCurrentScreen();
                },
              },
            ]),
              this.controller.showSidebarButtons(),
              this.controller.toggleMainVideo(!0),
              this.controller.setMainComponent());
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
          e("InfoAndCreditsScreen", n));
      },
    };
  },
);
