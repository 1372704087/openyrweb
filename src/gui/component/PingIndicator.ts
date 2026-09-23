/**
 * PingIndicator — 延迟指示图标（≤100 Good / ≤250 Average / 其余 Bad）。
 *
 * 由 gui/component/PingIndicator.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生（第三方）
import { Image } from "gui/component/Image"; // 孪生（本批内一并转换）

// 孪生 any-shim：第三方 CJS 取 default
const React: any = (ReactModule as any).default;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 延迟档位（与孪生一致：不导出到模块命名空间）。 */
const PingLevel = {
  /** 良好。 */
  Good: 1,
  /** 一般。 */
  Average: 2,
  /** 较差。 */
  Bad: 3,
} as const;

/** 延迟档位类型。 */
type PingLevel = (typeof PingLevel)[keyof typeof PingLevel];

/**
 * 毫秒 → 档位。
 * @param ms - 延迟毫秒
 */
function pingLevelFromMs(ms: number): PingLevel {
  return ms <= 100 ? PingLevel.Good : ms <= 250 ? PingLevel.Average : PingLevel.Bad;
}

/** 档位 → PCX 前缀。 */
const PING_ICONS = new Map<PingLevel, string>()
  .set(PingLevel.Bad, "pingr")
  .set(PingLevel.Average, "pingy")
  .set(PingLevel.Good, "pingg");

/**
 * 延迟指示。
 * @param props - {ping,strings}
 */
export const PingIndicator = (props: any): any => {
  const { ping, strings } = props;
  const tooltip = ping !== undefined ? strings.get("Msg:PingInfo", ping) : undefined;
  return React.createElement(
    "div",
    { className: "ping-indicator", "data-r-tooltip": tooltip, title: tooltip },
    ping !== undefined ? React.createElement(Image, { src: PING_ICONS.get(pingLevelFromMs(ping)) + ".pcx" }) : null,
  );
};
