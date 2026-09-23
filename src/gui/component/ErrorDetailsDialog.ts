/**
 * ErrorDetailsDialog — 可展开详细信息的错误对话框（复制/下载日志）。
 *
 * 由 gui/component/ErrorDetailsDialog.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生（第三方）
import { Dialog } from "gui/component/Dialog"; // 孪生（本批内一并转换）

// 孪生 any-shim：第三方 CJS 取 default / hooks
const React: any = (ReactModule as any).default;
const hooks: any = ReactModule as any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 详细错误对话框。
 * @param props - {viewport,message,details,onClose,strings}
 */
export const ErrorDetailsDialog = (props: any): any => {
  const { viewport, message, details, onClose, strings } = props;
  const [expanded, setExpanded] = hooks.useState(false);
  const [copied, setCopied] = hooks.useState(false);

  const toggleExpand = function () {
    setExpanded(!expanded);
  };

  const buildLogText = function (): string {
    const lines: string[] = [];
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
        for (const k in details.context) {
          if (details.context.hasOwnProperty(k)) {
            lines.push("  " + k + ": " + details.context[k]);
          }
        }
      }
    }
    return lines.join("\n");
  };

  const copyDetails = function () {
    const text = buildLogText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(function () {
          setCopied(true);
          setTimeout(function () {
            setCopied(false);
          }, 2000);
        })
        .catch(function () {
          // fallback: silent fail
        });
    }
  };

  const downloadLog = function () {
    const text = buildLogText();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = "openyrweb-error-" + timestamp + ".log";
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderDetailRow = function (label: string, value: any) {
    if (!value && value !== 0) return null;
    return React.createElement(
      "div",
      { className: "error-detail-row", key: label },
      React.createElement("span", { className: "error-detail-label" }, label + ":"),
      React.createElement("span", { className: "error-detail-value" }, String(value)),
    );
  };

  const detailItems: any[] = [];
  if (details) {
    if (details.type) detailItems.push(renderDetailRow("Type", details.type));
    if (details.errorMessage) detailItems.push(renderDetailRow("Error", details.errorMessage));
    if (details.file) detailItems.push(renderDetailRow("File", details.file));
    if (details.stack) {
      detailItems.push(
        React.createElement(
          "div",
          { className: "error-detail-row error-detail-stack-row", key: "stack" },
          React.createElement("span", { className: "error-detail-label" }, "Stack:"),
          React.createElement("pre", { className: "error-detail-stack" }, details.stack),
        ),
      );
    }
    if (details.context) {
      for (const k in details.context) {
        if (details.context.hasOwnProperty(k)) {
          detailItems.push(renderDetailRow(k, details.context[k]));
        }
      }
    }
  }

  const buttons = [
    {
      label: copied
        ? (strings && strings.get("GUI:Copied")) || "Copied!"
        : (strings && strings.get("GUI:CopyDetails")) || "Copy Details",
      onClick: copyDetails,
    },
    {
      label: (strings && strings.get("GUI:DownloadLog")) || "Download Log",
      onClick: downloadLog,
    },
    {
      label: (strings && strings.get("GUI:Ok")) || "OK",
      onClick: function () {
        onClose && onClose();
      },
    },
  ];

  return React.createElement(
    Dialog,
    {
      className: "error-details-box",
      viewport,
      zIndex: 102,
      buttons,
    },
    React.createElement(
      "div",
      { className: "error-details-content" },
      React.createElement(
        "div",
        { className: "error-details-message" },
        message
          ? message.split(/\n/g).map(function (line, idx) {
              return React.createElement(
                React.Fragment,
                { key: idx },
                idx > 0 ? React.createElement("br", null) : null,
                React.createElement("span", null, line),
              );
            })
          : null,
      ),
      detailItems.length > 0
        ? React.createElement(
            "div",
            { className: "error-details-toggle-wrap" },
            React.createElement(
              "button",
              { className: "error-details-toggle", onClick: toggleExpand },
              (expanded ? "[-] " : "[+] ") +
                ((strings && strings.get("GUI:ErrorDetails")) || "Details"),
            ),
            expanded ? React.createElement("div", { className: "error-details-section" }, detailItems) : null,
          )
        : null,
    ),
  );
};
