// === Reconstructed SystemJS module: gui/screen/options/KeyboardScreen ===
// deps: ["gui/jsx/jsx","gui/jsx/HtmlView","gui/screen/options/component/KeyOpts"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/options/KeyboardScreen",
  ["gui/jsx/jsx", "gui/jsx/HtmlView", "gui/screen/options/component/KeyOpts"],
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
        e(
          "KeyboardScreen",
          (a = class {
            constructor(e, t, i) {
              ((this.strings = e),
                (this.jsxRenderer = t),
                (this.keyBinds = i),
                (this.title = this.strings.get("GUI:KeyboardOptions")));
            }
            setController(e) {
              this.controller = e;
            }
            onEnter() {
              ((this.isDirty = !1),
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
                  component: s.KeyOpts,
                  props: {
                    keyBinds: this.keyBinds,
                    strings: this.strings,
                    onHotKeyChange: (e, t) => {
                      (this.keyBinds.changeHotKey(e, t), (this.isDirty = !0));
                    },
                    onResetAll: async () => {
                      try {
                        await this.keyBinds.resetAndReload();
                      } catch (e) {
                        console.error(e);
                      }
                    },
                  },
                }),
              );
              this.controller.setMainComponent(e);
            }
            async onLeave() {
              if ((await this.controller.hideSidebarButtons(), this.isDirty)) {
                this.isDirty = !1;
                try {
                  await this.keyBinds.save();
                } catch (e) {
                  console.error(e);
                }
              }
            }
          }),
        );
      },
    };
  },
);
