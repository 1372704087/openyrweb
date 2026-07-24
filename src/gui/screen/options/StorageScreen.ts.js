// === Reconstructed SystemJS module: gui/screen/options/StorageScreen ===
// deps: ["gui/jsx/jsx","gui/jsx/HtmlView","gui/screen/options/component/StorageExplorer","gui/screen/mainMenu/MainMenuScreen"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/options/StorageScreen",
  [
    "gui/jsx/jsx",
    "gui/jsx/HtmlView",
    "gui/screen/options/component/StorageExplorer",
    "gui/screen/mainMenu/MainMenuScreen",
  ],
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
          constructor(e, t, i, r) {
            (super(),
              (this.strings = e),
              (this.jsxRenderer = t),
              (this.messageBoxApi = i),
              (this.rfs = r),
              (this.vxlGeometryPool = void 0),
              (this.title = this.strings.get("GUI:Storage")));
          }
          setVxlGeometryPool(e) {
            this.vxlGeometryPool = e;
          }
          onEnter(e) {
            var t = [
              {
                label: this.strings.get("GUI:ClearGameData"),
                onClick: async () => {
                  if (
                    await this.messageBoxApi.confirm(
                      this.strings.get("TS:ConfirmClearGameData"),
                      this.strings.get("GUI:Ok"),
                      this.strings.get("GUI:Cancel"),
                    )
                  ) {
                    try {
                      let t = this.rfs.getRootDirectoryHandle();
                      for await (var i of t.keys()) await t.removeEntry(i, { recursive: !0 });
                      this.messageBoxApi.show(this.strings.get("TS:GameDataCleared"));
                      setTimeout(() => location.reload(), 1500);
                    } catch (e) {
                      console.error("Failed to clear game data", e);
                      this.messageBoxApi.show(
                        this.strings.get("TS:ClearGameDataFailed"),
                        this.strings.get("GUI:Ok"),
                      );
                    }
                  }
                },
              },
              {
                label: this.strings.get("GUI:ClearVxlCache"),
                onClick: async () => {
                  if (this.vxlGeometryPool) {
                    try {
                      await this.vxlGeometryPool.clearStorage();
                      this.vxlGeometryPool.clear();
                      this.messageBoxApi.show(this.strings.get("TS:VxlCacheCleared"), this.strings.get("GUI:Ok"));
                    } catch (e) {
                      console.error("Failed to clear VXL cache", e);
                      this.messageBoxApi.show(
                        this.strings.get("TS:ClearVxlCacheFailed"),
                        this.strings.get("GUI:Ok"),
                      );
                    }
                  }
                },
              },
              {
                label: this.strings.get("GUI:Back"),
                isBottom: !0,
                onClick: () => {
                  this.controller?.leaveCurrentScreen();
                },
              },
            ];
              this.controller.setSidebarButtons(t);
              this.controller.showSidebarButtons();
            var [t] = this.jsxRenderer.render(
              i.jsx(r.HtmlView, {
                width: "100%",
                height: "100%",
                component: s.StorageExplorer,
                props: {
                  strings: this.strings,
                  messageBoxApi: this.messageBoxApi,
                  storageDirHandle: this.rfs.getRootDirectoryHandle(),
                  startIn: e?.startIn,
                  onFileSystemChange: () => {
                    this.controller?.setSidebarButtons([
                      {
                        label: this.strings.get("GUI:ExitAndReload"),
                        isBottom: !0,
                        onClick: () => {
                          location.reload();
                        },
                      },
                    ]);
                  },
                },
              }),
            );
            this.controller.setMainComponent(t);
          }
          async onLeave() {
            await this.controller.hideSidebarButtons();
          }
        }),
          e("StorageScreen", n));
      },
    };
  },
);
