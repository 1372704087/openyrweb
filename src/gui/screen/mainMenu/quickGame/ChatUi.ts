/**
 * ChatUi — 快速游戏聊天辅助类（频道、系统消息、军衔刷新）。
 *
 * refreshPlayerRanks 保留孪生 Throttle(5000) 装饰
 * （类声明后手动等价 __decorate 调用，防止每条频道消息都发 wladder 请求）。
 *
 * 由 gui/screen/mainMenu/quickGame/ChatUi.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { OperationCanceledError } from "@puzzl/core/lib/async/cancellation"; // 已转换
import { MAX_LIST_SEARCH_COUNT } from "network/ladder/wladderConfig"; // 已转换
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { ChatRecipientType } from "network/chat/ChatMessage"; // 已转换
import { SoundKey } from "engine/sound/SoundKey"; // 已转换
import { ChannelType } from "engine/sound/ChannelType"; // 已转换
import { Task } from "@puzzl/core/lib/async/Task"; // 已转换
import { ChatHistory } from "gui/chat/ChatHistory"; // 已转换
import { IMPLICIT_CHANNEL_NAME } from "gui/component/ChatInput"; // 已转换
import { Throttle } from "util/time"; // 孪生 __decorate 用的节流装饰器

/* eslint-disable @typescript-eslint/no-explicit-any */

export class ChatUi {
  /** 消息列表（可被 dispose 重置）。 */
  messages: any[];
  /** 视图刷新回调。 */
  updateView: (patch?: any) => void;
  /** WOL 配置。 */
  wolConfig: any;
  /** WOL 连接。 */
  wolCon: any;
  /** WOL 服务。 */
  wolService: any;
  /** 天梯服务。 */
  wladderService: any;
  /** i18n。 */
  strings: any;
  /** 音效。 */
  sound: any;
  /** 清理器。 */
  disposables = new CompositeDisposable();
  /** 频道用户。 */
  users: any[] = [];
  /** 当前频道。 */
  channelName?: string;
  /** 聊天历史。 */
  chatHistory = new ChatHistory();
  /** 玩家档案。 */
  playerProfiles = new Map<string, any>();
  /** 军衔刷新任务。 */
  ranksUpdateTask?: any;

  constructor(
    messages: any[],
    updateView: (patch?: any) => void,
    wolConfig: any,
    wolCon: any,
    wolService: any,
    wladderService: any,
    strings: any,
    sound: any,
  ) {
    this.messages = messages;
    this.updateView = updateView;
    this.wolConfig = wolConfig;
    this.wolCon = wolCon;
    this.wolService = wolService;
    this.wladderService = wladderService;
    this.strings = strings;
    this.sound = sound;
  }

