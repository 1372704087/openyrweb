/**
 * ChatNetHandler — 订阅 gserv/wol 聊天消息，本地展示与发送路由。
 *
 * 由 gui/screen/game/ChatNetHandler.ts.js 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import * as ChatMessageModule from "network/chat/ChatMessage"; // 孪生
import * as gservConfigModule from "network/gservConfig"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：取命名空间成员
const ChatRecipientType: any = (ChatMessageModule as any).ChatRecipientType;
const RECIPIENT_ALL: any = (gservConfigModule as any).RECIPIENT_ALL;
const RECIPIENT_TEAM: any = (gservConfigModule as any).RECIPIENT_TEAM;

/** 对局聊天网络处理器。 */
export class ChatNetHandler {
  /** gserv 连接。 */
  gservCon: any;
  /** wol 连接。 */
  wolCon: any;
  /** 消息列表。 */
  messageList: any;
  /** 聊天历史。 */
  chatHistory: any;
  /** 消息格式化。 */
  chatMessageFormat: any;
  /** 本地玩家。 */
  localPlayer: any;
  /** 游戏。 */
  game: any;
  /** 回放录制。 */
  replayRecorder: any;
  /** 屏蔽玩家集合。 */
  mutedPlayers: Set<string>;
  /** 释放容器。 */
  disposables = new CompositeDisposable();
  /** 消息回调。 */
  handleMessage: (msg: any) => void;

  /**
   * @param gservCon gserv
   * @param wolCon wol
   * @param messageList 消息列表
   * @param chatHistory 历史
   * @param chatMessageFormat 格式化
   * @param localPlayer 本地玩家
   * @param game 游戏
   * @param replayRecorder 回放录制
   * @param mutedPlayers 屏蔽集
   */
  constructor(
    gservCon: any,
    wolCon: any,
    messageList: any,
    chatHistory: any,
    chatMessageFormat: any,
    localPlayer: any,
    game: any,
    replayRecorder: any,
    mutedPlayers: Set<string>,
  ) {
    this.gservCon = gservCon;
    this.wolCon = wolCon;
    this.messageList = messageList;
    this.chatHistory = chatHistory;
    this.chatMessageFormat = chatMessageFormat;
    this.localPlayer = localPlayer;
    this.game = game;
    this.replayRecorder = replayRecorder;
    this.mutedPlayers = mutedPlayers;
    this.disposables = new CompositeDisposable();
    this.handleMessage = (msg: any) => {
      // 自己发的私聊：直接上色展示并入历史
      if (msg.from === this.localPlayer.name && msg.to.type === ChatRecipientType.Whisper) {
        this.messageList.addChatMessage(
          this.chatMessageFormat.formatPrefixPlain(msg) + " " + msg.text,
          "mediumpurple",
        );
        this.chatHistory.addChatMessage(msg);
        return;
      }
      const prefix = this.chatMessageFormat.formatPrefixPlain(msg);
      let color: string | undefined;
      const isServerPage =
        msg.to.type === ChatRecipientType.Page &&
        (msg.from === this.gservCon.getServerName() || msg.from === this.wolCon.getServerName());
      if (!isServerPage) {
        let who: string;
        if (msg.to.type === ChatRecipientType.Whisper) {
          who = msg.from;
          color = "mediumpurple";
        } else if (
          msg.to.type === ChatRecipientType.Channel &&
          [RECIPIENT_ALL, RECIPIENT_TEAM].includes(msg.to.name)
        ) {
          const player = this.game.getPlayerByName(msg.from);
          who = player.name;
          color = player.color.asHexString();
        } else {
          return;
        }
        if (this.mutedPlayers.has(who)) return;
      } else {
        color = "yellow";
      }
      if (msg.to.type === ChatRecipientType.Channel && msg.to.name === RECIPIENT_ALL) {
        this.replayRecorder.recordChatMessage(this.game.currentTick, msg.from, msg.text);
      }
      this.messageList.addChatMessage(prefix + " " + msg.text, color);
      this.chatHistory.addChatMessage(msg);
      if (
        msg.to.type === ChatRecipientType.Whisper &&
        msg.to.name !== this.wolCon.getServerName() &&
        msg.to.name !== this.gservCon.getServerName()
      ) {
        this.chatHistory.lastWhisperFrom.value = msg.from;
      }
    };
  }

  /** 订阅 wol/gserv 聊天。 */
  init(): void {
    this.wolCon.onChatMessage.subscribe(this.handleMessage);
    this.disposables.add(() => this.wolCon.onChatMessage.unsubscribe(this.handleMessage));
    this.gservCon.onChatMessage.subscribe(this.handleMessage);
    this.disposables.add(() => this.gservCon.onChatMessage.unsubscribe(this.handleMessage));
  }

  /**
   * 发送聊天：单机转 bot；按频道/队伍/私聊路由。
   * @param text 消息正文
   * @param to 收件人 {type,name}
   */
  submitMessage(text: string, to: any): void {
    // 单机模式：无网络连接时，将玩家消息转发给AI Bot
    if (!this.gservCon.isOpen() && !this.wolCon.isOpen()) {
      if (this.game && this.game.botManager && this.game.botManager.dispatchChatMessage) {
        this.game.botManager.dispatchChatMessage(this.localPlayer.name, text);
      }
      // 同时在本地显示玩家自己的消息
      this.messageList.addSystemMessage(
        this.localPlayer.name + ": " + text,
        this.localPlayer.color.asHexString(),
      );
      return;
    }
    if (this.gservCon.isOpen()) {
      if (to.type === ChatRecipientType.Channel && to.name === RECIPIENT_ALL) {
        if (text.startsWith("/")) {
          const user = this.wolCon.getCurrentUser();
          if (this.wolCon.isOpen() && user) this.wolCon.privmsg([user], text);
        } else {
          this.gservCon.sayChannel(text);
        }
      } else if (to.type === ChatRecipientType.Channel && to.name === RECIPIENT_TEAM) {
        const allies = this.game.alliances
          .getAllies(this.localPlayer)
          .filter((p: any) => !p.isAi)
          .map((p: any) => p.name);
        this.gservCon.privmsg([...allies, this.localPlayer.name], text);
      } else if (to.type === ChatRecipientType.Whisper && this.wolCon.isOpen()) {
        this.wolCon.privmsg([to.name], text);
        this.chatHistory.lastWhisperTo.value = to.name;
      }
    } else {
      console.warn("Can't send chat message. Network connection is already closed.");
    }
  }

  /** 释放订阅。 */
  dispose(): void {
    this.disposables.dispose();
  }
}
