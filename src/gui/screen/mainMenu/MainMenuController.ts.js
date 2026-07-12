// === Reconstructed SystemJS module: gui/screen/mainMenu/MainMenuController ===
// deps: ["gui/screen/Controller","engine/sound/SoundKey","engine/sound/ChannelType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/MainMenuController",
  ["gui/screen/Controller", "engine/sound/SoundKey", "engine/sound/ChannelType"],
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
        ((a = class extends i.Controller {
          constructor(e, t, i) {
            (super(), (this.mainMenu = e), (this.sound = t), (this.music = i));
          }
          async goToScreenBlocking(...e) {
            var [t, i] = e;
            return super.goToScreenBlocking(t, i);
          }
          goToScreen(...e) {
            var [t, i] = e;
            return super.goToScreen(t, i);
          }
          async pushScreen(...e) {
            var [t, i] = e;
            (this.setMainComponent(), this.mainMenu.setSidebarTitle(""), await super.pushScreen(t, i));
            t = this.screens.get(t);
            (t.title && this.mainMenu.setSidebarTitle(t.title),
              t.backgroundImageName && this.mainMenu.setBackgroundImageName(t.backgroundImageName),
              void 0 !== t.musicType && (await this.music?.play(t.musicType)));
          }
          async popScreen(e) {
            (this.setMainComponent(), this.mainMenu.setSidebarTitle(""), await super.popScreen(e));
            var t = this.getCurrentScreen();
            (t?.title && this.mainMenu.setSidebarTitle(t.title),
              t?.backgroundImageName && this.mainMenu.setBackgroundImageName(t.backgroundImageName));
          }
          setSidebarButtons(e, t = !1) {
            this.mainMenu.setButtons(e, t);
          }
          showSidebarButtons() {
            this.mainMenu.isSidebarCollapsed() &&
              (this.sound.play(r.SoundKey.GUIMoveInSound, s.ChannelType.Ui), this.mainMenu.showButtons());
          }
          setSidebarMpContent(e) {
            this.mainMenu.setSidebarMpContent(e);
          }
          hideSidebarButtons() {
            if (!this.mainMenu.isSidebarCollapsed())
              return (
                this.sound.play(r.SoundKey.GUIMoveOutSound, s.ChannelType.Ui),
                new Promise((e) => {
                  let t = () => {
                    (this.mainMenu.onSidebarToggle.unsubscribe(t), e());
                  };
                  (this.mainMenu.onSidebarToggle.subscribe(t), this.mainMenu.hideButtons());
                })
              );
          }
          toggleSidebarPreview(e) {
            this.mainMenu.toggleSidebarPreview(e);
          }
          setSidebarPreview(e) {
            this.mainMenu.setSidebarPreview(e);
          }
          getSidebarPreviewSize() {
            return this.mainMenu.getSidebarPreviewSize();
          }
          toggleMainVideo(e) {
            this.mainMenu.toggleVideo(e);
          }
          showVersion(e) {
            this.mainMenu.showVersion(e);
          }
          hideVersion() {
            this.mainMenu.hideVersion();
          }
          setMainComponent(e) {
            this.mainMenu.setContentComponent(e);
          }
          destroy() {
            (this.setMainComponent(void 0), super.destroy());
          }
        }),
          e("MainMenuController", a));
      },
    };
  },
);