  /** 加入/离开频道时更新用户与系统消息。 */
  onChannelJoinLeave = (ev: any) => {
    let channel = ev.channel;
    let m = channel.match(/#Lob (\d+) (\d)/i);
    if (m) {
      var [, channelId, lobbyIdx] = m.map(Number);
      if (this.wolConfig.getAllQuickMatchChannelIds().includes(channelId))
        return;
      channel = this.strings.get("TXT_LOB_" + (lobbyIdx + 1));
    }
    if (ev.user.name === this.wolCon.getCurrentUser())
      this.addSystemMessage(
        this.strings.get(
          "join" === ev.type ? "TXT_JOINED_S" : "TXT_YOULEFT",
          channel,
        ),
      );
    else if (ev.channel === this.channelName) {
      let idx;
      if ("join" === ev.type) {
        this.users.push(ev.user);
        this.users.sort((a, b) => Number(b.operator) - Number(a.operator));
      } else if (-1 !== (idx = this.users.findIndex((u) => u.name === ev.user.name)))
        this.users.splice(idx, 1);
      this.updateView();
      this.refreshPlayerRanks();
    }
  };

  /** 频道用户全量替换。 */
  onChannelUsers = (ev: any) => {
    if (ev.channelName === this.channelName) {
      this.users = ev.users;
      this.updateView({ users: this.users });
      this.refreshPlayerRanks();
    }
  };

  /** 聊天消息入队 + 私聊音效。 */
  onChannelMessage = (msg: any) => {
    if (
      [msg.from, msg.to.name].includes(this.wolConfig.getQuickMatchBotName())
    )
      return;
    if (
      msg.to.type !== ChatRecipientType.Page &&
      msg.to.type !== ChatRecipientType.Whisper
    ) {
      /* 仅私聊/页消息播提示 */
    } else
      this.sound.play(SoundKey.IncomingMessage, ChannelType.Ui);
    const enriched = {
      ...msg,
      operator: this.users.find((u) => u.name === msg.from)?.operator,
    };
    this.messages.push(enriched);
    this.updateView();
    if (
      msg.to.type === ChatRecipientType.Whisper &&
      msg.to.name !== this.wolCon.getServerName() &&
      msg.from !== this.wolCon.getCurrentUser()
    )
      this.chatHistory.lastWhisperFrom.value = msg.from;
  };

  /** 加入快速匹配公共频道。 */
  async loadChannel(cancel: any): Promise<void> {
    this.channelName = void 0;
    this.users = [];
    this.wolCon.onJoinChannel.subscribe(this.onChannelJoinLeave);
    this.wolCon.onLeaveChannel.subscribe(this.onChannelJoinLeave);
    this.wolCon.onChannelUsers.subscribe(this.onChannelUsers);
    this.wolCon.onChatMessage.subscribe(this.onChannelMessage);
    let config = this.wolService.getConfig();
    var name = `#Lob ${config.getClientChannelType()} 0`;
    await this.wolCon.joinChannel(name, config.getGlobalChannelPass());
    if (cancel.isCancelled()) {
      if (this.wolCon.isOpen()) this.wolCon.leaveChannel(name);
    } else {
      this.channelName = name;
      this.playerProfiles.clear();
      this.updateView({ channels: [name], users: this.users });
    }
  }

  /** 给 QuickGameForm 的 chat props。 */
  getViewProps() {
    return {
      strings: this.strings,
      messages: this.messages,
      chatHistory: this.chatHistory,
      channels: this.channelName ? [this.channelName] : [],
      localUsername: this.wolCon.getCurrentUser(),
      users: this.users,
      playerProfiles: this.playerProfiles,
      onSendMessage: (msg: any) => {
        if (!msg.value.length)
          this.addSystemMessage(this.strings.get("TXT_ENTER_MESSAGE"));
        else if (
          msg.recipient.type === ChatRecipientType.Channel &&
          msg.recipient.name === IMPLICIT_CHANNEL_NAME
        )
          this.addSystemMessage(this.strings.get("TXT_NOT_IN_CHAN"));
        else if (this.wolCon.isOpen()) {
          this.wolCon.sendChatMessage(msg.value, msg.recipient);
          if (msg.recipient.type === ChatRecipientType.Whisper)
            this.chatHistory.lastWhisperTo.value = msg.recipient.name;
        }
      },
      onInviteToTeam: (user: any) => {
        this.wolCon.partyInvite(user.name);
      },
    };
  }

  /** 系统消息。 */
  addSystemMessage(text: string): void {
    this.messages.push({ text });
    this.updateView();
  }

  /** 批量拉取缺失玩家档案（Throttle 5s 原装饰已剥离）。 */
  refreshPlayerRanks(): void {
    if (this.wladderService.getUrl()) {
      this.ranksUpdateTask?.cancel();
      let task = (this.ranksUpdateTask = new Task(async (cancel) => {
        let missing = this.users
          .map((u) => u.name)
          .filter((n) => !this.playerProfiles.has(n));
        if (missing.length) {
          for (; 0 < missing.length; ) {
            var batch = missing.splice(0, MAX_LIST_SEARCH_COUNT);
            batch = await this.wladderService.listSearch(batch, cancel);
            if (cancel.isCancelled()) return;
            for (const profile of batch)
              this.playerProfiles.set(profile.name, profile);
          }
          this.updateView();
        }
      }));
      task.start().catch((e) => {
        if (!(e instanceof OperationCanceledError)) console.error(e);
      });
    }
  }

  /** 退订并清空状态。 */
  dispose(): void {
    this.disposables.dispose();
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
    this.channelName = void 0;
    this.messages = [];
    this.users = [];
    this.playerProfiles.clear();
  }
}

// 孪生：__decorate([Throttle(5e3)], ChatUi.prototype, "refreshPlayerRanks", null)
// __decorate 末尾有 Object.defineProperty 写回（descriptor 是副本，仅改 .value 不生效）
{
  const desc = Object.getOwnPropertyDescriptor(ChatUi.prototype, "refreshPlayerRanks");
  if (desc) {
    Throttle(5000)(ChatUi.prototype, "refreshPlayerRanks", desc);
    Object.defineProperty(ChatUi.prototype, "refreshPlayerRanks", desc);
  }
}
