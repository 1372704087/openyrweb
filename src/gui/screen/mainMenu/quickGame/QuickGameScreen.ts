/**
 * QuickGameScreen — 快速匹配屏（队列状态机 + 战队邀请）。
 *
 * QueueState：None/Initializing/WaitingForMatch/Timer/GameStart。
 * 探针禁止真实排队：仅测构造字段与枚举。
 *
 * 由 gui/screen/mainMenu/quickGame/QuickGameScreen.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { Task } from "@puzzl/core/lib/async/Task"; // 已转换
import {
  CancellationTokenSource,
  OperationCanceledError,
} from "@puzzl/core/lib/async/cancellation"; // 已转换
import { jsx } from "gui/jsx/jsx"; // 孪生
import { HtmlView } from "gui/jsx/HtmlView"; // 孪生
import { MusicType } from "engine/sound/Music"; // 已转换
import { MainMenuScreen } from "gui/screen/mainMenu/MainMenuScreen"; // 孪生（本组内一并转换）
import { ScreenType } from "gui/screen/mainMenu/ScreenType"; // 孪生（本组内一并转换）
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { RANDOM_COLOR_ID, RANDOM_COLOR_NAME, RANDOM_COUNTRY_ID, RANDOM_COUNTRY_NAME } from "game/gameopts/constants"; // 已转换
import { SoundKey } from "engine/sound/SoundKey"; // 已转换
import { ChannelType } from "engine/sound/ChannelType"; // 已转换
import { MainMenuRoute } from "gui/screen/mainMenu/MainMenuRoute"; // 孪生（本组内一并转换）
import { PartyStatus } from "gui/screen/mainMenu/quickGame/PartyState"; // 孪生（本组内一并转换）
import { QuickGameForm } from "gui/screen/mainMenu/quickGame/component/QuickGameForm"; // 孪生（本组内一并转换）
import { StorageKey } from "LocalPrefs"; // 已转换
import { WLadderService } from "network/ladder/WLadderService"; // 已转换
import { LadderQueueType, getLadderTypeForQueueType, teamSizes } from "network/ladder/wladderConfig"; // 已转换
import * as gameOpts from "game/gameopts/constants"; // 孪生（constants 别名）
import { WolError } from "network/WolError"; // 已转换
import * as qm from "network/qmCodes"; // 孪生
import * as party from "network/partyCodes"; // 孪生
import { ChatUi } from "gui/screen/mainMenu/quickGame/ChatUi"; // 孪生（本组内一并转换）
import { PartyInviteDialog } from "gui/component/PartyInviteDialog"; // 已转换

// 孪生 any-shim
const QM: any = qm;
const PC: any = party;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 排队状态机。 */
enum QueueState {
  None = 0,
  Initializing = 1,
  WaitingForMatch = 2,
  WaitingForStartTimer = 3,
  WaitingForGameStart = 4,
}

export class QuickGameScreen extends MainMenuScreen {
  unrankedEnabled: any;
  engineVersion: any;
  engineModHash: any;
  clientLocale: any;
  rules: any;
  wolService: any;
  wolCon: any;
  wladderService: any;
  serverRegions: any;
  rootController: any;
  messageBoxApi: any;
  uiScene: any;
  jsxRenderer: any;
  strings: any;
  localPrefs: any;
  sound: any;
  errorHandler: any;
  musicType?: any;
  partySize = 1;
  partyState: any;
  userHasDeclinedInvitesFrom = new Set<string>();
  availableQueueTypes: any[];
  playButtonFlashing = false;
  noInvites = false;
  disposables = new CompositeDisposable();
  queueOpts!: { type: any; ranked: boolean; countryId: any; colorId: any };
  queueState: QueueState = QueueState.None;
  wolConfig?: any;
  chatUi?: any;
  form?: any;
  playerProfile?: any;
  prePartyQueueType?: any;
  quickMatchChannelName?: string;
  countdownSeconds?: number;
  refreshProfileTask?: any;
  gameStartTimeoutId?: any;
  countdownIntervalId?: any;
  updateStatsIntervalId?: any;
  availQueueRefreshIntervalId?: any;
  pendingInvite?: { from: string; timeoutId: any };
  inviteDialog?: any;

  constructor(
    unrankedEnabled: any,
    engineVersion: any,
    engineModHash: any,
    clientLocale: any,
    rules: any,
    wolService: any,
    wolCon: any,
    wladderService: any,
    serverRegions: any,
    rootController: any,
    messageBoxApi: any,
    uiScene: any,
    jsxRenderer: any,
    strings: any,
    localPrefs: any,
    sound: any,
    errorHandler: any,
  ) {
    super();
    this.unrankedEnabled = unrankedEnabled;
    this.engineVersion = engineVersion;
    this.engineModHash = engineModHash;
    this.clientLocale = clientLocale;
    this.rules = rules;
    this.wolService = wolService;
    this.wolCon = wolCon;
    this.wladderService = wladderService;
    this.serverRegions = serverRegions;
    this.rootController = rootController;
    this.messageBoxApi = messageBoxApi;
    this.uiScene = uiScene;
    this.jsxRenderer = jsxRenderer;
    this.strings = strings;
    this.localPrefs = localPrefs;
    this.sound = sound;
    this.errorHandler = errorHandler;
    this.title = this.strings.get("GUI:WolMatch");
    this.musicType = MusicType.NormalShuffle;
    this.partyState = this.getInitialPartyState();
    this.availableQueueTypes = Object.values(LadderQueueType);
  }

