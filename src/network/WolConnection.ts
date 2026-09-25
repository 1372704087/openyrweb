/**
 * WolConnection — Westwood Online IRC 协议客户端（房间/游戏/组队命令）。
 *
 * 由 network/WolConnection.ts.js 重写为 TS（行为完全一致；忠实翻译）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 *
 * 关键语义（勿改）：
 * - 导出 WolHasMapStatus 枚举（NoMap/HasMap/MapTransfer）与 WolConnection 类。
 * - 静态：MAX_ROOM_DESC_LEN=64、CHAN_OP_PREFIX="@"。
 * - factory(logger)：包装 IrcConnection(mode:"text", logFilter 脱敏 pass/apgar/join 等)。
 * - handleMessage 按 IRC 动词分发（ping/privmsg/page/notice/join/joingame/part/
 *   kick/gameopt/mode/startg/gserv/数字 RPL）；非字符串 <binary> 直接打日志丢弃。
 * - login 用 replyStart/Body/End + heartbeat RPL_LOGIN_QUEUE；cvers 过旧抛 WolError。
 * - joinChannel/joinGame/createGame 用 replyMatch 正则匹配成功 JOIN/JOINGAME。
 * - listGames 解析 topic 字段并过滤当前客户端类型（modHash 匹配）。
 * - gameOpt 前置校验 currentUser + currentGameChannel。
 * - 所有私有事件用 EventDispatcher，对外 getter 暴露。
 */

import { EventDispatcher } from "util/event"; // 已转换
import { IrcConnection } from "network/IrcConnection"; // 已转换
import { WolError } from "network/WolError"; // 已转换
import { utf16ToBinaryString } from "util/string"; // 已转换
import { Base64 } from "util/Base64"; // 已转换
import { isNotNullOrUndefined } from "util/typeGuard"; // 已转换
import { FileNameEncoder } from "network/gameopt/FileNameEncoder"; // 已转换
import { ChatRecipientType } from "network/chat/ChatMessage"; // 已转换
import * as wolCodes from "network/wolCodes"; // 已转换
import { IrcProtocol } from "network/IrcProtocol"; // 已转换
import { WolLocale } from "network/WolLocale"; // 已转换
import { MATCH_BOT_NAME } from "network/WolConfig"; // 已转换
import { Parser } from "network/gameopt/Parser"; // 已转换
import { WolGameReport } from "network/WolGameReport"; // 已转换
import type { Logger } from "network/Logger"; // 已转换

