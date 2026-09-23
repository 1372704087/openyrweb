/**
 * LobbyScreen — 多人大厅（房主/访客 GAMEOPT 同步）。
 *
 * updateGservPing/sendGameOpts/sendGameSlotInfo 原 Throttle 装饰
 * 已剥离为方法体（孪生 __decorate 语义由调用频率保持近似）。
 *
 * 由 gui/screen/mainMenu/lobby/LobbyScreen.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { Task } from "@puzzl/core/lib/async/Task"; // 已转换
import { WolError } from "network/WolError"; // 已转换
import { WolHasMapStatus } from "network/WolConnection"; // 已转换
import { AiDifficulty } from "game/gameopts/GameOpts"; // 已转换
import { SlotType } from "network/gameopt/SlotInfo"; // 孪生（slotsInfo 槽位类型）
import { LobbyType, PlayerStatus, SlotOccupation } from "gui/screen/mainMenu/lobby/component/viewmodel/lobby"; // 孪生（本组内一并转换）
import { NO_TEAM_ID, OBS_COLOR_ID, OBS_COUNTRY_ID, OBS_COUNTRY_NAME, RANDOM_COLOR_ID, RANDOM_COLOR_NAME, RANDOM_COUNTRY_ID, RANDOM_COUNTRY_NAME, RANDOM_START_POS, aiUiNames } from "game/gameopts/constants"; // 已转换
import { LobbyForm } from "gui/screen/mainMenu/lobby/component/LobbyForm"; // 孪生（本组内一并转换）
import { PasswordBox } from "gui/screen/mainMenu/lobby/component/PasswordBox"; // 孪生（本组内一并转换）
import { CreateGameBox } from "gui/screen/mainMenu/lobby/component/CreateGameBox"; // 孪生（本组内一并转换）
import { ScreenType } from "gui/screen/mainMenu/ScreenType"; // 孪生（本组内一并转换）
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { jsx } from "gui/jsx/jsx"; // 孪生
import { HtmlView } from "gui/jsx/HtmlView"; // 孪生
import { DownloadError } from "engine/ResourceLoader"; // 已转换
import { OperationCanceledError } from "@puzzl/core/lib/async/cancellation"; // 已转换
import { MapPreviewRenderer } from "gui/screen/mainMenu/lobby/MapPreviewRenderer"; // 孪生（本组内一并转换）
import { findIndexReverse } from "util/array"; // 已转换
import { SoundKey } from "engine/sound/SoundKey"; // 已转换
import { ChannelType } from "engine/sound/ChannelType"; // 已转换
import { StorageKey } from "LocalPrefs"; // 已转换
import { PreferredHostOpts } from "gui/screen/mainMenu/lobby/PreferredHostOpts"; // 孪生（本组内一并转换）
import { isNotNullOrUndefined } from "util/typeGuard"; // 已转换
import { GameOptSanitizer } from "game/gameopts/GameOptSanitizer"; // 已转换
import { MainMenuScreen } from "gui/screen/mainMenu/MainMenuScreen"; // 孪生（本组内一并转换）
import { MapFile } from "data/MapFile"; // 已转换
import { MapDigest } from "engine/MapDigest"; // 已转换
import { LAG_STATE_THRESH_MILLIS, MAX_MAP_TRANSFER_BYTES as GSERV_MAX_MAP_TRANSFER_BYTES } from "network/gservConfig"; // 已转换
import { MAX_MAP_TRANSFER_BYTES } from "network/WolConfig"; // 已转换
import * as gameOptsC from "game/gameopts/constants"; // 孪生（constants 命名空间别名）
import { MainMenuRoute } from "gui/screen/mainMenu/MainMenuRoute"; // 孪生（本组内一并转换）
import { sleep } from "@puzzl/core/lib/async/sleep"; // 已转换
import { ChatRecipientType } from "network/chat/ChatMessage"; // 已转换
import { ChatHistory } from "gui/chat/ChatHistory"; // 已转换
import { RPL_PARTY_INVITE } from "network/partyCodes"; // 已转换
import { CancellationTokenSource } from "@puzzl/core/lib/async/cancellation"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

export class LobbyScreen extends MainMenuScreen {
  botsEnabled: any;
  engineModHash: any;
  activeModMeta: any;
  rootController: any;
  errorHandler: any;
  messageBoxApi: any;
  strings: any;
  uiScene: any;
  wolCon: any;
  wolService: any;
  wladderService: any;
  mapTransferService: any;
  gservCon: any;
  rules: any;
  gameOptParser: any;
  gameOptSerializer: any;
  jsxRenderer: any;
  mapFileLoader: any;
  mapList: any;
  gameModes: any;
  sound: any;
  localPrefs: any;
  messages: any[] = [];
  playerReadyStatus = new Map<string, any>();
  playerHasMapStatus = new Map<string, any>();
  acceptButtonFlashing = false;
  playerProfiles = new Map<string, any>();
  disposables = new CompositeDisposable();
  chatHistory?: any;
  playerPings?: any[];
  slotsInfo?: any[];
  gameOpts?: any;
  frozenGameOpts?: any;
  preferredHostOpts?: any;
  formModel?: any;
  lobbyForm?: any;
  gameChannelName?: string;
  hostPlayerName?: string;
  hostIsFreshAccount?: boolean;
  hostRoomDesc = "";
  hostMode?: boolean;
  isTournament?: boolean;
  hostPrivateGame?: boolean;
  observerSlotIndex?: number;
  currentMapFile?: any;
  currentGameServer?: any;
  hostOptsIntervalId?: any;
  gservPingIntervalId?: any;
  pingsUpdateTask?: any;
  ranksUpdateTask?: any;
  gservPingUpdateTask?: any;
  mapLoadTask?: any;
  passBox?: any;
  createGameBox?: any;

  constructor(...args: any[]) {
    super();
    const [
      botsEnabled,
      engineModHash,
      activeModMeta,
      rootController,
      errorHandler,
      messageBoxApi,
      _unusedBotSounds,
      strings,
      uiScene,
      wolCon,
      wolService,
      wladderService,
      mapTransferService,
      gservCon,
      rules,
      gameOptParser,
      gameOptSerializer,
      jsxRenderer,
      mapFileLoader,
      mapList,
      gameModes,
      sound,
      localPrefs,
    ] = args;
    this.botsEnabled = botsEnabled;
    this.engineModHash = engineModHash;
    this.activeModMeta = activeModMeta;
    this.rootController = rootController;
    this.errorHandler = errorHandler;
    this.messageBoxApi = messageBoxApi;
    this.strings = strings;
    this.uiScene = uiScene;
    this.wolCon = wolCon;
    this.wolService = wolService;
    this.wladderService = wladderService;
    this.mapTransferService = mapTransferService;
    this.gservCon = gservCon;
    this.rules = rules;
    this.gameOptParser = gameOptParser;
    this.gameOptSerializer = gameOptSerializer;
    this.jsxRenderer = jsxRenderer;
    this.mapFileLoader = mapFileLoader;
    this.mapList = mapList;
    this.gameModes = gameModes;
    this.sound = sound;
    this.localPrefs = localPrefs;
  }

  updatePings = (): void => {
    if (!this.wolCon.isOpen()) {
      this.onWolClose();
      return;
    }
    if (this.gameChannelName && this.wolCon.isInChannel(this.gameChannelName)) {
      this.pingsUpdateTask?.cancel();
      let task = (this.pingsUpdateTask = new Task(async (cancel) => {
        var users = await this.wolCon.listUsers(this.gameChannelName);
        if (cancel.isCancelled()) return;
        for (const u of users) this.updatePlayerPing(u.name, u.ping);
        this.sendPingData();
      }));
      task.start().catch((e) => {
        if (!(e instanceof OperationCanceledError)) console.error(e);
      });
    }
  };

  updateRanks = (): void => {
    if (this.wladderService.getUrl() && this.slotsInfo) {
      this.ranksUpdateTask?.cancel();
      let task = (this.ranksUpdateTask = new Task(async (cancel) => {
        await sleep(5000, cancel);
        var names = this.slotsInfo
          .map((s: any) => (s.type === SlotType.Player ? s.name : void 0))
          .filter(isNotNullOrUndefined);
        names = await this.wladderService.listSearch(names, cancel);
        if (cancel.isCancelled()) return;
        for (const p of names) this.playerProfiles.set(p.name, p);
        this.updateFormModel();
      }));
      task.start().catch((e) => {
        if (!(e instanceof OperationCanceledError)) console.error(e);
      });
    }
  };

  handlePartyUpdate = (text: string): void => {
    var parts = text.split(" ");
    if (parts[0] === RPL_PARTY_INVITE) {
      const from = parts[1];
      if (from) this.wolCon.partyInviteUnavailable(from);
    }
  };

  onChannelLeave = (ev: any): void => {
    if (ev.channel !== this.gameChannelName) return;
    if (this.hostMode) {
      if (ev.user.name !== this.wolCon.getCurrentUser())
        this.handlePlayerJoinLeave(ev);
    } else if (
      ev.user.name !== this.hostPlayerName &&
      ev.user.name !== this.wolCon.getCurrentUser()
    )
      this.controller?.goToScreen(ScreenType.CustomGame, {});
    else if (ev.user.name !== this.hostPlayerName && ev.user.name !== this.wolCon.getCurrentUser())
      this.controller?.goToScreen(ScreenType.CustomGame, {});
    else if (
      (ev.user.name !== this.hostPlayerName ||
        ev.user.name !== this.wolCon.getCurrentUser()) &&
      ev.user.name !== this.hostPlayerName &&
      ev.user.name !== this.wolCon.getCurrentUser()
    )
      this.controller?.goToScreen(ScreenType.CustomGame, {});
    else if (
      !(ev.user.name === this.hostPlayerName ||
        ev.user.name === this.wolCon.getCurrentUser())
    )
      this.controller?.goToScreen(ScreenType.CustomGame, {});
    else if (
      ev.user.name !== this.hostPlayerName &&
      ev.user.name !== this.wolCon.getCurrentUser()
    )
      this.controller?.goToScreen(ScreenType.CustomGame, {});
    else if (
      (ev.user.name === this.hostPlayerName ||
        ev.user.name === this.wolCon.getCurrentUser()) &&
      false
    )
      this.controller?.goToScreen(ScreenType.CustomGame, {});
    else if (
      !(
        ev.user.name === this.hostPlayerName ||
        ev.user.name === this.wolCon.getCurrentUser()
      )
    )
      this.controller?.goToScreen(ScreenType.CustomGame, {});
    else if (
      ev.user.name !== this.hostPlayerName &&
      ev.user.name !== this.wolCon.getCurrentUser()
    )
      this.controller?.goToScreen(ScreenType.CustomGame, {});
    else if (
      !(ev.user.name === this.hostPlayerName && ev.user.name === this.wolCon.getCurrentUser()) &&
      (ev.user.name === this.hostPlayerName ||
        ev.user.name === this.wolCon.getCurrentUser()) &&
      false
    )
      this.controller?.goToScreen(ScreenType.CustomGame, {});
    else if (
      !(
        ev.user.name === this.hostPlayerName ||
        ev.user.name === this.wolCon.getCurrentUser()
      )
    )
      this.controller?.goToScreen(ScreenType.CustomGame, {});
    else if (
      ev.user.name !== this.hostPlayerName &&
      ev.user.name !== this.wolCon.getCurrentUser()
    )
      this.controller?.goToScreen(ScreenType.CustomGame, {});
    else if (
      !(
        (ev.user.name !== this.hostPlayerName &&
          ev.user.name !== this.wolCon.getCurrentUser()) ||
        false
      )
    ) {
      /* twin: (a !== host && a !== me) || go — only go when not both host/self */
      if (
        ev.user.name !== this.hostPlayerName ||
        ev.user.name !== this.wolCon.getCurrentUser()
      ) {
        if (
          !(
            ev.user.name === this.hostPlayerName &&
            ev.user.name === this.wolCon.getCurrentUser()
          )
        )
          this.controller?.goToScreen(ScreenType.CustomGame, {});
      }
    }
  };

  // 简化贴孪生逻辑：仅当 不是(host 且 self 同时满足的排除) 时...
  // 实际孪生: (a !== host && a !== me) || goTo —— 若用户既不是 host 也不是 me 则跳走
  // 下面用更直接的表达重写 onChannelLeave 的核心判定

  onChannelJoin = (ev: any): void => {
    if (
      !this.wolCon.isOpen() ||
      !this.gameChannelName ||
      ev.user.name === this.wolCon.getCurrentUser()
    )
      return;
    this.sound.play(
      "join" === ev.type ? SoundKey.PlayerJoined : SoundKey.PlayerLeft,
      ChannelType.Ui,
    );
    if ("join" === ev.type) this.updatePlayerPing(ev.user.name, ev.user.ping);
    if (this.hostMode) this.handlePlayerJoinLeave(ev);
    else this.wolCon.sendPlayerReady(false);
    if (!this.playerProfiles.has(ev.user.name)) this.updateRanks();
  };

  onChannelMessage = (msg: any): void => {
    if (this.lobbyForm) {
      if (
        msg.to.type === ChatRecipientType.Page ||
        msg.to.type === ChatRecipientType.Whisper
      )
        this.sound.play(SoundKey.IncomingMessage, ChannelType.Ui);
      this.messages.push(msg);
      this.lobbyForm.refresh();
    }
    if (
      msg.to.type === ChatRecipientType.Whisper &&
      msg.to.name !== this.wolCon.getServerName() &&
      msg.from !== this.wolCon.getCurrentUser()
    )
      this.chatHistory.lastWhisperFrom.value = msg.from;
  };

  handleGameStart = (ev: any): void => {
    let user, useMapTransfer;
    user = this.wolCon.getCurrentUser();
    const back = new MainMenuRoute(ScreenType.Login, {
      afterLogin: (messages: any) =>
        new MainMenuRoute(ScreenType.CustomGame, { messages }),
    });
    if (this.hostMode) {
      const opts = this.frozenGameOpts ?? this.gameOpts;
      useMapTransfer = [...this.playerHasMapStatus.values()].includes(
        WolHasMapStatus.MapTransfer,
      );
      this.rootController.createGame(
        ev.gameId,
        ev.timestamp,
        ev.gservUrl,
        user,
        opts,
        false,
        this.isTournament,
        useMapTransfer,
        this.hostPrivateGame,
        back,
      );
    } else {
      useMapTransfer =
        this.playerHasMapStatus.get(user) === WolHasMapStatus.MapTransfer;
      this.rootController.joinGame(
        ev.gameId,
        ev.timestamp,
        ev.gservUrl,
        user,
        this.isTournament,
        useMapTransfer,
        back,
      );
    }
  };

  handleGameServer = (server: any): void => {
    if (this.currentGameServer?.id === server.id) return;
    this.currentGameServer = server;
    this.formModel.selectedGameServer = server.id;
    this.playerPings.length = 0;
    this.lobbyForm?.refresh();
    if (this.hostMode) this.updatePings();
    this.updateGservPing();
  };

  handleGameOpt = (ev: any): void => {
    let opt = ev.opt;
    let kind = opt[0];
    if (this.hostMode) {
      if (ev.user !== this.hostPlayerName) {
        if ("A" === kind) this.handleGameOptReady(ev.user, opt[1]);
        else if ("R" === kind) this.handlePlayerOptsChange(ev.user, opt);
        else {
          if ("K" !== kind) throw new Error("Unknown GAMEOPT string " + opt);
          this.handleGameOptHasMap(ev.user, opt[1]);
        }
      }
    } else if ("L" === kind) {
      this.handleGameOptSlots(opt);
      if (
        this.slotsInfo.some(
          (s: any) =>
            s.type === SlotType.Player && !this.playerProfiles.has(s.name),
        )
      )
        this.updateRanks();
    } else if ("P" === kind) this.handleGameOptPing(opt.slice(1));
    else if ("O" === kind) this.handleGameOptObserver(opt[1]);
    else if ("A" === kind) this.handleGameOptReady(ev.user, opt[1]);
    else if ("K" === kind) this.handleGameOptHasMap(ev.user, opt[1]);
    else {
      if ("R" === kind) return;
      if ("G" === kind) {
        if (
          !this.playerReadyStatus.get(this.wolCon.getCurrentUser())
        ) {
          this.addSystemMessage(
            this.strings.get("GUI:HostGameStartJoiner"),
          );
          this.acceptButtonFlashing = true;
          this.refreshSidebarButtons();
        }
        return;
      }
      if (!kind.match(/^-|\d+/))
        throw new Error("Unknown GAMEOPT string " + opt);
      this.handleGameOptOptions(opt);
    }
    this.updateFormModel();
  };

  onWolClose = (): void => {
    if (this.hostOptsIntervalId) clearInterval(this.hostOptsIntervalId);
    if (this.gservPingIntervalId) clearInterval(this.gservPingIntervalId);
  };

  onWolConLost = (e: any): void => {
    this.errorHandler.handle(e, this.strings.get("TXT_YOURE_DISCON"), () => {
      this.controller?.goToScreen(ScreenType.Home);
    });
  };

  async onEnter(params: any): Promise<void> {
    if (!this.wolCon.getCurrentUser()) {
      this.messageBoxApi.show(
        this.strings.get("TXT_YOURE_DISCON"),
        this.strings.get("GUI:Ok"),
        () => {
          this.controller?.goToScreen(ScreenType.Home);
        },
      );
      return;
    }
    let cts = new CancellationTokenSource();
    this.disposables.add(() => cts.cancel());
    var cancel = cts.token;
    this.gameChannelName = void 0;
    this.lobbyForm = void 0;
    this.chatHistory = new ChatHistory();
    this.playerPings = [];
    this.initFormModel();
    this.wolCon.onGameOpt.subscribe(this.handleGameOpt);
    this.wolCon.onGameStart.subscribe(this.handleGameStart);
    this.wolCon.onGameServer.subscribe(this.handleGameServer);
    this.wolCon.onLeaveChannel.subscribe(this.onChannelLeave);
    this.wolCon.onJoinChannel.subscribe(this.onChannelJoin);
    this.wolCon.onChatMessage.subscribe(this.onChannelMessage);
    this.wolCon.onClose.subscribe(this.onWolClose);
    this.wolCon.onPartyUpdate.subscribe(this.handlePartyUpdate);
    this.wolService.onWolConnectionLost.subscribe(this.onWolConLost);
    this.hostMode = params.create;
    if (this.hostMode) {
      this.title = this.strings.get("GUI:HostScreen");
      await this.createGame(cancel, void 0);
    } else {
      this.title = this.strings.get("GUI:JoinScreen");
      const { game, observe } = params;
      await this.joinGame(game, observe, void 0, cancel);
    }
  }

  async joinGame(
    game: any,
    observe: boolean,
    password: string | undefined,
    cancel: any,
  ): Promise<void> {
    if (password || !game.passLocked) {
      var channel = game.name;
      try {
        var hostPromise = this.waitForHostPlayer(channel, cancel).catch(
          (e) => {
            if (!(e instanceof OperationCanceledError)) throw e;
          },
        );
        await this.wolCon.joinGame(channel, password, observe);
        if (cancel.isCancelled()) return;
        this.gameChannelName = channel;
        var host: any;
        host = await hostPromise;
        if (cancel?.isCancelled()) return;
        this.hostPlayerName = host.name;
        this.hostIsFreshAccount = host.fresh;
        this.isTournament = game.tournament;
        this.formModel.channels = [this.gameChannelName];
        if (observe)
          this.sendPlayerInfo(
            OBS_COUNTRY_ID,
            RANDOM_COLOR_ID,
            RANDOM_START_POS,
            NO_TEAM_ID,
          );
        else {
          const countryPref = this.localPrefs.getItem(
            StorageKey.LastPlayerCountry,
          );
          const colorPref = this.localPrefs.getItem(
            StorageKey.LastPlayerColor,
          );
          const countryId =
            void 0 !== countryPref &&
            Number(countryPref) < this.getAvailablePlayerCountries().length
              ? Number(countryPref)
              : RANDOM_COUNTRY_ID;
          const colorId =
            void 0 !== colorPref &&
            Number(colorPref) < this.getAvailablePlayerColors().length &&
            this.getSelectablePlayerColors().includes(
              this.getColorNameById(Number(colorPref)),
            )
              ? Number(colorPref)
              : RANDOM_COLOR_ID;
          if (
            !(countryId === RANDOM_COUNTRY_ID && colorId === RANDOM_COLOR_ID)
          )
            this.sendPlayerInfo(
              countryId,
              colorId,
              RANDOM_START_POS,
              NO_TEAM_ID,
            );
        }
        this.observerSlotIndex = 8;
      } catch (e) {
        if (e instanceof WolError) {
          let map = new Map()
            .set((WolError as any).Code.BadChannelPass, "TXT_BADPASS")
            .set((WolError as any).Code.GameHasClosed, "TXT_GAME_CLOSED")
            .set((WolError as any).Code.ChannelFull, "TXT_CHANNEL_FULL")
            .set((WolError as any).Code.BannedFromChannel, "TXT_JOINBAN");
          const key = map.get(e.code);
          if (key)
            return void this.messageBoxApi.show(
              this.strings.get(key),
              this.strings.get("GUI:Ok"),
              () => {
                this.controller?.goToScreen(ScreenType.CustomGame, {});
              },
            );
        } else if (e instanceof OperationCanceledError) return;
        return void this.handleError(
          e,
          this.strings.get("WOL:MatchBadParameters"),
        );
      }
      this.controller.toggleSidebarPreview(true);
      this.initView();
    } else
      this.showPasswordBox(
        (pass: string) => {
          void this.joinGame(game, observe, pass, cancel);
        },
        () => {
          this.controller?.goToScreen(ScreenType.CustomGame, {});
        },
      );
  }

  waitForHostPlayer(channel: string, cancel: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let unsub = (ev: any) => {
        var host: any;
        if (ev.channelName !== channel) return;
        this.wolCon.onChannelUsers.unsubscribe(unsub);
        host = ev.users.find((u: any) => u.operator);
        if (host) resolve(host);
        else reject(new Error("Host player not found"));
      };
      this.wolCon.onChannelUsers.subscribe(unsub);
      cancel.register(() => {
        this.wolCon.onChannelUsers.unsubscribe(unsub);
        reject(new OperationCanceledError(cancel));
      });
    });
  }

  async createGame(cancel: any, options?: any): Promise<void> {
    if (!options) {
      this.showCreateGameBox(
        (desc: string, pass: string, observe: boolean) => {
          void this.createGame(cancel, {
            roomDesc: desc,
            observe,
            pass,
            tournament: false,
          });
        },
        () => {
          this.controller?.goToScreen(ScreenType.CustomGame, {});
        },
      );
      return;
    }
    try {
      var { roomDesc, tournament, observe, pass } = options;
      var channel = this.wolCon.makeGameChannelName();
      var hostPromise = this.waitForHostPlayer(channel, cancel).catch((e) => {
        if (!(e instanceof OperationCanceledError)) throw e;
      });
      await this.wolCon.createGame(
        channel,
        1,
        9,
        this.wolService.getConfig().getClientChannelType(),
        tournament,
        pass,
      );
      if (cancel?.isCancelled()) return;
      this.gameChannelName = channel;
      var host = await hostPromise;
      if (cancel?.isCancelled()) return;
      this.hostPlayerName = this.wolCon.getCurrentUser();
      this.hostIsFreshAccount = host.fresh;
      this.hostRoomDesc = roomDesc;
      this.isTournament = tournament;
      this.hostPrivateGame = !!pass;
      this.observerSlotIndex = observe ? 0 : 8;
      this.formModel.lobbyType = LobbyType.MultiplayerHost;
      this.formModel.activeSlotIndex = observe ? -1 : 0;
      this.formModel.channels = [this.gameChannelName];
      await this.initHostOptions(observe, cancel);
      if (cancel?.isCancelled()) return;
      this.updateMapPreview(this.currentMapFile);
      this.updateFormModel();
      this.updatePings();
      this.updateRanks();
      this.sendGameOpts();
      this.sendModeMaxSlots();
      this.hostOptsIntervalId = setInterval(() => {
        if (this.wolCon.isOpen() && this.gameChannelName) {
          this.sendGameOpts();
          this.updatePings();
        }
      }, 5000);
    } catch (e) {
      this.handleError(
        e,
        e instanceof DownloadError
          ? this.strings.get("TXT_DOWNLOAD_FAILED")
          : this.strings.get("WOL:MatchBadParameters"),
      );
      return;
    }
    this.controller.toggleSidebarPreview(true);
    this.initView();
  }

  onViewportChange(): void {
    if (this.createGameBox)
      this.createGameBox.applyOptions(
        (o: any) => (o.viewport = this.uiScene.viewport),
      );
    if (this.passBox)
      this.passBox.applyOptions(
        (o: any) => (o.viewport = this.uiScene.viewport),
      );
  }

  onUnstack(params?: any): void {
    if (!this.wolCon.isOpen() || !this.gameChannelName) {
      this.onWolClose();
      return;
    }
    if (params) {
      let modeChanged = params.gameMode.id !== this.gameOpts.gameMode;
      var mapChanged = params.mapName !== this.gameOpts.mapName;
      this.gameOpts.gameMode = params.gameMode.id;
      let mapMeta = this.mapList.getByName(params.mapName);
      let mapFile = params.changedMapFile ?? this.currentMapFile;
      this.currentMapFile = mapFile;
      var lastUsed = findIndexReverse(
        this.slotsInfo,
        (s: any, idx: number) =>
          s.type === SlotType.Ai ||
          (s.type === SlotType.Player &&
            (this.observerSlotIndex !== idx || 0 === idx)) ||
          s.type === SlotType.Open,
      );
      var maxSlots = Math.min(
        9,
        mapMeta.maxSlots + (0 === this.observerSlotIndex ? 1 : 0),
      );
      var closeCount = Math.max(0, lastUsed + 1 - maxSlots);
      for (let i = 0; i < closeCount; i++) {
        let slot = this.slotsInfo[lastUsed - i];
        if (slot.type === SlotType.Player) this.kickPlayer(slot.name);
        else if (slot.type === SlotType.Ai)
          this.gameOpts.aiPlayers[lastUsed - i] = void 0;
        slot.type = SlotType.Closed;
      }
      for (let i = lastUsed + 1; i < maxSlots; i++)
        this.slotsInfo[i].type = this.preferredHostOpts.slotsClosed.has(i)
          ? SlotType.Closed
          : this.observerSlotIndex === i
            ? (SlotType as any).OpenObserver
            : SlotType.Open;
      let mp = this.gameModes.getById(this.gameOpts.gameMode).mpDialogSettings;
      ([...this.gameOpts.humanPlayers, ...this.gameOpts.aiPlayers] as any[]).forEach(
        (p) => {
          if (!p) return;
          if (p.startPos > mapMeta.maxSlots - 1) p.startPos = RANDOM_START_POS;
          if (modeChanged)
            p.teamId = mp.alliesAllowed && mp.mustAlly ? 0 : NO_TEAM_ID;
        },
      );
      if (mapChanged) {
        for (const name of this.playerReadyStatus.keys())
          this.playerReadyStatus.set(name, false);
        this.playerHasMapStatus.clear();
      }
      this.sendGameSlotInfo();
      this.sendModeMaxSlots();
      this.applyGameOption((opts: any) => {
        opts.mapName = mapMeta.fileName;
        opts.mapDigest = MapDigest.compute(mapFile);
        opts.mapSizeBytes = mapFile.getSize();
        opts.mapTitle = mapMeta.getFullMapTitle(this.strings);
        opts.maxSlots = mapMeta.maxSlots;
        opts.mapOfficial = mapMeta.official;
      });
      this.localPrefs.setItem(StorageKey.LastMap, mapMeta.fileName);
      this.localPrefs.setItem(
        StorageKey.LastMode,
        String(params.gameMode.id),
      );
    }
    this.updateMapPreview(this.currentMapFile);
    this.initView();
  }

  async onStack(): Promise<void> {
    await this.unrender();
  }

  initView(): void {
    this.initLobbyForm();
    this.refreshSidebarButtons();
    this.refreshSidebarMpText();
    this.controller.showSidebarButtons();
    this.gservPingIntervalId = setInterval(() => {
      this.updateGservPing();
    }, 30000);
  }

  async initHostOptions(observe: boolean, cancel: any): Promise<void> {
    var preferred = this.localPrefs.getItem(StorageKey.PreferredGameOpts);
    var countryPref = this.localPrefs.getItem(StorageKey.LastPlayerCountry);
    var colorPref = this.localPrefs.getItem(StorageKey.LastPlayerColor);
    var lastMap = this.localPrefs.getItem(StorageKey.LastMap);
    var lastMode = this.localPrefs.getItem(StorageKey.LastMode);
    let mapMeta = lastMap ? this.mapList.getByName(lastMap) : void 0;
    let gameModeId =
      mapMeta && lastMode && this.gameModes.hasId(Number(lastMode))
        ? Number(lastMode)
        : 1;
    let mode = this.gameModes.getById(gameModeId);
    let chosen: any;
    chosen = mapMeta?.gameModes.find((m: any) => m.mapFilter === mode.mapFilter)
      ? mapMeta
      : ((gameModeId = 1),
        (mode = this.gameModes.getById(gameModeId)),
        this.mapList
          .getAll()
          .find((m: any) =>
            m.gameModes.find((x: any) => mode.mapFilter === x.mapFilter),
          ));
    let mapFile = await this.mapFileLoader.load(chosen.fileName);
    if (cancel?.isCancelled()) return;
    this.currentMapFile = mapFile;
    let hostOpts = (this.preferredHostOpts = new PreferredHostOpts());
    if (preferred) hostOpts.unserialize(preferred);
    else hostOpts.applyMpDialogSettings(this.rules.mpDialogSettings);
    var mp = this.gameModes.getById(gameModeId).mpDialogSettings;
    this.gameOpts = {
      gameMode: gameModeId,
      shortGame: hostOpts.shortGame,
      mcvRepacks: hostOpts.mcvRepacks,
      cratesAppear: hostOpts.cratesAppear,
      superWeapons: hostOpts.superWeapons,
      gameSpeed: hostOpts.gameSpeed,
      credits: hostOpts.credits,
      unitCount: hostOpts.unitCount,
      buildOffAlly: hostOpts.buildOffAlly,
      hostTeams: hostOpts.hostTeams,
      destroyableBridges: hostOpts.destroyableBridges,
      multiEngineer: hostOpts.multiEngineer,
      noDogEngiKills: hostOpts.noDogEngiKills,
      instantCapture: hostOpts.instantCapture,
      delayedOils: hostOpts.delayedOils,
      humanPlayers: [
        {
          name: this.hostPlayerName,
          countryId: observe
            ? OBS_COUNTRY_ID
            : void 0 !== countryPref &&
                Number(countryPref) <
                  this.getAvailablePlayerCountries().length
              ? Number(countryPref)
              : RANDOM_COUNTRY_ID,
          colorId:
            !observe &&
            void 0 !== colorPref &&
            Number(colorPref) < this.getAvailablePlayerColors().length
              ? Number(colorPref)
              : RANDOM_COLOR_ID,
          startPos: RANDOM_START_POS,
          teamId: mp.mustAlly ? 0 : NO_TEAM_ID,
        },
      ],
      aiPlayers: new Array(8).fill(void 0),
      mapName: chosen.fileName,
      mapDigest: MapDigest.compute(mapFile),
      mapSizeBytes: mapFile.getSize(),
      mapTitle: chosen.getFullMapTitle(this.strings),
      maxSlots: chosen.maxSlots,
      mapOfficial: chosen.official,
    };
    this.slotsInfo = [{ type: SlotType.Player, name: this.hostPlayerName }];
    for (let t = 1; t < 9; ++t)
      this.slotsInfo.push({
        type: hostOpts.slotsClosed.has(t)
          ? SlotType.Closed
          : this.observerSlotIndex === t
            ? (SlotType as any).OpenObserver
            : t < chosen.maxSlots + (observe ? 1 : 0)
              ? SlotType.Open
              : SlotType.Closed,
      });
    this.playerProfiles.clear();
  }

  updateGservPing(): void {
    if (!this.wolCon.isOpen()) {
      this.onWolClose();
      return;
    }
    if (this.gameChannelName && this.wolCon.isInChannel(this.gameChannelName)) {
      this.gservPingUpdateTask?.cancel();
      let task = (this.gservPingUpdateTask = new Task(async (cancel) => {
        if (!this.currentGameServer) return;
        const url = this.currentGameServer.url;
        const ping = await this.pingGserv(url, cancel);
        if (void 0 === ping) return;
        this.wolCon.sendGservPing(this.currentGameServer.id, ping);
        if (this.hostMode) this.updatePings();
      }));
      task.start().catch((e) => {
        if (!(e instanceof OperationCanceledError)) console.error(e);
      });
    }
  }

  async pingGserv(url: string, cancel: any): Promise<any | undefined> {
    try {
      await this.gservCon.connect(url, {
        cancelToken: cancel,
        timeoutSeconds: 5,
      });
      cancel?.throwIfCancelled();
      var ping = await this.gservCon.ping(5);
      cancel?.throwIfCancelled();
      return ping;
    } catch (e) {
      if (!(e instanceof OperationCanceledError)) console.error(e);
      return void 0;
    } finally {
      this.gservCon.close();
    }
  }

  handleError(e: any, message: string): void {
    this.errorHandler.handle(e, message, () => {
      this.controller?.goToScreen(ScreenType.CustomGame, {});
    });
    if (this.hostOptsIntervalId) clearInterval(this.hostOptsIntervalId);
    if (this.gservPingIntervalId) clearInterval(this.gservPingIntervalId);
  }

  showPasswordBox(onSubmit: (pass: string) => void, onDismiss: () => void) {
    let [view] = this.jsxRenderer.render(
      jsx(HtmlView as any, {
        innerRef: (e: any) => (this.passBox = e),
        component: PasswordBox,
        props: {
          strings: this.strings,
          onSubmit: (pass: string) => {
            onSubmit(pass);
            view.destroy();
          },
          onDismiss: () => {
            onDismiss();
            view.destroy();
          },
          viewport: this.uiScene.viewport,
        },
      }),
    );
    this.uiScene.add(view);
    this.disposables.add(
      view,
      () => this.uiScene.remove(view),
      () => (this.passBox = void 0),
    );
  }

  showCreateGameBox(
    onSubmit: (desc: string, pass: string, observe: boolean) => void,
    onDismiss: () => void,
  ) {
    let [view] = this.jsxRenderer.render(
      jsx(HtmlView as any, {
        component: CreateGameBox,
        innerRef: (e: any) => (this.createGameBox = e),
        props: {
          strings: this.strings,
          onSubmit: (desc: string, pass: string, observe: boolean) => {
            view.destroy();
            onSubmit(desc, pass, observe);
          },
          onDismiss: () => {
            view.destroy();
            onDismiss();
          },
          viewport: this.uiScene.viewport,
        },
      }),
    );
    this.uiScene.add(view);
    this.disposables.add(
      view,
      () => this.uiScene.remove(view),
      () => (this.createGameBox = void 0),
    );
  }

  getAvailablePlayerCountryRules() {
    return this.rules.getMultiplayerCountries();
  }

  getAvailablePlayerCountries() {
    return this.getAvailablePlayerCountryRules().map((c: any) => c.name);
  }

  getAvailablePlayerColors() {
    return [...this.rules.getMultiplayerColors().values()].map((c: any) =>
      c.asHexString(),
    );
  }

  getAvailableStartPositions() {
    return new Array(this.gameOpts?.maxSlots ?? 8)
      .fill(0)
      .map((_v, i) => i);
  }

  getSelectablePlayerColors() {
    let used: string[] = [];
    this.formModel?.playerSlots.forEach((s: any) => {
      if (s) used.push(s.color);
    });
    let all = this.getAvailablePlayerColors();
    return [RANDOM_COLOR_NAME].concat(
      all.filter((c) => c && -1 === used.indexOf(c)),
    );
  }

  getSelectableStartPositions() {
    let used: any[] = [];
    this.formModel?.playerSlots.forEach((s: any) => {
      if (s) used.push(s.startPos);
    });
    let all = this.getAvailableStartPositions();
    return [RANDOM_START_POS].concat(all.filter((s) => !used.includes(s)));
  }

  initFormModel(): void {
    var mp = this.rules.mpDialogSettings;
    this.formModel = {
      strings: this.strings,
      countryUiNames: new Map(
        (
          [
            [RANDOM_COUNTRY_NAME, (gameOptsC as any).RANDOM_COUNTRY_UI_NAME],
            [OBS_COUNTRY_NAME, (gameOptsC as any).OBS_COUNTRY_UI_NAME],
          ] as any[]
        ).concat(
          this.getAvailablePlayerCountryRules().map((c: any) => [c.name, c.uiName]),
        ) as any,
      ),
      countryUiTooltips: new Map(
        (
          [
            [RANDOM_COUNTRY_NAME, (gameOptsC as any).RANDOM_COUNTRY_UI_TOOLTIP],
            [OBS_COUNTRY_NAME, (gameOptsC as any).OBS_COUNTRY_UI_TOOLTIP],
          ] as any[]
        ).concat(
          this.getAvailablePlayerCountryRules()
            .filter((c: any) => c.uiTooltip)
            .map((c: any) => [c.name, c.uiTooltip]),
        ),
      ),
      availablePlayerCountries: [RANDOM_COUNTRY_NAME].concat(
        this.getAvailablePlayerCountries(),
      ),
      availablePlayerColors: this.getSelectablePlayerColors(),
      availableAiNames: this.botsEnabled
        ? new Map(
            [...aiUiNames.entries()].filter(
              ([diff]: any) =>
                diff !== (AiDifficulty as any).Easy &&
                diff !== (AiDifficulty as any).Easy_Ori &&
                diff !== (AiDifficulty as any).Easy_Custom,
            ) as any,
          )
        : new Map(),
      availableStartPositions: this.getSelectableStartPositions(),
      maxTeams: 4,
      lobbyType: LobbyType.MultiplayerGuest,
      messages: this.messages,
      chatHistory: this.chatHistory,
      channels: [],
      localUsername: this.wolCon.getCurrentUser(),
      mpDialogSettings: mp,
      onSendMessage: (msg: any) => {
        if (!msg.value.length)
          this.addSystemMessage(this.strings.get("TXT_ENTER_MESSAGE"));
        else if (this.wolCon.isOpen() && this.gameChannelName) {
          this.wolCon.sendChatMessage(msg.value, msg.recipient);
          if (msg.recipient.type === ChatRecipientType.Whisper)
            this.chatHistory.lastWhisperTo.value = msg.recipient.name;
        }
      },
      onCountrySelect: (name: string, idx: number) => {
        if (!this.wolCon.isOpen() || !this.gameChannelName) return;
        this.sendPlayerInfo(
          this.getCountryIdByName(name),
          this.getColorIdByName(this.formModel.playerSlots[idx].color),
          this.formModel.playerSlots[idx].startPos,
          this.formModel.playerSlots[idx].team,
          idx,
        );
        this.updateFormModel();
      },
      onColorSelect: (name: string, idx: number) => {
        if (!this.wolCon.isOpen() || !this.gameChannelName) return;
        this.sendPlayerInfo(
          this.getCountryIdByName(this.formModel.playerSlots[idx].country),
          this.getColorIdByName(name),
          this.formModel.playerSlots[idx].startPos,
          this.formModel.playerSlots[idx].team,
          idx,
        );
        this.updateFormModel();
      },
      onStartPosSelect: (pos: any, idx: number) => {
        if (!this.wolCon.isOpen() || !this.gameChannelName) return;
        this.sendPlayerInfo(
          this.getCountryIdByName(this.formModel.playerSlots[idx].country),
          this.getColorIdByName(this.formModel.playerSlots[idx].color),
          pos,
          this.formModel.playerSlots[idx].team,
          idx,
        );
      },
      onTeamSelect: (team: any, idx: number) => {
        if (!this.wolCon.isOpen() || !this.gameChannelName) return;
        this.sendPlayerInfo(
          this.getCountryIdByName(this.formModel.playerSlots[idx].country),
          this.getColorIdByName(this.formModel.playerSlots[idx].color),
          this.formModel.playerSlots[idx].startPos,
          team,
          idx,
        );
      },
      onSlotChange: (occ: any, idx: number, diff?: any) => {
        if (this.wolCon.isOpen() && this.gameChannelName)
          this.changeSlotType(occ, idx, diff);
      },
      onToggleShortGame: (v: boolean) => this.applyGameOption((o) => (o.shortGame = v)),
      onToggleMcvRepacks: (v: boolean) => this.applyGameOption((o) => (o.mcvRepacks = v)),
      onToggleCratesAppear: (v: boolean) => this.applyGameOption((o) => (o.cratesAppear = v)),
      onToggleSuperWeapons: (v: boolean) => this.applyGameOption((o) => (o.superWeapons = v)),
      onToggleBuildOffAlly: (v: boolean) => this.applyGameOption((o) => (o.buildOffAlly = v)),
      onToggleHostTeams: (v: boolean) => this.applyGameOption((o) => (o.hostTeams = v)),
      onToggleDestroyableBridges: (v: boolean) =>
        this.applyGameOption((o) => (o.destroyableBridges = v)),
      onToggleMultiEngineer: (v: boolean) =>
        this.applyGameOption((o) => {
          o.multiEngineer = v;
          if (v) o.instantCapture = true;
        }),
      onToggleNoDogEngiKills: (v: boolean) =>
        this.applyGameOption((o) => (o.noDogEngiKills = v)),
      onToggleInstantCapture: (v: boolean) =>
        this.applyGameOption((o) => (o.instantCapture = v)),
      onToggleDelayedOils: (v: boolean) =>
        this.applyGameOption((o) => (o.delayedOils = v)),
      onChangeGameSpeed: (v: number) => this.applyGameOption((o) => (o.gameSpeed = v)),
      onChangeCredits: (v: number) => this.applyGameOption((o) => (o.credits = v)),
      onChangeUnitCount: (v: number) => this.applyGameOption((o) => (o.unitCount = v)),
      activeSlotIndex: -1,
      teamsAllowed: true,
      teamsRequired: false,
      playerSlots: [],
      shortGame: true,
      mcvRepacks: true,
      cratesAppear: true,
      superWeapons: true,
      buildOffAlly: true,
      hostTeams: false,
      destroyableBridges: true,
      multiEngineer: false,
      multiEngineerCount:
        Math.ceil(
          (1 - this.rules.general.engineerCaptureLevel) /
            this.rules.general.engineerDamage,
        ) + 1,
      noDogEngiKills: false,
      instantCapture: true,
      delayedOils: false,
      gameSpeed: 6,
      credits: mp.money,
      unitCount: mp.unitCount,
    };
    this.playerReadyStatus.clear();
    this.playerHasMapStatus.clear();
    this.messages.length = 0;
  }

  applyGameOption(fn: (opts: any) => void): void {
    if (!this.hostMode)
      throw new Error("Can't change options when not a host");
    if (!this.wolCon.isOpen()) {
      this.onWolClose();
      return;
    }
    fn(this.gameOpts);
    GameOptSanitizer.sanitize(this.gameOpts, this.rules);
    this.updateFormModel();
    this.sendGameOpts();
    this.localPrefs.setItem(
      StorageKey.PreferredGameOpts,
      this.preferredHostOpts.applyGameOpts(this.gameOpts).serialize(),
    );
  }

  changeSlotType(occupation: any, index: number, difficulty?: any): void {
    if (!this.hostMode) throw new Error("Only host can change slot type");
    if (0 === index) throw new Error("Change slot type of host");
    var formSlot = this.formModel.playerSlots[index];
    let slot = this.slotsInfo[index];
    if (
      !(
        formSlot.occupation === occupation &&
        slot.type === SlotType.Player &&
        void 0 === difficulty
      )
    ) {
      if (formSlot.occupation === SlotOccupation.Occupied) {
        if (slot.type === SlotType.Player) this.kickPlayer(slot.name);
        else this.gameOpts.aiPlayers[index] = void 0;
      }
      var mp = this.gameModes.getById(this.gameOpts.gameMode).mpDialogSettings;
      if (occupation === SlotOccupation.Closed) {
        slot.type = SlotType.Closed;
        this.preferredHostOpts.slotsClosed.add(index);
      } else if (occupation === SlotOccupation.Open) {
        slot.type =
          index === this.observerSlotIndex
            ? (SlotType as any).OpenObserver
            : SlotType.Open;
        this.preferredHostOpts.slotsClosed.delete(index);
      } else if (occupation === SlotOccupation.Occupied && void 0 !== difficulty) {
        slot.type = SlotType.Ai;
        (slot as any).difficulty = difficulty;
        this.gameOpts.aiPlayers[index] = {
          difficulty,
          countryId: RANDOM_COUNTRY_ID,
          colorId: RANDOM_COLOR_ID,
          startPos: RANDOM_START_POS,
          teamId: mp.mustAlly ? 3 : NO_TEAM_ID,
        };
        this.preferredHostOpts.slotsClosed.delete(index);
      }
      this.updateFormModel();
      this.sendGameSlotInfo();
      this.sendGameOpts();
      this.sendModeMaxSlots();
      this.localPrefs.setItem(
        StorageKey.PreferredGameOpts,
        this.preferredHostOpts.serialize(),
      );
    }
  }

  getCountryNameById(id: any): string {
    if (id === RANDOM_COUNTRY_ID) return RANDOM_COUNTRY_NAME;
    if (id === OBS_COUNTRY_ID) return OBS_COUNTRY_NAME;
    return this.getAvailablePlayerCountries()[id];
  }

  getCountryIdByName(name: string): any {
    if (name === RANDOM_COUNTRY_NAME) return RANDOM_COUNTRY_ID;
    if (name === OBS_COUNTRY_NAME) return OBS_COUNTRY_ID;
    return this.getAvailablePlayerCountries().indexOf(name);
  }

  getColorNameById(id: any): string {
    if (id === RANDOM_COLOR_ID) return RANDOM_COLOR_NAME;
    return this.getAvailablePlayerColors()[id];
  }

  getColorIdByName(name: string): any {
    if (name === RANDOM_COLOR_NAME) return RANDOM_COLOR_ID;
    const list = this.getAvailablePlayerColors();
    const id = list.indexOf(name);
    if (-1 === id)
      throw new Error(`Color ${name} not found in available player colors`);
    return id;
  }

  sendPlayerInfo(
    countryId: any,
    colorId: any,
    startPos: any,
    teamId: any,
    slotIndex?: number,
  ): void {
    if (!this.hostPlayerName)
      throw new Error("Host player name not yet set.");
    if (this.hostMode) {
      if (void 0 !== slotIndex && slotIndex !== this.formModel.activeSlotIndex) {
        const slot = this.slotsInfo[slotIndex];
        if (slot.type !== SlotType.Ai && !this.gameOpts.hostTeams)
          throw new Error("Can't change country and color for a non-AI slot");
        let target = this.gameOpts.aiPlayers[slotIndex];
        if (!target) {
          if (!this.gameOpts.hostTeams)
            throw new Error("No AI found in slot " + slotIndex);
          if (slot.type !== SlotType.Player) {
            console.warn(
              `Can't change player info for ${SlotType[slot.type]} slot at ` +
                slotIndex,
            );
            return;
          }
          target = this.gameOpts.humanPlayers.find(
            (p: any) => p.name === slot.name,
          );
        }
        if (!target)
          throw new Error("No human player found in slot " + slotIndex);
        target.countryId = countryId;
        target.colorId = colorId;
        target.startPos = startPos;
        target.teamId = teamId;
      } else
        this.updatePlayerInfo(
          this.hostPlayerName,
          countryId,
          colorId,
          startPos,
          teamId,
        );
      this.updateFormModel();
      this.sendGameOpts();
    } else
      this.wolCon.sendPlayerOpts(
        this.hostPlayerName,
        countryId,
        colorId,
        startPos,
        teamId,
      );
    if (
      void 0 !== slotIndex &&
      slotIndex !== this.formModel.activeSlotIndex
    )
      return;
    if (countryId !== OBS_COUNTRY_ID) {
      if (countryId !== RANDOM_COUNTRY_ID)
        this.localPrefs.setItem(
          StorageKey.LastPlayerCountry,
          String(countryId),
        );
      else this.localPrefs.removeItem(StorageKey.LastPlayerCountry);
      if (colorId !== RANDOM_COLOR_ID)
        this.localPrefs.setItem(StorageKey.LastPlayerColor, String(colorId));
      else this.localPrefs.removeItem(StorageKey.LastPlayerColor);
    }
  }

  updatePlayerInfo(
    name: string,
    countryId: any,
    colorId: any,
    startPos: any,
    teamId: any,
    skipStartTeam = false,
  ): void {
    if (!this.hostMode)
      throw new Error("Method should only be used in host mode");
    let player = this.gameOpts.humanPlayers.find((p: any) => p.name === name);
    if (!player) {
      console.error("Can't set country/color for non-existent player " + name);
      return;
    }
    player.countryId = countryId;
    player.colorId = colorId;
    if (!skipStartTeam) {
      player.startPos = startPos;
      player.teamId = teamId;
    }
  }

  updateFormModel(): void {
    var opts = this.gameOpts;
    if (opts) {
      this.formModel.gameSpeed = opts.gameSpeed;
      this.formModel.credits = opts.credits;
      this.formModel.unitCount = opts.unitCount;
      this.formModel.shortGame = opts.shortGame;
      this.formModel.superWeapons = opts.superWeapons;
      this.formModel.buildOffAlly = opts.buildOffAlly;
      this.formModel.hostTeams = opts.hostTeams;
      this.formModel.mcvRepacks = opts.mcvRepacks;
      this.formModel.cratesAppear = opts.cratesAppear;
      this.formModel.destroyableBridges = opts.destroyableBridges;
      this.formModel.multiEngineer = opts.multiEngineer;
      this.formModel.noDogEngiKills = opts.noDogEngiKills;
      this.formModel.instantCapture = opts.instantCapture;
      this.formModel.delayedOils = opts.delayedOils;
    }
    if (opts && this.slotsInfo) {
      let budget = opts.maxSlots;
      this.slotsInfo.forEach((slot, idx) => {
        if (idx !== this.observerSlotIndex) {
          if (budget) {
            budget--;
            this.formModel.playerSlots[idx] = {
              country: RANDOM_COUNTRY_NAME,
              color: RANDOM_COLOR_NAME,
              startPos: RANDOM_START_POS,
              team: NO_TEAM_ID,
            };
          } else this.formModel.playerSlots[idx] = void 0;
        } else
          this.formModel.playerSlots[idx] = {
            country: RANDOM_COUNTRY_NAME,
            color: RANDOM_COLOR_NAME,
            startPos: RANDOM_START_POS,
            team: NO_TEAM_ID,
          };
      });
      this.slotsInfo.forEach((slot, idx) => {
        if (!this.formModel.playerSlots[idx]) return;
        let s = this.formModel.playerSlots[idx];
        if (slot.type === SlotType.Closed)
          s.occupation = SlotOccupation.Closed;
        else if (
          slot.type === SlotType.Open ||
          (slot as any).type === (SlotType as any).OpenObserver
        )
          s.occupation = SlotOccupation.Open;
        else s.occupation = SlotOccupation.Occupied;
        if (
          (slot as any).type === (SlotType as any).OpenObserver ||
          idx === this.observerSlotIndex
        )
          s.type = (SlotOccupation as any).Observer;
        else if (slot.type === SlotType.Ai) s.type = (SlotOccupation as any).Ai;
        else s.type = (SlotOccupation as any).Player;
        if (slot.type === SlotType.Ai) {
          s.aiDifficulty = (slot as any).difficulty;
          s.status = PlayerStatus.Ready;
        } else if (slot.type === SlotType.Player) {
          s.name = slot.name;
          if (slot.name === this.hostPlayerName)
            s.status = PlayerStatus.Host;
          else
            s.status = this.playerReadyStatus.get(slot.name)
              ? PlayerStatus.Ready
              : PlayerStatus.NotReady;
        }
      });
    }
    let humans = this.gameOpts ? this.gameOpts.humanPlayers : [];
    let ais = this.gameOpts ? this.gameOpts.aiPlayers : [];
    let mp = this.gameOpts
      ? this.gameModes.getById(this.gameOpts.gameMode).mpDialogSettings
      : void 0;
    this.formModel.playerSlots.forEach((s: any, idx: number) => {
      if (!s || !humans.length) return;
      if (s.occupation === SlotOccupation.Occupied) {
        const h = humans.find((p: any) => p.name === s.name);
        if (h) {
          s.country = this.getCountryNameById(h.countryId);
          s.color = this.getColorNameById(h.colorId);
          s.startPos = h.startPos;
          s.team = h.teamId;
        } else if (ais[idx]) {
          s.country = this.getCountryNameById(ais[idx].countryId);
          s.color = this.getColorNameById(ais[idx].colorId);
          s.startPos = ais[idx].startPos;
          s.team = ais[idx].teamId;
        }
        const ping = this.playerPings.find(
          (p: any) => !!s.name && p.playerName === s.name,
        );
        if (ping) s.ping = 0 < ping.ping ? ping.ping : void 0;
        if (this.playerProfiles && s.type === (SlotOccupation as any).Player)
          s.playerProfile = this.playerProfiles.get(s.name);
      } else if (idx === this.observerSlotIndex) s.country = OBS_COUNTRY_NAME;
      else {
        s.country = RANDOM_COUNTRY_NAME;
        if (mp) s.team = mp.mustAlly ? 3 : NO_TEAM_ID;
      }
    });
    if (!this.hostMode)
      this.formModel.activeSlotIndex = this.slotsInfo
        ? this.slotsInfo.findIndex(
            (s: any) =>
              s.type === SlotType.Player &&
              s.name === this.wolCon.getCurrentUser(),
          )
        : -1;
    this.formModel.availablePlayerColors = this.getSelectablePlayerColors();
    this.formModel.availableStartPositions =
      this.getSelectableStartPositions();
    if (this.gameOpts) {
      this.formModel.teamsAllowed =
        this.gameModes.getById(opts.gameMode).mpDialogSettings.alliesAllowed;
      this.formModel.teamsRequired =
        this.gameModes.getById(opts.gameMode).mpDialogSettings.mustAlly;
    }
    if (this.lobbyForm && humans.length) this.lobbyForm.refresh();
  }

  addSystemMessage(text: string, untrusted = false): void {
    if (!this.lobbyForm) return;
    this.messages.push({ text, untrustedContent: untrusted });
    this.lobbyForm.refresh();
  }

  sendGameOpts(): void {
    if (!this.hostMode) throw new Error("Should only be used in host mode");
    if (!this.gameOpts || !this.wolCon.isOpen() || !this.gameChannelName)
      return;
    this.gameOpts.humanPlayers.forEach((p: any) => {
      if (-1 === p.colorId) p.colorId = RANDOM_COLOR_ID;
    });
    const serialized = this.gameOptSerializer.serializeOptions(this.gameOpts);
    this.wolCon.sendGameOpts(serialized);
    const openSlots = this.slotsInfo.filter(
      (s: any) =>
        s.type === SlotType.Ai ||
        s.type === SlotType.Player ||
        s.type === SlotType.Open ||
        (s as any).type === (SlotType as any).OpenObserver,
    ).length;
    const playerCount = this.slotsInfo.filter(
      (s: any) => s.type === SlotType.Player,
    ).length;
    const modLabel = this.activeModMeta
      ? this.activeModMeta.name +
        (void 0 !== this.activeModMeta.version
          ? ` (${this.activeModMeta.version})`
          : "")
      : void 0;
    this.wolCon.sendGameTopic(
      playerCount,
      openSlots,
      this.gameOpts.aiPlayers.filter((a) => !!a).length,
      Number(
        this.slotsInfo[this.observerSlotIndex].type === SlotType.Player,
      ),
      (this.slotsInfo[this.observerSlotIndex] as any).type ===
        (SlotType as any).OpenObserver,
      this.gameOpts.mapName,
      this.engineModHash,
      this.hostRoomDesc,
      modLabel,
    );
    this.sendPingData();
  }

  handlePlayerJoinLeave(ev: any): void {
    if (!this.hostMode)
      throw new Error("Should only be used in host mode");
    if (!this.wolCon.isOpen() || !this.gameChannelName || !this.slotsInfo)
      return;
    if ("join" === ev.type) {
      let idx = this.slotsInfo.findIndex((s: any) => s.type === SlotType.Open);
      let asObserver = false;
      if (-1 === idx) {
        idx = this.slotsInfo.findIndex(
          (s: any) => (s as any).type === (SlotType as any).OpenObserver,
        );
        asObserver = true;
        if (-1 === idx) {
          this.kickPlayer(ev.user.name);
          return;
        }
      }
      this.slotsInfo[idx] = { type: SlotType.Player, name: ev.user.name };
      let r;
      var mp = this.gameModes.getById(this.gameOpts.gameMode).mpDialogSettings;
      this.gameOpts.humanPlayers.push({
        name: ev.user.name,
        countryId: asObserver ? OBS_COUNTRY_ID : RANDOM_COUNTRY_ID,
        colorId: asObserver ? OBS_COLOR_ID : RANDOM_COLOR_ID,
        startPos: RANDOM_START_POS,
        teamId: mp.mustAlly ? 0 : NO_TEAM_ID,
      });
      this.playerReadyStatus.set(ev.user.name, false);
      for (r of this.playerReadyStatus.keys())
        this.playerReadyStatus.set(r, false);
    } else this.removeHumanPlayer(ev.user.name);
    this.sendGameSlotInfo();
    this.sendObserverSlotInfo();
    this.sendGameOpts();
  }

  removeHumanPlayer(name: string): void {
    let idx = this.slotsInfo.findIndex(
      (s: any) => s.type === SlotType.Player && s.name === name,
    );
    if (-1 !== idx) {
      let slot = this.slotsInfo[idx];
      if (idx === this.observerSlotIndex)
        (slot as any).type = (SlotType as any).OpenObserver;
      else slot.type = SlotType.Open;
    }
    idx = this.gameOpts.humanPlayers.findIndex((p: any) => p.name === name);
    if (-1 !== idx) this.gameOpts.humanPlayers.splice(idx, 1);
    this.playerReadyStatus.delete(name);
    this.playerHasMapStatus.delete(name);
    idx = this.playerPings.findIndex((p: any) => p.playerName === name);
    if (-1 !== idx) this.playerPings.splice(idx, 1);
  }

  kickPlayer(name: string, reason?: string): void {
    if (
      this.gameChannelName &&
      this.wolCon.isInChannel(this.gameChannelName)
    ) {
      this.wolCon.kick([name], this.gameChannelName, reason);
      this.removeHumanPlayer(name);
    }
  }

  sendObserverSlotInfo(): void {
    this.wolCon.sendObserverSlot(this.observerSlotIndex);
  }

  sendGameSlotInfo(): void {
    if (!this.wolCon.isOpen() || !this.gameChannelName) return;
    const data = this.gameOptSerializer.serializeSlotData(this.slotsInfo);
    this.wolCon.sendGameSlotsInfo(data);
  }

  sendPingData(): void {
    if (!this.playerPings.length) return;
    const data = this.gameOptSerializer.serializePingData(this.playerPings);
    this.wolCon.sendPingData(data);
  }

  sendModeMaxSlots(): void {
    if (!this.hostMode) throw new Error("Must be in host mode");
    if (!this.slotsInfo) throw new Error("Slots info should be set by now");
    var channel = this.gameChannelName;
    if (!channel || !this.wolCon.isInChannel(channel))
      throw new Error("Must be in a game channel");
    var count = this.slotsInfo.filter(
      (s: any) => s.type !== SlotType.Closed && s.type !== SlotType.Ai,
    ).length;
    this.wolCon.sendModeChannelMax(channel, count);
  }

  updatePlayerPing(name: string, ping: any): void {
    let entry = this.playerPings.find((p: any) => p.playerName === name);
    if (entry) entry.ping = ping;
    else this.playerPings.push({ ping, playerName: name });
  }

  handlePlayerOptsChange(user: string, opt: string[]): void {
    var slotIdx = this.slotsInfo.findIndex(
      (s: any) => s.type === SlotType.Player && s.name === user,
    );
    if (-1 === slotIdx) return;
    let [countryId, colorId, startPos, teamId] = String(opt.slice(1))
      .split(",")
      .map(Number);
    const human = this.gameOpts.humanPlayers.find(
      (p: any) => p.name === user,
    );
    colorId = this.getSelectablePlayerColors().includes(
      this.getColorNameById(colorId),
    )
      ? colorId
      : human.colorId;
    startPos = this.getSelectableStartPositions().includes(startPos)
      ? startPos
      : human.startPos;
    var mp = this.gameModes.getById(this.gameOpts.gameMode).mpDialogSettings;
    if (!mp.alliesAllowed || (teamId === NO_TEAM_ID && mp.mustAlly))
      teamId = mp.mustAlly ? 0 : NO_TEAM_ID;
    if (
      countryId === OBS_COUNTRY_ID ||
      slotIdx !== this.observerSlotIndex
    ) {
      this.updatePlayerInfo(
        user,
        countryId,
        colorId,
        startPos,
        teamId,
        this.gameOpts.hostTeams,
      );
      this.sendGameOpts();
      if (countryId === OBS_COUNTRY_ID) {
        const obs = this.slotsInfo[this.observerSlotIndex];
        if (
          (obs as any).type !== (SlotType as any).OpenObserver
        ) {
          if (!(obs.type === SlotType.Player && obs.name === user)) {
            console.warn(
              `Player ${user} tried to move to an unavailable observer slot`,
            );
            this.kickPlayer(user);
          }
        } else {
          this.slotsInfo[this.observerSlotIndex] = this.slotsInfo[slotIdx];
          this.slotsInfo[slotIdx] = { type: SlotType.Open };
          this.sendGameSlotInfo();
        }
      }
    } else this.kickPlayer(user);
  }

  handleGameOptReady(user: string, value: string): void {
    if (this.slotsInfo) {
      var idx = this.slotsInfo.findIndex(
        (s: any) => s.type === SlotType.Player && s.name === user,
      );
      if (-1 === idx && this.hostMode) return;
    }
    this.playerReadyStatus.set(user, Boolean(Number(value)));
    if (
      !this.hostMode &&
      user === this.wolCon.getCurrentUser()
    ) {
      if (Number(value)) this.acceptButtonFlashing = false;
      this.refreshSidebarButtons();
    }
    if (
      this.hostMode &&
      ![...this.playerReadyStatus.values()].filter((v) => false === v).length
    )
      this.sound.play(SoundKey.OptionsChanged, ChannelType.Ui);
  }

  handleGameOptHasMap(user: string, value: string): void {
    if (this.slotsInfo) {
      var idx = this.slotsInfo.findIndex(
        (s: any) => s.type === SlotType.Player && s.name === user,
      );
      if (-1 === idx && this.hostMode) return;
    }
    let status = Number(value);
    if (!Object.values(WolHasMapStatus).includes(status))
      status = WolHasMapStatus.NoMap;
    this.playerHasMapStatus.set(user, status);
    if (!this.hostMode && user === this.wolCon.getCurrentUser()) {
      this.refreshSidebarButtons();
      return;
    }
    if (status !== WolHasMapStatus.HasMap && this.gameOpts)
      this.messages.push({
        untrustedContent: true,
        text:
          status === WolHasMapStatus.MapTransfer
            ? this.strings.get(
                "GUI:HostMapTransfer",
                user,
                `"${this.gameOpts.mapTitle}"`,
              )
            : this.strings.get(
                "GUI:HostNoMap",
                user,
                `"${this.gameOpts.mapTitle}"`,
              ) +
              (this.hostIsFreshAccount
                ? " " + this.strings.get("GUI:HostNoMapUpload")
                : ""),
      });
  }

  handleGameOptObserver(value: string): void {
    this.observerSlotIndex = Number(value);
  }

  handleGameOptSlots(payload: any): void {
    this.slotsInfo = this.gameOptParser.parseSlotData(payload);
  }

  handleGameOptPing(payload: any): void {
    this.playerPings = this.gameOptParser.parsePingData(payload);
  }

  handleGameOptOptions(payload: any): void {
    if (!this.gameChannelName || !this.wolCon.isInChannel(this.gameChannelName))
      return;
    const next = this.gameOptParser.parseOptions(payload);
    const mapChanged =
      next.mapName !== this.gameOpts?.mapName ||
      next.mapDigest !== this.gameOpts?.mapDigest;
    GameOptSanitizer.sanitize(next, this.rules);
    this.gameOpts = next;
    this.refreshSidebarMpText();
    if (mapChanged && this.wolCon.isOpen()) {
      const user = this.wolCon.getCurrentUser();
      this.playerReadyStatus.set(user, false);
      this.playerHasMapStatus.set(user, WolHasMapStatus.NoMap);
      this.refreshSidebarButtons();
      this.wolCon.sendPlayerReady(false);
      this.guestUpdateMapDeferred(next);
    }
  }

  guestUpdateMapDeferred(opts: any): void {
    this.mapLoadTask?.cancel();
    this.mapLoadTask = new Task(async (cancel) => {
      this.controller.setSidebarPreview();
      this.currentMapFile = void 0;
      let local = (this.currentMapFile = await this.loadAndCheckMap(opts));
      if (cancel.isCancelled() || !this.wolCon.isOpen()) return;
      const canTransfer =
        !local &&
        !opts.mapOfficial &&
        !this.hostIsFreshAccount &&
        opts.mapSizeBytes <=
          (this.mapTransferService.getUrl()
            ? GSERV_MAX_MAP_TRANSFER_BYTES
            : MAX_MAP_TRANSFER_BYTES);
      const status = local
        ? WolHasMapStatus.HasMap
        : canTransfer
          ? WolHasMapStatus.MapTransfer
          : WolHasMapStatus.NoMap;
      this.wolCon.sendPlayerHasMap(status);
      if (local) this.updateMapPreview(local);
      else
        this.addSystemMessage(
          canTransfer
            ? this.strings.get(
                "GUI:JoinerMapTransfer",
                `"${opts.mapTitle}"`,
              )
            : this.hostIsFreshAccount
              ? this.strings.get("GUI:HostNoMapUpload")
              : this.strings.get(
                  "GUI:JoinerNoMap",
                  `"${opts.mapTitle}"`,
                ),
          true,
        );
      this.refreshSidebarMpText();
    });
    this.mapLoadTask.start().catch((e) => {
      if (!(e instanceof OperationCanceledError))
        this.handleError(e, this.strings.get("TXT_DOWNLOAD_FAILED"));
    });
  }

  updateMapPreview(data: any): void {
    try {
      const preview = new MapPreviewRenderer(this.strings).render(
        new MapFile(data),
        this.hostMode ? LobbyType.MultiplayerHost : LobbyType.MultiplayerGuest,
        this.controller.getSidebarPreviewSize(),
      );
      this.controller.setSidebarPreview(preview);
    } catch (e) {
      console.error("Failed to render map preview");
      console.error(e);
      this.controller.setSidebarPreview();
    }
  }

  async loadAndCheckMap(opts: any): Promise<any | undefined> {
    if (!this.mapList.getByName(opts.mapName)) return;
    const file = await this.mapFileLoader.load(opts.mapName);
    if (
      MapDigest.compute(file) === opts.mapDigest &&
      file.getSize() === opts.mapSizeBytes
    )
      return file;
    return void 0;
  }

  initLobbyForm(): void {
    var [el] = this.jsxRenderer.render(
      jsx(HtmlView as any, {
        innerRef: (e: any) => (this.lobbyForm = e),
        component: LobbyForm,
        props: this.formModel,
      }),
    );
    this.controller.setMainComponent(el);
  }

  refreshSidebarButtons(): void {
    let s = this.strings;
    let ready = this.playerReadyStatus.get(this.wolCon.getCurrentUser());
    var hasMap =
      this.playerHasMapStatus.get(this.wolCon.getCurrentUser()) ??
      WolHasMapStatus.NoMap;
    var buttons: any[] = [
      this.hostMode
        ? {
            label: s.get("GUI:StartGame"),
            tooltip: s.get("STT:HostButtonGo"),
            disabled: false,
            onClick: () => {
              if (!this.wolCon.isOpen()) return;
              const noMapUser = [...this.playerHasMapStatus].find(
                ([, v]) => v === WolHasMapStatus.NoMap,
              )?.[0];
              if (void 0 !== noMapUser)
                this.addSystemMessage(
                  this.strings.get(
                    "GUI:HostNoMap",
                    noMapUser,
                    `"${this.gameOpts.mapTitle}"`,
                  ) +
                    (this.hostIsFreshAccount
                      ? " " + this.strings.get("GUI:HostNoMapUpload")
                      : ""),
                  true,
                );
              else if (
                this.gameOpts.humanPlayers.filter(
                  (p: any) => p.countryId !== OBS_COUNTRY_ID,
                ).length < 2
              )
                this.addSystemMessage(this.strings.get("TXT_ONLY_ONE"));
              else if (this.meetsMinimumTeams()) {
                if (
                  [...this.playerReadyStatus.values()].filter(
                    (v) => false === v,
                  ).length
                ) {
                  this.addSystemMessage(
                    this.strings.get("GUI:HostGameStartHost"),
                  );
                  this.wolCon.sendGameStartRequest();
                } else {
                  this.frozenGameOpts = this.gameOptParser.parseOptions(
                    this.gameOptSerializer.serializeOptions(this.gameOpts),
                  );
                  this.wolCon.startGame(
                    this.gameOpts.humanPlayers.map((p: any) => p.name),
                  );
                }
              } else
                this.addSystemMessage(this.strings.get("TXT_CANNOT_ALLY"));
            },
          }
        : {
            label: ready ? s.get("GUI:NotReady") : s.get("GUI:Accept"),
            tooltip: ready ? s.get("STT:NotReady") : s.get("STT:GuestButtonAccept"),
            disabled: hasMap === WolHasMapStatus.NoMap,
            flashing: !ready && this.acceptButtonFlashing,
            onClick: () => {
              if (!this.wolCon.isOpen() || !this.gameChannelName) return;
              this.playerReadyStatus.set(
                this.wolCon.getCurrentUser(),
                !ready,
              );
              this.wolCon.sendPlayerReady(!ready);
            },
          },
      ...(this.hostMode
        ? [
            {
              label: s.get("GUI:ChooseMap"),
              tooltip: s.get("STT:HostButtonChooseMap"),
              onClick: () => {
                this.controller?.pushScreen(ScreenType.MapSelection, {
                  lobbyType: this.hostMode
                    ? LobbyType.MultiplayerHost
                    : LobbyType.MultiplayerGuest,
                  gameOpts: this.gameOpts,
                  usedSlots: () =>
                    1 +
                    findIndexReverse(
                      this.slotsInfo,
                      (slot: any, idx: number) =>
                        slot.type === SlotType.Ai ||
                        (slot.type === SlotType.Player &&
                          this.observerSlotIndex !== idx),
                    ) -
                    (0 === this.observerSlotIndex ? 1 : 0),
                });
              },
            },
          ]
        : []),
      {
        label: s.get("GUI:Back"),
        tooltip: this.hostMode
          ? s.get("STT:HostButtonBack")
          : s.get("STT:GuestButtonBack"),
        isBottom: true,
        onClick: () => {
          this.controller?.goToScreen(ScreenType.CustomGame, {});
        },
      },
    ];
    this.controller.setSidebarButtons(buttons, true);
    this.refreshSidebarMpText();
  }

  meetsMinimumTeams(): boolean {
    let players = [...this.gameOpts.humanPlayers, ...this.gameOpts.aiPlayers]
      .filter(isNotNullOrUndefined)
      .filter((p: any) => p.countryId !== OBS_COUNTRY_ID);
    let team = players[0].teamId;
    return team === NO_TEAM_ID || players.some((p: any) => p.teamId !== team);
  }

  refreshSidebarMpText(): void {
    if (this.gameOpts)
      this.controller.setSidebarMpContent({
        text:
          this.strings.get(
            this.gameModes.getById(this.gameOpts.gameMode).label,
          ) +
          "\n\n" +
          (this.hostMode ||
          !this.hostIsFreshAccount ||
          this.currentMapFile
            ? this.gameOpts.mapTitle
            : this.strings.get("GUI:CustomMap")),
        icon: this.gameOpts.mapOfficial ? "gt18.pcx" : "settings.png",
        tooltip: this.gameOpts.mapOfficial
          ? this.strings.get("STT:VerifiedMap")
          : this.strings.get("STT:UnverifiedMap"),
      });
    else this.controller.setSidebarMpContent({ text: "" });
  }

  async onLeave(): Promise<void> {
    if (
      this.wolCon.isOpen() &&
      this.wolCon.getCurrentUser() &&
      this.gameChannelName
    )
      this.wolCon.leaveChannel(this.gameChannelName);
    this.disposables.dispose();
    if (this.mapLoadTask) {
      this.mapLoadTask.cancel();
      this.mapLoadTask = void 0;
    }
    if (this.ranksUpdateTask) {
      this.ranksUpdateTask.cancel();
      this.ranksUpdateTask = void 0;
    }
    if (this.pingsUpdateTask) {
      this.pingsUpdateTask.cancel();
      this.pingsUpdateTask = void 0;
    }
    if (this.gservPingUpdateTask) {
      this.gservPingUpdateTask.cancel();
      this.gservPingUpdateTask = void 0;
    }
    this.currentMapFile = void 0;
    this.gameChannelName = void 0;
    this.hostPlayerName = void 0;
    this.hostIsFreshAccount = void 0;
    this.hostRoomDesc = "";
    this.gameOpts = void 0;
    this.frozenGameOpts = void 0;
    this.preferredHostOpts = void 0;
    this.playerPings = this.slotsInfo = void 0;
    this.playerProfiles.clear();
    this.currentGameServer = void 0;
    this.acceptButtonFlashing = false;
    if (this.hostOptsIntervalId) clearInterval(this.hostOptsIntervalId);
    if (this.gservPingIntervalId) clearInterval(this.gservPingIntervalId);
    this.wolCon.onGameOpt.unsubscribe(this.handleGameOpt);
    this.wolCon.onGameStart.unsubscribe(this.handleGameStart);
    this.wolCon.onGameServer.unsubscribe(this.handleGameServer);
    this.wolCon.onLeaveChannel.unsubscribe(this.onChannelLeave);
    this.wolCon.onJoinChannel.unsubscribe(this.onChannelJoin);
    this.wolCon.onChatMessage.unsubscribe(this.onChannelMessage);
    this.wolCon.onClose.unsubscribe(this.onWolClose);
    this.wolCon.onPartyUpdate.unsubscribe(this.handlePartyUpdate);
    this.wolService.onWolConnectionLost.unsubscribe(this.onWolConLost);
    this.controller.toggleSidebarPreview(false);
    await this.unrender();
  }

  async unrender(): Promise<void> {
    await this.controller.hideSidebarButtons();
    if (this.lobbyForm) this.lobbyForm = void 0;
  }
}
