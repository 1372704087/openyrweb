// === Reconstructed SystemJS module: gui/screen/mainMenu/mapSel/MapSelScreen ===
// deps: ["file-system-access","gui/jsx/jsx","gui/jsx/HtmlView","gui/screen/mainMenu/mapSel/component/MapSel","gui/screen/mainMenu/lobby/MapPreviewRenderer","@puzzl/core/lib/async/Task","@puzzl/core/lib/async/cancellation","gui/screen/mainMenu/MainMenuScreen","game/ini/GameModeType","LocalPrefs","data/MapFile","data/vfs/VirtualFile","engine/MapSupport","data/vfs/IOError","data/vfs/StorageQuotaError","data/vfs/FileNotFoundError","engine/Engine","util/disposable/CompositeDisposable","engine/ResourceLoader","engine/MapManifest","data/vfs/NameNotAllowedError"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/mapSel/MapSelScreen",
  [
    "file-system-access",
    "gui/jsx/jsx",
    "gui/jsx/HtmlView",
    "gui/screen/mainMenu/mapSel/component/MapSel",
    "gui/screen/mainMenu/lobby/MapPreviewRenderer",
    "@puzzl/core/lib/async/Task",
    "@puzzl/core/lib/async/cancellation",
    "gui/screen/mainMenu/MainMenuScreen",
    "game/ini/GameModeType",
    "LocalPrefs",
    "data/MapFile",
    "data/vfs/VirtualFile",
    "engine/MapSupport",
    "data/vfs/IOError",
    "data/vfs/StorageQuotaError",
    "data/vfs/FileNotFoundError",
    "engine/Engine",
    "util/disposable/CompositeDisposable",
    "engine/ResourceLoader",
    "engine/MapManifest",
    "data/vfs/NameNotAllowedError",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o, l, c, h, u, d, g, p, m, f, y, T, v, b, S, w, E;
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
      ],
      execute: function () {
        ((E = class extends c.MainMenuScreen {
          constructor(e, t, i, r, s, a, n, o, l, c) {
            (super(),
              (this.strings = e),
              (this.jsxRenderer = t),
              (this.mapFileLoader = i),
              (this.errorHandler = r),
              (this.messageBoxApi = s),
              (this.localPrefs = a),
              (this.mapList = n),
              (this.gameModes = o),
              (this.mapDir = l),
              (this.sentry = c),
              (this.title = this.strings.get("GUI:ChooseMap")),
              (this.disposables = new v.CompositeDisposable()),
              (this.handleSelectMap = (t, e) => {
                var i = this.selectedMapName !== t;
                ((this.selectedMapName = t),
                  this.refreshMapInfo(),
                  i && (this.updateMapDeferred({ updatePreview: !e }), this.initSidebar()),
                  this.form.applyOptions((e) => (e.selectedMapName = t)),
                  e && this.handleSubmit());
              }),
              (this.handleSelectGameMode = (t) => {
                this.selectedGameMode = t;
                let i = this.computeAvailableMaps();
                (i.find((e) => e.mapName === this.selectedMapName) || this.handleSelectMap(i[0].mapName, !1),
                  this.refreshMapInfo(),
                  this.form.applyOptions((e) => {
                    ((e.selectedGameMode = t), (e.maps = i));
                  }));
              }),
              (this.handleSelectSort = (e) => {
                this.localPrefs.setItem(u.StorageKey.LastSortMap, e);
              }));
          }
          get backgroundImageName() {
            return "mnscrnlcustomizebattle.shp";
          }
          onEnter({ gameOpts: t, usedSlots: e, lobbyType: i }) {
            (this.updateMapsAndModes(),
              (this.selectedGameMode = this.availableGameModes.find((e) => e.id === t.gameMode)),
              (this.selectedMapName = t.mapName),
              (this.lobbyType = i),
              (this.computeUsedSlots = e),
              this.initSidebar(),
              this.initForm());
          }
          updateMapsAndModes() {
            let e = this.gameModes
              .getAll()
              .filter((t) => this.mapList.getAll().find((e) => e.gameModes.some((e) => e.id === t.id)));
            var t = this.mapList
              .getAll()
              .map((e) => ({
                mapName: e.fileName,
                mapTitle: e.getFullMapTitle(this.strings),
                maxSlots: e.maxSlots,
                gameModes: e.gameModes,
              }));
            ((this.availableGameModes = e
              .filter((e) => e.type !== h.GameModeType.Cooperative)
              .sort((e, t) => e.id - t.id)),
              (this.allMaps = t));
          }
          initForm() {
            this.controller.setMainComponent(
              this.jsxRenderer.render(
                r.jsx(s.HtmlView, {
                  innerRef: (e) => (this.form = e),
                  component: a.MapSel,
                  props: {
                    strings: this.strings,
                    maps: this.computeAvailableMaps(),
                    gameModes: this.availableGameModes,
                    selectedMapName: this.selectedMapName,
                    selectedGameMode: this.selectedGameMode,
                    initialSortType: this.readInitialSort(),
                    onSelectMap: this.handleSelectMap,
                    onSelectGameMode: this.handleSelectGameMode,
                    onSelectSort: this.handleSelectSort,
                  },
                }),
              )[0],
            );
          }
          readInitialSort() {
            let e = this.localPrefs.getItem(u.StorageKey.LastSortMap);
            return ((e && Object.values(a.SortType).includes(e)) || (e = a.SortType.None), e);
          }
          initSidebar() {
            (this.controller.setSidebarButtons(
              [
                {
                  label: this.strings.get("GUI:UseMap"),
                  tooltip: this.strings.get("STT:ScenarioButtonUseMap"),
                  onClick: () => {
                    this.handleSubmit();
                  },
                },
                ...(this.mapDir
                  ? [
                      {
                        label: this.strings.get("TS:ImportMap"),
                        tooltip: this.strings.get("STT:ImportMap"),
                        onClick: async () => {
                          let e = new l.CancellationTokenSource();
                          var t = () => e.cancel();
                          this.disposables.add(t);
                          try {
                            await this.importMap(e.token);
                          } catch (e) {
                            return void (e instanceof l.OperationCanceledError || this.handleMapImportError(e));
                          } finally {
                            this.disposables.remove(t);
                          }
                        },
                      },
                    ]
                  : []),
                {
                  label: this.strings.get("GUI:Cancel"),
                  tooltip: this.strings.get("STT:ScenarioButtonCancel"),
                  isBottom: !0,
                  onClick: () => {
                    this.controller?.popScreen();
                  },
                },
              ],
              !0,
            ),
              this.refreshMapInfo(),
              this.controller.showSidebarButtons());
          }
          async importMap(r) {
            let t = T.Engine.supportedMapTypes.get(T.Engine.getActiveEngine());
            if (!t) throw new Error(`No supported map types found for engine type "${T.Engine.getActiveEngine()}"`);
            let s;
            try {
              var a = await i.showOpenFilePicker({
                types: [{ description: "RA2 Map", accept: { "text/plain": t.map((e) => "." + e) } }],
                excludeAcceptAllOption: !0,
              });
              let e = Array.isArray(a) ? a[0] : a;
              s = await e.getFile();
            } catch (e) {
              if ("AbortError" === e.name) return;
              if (e instanceof DOMException) throw new m.IOError(`File could not be read (${e.name})`, { cause: e });
              throw e;
            }
            if (t.some((e) => s.name.toLowerCase().endsWith("." + e)))
              if (this.mapList.getByName(s.name))
                await this.messageBoxApi.alert(
                  this.strings.get("TS:ImportMapDuplicateError", s.name),
                  this.strings.get("GUI:Ok"),
                );
              else {
                a = await g.VirtualFile.fromRealFile(s);
                let e, t;
                try {
                  e = new d.MapFile(a);
                  var n = p.MapSupport.check(e, this.strings);
                  if (n) return void (await this.messageBoxApi.alert(n, this.strings.get("GUI:Ok")));
                  t = new S.MapManifest().fromMapFile(a, this.gameModes.getAll());
                } catch (e) {
                  return (
                    console.error(e),
                    void (await this.messageBoxApi.alert(this.strings.get("TXT_MAP_ERROR"), this.strings.get("GUI:Ok")))
                  );
                }
                if (e.unknownActionTypes.size || e.unknownEventTypes.size)
                  if (
                    !(await this.messageBoxApi.confirm(
                      this.strings.get("TS:MapUnsupportedTriggers"),
                      this.strings.get("GUI:Continue"),
                      this.strings.get("GUI:Cancel"),
                    ))
                  )
                    return;
                let i = t.gameModes;
                i.length
                  ? (await this.mapDir.writeFile(a),
                    this.mapList.add(t),
                    r.throwIfCancelled(),
                    this.updateMapsAndModes(),
                    this.form.applyOptions((e) => {
                      ((e.gameModes = this.availableGameModes), (e.maps = this.computeAvailableMaps()));
                    }),
                    i.some((e) => this.selectedGameMode.id === e.id) || this.handleSelectGameMode(i[0]),
                    this.handleSelectMap(a.filename, !1))
                  : await this.messageBoxApi.alert(
                      this.strings.get("TS:MapUnsupportedGameMode"),
                      this.strings.get("GUI:Ok"),
                    );
              }
            else
              await this.messageBoxApi.alert(
                this.strings.get("TS:ImportMapUnsupportedType", t.map((e) => "*." + e).join(", ")),
                this.strings.get("GUI:Ok"),
              );
          }
          handleMapImportError(e) {
            let t = this.strings,
              i = t.get("TS:ImportMapError");
            ("QuotaExceededError" === e.name || e instanceof f.StorageQuotaError
              ? (i += "\n\n" + t.get("ts:storage_quota_exceeded"))
              : e instanceof w.NameNotAllowedError
                ? (i += "\n\n" + t.get("TS:FileNameError"))
                : e instanceof m.IOError ||
                  e instanceof y.FileNotFoundError ||
                  this.sentry?.captureException(new Error("Map import failed " + (e.message ?? e.name), { cause: e })),
              this.errorHandler.handle(e, i, () => {}));
          }
          async handleSubmit() {
            let e = new l.CancellationTokenSource();
            var t = () => e.cancel();
            this.disposables.add(t);
            try {
              await this.submitMap(e.token);
            } catch (e) {
              if (!(e instanceof l.OperationCanceledError)) throw e;
            } finally {
              this.disposables.remove(t);
            }
          }
          async submitMap(e) {
            let t = !1;
            if (this.mapFileUpdateTask) {
              (this.form.hide(), this.controller?.hideSidebarButtons(), (t = !0));
              try {
                await this.mapFileUpdateTask.wait();
              } catch (e) {}
            }
            if ((e.throwIfCancelled(), this.changedMapFile))
              try {
                var i = new d.MapFile(this.changedMapFile),
                  r = p.MapSupport.check(i, this.strings);
                if (r) return void (await this.messageBoxApi.alert(r, this.strings.get("GUI:Ok")));
              } catch (e) {
                return (
                  console.error(e),
                  await this.messageBoxApi.alert(this.strings.get("TXT_MAP_ERROR"), this.strings.get("GUI:Ok")),
                  void (t && (this.form.show(), this.controller?.showSidebarButtons()))
                );
              }
            let s;
            ((s =
              !(this.computeUsedSlots() > this.allMaps.find((e) => e.mapName === this.selectedMapName).maxSlots) ||
              (await this.messageBoxApi.confirm(
                this.strings.get("GUI:EjectPlayers"),
                this.strings.get("GUI:Ok"),
                this.strings.get("GUI:Cancel"),
              ))),
              e.throwIfCancelled(),
              s
                ? await this.controller?.popScreen({
                    gameMode: this.selectedGameMode,
                    mapName: this.selectedMapName,
                    changedMapFile: this.changedMapFile,
                  })
                : t && (this.form.show(), this.controller?.showSidebarButtons()));
          }
          computeAvailableMaps() {
            return this.allMaps.filter((e) => e.gameModes.some((e) => e.id === this.selectedGameMode.id));
          }
          refreshMapInfo() {
            this.controller?.setSidebarMpContent({
              text:
                this.strings.get(this.selectedGameMode.label) +
                "\n\n" +
                this.allMaps.find((e) => e.mapName === this.selectedMapName)?.mapTitle,
            });
          }
          async onLeave() {
            ((this.computeUsedSlots = void 0),
              (this.availableGameModes = void 0),
              (this.allMaps = void 0),
              this.messageBoxApi.destroy(),
              (this.form = void 0),
              this.mapFileUpdateTask?.cancel(),
              (this.mapFileUpdateTask = void 0),
              this.controller.setMainComponent(),
              this.disposables.dispose(),
              await this.controller.hideSidebarButtons());
          }
          updateMapDeferred({ updatePreview: r }) {
            (this.mapFileUpdateTask?.cancel(),
              (this.mapFileUpdateTask = new o.Task(async (t) => {
                if (this.controller) {
                  (r && this.controller.setSidebarPreview(), (this.changedMapFile = void 0));
                  let e;
                  try {
                    e = this.changedMapFile = await this.mapFileLoader.load(this.selectedMapName, t);
                  } catch (e) {
                    if (e instanceof b.DownloadError)
                      return void this.errorHandler.handle(e, this.strings.get("TXT_DOWNLOAD_FAILED"), () => {
                        this.controller?.popScreen();
                      });
                    throw e;
                  }
                  var i;
                  (r &&
                    !t.isCancelled() &&
                    ((i = new n.MapPreviewRenderer(this.strings).render(
                      new d.MapFile(e),
                      this.lobbyType,
                      this.controller.getSidebarPreviewSize(),
                    )),
                    this.controller.setSidebarPreview(i)),
                    (this.mapFileUpdateTask = void 0));
                }
              })),
              this.mapFileUpdateTask.start().catch((e) => {
                e instanceof l.OperationCanceledError ||
                  (console.error("Failed to render map preview"), console.error(e));
              }));
          }
        }),
          e("MapSelScreen", E));
      },
    };
  },
);
