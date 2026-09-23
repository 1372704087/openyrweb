/**
 * ServerPingIndicator — 服务器延迟指示（图标 + 文案）。
 *
 * ping ≤100 Good / ≤250 Average / 否则 Bad；图标 pcx 与 css class
 * 分别映射 pingg/pingy/pingr 与 ping-good/avg/bad。
 *
 * 由 gui/screen/mainMenu/login/ServerPingIndicator.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React from "react"; // 孪生（react 外部依赖）
import classNames from "classnames"; // 孪生（classnames 外部依赖）
import { Image } from "gui/component/Image"; // 已转换

/** 延迟等级。 */
enum PingLevel {
  /** 良好。 */
  Good = 1,
  /** 一般。 */
  Average = 2,
  /** 较差。 */
  Bad = 3,
}

/** 毫秒 → 等级。 */
const pingLevelOf = (ms: number): PingLevel =>
  ms <= 100 ? PingLevel.Good : ms <= 250 ? PingLevel.Average : PingLevel.Bad;

/** 等级 → 图标基名。 */
const ICON_BY_LEVEL = new Map<PingLevel, string>()
  .set(PingLevel.Bad, "pingr")
  .set(PingLevel.Average, "pingy")
  .set(PingLevel.Good, "pingg");

/** 等级 → css class。 */
const CLASS_BY_LEVEL = new Map<PingLevel, string>()
  .set(PingLevel.Bad, "ping-bad")
  .set(PingLevel.Average, "ping-avg")
  .set(PingLevel.Good, "ping-good");

/** 组件 props。 */
export interface ServerPingIndicatorProps {
  /** 延迟毫秒。 */
  ping: number;
  /** i18n 字典。 */
  strings: any;
}

/** 服务器 ping 指示条。 */
export const ServerPingIndicator = ({
  ping,
  strings: strings,
}: ServerPingIndicatorProps) => {
  var level = pingLevelOf(ping);
  return React.createElement(
    "div",
    { className: "server-ping" },
    React.createElement(
      "span",
      { className: classNames("ping-text", CLASS_BY_LEVEL.get(level)) },
      strings.get("TS:PingValue", ping),
    ),
    React.createElement(Image, { src: ICON_BY_LEVEL.get(level) + ".pcx" }),
  );
};
