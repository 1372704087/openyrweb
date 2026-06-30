// === Reconstructed SystemJS module: gui/screen/mainMenu/credits/CreditsScreen ===
// deps: ["gui/jsx/jsx","gui/jsx/HtmlView","gui/screen/mainMenu/credits/Credits","engine/Engine","gui/screen/mainMenu/MainMenuScreen"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/credits/CreditsScreen",
  [
    "gui/jsx/jsx",
    "gui/jsx/HtmlView",
    "gui/screen/mainMenu/credits/Credits",
    "engine/Engine",
    "gui/screen/mainMenu/MainMenuScreen",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o;
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
      ],
      execute: function () {
        ((o = class extends n.MainMenuScreen {
          constructor(e, t) {
            (super(), (this.strings = e), (this.jsxRenderer = t), (this.title = this.strings.get("GUI:Credits")));
          }
          onEnter() {
            (this.controller.setSidebarButtons([
              {
                label: this.strings.get("GUI:Back"),
                isBottom: !0,
                onClick: () => {
                  this.controller?.leaveCurrentScreen();
                },
              },
            ]),
              this.controller.showSidebarButtons(),
              this.controller.toggleMainVideo(!1));
            var e = a.Engine.vfs?.openFile("creditscd.txt").readAsString("utf-8") ?? "";
            let t = a.Engine.vfs?.openFile("credits.txt").readAsString() ?? "";
            var e = t.replace(/\s+\{CRD:CREDITS\}\s+/, e),
              [e] = this.jsxRenderer.render(
                i.jsx(r.HtmlView, {
                  width: "100%",
                  height: "100%",
                  component: s.Credits,
                  props: { contentTpl: e, strings: this.strings },
                }),
              );
            this.controller.setMainComponent(e);
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
          e("CreditsScreen", o));
      },
    };
  },
);
