/**
 * ModSel — 模组选择列表 + 详情侧栏。
 *
 * 激活模组前缀 "✔ "；不支持的模组后缀大写 UNSUPPORTED。
 *
 * 由 gui/screen/mainMenu/modSel/ModSel.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React, { useEffect, useRef } from "react"; // 孪生（react 外部依赖）
import { List, ListItem } from "gui/component/List"; // 已转换
import { ModDetailsPane } from "gui/screen/mainMenu/modSel/ModDetailsPane"; // 孪生（本组内一并转换）

/** 组件 props。 */
export interface ModSelProps {
  /** i18n 字典。 */
  strings: any;
  /** 模组列表（undefined=加载中）。 */
  mods?: any[];
  /** 当前激活模组。 */
  activeMod?: any;
  /** 当前选中模组。 */
  selectedMod?: any;
  /** 选中回调（load=true 双击）。 */
  onSelectMod: (mod: any, load?: boolean) => void;
}

/** 模组选择表单。 */
export const ModSel = ({
  strings: strings,
  mods,
  activeMod,
  selectedMod,
  onSelectMod,
}: ModSelProps) => {
  const selectedRef = useRef<any>(null);
  useEffect(() => {
    selectedRef.current?.scrollIntoView();
  }, []);
  return React.createElement(
    "div",
    { className: "mod-sel-form" },
    React.createElement(
      List,
      { title: strings.get("GUI:SelectMod"), className: "mod-list" },
      mods
        ? mods.map((mod) => {
            var selected = mod.id === selectedMod?.id;
            return React.createElement(
              ListItem,
              {
                key: mod.id,
                selected,
                innerRef: selected ? selectedRef : null,
                onClick: () => onSelectMod(mod),
                onDoubleClick: () => onSelectMod(mod, true),
                style: { display: "flex" },
              },
              React.createElement(
                "div",
                { className: "mod-name" },
                (mod === activeMod ? "✔ " : "") +
                  mod.name +
                  (mod.supported
                    ? ""
                    : ` (${strings.get("GUI:ModUnsupported").toUpperCase()})`),
              ),
            );
          })
        : React.createElement(
            ListItem,
            { style: { textAlign: "center" } },
            strings.get("GUI:LoadingEx"),
          ),
    ),
    selectedMod &&
      React.createElement(ModDetailsPane, {
        modLoaded: activeMod === selectedMod,
        modStatus: selectedMod.status,
        modDetails: selectedMod.meta,
        strings: strings,
      }),
  );
};
