/**
 * ServerList — 区域服务器列表（含在线/离线状态）。
 *
 * offline = !available || (pings.has && ping===undefined)；
 * 选中仅在非 offline 时允许 onChange。
 *
 * 由 gui/screen/mainMenu/login/ServerList.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React from "react"; // 孪生（react 外部依赖）
import { List, ListItem } from "gui/component/List"; // 已转换

/** 组件 props。 */
export interface ServerListProps {
  /** 当前选中区域 id。 */
  regionId: string;
  /** 区域列表。 */
  regions: any[];
  /** 区域 → ping。 */
  pings: Map<any, any>;
  /** i18n 字典。 */
  strings: any;
  /** 选中回调。 */
  onChange: (id: string) => void;
}

/** 服务器区域列表。 */
export const ServerList = ({
  regionId,
  regions,
  pings,
  strings: strings,
  onChange,
}: ServerListProps) =>
  React.createElement(
    List,
    { className: "server-list" },
    regions.map((region) => {
      var ping = pings.get(region);
      let offline = !region.available || (pings.has(region) && void 0 === ping);
      return React.createElement(
        ListItem,
        {
          key: region.id,
          selected: region.id === regionId && !offline,
          disabled: offline,
          onClick: () => !offline && onChange(region.id),
        },
        React.createElement("span", { className: "label" }, region.label),
        React.createElement(
          "span",
          { className: "ping" },
          offline
            ? React.createElement(
                "span",
                { className: "offline-text" },
                strings.get("TS:ServerOffline"),
              )
            : void 0 !== ping &&
                React.createElement(
                  "span",
                  { className: "online-text" },
                  strings.get("TS:ServerOnline"),
                ),
        ),
      );
    }),
  );
