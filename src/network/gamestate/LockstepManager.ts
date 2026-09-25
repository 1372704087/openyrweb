/**
 * LockstepManager — 联机锁步回合管理器（收发动作、hash 校验、lag 状态）。
 *
 * 由 network/gamestate/LockstepManager.ts.js 重写为 TS（忠实翻译，行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 *
 * 关键语义（勿改）：
 * - PREFERRED_HASH_CHECK_MILLIS = 1000 静态属性。
 * - canAdvanceNetworkTurn：turn < 2 或已收到 turn-2 的动作。
 * - rate 变更队列、comms lag 阈值 LAG_STATE_THRESH_MILLIS、被动模式发送。
 * - 收到动作 → 入 Map 并广播 onActionsReceived；处理 turn-2 后 delete 并广播 onActionsProcessed。
 * - 网络回合慢于游戏回合时走子回合（currentSubTurn）路径。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

import { DataStream } from "data/DataStream"; // 孪生
import { NoAction } from "game/action/NoAction"; // 孪生
import { EventDispatcher } from "util/event"; // 孪生
import * as gservConfig from "network/gservConfig"; // 孪生
import { GameSpeed } from "game/GameSpeed"; // 孪生
import { computeNetworkTurnMillis } from "network/gamestate/lockstepUtil"; // 孪生
import { GameStatus } from "game/Game"; // 孪生 r.GameStatus（Game 模块导出）
import type { Parser, PlayerActionPayload } from "network/gameopt/Parser"; // 类型
import type { Serializer } from "network/gameopt/Serializer"; // 类型

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Game = any;

/** gserv 连接（本管理器所需子集）。 */
export interface GservConnectionLike {
  onGameActions: {
    subscribe(fn: (data: ArrayBuffer) => void): void;
    unsubscribe(fn: (data: ArrayBuffer) => void): void;
  };
  onGameDesync: {
    subscribe(fn: () => void): void;
    unsubscribe(fn: () => void): void;
  };
  sendPlayerActive(active: boolean): void;
  sendPlayerActions(turnNo: number, payload: Uint8Array): void;
  sendGameStateHash(turnNo: number, hash: number | string): void;
}

/** 动作序列化器（action → 负载）。 */
export interface ActionSerializerLike {
  getActionPayload(action: LockstepAction): PlayerActionPayload;
}

/** 动作工厂。 */
export interface ActionFactoryLike {
  create(id: number): LockstepAction;
}

/** 锁步动作。 */
export interface LockstepAction {
  player?: unknown;
  unserialize(params: Uint8Array): void;
  process(): void;
  print(): string | undefined | null | "";
}

/** 输入队列。 */
export interface InputQueueLike {
  dequeueAll(): LockstepAction[];
}

/** 可选日志。 */
export interface OptionalLogger {
  debug(msg: string): void;
}

/** 回放记录。 */
export interface ReplayRecorderLike {
  recordActions(tick: number, actions: Map<number, PlayerActionPayload[]>): void;
}

/** rate 变更项（服务器下发）。 */
export interface RateChange {
  rate: number;
  turnNo: number;
}

/** 锁步管理器。 */
export class LockstepManager {
  /** 首选 hash 检查间隔（毫秒，孪生静态属性）。 */
  static PREFERRED_HASH_CHECK_MILLIS = 1000;

  private game: Game;
  private gservCon: GservConnectionLike;
  private gameoptParser: Parser;
  private gameoptSerializer: Serializer;
  private actionSerializer: ActionSerializerLike;
  private actionFactory: ActionFactoryLike;
  private inputActions: InputQueueLike;
  private onDesync: () => void;
  private actionLogger?: OptionalLogger;
  private netLogger?: OptionalLogger;
  private debugLogger?: (msg: string) => void;
  private replayRecorder: ReplayRecorderLike;
  private debugGameState: boolean;
  private debugGameStateHistory: unknown[] = [];
  private queuedRateChanges: RateChange[] = [];
  private errorState = false;
  private passiveMode = false;
  private receivedActions = new Map<number, Map<number, PlayerActionPayload[]>>();
  private receivedNetworkTurn = 0;
  private lagState = false;
  private gameTurnMillis!: number;
  private networkTurnMillis?: number;
  private hashCheckTurnInterval = 1;
  // 与孪生一致：currentNetworkTurn/currentSubTurn 仅在 init() 置 0，构造时不初始化
  private currentNetworkTurn: number;
  private currentSubTurn: number;
  private commsLagStartTime?: number;

