// === Reconstructed SystemJS module: gui/screen/mainMenu/ladderRules/LadderRulesScreen ===
// deps: ["gui/jsx/jsx","gui/jsx/HtmlView","gui/screen/mainMenu/MainMenuScreen","gui/screen/mainMenu/component/Iframe"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/ladderRules/LadderRulesScreen",
  ["gui/jsx/jsx", "gui/jsx/HtmlView", "gui/screen/mainMenu/MainMenuScreen", "gui/screen/mainMenu/component/Iframe"],
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
        ((n = class extends s.MainMenuScreen {
          constructor(e, t, i) {
            (super(),
              (this.strings = e),
              (this.jsxRenderer = t),
              (this.rulesUrl = i),
              (this.title = this.strings.get("GUI:Rules")));
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
            var [e] = this.jsxRenderer.render(
              i.jsx(r.HtmlView, {
                width: "100%",
                height: "100%",
                component: a.Iframe,
                props: { src: this.rulesUrl, className: "ladder-rules" },
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
          e("LadderRulesScreen", n));
      },
    };
  },
);
