// === Reconstructed SystemJS module: gui/screen/mainMenu/extensions/ExtensionsScreen ===
// deps: ["gui/jsx/jsx","gui/screen/mainMenu/MainMenuScreen","gui/jsx/HtmlView","gui/screen/mainMenu/extensions/component/ExtensionsOpts","LocalPrefs","extensions/ExtensionHost"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// 源码内置扩展（Ares/Phobos）管理页：主菜单入口进入；离开时写入 LocalPrefs。

System.register(
  "gui/screen/mainMenu/extensions/ExtensionsScreen",
  [
    "gui/jsx/jsx",
    "gui/screen/mainMenu/MainMenuScreen",
    "gui/jsx/HtmlView",
    "gui/screen/mainMenu/extensions/component/ExtensionsOpts",
    "LocalPrefs",
    "extensions/ExtensionHost",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, h, o;
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
          h = e;
        },
      ],
      execute: function () {
        ((o = class extends r.MainMenuScreen {
          constructor(e, t, i) {
            (super(),
              (this.strings = e),
              (this.jsxRenderer = t),
              (this.localPrefs = i),
              (this.title = this.strings.get("TS:Extensions")));
          }
          onEnter() {
            ((this.initialConfigJson = h.ExtensionHost.getConfig().toJson()),
              this.controller.toggleMainVideo(!1),
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
              i.jsx(s.HtmlView, {
                width: "100%",
                height: "100%",
                component: a.ExtensionsOpts,
                props: { strings: this.strings },
              }),
            );
            this.controller.setMainComponent(e);
          }
          async onLeave() {
            var e = h.ExtensionHost.getConfig().toJson();
            e !== this.initialConfigJson &&
              this.localPrefs?.setItem(n.StorageKey.Extensions, e),
              await this.controller.hideSidebarButtons();
          }
          async onStack() {
            await this.onLeave();
          }
          onUnstack() {
            this.onEnter();
          }
        }),
          e("ExtensionsScreen", o));
      },
    };
  },
);
