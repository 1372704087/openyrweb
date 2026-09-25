/**
 * ReplayTurnManager — 回放模式下的回合驱动器（按 Replay 事件推进游戏）。
 *
 * 由 network/gamestate/ReplayTurnManager.ts.js 重写为 TS（行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 *
 * 关键语义（勿改）：
 * - init() 订阅 desiredSpeed 变化，并创建 replay 事件迭代器。
 * - doGameTurn 消费 tickNo === currentTick 的事件；tick 落后抛 desync。
 * - endTick+1 <= currentTick 时置 GameStatus.Ended；结束后 speed=0。
 * - processActions 经 actionFactory 创建动作并 process()，可选 debug 打印。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

import * as GameModule from "game/Game"; // 孪生
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Game = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GameStatus: any = (GameModule as any).GameStatus;
import { GameSpeed } from "game/GameSpeed"; // 孪生
import { TurnActionsReplayEvent } from "network/gamestate/replay/TurnActionsReplayEvent"; // 孪生
import type { PlayerActionsEntry } from "network/gamestate/replay/TurnActionsReplayEvent"; // 已转换
type TurnActionsPayload = PlayerActionsEntry[];
import { EventDispatcher } from "util/event"; // 孪生
import type { Replay } from "network/gamestate/Replay"; // 孪生
import type { ReplayEvent } from "network/gamestate/replay/ReplayEvent"; // 孪生

/** 动作工厂最小接口。 */
export interface ReplayActionFactory {
  /** 按类型 id 创建动作实例。 */
  create(id: number): ReplayGameAction;
}

/** 游戏内动作最小接口。 */
export interface ReplayGameAction {
  /** 所属玩家（由 processActions 赋值）。 */
  player?: { name: string };
  /** 反序列化参数。 */
  unserialize(params?: unknown): void;
  /** 执行动作。 */
  process(): void;
  /** 返回可打印描述（可为空）。 */
  print?(): string | undefined | void;
}

/** 动作日志器最小接口。 */
export interface ReplayActionLogger {
  /** debug 级日志。 */
  debug(message: string): void;
}

/** 回放回合驱动器。 */
export class ReplayTurnManager {
  /** 回放事件广播。 */
  private _onReplayEvent = new EventDispatcher();
  /** 是否已进入错误态（停止推进）。 */
  private errorState = false;
  /** 期望速度是否在本 tick 内变更。 */
  private gameSpeedChanged = false;
  /** 当前单回合毫秒数。 */
  private gameTurnMillis = 0;
  /** 回放事件迭代器。 */
  private replayIterator?: Iterator<ReplayEvent>;
  /** 下一个待消费的回放事件。 */
  private nextReplayEvent?: ReplayEvent;

  /**
   * @param game 目标游戏。
   * @param replay 回放数据。
   * @param actionFactory 动作工厂。
   * @param actionLogger 动作日志器（可选）。
   */
  constructor(
    private game: Game,
    private replay: Replay,
    private actionFactory: ReplayActionFactory,
    private actionLogger?: ReplayActionLogger,
  ) {}

  /** 回放事件广播（只读事件视图）。 */
  get onReplayEvent() {
    return this._onReplayEvent.asEvent();
  }

  /** desiredSpeed 变化回调（订阅用）。 */
  private onGameSpeedChanged = () => {
    this.gameSpeedChanged = true;
  };

  /** 初始化：订阅速度变化、计算回合毫秒、创建事件迭代器。 */
  init(): void {
    this.game.desiredSpeed.onChange.subscribe(this.onGameSpeedChanged);
    this.computeGameTurn(this.game.speed.value);
    this.replayIterator = this.replay.getEvents().values();
    this.nextReplayEvent = this.replayIterator.next().value;
  }

  /**
   * 按速度值计算单回合毫秒数。
   * @param speed 游戏速度倍率。
   */
  private computeGameTurn(speed: number): void {
    this.gameTurnMillis = 1000 / (speed * GameSpeed.BASE_TICKS_PER_SECOND);
  }

  /** 标记错误态（停止推进）。 */
  setErrorState(): void {
    this.errorState = true;
  }

  /** 是否处于错误态。 */
  getErrorState(): boolean {
    return this.errorState;
  }

  /** 当前单回合毫秒数。 */
  getTurnMillis(): number {
    return this.gameTurnMillis;
  }

  /**
   * 推进一个游戏回合。
   * @param _tick 调用方提供的 tick 参数（保留签名；实现内使用 game.currentTick）。
   */
  doGameTurn(_tick?: number): void {
    if (this.errorState) return;
    if (this.game.status !== GameStatus.Ended) {
      while (this.nextReplayEvent && this.nextReplayEvent.tickNo === this.game.currentTick) {
        if (this.nextReplayEvent instanceof TurnActionsReplayEvent) {
          this.processActions(this.nextReplayEvent.payload as TurnActionsPayload);
        }
        this._onReplayEvent.dispatch(this, this.nextReplayEvent);
        this.nextReplayEvent = this.replayIterator!.next().value;
      }
      if (this.nextReplayEvent && this.nextReplayEvent.tickNo < this.game.currentTick) {
        throw new Error("Replay event desync");
      }
      if (this.replay.endTick! + 1 <= this.game.currentTick) {
        this.game.status = GameStatus.Ended;
      } else {
        this.game.update();
        if (this.gameSpeedChanged) {
          this.game.speed.value = this.game.desiredSpeed.value;
          this.computeGameTurn(this.game.speed.value);
          this.gameSpeedChanged = false;
        }
      }
    } else {
      this.game.speed.value = 0;
    }
  }

  /**
   * 应用一回合的玩家动作。
   * @param payload 玩家 id→动作列表。
   */
  private processActions(payload: TurnActionsPayload): void {
    payload.forEach(([playerId, actions]) =>
      actions.forEach((actionData) => {
        const action = this.actionFactory.create(actionData.id);
        action.player = this.game.getPlayer(playerId);
        action.unserialize(actionData.params);
        action.process();
        const printed = action.print();
        if (printed) {
          this.actionLogger?.debug(`(${action.player!.name})@${this.game.currentTick}: ` + printed);
        }
      }),
    );
  }

  /** 释放：取消速度变化订阅。 */
  dispose(): void {
    this.game.desiredSpeed.onChange.unsubscribe(this.onGameSpeedChanged);
  }
}
