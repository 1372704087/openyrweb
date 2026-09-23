/**
 * WolService — Westwood Online 会话门面（连接/登录/服务器列表/自动重连）。
 *
 * 由 network/WolService.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：
 * - 事件：onWolConnectionLost（经 EventDispatcher.asEvent 暴露）。
 * - 常量：MIN_RECONNECT_MILLIS=5000、MAX_RECONNECT_MILLIS=60000。
 * - connectAndLogin：取消重连 → 若已开且凭据变化则关旧连 → connect → cvers
 *   → 可选 setLocale → login；成功清 ignoreLastWolClose，MOTD 行映射 {text}。
 *   失败仅当非 WolError/ConnectError/SocketError 时清 ignore。
 * - onWolClose：有 connectOpts 且未 ignore 时 dispatch 丢失事件并按 autoReconnect 排重连。
 * - tryReconnect：指数退避（2× 至 MAX）；WolError 则 console.error 不再退避。
 * - matchVersions：major.minor 相等且 patch(去预发布后缀) >= 期望 patch。
 * - closeWolConnection：cancel + 离开全部频道 + close，并置 ignore。
 */

import { EventDispatcher } from "util/event"; // 已转换
import * as ResourceLoaderModule from "engine/ResourceLoader"; // 孪生
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ResourceLoader: any = (ResourceLoaderModule as any).ResourceLoader;
import { IniFile } from "data/IniFile"; // 孪生
import { WolError } from "network/WolError"; // 已转换
import { localeCodeMap, WolLocale } from "network/WolLocale"; // 已转换
import { IrcConnection } from "network/IrcConnection"; // 已转换
import type { WolConfig } from "network/WolConfig"; // 已转换
import type { WolConnection } from "network/WolConnection"; // 已转换
import type { WolGameReport } from "network/WolGameReport"; // 已转换
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CancelToken = any; // 孪生 any-shim

/** 连接选项（url/user/pass 与 getCredentials 对齐）。 */
export interface WolConnectOpts {
  /** WoL 网关 URL。 */
  url: string;
  /** 用户名。 */
  user: string;
  /** 密码。 */
  pass: string;
}

/** 登录返回的 MOTD 行包装。 */
export interface WolLoginMessage {
  /** 单行文本。 */
  text: string;
}

/** 登录队列更新回调参数。 */
export interface LoginQueueUpdateData {
  /** 队列位置。 */
  position: number;
  /** 平均等待秒数。 */
  avgWaitSeconds: number;
}

/** WoL 会话服务。 */
export class WolService {
  /** 客户端配置。 */
  wolConfig: WolConfig;
  /** 底层连接。 */
  wolCon: WolConnection;
  /** 客户端版本串（cvers / 版本比对）。 */
  clientVersion: string;
  /** 客户端语言环境（可选，映射为 setlocale 码）。 */
  clientLocale: string | undefined;
  /** 忽略下一次 close（主动关闭时置 true）。 */
  ignoreLastWolClose = false;
  /** 自动重连开关。 */
  autoReconnect = false;
  /** 正在重连中。 */
  pendingReconnect = false;
  /** 上次连接选项（重连凭据）。 */
  connectOpts: WolConnectOpts | undefined;
  /** 重连定时器。 */
  reconnectTimeout: ReturnType<typeof setTimeout> | undefined;
  /** 最近一次对局报告。 */
  lastGameReport: WolGameReport | undefined;

  private _onWolConnectionLost = new EventDispatcher();

  /** 最小重连间隔（5s）。 */
  static readonly MIN_RECONNECT_MILLIS = 5000;
  /** 最大重连间隔（60s）。 */
  static readonly MAX_RECONNECT_MILLIS = 60000;

  /** 连接丢失事件。 */
  get onWolConnectionLost() {
    return this._onWolConnectionLost.asEvent();
  }

  constructor(
    wolConfig: WolConfig,
    wolCon: WolConnection,
    clientVersion: string,
    clientLocale: string | undefined,
  ) {
    this.wolConfig = wolConfig;
    this.wolCon = wolCon;
    this.clientVersion = clientVersion;
    this.clientLocale = clientLocale;
    this.autoReconnect = false;
    this.pendingReconnect = false;
  }

  /** WoL 关闭回调（由 init 订阅到 onClose）。 */
  onWolClose = (event?: unknown): void => {
    if (this.connectOpts && !this.ignoreLastWolClose) {
      if (this.autoReconnect && !this.pendingReconnect) {
        this.reconnectTimeout = setTimeout(
          () => this.tryReconnect(WolService.MIN_RECONNECT_MILLIS),
          0,
        );
      }
      this._onWolConnectionLost.dispatch(this, event);
    }
    this.ignoreLastWolClose = false;
  };

  /** 对局报告回调（缓存到 lastGameReport）。 */
  onGameReport = (report: WolGameReport): void => {
    this.lastGameReport = report;
  };

  /** 订阅底层事件（须在使用前调用）。 */
  init(): void {
    this.wolCon.onGameReport.subscribe(this.onGameReport);
    this.wolCon.onClose.subscribe(this.onWolClose);
  }

