/**
 * TauntHandler — taunt 收发与 5 秒节流。
 *
 * 由 gui/screen/game/TauntHandler.ts.js 重写为 TS（行为完全一致）。
 */
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** taunt 处理器。 */
export class TauntHandler {
  /** gserv 连接。 */
  gservCon: any;
  /** 本地玩家。 */
  localPlayer: any;
  /** 游戏。 */
  game: any;
  /** 回放录制。 */
  replayRecorder: any;
  /** 是否允许 taunt。 */
  tauntsEnabled: any;
  /** 播放器。 */
  tauntPlayback: any;
  /** 屏蔽集。 */
  mutedPlayers: Set<string>;
  /** 每玩家最近 taunt 时间。 */
  lastTauntTimeByPlayer = new Map<string, number>();
  /** 释放容器。 */
  disposables = new CompositeDisposable();
  /** 消息回调。 */
  handleMessage: (msg: any) => void;

  /**
   * @param gservCon gserv
   * @param localPlayer 本地玩家
   * @param game 游戏
   * @param replayRecorder 回放
   * @param tauntsEnabled 开关 BoxedVar
   * @param tauntPlayback 播放
   * @param mutedPlayers 屏蔽集
   */
  constructor(
    gservCon: any,
    localPlayer: any,
    game: any,
    replayRecorder: any,
    tauntsEnabled: any,
    tauntPlayback: any,
    mutedPlayers: Set<string>,
  ) {
    this.gservCon = gservCon;
    this.localPlayer = localPlayer;
    this.game = game;
    this.replayRecorder = replayRecorder;
    this.tauntsEnabled = tauntsEnabled;
    this.tauntPlayback = tauntPlayback;
    this.mutedPlayers = mutedPlayers;
    this.lastTauntTimeByPlayer = new Map();
    this.disposables = new CompositeDisposable();
    this.handleMessage = (msg: any) => {
      if (!this.tauntsEnabled.value) return;
      const player = this.game.getPlayerByName(msg.from);
      if (!player.country) return;
      if (this.mutedPlayers.has(player.name)) return;
      if (!this.checkAndUpdateLastTauntTime(player.name)) return;
      this.recordReplayEvent(player, msg.tauntNo);
      this.tauntPlayback.playTaunt(player, msg.tauntNo).catch((e: any) => console.error(e));
    };
  }

  /** 订阅 gserv taunt。 */
  init(): void {
    this.gservCon.onTaunt.subscribe(this.handleMessage);
    this.disposables.add(() => this.gservCon.onTaunt.unsubscribe(this.handleMessage));
  }

  /**
   * 发送 taunt。
   * @param no taunt 序号
   */
  sendTaunt(no: number): void {
    if (!this.checkAndUpdateLastTauntTime(this.localPlayer.name)) return;
    if (!this.gservCon.isOpen()) return;
    this.gservCon.sendTaunt(no);
    this.recordReplayEvent(this.localPlayer, no);
    this.tauntPlayback.playTaunt(this.localPlayer, no).catch((e: any) => console.error(e));
  }

  /**
   * 5 秒节流：通过则更新时间戳。
   * @param playerName 玩家名
   */
  checkAndUpdateLastTauntTime(playerName: string): boolean {
    const now = Date.now();
    const last = this.lastTauntTimeByPlayer.get(playerName);
    if (last && now - last <= 5e3) return false;
    this.lastTauntTimeByPlayer.set(playerName, now);
    return true;
  }

  /**
   * 记录回放 taunt 事件。
   * @param player 玩家
   * @param no 序号
   */
  recordReplayEvent(player: any, no: number): void {
    this.replayRecorder.recordTaunt(this.game.currentTick, player.name, no);
  }

  /** 释放订阅。 */
  dispose(): void {
    this.disposables.dispose();
  }
}