  handleChatMessage = (msg: any) => {
    if (
      msg.text.startsWith(QM.RPL_QUEUE_LIST + " ") &&
      this.queueState === QueueState.None
    ) {
      let body = msg.text.split(" ").slice(1).join(" ");
      let list = body
        .split(",")
        .filter((e: any) => Object.values(LadderQueueType).includes(e));
      this.availableQueueTypes = list;
      if (!list.includes(this.queueOpts.type) && list.length) {
        this.queueOpts.type = list[0];
        if (this.form) this.requestPlayerProfileRefresh();
      }
      this.form?.applyOptions((o: any) => {
        o.enabledTypes = list;
        o.type = this.queueOpts.type;
      });
    }
    if (
      this.queueState === QueueState.None ||
      msg.from !== this.wolConfig.getQuickMatchBotName()
    )
      return;
    if (
      [
        QM.RPL_WORKING,
        QM.RPL_BAD_VERS,
        QM.RPL_BAD_HASH,
        QM.RPL_MODE_UNAVAIL,
        QM.RPL_RATE_LIMITED,
      ].includes(msg.text)
    ) {
      if (this.queueState === QueueState.Initializing) {
        if (msg.text === QM.RPL_WORKING)
          this.updateQueueState(QueueState.WaitingForMatch);
        else {
          let message: string;
          let fatal = true;
          if (msg.text === QM.RPL_BAD_VERS)
            message = this.strings.get("TS:OutdatedClient");
          else if (msg.text === QM.RPL_BAD_HASH)
            message = this.strings.get("TXT_MISMATCH");
          else if (msg.text === QM.RPL_MODE_UNAVAIL) {
            message = this.strings.get("WOL:MatchModeUnavail");
            fatal = false;
          } else if (msg.text === QM.RPL_RATE_LIMITED) {
            message = this.strings.get("WOL:MatchQueueJoinRateLimit");
            fatal = false;
          } else message = this.strings.get("WOL:MatchBadParameters");
          if (!fatal) this.leaveQueue();
          this.handleError(msg.text, message, { fatal });
        }
      } else
        console.warn(
          `Unexpected reply "${msg.text}" from match bot (qs: ${QueueState[this.queueState]})`,
        );
      return;
    }
    if (msg.text.startsWith(QM.RPL_MATCHED + " ")) {
      if (this.queueState === QueueState.WaitingForMatch) {
        this.sound.play(SoundKey.PlayerJoined, ChannelType.Ui);
        this.countdownSeconds = Number(msg.text.split(" ")[1]);
        this.updateQueueState(QueueState.WaitingForStartTimer);
      } else
        console.warn(
          `Unexpected reply "${msg.text}" from match bot (qs: ${QueueState[this.queueState]})`,
        );
      return;
    }
    if (msg.text === QM.RPL_REQUEUE) {
      if (
        [
          QueueState.WaitingForGameStart,
          QueueState.WaitingForStartTimer,
        ].includes(this.queueState)
      ) {
        console.log("A player left. Returned to queue.");
        this.updateQueueState(QueueState.WaitingForMatch);
      }
      return;
    }
    if (msg.text === QM.RPL_REMOVED_FROM_QUEUE) {
      if (this.quickMatchChannelName) {
        this.wolCon.leaveChannel(this.quickMatchChannelName);
        this.quickMatchChannelName = void 0;
      }
      this.updateQueueState(QueueState.None);
      if (this.partyState.partyId) {
        this.partyState.status = PartyStatus.Idle;
        this.partyState.members.forEach((m: any) => (m.ready = false));
        this.playButtonFlashing = false;
        this.updatePartyUI();
      }
      return;
    }
    if (
      msg.text.startsWith(QM.RPL_STATS + " ") &&
      this.queueState === QueueState.WaitingForMatch
    ) {
      if (this.isWaitingForTeammate())
        this.updateSidebarText(this.strings.get("GUI:WaitingForTeammate"));
      else {
        let body = msg.text.split(" ").slice(1).join(" ");
        var [, waitRaw] = body.split(",");
        var wait = "-1" !== waitRaw ? Number(waitRaw) : void 0;
        this.updateSidebarText(
          this.strings.get("TXT_SEARCHING_FOR", this.queueOpts.type) +
            "\n\n" +
            this.strings.get("WOL:MatchAvgWaitTime") +
            "\n" +
            (void 0 !== wait && wait < 3600
              ? this.strings.get(
                  "WOL:MatchAvgWaitTimeMinutes",
                  wait < 60 ? "<1" : "~" + Math.ceil(wait / 60),
                )
              : this.strings.get("WOL:MatchAvgWaitTimeUnavail")),
        );
      }
    }
  };

