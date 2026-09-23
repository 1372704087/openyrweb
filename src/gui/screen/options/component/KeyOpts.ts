/**
 * KeyOpts — 键盘设置主界面（命令列表 + 当前/新快捷键 + 分配重置）。
 *
 * 修饰键冲突校验：anyModifierCommands 不可映射/重映射。
 *
 * 由 gui/screen/options/component/KeyOpts.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React, { useState } from "react"; // 孪生（react 外部依赖）
import { configurableCmds } from "gui/screen/options/component/configurableCmds"; // 孪生（本组内一并转换）
import { List, ListItem } from "gui/component/List"; // 已转换
import { PressKeyInput } from "gui/screen/options/component/PressKeyInput"; // 孪生（本组内一并转换）
import { getHumanReadableKey } from "gui/screen/options/component/getHumanReadableKey"; // 孪生（本组内一并转换）
import { KeyboardHandler } from "gui/screen/game/worldInteraction/keyboard/KeyboardHandler"; // 已转换

/** 组件 props。 */
export interface KeyOptsProps {
  /** i18n 字典。 */
  strings: any;
  /** 键位绑定。 */
  keyBinds: any;
  /** 重置全部。 */
  onResetAll?: () => Promise<void> | void;
  /** 分配变更。 */
  onHotKeyChange?: (cmd: any, combo: any) => void;
}

/** 键盘选项面板。 */
export const KeyOpts = ({
  strings: strings,
  keyBinds,
  onResetAll,
  onHotKeyChange,
}: KeyOptsProps) => {
  let [selectedCmd, setSelectedCmd] = useState<any>();
  let [conflictCmd, setConflictCmd] = useState<any>();
  let [newCombo, setNewCombo] = useState<any>();
  let [inputKey, setInputKey] = useState(0);
  let [warn, setWarn] = useState<string | undefined>();
  const localize = (v: any) =>
    "function" == typeof v ? v(strings) : strings.get(v);
  let descEntry =
    selectedCmd && configurableCmds.has(selectedCmd)
      ? configurableCmds.get(selectedCmd).desc
      : void 0;
  var descText = descEntry
    ? "function" == typeof descEntry
      ? descEntry(strings)
      : strings.get(descEntry)
    : void 0;
  var currentHotKey = selectedCmd ? keyBinds.getHotKey(selectedCmd) : void 0;
  return React.createElement(
    "div",
    { className: "opts key-opts" },
    React.createElement(
      "div",
      { className: "key-opts-list" },
      React.createElement(
        "div",
        { className: "key-opts-left" },
        React.createElement(
          List,
          { title: strings.get("GUI:Commands"), className: "key-list" },
          [...configurableCmds].map(([cmd, { label }]: any) =>
            React.createElement(
              ListItem,
              {
                key: cmd,
                selected: selectedCmd === cmd,
                onClick: () => {
                  setSelectedCmd(cmd);
                  setConflictCmd(void 0);
                  setInputKey(inputKey + 1);
                  setWarn(void 0);
                },
              },
              localize(label),
            ),
          ),
        ),
      ),
      React.createElement(
        "div",
        { className: "key-opts-right" },
        React.createElement(
          "fieldset",
          { className: "key-opts-desc-container" },
          React.createElement(
            "legend",
            null,
            strings.get("GUI:Description"),
          ),
          React.createElement(
            "div",
            { className: "key-opts-desc" },
            descText,
          ),
        ),
      ),
    ),
    React.createElement(
      "div",
      { className: "key-opts-assigns" },
      React.createElement(
        "div",
        { className: "key-opts-cur-assign" },
        React.createElement(
          "div",
          {
            className: "key-opts-left",
            "data-r-tooltip": strings.get("STT:KeyboardLabelAssigned"),
          },
          React.createElement(
            "div",
            { className: "key-opts-cur-assign-label" },
            strings.get("GUI:CurrentShortcut"),
          ),
          React.createElement(
            "div",
            { className: "key-opts-cur-assign-value" },
            currentHotKey && getHumanReadableKey(currentHotKey),
          ),
        ),
        React.createElement(
          "div",
          { className: "key-opts-right" },
          warn,
        ),
      ),
      React.createElement(
        "div",
        { className: "key-opts-ch-assign" },
        React.createElement(
          "div",
          { className: "key-opts-left" },
          React.createElement(
            "div",
            { className: "key-opts-ch-assign-label" },
            strings.get("GUI:PressShortcut"),
          ),
          React.createElement(PressKeyInput, {
            key: inputKey,
            onChange: (combo: any) => {
              setConflictCmd(combo ? keyBinds.getCommandType(combo) : void 0);
              setNewCombo(combo);
              setWarn(void 0);
            },
            tooltip: strings.get("STT:KeyboardEditEntry"),
          }),
          React.createElement(
            "div",
            { className: "key-opts-ch-assign-current" },
            React.createElement("div", null, strings.get("GUI:CurAssignedTo")),
            React.createElement(
              "div",
              null,
              conflictCmd && configurableCmds.has(conflictCmd)
                ? localize(configurableCmds.get(conflictCmd).label)
                : "",
            ),
          ),
        ),
        React.createElement(
          "div",
          { className: "key-opts-right" },
          React.createElement(
            "button",
            {
              className: "dialog-button",
              disabled: !selectedCmd,
              onClick: () => {
                if (!selectedCmd) return;
                if (
                  newCombo &&
                  (newCombo.shiftKey ||
                    newCombo.ctrlKey ||
                    newCombo.altKey ||
                    newCombo.metaKey)
                ) {
                  if (
                    (KeyboardHandler as any).anyModifierCommands.includes(
                      selectedCmd,
                    )
                  ) {
                    setWarn(strings.get("Error:CannotMap"));
                    return;
                  }
                  var bare = keyBinds.getCommandType({
                    keyCode: newCombo.keyCode,
                    altKey: false,
                    ctrlKey: false,
                    shiftKey: false,
                    metaKey: false,
                  });
                  if (
                    void 0 !== bare &&
                    (KeyboardHandler as any).anyModifierCommands.includes(bare)
                  ) {
                    setWarn(strings.get("Error:CannotRemap"));
                    return;
                  }
                }
                onHotKeyChange?.(selectedCmd, newCombo);
                setConflictCmd(void 0);
                setNewCombo(void 0);
                setInputKey(inputKey + 1);
                setWarn(void 0);
              },
              "data-r-tooltip": strings.get("STT:KeyboardButtonAssign"),
            },
            strings.get("GUI:Assign"),
          ),
          React.createElement(
            "button",
            {
              className: "dialog-button",
              onClick: async () => {
                setSelectedCmd(void 0);
                setConflictCmd(void 0);
                setNewCombo(void 0);
                setWarn(void 0);
                await onResetAll?.();
                setInputKey(inputKey + 1);
              },
              "data-r-tooltip": strings.get("STT:KeyboardButtonResetAll"),
            },
            strings.get("GUI:ResetAll"),
          ),
        ),
      ),
      React.createElement(
        "fieldset",
        { className: "key-opts-ch-assign-warn" },
        React.createElement(
          "legend",
          null,
          strings.get("TS:Warning").toLocaleUpperCase(),
        ),
        strings.get("TS:HotKeyFSWarning"),
      ),
    ),
  );
};
