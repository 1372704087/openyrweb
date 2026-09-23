/**
 * MapSel — 地图选择表单（模式列表 + 地图排序/搜索）。
 *
 * SortType 字符串枚举；sortMaps 按类型就地排序。
 *
 * 由 gui/screen/mainMenu/mapSel/component/MapSel.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React, { useEffect, useRef, useState } from "react"; // 孪生（react 外部依赖）
import { List, ListItem } from "gui/component/List"; // 已转换
import { Select } from "gui/component/Select"; // 已转换
import { Option } from "gui/component/Option"; // 已转换

/** 地图排序类型。 */
export enum SortType {
  /** 不排序。 */
  None = "",
  /** 名称升序。 */
  NameAsc = "nameAsc",
  /** 名称降序。 */
  NameDesc = "nameDesc",
  /** 槽位升序。 */
  MaxSlotsAsc = "maxSlotsAsc",
  /** 槽位降序。 */
  MaxSlotsDesc = "maxSlotsDesc",
}

/** 就地排序地图列表。 */
function sortMaps(maps: any[], type: SortType | string): any[] {
  switch (type) {
    case SortType.None:
      return maps;
    case SortType.NameAsc:
      return maps.sort((a, b) => a.mapTitle.localeCompare(b.mapTitle));
    case SortType.NameDesc:
      return maps.sort((a, b) => b.mapTitle.localeCompare(a.mapTitle));
    case SortType.MaxSlotsAsc:
      return maps.sort((a, b) => a.maxSlots - b.maxSlots);
    case SortType.MaxSlotsDesc:
      return maps.sort((a, b) => b.maxSlots - a.maxSlots);
    default:
      throw new Error(`Unsupported sort type "${type}"`);
  }
}

/** 组件 props。 */
export interface MapSelProps {
  /** i18n 字典。 */
  strings: any;
  /** 游戏模式列表。 */
  gameModes: any[];
  /** 地图列表。 */
  maps: any[];
  /** 当前模式。 */
  selectedGameMode: any;
  /** 当前地图名。 */
  selectedMapName: string;
  /** 初始排序。 */
  initialSortType: string;
  /** 选模式。 */
  onSelectGameMode: (mode: any) => void;
  /** 选地图（submit=true 双击）。 */
  onSelectMap: (name: string, submit?: boolean) => void;
  /** 排序变更。 */
  onSelectSort: (type: string) => void;
}

/** 地图选择表单。 */
export const MapSel = ({
  strings: strings,
  gameModes,
  maps,
  selectedGameMode,
  selectedMapName,
  initialSortType,
  onSelectGameMode,
  onSelectMap,
  onSelectSort,
}: MapSelProps) => {
  const selectedRef = useRef<any>(null);
  const [visible, setVisible] = useState(maps);
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState(initialSortType);
  useEffect(() => {
    applyFilter();
  }, [maps, search, sortType]);
  useEffect(() => {
    let id = setTimeout(() => selectedRef.current?.scrollIntoView(), 50);
    return () => clearTimeout(id);
  }, [maps]);
  const applyFilter = () => {
    setVisible(
      sortMaps(
        maps.filter((m) =>
          m.mapTitle.toLowerCase().includes(search.toLowerCase()),
        ),
        sortType,
      ),
    );
  };
  return React.createElement(
    "div",
    { className: "map-sel-form" },
    React.createElement(
      "div",
      { className: "map-sel-title" },
      strings.get("GUI:SelectEngagement"),
    ),
    React.createElement(
      "div",
      { className: "map-sel-body" },
      React.createElement(
        "div",
        { className: "map-sel-game-mode" },
        React.createElement(
          List,
          {
            title: strings.get("GUI:GameType"),
            className: "game-mode-list",
            tooltip: strings.get("STT:ScenarioListGameType"),
          },
          gameModes.map((mode) =>
            React.createElement(
              ListItem,
              {
                key: mode.id,
                selected: selectedGameMode === mode,
                onClick: () => onSelectGameMode(mode),
                "data-r-tooltip": strings.get(mode.description),
              },
              strings.get(mode.label),
            ),
          ),
        ),
      ),
      React.createElement(
        "div",
        { className: "map-sel-map" },
        React.createElement(
          List,
          {
            title: React.createElement(
              "div",
              { className: "map-list-title" },
              React.createElement("div", null, strings.get("GUI:GameMap")),
              React.createElement(
                "div",
                {
                  className: "map-list-sort",
                  "data-r-tooltip": strings.get("STT:SortBy"),
                },
                React.createElement("label", null, "⇵"),
                React.createElement(
                  Select,
                  {
                    initialValue: sortType,
                    onSelect: (value: string) => {
                      setSortType(value);
                      onSelectSort(value);
                    },
                    className: "map-list-sort-select",
                  },
                  React.createElement(Option, {
                    value: SortType.None,
                    label: strings.get("TS:SortNone"),
                  }),
                  React.createElement(Option, {
                    value: SortType.NameAsc,
                    label: strings.get("TS:SortName") + " ↓",
                  }),
                  React.createElement(Option, {
                    value: SortType.NameDesc,
                    label: strings.get("TS:SortName") + " ↑",
                  }),
                  React.createElement(Option, {
                    value: SortType.MaxSlotsAsc,
                    label: strings.get("TS:SortMaxSlots") + " ↓",
                  }),
                  React.createElement(Option, {
                    value: SortType.MaxSlotsDesc,
                    label: strings.get("TS:SortMaxSlots") + " ↑",
                  }),
                ),
              ),
            ),
            className: "map-list",
            tooltip: strings.get("STT:ScenarioListMaps"),
          },
          visible.map((map) => {
            var selected = map.mapName === selectedMapName;
            return React.createElement(
              ListItem,
              {
                key: map.mapName,
                selected,
                innerRef: selected ? selectedRef : null,
                onClick: () => onSelectMap(map.mapName, false),
                onDoubleClick: () => onSelectMap(map.mapName, true),
              },
              map.mapTitle,
            );
          }),
        ),
        React.createElement(
          "div",
          { className: "map-sel-search" },
          React.createElement(
            "label",
            null,
            React.createElement("span", null, strings.get("GUI:Search")),
            React.createElement("input", {
              type: "text",
              className: "new-message",
              value: search,
              onChange: (e: any) => {
                var value = e.target.value;
                setSearch(value);
              },
            }),
          ),
        ),
      ),
    ),
  );
};