  handleLeaveChannel = async (ev: any) => {
    if (
      ev.user.name === this.wolCon.getCurrentUser() &&
      ev.channel === this.quickMatchChannelName
    ) {
      this.quickMatchChannelName = void 0;
      if (this.queueState !== QueueState.None) {
        this.updateQueueState(QueueState.None);
        this.wolCon.close();
      }
    }
  };

  handleGameStart = async (ev: any) => {
    if (
      this.queueState !== QueueState.WaitingForGameStart &&
      this.queueState !== QueueState.WaitingForStartTimer
    )
      return;
    try {
      var user = this.wolCon.getCurrentUser();
      if (void 0 === user) throw new Error("User should be logged in");
      this.updateQueueState(QueueState.None);
      var route = new MainMenuRoute(ScreenType.Login, {
        afterLogin: (messages: any) =>
          new MainMenuRoute(ScreenType.QuickGame, { messages }),
      });
      if (!this.form) await this.controller?.popScreen();
      this.rootController.joinGame(
        ev.gameId,
        ev.timestamp,
        ev.gservUrl,
        user,
        true,
        false,
        route,
      );
    } catch (e) {
      this.leaveQueue();
      if (!this.wolCon.isOpen()) return;
      this.handleError(e, this.strings.get("WOL:MatchTimeout"), {
        fatal: false,
      });
    }
  };

  onWolClose = () => {
    this.updateQueueState(QueueState.None);
  };

  onWolConLost = (e: any) => {
    this.handleError(e, this.strings.get("TXT_YOURE_DISCON"), { fatal: true });
  };

  handlePartyUpdate = (text: string) => {
    const parts = text.split(" ");
    var code = parts[0];
    if (code === PC.RPL_PARTY_INVITE) {
      console.log(`Party invite received from ${parts[1]}`);
      var from = parts[1];
      if (!from) {
        console.warn("Party invite received but inviter name is missing");
        return;
      }
      if (this.queueState !== QueueState.None) {
        this.wolCon.partyDecline(from);
        console.warn(
          `Ignoring party invite from ${from}: currently in queue`,
        );
        return;
      }
      if (this.partyState.partyId)
        console.warn(`Ignoring party invite from ${from}: already in a party`);
      else this.showInviteDialog(from);
      return;
    }
    if (code === PC.RPL_PARTY_UPDATE) {
      var partyId = parts[1];
      const names = parts[2]?.split(",") || [];
      var status =
        parts[3] === PartyStatus.Queued ? PartyStatus.Queued : PartyStatus.Idle;
      const hostReady = "1" === parts[4];
      const guestReady = "1" === parts[5];
      var members = names.map((name, i) => ({
        name,
        ready: 0 === i ? hostReady : guestReady,
      }));
      const me = this.wolCon.getCurrentUser();
      if (void 0 === me) return;
      const meIdx = names.indexOf(me);
      const myReady = members[meIdx]?.ready ?? false;
      const teammateWants =
        (members[1 - meIdx]?.ready ?? false) &&
        !myReady &&
        status !== PartyStatus.Queued;
      if (teammateWants && !this.playButtonFlashing)
        this.chatUi?.addSystemMessage(
          this.strings.get("GUI:TeammateWantsToStart"),
        );
      this.playButtonFlashing = teammateWants;
      this.partyState = { partyId, members, status };
      const sizeChanged = 2 !== this.partySize;
      this.partySize = names.length;
      if (
        2 === this.partySize &&
        this.queueOpts.type !== LadderQueueType.Team2v2
      ) {
        if (sizeChanged) this.savePrePartyQueueType();
        this.queueOpts.type = LadderQueueType.Team2v2;
      }
      this.updatePartyUI();
      if (this.queueState === QueueState.WaitingForMatch)
        this.updateSidebarText(
          this.isWaitingForTeammate()
            ? this.strings.get("GUI:WaitingForTeammate")
            : this.strings.get("TXT_SEARCHING_FOR", this.queueOpts.type),
        );
      return;
    }
    if (code === PC.RPL_PARTY_LEFT) {
      const who = parts[1];
      this.leaveQueue();
      this.restorePrePartyQueueType();
      this.resetPartyState();
      this.updatePartyUI();
      const me = this.wolCon.getCurrentUser();
      if (!me) return;
      if (who === me)
        this.chatUi?.addSystemMessage(this.strings.get("GUI:PartyLeft"));
      else if (who) {
        this.chatUi?.addSystemMessage(
          this.strings.get("GUI:PartyMemberLeft", who),
        );
        this.messageBoxApi.show(
          this.strings.get("GUI:PartyDisbanded"),
          this.strings.get("GUI:OK"),
        );
      }
      return;
    }
    if (code === PC.RPL_PARTY_INVITE_DECLINED) {
      this.chatUi?.addSystemMessage(
        this.strings.get("GUI:PartyInviteDeclinedBy", parts[1]),
      );
      return;
    }
    if (code === PC.RPL_PARTY_INVITE_EXPIRED) {
      this.chatUi?.addSystemMessage(
        this.strings.get("GUI:PartyInviteExpired"),
      );
      return;
    }
    if (code === PC.RPL_PARTY_INVITE_SENT) {
      this.chatUi?.addSystemMessage(
        this.strings.get("GUI:PartyInviteSent", parts[1]),
      );
      return;
    }
    if (code === PC.RPL_PARTY_FORMED) {
      this.chatUi?.addSystemMessage(
        this.strings.get("GUI:PartyFormedWith", parts[1]),
      );
      this.sound.play(SoundKey.PartyFormed, ChannelType.Ui);
      return;
    }
    if (code === PC.RPL_PARTY_INVITE_PREVENTION) {
      if ("1" === parts[2])
        this.chatUi?.addSystemMessage(
          this.strings.get(
            "GUI:PartyInvitePreventionEnabled",
            parts[1],
          ),
        );
      return;
    }
    if (code === PC.RPL_PARTY_INVITE_ERROR) {
      const err = parts[1];
      const who = parts[2];
      switch (err) {
        case PC.ERR_TARGET_IN_PARTY:
          this.chatUi?.addSystemMessage(
            this.strings.get("GUI:PartyInviteAlreadyInParty", who),
          );
          break;
        case PC.ERR_TARGET_IN_QUEUE:
          this.chatUi?.addSystemMessage(
            this.strings.get("GUI:PartyInviteInQueue", who),
          );
          break;
        case PC.ERR_INVITER_IN_PARTY:
        case PC.ERR_ACCEPTER_IN_PARTY:
          this.chatUi?.addSystemMessage(
            this.strings.get("GUI:PartyInviteYouInParty"),
          );
          break;
        case PC.ERR_INVITE_PREVENTED:
          this.chatUi?.addSystemMessage(
            this.strings.get("GUI:PartyInvitePrevented", who),
          );
          break;
        case PC.ERR_TARGET_NO_INVITES:
          this.chatUi?.addSystemMessage(
            this.strings.get("GUI:PartyInviteNoInvites", who),
          );
          break;
        case PC.ERR_INVITE_ALREADY_PENDING:
          this.chatUi?.addSystemMessage(
            this.strings.get("GUI:PartyInviteAlreadyPending", who),
          );
          break;
        case PC.ERR_NO_INVITE:
          this.chatUi?.addSystemMessage(
            this.strings.get("GUI:PartyInviteNoInvite"),
          );
          break;
        case PC.ERR_TARGET_NOT_IN_QUICK_MATCH:
          this.chatUi?.addSystemMessage(
            this.strings.get("GUI:PartyInviteNotInQuickMatch", who),
          );
          break;
        case PC.ERR_TARGET_SELF:
          this.chatUi?.addSystemMessage(
            this.strings.get("GUI:PartyInviteTargetSelf"),
          );
          break;
        case PC.ERR_INVITER_FRESH_ACCOUNT:
          this.chatUi?.addSystemMessage(
            this.strings.get("GUI:PartyInviteInviterFreshAccount"),
          );
          break;
        default:
          this.chatUi?.addSystemMessage(
            this.strings.get("GUI:PartyInviteFailed", who),
          );
      }
    }
  };

