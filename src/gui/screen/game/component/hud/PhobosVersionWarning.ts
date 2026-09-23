/**
 * PhobosVersionWarning — 对局 HUD 右上角 Phobos 版本警告条。
 *
 * 对应 Phobos GScreenClass_DrawText 的 VersionDescription 绘制；
 * ExtensionHost 启用 phobos 且 shouldShow 时显示。
 *
 * 由 gui/screen/game/component/hud/PhobosVersionWarning.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生
import * as ExtensionHostModule from "extensions/ExtensionHost"; // 孪生
import * as PhobosVersionModule from "extensions/phobos/PhobosVersion"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：取命名空间成员
const React: any = (ReactModule as any).default ?? ReactModule;
const ExtensionHost: any = ExtensionHostModule as any;
const PhobosVersion: any = PhobosVersionModule as any;

/**
 * 版本警告覆盖层组件。
 * @returns div 或 null
 */
export function PhobosVersionWarning(): any {
  if (ExtensionHost.isEnabled("phobos") && PhobosVersion.shouldShowPhobosVersionWarning()) {
    return React.createElement(
      "div",
      { className: "phobos-version-overlay" },
      PhobosVersion.getPhobosVersionDescription(),
    );
  }
  return null;
}
