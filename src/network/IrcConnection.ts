/**
 * IrcConnection — 基于 WebSocket 的 IRC 风格文本/二进制连接层。
 *
 * 由 network/IrcConnection.ts.js 重写为 TS（行为完全一致，忠实翻译）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 *
 * 关键语义（勿改）：
 * - 文本行按 \r?\n 切分；不完整尾行进入 messageBuffer 缓冲。
 * - 二进制消息若首字节 === binaryRplPrefix，则整体作为 Uint8Array 直发 onMessage。
 * - sendCommand 支持 replyCodes / start-end / replyMatch / replyRawText 四种匹配。
 * - 超时/关闭/取消分别映射 NoReplyError / SocketError / OperationCanceledError。
 * - 命名空间导出 NoReplyError / SocketError / ConnectError。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

import { OperationCanceledError } from "@puzzl/core/lib/async/cancellation"; // 孪生
import { EventDispatcher } from "util/event"; // 孪生
import { AppLogger } from "util/Logger"; // 孪生
import { binaryStringToUint8Array, uint8ArrayToBinaryString } from "util/string"; // 孪生
import { sleep } from "util/time"; // 孪生

/** IrcConnection 配置。 */
export interface IrcConnectionOptions {
  /** 传输模式：text 自动补 \r\n；binary 将二进制字符串按字节发送。 */
  mode: "text" | "binary";
  /** 二进制应答首字节前缀（有则启用二进制直通）。 */
  binaryRplPrefix?: number;
  /** 二进制请求首字节前缀（sendBinCommand 校验用）。 */
  binaryReqPrefix?: number;
  /** 日志脱敏过滤器。 */
  logFilter?: (line: string) => string;
}

/** 可选取消令牌。 */
export interface IrcCancelToken {
  /** 注册取消回调。 */
  register(cb: () => void): void;
  /** 是否已取消。 */
  isCancelled(): boolean;
}

/** 文本命令应答选项。 */
export interface SendCommandOptions {
  /** 精确匹配的应答码列表。 */
  replyCodes?: Array<number | [number, (reply: IrcReply) => boolean]>;
  /** start-end 包裹模式的起始码。 */
  replyStartCode?: number;
  /** start-end 包裹模式的结束码（必须与 start 同时给出）。 */
  replyEndCode?: number;
  /** start-end 模式下计入 body 的中间码。 */
  replyBodyCodes?: number[];
  /** 心跳码（命中则延长超时）。 */
  replyHeartbeatCodes?: number[];
  /** 心跳延长的超时秒数。 */
  heartbeatTimeout?: number;
  /** 自定义整行正则匹配（命中即完成）。 */
  replyMatch?: RegExp;
  /** 是否把原始文本行（不解析 code）直接交付。 */
  replyRawText?: boolean;
  /** 超时秒数。 */
  timeout?: number;
}

/** 二进制命令应答选项。 */
export interface SendBinCommandOptions {
  /** 期望的二进制类型码（消息第二字节）。 */
  replyCodes: number[];
  /** 超时秒数。 */
  timeout?: number;
}

/** 解析后的文本应答。 */
export interface IrcReply {
  /** 原始行。 */
  raw: string;
  /** 数值应答码（replyRawText 时可省略）。 */
  code?: number;
  /** 参数列表。 */
  params?: string[];
  /** 接收时间戳（ms）。 */
  time: number;
}

/** 二进制应答。 */
export interface IrcBinReply {
  /** 数值类型码。 */
  code: number;
  /** 类型码之后的负载（去掉前缀与类型字节）。 */
  data: Uint8Array;
  /** 接收时间戳（ms）。 */
  time: number;
}

/** 无应答超时。 */
class NoReplyError extends Error {}
/** 套接字状态错误。 */
class SocketError extends Error {}
/** 连接建立失败。 */
class ConnectError extends Error {}

/** 发送原始命令并等待匹配应答的回调签名。 */
type RawCommandMatcher = (
  data: string | Uint8Array,
  time: number,
  resolve: (value: IrcReply[] | IrcBinReply | void) => void,
  extendTimeout: (seconds?: number) => void,
) => boolean;

