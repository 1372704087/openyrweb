/**
 * PointerLock — 指针锁定（鼠标捕获）管理。
 *
 * 封装 requestPointerLock/exitPointerLock 的 Promise 化、pointerlockchange
 * 广播、touchstart 自动退出，以及 unadjustedMovement（原始输入）降级。
 *
 * 由 util/PointerLock.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { EventDispatcher } from "util/event"; // 已转换
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换

/** requestPointerLock 可选参数（Chrome 等支持 unadjustedMovement）。 */
export interface PointerLockRequestOptions {
  unadjustedMovement?: boolean;
}

/** 宿主元素：需要可被锁定的对象。 */
export interface PointerLockElementLike {
  requestPointerLock(options?: PointerLockRequestOptions): Promise<void> | void | undefined;
}

/** 提供 pointerLock 事件与状态的 document 子集。 */
export interface PointerLockDocumentLike {
  pointerLockElement?: Element | null;
  addEventListener(type: string, listener: (ev?: any) => void, options?: boolean): void;
  removeEventListener(type: string, listener: (ev?: any) => void, options?: boolean): void;
  exitPointerLock(): void;
}

export class PointerLock {
  readonly element: PointerLockElementLike;
  readonly document: PointerLockDocumentLike;
  readonly _onChange = new EventDispatcher();
  readonly disposables = new CompositeDisposable();
  listening = false;

  /** 锁定状态变化事件（参数为当前 isActive()）。 */
  get onChange() {
    return this._onChange.asEvent();
  }

  constructor(element: PointerLockElementLike, doc: PointerLockDocumentLike) {
    this.element = element;
    this.document = doc;
    this._onChange = new EventDispatcher();
    this.disposables = new CompositeDisposable();
    this.listening = false;
  }

  /** 请求锁定；支持 unadjustedMovement，NotSupportedError 时自动降级重试。 */
  async request(options?: PointerLockRequestOptions): Promise<void> {
    if (options?.unadjustedMovement) {
      try {
        await this.requestInternal({ unadjustedMovement: true });
      } catch (e: any) {
        if (e.name !== "NotSupportedError") throw e;
        await this.requestInternal();
      }
    } else {
      await this.requestInternal();
    }
  }

  /**
   * 实际发起锁定：首次调用挂上 change/touch 监听；
   * 已锁定时直接 resolve（无 return 值，与孪生隐式 undefined 一致）。
   */
  async requestInternal(options?: PointerLockRequestOptions): Promise<void> | undefined {
    if (!this.isActive()) {
      if (!this.listening) {
        this.listening = true;
        const onChange = () => {
          this._onChange.dispatch(this, this.isActive());
        };
        this.document.addEventListener("pointerlockchange", onChange, false);
        this.disposables.add(() => this.document.removeEventListener("pointerlockchange", onChange, false));
        // 触屏点按画布时自动退出锁定
        let onTouch = () => {
          this.exit().catch((err) => console.error(err));
        };
        this.document.addEventListener("touchstart", onTouch, false);
        this.disposables.add(() => this.document.removeEventListener("touchstart", onTouch, false));
      }
      return new Promise((resolve, reject) => {
        const onLock = () => {
          this.document.removeEventListener("pointerlockchange", onLock, false);
          this.document.removeEventListener("pointerlockerror", onErr, false);
          resolve();
        };
        const onErr = (ev?: unknown) => {
          this.document.removeEventListener("pointerlockchange", onLock, false);
          this.document.removeEventListener("pointerlockerror", onErr, false);
          console.error(ev);
          reject(new Error("Pointer lock error"));
        };
        this.document.addEventListener("pointerlockerror", onErr, false);
        this.document.addEventListener("pointerlockchange", onLock, false);
        // 部分浏览器 requestPointerLock 返回 Promise，错误时 reject
        const maybePromise = this.element.requestPointerLock(options) as Promise<void> | void | undefined;
        maybePromise && typeof (maybePromise as Promise<void>).catch === "function"
          ? (maybePromise as Promise<void>).catch(reject)
          : undefined;
      });
    }
  }

  /** 退出锁定（未激活时直接返回）。 */
  async exit(): Promise<void> | undefined {
    if (this.isActive()) {
      return new Promise((resolve, reject) => {
        const onUnlock = () => {
          this.document.removeEventListener("pointerlockchange", onUnlock, false);
          this.document.removeEventListener("pointerlockerror", onErr, false);
          resolve();
        };
        const onErr = (ev?: unknown) => {
          this.document.removeEventListener("pointerlockchange", onUnlock, false);
          this.document.removeEventListener("pointerlockerror", onErr, false);
          console.error(ev);
          reject(new Error("Pointer lock error"));
        };
        this.document.addEventListener("pointerlockerror", onErr, false);
        this.document.addEventListener("pointerlockchange", onUnlock, false);
        this.document.exitPointerLock();
      });
    }
  }

  /** 当前是否锁定在本 element 上。 */
  isActive(): boolean {
    return this.element === (this.document.pointerLockElement as unknown as PointerLockElementLike);
  }

  dispose(): void {
    this.disposables.dispose();
  }
}
