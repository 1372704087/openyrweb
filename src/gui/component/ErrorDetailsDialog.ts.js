// === Reconstructed SystemJS module: gui/component/ErrorDetailsDialog ===
// deps: ["react","gui/component/Dialog"]
// OpenYRWeb: 详细错误信息弹窗组件。
// 在原有 Dialog 基础上增加可展开的"详细信息"区域，包含错误类型、堆栈、
// 受影响文件、附加上下文等，支持一键复制详细信息和下载日志文件。

System.register("gui/component/ErrorDetailsDialog", ["react", "gui/component/Dialog"], function (e, t) {
  "use strict";
  var u, d;
  t && t.id;
  return {
    setters: [
      function (e) {
        u = e;
      },
      function (e) {
        d = e;
      },
    ],
    execute: function () {
      e(
        "ErrorDetailsDialog",
        ({
          viewport: viewport,
          message: message,
          details: details,
          onClose: onClose,
          strings: strings,
        }) => {
          var [expanded, setExpanded] = u.useState(false);
          var [copied, setCopied] = u.useState(false);

          var toggleExpand = function () {
            setExpanded(!expanded);
          };

          var buildLogText = function () {
            var lines = [];
            lines.push("=== OpenYRWeb Error Report ===");
            lines.push("Date: " + new Date().toISOString());
            lines.push("");
            if (message) {
              lines.push("--- Message ---");
              lines.push(message);
              lines.push("");
            }
            if (details) {
              if (details.type) lines.push("Type: " + details.type);
              if (details.errorMessage) lines.push("Error: " + details.errorMessage);
              if (details.file) lines.push("File: " + details.file);
              if (details.stack) {
                lines.push("Stack:");
                lines.push(details.stack);
              }
              if (details.context) {
                lines.push("Context:");
                for (var k in details.context) {
                  if (details.context.hasOwnProperty(k)) {
                    lines.push("  " + k + ": " + details.context[k]);
                  }
                }
              }
            }
            return lines.join("\n");
          };

          var copyDetails = function () {
            var text = buildLogText();
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(text).then(function () {
                setCopied(true);
                setTimeout(function () { setCopied(false); }, 2000);
              }).catch(function () {
                // fallback: silent fail
              });
            }
          };

          var downloadLog = function () {
            var text = buildLogText();
            var timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            var filename = "openyrweb-error-" + timestamp + ".log";
            var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
            var url = URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          };

          var renderDetailRow = function (label, value) {
            if (!value && value !== 0) return null;
            return u.default.createElement(
              "div",
              { className: "error-detail-row", key: label },
              u.default.createElement("span", { className: "error-detail-label" }, label + ":"),
              u.default.createElement("span", { className: "error-detail-value" }, String(value)),
            );
          };

          var detailItems = [];
          if (details) {
            if (details.type) {
              detailItems.push(renderDetailRow("Type", details.type));
            }
            if (details.errorMessage) {
              detailItems.push(renderDetailRow("Error", details.errorMessage));
            }
            if (details.file) {
              detailItems.push(renderDetailRow("File", details.file));
            }
            if (details.stack) {
              detailItems.push(
                u.default.createElement(
                  "div",
                  { className: "error-detail-row error-detail-stack-row", key: "stack" },
                  u.default.createElement("span", { className: "error-detail-label" }, "Stack:"),
                  u.default.createElement(
                    "pre",
                    { className: "error-detail-stack" },
                    details.stack,
                  ),
                ),
              );
            }
            if (details.context) {
              for (var k in details.context) {
                if (details.context.hasOwnProperty(k)) {
                  detailItems.push(renderDetailRow(k, details.context[k]));
                }
              }
            }
          }

          var buttons = [
            {
              label: copied ? (strings && strings.get("GUI:Copied") || "Copied!") : (strings && strings.get("GUI:CopyDetails") || "Copy Details"),
              onClick: copyDetails,
            },
            {
              label: strings && strings.get("GUI:DownloadLog") || "Download Log",
              onClick: downloadLog,
            },
            {
              label: strings && strings.get("GUI:Ok") || "OK",
              onClick: function () {
                onClose && onClose();
              },
            },
          ];

          return u.default.createElement(
            d.Dialog,
            {
              className: "error-details-box",
              viewport: viewport,
              zIndex: 102,
              buttons: buttons,
            },
            u.default.createElement(
              "div",
              { className: "error-details-content" },
              u.default.createElement(
                "div",
                { className: "error-details-message" },
                message
                  ? message.split(/\n/g).map(function (line, idx) {
                      return u.default.createElement(
                        u.default.Fragment,
                        { key: idx },
                        idx > 0 ? u.default.createElement("br", null) : null,
                        u.default.createElement("span", null, line),
                      );
                    })
                  : null,
              ),
              detailItems.length > 0
                ? u.default.createElement(
                    "div",
                    { className: "error-details-toggle-wrap" },
                    u.default.createElement(
                      "button",
                      {
                        className: "error-details-toggle",
                        onClick: toggleExpand,
                      },
                      (expanded ? "[-] " : "[+] ") + (strings && strings.get("GUI:ErrorDetails") || "Details"),
                    ),
                    expanded
                      ? u.default.createElement(
                          "div",
                          { className: "error-details-section" },
                          detailItems,
                        )
                      : null,
                  )
                : null,
            ),
          );
        },
      );
    },
  };
});
