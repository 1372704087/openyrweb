/**
 * ReplaySel — 回放选择列表 + 详情 + 存储警告。
 *
 * 未 keep 的回放名前加 "* "；双击直接加载。
 *
 * 由 gui/screen/replay/ReplaySel.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React, { useEffect, useRef } from "react"; // 孪生（react 外部依赖）
import { List, ListItem } from "gui/component/List"; // 已转换
import { StorageWarning } from "gui/screen/replay/StorageWarning"; // 孪生（本组内一并转换）
import { ReplayDetailsPane } from "gui/screen/replay/ReplayDetailsPane"; // 孪生（本组内一并转换）

/** 回放列表条目。 */
export interface ReplayMeta {
  /** 唯一 ID。 */
  id: string;
  /** 显示名。 */
  name: string;
  /** 是否已保存（keep）。 */
  keep?: boolean;
  /** 时间戳。 */
  timestamp?: number | string;
}

/** 组件 props。 */
export interface ReplaySelProps {
  /** i18n 字典。 */
  strings: any;
  /** 回放列表（undefined=加载中）。 */
  replays?: ReplayMeta[];
  /** 当前选中。 */
  selectedReplay?: ReplayMeta;
  /** 选中回放详情。 */
  selectedReplayDetails?: any;
  /** 选中回调（load=true 双击）。 */
  onSelectReplay: (replay: ReplayMeta, load?: boolean) => void;
}

/** 回放选择表单。 */
export const ReplaySel = ({
  strings: strings,
  replays,
  selectedReplay,
  selectedReplayDetails,
  onSelectReplay,
}: ReplaySelProps) => {
  const selectedRef = useRef<any>(null);
  useEffect(() => {
    selectedRef.current?.scrollIntoView();
  }, []);
  return React.createElement(
    "div",
    { className: "replay-sel-form" },
    React.createElement(
      List,
      { title: strings.get("GUI:SelectReplay"), className: "replay-list" },
      replays
        ? replays.map((replay) => {
            var selected = replay.id === selectedReplay?.id;
            return React.createElement(
              ListItem,
              {
                key: replay.id,
                selected,
                innerRef: selected ? selectedRef : null,
                onClick: () => onSelectReplay(replay),
                onDoubleClick: () => onSelectReplay(replay, true),
                style: { display: "flex" },
              },
              React.createElement(
                "div",
                { className: "replay-name" },
                replay.keep ? "" : "* ",
                replay.name,
              ),
              React.createElement(
                "div",
                { className: "replay-time", dir: "auto" },
                new Date(replay.timestamp as any).toLocaleString(),
              ),
            );
          })
        : React.createElement(
            ListItem,
            { style: { textAlign: "center" } },
            strings.get("GUI:LoadingEx"),
          ),
    ),
    selectedReplayDetails &&
      React.createElement(ReplayDetailsPane, {
        replayDetails: selectedReplayDetails,
        strings: strings,
      }),
    React.createElement(StorageWarning, { strings: strings }),
  );
};
