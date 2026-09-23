/**
 * GservConnection — 游戏服务器（GServ）会话：登录/建局/加入/动作与事件分发。
 *
 * 由 network/GservConnection.ts.js 重写为 TS（行为完全一致，忠实翻译）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 *
 * 关键语义（勿改）：
 * - 基于 IrcConnection 文本模式；factory() 负责构造底层连接并注入日志脱敏。
 * - 错误码映射表 d：gserv RPL_* → GservError.Code。
 * - 事件：loadinfo / game start / actions / desync / rate / chat / taunt /
 *   player disconnect / privmsg not allowed。
 * - 二进制：game state hash / player actions / map put-get。
 * - privmsg 需已登录；聊天目标构造依赖 RECIPIENT_ALL / RECIPIENT_TEAM。
 */

import { EventDispatcher } from "util/event"; // 孪生
import { DataStream } from "data/DataStream"; // 孪生
import { IrcConnection } from "network/IrcConnection"; // 本组已写
import * as gservCodes from "network/gservCodes"; // 本组已写
import { GservError } from "network/GservError"; // 已转换
import { API_VERSION, RECIPIENT_ALL, RECIPIENT_TEAM } from "network/gservConfig"; // 已转换
import { Parser } from "network/gameopt/Parser"; // 已转换
import { Serializer } from "network/gameopt/Serializer"; // 已转换
import { ChatRecipientType } from "network/chat/ChatMessage"; // 已转换
import { Base64 } from "util/Base64"; // 孪生
import type { Message } from "network/chat/Message"; // 本组已写
import type { IrcReply } from "network/IrcConnection"; // 本组已写

/** IrcConnection 日志器最小接口。 */
export interface GservLogger {
  /** info 级日志。 */
  info(message: string, ...rest: unknown[]): void;
}

/** 加载进度事件负载（loadinfo 文本，已去掉前导冒号）。 */
export type LoadInfoPayload = string;

/** 网络速率变更事件。 */
export interface RateChangePayload {
  /** 速率值。 */
  rate: number;
  /** 所属回合号。 */
  turnNo: number;
}

/** 挑衅事件。 */
export interface TauntPayload {
  /** 发送者（去掉前导冒号）。 */
  from: string;
  /** 挑衅编号。 */
  tauntNo: number;
}

/** 二进制动作负载（去掉前缀字节后的切片）。 */
export type PlayerActionsPayload = Uint8Array;

/** 错误码映射（gserv RPL → GservError.Code）。 */
const errorByCode = new Map<number, GservError.Code>([
  [gservCodes.RPL_BAD_LOGIN, GservError.Code.BadLogin],
  [gservCodes.RPL_TOO_MANY_LOGIN_ATTEMPTS, GservError.Code.TooManyLoginAttempts],
  [gservCodes.RPL_ALREADY_LOGGED_IN, GservError.Code.AlreadyLoggedIn],
  [gservCodes.RPL_INSTANCE_EXISTS, GservError.Code.InstanceAlreadyExists],
  [gservCodes.RPL_INSTANCE_TOO_MANY, GservError.Code.CreatedTooManyInstances],
  [gservCodes.RPL_INSTANCE_NONEXISTENT, GservError.Code.InstanceNonExistent],
  [gservCodes.RPL_INSTANCE_NOT_ALLOWED, GservError.Code.InstanceNotAllowed],
  [gservCodes.RPL_INSTANCE_ALREADY_STARTED, GservError.Code.InstanceAlreadyStarted],
  [gservCodes.RPL_INSTANCE_VERS_MISMATCH, GservError.Code.InstanceVersMismatch],
]);

/** 游戏服务器会话。 */
export class GservConnection {
  /** 当前登录用户名（未登录为 undefined）。 */
  currentUser?: string;
  /** 服务端名（登录应答 raw 提取）。 */
  serverName?: string;

  /** 底层 IRC 连接。 */
  private con: IrcConnection;