/** IRC 风格 WebSocket 连接。 */
export class IrcConnection {
  /** 无应答超时（与孪生 IrcConnection.NoReplyError 一致）。 */
  static NoReplyError = NoReplyError;
  /** 套接字状态错误。 */
  static SocketError = SocketError;
  /** 连接建立失败。 */
  static ConnectError = ConnectError;

  /** 配置。 */
  readonly options: IrcConnectionOptions;
  /** 日志器。 */
  readonly logger: { info: Function; error: Function; debug: Function; enabledFor: Function };
  /** 默认命令超时（秒）。 */
  timeout = 5;
  /** 底层套接字。 */
  private socket?: WebSocket;
  /** 文本消息缓冲（不完整尾行）。 */
  private messageBuffer = "";

  private _onMessage = new EventDispatcher();
  private _onError = new EventDispatcher();
  private _onClose = new EventDispatcher();

  constructor(options: IrcConnectionOptions, logger: IrcConnection["logger"]) {
    this.options = options;
    this.logger = logger;
  }

  /** 收到完整文本行或二进制负载。 */
  get onMessage() {
    return this._onMessage.asEvent();
  }
  /** 套接字 error 事件。 */
  get onError() {
    return this._onError.asEvent();
  }
  /** 套接字 close 事件。 */
  get onClose() {
    return this._onClose.asEvent();
  }

  /**
   * 建立 WebSocket 连接。
   * @param url 连接地址。
   * @param options 可选超时/取消。
   */
  async connect(url: string, options?: { timeoutSeconds?: number; cancelToken?: IrcCancelToken }): Promise<void> {
    const connectTimeout = options?.timeoutSeconds
      ? setTimeout(() => this.close(), 1000 * options.timeoutSeconds)
      : undefined;
    options?.cancelToken?.register(() => {
      if (connectTimeout) {
        clearTimeout(connectTimeout);
        this.close();
      }
    });

    return new Promise<void>((resolve, reject) => {
      this.socket = new WebSocket(url);
      if (this.socket.binaryType !== "arraybuffer") {
        this.socket.binaryType = "arraybuffer";
      }

      let onError: (ev: Event) => void = (ev) => {
        this.socket!.removeEventListener("error", onError);
        if (options?.cancelToken?.isCancelled()) {
          reject(new OperationCanceledError(options.cancelToken as never));
        } else {
          reject(new ConnectError(`Connection to "${url}" failed`));
        }
      };

      this.socket.addEventListener("open", () => {
        this.socket!.removeEventListener("error", onError);
        this.socket!.addEventListener("error", (e) => this.handleError(e));
        this.handleOpen();
        resolve();
      });
      this.socket.addEventListener("error", onError);
      this.socket.addEventListener("close", (e) => this.handleClose(e));
      this.socket.addEventListener("message", (e) => {
        if (e.data instanceof ArrayBuffer) {
          this.handleMessage(new Uint8Array(e.data));
        } else {
          this.handleMessage(e.data as string);
        }
      });
    }).finally(() => {
      if (connectTimeout) clearTimeout(connectTimeout);
    });
  }

  private handleOpen(): void {
    this.logger.info("Connection open to " + this.socket!.url);
  }

  private handleError(e: Event): void {
    this.logger.error("Connection error", e);
    this._onError.dispatch(this, e);
  }

  private handleClose(e: CloseEvent): void {
    this.logger.info(`Connection closed (${this.socket!.url})`, e);
    this._onClose.dispatch(this, e);
  }

  /**
   * 处理底层消息：二进制前缀直通；否则转文本按行切分。
   * @param data 文本或字节。
   */
  private handleMessage(data: string | Uint8Array): void {
    if (typeof data !== "string") {
      if (data[0] === this.options.binaryRplPrefix) {
        this._onMessage.dispatch(this, data.slice(1));
        return;
      }
      data = uint8ArrayToBinaryString(data);
    }

    if (this.logger.enabledFor(AppLogger.DEBUG)) {
      this.logger.debug("Got message:", typeof data === "string" ? (this.options.logFilter?.(data) ?? data) : data);
    }

    data = this.messageBuffer + data;
    this.messageBuffer = "";
    const lines = data.split(/\r?\n/);
    const rest = lines.pop()!;
    if (rest.length) {
      this.messageBuffer = rest;
    }
    lines.filter((l) => !!l).forEach((l) => this._onMessage.dispatch(this, l));
  }

