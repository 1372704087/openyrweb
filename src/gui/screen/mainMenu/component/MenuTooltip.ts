/**
 * MenuTooltip — 侧栏按钮 data-r-tooltip 悬浮提示组件。
 *
 * 监听 monitorContainer 的 mousemove/mouseleave，向上找
 * `data-r-tooltip` 属性；文案变化后延迟测溢出，超出则加 scroll
 * class 并通过 `--tooltip-shift` 驱动横向滚动。
 *
 * 由 gui/screen/mainMenu/component/MenuTooltip.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React, { useEffect, useRef, useState } from "react"; // 孪生（react 外部依赖）
import classNames from "classnames"; // 孪生（classnames 外部依赖）

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 组件 props。 */
export interface MenuTooltipProps {
  /** 监视容器（提供 getElement()）。 */
  monitorContainer: any;
}

/** 菜单悬浮提示。 */
export const MenuTooltip = ({ monitorContainer: monitorContainer }: MenuTooltipProps) => {
  const [text, setText] = useState("");
  const [anim, setAnim] = useState(false);
  const [shift, setShift] = useState(0);
  const textRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let root = monitorContainer.getElement();
    let last: any;
    const onMove = (ev: any) => {
      let node: any = ev.target;
      if (node !== last) {
        last = node;
        let tip = node.getAttribute?.("data-r-tooltip");
        for (; node && node !== root && !tip; )
          ((node = node.parentElement), (tip = node.getAttribute("data-r-tooltip")));
        setText(tip || "");
      }
    };
    root.addEventListener("mousemove", onMove);
    root.addEventListener("mouseleave", onMove);
    return () => {
      root.removeEventListener("mousemove", onMove);
      root.removeEventListener("mouseleave", onMove);
    };
  }, []);

  useEffect(() => {
    setAnim(false);
    setShift(0);
    // 裁切层宽度随展开动画(0.4s)从 0 过渡,须等动画结束再测溢出量;
    // 滚动动画自身有 0.6s 延迟,460ms 时测量不会漏拍
    const t1 = setTimeout(() => setAnim(true), 10);
    const t2 = setTimeout(() => {
      const el = textRef.current;
      const parent = el && el.parentElement;
      if (el && parent) {
        const overflow = el.offsetWidth - parent.clientWidth;
        if (overflow > 2) setShift(Math.ceil(overflow));
      }
    }, 460);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [text]);

  return React.createElement(
    "div",
    { className: classNames("menu-tooltip", { anim }) },
    React.createElement(
      "div",
      { className: "menu-tooltip-clip" },
      React.createElement(
        "span",
        {
          ref: textRef,
          className: shift > 0 ? "menu-tooltip-text scroll" : "menu-tooltip-text",
          style: shift > 0 ? ({ "--tooltip-shift": -shift + "px" } as any) : void 0,
        },
        text,
      ),
    ),
  );
};
