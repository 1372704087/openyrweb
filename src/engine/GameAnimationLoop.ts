/**
 * GameAnimationLoop — 游戏主循环（RAF 帧推进 + 回合计 + 页面可见性降频）。
 *
 * 由 engine/GameAnimationLoop.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { IrcConnection } from "network/IrcConnection"; // 已转换

const SocketError = (IrcConnection as any).SocketError;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 本地玩家最小形状。 */
export interface LocalPlayerLike {
  isObserver?: boolean;
}

/** 游戏渲染器最小形状。 */
export interface GameRendererLike {
  update(now: number, alpha: number): void;
  render(): boolean | void;
  flush?(): void;
  getStats?(): { begin(): void; end(): void } | undefined | null;
}

/** 音频系统最小形状。 */
export interface SoundSystemLike {
  setMuted(muted: boolean): void;
}

/** 声音子系统（含 audioSystem）。 */
export interface SoundLike {
  audioSystem: SoundSystemLike;
}

/** 回合管理器最小形状。 */
export interface GameTurnManagerLike {
  getTurnMillis(): number;
  doGameTurn(now: number): boolean;
  setErrorState(): void;
  setPassiveMode?(passive: boolean): void;
}

/** 循环选项。 */
export interface GameAnimationLoopOptions {
  /** 每帧允许的 tick 预算（ms）；耗尽则提前 break 剩余步长 */
  skipBudgetMillis?: number;
  /** 是否允许一帧推进多回合（与孪生 skipFrames 一致） */
  skipFrames?: boolean;
  /** 错误回调；render 出错时第二参为 true */
  onError?: (err: unknown, isRender?: boolean) => void;
}

/**
 * 游戏动画主循环。
 * 前台按 RAF 推进 tickGame；document.hidden 时改为 1s interval 低频 tick，并静音。
 */
export class GameAnimationLoop {
  /** 本地玩家（observer 不进入 passive/后台 tick 分支） */
  localPlayer?: LocalPlayerLike;
  /** 游戏渲染器 */
  renderer: GameRendererLike;
  /** 声音系统 */
  sound: SoundLike;
  /** 回合管理器 */
  gameTurnMgr: GameTurnManagerLike;
  /** 选项 */
  options: GameAnimationLoopOptions;
  /** 是否已 start */
  isStarted: boolean;
  /** 渲染器是否已出错（onError 时只报一次 update/render 错） */
  rendererErrorState: boolean;
  /** 页面是否隐藏 */
  paused!: boolean;
  /** 循环起始时间（ms）；回合周期变化时重置 */
  startTime?: number;
  /** 上次对应的绝对回合数 */
  lastGameFrame!: number;
  /** 上次读到的 getTurnMillis() */
  lastGameTurnMillis?: number;
  /** 上次 tickGame 是否等待网络（返回 false） */
  turnMgrIsWaiting?: boolean;
  /** 前台 RAF 句柄 */
  rafId?: number;
  /** 后台 interval 句柄 */
  backgroundIntervalId?: any;

  /**
   * 后台帧：仅 started && paused 时推进；等待中每轮只 tick 1 步。
   * @param t - 当前时间戳（ms）
   */
  doBackgroundFrame = (t: number): void => {
    if (this.isStarted && this.paused) {
      let e = this.updateDeltaGameFrames(t);
      if (this.turnMgrIsWaiting) {
        e = 1;
      }
      while (e > 0) {
        this.turnMgrIsWaiting = this.tickGame(t) === false;
        e--;
      }
    }
  };

  /**
   * 前台帧：按预算 tick 游戏回合，再 updateRenderer + render。
   * @param i - 当前时间戳（ms）
   */
  doFrame = (i: number): void => {
    if (this.isStarted && !this.paused) {
      let t = this.updateDeltaGameFrames(i);
      // 孪生: (this.turnMgrIsWaiting || (!this.options.skipFrames && 1 < t)) && (t = 1)
      if (this.turnMgrIsWaiting || (!this.options.skipFrames && t > 1)) {
        t = 1;
      }
      const stats = this.renderer.getStats?.();
      stats && stats.begin();
      if (this.options.skipBudgetMillis) {
        let budget = this.options.skipBudgetMillis;
        while (t > 0) {
          const start = performance.now();
          this.turnMgrIsWaiting = this.tickGame(i) === false;
          t--;
          const cost = performance.now() - start;
          budget = Math.max(0, budget - cost);
          if (budget <= 0) {
            break;
          }
        }
      } else {
        while (t > 0) {
          this.turnMgrIsWaiting = this.tickGame(i) === false;
          t--;
        }
      }
      const turnMs = this.gameTurnMgr.getTurnMillis();
      const alpha = Math.max(0, (i - (this.startTime! + this.lastGameFrame * turnMs)) / turnMs);
      this.updateRenderer(i, alpha);
      if (this.render()) {
        stats && stats.end();
        this.rafId = requestAnimationFrame(this.doFrame);
      }
    }
  };

