/**
 * ChannelOpIndicator — 频道管理员图标（operator 时显示 woloper.pcx）。
 *
 * 由 gui/component/ChannelOpIndicator.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生（第三方）
import { Image } from "gui/component/Image"; // 孪生（本批内一并转换）

// 孪生 any-shim：第三方 CJS 取 default
const React: any = (ReactModule as any).default;

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 管理员标识。
 * @param props - {operator}
 */
export const ChannelOpIndicator = (props: any): any =>
  React.createElement(
    "div",
    { className: "channel-op-indicator" },
    props.operator ? React.createElement(Image, { src: "woloper.pcx" }) : null,
  );
