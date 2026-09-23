/**
 * ReplaySelScreen — 回放选择屏（列表/导入导出/加载/删除）。
 *
 * 版本不匹配时尝试旧客户端；详情解析走 GameOptRandomGen 上色。
 *
 * 由 gui/screen/replay/ReplaySelScreen.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { jsx } from "gui/jsx/jsx"; // 孪生
import { HtmlView } from "gui/jsx/HtmlView"; // 孪生
import { ReplaySel } from "gui/screen/replay/ReplaySel"; // 孪生（本组内一并转换）
import { Replay } from "network/gamestate/Replay"; // 已转换
import { ScreenType } from "gui/screen/ScreenType"; // 孪生（本组内一并转换）
import { KeepReplayBox } from "gui/screen/replay/KeepReplayBox"; // 孪生（本组内一并转换）
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { ReplayStorageError } from "gui/replay/ReplayStorageError"; // 已转换
import { ResourceLoader } from "engine/ResourceLoader"; // 已转换
import { StorageQuotaError } from "data/vfs/StorageQuotaError"; // 已转换
import { Task } from "@puzzl/core/lib/async/Task"; // 已转换
import { Parser } from "network/gameopt/Parser"; // 已转换
import { GameSpeed } from "game/GameSpeed"; // 已转换
import { ReplayExistsError } from "gui/replay/ReplayExistsError"; // 已转换
import { MainMenuScreen } from "gui/screen/mainMenu/MainMenuScreen"; // 孪生（本组内一并转换）
import { OperationCanceledError } from "@puzzl/core/lib/async/cancellation"; // 已转换
import { IOError } from "data/vfs/IOError"; // 已转换
import { FileNotFoundError } from "data/vfs/FileNotFoundError"; // 已转换
import { RouteHelper } from "RouteHelper"; // 已转换
import { GameOptRandomGen } from "game/gameopts/GameOptRandomGen"; // 已转换
import { OBS_COUNTRY_ID } from "game/gameopts/constants"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

export class ReplaySelScreen extends MainMenuScreen {
  engineVersion: any;
  engineModHash: any;
  activeMod: any;
  oldClientsBaseUrl: any;
  rootController: any;
  strings: any;
  jsxRenderer: any;
  errorHandler: any;
  messageBoxApi: any;
  replayManager: any;
  uiScene: any;
  rules: any;
  sentry: any;
  disposables = new CompositeDisposable();
  availableReplays: any[] = [];
  selectedReplay?: any;
  form?: any;
  fileInput?: HTMLInputElement;
  clientVersions?: any;
  currentReplayUrl?: string;
  replayDetailsTask?: any;
  handleSelectReplay: (replay: any, load?: boolean) => void;

  constructor(
    engineVersion: any,
    engineModHash: any,
    activeMod: any,
    oldClientsBaseUrl: any,
    rootController: any,
    strings: any,
    jsxRenderer: any,
    errorHandler: any,
    messageBoxApi: any,
    replayManager: any,
    uiScene: any,
    rules: any,
    sentry: any,
  ) {
    super();
    this.engineVersion = engineVersion;
    this.engineModHash = engineModHash;
    this.activeMod = activeMod;
    this.oldClientsBaseUrl = oldClientsBaseUrl;
    this.rootController = rootController;
    this.strings = strings;
    this.jsxRenderer = jsxRenderer;
    this.errorHandler = errorHandler;
    this.messageBoxApi = messageBoxApi;
    this.replayManager = replayManager;
    this.uiScene = uiScene;
    this.rules = rules;
    this.sentry = sentry;
    this.title = this.strings.get("GUI:Replays");
    this.handleSelectReplay = (replay, load) => {
      var changed = this.selectedReplay?.id !== replay.id;
      this.selectedReplay = replay;
      if (changed) this.updateSidebarButtons();
      this.form.applyOptions((o: any) => {
        o.selectedReplay = replay;
        o.selectedReplayDetails = void 0;
      });
      if (load) this.loadSelectedReplay();
      else this.loadReplayDetails(replay);
    };
  }

  async onEnter(): Promise<void> {
    this.availableReplays = [];
    this.controller.toggleMainVideo(false);
    this.initForm();
    try {
      this.availableReplays = await this.replayManager.loadList(true);
    } catch (e: any) {
      if (
        !(e instanceof IOError) &&
        !(e instanceof FileNotFoundError) &&
        !(e instanceof StorageQuotaError)
      )
        this.sentry?.captureException(
          Object.assign(
            new Error(`Failed to load replay list (${e.name ?? e.message})`),
            { cause: e },
          ),
        );
      this.handleError(e, this.strings.get("GUI:ReplayListError"));
      return;
    }
    this.selectedReplay = this.availableReplays[0];
    this.form.applyOptions((o: any) => {
      o.replays = this.availableReplays;
      o.selectedReplay = this.selectedReplay;
    });
    if (void 0 !== this.selectedReplay)
      this.loadReplayDetails(this.selectedReplay);
    this.initSidebar();
    this.initFileInput();
  }

  initForm(): void {
    this.controller.setMainComponent(
      this.jsxRenderer.render(
        jsx(HtmlView as any, {
          innerRef: (e: any) => (this.form = e),
          component: ReplaySel,
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

  initFileInput(): void {
    let input = (this.fileInput = document.createElement("input"));
    input.setAttribute("type", "file");
    input.setAttribute("accept", (Replay as any).extension);
    input.setAttribute("style", "display: none");
    document.body.appendChild(input);
    const onChange = async () => {
      var file = this.fileInput!.files?.[0];
      if (!file) return;
      try {
        await this.replayManager.importReplay(file);
        this.availableReplays = await this.replayManager.loadList();
        this.form.applyOptions((o: any) => (o.replays = this.availableReplays));
      } catch (e: any) {
        let message =
          e instanceof StorageQuotaError
            ? this.strings.get("ts:storage_quota_exceeded")
            : e instanceof ReplayStorageError
              ? this.strings.get("GUI:SaveReplayError")
              : this.strings.get("GUI:ImportReplayError");
        this.errorHandler.handle(e, message, () => {});
      }
    };
    input.addEventListener("change", onChange);
    this.disposables.add(() => {
      if (this.fileInput) document.body.removeChild(this.fileInput);
      this.fileInput!.removeEventListener("change", onChange);
      this.fileInput = void 0;
    });
  }

  initSidebar(): void {
    this.updateSidebarButtons();
    this.controller.showSidebarButtons();
  }

  updateSidebarButtons(): void {
    let meta = this.getSelectedReplayMeta();
    this.controller?.setSidebarButtons([
      {
        label: this.strings.get("GUI:LoadReplay"),
        disabled: !this.selectedReplay,
        onClick: () => {
          this.loadSelectedReplay();
        },
      },
      {
        label: this.strings.get(
          meta?.keep ? "GUI:RenameReplay" : "GUI:KeepReplay",
        ),
        tooltip: meta?.keep ? void 0 : this.strings.get("STT:KeepReplay"),
        disabled: !this.selectedReplay,
        onClick: () => {
          this.showKeepReplayBox(meta.name, (name: string) => {
            this.replayManager
              .keepReplay(meta.id, name)
              .then(async () => {
                this.availableReplays = await this.replayManager.loadList();
                this.selectedReplay = this.getSelectedReplayMeta();
                this.form.applyOptions((o: any) => {
                  o.replays = this.availableReplays;
                });
                this.updateSidebarButtons();
              })
              .catch((e: any) => {
                const message =
                  e instanceof ReplayExistsError
                    ? this.strings.get("GUI:ReplayExistsError")
                    : this.strings.get("GUI:SaveReplayError");
                this.errorHandler.handle(e, message, () => {});
              });
          });
        },
      },
      {
        label: this.strings.get("GUI:ImportReplay"),
        tooltip: this.strings.get("STT:ImportReplay"),
        onClick: () => {
          if (void 0 !== this.fileInput!.click) this.fileInput!.click();
          else {
            let ev = document.createEvent("Event");
            ev.initEvent("click", true, true);
            this.fileInput!.dispatchEvent(ev);
          }
        },
      },
      {
        label: this.strings.get("GUI:ExportReplay"),
        tooltip: this.strings.get("STT:ExportReplay"),
        disabled: !this.selectedReplay,
        onClick: () => {
          this.exportCurrentReplay().catch((e) =>
            this.errorHandler.handle(
              e,
              this.strings.get("GUI:ReplayError"),
              () => {},
            ),
          );
        },
      },
      {
        label: this.strings.get("GUI:DeleteReplay"),
        disabled: !this.selectedReplay,
        onClick: async () => {
          var meta = this.getSelectedReplayMeta();
          const ok = await this.messageBoxApi.confirm(
            this.strings.get("GUI:ConfirmDeleteReplay", meta.name),
            this.strings.get("GUI:Ok"),
            this.strings.get("GUI:Cancel"),
          );
          if (!ok) return;
          try {
            await this.replayManager.deleteReplay(meta);
          } catch (e: any) {
            const message =
              e instanceof StorageQuotaError
                ? this.strings.get("ts:storage_quota_exceeded")
                : this.strings.get("GUI:DeleteReplayError");
            this.errorHandler.handle(e, message, () => {});
            return;
          }
          this.selectedReplay = void 0;
          this.availableReplays = await this.replayManager.loadList();
          this.form.applyOptions((o: any) => {
            o.replays = this.availableReplays;
            o.selectedReplay = void 0;
            o.selectedReplayDetails = void 0;
          });
          this.updateSidebarButtons();
        },
      },
      {
        label: this.strings.get("GUI:Back"),
        isBottom: true,
        onClick: () => {
          this.controller?.popScreen();
        },
      },
    ]);
  }

  async loadSelectedReplay(): Promise<void> {
    var replay = this.selectedReplay;
    let header: any;
    try {
      var serialized = await this.replayManager.loadSerializedReplay(replay);
      header = await new Replay().parseHeader(serialized);
    } catch (e) {
      return void this.errorHandler.handle(
        e,
        this.strings.get("GUI:ReplayError"),
        () => {},
      );
    }
    if (header.engineVersion !== this.engineVersion) {
      if (!this.clientVersions && this.oldClientsBaseUrl) {
        this.messageBoxApi.show(this.strings.get("GUI:LoadingEx"));
        try {
          let loader = new ResourceLoader(this.oldClientsBaseUrl);
          this.clientVersions = await loader.loadJson("versions.json");
        } catch (e) {
          console.warn("Couldn't download client version list", e);
        } finally {
          this.messageBoxApi.destroy();
        }
      }
      let ver: any;
      if (this.clientVersions) ver = this.clientVersions[header.engineVersion];
      if (ver) {
        const open = await this.messageBoxApi.confirm(
          this.strings.get("GUI:ReplayOpenOldClient", header.engineVersion),
          this.strings.get("TXT_CONTINUE"),
          this.strings.get("GUI:Close"),
        );
        if (open) {
          const modQs = this.activeMod
            ? `?${RouteHelper.modQueryStringName}=` + this.activeMod
            : "";
          window.open(
            `${this.oldClientsBaseUrl}v${ver}/${modQs}#/replay/` + replay.id,
            "_blank",
          );
        }
      } else
        this.messageBoxApi.show(
          this.strings.get("GUI:ReplayVersionMismatch", header.engineVersion),
          this.strings.get("GUI:Ok"),
        );
      return;
    }
    if (header.modHash === this.engineModHash) {
      let data: any;
      try {
        data = await this.replayManager.loadReplay(replay);
      } catch (e) {
        return void this.errorHandler.handle(
          e,
          this.strings.get("GUI:ReplayError"),
          () => {},
        );
      }
      this.rootController.goToScreen(ScreenType.Replay, { replay: data });
    } else
      this.messageBoxApi.show(
        this.strings.get("GUI:ReplayModMismatch"),
        this.strings.get("GUI:Ok"),
      );
  }

  showKeepReplayBox(defaultName: string, onSubmit: (name: string) => void) {
    let [view] = this.jsxRenderer.render(
      jsx(HtmlView as any, {
        component: KeepReplayBox,
        props: {
          defaultName,
          strings: this.strings,
          onSubmit: (name: string) => {
            onSubmit(name);
            view.destroy();
          },
          onDismiss: () => {
            view.destroy();
          },
          viewport: this.uiScene.viewport,
        },
      }),
    );
    this.uiScene.add(view);
    this.disposables.add(view, () => this.uiScene.remove(view));
  }

  async exportCurrentReplay(): Promise<void> {
    var meta = this.getSelectedReplayMeta();
    if (!meta) throw new Error("No replay selected");
    var bytes = await this.replayManager.loadSerializedReplay(meta);
    if (this.currentReplayUrl) URL.revokeObjectURL(this.currentReplayUrl);
    const url = URL.createObjectURL(
      new Blob([bytes], { type: "application/octet-stream" }),
    );
    this.currentReplayUrl = url;
    let a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", meta.name + (Replay as any).extension);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  getSelectedReplayMeta() {
    if (this.selectedReplay)
      return this.availableReplays.find(
        (r) => r.id === this.selectedReplay.id,
      );
  }

  async onLeave(): Promise<void> {
    if (this.currentReplayUrl) URL.revokeObjectURL(this.currentReplayUrl);
    this.clientVersions = void 0;
    this.availableReplays.length = 0;
    this.form = void 0;
    this.messageBoxApi.destroy();
    this.disposables.dispose();
    this.replayDetailsTask?.cancel();
    this.replayDetailsTask = void 0;
    this.controller.setMainComponent();
    await this.controller.hideSidebarButtons();
  }

  loadReplayDetails(meta: any): void {
    this.replayDetailsTask?.cancel();
    this.replayDetailsTask = new Task(async (cancel) => {
      let data = await this.replayManager.loadSerializedReplay(meta);
      var header = await new Replay().parseHeader(data);
      cancel.throwIfCancelled();
      let gameOpts: any;
      let duration: number | undefined;
      if (header.engineVersion === this.engineVersion) {
        let replay = new Replay();
        replay.unserialize(
          "string" == typeof data ? data : await data.text(),
          meta,
        );
        cancel.throwIfCancelled();
        gameOpts = replay.gameOpts;
        duration = Math.floor(
          replay.endTick / (GameSpeed as any).BASE_TICKS_PER_SECOND,
        );
      } else
        try {
          gameOpts = new Parser().parseOptions(header.gameOptsSerialized);
        } catch (e) {
          console.warn("Replay couldn't be parsed", e);
        }
      let players: any;
      if (gameOpts) {
        let gen = GameOptRandomGen.factory(
          header.gameId,
          header.gameTimestamp,
        );
        let colorMap = gen.generateColors(gameOpts);
        let palette = this.getAvailablePlayerColors();
        players = gameOpts.humanPlayers
          .filter((p: any) => p.countryId !== OBS_COUNTRY_ID)
          .map((p: any) => ({
            name: p.name,
            color: palette[colorMap.get(p) ?? p.colorId],
          }));
      }
      let details = {
        gameId: header.gameId,
        gameTimestamp: header.gameTimestamp || void 0,
        engineVersion: header.engineVersion,
        durationSeconds: duration,
        mapName: gameOpts?.mapTitle,
        players,
      };
      this.form.applyOptions((o: any) => {
        o.selectedReplayDetails = details;
      });
    });
    this.replayDetailsTask.start().catch((e) => {
      if (!(e instanceof OperationCanceledError)) console.error(e);
    });
  }

  getAvailablePlayerColors() {
    return [...this.rules.getMultiplayerColors().values()].map((c: any) =>
      c.asHexString(),
    );
  }

  handleError(e: any, message: string): void {
    this.errorHandler.handle(e, message, () => {
      this.rootController.goToScreen(ScreenType.MainMenuRoot);
    });
  }
}
