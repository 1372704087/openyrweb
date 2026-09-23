/**
 * SoloPlayTurnManager — 单机模式回合管理器。
 *
 * 由 network/gamestate/SoloPlayTurnManager.ts.js 重写为 TS（行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 *
 * 关键语义（勿改）：
 * - `gameTurnMillis = 1000 / (speed * BASE_TICKS_PER_SECOND)`。
 * - 无输入时入队 NoAction；有动作先记入 replayRecorder。
 * - 速度变更经 desiredSpeed.onChange 订阅，dispose 时退订。
 */

import { NoAction } from "game/action/NoAction"; // 孪生
import * as GameModule from "game/Game"; // 孪生
import { GameSpeed } from "game/GameSpeed"; // 孪生

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Game = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GameStatus: any = (GameModule as any).GameStatus;

/** 可被回合消费的动作接口（与 game/action 对偶）。 */
export interface ProcessableAction {
  /** 归属玩家（process 前由管理器注入）。 */
  player?: unknown;
  /** 执行动作。 */
  process(): void;
  /** 打印调试文本；无则返回 falsy。 */
  print(): string | undefined | null | "";
}

/** 输入动作队列。 */
export interface InputActionQueue {
  /** 取出全部待处理动作。 */
  dequeueAll(): ProcessableAction[];
}

/** 动作日志器（可选 debug）。 */
export interface ActionLogger {
  debug(msg: string): void;
}

/** 回放记录器。 */
export interface ReplayRecorder {
  /**
   * 记录本 tick 的动作列表。
   * @param tick 当前 tick
   * @param actions 动作列表
   */
  recordActions(tick: number, actions: ProcessableAction[]): void;
}

/** 单机回合管理器。 */
export class SoloPlayTurnManager {
  private game: Game;
  private currentPlayer: unknown;
  private inputActions: InputActionQueue;
  private actionLogger?: ActionLogger;
  private replayRecorder: ReplayRecorder;
  private errorState = false;
  private gameSpeedChanged = false;
  private gameTurnMillis!: number;
  private onGameSpeedChanged = (): void => {
    this.gameSpeedChanged = true;
  };

  /**
   * @param game 游戏实例
   * @param currentPlayer 当前输入玩家
   * @param inputActions 输入动作队列
   * @param actionLogger 可选动作日志
   * @param replayRecorder 回放记录器
   */
  constructor(
    game: Game,
    currentPlayer: unknown,
    inputActions: InputActionQueue,
    actionLogger: ActionLogger | undefined,
    replayRecorder: ReplayRecorder,
  ) {
    this.game = game;
    this.currentPlayer = currentPlayer;
    this.inputActions = inputActions;
    this.actionLogger = actionLogger;
    this.replayRecorder = replayRecorder;
  }

  /** 订阅速度变更并按当前速度计算 gameTurn 毫秒。 */
  init(): void {
    this.game.desiredSpeed.onChange.subscribe(this.onGameSpeedChanged);
    this.computeGameTurn(this.game.speed.value);
  }

  /**
   * 由速度档计算单回合毫秒数。
   * @param speed 速度档
   */
  computeGameTurn(speed: number): void {
    this.gameTurnMillis = 1000 / (speed * GameSpeed.BASE_TICKS_PER_SECOND);
  }

  /** 进入错误态（后续 doGameTurn 空转）。 */
  setErrorState(): void {
    this.errorState = true;
  }

  /** 是否错误态。 */
  getErrorState(): boolean {
    return this.errorState;
  }

  /** 单回合毫秒数。 */
  getTurnMillis(): number {
    return this.gameTurnMillis;
  }

  /**
   * 执行一帧 game turn。
   * @param elapsed 当前时间/已过毫秒（用于日志时序）
   */
  doGameTurn(elapsed: number): void {
    void elapsed;
    if (this.errorState) return;
    // 与孪生一致：status !== Ended 时处理动作（GameStatus 为孪生枚举）
    if (this.game.status !== GameStatus.Ended) {
      const actions = this.inputActions.dequeueAll();
      if (actions.length) {
        this.replayRecorder.recordActions(this.game.currentTick, actions);
      } else {
        actions.push(new NoAction() as unknown as ProcessableAction);
      }
      this.processActions(actions);
    }
    this.game.update();
    if (this.gameSpeedChanged) {
      (this.game.speed as { value: number }).value = (this.game.desiredSpeed as { value: number }).value;
      this.computeGameTurn(this.game.speed.value);
      this.gameSpeedChanged = false;
    }
  }

  /**
   * 逐条注入玩家并 process，附带 debug 打印。
   * @param actions 动作列表
   */
  processActions(actions: ProcessableAction[]): void {
    actions.forEach((action) => {
      action.player = this.currentPlayer;
      action.process();
      const line = action.print();
      const playerName = (action.player as { name?: string } | undefined)?.name;
      if (line) this.actionLogger?.debug(`(${playerName})@${this.game.currentTick}: ` + line);
    });
  }

  /** 退订速度变更。 */
  dispose(): void {
    this.game.desiredSpeed.onChange.unsubscribe(this.onGameSpeedChanged);
  }
}