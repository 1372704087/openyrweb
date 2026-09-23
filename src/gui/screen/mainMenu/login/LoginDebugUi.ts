/**
 * LoginDebugUi — 调试登录快捷按钮（test1…test8）。
 *
 * 导出 TEST_USERS / TEST_PASSWORD 常量与组件；不发起真实网络，
 * 仅回调 onSubmit(user, "testpass")。
 *
 * 由 gui/screen/mainMenu/login/LoginDebugUi.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React from "react"; // 孪生（react 外部依赖）

/** 调试账号列表。 */
export const TEST_USERS = [
  "test1",
  "test2",
  "test3",
  "test4",
  "test5",
  "test6",
  "test7",
  "test8",
];

/** 调试密码（常量）。 */
export const TEST_PASSWORD = "testpass";

/** 组件 props。 */
export interface LoginDebugUiProps {
  /** 提交回调（账号, 密码）。 */
  onSubmit: (user: string, pass: string) => void;
}

/** 调试登录按钮组。 */
export const LoginDebugUi = ({ onSubmit }: LoginDebugUiProps) =>
  React.createElement(
    "div",
    { className: "login-debug-ui" },
    React.createElement(
      "div",
      { className: "login-debug-buttons" },
      TEST_USERS.map((user) =>
        React.createElement(
          "button",
          {
            key: user,
            type: "button",
            className: "login-debug-button",
            onClick: () => onSubmit(user, "testpass"),
          },
          user,
        ),
      ),
    ),
  );