  private _onLagStateChange = new EventDispatcher();
  private _onActionsSent = new EventDispatcher();
  private _onActionsProcessed = new EventDispatcher();
  private _onActionsReceived = new EventDispatcher();

  /** lag 状态变更事件。 */
  get onLagStateChange() {
    return this._onLagStateChange.asEvent();
  }
  /** 动作已发送事件（携带网络回合号）。 */
  get onActionsSent() {
    return this._onActionsSent.asEvent();
  }
  /** 动作已处理事件。 */
  get onActionsProcessed() {
    return this._onActionsProcessed.asEvent();
  }
  /** 动作已收到事件。 */
  get onActionsReceived() {
    return this._onActionsReceived.asEvent();
  }

  /**
   * @param game 游戏
   * @param gservCon gserv 连接
   * @param gameoptParser gameopt 解析器
   * @param gameoptSerializer gameopt 序列化器
   * @param actionSerializer 动作序列化
   * @param actionFactory 动作工厂
   * @param inputActions 输入队列
   * @param onDesync desync 回调
   * @param actionLogger 可选动作日志
   * @param netLogger 可选网络日志
   * @param debugLogger 可选 debug 文本回调
   * @param replayRecorder 回放记录
   * @param debugGameState 是否记录调试状态历史
   */
  constructor(
    game: Game,
    gservCon: GservConnectionLike,
    gameoptParser: Parser,
    gameoptSerializer: Serializer,
    actionSerializer: ActionSerializerLike,
    actionFactory: ActionFactoryLike,
    inputActions: InputQueueLike,
    onDesync: () => void,
    actionLogger: OptionalLogger | undefined,
    netLogger: OptionalLogger | undefined,
    debugLogger: ((msg: string) => void) | undefined,
    replayRecorder: ReplayRecorderLike,
    debugGameState: boolean,
  ) {
    this.game = game;
    this.gservCon = gservCon;
    this.gameoptParser = gameoptParser;
    this.gameoptSerializer = gameoptSerializer;
    this.actionSerializer = actionSerializer;
    this.actionFactory = actionFactory;
    this.inputActions = inputActions;
    this.onDesync = onDesync;
    this.actionLogger = actionLogger;
    this.netLogger = netLogger;
    this.debugLogger = debugLogger;
    this.replayRecorder = replayRecorder;
    this.debugGameState = debugGameState;
    this.debugGameStateHistory = [];
    this.queuedRateChanges = [];
    this.receivedActions = new Map();
  }

  /** gserv 动作二进制回调（字段绑定，可安全退订）。 */
  private receiveActions = (data: ArrayBuffer): void => {
    const stream = new DataStream(data);
    const turn = stream.readUint32();
    const byPlayer = this.gameoptParser.parseAllPlayerActions(stream);
    this.receivedNetworkTurn = turn;
    this.receivedActions.set(turn, byPlayer);
    this._onActionsReceived.dispatch(undefined, turn);
  };

  /** desync 回调。 */
  private handleGameDesync = (): void => {
    this.setErrorState();
    this.onDesync();
  };

  /** 初始化时长、回合号，订阅 gserv 事件。 */
  init(): void {
    const desired = this.game.desiredSpeed as unknown as { value: number };
    this.gameTurnMillis = 1000 / (desired.value * GameSpeed.BASE_TICKS_PER_SECOND);
    this.currentNetworkTurn = 0;
    this.currentSubTurn = 0;
    this.gservCon.onGameActions.subscribe(this.receiveActions);
    this.gservCon.onGameDesync.subscribe(this.handleGameDesync);
    this.debug("Init: gameTurnMillis = " + this.gameTurnMillis);
  }

