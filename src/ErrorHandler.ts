/**
 * ErrorHandler — 全局错误处理器。
 *
 * 支持基本错误弹窗（MessageBoxApi）和详细错误弹窗（ErrorDetailsBoxApi）。
 * 同一时刻只允许一层错误 UI：isErrorState 在弹出时置位、关闭回调复位。
 *
 * 由 ErrorHandler.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/** 可注入的基本消息框接口（与 GUI MessageBoxApi 结构对齐）。 */
export interface MessageBoxLike {
  show(message: string, buttonLabel?: string, onClose?: () => void): unknown;
}

/** 本地化字符串表：get(key) 返回键对应文案。 */
export interface StringsLike {
  get(key: string): string;
}

/** 详细错误弹窗的载荷字段（全部可选）。 */
export interface ErrorDetails {
  /** 错误类型 */
  type?: string;
  /** 原始错误消息 */
  errorMessage?: string;
  /** 受影响的文件 */
  file?: string;
  /** 堆栈跟踪 */
  stack?: string;
  /** 附加上下文 */
  context?: Record<string, unknown>;
}

/** 可注入的详细错误框接口。 */
export interface ErrorDetailsBoxLike {
  show(message: string, details: ErrorDetails | undefined, onClose?: () => void): unknown;
}

export class ErrorHandler {
  private isErrorState?: boolean;
  readonly messageBoxApi: MessageBoxLike;
  readonly strings: StringsLike;
  readonly errorDetailsBoxApi: ErrorDetailsBoxLike | null;

  /**
   * @param messageBoxApi - MessageBoxApi 实例
   * @param strings - 本地化字符串
   * @param errorDetailsBoxApi - 可选的 ErrorDetailsBoxApi 实例（缺省 null）
   */
  constructor(
    messageBoxApi: MessageBoxLike,
    strings: StringsLike,
    errorDetailsBoxApi?: ErrorDetailsBoxLike | null,
  ) {
    this.messageBoxApi = messageBoxApi;
    this.strings = strings;
    this.errorDetailsBoxApi = errorDetailsBoxApi || null;
  }

  /**
   * 处理错误，显示基本错误弹窗。
   * @param e - 错误对象（仅 console 输出）
   * @param t - 用户可见的错误消息
   * @param i - 关闭弹窗后的回调（可选）
   */
  handle(e: unknown, t: string, i?: () => void): void {
    if (!this.isErrorState) {
      if (i) {
        this.messageBoxApi.show(t, this.strings.get("GUI:Ok"), () => {
          this.isErrorState = false;
          i();
        });
      } else {
        this.messageBoxApi.show(t);
      }
    }
    console.error("Handled error:", e);
    this.isErrorState = true;
  }

  /**
   * 处理错误，显示包含详细信息的弹窗。
   * 有 ErrorDetailsBoxApi 时走详细框；否则把 type/errorMessage/file 拼进基础消息。
   * @param e - 错误对象
   * @param message - 用户可见的错误消息
   * @param details - 详细错误信息
   * @param callback - 关闭弹窗后的回调
   */
  handleWithDetails(
    e: unknown,
    message: string,
    details?: ErrorDetails,
    callback?: () => void,
  ): void {
    if (this.isErrorState) return;
    console.error("Handled error (with details):", e);
    this.isErrorState = true;
    if (this.errorDetailsBoxApi) {
      const self = this;
      this.errorDetailsBoxApi.show(message, details, function () {
        self.isErrorState = false;
        if (callback) callback();
      });
    } else {
      // 回退：没有 ErrorDetailsBoxApi 时，使用基本 MessageBoxApi
      // 将详细信息追加到消息中
      const self = this;
      let detailText = message;
      if (details) {
        if (details.type) detailText += "\n\nType: " + details.type;
        if (details.errorMessage) detailText += "\nError: " + details.errorMessage;
        if (details.file) detailText += "\nFile: " + details.file;
      }
      if (callback) {
        this.messageBoxApi.show(detailText, this.strings.get("GUI:Ok"), function () {
          self.isErrorState = false;
          callback();
        });
      } else {
        this.messageBoxApi.show(detailText);
      }
    }
  }
}