  private _onLoadInfo = new EventDispatcher();
  private _onGameStart = new EventDispatcher();
  private _onGameActions = new EventDispatcher();
  private _onGameDesync = new EventDispatcher();
  private _onRateChange = new EventDispatcher();
  private _onChatMessage = new EventDispatcher();
  private _onTaunt = new EventDispatcher();
  private _onPlayerDisconnect = new EventDispatcher();
  private _onPrivMsgNotAllowed = new EventDispatcher();

  /** 底层连接错误。 */
  get onError() {
    return this.con.onError;
  }
  /** 底层连接关闭。 */
  get onClose() {
    return this.con.onClose;
  }
  /** 加载进度文本。 */
  get onLoadInfo() {
    return this._onLoadInfo.asEvent();
  }
  /** 游戏开始。 */
  get onGameStart() {
    return this._onGameStart.asEvent();
  }
  /** 回合玩家动作（二进制）。 */
  get onGameActions() {
    return this._onGameActions.asEvent();
  }
  /** 不同步。 */
  get onGameDesync() {
    return this._onGameDesync.asEvent();
  }
  /** 网络速率变更。 */
  get onRateChange() {
    return this._onRateChange.asEvent();
  }
  /** 聊天消息。 */
  get onChatMessage() {
    return this._onChatMessage.asEvent();
  }
  /** 挑衅。 */
  get onTaunt() {
    return this._onTaunt.asEvent();
  }
  /** 玩家断开。 */
  get onPlayerDisconnect() {
    return this._onPlayerDisconnect.asEvent();
  }
  /** 当前不允许私聊。 */
  get onPrivMsgNotAllowed() {
    return this._onPrivMsgNotAllowed.asEvent();
  }

  /**
   * 工厂：构造带日志脱敏的 text 模式 IrcConnection 并包装。
   * @param logger 底层日志器。
   */
  static factory(logger: GservLogger): GservConnection {
    return new this(
      new IrcConnection(
        {
          mode: "text",
          binaryRplPrefix: gservCodes.RPL_BIN_PREFIX,
          binaryReqPrefix: gservCodes.REQ_BIN_PREFIX,
          // 脱敏：USER 行密码、PRIVMSG 正文
          logFilter: (line) =>
            line
              .replace(/^(user [^ ]+) ([^ ]+)/i, "$1 <redacted>")
              .replace(
                /^((:.+!.+@.+)?privmsg ([^ ]+ )+):(.+)\r?\n?$/i,
                "$1:<redacted>",
              ),
        },
        logger as never,
      ),
    );
  }

  /**
   * @param con 底层 IRC 连接。
   */
  constructor(con: IrcConnection) {
    this.con = con;
    this.con.onMessage.subscribe(this.handleMessage);
  }

  /**
   * 分发底层完整消息（文本行或二进制负载）。
   * @param message 文本行或字节。
   */
  private handleMessage = (message: string | Uint8Array): void => {
    if (typeof message === "string") {
      const parts = message.split(" ");
      let rate: string;
      let turnNo: string;
      if (parts[0] === "ping") {
        if (this.isOpen()) {
          this.con.sendMessage("pong" + (parts[1] ? " " + parts[1] : ""));
        }
      } else if (parts[1].toLowerCase() === "privmsg") {
        this.handlePrivMsg(message);
      } else if (parts[1] === "" + gservCodes.RPL_LOAD_INFO) {
        this.handleLoadInfo(parts[3]);
      } else if (parts[1] === "" + gservCodes.RPL_GAME_START) {
        this.handleGameStart();
      } else if (parts[1] === "" + gservCodes.RPL_GAME_DESYNC) {
        this._onGameDesync.dispatch(this);
      } else if (parts[1] === "" + gservCodes.RPL_NET_RATE) {
        [rate, turnNo] = parts[3].slice(1).split(",");
        this._onRateChange.dispatch(this, { rate: Number(rate), turnNo: Number(turnNo) });
      } else if (parts[1] === "" + gservCodes.RPL_TAUNT) {
        this._onTaunt.dispatch(this, {
          from: parts[0].replace(/^:/, ""),
          tauntNo: Number(parts[3].replace(/^:/, "")),
        });
      } else if (parts[1] === "" + gservCodes.RPL_PLAYER_DISCONNECT) {
        this._onPlayerDisconnect.dispatch(this, parts[3].replace(/^:/, ""));
      } else if (parts[1] === "" + gservCodes.RPL_PRIVMSG_NOT_ALLOWED) {
        this._onPrivMsgNotAllowed.dispatch(this);
      }
    } else {
      if (message[0] === gservCodes.RPL_BIN_GAME_ACTIONS) {
        this.handlePlayerActions(message.slice(1));
      }
    }
  };

