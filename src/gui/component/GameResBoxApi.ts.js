// === Reconstructed SystemJS module: gui/component/GameResBoxApi ===
// deps: ["file-system-access","react","classnames","gui/HtmlReactElement","gui/component/Dialog","gui/component/GameResForm","engine/gameRes/FileSystemUtil"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/component/GameResBoxApi",
  [
    "file-system-access",
    "react",
    "classnames",
    "gui/HtmlReactElement",
    "gui/component/Dialog",
    "gui/component/GameResForm",
    "engine/gameRes/FileSystemUtil",
  ],
  function (e, t) {
    "use strict";
    var n, o, l, c, h, u, d, i;
    t && t.id;
    return {
      setters: [
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
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
      ],
      execute: function () {
        e(
          "GameResBoxApi",
          (i = class {
            constructor(e, t, i) {
              ((this.viewport = e), (this.strings = t), (this.rootEl = i));
            }
            async promptForGameRes(e, a, ra2Url, yrUrl) {
              return (
                await n.polyfillDataTransferItem(),
                await new Promise((i) => {
                  let r = c.HtmlReactElement.factory(h.Dialog, {
                      className: l.default("game-res-box"),
                      buttons: [],
                      children: o.default.createElement(u.GameResForm, {
                        defaultArchiveUrl: e,
                        oneClickRa2Url: ra2Url,
                        oneClickYrUrl: yrUrl,
                        closable: a,
                        strings: this.strings,
                        onDrop: async (e) => {
                          if (e.items.length)
                            try {
                              var t = await e.items[0].getAsFileSystemHandle();
                              if (!t) return;
                              (s(), i(t));
                            } catch (e) {
                              console.error(e);
                            }
                        },
                        onBrowseFolder: async () => {
                          try {
                            // OpenYRWeb: allow the automated test harness to inject a synthetic
                            // FileSystemDirectoryHandle (window.__yrwebSyntheticDirHandle) so the
                            // folder picker can be driven headlessly. When unset, the real native
                            // picker is used. No-op in normal play.
                            var e = window.__yrwebSyntheticDirHandle
                              ? window.__yrwebSyntheticDirHandle
                              : await n.showDirectoryPicker({ _preferPolyfill: !0 });
                            (s(), i(e));
                          } catch (e) {
                            console.error(e);
                          }
                        },
                        onBrowseArchive: async () => {
                          try {
                            var e = await d.FileSystemUtil.showArchivePicker();
                            (s(), i(e));
                          } catch (e) {
                            console.error(e);
                          }
                        },
                        onDownloadArchive: async (e) => {
                          (s(), i(e));
                        },
                        // OpenYRWeb: one-click download both exes + auto-extract the 6 mixes.
                        onOneClickDownload: async () => {
                          (s(), i({ oneClick: !0 }));
                        },
                        onClose: () => {
                          (s(), i(void 0));
                        },
                      }),
                      viewport: this.viewport.value,
                    }),
                    t = (t) => {
                      (r.setSize(t.width, t.height), r.applyOptions((e) => (e.viewport = t)));
                    };
                  this.viewport.onChange.subscribe(t);
                  const s = () => {
                    (this.viewport.onChange.unsubscribe(t), (t = void 0));
                    var e = r.getElement();
                    (e && this.rootEl.removeChild(e), r.unrender(), (r = void 0));
                  };
                  (r.setSize(this.viewport.value.width, this.viewport.value.height),
                    r.render(),
                    this.rootEl.appendChild(r.getElement()));
                })
              );
            }
          }),
        );
      },
    };
  },
);
