/**
 * ModSelScreen — 模组管理屏（下载/导入/卸载/浏览）。
 *
 * 由 gui/screen/mainMenu/modSel/ModSelScreen.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React from "react"; // 孪生（react 外部依赖）
import { jsx } from "gui/jsx/jsx"; // 孪生
import { HtmlView } from "gui/jsx/HtmlView"; // 孪生
import { ScreenType as RootScreenType } from "gui/screen/ScreenType"; // 孪生（本组内一并转换）
import { ScreenType } from "gui/screen/mainMenu/ScreenType"; // 孪生（本组内一并转换）
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { StorageQuotaError } from "data/vfs/StorageQuotaError"; // 已转换
import { MainMenuScreen } from "gui/screen/mainMenu/MainMenuScreen"; // 孪生（本组内一并转换）
import { IOError } from "data/vfs/IOError"; // 已转换
import { FileNotFoundError } from "data/vfs/FileNotFoundError"; // 已转换
import { ModSel } from "gui/screen/mainMenu/modSel/ModSel"; // 孪生（本组内一并转换）
import { Engine } from "engine/Engine"; // 已转换
import { FileSystemUtil } from "engine/gameRes/FileSystemUtil"; // 已转换
import { ModImporter } from "gui/screen/mainMenu/modSel/ModImporter"; // 孪生（本组内一并转换）
import { InvalidArchiveError } from "engine/gameRes/importError/InvalidArchiveError"; // 已转换
import { ArchiveExtractionError } from "engine/gameRes/importError/ArchiveExtractionError"; // 已转换
import { BadModArchiveError } from "gui/screen/mainMenu/modSel/BadModArchiveError"; // 孪生（本组内一并转换）
import { DuplicateModError } from "gui/screen/mainMenu/modSel/DuplicateModError"; // 孪生（本组内一并转换）
import { Mod } from "gui/screen/mainMenu/modSel/Mod"; // 孪生（本组内一并转换）
import { ModStatus } from "gui/screen/mainMenu/modSel/ModStatus"; // 孪生（本组内一并转换）
import {
  CancellationTokenSource,
  OperationCanceledError,
} from "@puzzl/core/lib/async/cancellation"; // 已转换
import { ModDownloadPrompt } from "gui/screen/mainMenu/modSel/ModDownloadPrompt"; // 孪生（本组内一并转换）

/* eslint-disable @typescript-eslint/no-explicit-any */

export class ModSelScreen extends MainMenuScreen {
  rootController: any;
  strings: any;
  jsxRenderer: any;
  errorHandler: any;
  messageBoxApi: any;
  modManager: any;
  activeModId: any;
  modSdkUrl: any;
  modResourceLoader: any;
  sentry: any;
  disposables = new CompositeDisposable();
  availableMods: any[] = [];
  activeMod?: any;
  selectedMod?: any;
  form?: any;
  handleSelectMod: (mod: any, load?: boolean) => Promise<void>;

  constructor(
    rootController: any,
    strings: any,
    jsxRenderer: any,
    errorHandler: any,
    messageBoxApi: any,
    modManager: any,
    activeModId: any,
    modSdkUrl: any,
    modResourceLoader: any,
    sentry: any,
  ) {
    super();
    this.rootController = rootController;
    this.strings = strings;
    this.jsxRenderer = jsxRenderer;
    this.errorHandler = errorHandler;
    this.messageBoxApi = messageBoxApi;
    this.modManager = modManager;
    this.activeModId = activeModId;
    this.modSdkUrl = modSdkUrl;
    this.modResourceLoader = modResourceLoader;
    this.sentry = sentry;
    this.title = this.strings.get("GUI:Mods");
    this.handleSelectMod = async (mod, load) => {
      var changed = this.selectedMod?.id !== mod.id;
      this.selectedMod = mod;
      if (changed) this.updateSidebarButtons();
      this.form?.applyOptions((o: any) => {
        o.selectedMod = mod;
      });
      if (load && mod !== this.activeMod && mod.status === ModStatus.Installed)
        await this.loadOrUnloadMod(mod);
    };
  }

  async onEnter(): Promise<void> {
    this.availableMods = [];
    this.controller.toggleMainVideo(false);
    this.initForm();
    var mods = await this.loadAvailableMods();
    if (mods) {
      this.availableMods = mods;
      this.activeMod = this.availableMods.find((m) => m.id === this.activeModId);
      this.selectedMod = this.activeMod;
      this.form.applyOptions((o: any) => {
        o.mods = this.availableMods;
        o.activeMod = this.activeMod;
        o.selectedMod = this.selectedMod;
      });
      this.initSidebar();
    }
  }