  /**
   * 发送文本命令并等待应答。
   * @param command 命令行（不含 \r\n）。
   * @param options 应答匹配与超时选项。
   */
  async sendCommand(command: string, options: SendCommandOptions): Promise<IrcReply[]> {
    if (options.replyStartCode && !options.replyEndCode) {
      throw new Error("Invalid argument. Expected a reply end code, but got only a start code.");
    }

    // start-end 模式下累积的 body 应答
    const bodyAccum: IrcReply[] = [];

    return (await this.sendRawCommand(
      command,
      (data, time, resolve, extendTimeout) => {
        const codeMatches = (
          spec: number | [number, (reply: IrcReply) => boolean],
          reply: IrcReply,
        ): boolean => {
          if (typeof spec === "number") return reply.code === spec;
          const [code, predicate] = spec;
          return reply.code === code && predicate(reply);
        };

        let text: string | Uint8Array = data;
        if (typeof text !== "string") {
          if (text[0] === this.options.binaryRplPrefix) return false;
          text = uint8ArrayToBinaryString(text);
        }

        if (options.replyRawText) {
          resolve(text.split(/\r?\n/).map((raw) => ({ raw, time })));
          return true;
        }

        return text
          .split(/\r?\n/)
          .filter((l) => !!l)
          .some((line) => {
            if (options.replyMatch) {
              if (options.replyMatch.exec(line)) {
                resolve([{ raw: line, time }]);
                return true;
              }
              if (!options.replyCodes) return false;
            }

            if (!options.replyEndCode && !options.replyCodes) {
              resolve([{ raw: line, time }]);
              return true;
            }

            const [, codeStr, ...params] = line.split(" ");
            const code = parseInt(codeStr, 10);
            const reply: IrcReply = { raw: line, code, params, time };

            if (options.replyEndCode) {
              if (options.replyCodes && options.replyCodes.some((spec) => codeMatches(spec, reply))) {
                resolve([reply]);
                return true;
              }
              if (options.replyHeartbeatCodes && options.replyHeartbeatCodes.indexOf(code) !== -1) {
                extendTimeout(options.heartbeatTimeout);
              }
              if (
                code === options.replyStartCode ||
                (options.replyBodyCodes && options.replyBodyCodes.indexOf(code) !== -1) ||
                code === options.replyEndCode
              ) {
                bodyAccum.push(reply);
              }
              if (code === options.replyEndCode) {
                resolve(bodyAccum);
                return true;
              }
              return false;
            }

            if (options.replyCodes === undefined) {
              throw new Error("List of replyCodes must be specified when not using start/end codes");
            }
            if (options.replyCodes.some((spec) => codeMatches(spec, reply))) {
              resolve([reply]);
              return true;
            }
            return false;
          });
      },
      options.timeout,
    ));
  }

  /**
   * 发送二进制命令并等待类型码应答。
   * @param command 以 binaryReqPrefix 开头的字节。
   * @param options 应答类型码与超时。
   */
  async sendBinCommand(command: Uint8Array, options: SendBinCommandOptions): Promise<IrcBinReply> {
    const rplPrefix = this.options.binaryRplPrefix;
    if (rplPrefix === undefined) {
      throw new Error("Must configure binary message reply prefix to send binary commands");
    }
    const reqPrefix = this.options.binaryReqPrefix;
    if (reqPrefix === undefined) {
      throw new Error("Must configure binary message request prefix to send binary commands");
    }
    if (command[0] !== reqPrefix) {
      throw new Error("Binary command must start with the magic prefix 0x" + reqPrefix.toString(16));
    }

    return (await this.sendRawCommand(
      command,
      (data, time, resolve) => {
        if (typeof data === "string" || data[0] !== rplPrefix) return false;
        const code = data[1];
        if (options.replyCodes.indexOf(code) !== -1) {
          resolve({ code, data: data.slice(2), time });
          return true;
        }
        return false;
      },
      options.timeout,
    )) as Promise<IrcBinReply>;
  }

