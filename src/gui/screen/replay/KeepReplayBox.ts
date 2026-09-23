/**
 * KeepReplayBox — 保存回放命名对话框。
 *
 * 由 gui/screen/replay/KeepReplayBox.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React, { useEffect, useRef, useState } from "react"; // 孪生（react 外部依赖）
import { Dialog } from "gui/component/Dialog"; // 已转换
import { Replay } from "network/gamestate/Replay"; // 已转换

/** 组件 props。 */
export interface KeepReplayBoxProps {
  /** 默认回放名。 */
  defaultName: string;
  /** i18n 字典。 */
  strings: any;
  /** 视口。 */
  viewport: any;
  /** 提交命名。 */
  onSubmit: (name: string) => void;
  /** 取消。 */
  onDismiss?: () => void;
}

/** 保存回放命名框。 */
export const KeepReplayBox = ({
  defaultName,
  strings: strings,
  viewport,
  onSubmit,
  onDismiss,
}: KeepReplayBoxProps) => {
  let inputRef = useRef<HTMLInputElement | null>(null);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(0, inputRef.current.value.length);
    }, 50);
  }, []);
  const submit = (ev?: any) => {
    if (ev) ev.preventDefault();
    const value = inputRef.current!.value;
    if (value) {
      setHidden(true);
      onSubmit(value);
    }
  };
  return React.createElement(
    Dialog,
    {
      className: "keep-replay-box",
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
      { onSubmit: submit },
      React.createElement(
        "div",
        { className: "field" },
        React.createElement("label", null, strings.get("GUI:ReplayNamePrompt")),
        React.createElement("input", {
          type: "text",
          name: "replayname",
          autoComplete: "off",
          ref: inputRef,
          defaultValue: defaultName,
          maxLength: Replay.maxNameLength,
        }),
      ),
      React.createElement("button", {
        type: "submit",
        style: { visibility: "hidden" },
      }),
    ),
  );
};
