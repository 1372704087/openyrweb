/**
 * MapSelScreen — 选图屏（模式过滤/导入/提交回大厅）。
 *
 * 由 gui/screen/mainMenu/mapSel/MapSelScreen.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import * as showOpenFilePickerNs from "file-system-access"; // 孪生
import { jsx } from "gui/jsx/jsx"; // 孪生
import { HtmlView } from "gui/jsx/HtmlView"; // 孪生
import { MapSel, SortType } from "gui/screen/mainMenu/mapSel/component/MapSel"; // 孪生（本组内一并转换）
import { MapPreviewRenderer } from "gui/screen/mainMenu/lobby/MapPreviewRenderer"; // 孪生（本组内一并转换）
import { Task } from "@puzzl/core/lib/async/Task"; // 已转换
import {
  CancellationTokenSource,
  OperationCanceledError,
} from "@puzzl/core/lib/async/cancellation"; // 已转换
import { MainMenuScreen } from "gui/screen/mainMenu/MainMenuScreen"; // 孪生（本组内一并转换）
import { GameModeType } from "game/ini/GameModeType"; // 已转换
import { StorageKey } from "LocalPrefs"; // 已转换
import { MapFile } from "data/MapFile"; // 已转换
import { VirtualFile } from "data/vfs/VirtualFile"; // 已转换
import { MapSupport } from "engine/MapSupport"; // 已转换
import { IOError } from "data/vfs/IOError"; // 已转换
import { StorageQuotaError } from "data/vfs/StorageQuotaError"; // 已转换
import { FileNotFoundError } from "data/vfs/FileNotFoundError"; // 已转换
import { Engine } from "engine/Engine"; // 已转换
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { DownloadError } from "engine/ResourceLoader"; // 已转换
import { MapManifest } from "engine/MapManifest"; // 已转换
import { NameNotAllowedError } from "data/vfs/NameNotAllowedError"; // 已转换

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const showOpenFilePicker: any = (showOpenFilePickerNs as any).showOpenFilePicker;

/* eslint-disable @typescript-eslint/no-explicit-any */

export class MapSelScreen extends MainMenuScreen {
  strings: any;
  jsxRenderer: any;
  mapFileLoader: any;
  errorHandler: any;
  messageBoxApi: any;
  localPrefs: any;
  mapList: any;
  gameModes: any;
  mapDir: any;
  sentry: any;
  disposables = new CompositeDisposable();
  selectedMapName?: string;
  selectedGameMode?: any;
  lobbyType?: any;
  computeUsedSlots?: () => number;
  availableGameModes?: any[];
  allMaps?: any[];
  form?: any;
  changedMapFile?: any;
  mapFileUpdateTask?: any;
  handleSelectMap: (name: string, submit?: boolean) => void;
  handleSelectGameMode: (mode: any) => void;
  handleSelectSort: (type: string) => void;

  constructor(
    strings: any,
    jsxRenderer: any,
    mapFileLoader: any,
    errorHandler: any,
    messageBoxApi: any,
    localPrefs: any,
    mapList: any,
    gameModes: any,
    mapDir: any,
    sentry: any,
  ) {
    super();
    this.strings = strings;
    this.jsxRenderer = jsxRenderer;
    this.mapFileLoader = mapFileLoader;
    this.errorHandler = errorHandler;
    this.messageBoxApi = messageBoxApi;
    this.localPrefs = localPrefs;
    this.mapList = mapList;
    this.gameModes = gameModes;
    this.mapDir = mapDir;
    this.sentry = sentry;
    this.title = this.strings.get("GUI:ChooseMap");
    this.handleSelectMap = (name, submit) => {
      var changed = this.selectedMapName !== name;
      this.selectedMapName = name;
      this.refreshMapInfo();
      if (changed) {
        this.updateMapDeferred({ updatePreview: !submit });
        this.initSidebar();
      }
      this.form.applyOptions((o: any) => (o.selectedMapName = name));
      if (submit) this.handleSubmit();
    };
    this.handleSelectGameMode = (mode) => {
      this.selectedGameMode = mode;
      let maps = this.computeAvailableMaps();
      if (!maps.find((m) => m.mapName === this.selectedMapName))
        this.handleSelectMap(maps[0].mapName, false);
      this.refreshMapInfo();
      this.form.applyOptions((o: any) => {
        o.selectedGameMode = mode;
        o.maps = maps;
      });
    };
    this.handleSelectSort = (type) => {
      this.localPrefs.setItem(StorageKey.LastSortMap, type);
    };
  }

  get backgroundImageName() {
    return "mnscrnlcustomizebattle.shp";
  }

  onEnter({ gameOpts, usedSlots, lobbyType }: any): void {
    this.updateMapsAndModes();
    this.selectedGameMode = this.availableGameModes!.find(
      (m) => m.id === gameOpts.gameMode,
    );
    this.selectedMapName = gameOpts.mapName;
    this.lobbyType = lobbyType;
    this.computeUsedSlots = usedSlots;
    this.initSidebar();
    this.initForm();
  }