  async loadAvailableMods(): Promise<any[] | undefined> {
    try {
      var [local, remote] = await Promise.all([
        this.modManager.listLocal(),
        this.modManager.listRemote().catch((e: any) => {
          console.warn("Failed to fetch remote mods", [e]);
        }),
      ]);
      return await this.modManager.buildModList(local, remote);
    } catch (e: any) {
      if (
        !(e instanceof IOError) &&
        !(e instanceof FileNotFoundError) &&
        !(e instanceof StorageQuotaError)
      )
        this.sentry?.captureException(
          Object.assign(
            new Error(`Failed to load mod list (${e.name ?? e.message})`),
            { cause: e },
          ),
        );
      this.handleError(e, this.strings.get("GUI:ModListError"));
      return void 0;
    }
  }

  initForm(): void {
    this.controller.setMainComponent(
      this.jsxRenderer.render(
        jsx(HtmlView as any, {
          innerRef: (e: any) => (this.form = e),
          component: ModSel,
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

  initSidebar(): void {
    this.updateSidebarButtons();
    this.controller.showSidebarButtons();
  }

  updateSidebarButtons(): void {
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
          var mod = this.selectedMod;
          if (mod.status === ModStatus.Installed || mod === this.activeMod) {
            await this.loadOrUnloadMod(mod);
            return;
          }
          var sizeMb = (mod.meta.downloadSize || 0) / 1024 / 1024;
          if (mod.meta.manualDownload) {
            var isUpdate = mod.status === ModStatus.UpdateAvailable;
            var prompt = React.createElement(ModDownloadPrompt, {
              url: mod.meta.download,
              sizeMb,
              isUpdate,
              strings: this.strings,
              onClick: () => this.messageBoxApi.destroy(),
            });
            if (isUpdate) {
              const loadAnyway = await this.messageBoxApi.confirm(
                prompt,
                this.strings.get("GUI:Close"),
                this.strings.get("GUI:ModActionLoadAnyway"),
              );
              if (!loadAnyway) await this.loadOrUnloadMod(mod);
            } else
              this.messageBoxApi.show(
                prompt,
                this.strings.get("GUI:Close"),
                () => {},
              );
            return;
          }
          let doUpdate = false;
          if (mod.status === ModStatus.UpdateAvailable) {
            const update = await this.messageBoxApi.confirm(
              this.strings.get("GUI:ModUpdateAvail") +
                "\n\n" +
                this.strings.get(
                  "GUI:UpdateModPrompt",
                  mod.latestVersion,
                  sizeMb,
                ),
              this.strings.get("GUI:ModActionUpdate"),
              this.strings.get("GUI:ModActionLoadAnyway"),
            );
            if (!update) {
              await this.loadOrUnloadMod(mod);
              return;
            }
            doUpdate = true;
          } else if (
            10 < sizeMb &&
            !(await this.messageBoxApi.confirm(
              this.strings.get("GUI:InstallModDownloadPrompt", sizeMb),
              this.strings.get("GUI:Continue"),
              this.strings.get("GUI:Cancel"),
            ))
          )
            return;
          let file: File;
          try {
            file = await this.downloadMod(mod);
          } catch (e) {
            if (e instanceof OperationCanceledError) return;
            this.errorHandler.handle(
              e,
              this.strings.get("GUI:DownloadFailed"),
              () => {},
            );
            return;
          }
          this.messageBoxApi.destroy();
          try {
            await this.importModFromFile(
              file,
              mod.status === ModStatus.UpdateAvailable,
            );
          } catch (e) {
            this.handleModImportError(e);
            return;
          }
          if (doUpdate) await this.loadOrUnloadMod(mod);
        },
      },
      {
        label: this.strings.get("GUI:ImportMod"),
        tooltip: this.strings.get("STT:ImportMod"),
        onClick: async () => {
          try {
            let file: File;
            try {
              const handle = await (FileSystemUtil as any).showArchivePicker();
              file = await handle.getFile();
            } catch (e: any) {
              if ("AbortError" === e.name) return;
              if (e instanceof DOMException)
                throw new IOError(`File could not be read (${e.name})`, {
                  cause: e,
                });
              throw e;
            }
            await this.importModFromFile(file, false);
          } catch (e) {
            this.handleModImportError(e);
          }
        },
      },
      {
        label: this.strings.get("GUI:UninstallMod"),
        tooltip: this.strings.get("STT:UninstallMod"),
        disabled: !(
          this.selectedMod?.isInstalled() &&
          this.activeMod !== this.selectedMod
        ),
        onClick: async () => {
          var mod = this.selectedMod;
          const ok = await this.messageBoxApi.confirm(
            this.strings.get("GUI:ConfirmUninstallMod", mod.name),
            this.strings.get("GUI:Ok"),
            this.strings.get("GUI:Cancel"),
          );
          if (!ok) return;
          this.messageBoxApi.show(this.strings.get("GUI:WorkingPleaseWait"));
          try {
            await this.modManager.deleteModFiles(mod.id);
          } catch (e: any) {
            const msg =
              e instanceof StorageQuotaError
                ? this.strings.get("ts:storage_quota_exceeded")
                : this.strings.get("GUI:UninstallModError");
            this.errorHandler.handle(e, msg, () => {});
            return;
          } finally {
            this.messageBoxApi.destroy();
          }
          const mods = await this.loadAvailableMods();
          if (mods) {
            this.availableMods = mods;
            this.selectedMod = void 0;
            this.form?.applyOptions((o: any) => {
              o.mods = this.availableMods;
              o.selectedMod = void 0;
            });
            this.updateSidebarButtons();
          }
        },
      },
      {
        label: this.strings.get("GUI:BrowseMod"),
        tooltip: this.strings.get("STT:BrowseMod"),
        onClick: () => {
          this.controller?.pushScreen(ScreenType.OptionsStorage, {
            startIn:
              (Engine as any).rfsSettings.modDir +
              (this.selectedMod?.isInstalled()
                ? "/" + this.selectedMod.id
                : ""),
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
        isBottom: true,
        onClick: () => {
          this.controller?.popScreen();
        },
      },
    ]);
  }

  async loadOrUnloadMod(mod: any): Promise<void> {
    await this.controller?.hideSidebarButtons();
    this.modManager.loadMod(mod !== this.activeMod ? mod.id : void 0);
  }

  async downloadMod(mod: any): Promise<File> {
    var url = mod.meta.download;
    if (!url) throw new Error("Mod meta is missing download");
    let cts = new CancellationTokenSource();
    this.messageBoxApi.show(
      this.strings.get("TS:Downloading"),
      this.strings.get("GUI:Cancel"),
      () => cts.cancel(),
    );
    var res = {
      id: "archive",
      src: url,
      type: "binary",
      sizeHint: mod.meta.downloadSize,
    };
    let map = await this.modResourceLoader.loadResources(
      [res],
      cts.token,
      (p: number) => {
        this.messageBoxApi.updateText(
          this.strings.get("TS:DownloadingPg", p),
        );
      },
    );
    var blob = map.pop("archive");
    return new File(
      [blob],
      this.modResourceLoader.getResourceFileName(res),
    );
  }

  async importModFromFile(file: File, isUpdate: boolean): Promise<void> {
    this.messageBoxApi.show(
      this.strings.get("ts:import_preparing_for_import"),
    );
    const onProgress = (text: any) => this.messageBoxApi.updateText(text);
    let meta: any;
    try {
      meta = await new ModImporter(
        this.strings,
        this.messageBoxApi,
        navigator.storage,
      ).import(file, this.modManager.getModDir(), isUpdate, onProgress);
    } finally {
      this.messageBoxApi.destroy();
    }
    if (meta) {
      const mod = new Mod(meta, void 0);
      if (mod) {
        let idx = this.availableMods.findIndex((m) => m.id === mod.id);
        if (-1 !== idx) this.availableMods.splice(idx, 1, mod);
        else this.availableMods.unshift(mod);
        this.selectedMod = mod;
        this.form?.applyOptions((o: any) => {
          o.mods = this.availableMods;
          o.selectedMod = mod;
        });
        this.updateSidebarButtons();
      }
    }
  }

  handleModImportError(e: any): void {
    let s = this.strings;
    let message = s.get("GUI:ImportModError");
    if (e instanceof BadModArchiveError)
      message += "\n\n" + s.get("GUI:ImportModBadArchive");
    else if (e instanceof DuplicateModError)
      message += "\n\n" + s.get("GUI:ImportDuplicateModError");
    else if (e instanceof InvalidArchiveError)
      message += "\n\n" + s.get("ts:import_invalid_archive");
    else if (e instanceof ArchiveExtractionError) {
      if (e.cause?.message?.match(/out of memory|allocation/i))
        message += "\n\n" + s.get("ts:import_out_of_memory");
      else message += "\n\n" + s.get("ts:import_archive_extract_failed");
    } else if (e.message?.match(/out of memory|allocation/i))
      message += "\n\n" + s.get("ts:import_out_of_memory");
    else if ("QuotaExceededError" === e.name || e instanceof StorageQuotaError)
      message += "\n\n" + s.get("ts:storage_quota_exceeded");
    else if (!(e instanceof IOError) && !(e instanceof FileNotFoundError))
      this.sentry?.captureException(
        Object.assign(
          new Error("Mod import failed " + (e.message ?? e.name)),
          { cause: e },
        ),
      );
    this.errorHandler.handle(e, message, () => {});
  }

  async onStack(): Promise<void> {
    await this.onLeave();
  }

  onUnstack(): void {
    this.onEnter();
  }

  async onLeave(): Promise<void> {
    this.availableMods.length = 0;
    this.form = void 0;
    this.messageBoxApi.destroy();
    this.disposables.dispose();
    this.controller.setMainComponent();
    await this.controller.hideSidebarButtons();
  }

  handleError(e: any, message: string): void {
    this.errorHandler.handle(e, message, () => {
      this.rootController.goToScreen(RootScreenType.MainMenuRoot);
    });
  }
}