  /**
   * 底层：发送原始负载并挂接 message/close 监听直至匹配或超时。
   * @param payload 文本或二进制负载。
   * @param matcher 匹配回调（返回 true 表示完成）。
   * @param timeout 超时秒数（缺省用 this.timeout）。
   */
  private sendRawCommand(
    payload: string | Uint8Array,
    matcher: RawCommandMatcher,
    timeout?: number,
  ): Promise<any> {
    return new Promise((resolvePromise, rejectPromise) => {
      let isDone = false;
      let timer: ReturnType<typeof setTimeout> | undefined;

      const clearAndResolve = (value: unknown) => {
        clearTimeout(timer);
        resolvePromise(value);
      };
      const clearAndExtend = (seconds?: number) => {
        clearTimeout(timer);
        if (seconds !== undefined && Number.isFinite(seconds)) {
          timer = setTimeout(onTimeout, 1000 * (seconds ?? timeout ?? this.timeout));
        }
      };
      const fail = (err: unknown) => {
        this.socket?.removeEventListener("message", onMessage);
        this.socket?.removeEventListener("close", onClose);
        clearTimeout(timer);
        timer = undefined;
        rejectPromise(err);
      };
      const onTimeout = () => {
        const label =
          typeof payload === "string"
            ? (this.options.logFilter?.(payload) ?? payload)
            : "0x" + payload[1].toString(16);
        fail(new NoReplyError("Timeout reached for command " + label));
      };
      const onClose = async () => {
        // 等待可能仍在处理中的 matcher
        while (isDone) await sleep(10);
        if (!isDone) fail(new SocketError("Connection was closed prematurely"));
      };

      let matched = false;
      const onMessage = (ev: MessageEvent) => {
        if (matched) return;
        const time = Date.now();
        const tryMatch = (data: string | Uint8Array) => {
          if (matcher(data, time, clearAndResolve, clearAndExtend)) {
            matched = true;
            this.socket!.removeEventListener("message", onMessage);
            this.socket!.removeEventListener("close", onClose);
          }
        };
        if (ev.data instanceof ArrayBuffer) {
          tryMatch(new Uint8Array(ev.data));
        } else {
          tryMatch(ev.data);
        }
      };

      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        timer = setTimeout(onTimeout, 1000 * (timeout ?? this.timeout));
        this.socket.addEventListener("message", onMessage);
        this.socket.addEventListener("close", onClose);
        try {
          this.sendMessage(payload);
        } catch (err) {
          fail(err);
        }
      } else {
        fail(
          new SocketError(
            "Send command failed. Socket is not open." +
              (this.socket ? ` (readyState = ${this.socket.readyState})` : ""),
          ),
        );
      }
    });
  }

  /**
   * 发送一条消息（文本自动补 \r\n；binary 模式下文本转字节）。
   * @param message 文本或字节。
   */
  sendMessage(message: string | Uint8Array): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new SocketError(
        "Socket is not open" + (this.socket ? ` (readyState = ${this.socket.readyState})` : ""),
      );
    }
    if (this.logger.enabledFor(AppLogger.DEBUG)) {
      this.logger.debug(
        "Sent message:",
        typeof message === "string" ? (this.options.logFilter?.(message) ?? message) : message,
      );
    }
    if (typeof message === "string") {
      message += "\r\n";
    }
    let out: string | Uint8Array;
    out = this.options.mode === "binary" && typeof message === "string"
      ? binaryStringToUint8Array(message)
      : message;
    this.socket.send(out);
  }

  /**
   * PING 往返测延迟。
   * @param timeout 超时秒数。
   * @returns 往返毫秒数。
   */
  async ping(timeout?: number): Promise<number> {
    const sentAt = Date.now();
    const replies = await this.sendCommand("ping :" + sentAt, {
      replyMatch: new RegExp("^:[^ ]+ PONG [^ :]+ :" + sentAt, "i"),
      timeout,
    });
    return replies[0].time - sentAt;
  }

  /** 关闭套接字（若存在）。 */
  close(): void {
    this.socket?.close();
  }

  /** 套接字是否处于 OPEN。 */
  isOpen(): boolean {
    return !!this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}
