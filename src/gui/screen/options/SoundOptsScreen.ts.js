// === Reconstructed SystemJS module: gui/screen/options/SoundOptsScreen ===
// deps: ["gui/jsx/jsx","gui/jsx/HtmlView","gui/screen/options/component/SoundOpts","LocalPrefs"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/options/SoundOptsScreen",
  ["gui/jsx/jsx", "gui/jsx/HtmlView", "gui/screen/options/component/SoundOpts", "LocalPrefs"],
  function (e, t) {
    "use strict";
    var i, r, s, a, n;
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
      ],
      execute: function () {
        e(
          "SoundOptsScreen",
          (n = class {
            constructor(e, t, i, r, s) {
              ((this.strings = e),
                (this.jsxRenderer = t),
                (this.mixer = i),
                (this.music = r),
                (this.localPrefs = s),
                (this.title = this.strings.get("GUI:Sound")));
            }
            setController(e) {
              this.controller = e;
            }
            onEnter() {
              ((this.initialSettings = this.mixer.serialize()),
                this.controller.setSidebarButtons([
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
                i.jsx(r.HtmlView, {
                  width: "100%",
                  height: "100%",
                  component: s.SoundOpts,
                  props: { mixer: this.mixer, music: this.music, strings: this.strings },
                }),
              );
              this.controller.setMainComponent(e);
            }
            async onLeave() {
              var e = this.mixer.serialize();
              (e !== this.initialSettings && this.localPrefs.setItem(a.StorageKey.Mixer, e),
                this.music && ((e = this.music.serializeOptions()), this.localPrefs.setItem(a.StorageKey.MusicOpts, e)),
                await this.controller.hideSidebarButtons());
            }
          }),
        );
      },
    };
  },
);