  async onEnter(params?: any): Promise<void> {
    this.updateQueueState(QueueState.None);
    this.resetPartyState();
    var countryPref = this.localPrefs.getItem(StorageKey.LastPlayerCountry);
    var colorPref = this.localPrefs.getItem(StorageKey.LastPlayerColor);
    var rankedPref = this.localPrefs.getItem(StorageKey.LastQueueRanked);
    var typePref = this.localPrefs.getItem(StorageKey.LastQueueType);
    var noInvitesPref = this.localPrefs.getItem(StorageKey.PartyNoInvites);
    this.noInvites = "1" === noInvitesPref;
    if (
      void 0 !== countryPref &&
      Number(countryPref) < this.getAvailablePlayerCountries().length
    )
      countryPref = Number(countryPref);
    else countryPref = RANDOM_COUNTRY_ID;
    if (
      void 0 !== colorPref &&
      Number(colorPref) < this.getAvailablePlayerColors().length
    )
      colorPref = Number(colorPref);
    else colorPref = RANDOM_COLOR_ID;
    var ranked =
      void 0 === rankedPref ||
      !this.unrankedEnabled ||
      Boolean(Number(rankedPref));
    var queueType =
      void 0 !== typePref && Object.values(LadderQueueType).includes(typePref)
        ? typePref
        : LadderQueueType.Solo1v1;
    this.queueOpts = {
      type: queueType,
      ranked,
      countryId: countryPref,
      colorId: colorPref,
    };
    this.playerProfile = void 0;
    this.controller.toggleMainVideo(false);
    if (!(this.wolService.isConnected() && this.wolCon.getCurrentUser())) {
      this.controller.goToScreen(ScreenType.Login, {
        afterLogin: (messages: any) =>
          new MainMenuRoute(ScreenType.QuickGame, { messages }),
      });
      return;
    }
    this.wolConfig = this.wolService.getConfig();
    this.wolCon.onClose.subscribe(this.onWolClose);
    this.disposables.add(() => this.wolCon.onClose.unsubscribe(this.onWolClose));
    this.wolService.onWolConnectionLost.subscribe(this.onWolConLost);
    this.disposables.add(() =>
      this.wolService.onWolConnectionLost.unsubscribe(this.onWolConLost),
    );
    this.wolCon.onChatMessage.subscribe(this.handleChatMessage);
    this.disposables.add(() =>
      this.wolCon.onChatMessage.unsubscribe(this.handleChatMessage),
    );
    this.wolCon.onLeaveChannel.subscribe(this.handleLeaveChannel);
    this.disposables.add(() =>
      this.wolCon.onLeaveChannel.unsubscribe(this.handleLeaveChannel),
    );
    this.wolCon.onGameStart.subscribe(this.handleGameStart);
    this.disposables.add(() =>
      this.wolCon.onGameStart.unsubscribe(this.handleGameStart),
    );
    this.wolCon.onPartyUpdate.subscribe(this.handlePartyUpdate);
    this.disposables.add(() =>
      this.wolCon.onPartyUpdate.unsubscribe(this.handlePartyUpdate),
    );
    this.disposables.add(() => this.resetPartyState());
    this.wolCon.partyStatus();
    this.wolCon.partyNoInvites(this.noInvites);
    let messages = params.messages;
    this.chatUi = new ChatUi(
      messages,
      (patch: any) => {
        this.form?.applyOptions((o: any) => {
          const prev = o["chatProps"];
          o.chatProps = { ...prev, ...patch };
        });
      },
      this.wolConfig,
      this.wolCon,
      this.wolService,
      this.wladderService,
      this.strings,
      this.sound,
    );
    this.disposables.add(this.chatUi, () => (this.chatUi = void 0));
    this.refreshSidebarButtons();
    this.initView();
    this.updatePartyUI();
    this.requestPlayerProfileRefresh();
    this.wolCon.privmsg(
      [this.wolConfig.getQuickMatchBotName()],
      QM.REQ_LIST_QUEUES,
    );
    this.updateStatsIntervalId = setInterval(() => {
      this.wolCon.privmsg(
        [this.wolConfig.getQuickMatchBotName()],
        QM.REQ_LIST_QUEUES,
      );
    }, 30000);
    let cts = new CancellationTokenSource();
    this.disposables.add(() => cts.cancel());
    const cancel = cts.token;
    try {
      await this.chatUi.loadChannel(cancel);
    } catch (e) {
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
      messages.push({ text: message });
    }
  }