  updateMapsAndModes(): void {
    let modes = this.gameModes
      .getAll()
      .filter((t: any) =>
        this.mapList
          .getAll()
          .find((m: any) => m.gameModes.some((x: any) => x.id === t.id)),
      );
    var maps = this.mapList.getAll().map((m: any) => ({
      mapName: m.fileName,
      mapTitle: m.getFullMapTitle(this.strings),
      maxSlots: m.maxSlots,
      gameModes: m.gameModes,
    }));
    this.availableGameModes = modes
      .filter((m: any) => m.type !== GameModeType.Cooperative)
      .sort((a, b) => a.id - b.id);
    this.allMaps = maps;
  }

  initForm(): void {
    this.controller.setMainComponent(
      this.jsxRenderer.render(
        jsx(HtmlView as any, {
          innerRef: (e: any) => (this.form = e),
          component: MapSel,
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

  readInitialSort(): string {
    let stored = this.localPrefs.getItem(StorageKey.LastSortMap);
    if (!(stored && Object.values(SortType).includes(stored as any)))
      stored = SortType.None;
    return stored;
  }

  initSidebar(): void {
    this.controller.setSidebarButtons(
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
                  let cts = new CancellationTokenSource();
                  const cancel = () => cts.cancel();
                  this.disposables.add(cancel);
                  try {
                    await this.importMap(cts.token);
                  } catch (e) {
                    if (!(e instanceof OperationCanceledError))
                      this.handleMapImportError(e);
                    return;
                  } finally {
                    this.disposables.remove(cancel);
                  }
                },
              },
            ]
          : []),
        {
          label: this.strings.get("GUI:Cancel"),
          tooltip: this.strings.get("STT:ScenarioButtonCancel"),
          isBottom: true,
          onClick: () => {
            this.controller?.popScreen();
          },
        },
      ],
      true,
    );
    this.refreshMapInfo();
    this.controller.showSidebarButtons();
  }

  async importMap(cancel: any): Promise<void> {
    let types = (Engine as any).supportedMapTypes.get(
      (Engine as any).getActiveEngine(),
    );
    if (!types)
      throw new Error(
        `No supported map types found for engine type "${(Engine as any).getActiveEngine()}"`,
      );
    let file: File;
    try {
      var handles = await showOpenFilePicker({
        types: [
          {
            description: "RA2 Map",
            accept: { "text/plain": types.map((e: string) => "." + e) },
          },
        ],
        excludeAcceptAllOption: true,
      });
      let handle = Array.isArray(handles) ? handles[0] : handles;
      file = await handle.getFile();
    } catch (e: any) {
      if ("AbortError" === e.name) return;
      if (e instanceof DOMException)
        throw new IOError(`File could not be read (${e.name})`, { cause: e });
      throw e;
    }
    if (!types.some((ext: string) => file.name.toLowerCase().endsWith("." + ext))) {
      await this.messageBoxApi.alert(
        this.strings.get(
          "TS:ImportMapUnsupportedType",
          types.map((e: string) => "*." + e).join(", "),
        ),
        this.strings.get("GUI:Ok"),
      );
      return;
    }
    if (this.mapList.getByName(file.name)) {
      await this.messageBoxApi.alert(
        this.strings.get("TS:ImportMapDuplicateError", file.name),
        this.strings.get("GUI:Ok"),
      );
      return;
    }
    const virtual = await VirtualFile.fromRealFile(file);
    let mapFile: any;
    let manifest: any;
    try {
      mapFile = new MapFile(virtual);
      var unsupported = MapSupport.check(mapFile, this.strings);
      if (unsupported) {
        await this.messageBoxApi.alert(unsupported, this.strings.get("GUI:Ok"));
        return;
      }
      manifest = new MapManifest().fromMapFile(
        virtual,
        this.gameModes.getAll(),
      );
    } catch (e) {
      console.error(e);
      await this.messageBoxApi.alert(
        this.strings.get("TXT_MAP_ERROR"),
        this.strings.get("GUI:Ok"),
      );
      return;
    }
    if (
      mapFile.unknownActionTypes.size ||
      mapFile.unknownEventTypes.size ||
      mapFile.unimplementedActionTypes?.size ||
      mapFile.unimplementedEventTypes?.size
    ) {
      const ok = await this.messageBoxApi.confirm(
        this.strings.get("TS:MapUnsupportedTriggers"),
        this.strings.get("GUI:Continue"),
        this.strings.get("GUI:Cancel"),
      );
      if (!ok) return;
    }
    const modes = manifest.gameModes;
    if (modes.length) {
      await this.mapDir.writeFile(virtual);
      this.mapList.add(manifest);
      cancel.throwIfCancelled();
      this.updateMapsAndModes();
      this.form.applyOptions((o: any) => {
        o.gameModes = this.availableGameModes;
        o.maps = this.computeAvailableMaps();
      });
      if (!modes.some((m: any) => this.selectedGameMode.id === m.id))
        this.handleSelectGameMode(modes[0]);
      this.handleSelectMap(virtual.filename, false);
    } else
      await this.messageBoxApi.alert(
        this.strings.get("TS:MapUnsupportedGameMode"),
        this.strings.get("GUI:Ok"),
      );
  }

