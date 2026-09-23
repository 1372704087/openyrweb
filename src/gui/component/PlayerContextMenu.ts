/**
 * PlayerContextMenu — 玩家右键浮层菜单（点击外部关闭）。
 *
 * 由 gui/component/PlayerContextMenu.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生（第三方）
import { List, ListItem } from "gui/component/List"; // 孪生（本批内一并转换）

// 孪生 any-shim：第三方 CJS 取 default
const React: any = (ReactModule as any).default;
const hooks: any = ReactModule as any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 玩家上下文菜单。
 * @param props - {items,onClose}
 */
export const PlayerContextMenu = (props: any): any => {
  const { items, onClose } = props;
  const rootRef = hooks.useRef(null);

  hooks.useEffect(() => {
    const onDown = (ev: any) => {
      if (rootRef.current && !rootRef.current.contains(ev.target)) onClose();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [onClose]);

  return React.createElement(
    List,
    { className: "player-context-menu", innerRef: rootRef },
    items.map((item: any, i: number) =>
      React.createElement(
        ListItem,
        {
          key: i,
          className: "player-context-menu-item",
          onClick: (ev: any) => {
            ev.stopPropagation();
            item.onClick();
          },
        },
        item.label,
      ),
    ),
  );
};
