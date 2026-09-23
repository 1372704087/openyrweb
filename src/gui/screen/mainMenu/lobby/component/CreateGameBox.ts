/**
 * CreateGameBox — 创建房间对话框（房名/密码开关/观战）。
 *
 * 由 gui/screen/mainMenu/lobby/component/CreateGameBox.ts.js
 * 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React, { useRef, useState } from "react"; // 孪生（react 外部依赖）
import { Dialog } from "gui/component/Dialog"; // 已转换
import { WolConnection } from "network/WolConnection"; // 已转换

/** 组件 props。 */
export interface CreateGameBoxProps {
  /** i18n 字典。 */
  strings: any;
  /** 视口。 */
  viewport: any;
  /** 提交（房名, 密码, 是否观战）。 */
  onSubmit: (desc: string, password: string, observe: boolean) => void;
  /** 取消。 */
  onDismiss?: () => void;
}

/** 创建房间对话框。 */
export const CreateGameBox = ({
  strings: strings,
  viewport,
  onSubmit,
  onDismiss,
}: CreateGameBoxProps) => {
  let [hidden, setHidden] = useState(false);
  let [desc, setDesc] = useState("");
  let passRef = useRef<HTMLInputElement | null>(null);
  let submitBtn = useRef<HTMLButtonElement | null>(null);
  let [usePass, setUsePass] = useState(false);
  let observeRef = useRef<HTMLInputElement | null>(null);
  return React.createElement(
    Dialog,
    {
      className: "login-box create-game-box",
      hidden,
      viewport,
      buttons: [
        { label: strings.get("GUI:Ok"), onClick: () => submitBtn.current?.click() },
        {
          label: strings.get("GUI:Cancel"),
          onClick: () => {
            setHidden(true);
            onDismiss?.();
          },
        },
      ],
      zIndex: 100,
    },
    React.createElement(
      "form",
      {
        onSubmit: (e: any) => {
          e.preventDefault();
          setHidden(true);
          onSubmit(
            desc,
            usePass ? passRef.current!.value : "",
            observeRef.current!.checked,
          );
        },
        autoComplete: "off",
      },
      React.createElement(
        "div",
        { className: "field" },
        React.createElement("label", null, strings.get("GUI:RoomDesc")),
        React.createElement("input", {
          name: "roomname",
          type: "text",
          value: desc,
          maxLength: WolConnection.MAX_ROOM_DESC_LEN,
          onChange: (e: any) => {
            setDesc(e.target.value);
          },
        }),
      ),
      React.createElement(
        "div",
        { className: "field" },
        React.createElement("label", null, strings.get("GUI:Password")),
        React.createElement("input", {
          name: "enablepass",
          type: "checkbox",
          checked: usePass,
          onChange: () => {
            setUsePass(!usePass);
          },
        }),
        React.createElement("input", {
          name: "lobbypass",
          type: "password",
          autoComplete: "off",
          "data-lpignore": "true",
          ref: passRef,
          disabled: !usePass,
          required: usePass,
        }),
      ),
      React.createElement(
        "div",
        { className: "field" },
        React.createElement("label", null, strings.get("GUI:Observe")),
        React.createElement("input", {
          type: "checkbox",
          name: "test",
          ref: observeRef,
        }),
      ),
      React.createElement("button", {
        type: "submit",
        ref: submitBtn,
        style: { visibility: "hidden" },
      }),
    ),
  );
};