  resetPartyState(): void {
    this.partyState = this.getInitialPartyState();
    this.partySize = 1;
    this.playButtonFlashing = false;
    this.prePartyQueueType = void 0;
  }

  isWaitingForTeammate(): boolean {
    return (
      !!this.partyState.partyId &&
      2 === this.partySize &&
      !this.partyState.members.every((m: any) => m.ready)
    );
  }

  savePrePartyQueueType(): void {
    if (this.queueOpts.type !== LadderQueueType.Team2v2)
      this.prePartyQueueType = this.queueOpts.type;
  }

  restorePrePartyQueueType(): void {
    if (void 0 !== this.prePartyQueueType) {
      this.queueOpts.type = this.prePartyQueueType;
      this.form?.applyOptions((o: any) => (o.type = this.prePartyQueueType));
      this.prePartyQueueType = void 0;
    }
  }

  getInitialPartyState() {
    return { partyId: void 0, members: [], status: PartyStatus.Idle };
  }

  requestPlayerProfileRefresh(): void {
    this.refreshProfileTask?.cancel();
    this.refreshProfileTask = new Task((cancel) =>
      this.refreshPlayerProfile(this.queueOpts.type, cancel),
    );
    this.refreshProfileTask.start().catch((e) => {
      if (!(e instanceof OperationCanceledError)) console.error(e);
    });
  }

