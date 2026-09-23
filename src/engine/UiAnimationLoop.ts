/**
 * UiAnimationLoop — UI 渲染循环（RAF + 页面隐藏时降频 background 帧）。
 *
 * 由 engine/UiAnimationLoop.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** UI 渲染器最小形状。 */
export interface UiRendererLike {
  update(now: number): void;
  render(): void;
  flush?(): void;
  getStats?(): { begin(): void; end(): void } | undefined | null;
}

/**
 * UI 动画/渲染循环。
 * 前台走 requestAnimationFrame；后台改为每秒一次 setInterval 更新。
 */
export class UiAnimationLoop {
  /** 渲染器 */
  renderer: UiRendererLike;
  /** 是否已 start */
  isStarted: boolean;
  /** 页面是否隐藏（与 document.hidden 同步） */
  paused!: boolean;
  /** 前台 RAF 句柄 */
  rafId?: number;
  /** 后台 interval 句柄 */
  backgroundIntervalId?: any;

  /** 后台帧：仅 started && paused 时 update。 */
  doBackgroundFrame = (e: number): void => {
    if (this.isStarted && this.paused) {
      this.renderer.update(e);
    }
  };

  /** 前台帧：update → render → 续 RAF。 */
  doFrame = (t: number): void => {
    if (this.isStarted && !this.paused) {
      const e = this.renderer.getStats?.();
      e && e.begin();
      this.renderer.update(t);
      this.renderer.render();
      e && e.end();
      this.rafId = requestAnimationFrame(this.doFrame);
    }
  };

  /** 页面可见性切换：切换 RAF / 后台 interval。 */
  handleVisibilityChange = (): void => {
    const e = document.hidden;
    if (this.paused !== e) {
      this.paused = e;
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
    }
  };

  constructor(renderer: UiRendererLike) {
    this.renderer = renderer;
    this.isStarted = false;
  }

  /** 启动循环（幂等）；若已隐藏则直接走 visibility 分支。 */
  start(): void {
    if (!this.isStarted) {
      this.isStarted = true;
      this.paused = false;
      if (document.hidden) {
        this.handleVisibilityChange();
      } else {
        this.rafId = requestAnimationFrame(this.doFrame);
      }
      document.addEventListener("visibilitychange", this.handleVisibilityChange);
    }
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