  /** 当前登录用户名。 */
  getCurrentUser(): string | undefined {
    return this.currentUser;
  }

  /** 服务端名。 */
  getServerName(): string | undefined {
    return this.serverName;
  }

  /**
   * 连接并挂接消息处理（handleMessage 已在构造时订阅）。
   * @param url 连接地址。
   * @param options 可选超时/取消。
   */
  async connect(url: string, options?: Parameters<IrcConnection["connect"]>[1]): Promise<void> {
    this.con.onMessage.subscribe(this.handleMessage);
    return await this.con.connect(url, options);
  }

  /** 关断连接并清除登录态。 */
  close(): void {
    this.con.onMessage.unsubscribe(this.handleMessage);
    this.con.close();
    this.currentUser = undefined;
  }

  /** 底层是否仍打开。 */
  isOpen(): boolean {
    return this.con.isOpen();
  }

  /**
   * 客户端版本协商。
   * @param clientVers 客户端版本标识。
   * @throws GservError(Code.OutdatedClient) 版本过旧。
   */
  async cvers(clientVers: string): Promise<void> {
    const replies = await this.con.sendCommand(`cvers ${clientVers} ` + API_VERSION, {
      replyCodes: [gservCodes.RPL_CVERS_OK, gservCodes.RPL_CVERS_OUTDATED],
    });
    if (replies[0].code === gservCodes.RPL_CVERS_OUTDATED) {
      const detail = replies[0].params
        ? replies[0].params.splice(1).join(" ").replace(/^:/, "")
        : "unknown";
      throw new GservError("Cvers error: " + detail, GservError.Code.OutdatedClient);
    }
  }

  /**
   * 登录。
   * @param user 用户名。
   * @param password 密码（Base64 编码后发送）。
   * @throws GservError 登录失败。
   */
  async login(user: string, password: string): Promise<void> {
    const replies = await this.con.sendCommand(`user ${user} ` + Base64.encode(password), {
      replyCodes: [
        gservCodes.RPL_LOGGED_IN,
        gservCodes.RPL_BAD_LOGIN,
        gservCodes.RPL_TOO_MANY_LOGIN_ATTEMPTS,
        gservCodes.RPL_ALREADY_LOGGED_IN,
      ],
      timeout: 10,
    });
    if (replies[0].code !== gservCodes.RPL_LOGGED_IN) {
      const code = errorByCode.get(replies[0].code!) ?? GservError.Code.Unknown;
      const detail = replies[0].params
        ? replies[0].params.splice(1).join(" ").replace(/^:/, "")
        : "unknown";
      throw new GservError("Login error: " + detail, code);
    }
    this.currentUser = user;
    this.serverName = replies[0].raw.match(/^:([^\s]+)/)?.[1] || "";
  }