  handleMapImportError(e: any): void {
    let s = this.strings;
    let message = s.get("TS:ImportMapError");
    if ("QuotaExceededError" === e.name || e instanceof StorageQuotaError)
      message += "\n\n" + s.get("ts:storage_quota_exceeded");
    else if (e instanceof NameNotAllowedError)
      message += "\n\n" + s.get("TS:FileNameError");
    else if (
      !(e instanceof IOError) &&
      !(e instanceof FileNotFoundError)
    )
      this.sentry?.captureException(
        Object.assign(
          new Error("Map import failed " + (e.message ?? e.name)),
          { cause: e },
        ),
      );
    this.errorHandler.handle(e, message, () => {});
  }

  async handleSubmit(): Promise<void> {
    let cts = new CancellationTokenSource();
    const cancel = () => cts.cancel();
    this.disposables.add(cancel);
    try {
      await this.submitMap(cts.token);
    } catch (e) {
      if (!(e instanceof OperationCanceledError)) throw e;
    } finally {
      this.disposables.remove(cancel);
    }
  }

  async submitMap(cancel: any): Promise<void> {
    let wasHidden = false;
    if (this.mapFileUpdateTask) {
      this.form.hide();
      this.controller?.hideSidebarButtons();
      wasHidden = true;
      try {
        await this.mapFileUpdateTask.wait();
      } catch {
        /* twin empty catch */
      }
    }
    cancel.throwIfCancelled();
    if (this.changedMapFile)
      try {
        var mapFile = new MapFile(this.changedMapFile);
        var issue = MapSupport.check(mapFile, this.strings);
        if (issue) {
          await this.messageBoxApi.alert(issue, this.strings.get("GUI:Ok"));
          return;
        }
      } catch (e) {
        console.error(e);
        await this.messageBoxApi.alert(
          this.strings.get("TXT_MAP_ERROR"),
          this.strings.get("GUI:Ok"),
        );
        if (wasHidden) {
          this.form.show();
          this.controller?.showSidebarButtons();
        }
        return;
      }
    let ok =
      !(
        this.computeUsedSlots!() >
        this.allMaps.find((m) => m.mapName === this.selectedMapName).maxSlots
      ) ||
      (await this.messageBoxApi.confirm(
        this.strings.get("GUI:EjectPlayers"),
        this.strings.get("GUI:Ok"),
        this.strings.get("GUI:Cancel"),
      ));
    cancel.throwIfCancelled();
    if (ok)
      await this.controller?.popScreen({
        gameMode: this.selectedGameMode,
        mapName: this.selectedMapName,
        changedMapFile: this.changedMapFile,
      });
    else if (wasHidden) {
      this.form.show();
      this.controller?.showSidebarButtons();
    }
  }

  computeAvailableMaps(): any[] {
    return this.allMaps!.filter((m) =>
      m.gameModes.some((x: any) => x.id === this.selectedGameMode.id),
    );
  }

  refreshMapInfo(): void {
    this.controller?.setSidebarMpContent({
      text:
        this.strings.get(this.selectedGameMode.label) +
        "\n\n" +
        this.allMaps!.find((m) => m.mapName === this.selectedMapName)
          ?.mapTitle,
    });
  }

  async onLeave(): Promise<void> {
    this.computeUsedSlots = void 0;
    this.availableGameModes = void 0;
    this.allMaps = void 0;
    this.messageBoxApi.destroy();
    this.form = void 0;
    this.mapFileUpdateTask?.cancel();
    this.mapFileUpdateTask = void 0;
    this.controller.setMainComponent();
    this.disposables.dispose();
    await this.controller.hideSidebarButtons();
  }

  updateMapDeferred({ updatePreview }: { updatePreview: boolean }): void {
    this.mapFileUpdateTask?.cancel();
    this.mapFileUpdateTask = new Task(async (cancel) => {
      if (!this.controller) return;
      if (updatePreview) this.controller.setSidebarPreview();
      this.changedMapFile = void 0;
      let data: any;
      try {
        data = this.changedMapFile = await this.mapFileLoader.load(
          this.selectedMapName,
          cancel,
        );
      } catch (e) {
        if (e instanceof DownloadError)
          return void this.errorHandler.handle(
            e,
            this.strings.get("TXT_DOWNLOAD_FAILED"),
            () => {
              this.controller?.popScreen();
            },
          );
        throw e;
      }
      if (updatePreview && !cancel.isCancelled()) {
        const preview = new MapPreviewRenderer(this.strings).render(
          new MapFile(data),
          this.lobbyType,
          this.controller.getSidebarPreviewSize(),
        );
        this.controller.setSidebarPreview(preview);
      }
      this.mapFileUpdateTask = void 0;
    });
    this.mapFileUpdateTask.start().catch((e) => {
      if (!(e instanceof OperationCanceledError)) {
        console.error("Failed to render map preview");
        console.error(e);
      }
    });
  }
}
