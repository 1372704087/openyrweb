/**
 * ChatInput / IMPLICIT_CHANNEL_NAME — 聊天输入框（收件人轮换、历史、斜杠命令）。
 *
 * forwardRef 暴露 send()；Tab 轮换收件人、↑ 回填上次发送、Enter 提交、
 * Esc 取消；/w|/r 等斜杠命令改写 lastComposeTarget。
 *
 * 由 gui/component/ChatInput.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生（第三方）
import { ChatRecipientType } from "network/chat/ChatMessage"; // 已转换
import { RECIPIENT_ALL, RECIPIENT_TEAM } from "network/gservConfig"; // 已转换

// 孪生 any-shim：第三方 CJS 取 default / hooks
const React: any = (ReactModule as any).default;
const hooks: any = ReactModule as any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 隐式频道名（空串）。 */
export const IMPLICIT_CHANNEL_NAME = "";

/** ChatInput 内部实现（被 forwardRef 包裹）。 */
function ChatInputImpl(props: any, ref: any): any {
  const {
    chatHistory,
    channels,
    strings,
    className,
    tooltip,
    forceColor,
    noCycleHint,
    submitEmpty,
    onKeyDown,
    onKeyUp,
    onBlur,
    onCancel,
    onSubmit,
  } = props;

  const inputRef = hooks.useRef(null);
  const [cycleList, setCycleList] = hooks.useState(() => buildCycleList());
  const [recipient, setRecipient] = hooks.useState(() => {
    const stored = chatHistory?.lastComposeTarget.value;
    return isValidRecipient(stored)
      ? stored
      : { type: ChatRecipientType.Channel, name: channels[0] ?? IMPLICIT_CHANNEL_NAME };
  });
  const [pressedKey, setPressedKey] = hooks.useState();
  const [lastSent, setLastSent] = hooks.useState();
  const [focused, setFocused] = hooks.useState(false);
  const [cycled, setCycled] = hooks.useState(false);

  function buildCycleList(): any[] {
    const list = (channels.length ? channels : [IMPLICIT_CHANNEL_NAME]).map((name: string) => ({
      type: ChatRecipientType.Channel,
      name,
    }));
    if (chatHistory) {
      const from = chatHistory.lastWhisperFrom.value;
      const to = chatHistory.lastWhisperTo.value;
      if (from) list.push({ type: ChatRecipientType.Whisper, name: from });
      if (to && to !== from) list.push({ type: ChatRecipientType.Whisper, name: to });
    }
    return list;
  }

  function isValidRecipient(target: any): boolean {
    return !!target && (target.type !== ChatRecipientType.Channel || channels.includes(target.name));
  }

  function applyRecipient(next: any): void {
    if (chatHistory) chatHistory.lastComposeTarget.value = next;
    setRecipient(next);
  }

  hooks.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  hooks.useEffect(() => {
    if (!isValidRecipient(recipient)) {
      setRecipient({ type: ChatRecipientType.Channel, name: channels[0] ?? IMPLICIT_CHANNEL_NAME });
    }
  }, [channels]);

  hooks.useEffect(() => {
    if (chatHistory) {
      const onCompose = (next: any) => {
        if (recipient !== next && isValidRecipient(next)) {
          setRecipient(next);
          inputRef.current?.focus();
        }
      };
      const onWhisperChange = () => {
        setCycleList(buildCycleList());
      };
      chatHistory.lastComposeTarget.onChange.subscribe(onCompose);
      chatHistory.lastWhisperFrom.onChange.subscribe(onWhisperChange);
      chatHistory.lastWhisperTo.onChange.subscribe(onWhisperChange);
      return () => {
        chatHistory.lastComposeTarget.onChange.unsubscribe(onCompose);
        chatHistory.lastWhisperFrom.onChange.unsubscribe(onWhisperChange);
        chatHistory.lastWhisperTo.onChange.unsubscribe(onWhisperChange);
      };
    }
  }, [recipient, chatHistory, channels]);

  hooks.useImperativeHandle(
    ref,
    () => ({
      send() {
        const el = inputRef.current;
        if (!el) return;
        const value = el.value;
        if (value.length) {
          onSubmit({ recipient, value });
          el.value = "";
          el.focus();
          setLastSent(value);
        }
      },
    }),
    [recipient],
  );

  let prefixLabel: string;
  if (recipient.type === ChatRecipientType.Channel) {
    if (recipient.name === RECIPIENT_TEAM) prefixLabel = strings.get("TS:ToAllies");
    else if (recipient.name === RECIPIENT_ALL) prefixLabel = strings.get("TS:ToAll");
    else prefixLabel = "";
  } else if (recipient.type === ChatRecipientType.Whisper) {
    prefixLabel = strings.get("TS:To", recipient.name);
  } else {
    throw new Error(`Recipient type ${recipient.type} not implemented`);
  }

  const showCycleHint =
    !noCycleHint &&
    focused &&
    !cycled &&
    (cycleList.length > 1 || recipient.type === ChatRecipientType.Whisper)
      ? strings.get("TS:ChatCycleHint", "Tab")
      : undefined;

  function cycleRecipient(target: any): void {
    if (cycleList.length !== 1 || cycleList[0].name !== target.name) {
      let idx = cycleList.findIndex((r) => r.type === target.type && r.name === target.name);
      idx = idx === -1 ? 0 : (idx + 1) % cycleList.length;
      const next = cycleList[idx];
      setCycled(true);
      applyRecipient(next);
    }
  }

  return React.createElement(
    "div",
    { className },
    prefixLabel && React.createElement("label", { style: { color: forceColor } }, prefixLabel),
    React.createElement("input", {
      type: "text",
      autoComplete: "off",
      spellCheck: false,
      ref: inputRef,
      maxLength: 128,
      "data-r-tooltip": tooltip,
      placeholder: showCycleHint,
      style: { color: forceColor },
      onKeyDown: (ev: any) => {
        if (ev.key === "Tab") ev.preventDefault();
        if (!ev.repeat) setPressedKey(ev.key);
        onKeyDown?.(ev);
      },
      onKeyUp: (ev: any) => {
        const el = ev.target;
        if (ev.key === "Enter") {
          if (pressedKey === "Enter") {
            const value = el.value;
            if (value.length || submitEmpty) onSubmit({ recipient, value });
            if (value.length) {
              el.value = "";
              setLastSent(value);
            }
          }
        } else if (ev.key === "Tab") {
          if (pressedKey === "Tab") cycleRecipient(recipient);
        } else if (ev.key === "ArrowUp" && lastSent) {
          el.value = lastSent;
        } else if (ev.key === "Escape" && pressedKey !== "Process") {
          onCancel?.(el.value.length === 0);
          el.value = "";
        }
        onKeyUp?.(ev);
      },
      onChange: (ev: any) => {
        const value = ev.target.value;
        const whisperMatch = value.match(/^\/(?:page|whisper|w|msg|m) ([A-Za-z0-9-_']+) /i);
        if (whisperMatch) {
          applyRecipient({ type: ChatRecipientType.Whisper, name: whisperMatch[1] });
          ev.target.value = "";
        }
        const replyMatch = value.match(/^\/r(eply)? /i);
        if (replyMatch) {
          if (chatHistory?.lastWhisperFrom.value !== undefined) {
            applyRecipient({
              type: ChatRecipientType.Whisper,
              name: chatHistory.lastWhisperFrom.value,
            });
          }
          ev.target.value = "";
        }
        if (!whisperMatch && !replyMatch && showCycleHint !== undefined) setCycled(true);
      },
      onFocus: () => {
        setFocused(true);
      },
      onBlur: () => {
        setFocused(false);
        onBlur?.();
      },
    }),
  );
}

/** 带 ref 转发的聊天输入框。 */
export const ChatInput: any = hooks.forwardRef(ChatInputImpl);
