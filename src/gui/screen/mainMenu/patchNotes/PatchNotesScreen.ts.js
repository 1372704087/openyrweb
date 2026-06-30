// === Reconstructed SystemJS module: gui/screen/mainMenu/patchNotes/PatchNotesScreen ===
// deps: ["gui/jsx/jsx","gui/jsx/HtmlView","gui/screen/mainMenu/component/Iframe","gui/screen/mainMenu/MainMenuScreen"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/patchNotes/PatchNotesScreen",
  ["gui/jsx/jsx", "gui/jsx/HtmlView", "gui/screen/mainMenu/component/Iframe", "gui/screen/mainMenu/MainMenuScreen"],
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
        ((n = class extends a.MainMenuScreen {
          constructor(e, t, i) {
            (super(),
              (this.strings = e),
              (this.jsxRenderer = t),
              (this.patchNotesUrl = i),
              (this.title = this.strings.get("TS:PatchNotes")));
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
                component: s.Iframe,
                props: { src: this.patchNotesUrl, className: "patch-notes" },
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
          e("PatchNotesScreen", n));
      },
    };
  },
);