  /** 是否可推进到下一网络回合（需已有 turn-2 数据，或 turn < 2）。 */
  canAdvanceNetworkTurn(): boolean {
    return this.currentNetworkTurn < 2 || this.receivedActions.has(this.currentNetworkTurn - 2);
  }

  /** 进入错误态。 */
  setErrorState(): void {
    this.errorState = true;
  }

  /** 是否错误态。 */
  getErrorState(): boolean {
    return this.errorState;
  }

  /**
   * 接收服务器 rate 变更（首回合立即生效，否则入队）。
   * @param change rate 变更
   * @throws turnNo 过旧时抛 Error（消息与孪生一致）
   */
  setRate(change: RateChange): void {
    this.debug(`Recv rate: ${change.rate} (turn ${change.turnNo})`);
    if (this.currentSubTurn === 0 && this.currentNetworkTurn === 0 && change.turnNo === 0) {
      this.updateRate(change.rate);
    } else {
      if (change.turnNo < this.currentNetworkTurn - 2) {
        throw new Error("Rate change has turn number more than two turns in the past.");
      }
      this.queuedRateChanges.push(change);
    }
  }

  /**
   * 应用 rate：计算 networkTurnMillis 与 hash 检查间隔。
   * @param rate 期望网络回合毫秒
   */
  updateRate(rate: number): void {
    this.networkTurnMillis = computeNetworkTurnMillis(rate, this.gameTurnMillis);
    this.hashCheckTurnInterval = Math.ceil(
      LockstepManager.PREFERRED_HASH_CHECK_MILLIS / this.networkTurnMillis!,
    );
    this.netLogger?.debug(`Rate set to ${rate} (${this.networkTurnMillis}ms) @ ` + this.currentNetworkTurn);
  }

  /**
   * 设置被动模式（后台标签页；仍发动作，不发 hash）。
   * @param passive 是否被动
   */
  setPassiveMode(passive: boolean): void {
    this.debug("Send passive: " + passive);
    this.passiveMode = passive;
    this.gservCon.sendPlayerActive(!passive);
  }

  /** game turn 毫秒数。 */
  getTurnMillis(): number {
    return this.gameTurnMillis;
  }

  /**
   * 执行一帧 game turn（子回合 / 网络回合推进）。
   * @param elapsed 当前时间毫秒
   * @returns 网络回合未就绪时 false；否则 true/void
   */
  doGameTurn(elapsed: number): boolean | void {
    if (this.errorState) return;
    if (!this.networkTurnMillis) throw new Error("Network turn rate should be set by now.");
    const gameStatus = (this.game as Game & { status?: number | string }).status;
    // 孪生 `game.status !== GameStatus.Ended`：Ended=2（===3 恒假曾致结束后仍走锁步主路径）
    const ended = String(gameStatus) === "Ended" || gameStatus === GameStatus.Ended;
    if (ended) {
      this.game.update();
      return;
    }
    if (this.currentSubTurn === 0) {
      const queued = this.queuedRateChanges[0];
      if (queued && queued.turnNo + 2 === this.currentNetworkTurn) {
        this.debug(`Process rate ${queued.rate} (turn ${queued.turnNo})`);
        this.updateRate(queued.rate);
        this.queuedRateChanges.shift();
      }
      if (!this.canAdvanceNetworkTurn()) {
        this.handleCommsLag(true, elapsed);
        this.debug("Lag state: " + this.lagState);
        return false;
      }
      this.debug("Advance turn");
      if (this.commsLagStartTime && elapsed - this.commsLagStartTime > 0) {
        this.netLogger?.debug(
          `Waited ${Math.round(elapsed - this.commsLagStartTime)}ms ` + "for other clients to catch up.",
        );
      }
      this.handleCommsLag(false, elapsed);
      // 修复：被动玩家（后台标签页）也照常发送本回合动作（无输入则 NoAction），
      // 否则服务器锁步永远等不齐玩家，整局卡死在等待广播。
      if (this.currentNetworkTurn >= this.receivedNetworkTurn) this.sendActions();
      if (this.currentNetworkTurn >= 2) {
        const turnActions = this.receivedActions.get(this.currentNetworkTurn - 2);
        if (turnActions) {
          this.replayRecorder.recordActions(this.game.currentTick, turnActions);
          this.processActions(turnActions);
        }
        this.receivedActions.delete(this.currentNetworkTurn - 2);
        this._onActionsProcessed.dispatch(undefined, this.currentNetworkTurn - 2);
      }
      this.game.update();
      const gameWithHash = this.game as unknown as { getHash(): number | string };
      if (!this.passiveMode && this.currentNetworkTurn % this.hashCheckTurnInterval === 0) {
        this.gservCon.sendGameStateHash(this.currentNetworkTurn, gameWithHash.getHash());
      }
      if (this.networkTurnMillis! > this.gameTurnMillis) this.currentSubTurn++;
      else this.currentNetworkTurn++;
    } else {
      this.debug("Update");
      this.game.update();
      this.currentSubTurn++;
      if (this.currentSubTurn >= this.networkTurnMillis! / this.gameTurnMillis) {
        this.currentSubTurn = 0;
        this.currentNetworkTurn++;
      }
    }
    if (this.debugGameState) {
      const cap = (this.networkTurnMillis! / this.gameTurnMillis) * this.hashCheckTurnInterval;
      if (this.debugGameStateHistory.length > cap) this.debugGameStateHistory.shift();
      const debugGame = this.game as unknown as { debugGetState(): unknown };
      this.debugGameStateHistory.push(debugGame.debugGetState());
    }
  }

