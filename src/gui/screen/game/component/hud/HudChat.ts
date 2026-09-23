/**
 * HudChat — 对局内聊天输入框（isComposing 时渲染 ChatInput）。
 *
 * 由 gui/screen/game/component/hud/HudChat.ts.js 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ChatInputModule from "gui/component/ChatInput"; // 孪生
import * as gservConfigModule from "network/gservConfig"; // 孪生
import * as ReactModule from "react"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：取命名空间成员
const ChatInput: any = (ChatInputModule as any).ChatInput;
const RECIPIENT_ALL: any = (gservConfigModule as any).RECIPIENT_ALL;
const RECIPIENT_TEAM: any = (gservConfigModule as any).RECIPIENT_TEAM;
const React: any = (ReactModule as any).default ?? ReactModule;

/**
 * HUD 聊天组件：未在输入态返回 null。
 * @param props messageList / chatHistory / strings / onSubmit / onCancel
 */
export function HudChat(props: {
  messageList: any;
  chatHistory: any;
  strings: any;
  onSubmit: (msg: any) => void;
  onCancel: () => void;
}): any {
  const { messageList, chatHistory, strings, onSubmit, onCancel } = props;
  if (!messageList.isComposing) return null;
  const forceColor = messageList.localPlayer?.color.asHexString() ?? "white";
  return React.createElement(ChatInput, {
    chatHistory,
    channels: [RECIPIENT_ALL, RECIPIENT_TEAM],
    className: "game-chat-input",
    forceColor,
    noCycleHint: true,
    submitEmpty: true,
    strings,
    onKeyDown: (e: any) => {
      if (e.key === "Escape") e.preventDefault();
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
    },
    onKeyUp: (e: any) => {
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
    },
    onSubmit: (e: any) => {
      if (e.value.length) onSubmit(e);
      else onCancel();
    },
    onCancel,
    onBlur: onCancel,
  });
}