  /**
   * 创建游戏实例。
   * @param mapName 地图名。
   * @param gameName 局名。
   * @param gameOpts 游戏选项串（不得含空格）。
   * @param maxPlayers 最大玩家数。
   * @param extra 附加参数。
   * @param flag 布尔标志（编码为 0/1）。
   * @throws GservError 创建失败。
   */
  async createGame(
    mapName: string,
    gameName: string,
    gameOpts: string,
    maxPlayers: number | string,
    extra: number | string,
    flag = false,
  ): Promise<void> {
    if (gameOpts.includes(" ")) {
      throw new Error("Game opts string cannot include spaces");
    }
    const replies = await this.con.sendCommand(
      `create ${mapName} ${gameName} ${gameOpts} ${maxPlayers} ${extra} ` + Number(flag),
      {
        replyCodes: [
          gservCodes.RPL_INSTANCE_CREATED,
          gservCodes.RPL_INSTANCE_EXISTS,
          gservCodes.RPL_INSTANCE_TOO_MANY,
          gservCodes.RPL_INSTANCE_NOT_ALLOWED,
        ],
      },
    );
    if (replies[0].code !== gservCodes.RPL_INSTANCE_CREATED) {
      const code = errorByCode.get(replies[0].code!) ?? GservError.Code.Unknown;
      const detail = replies[0].params
        ? replies[0].params.splice(1).join(" ").replace(/^:/, "")
        : "unknown";
      throw new GservError("Create error: " + detail, code);
    }
  }

  /**
   * 加入游戏实例。
   * @param gameId 对局 id。
   * @param password 口令。
   * @param extra 附加参数。
   * @throws GservError 加入失败。
   */
  async joinGame(gameId: string, password: string, extra: string | number): Promise<void> {
    const replies = await this.con.sendCommand(`join ${gameId} ${password} ` + extra, {
      replyCodes: [
        gservCodes.RPL_INSTANCE_CONNECTED,
        gservCodes.RPL_INSTANCE_NONEXISTENT,
        gservCodes.RPL_INSTANCE_NOT_ALLOWED,
        gservCodes.RPL_INSTANCE_ALREADY_STARTED,
        gservCodes.RPL_INSTANCE_VERS_MISMATCH,
      ],
    });
    if (replies[0].code !== gservCodes.RPL_INSTANCE_CONNECTED) {
      const code = errorByCode.get(replies[0].code!) ?? GservError.Code.Unknown;
      const detail = replies[0].params
        ? replies[0].params.splice(1).join(" ").replace(/^:/, "")
        : "unknown";
      throw new GservError("Join error: " + detail, code);
    }
  }

  /**
   * 拉取当前游戏选项串。
   * @returns 去掉前导冒号后的 gameopts 文本。
   * @throws Error 应答缺少 params。
   */
  async gameOpts(): Promise<string> {
    const replies = await this.con.sendCommand("gameopts", { replyCodes: [gservCodes.RPL_GAME_OPTS] });
    if (!replies[0].params) {
      throw new Error("Unexpected server reply for getopts command. Missing params.");
    }
    return replies[0].params.splice(1).join(" ").replace(/^:/, "");
  }

  /**
   * 上报本地加载百分比。
   * @param percent 0..100。
   */
  sendLoadedPercent(percent: number): void {
    this.con.sendMessage("loaded " + percent);
  }

  /** 请求当前加载进度。 */
  requestLoadInfo(): void {
    this.con.sendMessage("loadinfo");
  }

  /**
   * 发送回合状态哈希（二进制）。
   * @param turnNo 回合号。
   * @param hash 哈希值（uint32）。
   */
  sendGameStateHash(turnNo: number, hash: number): void {
    const stream = new DataStream(10);
    stream.dynamicSize = false;
    stream.writeUint8(gservCodes.REQ_BIN_PREFIX);
    stream.writeUint8(gservCodes.REQ_BIN_GAME_STATE_HASH);
    stream.writeUint32(turnNo);
    stream.writeUint32(hash);
    this.con.sendMessage(stream.toUint8Array());
  }

  /**
   * 上报玩家 active 状态。
   * @param active 是否激活。
   */
  sendPlayerActive(active: boolean): void {
    this.con.sendMessage("active " + (active ? 1 : 0));
  }

  /**
   * 发送挑衅编号。
   * @param tauntNo 挑衅编号。
   */
  sendTaunt(tauntNo: number): void {
    this.con.sendMessage("taunt " + tauntNo);
  }

  /**
   * 往返 ping。
   * @param timeout 超时秒数。
   * @returns 往返毫秒。
   */
  async ping(timeout?: number): Promise<number> {
    return await this.con.ping(timeout);
  }

