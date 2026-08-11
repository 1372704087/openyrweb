// === Reconstructed SystemJS module: gui/component/ErrorDetailsBoxApi ===
// deps: ["gui/HtmlReactElement","util/disposable/CompositeDisposable","gui/component/ErrorDetailsDialog"]
// OpenYRWeb: 详细错误信息弹窗 API。
// 管理 ErrorDetailsDialog 组件的创建、显示和销毁。

System.register(
  "gui/component/ErrorDetailsBoxApi",
  ["gui/HtmlReactElement", "util/disposable/CompositeDisposable", "gui/component/ErrorDetailsDialog"],
  function (e, t) {
    "use strict";
    var a, r, n, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          n = e;
        },
      ],
      execute: function () {
        e(
          "ErrorDetailsBoxApi",
          (i = class {
            constructor(e, t, i) {
              ((this.viewport = e),
                (this.strings = t),
                (this.rootEl = i),
                (this.disposables = new r.CompositeDisposable()));
            }
            /**
             * 显示详细错误信息弹窗。
             * @param {string} message - 主错误消息文本
             * @param {Object} details - 详细错误信息对象
             * @param {string} [details.type] - 错误类型（如 "ChecksumError", "DownloadError"）
             * @param {string} [details.errorMessage] - 原始错误消息
             * @param {string} [details.file] - 受影响的文件名
             * @param {string} [details.stack] - 堆栈跟踪
             * @param {Object} [details.context] - 附加上下文键值对
             * @param {Function} [onClosed] - 弹窗关闭后的回调
             */
            show(message, details, onClosed) {
              var self = this;
              this.destroy();
              this._onClosed = onClosed || null;
              this.component = a.HtmlReactElement.factory(n.ErrorDetailsDialog, {
                message: message,
                details: details || null,
                viewport: this.viewport.value,
                strings: this.strings,
                onClose: function () {
                  var cb = self._onClosed;
                  self.destroy();
                  if (cb) { self._onClosed = null; cb(); }
                },
              });
              var handleResize = function (t) {
                self.component.setSize(t.width, t.height);
                self.component.applyOptions(function (e) {
                  e.viewport = t;
                });
              };
              this.viewport.onChange.subscribe(handleResize);
              this.component.setSize(this.viewport.value.width, this.viewport.value.height);
              this.component.render();
              this.rootEl.appendChild(this.component.getElement());
              this.disposables.add(
                function () { self.viewport.onChange.unsubscribe(handleResize); },
                function () {
                  self.component.getElement() && self.rootEl.removeChild(self.component.getElement());
                },
                function () { self.component.unrender(); },
                function () { self.component = void 0; },
              );
            }
            destroy() {
              this.disposables.dispose();
            }
          }),
        );
      },
    };
  },
);