/** 与 @puzzl/core/lib/regexp.escape 行为一致（本地内联，避免断链 import）。 */
function escape(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 地图状态标志。 */
export enum WolHasMapStatus {
  /** 无地图。 */
  NoMap = 0,
  /** 已有地图。 */
  HasMap = 1,
  /** 正在地图传输。 */
  MapTransfer = 2,
}

/** 聊天消息结构。 */
export interface ChatMessageData {
  from?: string;
  to: { type: ChatRecipientType; name: string };
  text: string;
  time: Date;
}

/** NAMES 应答中的用户条目。 */
export interface ChannelUser {
  name: string;
  operator: boolean;
  fresh: boolean;
  ping: number;
}

/** listGames 解析出的房间摘要。 */
export interface GameListEntry {
  hostName: string;
  hostPing: number;
  hostMuted: boolean;
  name: string;
  description: string;
  modHash: number | string | undefined;
  modName: string | undefined;
  tournament: boolean;
  humanPlayers: number;
  aiPlayers: number;
  maxPlayers: number;
  observers: number;
  observable: boolean;
  mapName: string;
  passLocked: boolean;
  resLocked: boolean;
}

interface IrcReply {
  raw: string;
  code?: number;
  params?: string[];
  time: number;
}

export interface JoinLeavePayload {
  type: "join" | "leave";
  user: { name: string; ping?: number; operator?: boolean; fresh?: boolean };
  channel: string;
}

export interface LoginQueueUpdate {
  position: number;
  avgWaitSeconds: number;
}

export interface GameStartPayload {
  gservUrl: string;
  gameId: string;
  timestamp: number;
}

/** WoL IRC 连接封装。 */
export class WolConnection {
  con: IrcConnection;
  logger: Logger;
  currentChannels = new Set<string>();
  lastChannelOpts = new Map<string, string | undefined>();
  pendingChannelUsers = new Map<string, ChannelUser[]>();
  currentUser: string | undefined;
  serverName: string | undefined;
  currentGameChannel: string | undefined;

  private _onLoginQueueUpdate = new EventDispatcher();
  private _onChatMessage = new EventDispatcher();
  private _onJoinChannel = new EventDispatcher();
  private _onLeaveChannel = new EventDispatcher();
  private _onGameStart = new EventDispatcher();
  private _onGameOpt = new EventDispatcher();
  private _onGameMode = new EventDispatcher();
  private _onGameServer = new EventDispatcher();
  private _onChannelUsers = new EventDispatcher();
  private _onGameReport = new EventDispatcher();
  private _onPartyUpdate = new EventDispatcher();

  get onError() {
    return this.con.onError;
  }
  get onClose() {
    return this.con.onClose;
  }
  get onLoginQueueUpdate() {
    return this._onLoginQueueUpdate;
  }
  get onChatMessage() {
    return this._onChatMessage;
  }
  get onJoinChannel() {
    return this._onJoinChannel;
  }
  get onLeaveChannel() {
    return this._onLeaveChannel;
  }
  get onGameStart() {
    return this._onGameStart;
  }
  get onGameOpt() {
    return this._onGameOpt;
  }
  get onGameMode() {
    return this._onGameMode;
  }
  get onGameServer() {
    return this._onGameServer;
  }
  get onChannelUsers() {
    return this._onChannelUsers;
  }
  get onGameReport() {
    return this._onGameReport;
  }
  get onPartyUpdate() {
    return this._onPartyUpdate;
  }

  /** 描述最大长度。 */
  static readonly MAX_ROOM_DESC_LEN = 64;
  /** 频道 op 前缀。 */
  static readonly CHAN_OP_PREFIX = "@";

  /** 工厂：建带 logFilter 脱敏的 IrcConnection 再包装。 */
  static factory(logger: Logger): WolConnection {
    return new this(
      new IrcConnection(
        {
          mode: "text",
          logFilter: (line: string) =>
            line
              .replace(/((^|\n)(apgar|pass)) ([^ \n]+)/gi, "$1 <redacted>")
              .replace(/^(join [^ ]+) ([^ ]+)/gi, "$1 <redacted>")
              .replace(/^(joingame (([^ ]+ ){2}|([^ ]+ ){8}))([^ ]+)$/gi, "$1<redacted>")
              .replace(
                /^((privmsg|page|notice) ([^ ]+ )+):(.+)\r?\n?$/i,
                (full, prefix: string, _verb: string, _targets: string, body: string) =>
                  body === MATCH_BOT_NAME + " " ? full : prefix + ":<redacted>",
              )
              .replace(
                /^(:([^ ]+) (privmsg|page|notice) ([^ ]+ )+):(.+)\r?\n?$/i,
                (full, lead: string, sender: string) =>
                  // 孪生回传组 1（完整前导 :nick!user@host ...），非组 2 昵称
                  sender.startsWith(MATCH_BOT_NAME + "!") ? full : lead + ":<redacted>",
              ),
        },
        logger as never,
      ),
      logger,
    );
  }

  constructor(con: IrcConnection, logger: Logger) {
    this.con = con;
    this.logger = logger;
    this.handleMessage = (data: string | Uint8Array) => {
      try {
        console.log("[WoL-recv]", typeof data === "string" ? data : "<binary>");
      } catch (_) {
        /* ignore */
      }
      if (typeof data === "string") {
        const parts = data.split(" ");
        if (parts[0].toLowerCase() === "ping") {
          this.con.sendMessage("PONG" + (parts[1] ? " " + parts[1] : ""));
        } else if (parts[1].toLowerCase() === "privmsg") {
          this.handlePrivMsg(data);
        } else if (parts[1].toLowerCase() === "page" || parts[1].toLowerCase() === "notice") {
          this.handlePageOrNotice(data);
        } else if (parts[1].toLowerCase() === "join") {
          this.handleJoin(data);
        } else if (parts[1].toLowerCase() === "joingame") {
          this.handleJoingame(data);
        } else if (parts[1].toLowerCase() === "part") {
          this.handlePart(data);
        } else if (parts[1].toLowerCase() === "kick") {
          this.handleKick(data);
        } else if (parts[1].toLowerCase() === "gameopt") {
          this.handleGameOpt(data);
        } else if (parts[1].toLowerCase() === "mode") {
          this.handleMode(data);
        } else if (parts[1].toLowerCase() === "startg") {
          this.handleStartGame(data);
        } else if (parts[1].toLowerCase() === "gserv") {
          this.handleGserv(data);
        } else {
          const code = Number(parts[1]);
          if (!Number.isNaN(code)) {
            const reply: IrcReply = { raw: data, code, params: parts.slice(2), time: Date.now() };
            if (code === wolCodes.RPL_LOGIN_QUEUE) this.handleLoginQueueUpdate(reply);
            else if (code === wolCodes.RPL_NAMREPLY) this.handleNamReply(reply);
            else if (code === wolCodes.RPL_ENDOFNAMES) this.handleEndOfNames(reply);
            else if (code === wolCodes.RPL_GAME_REPORT) this.handleGameReport(reply);
            else if (code === wolCodes.RPL_PARTY_UPDATE) this.handlePartyUpdate(data);
            else this.handleIrcError(data);
          }
        }
      }
    };
    this.handleClose = () => {
      this.currentUser = undefined;
      this.currentGameChannel = undefined;
      this.currentChannels.clear();
      this.pendingChannelUsers.clear();
      this.con.onMessage.unsubscribe(this.handleMessage);
    };
  }

  handleMessage: (data: string | Uint8Array) => void;
  handleClose: () => void;

  getCurrentUser(): string | undefined {
    return this.currentUser;
  }

  getCurrentChannels(): string[] {
    return [...this.currentChannels];
  }

  isInChannel(channel: string): boolean {
    return this.currentChannels.has(channel);
  }

  getServerName(): string | undefined {
    return this.serverName;
  }

  async connect(url: string, options?: Parameters<IrcConnection["connect"]>[1]): Promise<void> {
    this.con.onMessage.subscribe(this.handleMessage);
    this.con.onClose.subscribeOnce(this.handleClose);
    await this.con.connect(url, options);
  }

  close(): void {
    this.con.onMessage.unsubscribe(this.handleMessage);
    this.con.close();
  }

  isOpen(): boolean {
    return this.con.isOpen();
  }

  ping(timeout?: number): Promise<number> {
    return this.con.ping(timeout);
  }

  async cvers(version: string, sku: number): Promise<void> {
    const replies = await this.con.sendCommand(`cvers ${version} ` + sku, {
      replyCodes: [wolCodes.RPL_CVERS_OK, wolCodes.RPL_CVERS_OUTDATED],
    });
    if (replies[0].code === wolCodes.RPL_CVERS_OUTDATED) {
      const reason = replies[0].params
        ? replies[0].params.splice(1).join(" ").replace(/^:/, "")
        : "unknown";
      throw new WolError("Cvers error: " + reason, WolError.Code.OutdatedClient);
    }
  }

  async login(
    nick: string,
    password: string,
    onQueueUpdate?: (data: LoginQueueUpdate) => void,
  ): Promise<string[]> {
    if (onQueueUpdate) this._onLoginQueueUpdate.subscribe(onQueueUpdate);
    const replies = await this.con
      .sendCommand(
        [
          "pass " + Base64.encode(password),
          "nick " + nick,
          "user UserName HostName irc.westwood.com :RealName",
        ].join("\r\n"),
        {
          replyCodes: [wolCodes.RPL_BAD_LOGIN, wolCodes.ERR_YOUREBANNEDCREEP, wolCodes.ERR_SERVER_FULL],
          replyStartCode: wolCodes.RPL_MOTDSTART,
          replyBodyCodes: [wolCodes.RPL_MOTD],
          replyEndCode: wolCodes.RPL_ENDOFMOTD,
          replyHeartbeatCodes: [wolCodes.RPL_LOGIN_QUEUE],
          heartbeatTimeout: Number.POSITIVE_INFINITY,
        },
      )
      .finally(() => {
        if (onQueueUpdate) this._onLoginQueueUpdate.unsubscribe(onQueueUpdate);
      });
    if (replies.length === 1) {
      const reason = replies[0].params
        ? replies[0].params.splice(2).join(" ").replace(/^:/, "")
        : "unknown";
      if (replies[0].code === wolCodes.RPL_BAD_LOGIN)
        throw new WolError("Login error: " + reason, WolError.Code.BadLogin);
      if (replies[0].code === wolCodes.ERR_YOUREBANNEDCREEP)
        throw new WolError("Login error: " + reason, WolError.Code.BannedFromServer, reason);
      if (replies[0].code === wolCodes.ERR_SERVER_FULL)
        throw new WolError("Login error: " + reason, WolError.Code.ServerFull);
    }
    this.currentUser = nick;
    this.serverName = replies[0].raw.match(/^:([^\s]+)/)?.[1] || "";
    return replies.slice(0, -1).map((reply) => reply.raw.replace(/^.*:- /, ""));
  }

  async setLocale(code: number): Promise<void> {
    await this.con.sendCommand("setlocale " + code, { replyCodes: [wolCodes.RPL_SET_LOCALE] });
  }

  async getLocale(): Promise<WolLocale> {
    if (!this.currentUser) throw new Error("Must login first");
    const replies = await this.con.sendCommand("getlocale " + this.currentUser, {
      replyCodes: [wolCodes.RPL_GET_LOCALE],
    });
    return (replies[0].params?.[2].split("`")[1] as unknown as WolLocale) ?? WolLocale.Unknown;
  }

  async joinChannel(channel: string, password?: string): Promise<void> {
    if (!this.currentUser) throw new Error("Must login before sending messages");
    const escaped = IrcProtocol.escapeChannelName(channel);
    const cmd = "join " + escaped + (password !== undefined ? " " + password : "");
    const replies = await this.con.sendCommand(cmd, {
      replyCodes: [
        [
          wolCodes.ERR_NOSUCHCHANNEL,
          (reply: IrcReply) =>
            !!reply.params && reply.params[1] === this.currentUser && reply.params[2] === escaped,
        ],
        wolCodes.ERR_BADCHANNELKEY,
        wolCodes.ERR_CHANNELISFULL,
        wolCodes.ERR_BANNEDFROMCHAN,
      ],
      replyMatch: new RegExp(
        `^:${escape(this.currentUser!)}![^ ]+ JOIN :[^ ]+ ${escape(escaped)}$`,
        "i",
      ),
    });
    if (replies[0].code !== undefined) {
      switch (replies[0].code) {
        case wolCodes.ERR_NOSUCHCHANNEL:
          throw new WolError("No such channel", WolError.Code.NoSuchChannel);
        case wolCodes.ERR_BADCHANNELKEY:
          throw new WolError("Wrong password", WolError.Code.BadChannelPass);
        case wolCodes.ERR_CHANNELISFULL:
          throw new WolError("Channel is full", WolError.Code.ChannelFull);
        case wolCodes.ERR_BANNEDFROMCHAN:
          throw new WolError("Banned from channel", WolError.Code.BannedFromChannel);
        default:
          throw new Error("Unknown error");
      }
    } else {
      this.lastChannelOpts.set(channel, password);
    }
  }

  async listUsers(channel: string): Promise<ChannelUser[]> {
    const replies = await this.con.sendCommand("NAMES " + IrcProtocol.escapeChannelName(channel), {
      replyCodes: [wolCodes.ERR_NOSUCHCHANNEL, wolCodes.ERR_NOTONCHANNEL],
      replyBodyCodes: [wolCodes.RPL_NAMREPLY],
      replyEndCode: wolCodes.RPL_ENDOFNAMES,
    });
    if (replies[0].code !== wolCodes.RPL_NAMREPLY) throw new Error("Unknown error");
    return this.parseNames(replies.slice(0, -1)).sort(
      (a, b) => Number(b.operator) - Number(a.operator),
    );
  }

  async rejoinLastChannels(): Promise<void> {
    if (this.lastChannelOpts) {
      for (const [channel, password] of this.lastChannelOpts) {
        if (!this.isInChannel(channel)) await this.joinChannel(channel, password);
      }
    }
  }

  sendChatMessage(text: string, to: { type: ChatRecipientType; name: string }): void {
    if (!this.currentUser) throw new Error("Must login before sending messages");
    if (to.type !== ChatRecipientType.Channel && to.type !== ChatRecipientType.Whisper) return;
    this.privmsg([to.name], text);
  }

  privmsg(targets: string[], text: string): void {
    if (!this.currentUser) throw new Error("Must login before sending messages");
    const encoded = targets
      .map((t) => (t.startsWith("#") ? IrcProtocol.escapeChannelName(t) : t))
      .join(",");
    this.con.sendMessage(`privmsg ${encoded} :` + text);
    for (const target of targets) {
      const isChannel = target.startsWith("#");
      this._onChatMessage.dispatch(this, {
        from: this.currentUser,
        to: {
          type: isChannel ? ChatRecipientType.Channel : ChatRecipientType.Whisper,
          name: target,
        },
        text,
        time: new Date(),
      } satisfies ChatMessageData);
    }
  }

  kick(users: string[], channel: string, reason?: string): void {
    this.con.sendMessage(
      `kick ${IrcProtocol.escapeChannelName(channel)} ${users.join(",")} :` + (reason || ""),
    );
  }

  partyInvite(nick: string): void {
    this.con.sendMessage("PARTY_INVITE " + nick);
  }
  partyAccept(nick: string): void {
    this.con.sendMessage("PARTY_ACCEPT " + nick);
  }
  partyDecline(nick: string): void {
    this.con.sendMessage("PARTY_DECLINE " + nick);
  }
  partyInviteUnavailable(nick: string): void {
    this.con.sendMessage("PARTY_INVITE_UNAVAILABLE " + nick);
  }
  partyLeave(): void {
    this.con.sendMessage("PARTY_LEAVE");
  }
  partyPrevent(nick: string, prevent: boolean): void {
    this.con.sendMessage(`PARTY_PREVENT ${nick} ` + (prevent ? "1" : "0"));
  }
  partyStatus(): void {
    this.con.sendMessage("PARTY_STATUS");
  }
  partyNoInvites(noInvites: boolean): void {
    this.con.sendMessage("PARTY_NOINVITES " + (noInvites ? "1" : "0"));
  }

  async listGames(listArg: string, clientSku: number): Promise<GameListEntry[]> {
    if (!this.currentUser) throw new Error("Must login before sending messages");
    const replies = await this.con.sendCommand(`list ${listArg} ` + listArg, {
      replyStartCode: wolCodes.RPL_LISTSTART,
      replyBodyCodes: [wolCodes.RPL_LIST, wolCodes.RPL_GAME_CHANNEL],
      replyEndCode: wolCodes.RPL_LISTEND,
    });
    return (replies
      .slice(1, -1)
      .map((reply) => {
        if (!reply.params || reply.params.length < 9)
          throw new Error(`Unexpected reply for list command "${reply.raw}". Insufficient params.`);
        const name = IrcProtocol.unescapeChannelName(reply.params[1]);
        const humanPlayers = Number(reply.params[2]);
        const modeNum = Number(reply.params[4]);
        const tournament = reply.params[5];
        const resLocked = reply.params[6];
        const hostPing = reply.params[7];
        const [passFlag, modHash] = reply.params[8]?.split("::") ?? [];
        const hostMuted = reply.params[9];
        if (modeNum === clientSku && modHash) {
          const topic = new Parser().parseTopic(modHash);
          if (topic)
            return {
              hostName: name.match(/^#?([^']+)'s game$/)?.[1] ?? "",
              hostPing: Number(hostPing),
              hostMuted: Boolean(Number(hostMuted)),
              name,
              description: topic.description,
              modHash: topic.modHash,
              modName: topic.modName,
              tournament: Boolean(Number(tournament)),
              humanPlayers,
              aiPlayers: topic.aiPlayers,
              maxPlayers: topic.maxPlayers,
              observers: topic.observers,
              observable: topic.observable,
              mapName: topic.mapName,
              passLocked: Number(passFlag) === 384,
              resLocked: Boolean(Number(resLocked)),
            } satisfies GameListEntry;
        }
      })
      .filter(isNotNullOrUndefined)) as GameListEntry[];
  }

  leaveChannel(channel: string): void {
    if (this.currentChannels.has(channel)) {
      this.lastChannelOpts.delete(channel);
      this.pendingChannelUsers.delete(channel);
      this.con.sendMessage("PART " + IrcProtocol.escapeChannelName(channel));
    }
  }

  leaveAllChannels(): void {
    for (const channel of this.getCurrentChannels()) this.leaveChannel(channel);
  }

  async createGame(
    channel: string,
    a: number | string,
    b: number | string,
    c: number | string,
    d: boolean | number,
    e: string | undefined,
    f = false,
  ): Promise<void> {
    if (!this.currentUser) throw new Error("Must login before sending messages");
    const escaped = IrcProtocol.escapeChannelName(channel);
    await this.con.sendCommand(
      `joingame ${escaped} ${a} ${b} ${c} ` + `${Number(f)} 0 ${Number(d)} 0` + (e ? " " + e : ""),
      {
        replyMatch: new RegExp(
          `^:${escape(this.currentUser!)}![^ ]+ JOINGAME [^:]+:${escape(escaped)}$`,
          "i",
        ),
      },
    );
    this.logger.info(`Created game "${channel}"`);
    this.currentChannels.add(channel);
    this.currentGameChannel = channel;
    this.logger.info(`Joined channel "${channel}"`);
  }

  makeGameChannelName(): string {
    const raw = this.getCurrentUser() + "'s game";
    const escaped = IrcProtocol.escapeChannelName("#" + raw).slice(
      0,
      IrcProtocol.MAX_CHANNELNAME_LEN - 1,
    );
    return IrcProtocol.unescapeChannelName(escaped);
  }

  async joinGame(channel: string, password?: string, asObserver = false): Promise<void> {
    if (!this.currentUser) throw new Error("Must login before sending messages");
    const escaped = IrcProtocol.escapeChannelName(channel);
    const replies = await this.con.sendCommand(
      `joingame ${escaped} ${Number(asObserver)} ` + (password || ""),
      {
        replyCodes: [
          wolCodes.ERR_BADCHANNELKEY,
          wolCodes.ERR_GAMEHASCLOSED,
          wolCodes.ERR_CHANNELISFULL,
          wolCodes.ERR_BANNEDFROMCHAN,
        ],
        replyMatch: new RegExp(
          `^:${escape(this.currentUser!)}![^ ]+ JOINGAME [^:]+:${escape(escaped)}$`,
          "i",
        ),
      },
    );
    if (replies[0].code === undefined) {
      this.currentChannels.add(channel);
      this.currentGameChannel = channel;
      this.logger.info(`Joined channel "${channel}"`);
      return;
    }
    switch (replies[0].code) {
      case wolCodes.ERR_BADCHANNELKEY:
        throw new WolError("Wrong password", WolError.Code.BadChannelPass);
      case wolCodes.ERR_GAMEHASCLOSED:
        throw new WolError("Game has closed", WolError.Code.GameHasClosed);
      case wolCodes.ERR_CHANNELISFULL:
        throw new WolError("Channel is full", WolError.Code.ChannelFull);
      case wolCodes.ERR_BANNEDFROMCHAN:
        throw new WolError("Banned from channel", WolError.Code.BannedFromChannel);
      default:
        throw new Error("Unknown error");
    }
  }

  sendGservPing(id: string | number, value: number): void {
    if (!this.currentGameChannel) throw new Error("No game channel active");
    const escaped = IrcProtocol.escapeChannelName(this.currentGameChannel);
    this.con.sendMessage(`gping ${escaped} ${id} ` + Math.floor(value));
  }

  startGame(playerIds: Array<string | number>): void {
    if (!this.currentGameChannel) throw new Error("No game channel active");
    this.con.sendMessage(
      `startg ${IrcProtocol.escapeChannelName(this.currentGameChannel)} ` + playerIds.join(","),
    );
  }

  parseNames(replies: IrcReply[]): ChannelUser[] {
    let out: ChannelUser[] = [];
    for (const reply of replies) out = out.concat(this.parseNamReply(reply));
    return out;
  }

  parseNamReply(reply: IrcReply): ChannelUser[] {
    return reply.raw
      .replace(new RegExp("^.*(=|\\*) [^ ]+ :"), "")
      .split(" ")
      .map((chunk) => chunk.split(","))
      .map(([first, , third, fourth]) => {
        const operator = first.startsWith(WolConnection.CHAN_OP_PREFIX);
        return {
          name: operator ? first.slice(WolConnection.CHAN_OP_PREFIX.length) : first,
          operator,
          fresh: Boolean(Number(fourth)),
          ping: Number(third),
        } satisfies ChannelUser;
      });
  }

  sendPlayerReady(ready: boolean): void {
    if (!this.currentGameChannel) throw new Error("No game channel active");
    return this.gameOpt(this.currentGameChannel, "A" + (ready ? 1 : 0));
  }
  sendPlayerHasMap(status: number | string): void {
    if (!this.currentGameChannel) throw new Error("No game channel active");
    return this.gameOpt(this.currentGameChannel, "K" + status);
  }
  sendGameStartRequest(): void {
    if (!this.currentGameChannel) throw new Error("No game channel active");
    return this.gameOpt(this.currentGameChannel, "G");
  }
  sendGameSlotsInfo(data: string): void {
    if (!this.currentGameChannel) throw new Error("No game channel active");
    return this.gameOpt(this.currentGameChannel, "L" + data);
  }
  sendPingData(data: string): void {
    if (!this.currentGameChannel) throw new Error("No game channel active");
    return this.gameOpt(this.currentGameChannel, "P" + data);
  }
  sendObserverSlot(data: string | number): void {
    if (!this.currentGameChannel) throw new Error("No game channel active");
    return this.gameOpt(this.currentGameChannel, "O" + data);
  }
  sendGameOpts(opt: string): void {
    if (!this.currentGameChannel) throw new Error("No game channel active");
    return this.gameOpt(this.currentGameChannel, opt);
  }
  sendPlayerOpts(
    channel: string,
    a: number | string,
    b: number | string,
    c: number | string,
    d: number | string,
  ): void {
    if (!this.currentGameChannel) throw new Error("No game channel active");
    return this.gameOpt(channel, `R${a},${b},${c},${d},0,0,0`);
  }
  sendModeChannelMax(channel: string, max: number | string): void {
    this.con.sendMessage(`MODE ${IrcProtocol.escapeChannelName(channel)} +l ` + max);
  }

  sendGameTopic(
    e: number | string,
    t: number | string,
    i: number | string,
    r: number | string,
    s: boolean | number,
    a: string,
    n: string | number,
    o: string,
    l?: string,
  ): void {
    if (!this.currentGameChannel) throw new Error("No game channel active");
    const encodedName = new FileNameEncoder().encode(a);
    const descB64 = Base64.encode(
      utf16ToBinaryString(o.slice(0, WolConnection.MAX_ROOM_DESC_LEN - 1)),
    );
    const modNameB64 =
      l !== undefined
        ? Base64.encode(utf16ToBinaryString(l.slice(0, WolConnection.MAX_ROOM_DESC_LEN - 1)))
        : "";
    const channel = IrcProtocol.escapeChannelName(this.currentGameChannel);
    this.con.sendMessage(
      `topic ${channel} :g${e}${t}N39,` + n + `,${i},${r},${s ? 1 : 0},` + encodedName + `,${descB64},` + modNameB64,
    );
  }

  gameOpt(channel: string, opt: string): void {
    if (!this.currentUser) throw new Error("Must login first");
    if (!this.currentGameChannel) throw new Error("No game channel active");
    const encoded = channel.startsWith("#") ? IrcProtocol.escapeChannelName(channel) : channel;
    this.con.sendMessage(`gameopt ${encoded} :` + opt);
    this._onGameOpt.dispatch(this, { user: this.currentUser, opt });
  }

  handleJoin(line: string): void {
    const match = line.match(/^:([A-Za-z0-9-_]+)![^ ]+ JOIN :([^ ]+) ([^ ]+)/i);
    if (!match) throw new Error(`Unexpected JOIN message format "${line}"`);
    const [, user, modeChunk, channelEscaped] = match;
    const fields = modeChunk.trim().split(",");
    const channel = IrcProtocol.unescapeChannelName(channelEscaped);
    if (this.currentUser === user) {
      this.currentChannels.add(channel);
      this.logger.info(`Joined channel "${channel}"`);
    }
    this._onJoinChannel.dispatch(this, {
      type: "join",
      user: {
        name: user,
        ping: Number(fields[1]),
        operator: Boolean(Number(fields[2])),
        fresh: Boolean(Number(fields[3])),
      },
      channel,
    } satisfies JoinLeavePayload);
  }

  handleJoingame(line: string): void {
    const match = line.match(/^:([A-Za-z0-9-_]+)![^ ]+ JOINGAME ([^:]+):([^ ]+)/i);
    if (!match) throw new Error(`Unexpected JOINGAME message format "${line}"`);
    const [, user, meta, channelEscaped] = match;
    const fields = meta.trim().split(" ");
    const channel = IrcProtocol.unescapeChannelName(channelEscaped);
    if (user !== this.currentUser) this.logger.info(`Player "${user}" joined game "${channel}"`);
    this._onJoinChannel.dispatch(this, {
      type: "join",
      user: { name: user, operator: false, ping: Number(fields[5]), fresh: Boolean(Number(fields[6])) },
      channel,
    } satisfies JoinLeavePayload);
  }

  handleStartGame(line: string): void {
    const match = line.match(/^:[^ ]+ STARTG [^:]+:([^ ]+) :([^ ]+) (\d+)/i);
    if (!match) throw new Error(`Unexpected STARTG message format "${line}"`);
    const [, gservUrl, gameId, timestamp] = match;
    this._onGameStart.dispatch(this, {
      gameId,
      timestamp: Number(timestamp),
      gservUrl,
    } satisfies GameStartPayload);
  }

  handleGserv(line: string): void {
    const match = line.match(/^[^ ]+ GSERV [^:]+:([^ ]+) ([^ ]+)/i);
    if (!match) throw new Error(`Unexpected GSERV message format "${line}"`);
    const [, id, url] = match;
    this._onGameServer.dispatch(this, { id, url });
  }

  handlePrivMsg(line: string): void {
    const match = line.match(/^:([A-Za-z0-9-_]+)![^ ]+ PRIVMSG ([^ ]+) :(.*)/i);
    if (!match) throw new Error(`Unexpected PRIVMSG message format "${line}"`);
    const [, from, to, text] = match;
    let message: ChatMessageData | undefined;
    const time = new Date();
    if (to.startsWith("#")) {
      message = {
        from,
        to: { type: ChatRecipientType.Channel, name: IrcProtocol.unescapeChannelName(to) },
        text,
        time,
      };
    } else if (to === this.currentUser) {
      message = { from, to: { type: ChatRecipientType.Whisper, name: to }, text, time };
    }
    if (message) this._onChatMessage.dispatch(this, message);
  }

  handleLoginQueueUpdate(reply: IrcReply): void {
    if (!reply.params) throw new Error("Unexpected queue update reply " + reply.raw);
    const [, position, avgWait] = reply.params;
    this._onLoginQueueUpdate.dispatch(this, {
      position: Number(position.slice(1)),
      avgWaitSeconds: avgWait ? Number(avgWait) : 0,
    } satisfies LoginQueueUpdate);
  }

  handlePartyUpdate(line: string): void {
    const parts = line.split(" ");
    const rest = parts.slice(3).join(" ");
    const payload = rest.startsWith(":") ? rest.slice(1) : rest;
    if (payload) this._onPartyUpdate.dispatch(this, payload);
  }

  handleNamReply(reply: IrcReply): void {
    if (!reply.params) throw new Error(`Missing NAMREPLY params: "${reply.raw}"`);
    const channel = IrcProtocol.unescapeChannelName(reply.params[2]);
    const users = this.parseNamReply(reply);
    const pending = this.pendingChannelUsers.get(channel);
    if (pending) pending.push(...users);
    else this.pendingChannelUsers.set(channel, users);
  }

  handleEndOfNames(reply: IrcReply): void {
    if (!reply.params) throw new Error(`Missing ENDOFNAMES params: "${reply.raw}"`);
    const channel = IrcProtocol.unescapeChannelName(reply.params[1]);
    const users = this.pendingChannelUsers.get(channel) ?? [];
    users.sort((a, b) => Number(b.operator) - Number(a.operator));
    this.pendingChannelUsers.delete(channel);
    this._onChannelUsers.dispatch(this, { channelName: channel, users });
  }

  handleGameReport(reply: IrcReply): void {
    if (!reply.params) throw new Error(`Missing GAME_REPORT params: "${reply.raw}"`);
    if (reply.params.length < 2)
      throw new Error("Insufficient number of params for GAME_REPORT: " + reply.params.length);
    const report = new WolGameReport(reply.params[1].slice(1));
    this._onGameReport.dispatch(this, report);
  }

  handleIrcError(line: string): void {
    const match = line.match(/^:([A-Za-z0-9-_]+) (\d+) ([^ ]+) (?:([^ ]*) )?:(.*)/i);
    if (match) {
      // 孪生解构 [, sender, code, target(g3), —(g4跳过), text]：目标昵称取捕获组 3
      const [, sender, codeStr, target, , text] = match;
      if (
        [
          wolCodes.ERR_NOSUCHNICK,
          wolCodes.ERR_NOSUCHCHANNEL,
          wolCodes.ERR_NOTONCHANNEL,
          wolCodes.ERR_CHANOPRIVSNEEDED,
        ].includes(Number(codeStr))
      ) {
        let message: ChatMessageData | undefined;
        if (target === this.currentUser) {
          message = {
            from: sender,
            to: { type: ChatRecipientType.Page, name: target },
            text,
            time: new Date(),
          };
        }
        if (message) this._onChatMessage.dispatch(this, message);
      }
    }
  }

  handlePageOrNotice(line: string): void {
    const match = line.match(/^:([A-Za-z0-9-_]+)(?:![^ ]+)? (?:PAGE|NOTICE) ([^ ]+) :(.*)/i);
    if (!match) throw new Error(`Unexpected PAGE message format "${line}"`);
    const [, from, target, text] = match;
    const message: ChatMessageData = {
      text,
      from,
      to: { type: ChatRecipientType.Page, name: target },
      time: new Date(),
    };
    this._onChatMessage.dispatch(this, message);
  }

  handlePart(line: string): void {
    const match = line.match(/^:([A-Za-z0-9-_]+)![^ ]+ PART ([^ ]+)/i);
    if (!match) throw new Error(`Unexpected PART message format "${line}"`);
    const [, user, channelEscaped] = match;
    const channel = IrcProtocol.unescapeChannelName(channelEscaped);
    if (user === this.currentUser) {
      if (channel === this.currentGameChannel) this.currentGameChannel = undefined;
      this.currentChannels.delete(channel);
      this.lastChannelOpts.delete(channel);
      this.pendingChannelUsers.delete(channel);
      this.logger.info(`Left channel "${channel}"`);
    } else if (channel === this.currentGameChannel) {
      this.logger.info(`Player "${user}" left game "${channel}"`);
    }
    this._onLeaveChannel.dispatch(this, {
      type: "leave",
      user: { name: user },
      channel,
    } satisfies JoinLeavePayload);
  }

  handleKick(line: string): void {
    const match = line.match(/^:([A-Za-z0-9-_]+)![^ ]+ KICK ([^ ]+) ([A-Za-z0-9-_]+)/i);
    if (!match) throw new Error(`Unexpected KICK message format "${line}"`);
    const [, , channelEscaped, kicked] = match;
    const channel = IrcProtocol.unescapeChannelName(channelEscaped);
    if (kicked === this.currentUser) {
      if (channel === this.currentGameChannel) this.currentGameChannel = undefined;
      this.currentChannels.delete(channel);
      this.lastChannelOpts.delete(channel);
      this.pendingChannelUsers.delete(channel);
      this.logger.info(`Left channel "${channel}"`);
    }
    this._onLeaveChannel.dispatch(this, {
      type: "leave",
      user: { name: kicked },
      channel,
    } satisfies JoinLeavePayload);
  }

  handleGameOpt(line: string): void {
    const match = line.match(/^:([A-Za-z0-9-_]+)![^ ]+ GAMEOPT ([^ ]+) :(.*)/i);
    if (!match) throw new Error(`Unexpected GAMEOPT message format"${line}"`);
    const [, user, , opt] = match;
    this._onGameOpt.dispatch(this, { user, opt });
  }

  handleMode(line: string): void {
    const match = line.match(/^:([A-Za-z0-9-_]+)![^ ]+ MODE ([^ ]+) \+l (\d+)/i);
    if (match) {
      const [, , , max] = match;
      this._onGameMode.dispatch(this, Number(max));
    } else {
      this.logger.warn("Got unknown MODE line: " + line);
    }
  }
}
