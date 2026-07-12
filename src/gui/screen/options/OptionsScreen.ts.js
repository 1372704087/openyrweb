// === Reconstructed SystemJS module: gui/screen/options/OptionsScreen ===
// deps: ["gui/jsx/jsx","gui/screen/mainMenu/MainMenuController","gui/screen/game/gameMenu/GameMenuController","gui/screen/game/gameMenu/ScreenType","gui/screen/mainMenu/ScreenType","LocalPrefs","gui/jsx/HtmlView","gui/screen/options/component/GeneralOpts"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/options/OptionsScreen",
  [
    "gui/jsx/jsx",
    "gui/screen/mainMenu/MainMenuController",
    "gui/screen/game/gameMenu/GameMenuController",
    "gui/screen/game/gameMenu/ScreenType",
    "gui/screen/mainMenu/ScreenType",
    "LocalPrefs",
    "gui/jsx/HtmlView",
    "gui/screen/options/component/GeneralOpts",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o, l, c, h;
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
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
      ],
      execute: function () {
        e(
          "OptionsScreen",
          (h = class {
            constructor(e, t, i, r, s, a, n, o, l) {
              ((this.strings = e),
                (this.jsxRenderer = t),
                (this.options = i),
                (this.localPrefs = r),
                (this.fullScreen = s),
                (this.inGame = a),
                (this.storageOptsEnabled = n),
                (this.mixer = o),
                (this.music = l),
                (this.title = this.strings.get("GUI:Options")));
            }
            setController(e) {
              this.controller = e;
            }
            onEnter() {
              ((this.initialOptionsStr = this.options.serialize()),
                (this.initialMixerStr = this.mixer?.serialize()),
                this.controller instanceof r.MainMenuController && this.controller.toggleMainVideo(!1),
                this.controller.setSidebarButtons([
                  {
                    label: this.strings.get("GUI:Keyboard"),
                    onClick: () => {
                      this.controller instanceof s.GameMenuController
                        ? this.controller.pushScreen(a.ScreenType.OptionsKeyboard)
                        : this.controller?.pushScreen(n.ScreenType.OptionsKeyboard);
                    },
                  },
                  ...(this.controller instanceof r.MainMenuController && this.storageOptsEnabled
                    ? [
                        {
                          label: this.strings.get("GUI:Storage"),
                          onClick: () => {
                            this.controller.pushScreen(n.ScreenType.OptionsStorage, {});
                          },
                        },
                      ]
                    : []),
                  {
                    label: this.strings.get("GUI:Back"),
                    isBottom: !0,
                    onClick: () => {
                      this.controller?.leaveCurrentScreen();
                    },
                  },
                ]),
                this.controller.showSidebarButtons());
              var [e] = this.jsxRenderer.render(
                i.jsx(l.HtmlView, {
                  width: "100%",
                  height: "100%",
                  component: c.GeneralOpts,
                  props: {
                    options: this.options,
                    fullScreen: this.fullScreen,
                    strings: this.strings,
                    inGame: this.inGame,
                    mixer: this.mixer,
                    music: this.music,
                  },
                }),
              );
              this.controller.setMainComponent(e);
            }
            async onLeave() {
              var e = this.options.serialize();
              e !== this.initialOptionsStr && this.localPrefs.setItem(o.StorageKey.Options, e);
              if (this.mixer) {
                var t = this.mixer.serialize();
                t !== this.initialMixerStr && this.localPrefs.setItem(o.StorageKey.Mixer, t);
                this.music && ((t = this.music.serializeOptions()), this.localPrefs.setItem(o.StorageKey.MusicOpts, t));
              }
              await this.controller.hideSidebarButtons();
            }
            async onStack() {
              await this.onLeave();
            }
            onUnstack() {
              this.onEnter();
            }
          }),
        );
      },
    };
  },
);
