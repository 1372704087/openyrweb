/**
 * PromptDialog — 单行输入确认对话框（50ms 后聚焦、Enter 提交）。
 *
 * 由 gui/component/PromptDialog.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生（第三方）
import { Dialog } from "gui/component/Dialog"; // 孪生（本批内一并转换）

// 孪生 any-shim：第三方 CJS 取 default / hooks
const React: any = (ReactModule as any).default;
const hooks: any = ReactModule as any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 输入对话框。
 * @param props - {viewport,promptText,submitLabel,cancelLabel,inputProps,onSubmit,onDismiss}
 */
export const PromptDialog = (props: any): any => {
  const { viewport, promptText, submitLabel, cancelLabel, inputProps, onSubmit, onDismiss } = props;
  const inputRef = hooks.useRef(null);
  const [hidden, setHidden] = hooks.useState(false);

  hooks.useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, []);

  const submit = (ev?: any) => {
    if (ev) ev.preventDefault();
    setHidden(true);
    onSubmit(inputRef.current.value);
  };

  return React.createElement(
    Dialog,
    {
      className: "prompt-box",
      hidden,
      viewport,
      zIndex: 100,
      buttons: [
        { label: submitLabel, onClick: submit },
        {
          label: cancelLabel,
          onClick: () => {
            setHidden(true);
            onDismiss?.();
          },
        },
      ],
    },
    React.createElement(
      "form",
      { onSubmit: submit, autoComplete: "off" },
      React.createElement(
        "div",
        { className: "field" },
        React.createElement(
          "label",
          null,
          promptText.split(/\r?\n/).map((line: string, i: number) =>
            React.createElement(
              React.Fragment,
              { key: i },
              i ? React.createElement("br", null) : null,
              line,
            ),
          ),
        ),
        React.createElement("input", {
          name: "promptvalue",
          type: "text",
          autoComplete: "off",
          "data-lpignore": "true",
          ref: inputRef,
          ...inputProps,
        }),
      ),
      React.createElement("button", { type: "submit", style: { visibility: "hidden" } }),
    ),
  );
};
