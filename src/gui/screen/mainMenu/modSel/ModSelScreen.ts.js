// === Reconstructed SystemJS module: gui/screen/mainMenu/modSel/ModSelScreen ===
// deps: ["react","gui/jsx/jsx","gui/jsx/HtmlView","gui/screen/ScreenType","gui/screen/mainMenu/ScreenType","util/disposable/CompositeDisposable","data/vfs/StorageQuotaError","gui/screen/mainMenu/MainMenuScreen","data/vfs/IOError","data/vfs/FileNotFoundError","gui/screen/mainMenu/modSel/ModSel","engine/Engine","engine/gameRes/FileSystemUtil","gui/screen/mainMenu/modSel/ModImporter","engine/gameRes/importError/InvalidArchiveError","engine/gameRes/importError/ArchiveExtractionError","gui/screen/mainMenu/modSel/BadModArchiveError","gui/screen/mainMenu/modSel/DuplicateModError","gui/screen/mainMenu/modSel/Mod","gui/screen/mainMenu/modSel/ModStatus","@puzzl/core/lib/async/cancellation","gui/screen/mainMenu/modSel/ModDownloadPrompt"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/modSel/ModSelScreen",
  [
    "react",
    "gui/jsx/jsx",
    "gui/jsx/HtmlView",
    "gui/screen/ScreenType",
    "gui/screen/mainMenu/ScreenType",
    "util/disposable/CompositeDisposable",
    "data/vfs/StorageQuotaError",
    "gui/screen/mainMenu/MainMenuScreen",
    "data/vfs/IOError",
    "data/vfs/FileNotFoundError",
    "gui/screen/mainMenu/modSel/ModSel",
    "engine/Engine",
    "engine/gameRes/FileSystemUtil",
    "gui/screen/mainMenu/modSel/ModImporter",
    "engine/gameRes/importError/InvalidArchiveError",
    "engine/gameRes/importError/ArchiveExtractionError",
    "gui/screen/mainMenu/modSel/BadModArchiveError",
    "gui/screen/mainMenu/modSel/DuplicateModError",
    "gui/screen/mainMenu/modSel/Mod",
    "gui/screen/mainMenu/modSel/ModStatus",
    "@puzzl/core/lib/async/cancellation",
    "gui/screen/mainMenu/modSel/ModDownloadPrompt",
  ],
  function (e, t) {
    "use strict";
    var s, i, r, a, n, h, o, l, c, u, d, g, p, m, f, y, T, v, b, S, w, E, C;
    t && t.id;
    return {
      setters: [
        function (e) {
          s = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
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
          u = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          f = e;
        },
        function (e) {
          y = e;
        },
        function (e) {
          T = e;
        },
        function (e) {
          v = e;
        },
        function (e) {
          b = e;
        },
        function (e) {
          S = e;
        },
        function (e) {
          w = e;
        },
        function (e) {
          E = e;
        },
      ],
      execute: function () {
        ((C = class extends l.MainMenuScreen {
          constructor(e, t, i, r, s, a, n, o, l, c) {
            (super(),
              (this.rootController = e),
              (this.strings = t),
              (this.jsxRenderer = i),
              (this.errorHandler = r),
              (this.messageBoxApi = s),
              (this.modManager = a),
              (this.activeModId = n),
              (this.modSdkUrl = o),
              (this.modResourceLoader = l),
              (this.sentry = c),
              (this.title = this.strings.get("GUI:Mods")),
              (this.disposables = new h.CompositeDisposable()),
              (this.handleSelectMod = async (t, e) => {
                var i = this.selectedMod?.id !== t.id;
                ((this.selectedMod = t),
                  i && this.updateSidebarButtons(),
                  this.form?.applyOptions((e) => {
                    e.selectedMod = t;
                  }),
                  e && t !== this.activeMod && t.status === S.ModStatus.Installed && (await this.loadOrUnloadMod(t)));
              }));
          }
          async onEnter() {
            ((this.availableMods = []), this.controller.toggleMainVideo(!1), this.initForm());
            var e = await this.loadAvailableMods();
            e &&
              ((this.availableMods = e),
              (this.activeMod = this.availableMods.find((e) => e.id === this.activeModId)),
              (this.selectedMod = this.activeMod),
              this.form.applyOptions((e) => {
                ((e.mods = this.availableMods), (e.activeMod = this.activeMod), (e.selectedMod = this.selectedMod));
              }),
              this.initSidebar());
          }
          async loadAvailableMods() {
            try {
              var [e, t] = await Promise.all([
                this.modManager.listLocal(),
                this.modManager.listRemote().catch((e) => {
                  console.warn("Failed to fetch remote mods", [e]);
                }),
              ]);
              return await this.modManager.buildModList(e, t);
            } catch (e) {
              return (
                e instanceof c.IOError ||
                  e instanceof u.FileNotFoundError ||
                  e instanceof o.StorageQuotaError ||
                  this.sentry?.captureException(
                    new Error(`Failed to load mod list (${e.name ?? e.message})`, { cause: e }),
                  ),
                void this.handleError(e, this.strings.get("GUI:ModListError"))
              );
            }
          }
          initForm() {
            this.controller.setMainComponent(
              this.jsxRenderer.render(
                i.jsx(r.HtmlView, {
                  innerRef: (e) => (this.form = e),
                  component: d.ModSel,
                  props: {
                    strings: this.strings,
                    mods: void 0,
                    activeMod: void 0,
                    selectedMod: void 0,
                    onSelectMod: this.handleSelectMod,
                  },
                }),
              )[0],
            );
          }
          initSidebar() {
            (this.updateSidebarButtons(), this.controller.showSidebarButtons());
          }
          updateSidebarButtons() {
            this.controller?.setSidebarButtons([
              {
                label:
                  this.selectedMod && this.selectedMod === this.activeMod
                    ? this.strings.get("GUI:UnloadMod")
                    : this.selectedMod?.isInstalled()
                      ? this.strings.get("GUI:LoadMod")
                      : this.strings.get("GUI:ModActionInstall"),
                disabled: !this.selectedMod,
                onClick: async () => {
                  var i = this.selectedMod;
                  if (i.status === S.ModStatus.Installed || i === this.activeMod) await this.loadOrUnloadMod(i);
                  else {
                    var r = (i.meta.downloadSize || 0) / 1024 / 1024;
                    if (i.meta.manualDownload) {
                      var e = i.status === S.ModStatus.UpdateAvailable,
                        t = s.createElement(E.ModDownloadPrompt, {
                          url: i.meta.download,
                          sizeMb: r,
                          isUpdate: e,
                          strings: this.strings,
                          onClick: () => this.messageBoxApi.destroy(),
                        });
                      e
                        ? (await this.messageBoxApi.confirm(
                            t,
                            this.strings.get("GUI:Close"),
                            this.strings.get("GUI:ModActionLoadAnyway"),
                          )) || (await this.loadOrUnloadMod(i))
                        : this.messageBoxApi.show(t, this.strings.get("GUI:Close"), () => {});
                    } else {
                      let e = !1;
                      if (i.status === S.ModStatus.UpdateAvailable) {
                        if (
                          !(await this.messageBoxApi.confirm(
                            this.strings.get("GUI:ModUpdateAvail") +
                              "\n\n" +
                              this.strings.get("GUI:UpdateModPrompt", i.latestVersion, r),
                            this.strings.get("GUI:ModActionUpdate"),
                            this.strings.get("GUI:ModActionLoadAnyway"),
                          ))
                        )
                          return void (await this.loadOrUnloadMod(i));
                        e = !0;
                      } else if (
                        10 < r &&
                        !(await this.messageBoxApi.confirm(
                          this.strings.get("GUI:InstallModDownloadPrompt", r),
                          this.strings.get("GUI:Continue"),
                          this.strings.get("GUI:Cancel"),
                        ))
                      )
                        return;
                      let t;
                      try {
                        t = await this.downloadMod(i);
                      } catch (e) {
                        return e instanceof w.OperationCanceledError
                          ? void 0
                          : void this.errorHandler.handle(e, this.strings.get("GUI:DownloadFailed"), () => {});
                      }
                      this.messageBoxApi.destroy();
                      try {
                        await this.importModFromFile(t, i.status === S.ModStatus.UpdateAvailable);
                      } catch (e) {
                        return void this.handleModImportError(e);
                      }
                      e && (await this.loadOrUnloadMod(i));
                    }
                  }
                },
              },
              {
                label: this.strings.get("GUI:ImportMod"),
                tooltip: this.strings.get("STT:ImportMod"),
                onClick: async () => {
                  try {
                    let t;
                    try {
                      let e = await p.FileSystemUtil.showArchivePicker();
                      t = await e.getFile();
                    } catch (e) {
                      if ("AbortError" === e.name) return;
                      if (e instanceof DOMException)
                        throw new c.IOError(`File could not be read (${e.name})`, { cause: e });
                      throw e;
                    }
                    await this.importModFromFile(t, !1);
                  } catch (e) {
                    return void this.handleModImportError(e);
                  }
                },
              },
              {
                label: this.strings.get("GUI:UninstallMod"),
                tooltip: this.strings.get("STT:UninstallMod"),
                disabled: !(this.selectedMod?.isInstalled() && this.activeMod !== this.selectedMod),
                onClick: async () => {
                  var e = this.selectedMod;
                  if (
                    await this.messageBoxApi.confirm(
                      this.strings.get("GUI:ConfirmUninstallMod", e.name),
                      this.strings.get("GUI:Ok"),
                      this.strings.get("GUI:Cancel"),
                    )
                  ) {
                    this.messageBoxApi.show(this.strings.get("GUI:WorkingPleaseWait"));
                    try {
                      await this.modManager.deleteModFiles(e.id);
                    } catch (e) {
                      var t =
                        e instanceof o.StorageQuotaError
                          ? this.strings.get("ts:storage_quota_exceeded")
                          : this.strings.get("GUI:UninstallModError");
                      return void this.errorHandler.handle(e, t, () => {});
                    } finally {
                      this.messageBoxApi.destroy();
                    }
                    t = await this.loadAvailableMods();
                    t &&
                      ((this.availableMods = t),
                      (this.selectedMod = void 0),
                      this.form?.applyOptions((e) => {
                        ((e.mods = this.availableMods), (e.selectedMod = void 0));
                      }),
                      this.updateSidebarButtons());
                  }
                },
              },
              {
                label: this.strings.get("GUI:BrowseMod"),
                tooltip: this.strings.get("STT:BrowseMod"),
                onClick: () => {
                  this.controller?.pushScreen(n.ScreenType.OptionsStorage, {
                    startIn:
                      g.Engine.rfsSettings.modDir + (this.selectedMod?.isInstalled() ? "/" + this.selectedMod.id : ""),
                  });
                },
              },
              ...(this.modSdkUrl
                ? [
                    {
                      label: this.strings.get("GUI:ModSDK"),
                      tooltip: this.strings.get("STT:ModSDK"),
                      onClick: () => {
                        window.open(this.modSdkUrl, "_blank");
                      },
                    },
                  ]
                : []),
              {
                label: this.strings.get("GUI:Back"),
                isBottom: !0,
                onClick: () => {
                  this.controller?.popScreen();
                },
              },
            ]);
          }
          async loadOrUnloadMod(e) {
            (await this.controller?.hideSidebarButtons(),
              this.modManager.loadMod(e !== this.activeMod ? e.id : void 0));
          }
          async downloadMod(e) {
            var t = e.meta.download;
            if (!t) throw new Error("Mod meta is missing download");
            let i = new w.CancellationTokenSource();
            this.messageBoxApi.show(this.strings.get("TS:Downloading"), this.strings.get("GUI:Cancel"), () =>
              i.cancel(),
            );
            var r = { id: "archive", src: t, type: "binary", sizeHint: e.meta.downloadSize };
            let s = await this.modResourceLoader.loadResources([r], i.token, (e) => {
              this.messageBoxApi.updateText(this.strings.get("TS:DownloadingPg", e));
            });
            t = s.pop("archive");
            return new File([t], this.modResourceLoader.getResourceFileName(r));
          }
          async importModFromFile(e, t) {
            this.messageBoxApi.show(this.strings.get("ts:import_preparing_for_import"));
            var i = (e) => {
              this.messageBoxApi.updateText(e);
            };
            let r;
            try {
              r = await new m.ModImporter(this.strings, this.messageBoxApi, navigator.storage).import(
                e,
                this.modManager.getModDir(),
                t,
                i,
              );
            } finally {
              this.messageBoxApi.destroy();
            }
            if (r) {
              let t = new b.Mod(r, void 0);
              t &&
                (-1 !== (i = this.availableMods.findIndex((e) => e.id === t.id))
                  ? this.availableMods.splice(i, 1, t)
                  : this.availableMods.unshift(t),
                (this.selectedMod = t),
                this.form?.applyOptions((e) => {
                  ((e.mods = this.availableMods), (e.selectedMod = t));
                }),
                this.updateSidebarButtons());
            }
          }
          handleModImportError(e) {
            let t = this.strings,
              i = t.get("GUI:ImportModError");
            (e instanceof T.BadModArchiveError
              ? (i += "\n\n" + t.get("GUI:ImportModBadArchive"))
              : e instanceof v.DuplicateModError
                ? (i += "\n\n" + t.get("GUI:ImportDuplicateModError"))
                : e instanceof f.InvalidArchiveError
                  ? (i += "\n\n" + t.get("ts:import_invalid_archive"))
                  : e instanceof y.ArchiveExtractionError
                    ? e.cause?.message?.match(/out of memory|allocation/i)
                      ? (i += "\n\n" + t.get("ts:import_out_of_memory"))
                      : (i += "\n\n" + t.get("ts:import_archive_extract_failed"))
                    : e.message?.match(/out of memory|allocation/i)
                      ? (i += "\n\n" + t.get("ts:import_out_of_memory"))
                      : "QuotaExceededError" === e.name || e instanceof o.StorageQuotaError
                        ? (i += "\n\n" + t.get("ts:storage_quota_exceeded"))
                        : e instanceof c.IOError ||
                          e instanceof u.FileNotFoundError ||
                          this.sentry?.captureException(
                            new Error("Mod import failed " + (e.message ?? e.name), { cause: e }),
                          ),
              this.errorHandler.handle(e, i, () => {}));
          }
          async onStack() {
            await this.onLeave();
          }
          onUnstack() {
            this.onEnter();
          }
          async onLeave() {
            ((this.availableMods.length = 0),
              (this.form = void 0),
              this.messageBoxApi.destroy(),
              this.disposables.dispose(),
              this.controller.setMainComponent(),
              await this.controller.hideSidebarButtons());
          }
          handleError(e, t) {
            this.errorHandler.handle(e, t, () => {
              this.rootController.goToScreen(a.ScreenType.MainMenuRoot);
            });
          }
        }),
          e("ModSelScreen", C));
      },
    };
  },
);
