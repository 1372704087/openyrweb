/**
 * CustomGameScreen — 自定义游戏大厅（房间列表/聊天/建房加入观战）。
 *
 * 由 gui/screen/mainMenu/customGame/CustomGameScreen.ts.js
 * 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { GameBrowser } from "gui/screen/mainMenu/customGame/component/GameBrowser"; // 孪生（本组内一并转换）
import { ScreenType } from "gui/screen/mainMenu/ScreenType"; // 孪生（本组内一并转换）
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { jsx } from "gui/jsx/jsx"; // 孪生
import { HtmlView } from "gui/jsx/HtmlView"; // 孪生
import { SoundKey } from "engine/sound/SoundKey"; // 已转换
import { ChannelType } from "engine/sound/ChannelType"; // 已转换
import { MusicType } from "engine/sound/Music"; // 已转换
import { IrcConnection } from "network/IrcConnection"; // 已转换
import { MainMenuScreen } from "gui/screen/mainMenu/MainMenuScreen"; // 孪生（本组内一并转换）
import { Task } from "@puzzl/core/lib/async/Task"; // 已转换
import { OperationCanceledError } from "@puzzl/core/lib/async/cancellation/OperationCanceledError"; // 已转换
import { MAX_LIST_SEARCH_COUNT } from "network/ladder/wladderConfig"; // 已转换
import { MainMenuRoute } from "gui/screen/mainMenu/MainMenuRoute"; // 孪生（本组内一并转换）
import { ChatRecipientType } from "network/chat/ChatMessage"; // 已转换
import { ChatHistory } from "gui/chat/ChatHistory"; // 已转换
import { WolError } from "network/WolError"; // 已转换
import { CancellationTokenSource } from "@puzzl/core/lib/async/cancellation"; // 已转换
import { RPL_PARTY_INVITE } from "network/partyCodes"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

export class CustomGameScreen extends MainMenuScreen {
  engineModHash: any;
  strings: any;
  wolCon: any;
  wolService: any;
  wladderService: any;
  jsxRenderer: any;
  sound: any;
  serverRegions: any;
  mapList: any;
  errorHandler: any;
  musicType?: any;
  playerProfiles = new Map<string, any>();
  disposables = new CompositeDisposable();
  messages: any[] = [];
  users: any[] = [];
  games: any[] = [];
  selectedGame?: any;
  channelName?: string;
  chatHistory?: any;
  gameBrowser?: any;
  ranksUpdateTask?: any;
  refreshTimeoutId?: any;

  constructor(
    engineModHash: any,
    strings: any,
    wolCon: any,
    wolService: any,
    wladderService: any,
    jsxRenderer: any,
    sound: any,
    serverRegions: any,
    mapList: any,
    errorHandler: any,
  ) {
    super();
    this.engineModHash = engineModHash;
    this.strings = strings;
    this.wolCon = wolCon;
    this.wolService = wolService;
    this.wladderService = wladderService;
    this.jsxRenderer = jsxRenderer;
    this.sound = sound;
    this.serverRegions = serverRegions;
    this.mapList = mapList;
    this.errorHandler = errorHandler;
    this.title = this.strings.get("GUI:CustomMatch");
    this.musicType = MusicType.NormalShuffle;
  }

  addSystemMessage(text: string): void {
    this.messages.push({ text });
    this.gameBrowser?.refresh();
  }

  async refreshGames(cancel?: any): Promise<void> {
    if (!this.wolCon.isOpen()) {
      this.onWolClose();
      return;
    }
    if (!this.channelName || !this.wolCon.getCurrentUser()) return;
    let list: any;
    try {
      var channelType = this.wolService.getConfig().getClientChannelType();
      list = await this.wolCon.listGames(channelType, channelType);
      if (cancel?.isCancelled()) return;
    } catch (e) {
      if (e instanceof (IrcConnection as any).SocketError) return;
      if (e instanceof (IrcConnection as any).NoReplyError) return;
      throw e;
    }
    list.sort((a: any, b: any) => Number(a.passLocked) - Number(b.passLocked));
    this.games = list;
    const selected = this.selectedGame;
    if (selected)
      this.onGameSelectionChange(
        list.find((g: any) => g.name === selected.name),
      );
    this.gameBrowser?.applyOptions((o: any) => (o.games = list));
    this.refreshPlayerRanks();
  }

  refreshPlayerRanks(): void {
    if (this.wladderService.getUrl()) {
      this.ranksUpdateTask?.cancel();
      let task = (this.ranksUpdateTask = new Task(async (cancel) => {
        let names = [
          ...new Set([
            ...this.users.map((u) => u.name),
            ...this.games.map((g) => g.hostName),
          ]),
        ].filter((n) => !this.playerProfiles.has(n));
        if (names.length) {
          for (; 0 < names.length; ) {
            var batch = names.splice(0, MAX_LIST_SEARCH_COUNT);
            batch = await this.wladderService.listSearch(batch, cancel);
            if (cancel.isCancelled()) return;
            for (const profile of batch)
              this.playerProfiles.set(profile.name, profile);
          }
          this.gameBrowser?.refresh();
        }
      }));
      task.start().catch((e) => {
        if (!(e instanceof OperationCanceledError)) console.error(e);
      });
    }
  }

  onGameSelectionChange(game?: any): void {
    this.selectedGame = game;
    this.refreshSidebarButtons();
  }

  gameIsFull(game: any): boolean {
    return (
      game.humanPlayers + game.aiPlayers ===
      game.maxPlayers - (game.observable ? 1 : 0)
    );
  }

  refreshSidebarButtons(): void {
    let selected = this.selectedGame;
    var buttons: any[] = [
      {
        label: this.strings.get("GUI:CreateGame"),
        tooltip: this.strings.get("STT:LobbyButtonNew"),
        onClick: () => this.createGame(),
      },
      {
        label: this.strings.get("GUI:JoinGame"),
        tooltip: this.strings.get("STT:LobbyButtonJoin"),
        disabled: !selected || this.gameIsFull(selected),
        onClick: () => this.joinGame(selected),
      },
      {
        label: this.strings.get("GUI:Observe"),
        tooltip: this.strings.get("STT:LobbyButtonObserve"),
        disabled: !selected || !selected.observable || !!selected.observers,
        onClick: () => {
          this.observeGame(selected);
        },
      },
      ...(1 < this.serverRegions.getSize()
        ? [
            {
              label: this.strings.get("GUI:ChangeServer"),
              tooltip: this.strings.get("STT:ChangeServer"),
              onClick: () => {
                this.wolService.closeWolConnection();
                this.controller?.goToScreen(ScreenType.Login, {
                  clearCredentials: true,
                  afterLogin: (messages: any) =>
                    new MainMenuRoute(ScreenType.CustomGame, { messages }),
                });
              },
            },
          ]
        : []),
      {
        label: this.strings.get("GUI:Back"),
        tooltip: this.strings.get("STT:LobbyButtonBack"),
        isBottom: true,
        onClick: () => {
          this.wolService.closeWolConnection();
          this.controller?.goToScreen(ScreenType.Home);
        },
      },
    ];
    this.controller.setSidebarButtons(buttons);
  }

  initView(cancel?: any): void {
    var [el] = this.jsxRenderer.render(
      jsx(HtmlView as any, {
        innerRef: (e: any) => (this.gameBrowser = e),
        component: GameBrowser,
        props: {
          strings: this.strings,
          messages: this.messages,
          chatHistory: this.chatHistory,
          channels: [this.channelName],
          localUsername: this.wolCon.getCurrentUser(),
          users: this.users,
          games: this.games,
          playerProfiles: this.playerProfiles,
          mapList: this.mapList,
          onSendMessage: (msg: any) => {
            if (!msg.value.length)
              this.addSystemMessage(this.strings.get("TXT_ENTER_MESSAGE"));
            else if (this.wolCon.isOpen()) {
              this.wolCon.sendChatMessage(msg.value, msg.recipient);
              if (msg.recipient.type === ChatRecipientType.Whisper)
                this.chatHistory.lastWhisperTo.value = msg.recipient.name;
            }
          },
          onRefreshClick: () => this.refreshGames(cancel),
          onSelectGame: (game: any) => this.onGameSelectionChange(game),
          onDoubleClickGame: (game: any) => {
            if (!this.gameIsFull(game)) this.joinGame(game);
          },
        },
      }),
    );
    this.controller.setMainComponent(el);
    this.refreshSidebarButtons();
    this.controller.showSidebarButtons();
  }

  onChannelJoinLeave = (ev: any) => {
    let channel = ev.channel;
    let m = channel.match(/#Lob \d+ (\d)/i);
    var idx;
    if (m) {
      [, idx] = m.map(Number);
      channel = this.strings.get("TXT_LOB_" + (idx + 1));
    }
    if (ev.user.name === this.wolCon.getCurrentUser())
      this.addSystemMessage(
        this.strings.get(
          "join" === ev.type ? "TXT_JOINED_S" : "TXT_YOULEFT",
          channel,
        ),
      );
    else if (ev.channel === this.channelName) {
      if ("join" === ev.type) {
        this.users.push(ev.user);
        this.users.sort((a, b) => Number(b.operator) - Number(a.operator));
      } else if (-1 !== (idx = this.users.findIndex((u) => u.name === ev.user.name)))
        this.users.splice(idx, 1);
      this.gameBrowser?.refresh();
    }
  };

  onChannelUsers = (ev: any) => {
    if (ev.channelName === this.channelName) {
      this.users = ev.users;
      this.gameBrowser?.applyOptions((o: any) => (o.users = this.users));
    }
  };

  onChannelMessage = (msg: any) => {
    if (
      msg.to.type === ChatRecipientType.Page ||
      msg.to.type === ChatRecipientType.Whisper
    )
      this.sound.play(SoundKey.IncomingMessage, ChannelType.Ui);
    const enriched = {
      ...msg,
      operator: this.users.find((u) => u.name === msg.from)?.operator,
    };
    this.messages.push(enriched);
    this.gameBrowser?.refresh();
    if (
      msg.to.type === ChatRecipientType.Whisper &&
      msg.to.name !== this.wolCon.getServerName() &&
      msg.from !== this.wolCon.getCurrentUser()
    )
      this.chatHistory.lastWhisperFrom.value = msg.from;
  };

  onWolClose = () => {
    clearInterval(this.refreshTimeoutId);
  };

  onWolConLost = (e: any) => {
    this.handleError(e, this.strings.get("TXT_YOURE_DISCON"));
  };

  handlePartyUpdate = (text: string) => {
    var parts = text.split(" ");
    if (parts[0] === RPL_PARTY_INVITE) {
      const from = parts[1];
      if (from) this.wolCon.partyInviteUnavailable(from);
    }
  };

  async onEnter(params?: any): Promise<void> {
    this.messages = params?.messages ?? [];
    this.chatHistory = new ChatHistory();
    this.controller.toggleMainVideo(false);
    let cts = new CancellationTokenSource();
    this.disposables.add(() => cts.cancel());
    var cancel = cts.token;
    if (this.wolCon.getCurrentUser()) await this.loadChannel(cancel);
    else
      this.controller.goToScreen(ScreenType.Login, {
        afterLogin: (messages: any) =>
          new MainMenuRoute(ScreenType.CustomGame, { messages }),
      });
  }

  async loadChannel(cancel: any): Promise<void> {
    this.channelName = void 0;
    this.users = [];
    this.games = [];
    this.selectedGame = void 0;
    this.wolCon.onJoinChannel.subscribe(this.onChannelJoinLeave);
    this.wolCon.onLeaveChannel.subscribe(this.onChannelJoinLeave);
    this.wolCon.onChannelUsers.subscribe(this.onChannelUsers);
    this.wolCon.onChatMessage.subscribe(this.onChannelMessage);
    this.wolCon.onClose.subscribe(this.onWolClose);
    this.wolCon.onPartyUpdate.subscribe(this.handlePartyUpdate);
    this.wolService.onWolConnectionLost.subscribe(this.onWolConLost);
    try {
      let config = this.wolService.getConfig();
      var name = `#Lob ${config.getClientChannelType()} 0`;
      await this.wolCon.joinChannel(name, config.getGlobalChannelPass());
      if (cancel.isCancelled()) return;
      this.channelName = name;
      this.playerProfiles.clear();
      this.initView(cancel);
      this.gameBrowser?.applyOptions((o: any) => (o.users = this.users));
      await this.refreshGames(cancel);
      this.refreshTimeoutId = setInterval(
        () => this.refreshGames(cancel),
        5000,
      );
    } catch (e: any) {
      let message = this.strings.get("WOL:MatchBadParameters");
      if (e instanceof WolError) {
        let map = new Map()
          .set((WolError as any).Code.NoSuchChannel, "WOL:ChannelJoinFailure")
          .set((WolError as any).Code.BadChannelPass, "TXT_BADPASS")
          .set((WolError as any).Code.ChannelFull, "TXT_CHANNEL_FULL")
          .set((WolError as any).Code.BannedFromChannel, "TXT_JOINBAN");
        const key = map.get(e.code);
        if (key) message = this.strings.get(key);
      }
      this.handleError(e, message);
    }
  }

  async onLeave(): Promise<void> {
    this.disposables.dispose();
    if (this.refreshTimeoutId) clearInterval(this.refreshTimeoutId);
    if (this.ranksUpdateTask) {
      this.ranksUpdateTask.cancel();
      this.ranksUpdateTask = void 0;
    }
    if (this.wolCon.isOpen() && this.channelName)
      this.wolCon.leaveChannel(this.channelName);
    this.wolCon.onJoinChannel.unsubscribe(this.onChannelJoinLeave);
    this.wolCon.onLeaveChannel.unsubscribe(this.onChannelJoinLeave);
    this.wolCon.onChannelUsers.unsubscribe(this.onChannelUsers);
    this.wolCon.onChatMessage.unsubscribe(this.onChannelMessage);
    this.wolCon.onClose.unsubscribe(this.onWolClose);
    this.wolCon.onPartyUpdate.unsubscribe(this.handlePartyUpdate);
    this.wolService.onWolConnectionLost.unsubscribe(this.onWolConLost);
    await this.controller.hideSidebarButtons();
    this.channelName = void 0;
    this.gameBrowser = void 0;
    this.messages = [];
    this.users = [];
    this.playerProfiles.clear();
    this.games = [];
    this.selectedGame = void 0;
  }

  async createGame(): Promise<void> {
    this.controller.goToScreen(ScreenType.Lobby, { create: true });
  }

  async joinGame(game: any): Promise<void> {
    this.joinRoom(game, false);
  }

  observeGame(game: any): void {
    this.joinRoom(game, true);
  }

  joinRoom(game: any, observe: boolean): void {
    if (game.modHash === this.engineModHash)
      this.controller.goToScreen(ScreenType.Lobby, { game, observe });
    else if (void 0 !== game.modHash)
      this.addSystemMessage(this.strings.get("TXT_MISMATCH"));
  }

  handleError(e: any, message: string): void {
    this.errorHandler.handle(e, message, () => {
      this.wolService.closeWolConnection();
      this.controller?.goToScreen(ScreenType.Home);
    });
    clearInterval(this.refreshTimeoutId);
  }
}
