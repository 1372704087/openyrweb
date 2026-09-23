/**
 * MenuMpSlotText — 多人槽位文本 + 可选图标。
 *
 * 由 gui/screen/mainMenu/component/MenuMpSlotText.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React from "react"; // 孪生（react 外部依赖）
import { Image } from "gui/component/Image"; // 已转换

/** 组件 props。 */
export interface MenuMpSlotTextProps {
  /** 主文本。 */
  text: string;
  /** 图标路径（可空）。 */
  icon?: string | null;
  /** 悬浮提示。 */
  tooltip?: string;
}

/** 多人槽位文本组件。 */
export const MenuMpSlotText = ({
  text,
  icon,
  tooltip,
}: MenuMpSlotTextProps) =>
  React.createElement(
    "div",
    { className: "menu-mp-slot" },
    React.createElement("pre", { className: "menu-mp-slot-text" }, text),
    icon &&
      React.createElement(
        "div",
        { className: "menu-mp-slot-icon", "data-r-tooltip": tooltip },
        React.createElement(Image, { src: icon }),
      ),
  );
