// === Reconstructed SystemJS module: gui/screen/mainMenu/main/HomeScreen ===
// deps: ["gui/screen/mainMenu/ScreenType","gui/FullScreen","engine/sound/Music","gui/screen/options/component/getHumanReadableKey","gui/component/MessageBoxApi","gui/screen/mainMenu/MainMenuScreen"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// OpenYRWeb 主菜单大修：移除 Quick Match / Mods / Info & Credits（无服务器 / 离线部署）。
// Custom Match → 多人大廳（占位弹框，不连服务器）。Demo → 遭遇戰（沿用原 Skirmish 路径）。

System.register(
  "gui/screen/mainMenu/main/HomeScreen",
  [
    "gui/screen/mainMenu/ScreenType",
    "gui/FullScreen",
    "engine/sound/Music",
    "gui/screen/options/component/getHumanReadableKey",
    "gui/component/MessageBoxApi",
    "gui/screen/mainMenu/MainMenuScreen",
  ],
  function (e, t) {
    "use strict";
    var i, r, a, s, c, n, l;
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
          a = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          n = e;
        },
      ],
      execute: function () {
        ((l = class extends n.MainMenuScreen {
          constructor(e, t, i, r, s, mb) {
            (super(),
              (this.strings = e),
              (this.fullScreen = t),
              (this.appVersion = i),
              // r = storageEnabled（保留位以兼容 Gui.ts.js 调用，但 Mods 入口已移除）
              // s = quickMatchEnabled（保留位以兼容 Gui.ts.js 调用，但 Quick Match 入口已移除）
              (this.messageBoxApi = mb),
              (this.title = this.strings.get("GUI:MainMenu")),
              (this.musicType = a.MusicType.Intro));
          }
          onEnter() {
            let e = this.strings;
            (this.controller.setSidebarButtons([
              {
                // 多人大廳：占位弹框（无服务器，不进 Login/CustomGame 流程）
                label: e.get("GUI:CustomMatch"),
                tooltip: e.get("TS:MultiLobbyTip"),
                onClick: () => {
                  this.messageBoxApi?.alert(e.get("TS:MultiLobbyMsg"), e.get("GUI:Ok"));
                },
              },
              {
                // 遭遇戰：原 Demo 按钮路径不变（goToScreen(Skirmish)），仅文案改
                label: e.get("GUI:Demo"),
                tooltip: e.get("STT:Demo"),
                onClick: () => {
                  this.controller?.goToScreen(i.ScreenType.Skirmish);
                },
              },
              {
                label: e.get("GUI:Replays"),
                tooltip: e.get("STT:Replays"),
                onClick: () => {
                  this.controller?.pushScreen(i.ScreenType.ReplaySelection);
                },
              },
              {
                label: e.get("GUI:Options"),
                tooltip: e.get("STT:MainButtonOptions"),
                onClick: () => {
                  this.controller?.pushScreen(i.ScreenType.Options);
                },
              },
              {
                label: e.get("GUI:Fullscreen", s.getHumanReadableKey(r.FullScreen.hotKey)),
                tooltip: e.get("STT:Fullscreen"),
                isBottom: !0,
                disabled: !this.fullScreen.isAvailable(),
                onClick: () => this.fullScreen.toggle(),
              },
            ]),
              this.controller.showSidebarButtons(),
              this.controller.toggleMainVideo(!0),
              this.controller.showVersion(this.appVersion));
          }
          async onLeave() {
            (this.controller.hideVersion(), await this.controller.hideSidebarButtons());
          }
          async onStack() {
            await this.onLeave();
          }
          onUnstack() {
            this.onEnter();
          }
        }),
          e("HomeScreen", l));
      },
    };
  },
);