  /**
   * 发送本回合玩家动作（二进制）。
   * @param turnNo 回合号。
   * @param actions 动作字节。
   */
  sendPlayerActions(turnNo: number, actions: Uint8Array): void {
    const stream = new DataStream(6);
    stream.writeUint8(gservCodes.REQ_BIN_PREFIX);
    stream.writeUint8(gservCodes.REQ_BIN_GAME_ACTIONS);
    stream.writeUint32(turnNo);
    stream.writeUint8Array(actions);
    this.con.sendMessage(stream.toUint8Array());
  }

  /**
   * 上传地图数据（二进制）。
   * @param mapData 地图字节。
   */
  sendMap(mapData: Uint8Array): void {
    const stream = new DataStream(2);
    stream.writeUint8(gservCodes.REQ_BIN_PREFIX);
    stream.writeUint8(gservCodes.REQ_BIN_PUT_MAP);
    stream.writeUint8Array(new Serializer().serializeMapData(mapData as unknown as string));
    this.con.sendMessage(stream.toUint8Array());
  }

  /**
   * 下载地图数据（二进制）。
   * @returns 解析后的地图字节。
   */
  async getMap(): Promise<Uint8Array> {
    const stream = new DataStream(2);
    stream.dynamicSize = false;
    stream.writeUint8(gservCodes.REQ_BIN_PREFIX);
    stream.writeUint8(gservCodes.REQ_BIN_GET_MAP);
    const reply = await this.con.sendBinCommand(stream.toUint8Array(), {
      replyCodes: [gservCodes.RPL_BIN_MAP_DATA],
      timeout: 15,
    });
    return new Parser().parseMapData(reply.data) as unknown as Uint8Array;
  }

  /**
   * 分发 loadinfo 文本。
   * @param raw 含前导冒号的原始参数。
   */
  private handleLoadInfo(raw: string): void {
    this._onLoadInfo.dispatch(this, raw.replace(/^:/, ""));
  }

  /** 分发游戏开始。 */
  private handleGameStart(): void {
    this._onGameStart.dispatch(this, undefined);
  }

  /**
   * 分发二进制玩家动作。
   * @param data 去掉类型字节后的负载。
   */
  private handlePlayerActions(data: Uint8Array): void {
    this._onGameActions.dispatch(this, data);
  }

  /**
   * 向频道 #all 广播聊天。
   * @param text 消息正文。
   */
  sayChannel(text: string): void {
    this.privmsg([RECIPIENT_ALL], text);
  }

  /**
   * 向一个或多个目标发送 PRIVMSG。
   * @param recipients 目标列表。
   * @param text 消息正文（空则不发送）。
   * @throws Error 未登录。
   */
  privmsg(recipients: string[], text: string): void {
    if (!this.currentUser) throw new Error("Must login before sending messages");
    if (text.length) {
      const joined = recipients.join(",");
      this.con.sendMessage(`privmsg ${joined} :` + text);
    }
  }

  /**
   * 解析入站 PRIVMSG 并分发聊天事件。
   * @param raw 原始行。
   * @throws Error 格式不匹配。
   */
  private handlePrivMsg(raw: string): void {
    const match = raw.match(/^:([A-Za-z0-9-_]+) PRIVMSG ([A-Za-z0-9-_#']+) :(.*)/i);
    if (!match) throw new Error(`Unexpected PRIVMSG message format "${raw}"`);
    const [, from, to, text] = match;
    let message: Message | undefined;
    const time = new Date();

    if (to === RECIPIENT_ALL) {
      message = { from, to: { type: ChatRecipientType.Channel, name: to }, text, time };
    } else if (to === this.currentUser) {
      message = {
        from,
        to:
          from === this.getServerName()
            ? { type: ChatRecipientType.Page, name: to }
            : { type: ChatRecipientType.Channel, name: RECIPIENT_TEAM },
        text,
        time,
      };
    }
    if (message) {
      this._onChatMessage.dispatch(this, message);
    }
  }
}