  refreshSidebarButtons(): void {
    this.controller.setSidebarButtons(
      [
        {
          label: this.strings.get("GUI:QuickMatchPlay"),
          tooltip: this.strings.get("GUI:FindAGame"),
          disabled: this.queueState !== QueueState.None,
          flashing: this.playButtonFlashing,
          onClick: () => {
            if (this.availableQueueTypes.includes(this.queueOpts.type))
              setTimeout(() => void this.joinQueue(), 0);
            else
              this.messageBoxApi.show(
                this.strings.get("WOL:MatchModeUnavail"),
                this.strings.get("GUI:OK"),
              );
          },
        },
        ...(this.partyState.partyId
          ? [
              {
                label: this.strings.get("GUI:LeaveParty"),
                tooltip: this.strings.get("GUI:LeaveParty"),
                onClick: () => {
                  this.wolCon.partyLeave();
                },
              },
            ]
          : []),
        ...(this.wladderService.getUrl()
          ? [
              {
                label: this.strings.get("GUI:ViewLadder"),
                tooltip: this.strings.get("GUI:ViewTourLadder"),
                onClick: () => {
                  this.controller?.pushScreen(ScreenType.Ladder, {
                    ladderType: (getLadderTypeForQueueType as any)(
                      this.queueOpts.type,
                      this.partySize,
                    ),
                    highlightPlayer: this.playerProfile,
                  });
                },
              },
            ]
          : []),
        ...(this.controller?.hasScreen(ScreenType.LadderRules)
          ? [
              {
                label: this.strings.get("GUI:ViewRules"),
                onClick: () => {
                  this.controller?.pushScreen(ScreenType.LadderRules);
                },
              },
            ]
          : []),
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
                      new MainMenuRoute(ScreenType.QuickGame, { messages }),
                  });
                },
              },
            ]
          : []),
        {
          label:
            this.queueState === QueueState.None
              ? this.strings.get("GUI:Back")
              : this.strings.get("GUI:Cancel"),
          isBottom: true,
          onClick: () => {
            if (this.queueState === QueueState.None) {
              this.wolService.closeWolConnection();
              this.controller?.goToScreen(ScreenType.Home);
            } else this.leaveQueue();
          },
        },
      ],
      true,
    );
    this.controller.showSidebarButtons();
  }

  updateSidebarText(text: string): void {
    this.controller.setSidebarMpContent({ text });
  }

  initView(): void {
    var [el] = this.jsxRenderer.render(
      jsx(HtmlView as any, {
        width: "100%",
        height: "100%",
        component: QuickGameForm,
        innerRef: (e: any) => (this.form = e),
        props: {
          strings: this.strings,
          disabled: this.queueState !== QueueState.None,
          countryUiNames: new Map(
            (
              [
                [RANDOM_COUNTRY_NAME, (gameOpts as any).RANDOM_COUNTRY_UI_NAME],
              ] as any[]
            ).concat(
              this.getAvailablePlayerCountryRules().map((c: any) => [c.name, c.uiName]),
            ) as any,
          ),
          countryUiTooltips: new Map(
            (
              [
                [RANDOM_COUNTRY_NAME, (gameOpts as any).RANDOM_COUNTRY_UI_TOOLTIP],
              ] as any[]
            ).concat(
              this.getAvailablePlayerCountryRules()
                .filter((c: any) => c.uiTooltip)
                .map((c: any) => [c.name, c.uiTooltip]),
            ) as any,
          ),
          availableTypes: Object.values(LadderQueueType),
          enabledTypes: this.availableQueueTypes,
          availableColors: [RANDOM_COLOR_NAME].concat(
            this.getAvailablePlayerColors(),
          ),
          availableCountries: [RANDOM_COUNTRY_NAME].concat(
            this.getAvailablePlayerCountries(),
          ),
          color: this.getColorNameById(this.queueOpts.colorId),
          country: this.getCountryNameById(this.queueOpts.countryId),
          type: this.queueOpts.type,
          ranked: this.queueOpts.ranked,
          unrankedEnabled: this.unrankedEnabled,
          playerName: this.wolCon.getCurrentUser() ?? "",
          playerProfile: this.playerProfile,
          chatProps: this.chatUi.getViewProps(),
          partyState: this.partyState.partyId ? this.partyState : void 0,
          partySize: this.partySize,
          noInvites: this.noInvites,
          onNoInvitesChange: (v: boolean) => {
            this.noInvites = v;
            this.form?.applyOptions((o: any) => (o.noInvites = v));
            this.localPrefs.setItem(
              StorageKey.PartyNoInvites,
              v ? "1" : "0",
            );
            this.wolCon.partyNoInvites(v);
          },
          onCountrySelect: (name: string) => {
            var id = this.getCountryIdByName(name);
            this.queueOpts.countryId = id;
            this.form?.applyOptions((o: any) => {
              o.country = name;
            });
            if (id !== RANDOM_COUNTRY_ID)
              this.localPrefs.setItem(
                StorageKey.LastPlayerCountry,
                String(id),
              );
            else this.localPrefs.removeItem(StorageKey.LastPlayerCountry);
          },
          onColorSelect: (name: string) => {
            var id = this.getColorIdByName(name);
            this.queueOpts.colorId = id;
            this.form?.applyOptions((o: any) => {
              o.color = name;
            });
            if (id !== RANDOM_COLOR_ID)
              this.localPrefs.setItem(StorageKey.LastPlayerColor, String(id));
            else this.localPrefs.removeItem(StorageKey.LastPlayerColor);
          },
          onRankedChange: (v: boolean) => {
            this.queueOpts.ranked = v;
            this.form?.applyOptions((o: any) => (o.ranked = v));
            this.localPrefs.setItem(
              StorageKey.LastQueueRanked,
              String(Number(v)),
            );
          },
          onTypeChange: (type: any) => {
            if (this.partySize > teamSizes.get(type)) return;
            if (this.queueOpts.type === type) return;
            this.queueOpts.type = type;
            this.playerProfile = void 0;
            this.form?.applyOptions((o: any) => {
              o.type = type;
              o.playerProfile = void 0;
            });
            this.localPrefs.setItem(StorageKey.LastQueueType, type);
            if (this.form) this.requestPlayerProfileRefresh();
          },
        },
      }),
    );
    this.controller.setMainComponent(el);
  }

  async refreshPlayerProfile(type: any, cancel: any): Promise<void> {
    if (!this.wladderService.getUrl()) return;
    const user = this.wolCon.getCurrentUser();
    if (!user) return;
    const ladderType = (getLadderTypeForQueueType as any)(type, this.partySize);
    // 孪生：先接局部变量，仅在拿到结果且未取消时才写回 this.playerProfile
    const [profile] = await this.wladderService.listSearch(
      [user],
      cancel,
      ladderType,
      WLadderService.CURRENT_SEASON,
      this.clientLocale,
    );
    if (profile && !cancel.isCancelled()) {
      this.playerProfile = profile;
      this.form?.applyOptions((o: any) => (o.playerProfile = this.playerProfile));
    }
  }

  getAvailablePlayerCountryRules() {
    return this.rules.getMultiplayerCountries();
  }

  getAvailablePlayerCountries() {
    return this.getAvailablePlayerCountryRules().map((c: any) => c.name);
  }

  getCountryNameById(id: any): string {
    let name;
    if (id === RANDOM_COUNTRY_ID) name = RANDOM_COUNTRY_NAME;
    else name = this.getAvailablePlayerCountries()[id];
    return name;
  }

  getCountryIdByName(name: string): any {
    let id;
    if (name === RANDOM_COUNTRY_NAME) id = RANDOM_COUNTRY_ID;
    else {
      let list = this.getAvailablePlayerCountries();
      id = list.indexOf(name);
    }
    return id;
  }

  getAvailablePlayerColors() {
    return [...this.rules.getMultiplayerColors().values()].map((c: any) =>
      c.asHexString(),
    );
  }

  getColorNameById(id: any): string {
    let name;
    if (id === RANDOM_COLOR_ID) name = RANDOM_COLOR_NAME;
    else name = this.getAvailablePlayerColors()[id];
    return name;
  }

  getColorIdByName(name: string): any {
    let id;
    if (name === RANDOM_COLOR_NAME) id = RANDOM_COLOR_ID;
    else {
      let list = this.getAvailablePlayerColors();
      id = list.indexOf(name);
      if (-1 === id)
        throw new Error(`Color ${name} not found in available player colors`);
    }
    return id;
  }

  async joinQueue(): Promise<void> {
    if (this.queueState !== QueueState.None) return;
    this.quickMatchChannelName = void 0;
    this.updateSidebarText(this.strings.get("WOL:RequestingMatch") + "...");
    this.updateQueueState(QueueState.Initializing);
    try {
      var channel = `#Lob ${this.wolConfig.getQuickMatchChannelId(this.queueOpts.type)} 0`;
      await this.wolCon.joinChannel(
        channel,
        this.wolConfig.getGlobalChannelPass(),
      );
      if ((this.queueState as QueueState) !== QueueState.Initializing) return;
      this.quickMatchChannelName = channel;
      let { countryId, colorId } = this.queueOpts;
      var body =
        QM.REQ_MATCH +
        " " +
        [
          [QM.TAG_COUNTRY, countryId],
          [QM.TAG_COLOR, colorId],
          [QM.TAG_VERSION, this.engineVersion],
          [QM.TAG_MODHASH, this.engineModHash],
          [QM.TAG_RANKED, Number(this.queueOpts.ranked)],
        ]
          .map((pair) => pair.join("="))
          .join(", ");
      this.wolCon.privmsg([this.wolConfig.getQuickMatchBotName()], body);
    } catch (e) {
      if (
        e instanceof WolError &&
        e.code === (WolError as any).Code.BadChannelPass
      )
        this.handleError(e, this.strings.get("WOL:MatchModeUnavail"), {
          fatal: false,
        });
      else
        this.handleError(e, this.strings.get("WOL:MatchBadParameters"), {
          fatal: true,
        });
    }
  }

  leaveQueue(): void {
    if (this.queueState === QueueState.None) return;
    this.updateQueueState(QueueState.None);
    if (this.wolCon.isOpen() && this.quickMatchChannelName) {
      this.wolCon.leaveChannel(this.quickMatchChannelName);
      this.quickMatchChannelName = void 0;
    }
  }

  updateQueueState(state: QueueState): void {
    this.queueState = state;
    if (this.gameStartTimeoutId) {
      clearTimeout(this.gameStartTimeoutId);
      this.gameStartTimeoutId = void 0;
    }
    if (this.countdownIntervalId) {
      clearInterval(this.countdownIntervalId);
      this.countdownIntervalId = void 0;
    }
    if (this.updateStatsIntervalId) {
      clearInterval(this.updateStatsIntervalId);
      this.updateStatsIntervalId = void 0;
    }
    if (this.form) {
      this.form.applyOptions(
        (o: any) => (o.disabled = state !== QueueState.None),
      );
      this.refreshSidebarButtons();
    }
    if (state === QueueState.None) {
      this.updateSidebarText("");
      return;
    }
    if (state === QueueState.WaitingForGameStart)
      this.gameStartTimeoutId = setTimeout(async () => {
        console.log("Timed out. Rejoining queue...");
        this.leaveQueue();
        if (this.wolCon.isOpen()) void this.joinQueue();
      }, 10000);
    if (state === QueueState.WaitingForStartTimer)
      this.countdownIntervalId = setInterval(
        () => void this.tickStartTimer(),
        1000,
      );
    if (state === QueueState.WaitingForMatch)
      this.updateStatsIntervalId = setInterval(() => this.requestStats(), 5000);
    let text: string | undefined;
    switch (state) {
      case QueueState.WaitingForMatch:
        text = this.isWaitingForTeammate()
          ? this.strings.get("GUI:WaitingForTeammate")
          : this.strings.get("TXT_SEARCHING_FOR", this.queueOpts.type);
        break;
      case QueueState.WaitingForStartTimer:
        text = this.strings.get(
          "WOL:MatchStartSeconds",
          this.countdownSeconds,
        );
        break;
      case QueueState.WaitingForGameStart:
        text = this.strings.get("WOL:MatchGameStarting");
    }
    if (void 0 !== text) {
      this.updateSidebarText(text);
      console.log(text);
    }
  }

  async tickStartTimer(): Promise<void> {
    if (void 0 === this.countdownSeconds)
      throw new Error("Game start countdown should be set by now");
    if (0 < this.countdownSeconds) {
      this.countdownSeconds--;
      this.updateSidebarText(
        this.strings.get("WOL:MatchStartSeconds", this.countdownSeconds),
      );
      this.sound.play(SoundKey.QuickMatchTimer, ChannelType.Ui);
    } else this.updateQueueState(QueueState.WaitingForGameStart);
  }

  requestStats(): void {
    if (this.queueState === QueueState.WaitingForMatch)
      this.wolCon.privmsg(
        [this.wolConfig.getQuickMatchBotName()],
        QM.REQ_STATS,
      );
  }

  async onUnstack(): Promise<void> {
    this.refreshSidebarButtons();
    this.initView();
    if (this.wolService.isConnected() && this.wolCon.getCurrentUser())
      this.wolCon.privmsg(
        [this.wolConfig.getQuickMatchBotName()],
        QM.REQ_LIST_QUEUES,
      );
    else
      this.controller.goToScreen(ScreenType.Login, {
        afterLogin: (messages: any) =>
          new MainMenuRoute(ScreenType.QuickGame, { messages }),
      });
    this.requestPlayerProfileRefresh();
    this.updatePartyUI();
  }

  async onStack(): Promise<void> {
    await this.unrender();
  }

  async onLeave(): Promise<void> {
    this.updateQueueState(QueueState.None);
    if (this.refreshProfileTask) {
      this.refreshProfileTask.cancel();
      this.refreshProfileTask = void 0;
    }
    this.disposables.dispose();
    if (this.wolCon.isOpen() && this.quickMatchChannelName)
      this.wolCon.leaveChannel(this.quickMatchChannelName);
    await this.unrender();
  }

  async unrender(): Promise<void> {
    if (this.availQueueRefreshIntervalId) {
      clearInterval(this.availQueueRefreshIntervalId);
      this.availQueueRefreshIntervalId = void 0;
    }
    this.form = void 0;
    await this.controller.hideSidebarButtons();
  }

  showInviteDialog(from: string): void {
    if (this.pendingInvite) clearTimeout(this.pendingInvite.timeoutId);
    this.destroyInviteDialog();
    var showPrevention = this.userHasDeclinedInvitesFrom.has(from);
    const clearPending = () => {
      if (this.pendingInvite) {
        clearTimeout(this.pendingInvite.timeoutId);
        this.pendingInvite = void 0;
      }
    };
    var timeout = setTimeout(() => {
      this.pendingInvite = void 0;
      this.destroyInviteDialog();
    }, 30000);
    this.pendingInvite = { from, timeoutId: timeout };
    this.sound.play(SoundKey.PartyInvite, ChannelType.Ui);
    let [view] = this.jsxRenderer.render(
      jsx(HtmlView as any, {
        component: PartyInviteDialog,
        props: {
          inviterName: from,
          strings: this.strings,
          showPreventionCheckbox: showPrevention,
          viewport: this.uiScene.viewport,
          onAccept: () => {
            clearPending();
            this.destroyInviteDialog();
            this.leaveQueue();
            this.userHasDeclinedInvitesFrom.delete(from);
            this.wolCon.partyAccept(from);
          },
          onDecline: (prevent: boolean) => {
            clearPending();
            this.destroyInviteDialog();
            this.wolCon.partyDecline(from);
            this.userHasDeclinedInvitesFrom.add(from);
            if (prevent) this.wolCon.partyPrevent(from, true);
          },
        },
      }),
    );
    this.inviteDialog = view;
    this.uiScene.add(view);
    this.disposables.add(
      view,
      () => this.uiScene.remove(view),
      () => (this.inviteDialog = void 0),
    );
  }

  destroyInviteDialog(): void {
    if (this.inviteDialog) {
      this.inviteDialog.destroy();
      this.inviteDialog = void 0;
    }
  }

  updatePartyUI(): void {
    if (this.form)
      this.form.applyOptions((o: any) => {
        o.partyState = this.partyState;
        o.partySize = this.partySize;
        o.type = this.queueOpts.type;
      });
    this.refreshSidebarButtons();
  }

  handleError(e: any, message: string, { fatal }: { fatal: boolean }): void {
    this.updateQueueState(QueueState.None);
    this.errorHandler.handle(e, message, () => {
      if (fatal) {
        this.wolService.closeWolConnection();
        this.controller?.goToScreen(ScreenType.Home);
      }
    });
  }
}
