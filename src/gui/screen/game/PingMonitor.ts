/**
 * PingMonitor — 周期向 gserv 发 ping，写入 MedianPing 并广播样本事件。
 *
 * 由 gui/screen/game/PingMonitor.ts.js 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as IrcConnectionModule from "network/IrcConnection"; // 孪生
import { EventDispatcher } from "util/event"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：NoReplyError 取命名空间
const IrcConnection: any = IrcConnectionModule as any;

/** 网络延迟监控。 */
export class PingMonitor {
  /** 游戏回合管理器。 */
  gameTurnMgr: any;
  /** gserv 连接。 */
  gservCon: any;
  /** 中位数 ping 采样器。 */
  avgPing: any;
  /** 轮询间隔（ms）。 */
  pingIntervalMillis: number;
  /** 单次 ping 超时秒数。 */
  pingTimeoutSeconds: number;
  /** 是否已释放。 */
  isDisposed = false;
  /** 当前定时器 id。 */
  pingTimeoutId: ReturnType<typeof setTimeout> | undefined;
  /** 新样本事件源。 */
  private _onNewSample = new EventDispatcher();

  /** 新样本事件（只读视图）。 */
  get onNewSample() {
    return this._onNewSample.asEvent();
  }

  /**
   * @param gameTurnMgr 回合管理
   * @param gservCon gserv 连接
   * @param avgPing 中位数采样
   * @param pingIntervalMillis 间隔 ms，默认 1000
   * @param pingTimeoutSeconds 超时秒，默认 5
   */
  constructor(
    gameTurnMgr: any,
    gservCon: any,
    avgPing: any,
    pingIntervalMillis = 1e3,
    pingTimeoutSeconds = 5,
  ) {
    this.gameTurnMgr = gameTurnMgr;
    this.gservCon = gservCon;
    this.avgPing = avgPing;
    this.pingIntervalMillis = pingIntervalMillis;
    this.pingTimeoutSeconds = pingTimeoutSeconds;
    this.isDisposed = false;
    this._onNewSample = new EventDispatcher();
  }

  /** 启动（或重启）轮询。 */
  monitor(): void {
    this.isDisposed = false;
    this.pingTimeoutId ??= setTimeout(() => this.updatePing(), this.pingIntervalMillis);
  }

  /**
   * 修改间隔；若有挂起定时器则清掉并立刻补一次。
   * @param millis 新间隔
   */
  setPingInterval(millis: number): void {
    if (millis !== this.pingIntervalMillis) {
      this.pingIntervalMillis = millis;
      if (this.pingTimeoutId) {
        clearTimeout(this.pingTimeoutId);
        this.updatePing();
      }
    }
  }

  /** 执行一次 ping 并调度下一次。 */
  async updatePing(): Promise<void> {
    this.pingTimeoutId = void 0;
    if (this.gameTurnMgr.getErrorState() || !this.gservCon.isOpen()) return;
    let rtt: number;
    try {
      rtt = await this.gservCon.ping(this.pingTimeoutSeconds);
      if (this.isDisposed || this.pingTimeoutId) return;
    } catch (e: any) {
      if (!(e instanceof IrcConnection.NoReplyError)) console.error(e);
      rtt = 1e3 * this.pingTimeoutSeconds;
    }
    this.avgPing.pushSample(rtt);
    this._onNewSample.dispatch(this, rtt);
    this.pingTimeoutId = setTimeout(() => this.updatePing(), this.pingIntervalMillis);
  }

  /** 清定时器并标记释放；重置事件分发器。 */
  dispose(): void {
    if (this.pingTimeoutId) clearTimeout(this.pingTimeoutId);
    this.isDisposed = true;
    this._onNewSample = new EventDispatcher();
  }
}