  /**
   * 通信 lag 状态跟踪（超过 LAG_STATE_THRESH_MILLIS 置位）。
   * @param lagging 是否处于等待
   * @param now 当前时间
   */
  private handleCommsLag(lagging: boolean, now: number): void {
    if (lagging) {
      if (!this.commsLagStartTime) this.commsLagStartTime = now;
      if (now - this.commsLagStartTime > gservConfig.LAG_STATE_THRESH_MILLIS) this.updateLagState(true);
    } else {
      this.commsLagStartTime = undefined;
      this.updateLagState(false);
    }
  }

  /**
   * 更新 lag 标志并在变化时广播。
   * @param lag 新值
   */
  private updateLagState(lag: boolean): void {
    if (lag !== this.lagState) {
      this.lagState = lag;
      this._onLagStateChange.dispatch(undefined, lag);
    }
  }

  /** 出队并发送本回合动作（空则 NoAction）。 */
  private sendActions(): void {
    const actions = this.inputActions.dequeueAll();
    if (!actions.length) actions.push(new NoAction() as unknown as LockstepAction);
    const payload = this.gameoptSerializer.serializePlayerActions(
      actions.map((a) => this.actionSerializer.getActionPayload(a)),
    );
    this.debug("Send actions: " + payload);
    this.gservCon.sendPlayerActions(this.currentNetworkTurn, payload);
    this._onActionsSent.dispatch(undefined, this.currentNetworkTurn);
  }

  /**
   * 处理「playerId → 动作」映射：create、unserialize、process、debug。
   * @param byPlayer 映射
   */
  private processActions(byPlayer: Map<number, PlayerActionPayload[]>): void {
    [...byPlayer].forEach(([playerId, actions]) =>
      actions.forEach((payload) => {
        const action = this.actionFactory.create(payload.id);
        const gameWithGet = this.game as unknown as { getPlayer(id: number): unknown };
        action.player = gameWithGet.getPlayer(playerId);
        action.unserialize(payload.params);
        action.process();
        const line = action.print();
        const name = (action.player as { name?: string } | undefined)?.name ?? "";
        if (line) this.actionLogger?.debug(`(${name})@${this.game.currentTick}: ` + line);
      }),
    );
  }

  /**
   * debug 文本（带 `net-sub-tick` 前缀）。
   * @param msg 消息
   */
  private debug(msg: string): void {
    this.debugLogger?.(`${this.currentNetworkTurn}-${this.currentSubTurn}-${this.game.currentTick}: ` + msg);
  }

  /** 置错误态并退订 gserv 事件。 */
  dispose(): void {
    this.setErrorState();
    this.gservCon.onGameActions.unsubscribe(this.receiveActions);
    this.gservCon.onGameDesync.unsubscribe(this.handleGameDesync);
  }
}
