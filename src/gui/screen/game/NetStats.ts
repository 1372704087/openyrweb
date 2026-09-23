/**
 * NetStats — 网络统计面板（RTT + 本地玩家 LAT）。
 *
 * 由 gui/screen/game/NetStats.ts.js 重写为 TS（行为完全一致）。
 */
import * as StatsModule from "stats.js"; // 孪生
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：stats.js 未转换为 TS，取命名空间上的可用导出
const Stats: any = (StatsModule as any).default ?? StatsModule;

/** 网络统计。 */
export class NetStats {
  /** lockstep。 */
  lockstep: any;
  /** 玩家。 */
  player: any;
  /** 渲染器。 */
  renderer: any;
  /** ping 监控。 */
  pingMonitor: any;
  /** 释放容器。 */
  disposables = new CompositeDisposable();

  /**
   * @param lockstep lockstep
   * @param player 玩家
   * @param renderer 渲染器
   * @param pingMonitor ping 监控
   */
  constructor(lockstep: any, player: any, renderer: any, pingMonitor: any) {
    this.lockstep = lockstep;
    this.player = player;
    this.renderer = renderer;
    this.pingMonitor = pingMonitor;
    this.disposables = new CompositeDisposable();
  }

  /** 挂载 RTT（及非观察者的 LAT）面板。 */
  init(): void {
    const stats = this.renderer.getStats();
    const rttPanel = new Stats.Panel("ms RTT", "#ff8", "#221");
    const maxRtt = 250;
    const onSample = (ms: number) => {
      requestAnimationFrame(() => rttPanel.update(ms, maxRtt));
    };
    this.pingMonitor.onNewSample.subscribe(onSample);
    this.disposables.add(() => {
      this.pingMonitor.onNewSample.unsubscribe(onSample);
      const s = this.renderer.getStats();
      if (s && rttPanel.dom) s.dom.removeChild(rttPanel.dom);
    });
    stats.addPanel(rttPanel);
    if (!this.player.isObserver) {
      const latPanel = new Stats.Panel("ms LAT", "#f8f", "#212");
      const pending = new Map<number, number>();
      this.lockstep.onActionsSent.subscribe((turn: number) => {
        pending.set(turn, performance.now());
      });
      this.lockstep.onActionsReceived.subscribe((turn: number) => {
        if (pending.has(turn)) {
          const lat = performance.now() - pending.get(turn);
          pending.delete(turn);
          requestAnimationFrame(() => latPanel.update(lat, 1e3));
        }
      });
      stats.addPanel(latPanel);
      this.disposables.add(() => {
        const s = this.renderer.getStats();
        if (s && latPanel.dom) s.dom.removeChild(latPanel.dom);
      });
    }
  }

  /** 释放面板与订阅。 */
  dispose(): void {
    this.disposables.dispose();
  }
}
