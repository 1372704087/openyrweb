/**
 * PressKeyInput — 捕获键盘快捷键的只读输入框。
 *
 * 组合修饰键时 keyCode 置 void；Escape/方向键等清除；
 * FullScreen 热键也清除。onKeyUp 仅处理"只剩修饰键松开"。
 *
 * 由 gui/screen/options/component/PressKeyInput.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React, { useState } from "react"; // 孪生（react 外部依赖）
import { FullScreen } from "gui/FullScreen"; // 已转换
import { getHumanReadableKey } from "gui/screen/options/component/getHumanReadableKey"; // 孪生（本组内一并转换）

const isModifier = (e: any) =>
  e.shiftKey || e.ctrlKey || e.altKey || e.metaKey;
const isModifierKey = (e: any) =>
  ["Alt", "Control", "Shift", "Meta"].includes(e.key);
const CLEAR_KEYS = [
  "Escape",
  "Backspace",
  "Enter",
  "Tab",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  " ",
];

/** 组件 props。 */
export interface PressKeyInputProps {
  /** 悬浮提示。 */
  tooltip?: string;
  /** 快捷键变更（null=清除）。 */
  onChange: (combo: any) => void;
}

/** 按键捕获输入框。 */
export const PressKeyInput = ({
  tooltip,
  onChange,
}: PressKeyInputProps) => {
  const [combo, setCombo] = useState<any>();
  const commit = (value: any) => {
    setCombo(value);
    if (!value || void 0 === value.keyCode || true) onChange(value);
  };
  var text = combo ? getHumanReadableKey(combo) : "";
  return React.createElement("input", {
    type: "text",
    value: text,
    "data-r-tooltip": tooltip,
    onChange: () => {},
    onKeyDown: (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.repeat || 255 < e.keyCode) return;
      if (CLEAR_KEYS.includes(e.key) || FullScreen.isFullScreenHotKey(e))
        commit(void 0);
      else
        commit({
          shiftKey: e.shiftKey,
          ctrlKey: e.ctrlKey,
          altKey: e.altKey,
          metaKey: e.metaKey,
          keyCode: isModifierKey(e) ? void 0 : e.keyCode,
        });
    },
    onKeyUp: (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.repeat || 255 < e.keyCode) return;
      if (void 0 === combo?.keyCode && isModifierKey(e))
        commit(
          isModifier(e)
            ? {
                shiftKey: e.shiftKey,
                ctrlKey: e.ctrlKey,
                altKey: e.altKey,
                metaKey: e.metaKey,
                keyCode: void 0,
              }
            : void 0,
        );
    },
    onBlur: () => {
      if (combo && void 0 === combo?.keyCode) commit(void 0);
    },
  });
};
