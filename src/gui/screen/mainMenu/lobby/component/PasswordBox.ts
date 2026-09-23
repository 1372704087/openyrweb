/**
 * PasswordBox — 大厅密码输入对话框。
 *
 * 由 gui/screen/mainMenu/lobby/component/PasswordBox.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React, { useEffect, useRef, useState } from "react"; // 孪生（react 外部依赖）
import { Dialog } from "gui/component/Dialog"; // 已转换

/** 组件 props。 */
export interface PasswordBoxProps {
  /** i18n 字典。 */
  strings: any;
  /** 视口。 */
  viewport: any;
  /** 提交（密码）。 */
  onSubmit: (password: string) => void;
  /** 取消。 */
  onDismiss?: () => void;
}

/** 密码输入框。 */
export const PasswordBox = ({
  strings: strings,
  viewport,
  onSubmit,
  onDismiss,
}: PasswordBoxProps) => {
  let inputRef = useRef<HTMLInputElement | null>(null);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, []);
  const submit = (ev?: any) => {
    if (ev) ev.preventDefault();
    setHidden(true);
    onSubmit(inputRef.current!.value);
  };
  return React.createElement(
    Dialog,
    {
      className: "login-box password-box",
      hidden,
      viewport,
      zIndex: 100,
      buttons: [
        { label: strings.get("GUI:Ok"), onClick: submit },
        {
          label: strings.get("GUI:Cancel"),
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
        React.createElement("label", null, strings.get("GUI:Password")),
        React.createElement("input", {
          name: "lobbypass",
          type: "password",
          autoComplete: "off",
          "data-lpignore": "true",
          ref: inputRef,
        }),
      ),
      React.createElement("button", {
        type: "submit",
        style: { visibility: "hidden" },
      }),
    ),
  );
};
