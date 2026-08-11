// === Reconstructed SystemJS module: ErrorHandler ===
// deps: []
// OpenYRWeb: 全局错误处理器。
// 支持基本错误弹窗（MessageBoxApi）和详细错误弹窗（ErrorDetailsBoxApi）。

System.register("ErrorHandler", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "ErrorHandler",
        (i = class {
          /**
           * @param {Object} messageBoxApi - MessageBoxApi 实例
           * @param {Object} strings - 本地化字符串
           * @param {Object} [errorDetailsBoxApi] - 可选的 ErrorDetailsBoxApi 实例
           */
          constructor(e, t, errorDetailsBoxApi) {
            ((this.messageBoxApi = e),
              (this.strings = t),
              (this.errorDetailsBoxApi = errorDetailsBoxApi || null));
          }
          /**
           * 处理错误，显示基本错误弹窗。
           * @param {Error} e - 错误对象
           * @param {string} t - 用户可见的错误消息
           * @param {Function} [i] - 关闭弹窗后的回调
           */
          handle(e, t, i) {
            (this.isErrorState ||
              (i
                ? this.messageBoxApi.show(t, this.strings.get("GUI:Ok"), () => {
                    ((this.isErrorState = !1), i());
                  })
                : this.messageBoxApi.show(t)),
              console.error("Handled error:", e),
              (this.isErrorState = !0));
          }
          /**
           * 处理错误，显示包含详细信息的弹窗。
           * @param {Error} e - 错误对象
           * @param {string} message - 用户可见的错误消息
           * @param {Object} details - 详细错误信息
           * @param {string} [details.type] - 错误类型
           * @param {string} [details.errorMessage] - 原始错误消息
           * @param {string} [details.file] - 受影响的文件
           * @param {string} [details.stack] - 堆栈跟踪
           * @param {Object} [details.context] - 附加上下文
           * @param {Function} [callback] - 关闭弹窗后的回调
           */
          handleWithDetails(e, message, details, callback) {
            if (this.isErrorState) return;
            console.error("Handled error (with details):", e);
            this.isErrorState = true;
            if (this.errorDetailsBoxApi) {
              var self = this;
              this.errorDetailsBoxApi.show(message, details, function () {
                self.isErrorState = false;
                if (callback) callback();
              });
            } else {
              // 回退：没有 ErrorDetailsBoxApi 时，使用基本 MessageBoxApi
              // 将详细信息追加到消息中
              var detailText = message;
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
        }),
      );
    },
  };
});