  /** 取客户端配置。 */
  getConfig(): WolConfig {
    return this.wolConfig;
  }

  /** 取底层连接。 */
  getConnection(): WolConnection {
    return this.wolCon;
  }

  /** 是否已连接打开。 */
  isConnected(): boolean {
    return this.wolCon.isOpen();
  }

  /** 取当前连接凭据（未连过返回 undefined）。 */
  getCredentials(): { user: string; pass: string } | undefined {
    return this.connectOpts
      ? { user: this.connectOpts.user, pass: this.connectOpts.pass }
      : undefined;
  }

  /** 最近一次对局报告。 */
  getLastGameReport(): WolGameReport | undefined {
    return this.lastGameReport;
  }

  /** 连接并登录；返回 MOTD 行包装数组。 */
  async connectAndLogin(
    opts: WolConnectOpts,
    onQueueUpdate?: (data: LoginQueueUpdateData) => void,
  ): Promise<WolLoginMessage[]> {
    const { url, user, pass } = opts;
    this.cancelReconnect();
    if (this.wolCon.isOpen() && JSON.stringify(this.connectOpts) !== JSON.stringify(opts)) {
      this.closeWolConnection();
    }
    this.connectOpts = opts;
    this.ignoreLastWolClose = true;
    try {
      await this.wolCon.connect(url);
      await this.wolCon.cvers(this.clientVersion, this.wolConfig.getClientSku());
      if (this.clientLocale !== undefined) {
        const code = localeCodeMap.get(this.clientLocale);
        if (code !== undefined) await this.wolCon.setLocale(code);
      }
      const motd = await this.wolCon.login(user, pass, onQueueUpdate);
      this.ignoreLastWolClose = false;
      return motd.map((line) => ({ text: line }));
    } catch (err) {
      if (
        !(err instanceof WolError) &&
        !(err instanceof IrcConnection.ConnectError) &&
        !(err instanceof IrcConnection.SocketError)
      ) {
        this.ignoreLastWolClose = false;
      }
      throw err;
    }
  }

  /** 加载服务器列表 INI 文本并解析。 */
  async loadServerList(url: string, cancelToken?: CancelToken): Promise<IniFile> {
    const loader = new ResourceLoader("");
    const text = await loader.loadText(url, cancelToken);
    return new IniFile().fromString(text);
  }

  /** 校验游戏版本是否匹配客户端（不匹配抛 WolError.OutdatedClient）。 */
  async validateGameVersion(info: { gameVersion?: string }): Promise<void> {
    if (info.gameVersion && !this.matchVersions(this.clientVersion, info.gameVersion)) {
      throw new WolError(
        `Game version mismatch: client version is ${this.clientVersion}, but expected ` +
          info.gameVersion,
        WolError.Code.OutdatedClient,
      );
    }
  }

  /** 版本比对：major.minor 必须相同，且本地 patch >= 期望 patch。 */
  matchVersions(local: string, expected: string): boolean {
    const [lMajor, lMinor, lPatch] = local.split(".");
    const [eMajor, eMinor, ePatch] = expected.split(".");
    return (
      lMajor === eMajor && lMinor === eMinor && Number(lPatch.split("-")[0]) >= Number(ePatch)
    );
  }

  /** 尝试重连并恢复频道；失败按指数退避（上限 MAX）。 */
  async tryReconnect(delayMillis: number): Promise<void> {
    if (this.connectOpts && !this.pendingReconnect) {
      try {
        this.pendingReconnect = true;
        await this.connectAndLogin(this.connectOpts);
        await this.wolCon.rejoinLastChannels();
      } catch (err) {
        if (err instanceof WolError) {
          console.error("Failed to reconnect to WoL service", err);
        } else {
          const next = Math.min(WolService.MAX_RECONNECT_MILLIS, 2 * delayMillis);
          this.reconnectTimeout = setTimeout(() => this.tryReconnect(next), delayMillis);
        }
      } finally {
        this.pendingReconnect = false;
      }
    }
  }

  /** 开关自动重连；关时取消挂起的重连。 */
  setAutoReconnect(enabled: boolean): void {
    if (enabled !== this.autoReconnect) {
      this.autoReconnect = enabled;
      if (!enabled) this.cancelReconnect();
    }
  }

  /** 主动关闭 WoL 连接（清 connectOpts、忽略本次 onClose）。 */
  closeWolConnection(): void {
    this.cancelReconnect();
    if (this.wolCon.isOpen()) {
      this.connectOpts = undefined;
      this.ignoreLastWolClose = true;
      this.wolCon.leaveAllChannels();
      this.wolCon.close();
    }
  }

  /** 释放：取消重连并退订底层事件。 */
  dispose(): void {
    this.cancelReconnect();
    this.wolCon.onGameReport.unsubscribe(this.onGameReport);
    this.wolCon.onClose.unsubscribe(this.onWolClose);
  }

  /** 取消挂起的重连（必要时关连、清定时器）。 */
  cancelReconnect(): void {
    if (this.pendingReconnect) this.wolCon.close();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = undefined;
    }
  }
}
