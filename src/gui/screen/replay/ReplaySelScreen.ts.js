// === Reconstructed SystemJS module: gui/screen/replay/ReplaySelScreen ===
// deps: ["gui/jsx/jsx","gui/jsx/HtmlView","gui/screen/replay/ReplaySel","network/gamestate/Replay","gui/screen/ScreenType","gui/screen/replay/KeepReplayBox","util/disposable/CompositeDisposable","gui/replay/ReplayStorageError","engine/ResourceLoader","data/vfs/StorageQuotaError","@puzzl/core/lib/async/Task","network/gameopt/Parser","game/GameSpeed","gui/replay/ReplayExistsError","gui/screen/mainMenu/MainMenuScreen","@puzzl/core/lib/async/cancellation","data/vfs/IOError","data/vfs/FileNotFoundError","RouteHelper","game/gameopts/GameOptRandomGen","game/gameopts/constants"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/replay/ReplaySelScreen",
  [
    "gui/jsx/jsx",
    "gui/jsx/HtmlView",
    "gui/screen/replay/ReplaySel",
    "network/gamestate/Replay",
    "gui/screen/ScreenType",
    "gui/screen/replay/KeepReplayBox",
    "util/disposable/CompositeDisposable",
    "gui/replay/ReplayStorageError",
    "engine/ResourceLoader",
    "data/vfs/StorageQuotaError",
    "@puzzl/core/lib/async/Task",
    "network/gameopt/Parser",
    "game/GameSpeed",
    "gui/replay/ReplayExistsError",
    "gui/screen/mainMenu/MainMenuScreen",
    "@puzzl/core/lib/async/cancellation",
    "data/vfs/IOError",
    "data/vfs/FileNotFoundError",
    "RouteHelper",
    "game/gameopts/GameOptRandomGen",
    "game/gameopts/constants",
  ],
  function (e, t) {
    "use strict";
    var r, s, i, c, a, n, g, o, l, h, u, d, p, m, f, y, T, v, b, S, w, E;
    t && t.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
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
      ],
      execute: function () {
        ((E = class extends f.MainMenuScreen {
          constructor(e, t, i, r, s, a, n, o, l, c, h, u, d) {
            (super(),
              (this.engineVersion = e),
              (this.engineModHash = t),
              (this.activeMod = i),
              (this.oldClientsBaseUrl = r),
              (this.rootController = s),
              (this.strings = a),
              (this.jsxRenderer = n),
              (this.errorHandler = o),
              (this.messageBoxApi = l),
              (this.replayManager = c),
              (this.uiScene = h),
              (this.rules = u),
              (this.sentry = d),
              (this.title = this.strings.get("GUI:Replays")),
              (this.disposables = new g.CompositeDisposable()),
              (this.handleSelectReplay = (t, e) => {
                var i = this.selectedReplay?.id !== t.id;
                ((this.selectedReplay = t),
                  i && this.updateSidebarButtons(),
                  this.form.applyOptions((e) => {
                    ((e.selectedReplay = t), (e.selectedReplayDetails = void 0));
                  }),
                  e ? this.loadSelectedReplay() : this.loadReplayDetails(t));
              }));
          }
          async onEnter() {
            ((this.availableReplays = []), this.controller.toggleMainVideo(!1), this.initForm());
            try {
              this.availableReplays = await this.replayManager.loadList(!0);
            } catch (e) {
              return (
                e instanceof T.IOError ||
                  e instanceof v.FileNotFoundError ||
                  e instanceof h.StorageQuotaError ||
                  this.sentry?.captureException(
                    new Error(`Failed to load replay list (${e.name ?? e.message})`, { cause: e }),
                  ),
                void this.handleError(e, this.strings.get("GUI:ReplayListError"))
              );
            }
            ((this.selectedReplay = this.availableReplays[0]),
              this.form.applyOptions((e) => {
                ((e.replays = this.availableReplays), (e.selectedReplay = this.selectedReplay));
              }),
              void 0 !== this.selectedReplay && this.loadReplayDetails(this.selectedReplay),
              this.initSidebar(),
              this.initFileInput());
          }
          initForm() {
            this.controller.setMainComponent(
              this.jsxRenderer.render(
                r.jsx(s.HtmlView, {
                  innerRef: (e) => (this.form = e),
                  component: i.ReplaySel,
                  props: {
                    strings: this.strings,
                    replays: void 0,
                    selectedReplay: void 0,
                    selectedReplayDetails: void 0,
                    onSelectReplay: this.handleSelectReplay,
                  },
                }),
              )[0],
            );
          }
          initFileInput() {
            let e = (this.fileInput = document.createElement("input"));
            (e.setAttribute("type", "file"),
              e.setAttribute("accept", c.Replay.extension),
              e.setAttribute("style", "display: none"),
              document.body.appendChild(e));
            const t = async () => {
              var e = this.fileInput.files?.[0];
              if (e)
                try {
                  (await this.replayManager.importReplay(e),
                    (this.availableReplays = await this.replayManager.loadList()),
                    this.form.applyOptions((e) => (e.replays = this.availableReplays)));
                } catch (e) {
                  let t;
                  ((t =
                    e instanceof h.StorageQuotaError
                      ? this.strings.get("ts:storage_quota_exceeded")
                      : e instanceof o.ReplayStorageError
                        ? this.strings.get("GUI:SaveReplayError")
                        : this.strings.get("GUI:ImportReplayError")),
                    this.errorHandler.handle(e, t, () => {}));
                }
            };
            (e.addEventListener("change", t),
              this.disposables.add(() => {
                (this.fileInput && document.body.removeChild(this.fileInput),
                  this.fileInput.removeEventListener("change", t),
                  (this.fileInput = void 0));
              }));
          }
          initSidebar() {
            (this.updateSidebarButtons(), this.controller.showSidebarButtons());
          }
          updateSidebarButtons() {
            let t = this.getSelectedReplayMeta();
            this.controller?.setSidebarButtons([
              {
                label: this.strings.get("GUI:LoadReplay"),
                disabled: !this.selectedReplay,
                onClick: () => {
                  this.loadSelectedReplay();
                },
              },
              {
                label: this.strings.get(t?.keep ? "GUI:RenameReplay" : "GUI:KeepReplay"),
                tooltip: t?.keep ? void 0 : this.strings.get("STT:KeepReplay"),
                disabled: !this.selectedReplay,
                onClick: () => {
                  this.showKeepReplayBox(t.name, (e) => {
                    this.replayManager
                      .keepReplay(t.id, e)
                      .then(async () => {
                        ((this.availableReplays = await this.replayManager.loadList()),
                          (this.selectedReplay = this.getSelectedReplayMeta()),
                          this.form.applyOptions((e) => (e.replays = this.availableReplays)),
                          this.updateSidebarButtons());
                      })
                      .catch((e) => {
                        let t;
                        ((t =
                          e instanceof m.ReplayExistsError
                            ? this.strings.get("GUI:ReplayExistsError")
                            : this.strings.get("GUI:SaveReplayError")),
                          this.errorHandler.handle(e, t, () => {}));
                      });
                  });
                },
              },
              {
                label: this.strings.get("GUI:ImportReplay"),
                tooltip: this.strings.get("STT:ImportReplay"),
                onClick: () => {
                  if (void 0 !== this.fileInput.click) this.fileInput.click();
                  else {
                    let e = document.createEvent("Event");
                    (e.initEvent("click", !0, !0), this.fileInput.dispatchEvent(e));
                  }
                },
              },
              {
                label: this.strings.get("GUI:ExportReplay"),
                tooltip: this.strings.get("STT:ExportReplay"),
                disabled: !this.selectedReplay,
                onClick: () => {
                  this.exportCurrentReplay().catch((e) =>
                    this.errorHandler.handle(e, this.strings.get("GUI:ReplayError"), () => {}),
                  );
                },
              },
              {
                label: this.strings.get("GUI:DeleteReplay"),
                disabled: !this.selectedReplay,
                onClick: async () => {
                  var t = this.getSelectedReplayMeta();
                  if (
                    await this.messageBoxApi.confirm(
                      this.strings.get("GUI:ConfirmDeleteReplay", t.name),
                      this.strings.get("GUI:Ok"),
                      this.strings.get("GUI:Cancel"),
                    )
                  ) {
                    try {
                      await this.replayManager.deleteReplay(t);
                    } catch (e) {
                      t =
                        e instanceof h.StorageQuotaError
                          ? this.strings.get("ts:storage_quota_exceeded")
                          : this.strings.get("GUI:DeleteReplayError");
                      return void this.errorHandler.handle(e, t, () => {});
                    }
                    ((this.selectedReplay = void 0),
                      (this.availableReplays = await this.replayManager.loadList()),
                      this.form.applyOptions((e) => {
                        ((e.replays = this.availableReplays),
                          (e.selectedReplay = void 0),
                          (e.selectedReplayDetails = void 0));
                      }),
                      this.updateSidebarButtons());
                  }
                },
              },
              {
                label: this.strings.get("GUI:Back"),
                isBottom: !0,
                onClick: () => {
                  this.controller?.popScreen();
                },
              },
            ]);
          }
          async loadSelectedReplay() {
            var t = this.selectedReplay;
            let i;
            try {
              var r = await this.replayManager.loadSerializedReplay(t);
              i = await new c.Replay().parseHeader(r);
            } catch (e) {
              return void this.errorHandler.handle(e, this.strings.get("GUI:ReplayError"), () => {});
            }
            if (i.engineVersion !== this.engineVersion) {
              if (!this.clientVersions && this.oldClientsBaseUrl) {
                this.messageBoxApi.show(this.strings.get("GUI:LoadingEx"));
                try {
                  let e = new l.ResourceLoader(this.oldClientsBaseUrl);
                  this.clientVersions = await e.loadJson("versions.json");
                } catch (e) {
                  console.warn("Couldn't download client version list", e);
                } finally {
                  this.messageBoxApi.destroy();
                }
              }
              let e;
              return (
                this.clientVersions && (e = this.clientVersions[i.engineVersion]),
                void (e
                  ? (await this.messageBoxApi.confirm(
                      this.strings.get("GUI:ReplayOpenOldClient", i.engineVersion),
                      this.strings.get("TXT_CONTINUE"),
                      this.strings.get("GUI:Close"),
                    )) &&
                    ((r = this.activeMod ? `?${b.RouteHelper.modQueryStringName}=` + this.activeMod : ""),
                    window.open(`${this.oldClientsBaseUrl}v${e}/${r}#/replay/` + t.id, "_blank"))
                  : this.messageBoxApi.show(
                      this.strings.get("GUI:ReplayVersionMismatch", i.engineVersion),
                      this.strings.get("GUI:Ok"),
                    ))
              );
            }
            if (i.modHash === this.engineModHash) {
              let e;
              try {
                e = await this.replayManager.loadReplay(t);
              } catch (e) {
                return void this.errorHandler.handle(e, this.strings.get("GUI:ReplayError"), () => {});
              }
              this.rootController.goToScreen(a.ScreenType.Replay, { replay: e });
            } else this.messageBoxApi.show(this.strings.get("GUI:ReplayModMismatch"), this.strings.get("GUI:Ok"));
          }
          showKeepReplayBox(e, t) {
            let [i] = this.jsxRenderer.render(
              r.jsx(s.HtmlView, {
                component: n.KeepReplayBox,
                props: {
                  defaultName: e,
                  strings: this.strings,
                  onSubmit: (e) => {
                    (t(e), i.destroy());
                  },
                  onDismiss: () => {
                    i.destroy();
                  },
                  viewport: this.uiScene.viewport,
                },
              }),
            );
            (this.uiScene.add(i), this.disposables.add(i, () => this.uiScene.remove(i)));
          }
          async exportCurrentReplay() {
            var e = this.getSelectedReplayMeta();
            if (!e) throw new Error("No replay selected");
            var t = await this.replayManager.loadSerializedReplay(e);
            this.currentReplayUrl && URL.revokeObjectURL(this.currentReplayUrl);
            t = URL.createObjectURL(new Blob([t], { type: "application/octet-stream" }));
            this.currentReplayUrl = t;
            let i = document.createElement("a");
            (i.setAttribute("href", t),
              i.setAttribute("download", e.name + c.Replay.extension),
              document.body.appendChild(i),
              i.click(),
              document.body.removeChild(i));
          }
          getSelectedReplayMeta() {
            if (this.selectedReplay) return this.availableReplays.find((e) => e.id === this.selectedReplay.id);
          }
          async onLeave() {
            (this.currentReplayUrl && URL.revokeObjectURL(this.currentReplayUrl),
              (this.clientVersions = void 0),
              (this.availableReplays.length = 0),
              (this.form = void 0),
              this.messageBoxApi.destroy(),
              this.disposables.dispose(),
              this.replayDetailsTask?.cancel(),
              (this.replayDetailsTask = void 0),
              this.controller.setMainComponent(),
              await this.controller.hideSidebarButtons());
          }
          loadReplayDetails(l) {
            (this.replayDetailsTask?.cancel(),
              (this.replayDetailsTask = new u.Task(async (t) => {
                let i = await this.replayManager.loadSerializedReplay(l);
                var r = await new c.Replay().parseHeader(i);
                t.throwIfCancelled();
                let s, a;
                if (r.engineVersion === this.engineVersion) {
                  let e = new c.Replay();
                  (e.unserialize("string" == typeof i ? i : await i.text(), l),
                    t.throwIfCancelled(),
                    (s = e.gameOpts),
                    (a = Math.floor(e.endTick / p.GameSpeed.BASE_TICKS_PER_SECOND)));
                } else
                  try {
                    s = new d.Parser().parseOptions(r.gameOptsSerialized);
                  } catch (e) {
                    console.warn("Replay couldn't be parsed", e);
                  }
                let n;
                if (s) {
                  let e = S.GameOptRandomGen.factory(r.gameId, r.gameTimestamp),
                    t = e.generateColors(s),
                    i = this.getAvailablePlayerColors();
                  n = s.humanPlayers
                    .filter((e) => e.countryId !== w.OBS_COUNTRY_ID)
                    .map((e) => ({ name: e.name, color: i[t.get(e) ?? e.colorId] }));
                }
                let o = {
                  gameId: r.gameId,
                  gameTimestamp: r.gameTimestamp || void 0,
                  engineVersion: r.engineVersion,
                  durationSeconds: a,
                  mapName: s?.mapTitle,
                  players: n,
                };
                this.form.applyOptions((e) => {
                  e.selectedReplayDetails = o;
                });
              })),
              this.replayDetailsTask.start().catch((e) => {
                e instanceof y.OperationCanceledError || console.error(e);
              }));
          }
          getAvailablePlayerColors() {
            return [...this.rules.getMultiplayerColors().values()].map((e) => e.asHexString());
          }
          handleError(e, t) {
            this.errorHandler.handle(e, t, () => {
              this.rootController.goToScreen(a.ScreenType.MainMenuRoot);
            });
          }
        }),
          e("ReplaySelScreen", E));
      },
    };
  },
);