  /** 页面可见性切换：暂停/恢复、setPassiveMode、切换 RAF/interval、静音。 */
  handleVisibilityChange = (): void => {
    const hidden = document.hidden;
    if (this.paused !== hidden) {
      // 即将暂停时，observer 以外先补跑一帧后台 tick
      if (
        this.localPlayer &&
        !this.localPlayer.isObserver &&
        this.paused
      ) {
        this.doBackgroundFrame(performance.now());
      }
      this.paused = hidden;
      if (!this.paused) {
        this.startTime = undefined;
        this.lastGameFrame = 0;
      }
      if (this.localPlayer && !this.localPlayer.isObserver) {
        try {
          this.gameTurnMgr.setPassiveMode?.(this.paused);
        } catch (e) {
          // 仅吞 SocketError，其余继续抛出
          if (!(e instanceof (SocketError as any))) {
            throw e;
          }
        }
      }
      if (this.paused) {
        if (this.rafId) {
          cancelAnimationFrame(this.rafId);
          this.rafId = undefined;
        }
        this.backgroundIntervalId = setInterval(() => {
          this.doBackgroundFrame(performance.now());
        }, 1000);
      } else {
        if (this.backgroundIntervalId) {
          clearInterval(this.backgroundIntervalId);
          this.backgroundIntervalId = undefined;
        }
        this.rafId = requestAnimationFrame(this.doFrame);
      }
      this.sound.audioSystem.setMuted(this.paused);
    }
  };

  /**
   * @param e - 本地玩家
   * @param t - 游戏渲染器
   * @param i - 声音系统
   * @param r - 回合管理器
   * @param s - 选项（默认 {}）
   */
  constructor(
    e: LocalPlayerLike | undefined,
    t: GameRendererLike,
    i: SoundLike,
    r: GameTurnManagerLike,
    s: GameAnimationLoopOptions = {},
  ) {
    this.localPlayer = e;
    this.renderer = t;
    this.sound = i;
    this.gameTurnMgr = r;
    this.options = s;
    this.isStarted = false;
    this.rendererErrorState = false;
  }

  /** 启动主循环（幂等）。 */
  start(): void {
    if (!this.isStarted) {
      this.isStarted = true;
      this.paused = false;
      this.startTime = undefined;
      this.lastGameFrame = 0;
      if (document.hidden) {
        this.handleVisibilityChange();
      } else {
        this.rafId = requestAnimationFrame(this.doFrame);
      }
      document.addEventListener("visibilitychange", this.handleVisibilityChange);
    }
  }

  /**
   * 计算自上次以来应推进的绝对回合增量。
   * 回合周期变化时重置 startTime/lastGameFrame。
   * @param e - 当前时间戳（ms）
   * @returns 本帧应 tick 的回合数（>=0）
   */
  updateDeltaGameFrames(e: number): number {
    let t = this.gameTurnMgr.getTurnMillis();
    const i = t !== this.lastGameTurnMillis;
    this.lastGameTurnMillis = t;
    if (i) {
      this.lastGameFrame = 0;
      this.startTime = e;
    }
    let r = 0;
    if (this.startTime) {
      const elapsed = e - this.startTime;
      t = Math.round(elapsed / t);
      r = t - this.lastGameFrame;
      this.lastGameFrame = t;
    } else {
      this.startTime = e;
    }
    return r;
  }

  /**
   * 执行一回合；有 onError 时捕获异常并置错误态。
   * @param e - 当前时间戳（ms）
   * @returns doGameTurn 的布尔结果
   */
  tickGame(e: number): boolean {
    if (!this.options.onError) {
      return this.gameTurnMgr.doGameTurn(e);
    }
    try {
      return this.gameTurnMgr.doGameTurn(e);
    } catch (e2) {
      this.gameTurnMgr.setErrorState();
      this.options.onError(e2);
      return undefined as any;
    }
  }

  /**
   * 更新渲染器；出错时置错误态并回调（之后不再 update）。
   * @param e - 时间戳
   * @param t - 帧插值 alpha
   */
  updateRenderer(e: number, t: number): void {
    if (this.options.onError) {
      if (!this.rendererErrorState) {
        try {
          this.renderer.update(e, t);
        } catch (e2) {
          this.gameTurnMgr.setErrorState();
          this.rendererErrorState = true;
          this.options.onError(e2);
          return;
        }
      }
    } else {
      this.renderer.update(e, t);
    }
  }

  /**
   * 渲染一帧；出错回调 onError(err, true) 并返回 false（停 RAF）。
   * @returns 是否继续下一帧
   */
  render(): boolean {
    if (this.options.onError) {
      try {
        this.renderer.render();
      } catch (e) {
        this.gameTurnMgr.setErrorState();
        this.rendererErrorState = true;
        this.options.onError(e, true);
        return false;
      }
    } else {
      this.renderer.render();
    }
    return true;
  }

  /** 停止循环并清定时器/监听（幂等）。 */
  stop(): void {
    if (this.isStarted) {
      this.isStarted = false;
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = undefined;
      }
      if (this.backgroundIntervalId) {
        clearInterval(this.backgroundIntervalId);
        this.backgroundIntervalId = undefined;
      }
      document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    }
  }

  /** stop 并 flush 渲染器。 */
  destroy(): void {
    this.stop();
    this.renderer.flush?.();
  }
}
