/**
 * ChannelUser — 频道玩家行（op 指示 + 段位 + 右键菜单）。
 *
 * tooltip 拼接名字/OPER/段位；本地玩家不弹菜单；点击/右键打开 PlayerContextMenu。
 *
 * 由 gui/component/ChannelUser.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ClassnamesModule from "classnames"; // 孪生（第三方）
import * as RankIndicatorModule from "gui/screen/mainMenu/lobby/component/RankIndicator"; // 孪生
import * as ReactModule from "react"; // 孪生（第三方）
import { ChannelOpIndicator } from "gui/component/ChannelOpIndicator"; // 孪生（本批内一并转换）
import { PlayerContextMenu } from "gui/component/PlayerContextMenu"; // 孪生（本批内一并转换）

// 孪生 any-shim：第三方/未转换模块取 default 或命名空间成员
const classnames: any = (ClassnamesModule as any).default ?? ClassnamesModule;
const RankIndicator: any = (RankIndicatorModule as any).RankIndicator;
const RANK_LABELS: any = (RankIndicatorModule as any).RANK_LABELS;
const React: any = (ReactModule as any).default;
const hooks: any = ReactModule as any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 频道玩家行。
 * @param props - {user,playerProfile,strings,menuItems,localUsername}
 */
export const ChannelUser = (props: any): any => {
  const { user, playerProfile, strings, menuItems, localUsername } = props;
  const [menuOpen, setMenuOpen] = hooks.useState(false);
  const isSelf = user.name === localUsername;

  let tooltip = user.name;
  if (user.operator) tooltip += " : " + strings.get("TXT_OPER");
  tooltip +=
    playerProfile?.rank !== undefined
      ? " : " + strings.get(RANK_LABELS.get(playerProfile.rankType))
      : " : " + strings.get("TXT_UNRANKED");

  const items = menuItems.map((item: any) => ({
    label: item.label,
    onClick: () => {
      item.onClick(user);
      setMenuOpen(false);
    },
  }));

  const openMenu = (ev: any) => {
    ev.preventDefault();
    ev.stopPropagation();
    if (!isSelf) setMenuOpen(true);
  };

  return React.createElement(
    "div",
    {
      className: classnames("player", { operator: user.operator, "menu-open": menuOpen }),
      "data-r-tooltip": tooltip,
      onClick: openMenu,
      onContextMenu: openMenu,
    },
    React.createElement(ChannelOpIndicator, { operator: user.operator }),
    React.createElement(RankIndicator, { playerProfile, strings }),
    React.createElement(
      "span",
      { className: "player-name-wrapper" },
      React.createElement("span", { className: "player-name" }, user.name),
      !isSelf &&
        items.length > 0 &&
        React.createElement(
          React.Fragment,
          null,
          React.createElement("span", { className: "player-menu-icon" }, "▼"),
          menuOpen && React.createElement(PlayerContextMenu, { items, onClose: () => setMenuOpen(false) }),
        ),
    ),
  );
};
