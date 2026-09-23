/**
 * ExtensionsOpts — 扩展管理左右分栏（主开关 + 子功能 + 分组 fieldset）。
 *
 * 总开关关闭时子功能置灰；按 groupKey 拆 fieldset。
 *
 * 由 gui/screen/mainMenu/extensions/component/ExtensionsOpts.ts.js
 * 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React, { useState } from "react"; // 孪生（react 外部依赖）
import { List, ListItem } from "gui/component/List"; // 已转换
import { Image } from "gui/component/Image"; // 已转换
import { ExtensionsModel } from "gui/screen/mainMenu/extensions/component/ExtensionsModel"; // 孪生（本组内一并转换）

/** 组件 props。 */
export interface ExtensionsOptsProps {
  /** i18n 字典。 */
  strings: any;
}

/** 扩展设置面板。 */
export const ExtensionsOpts = ({ strings: strings }: ExtensionsOptsProps) => {
  var [snapshot, setSnapshot] = useState(() => ExtensionsModel.snapshot());
  var [selectedId, setSelectedId] = useState(() => {
    var snap = ExtensionsModel.snapshot();
    return snap.extensions[0] ? snap.extensions[0].id : "";
  });
  let current =
    snapshot.extensions.find((e) => e.id === selectedId) ||
    snapshot.extensions[0];
  function toggleMaster(id: string) {
    ExtensionsModel.setMaster(id, !current.master);
    setSnapshot(ExtensionsModel.snapshot());
  }
  // 子功能开关：总开关关闭时置灰不生效（分组框内提示行说明）。
  function toggleFeature(feat: any) {
    if (current && current.master) {
      ExtensionsModel.setFeature(current.id, feat.id, !feat.enabled);
      setSnapshot(ExtensionsModel.snapshot());
    }
  }
  function renderFeature(f: any) {
    return React.createElement(
      "div",
      {
        key: current.id + "." + f.id,
        className: "extensions-feature-item" + (current.master ? "" : " disabled"),
        "data-r-tooltip": f.hintKey ? strings.get(f.hintKey) : void 0,
        onClick: () => toggleFeature(f),
      },
      React.createElement(
        "label",
        {
          className: "extensions-feature-row",
          onClick: (e: any) => e.stopPropagation(),
        },
        React.createElement("input", {
          type: "checkbox",
          checked: f.enabled,
          disabled: !current.master,
          onChange: () => toggleFeature(f),
        }),
        React.createElement(
          "span",
          { className: "label" },
          strings.get(f.labelKey),
        ),
      ),
    );
  }
  // 子分类分组框：按 groupKey 拆成设置页同款 fieldset（legend=分类名）。
  function renderGroups() {
    var out: any[] = [];
    var groups: { key: string; items: any[] }[] = [];
    for (const f of current.features.filter((f: any) => f.groupKey)) {
      var g = groups.find((x) => x.key === f.groupKey);
      if (!g) groups.push((g = { key: f.groupKey, items: [] }));
      g.items.push(f);
    }
    for (const g of groups) {
      out.push(
        React.createElement(
          "fieldset",
          { key: current.id + ".group." + g.key },
          React.createElement("legend", null, strings.get(g.key)),
          g.items.map((f: any) => renderFeature(f)),
        ),
      );
    }
    return out;
  }
  return React.createElement(
    "div",
    { className: "opts extensions-opts" },
    React.createElement(
      "div",
      { className: "extensions-panes" },
      React.createElement(
        "div",
        { className: "extensions-pane extensions-pane-left" },
        React.createElement(
          List,
          {
            title: strings.get("TS:Extensions"),
            className: "extensions-ext-list",
          },
          snapshot.extensions.map((ext) =>
            React.createElement(
              ListItem,
              {
                key: ext.id,
                selected: !!current && current.id === ext.id,
                onClick: () => setSelectedId(ext.id),
                tooltip: strings.get("STT:Ext." + ext.id),
              },
              strings.get("TS:Ext." + ext.id),
            ),
          ),
        ),
      ),
      React.createElement(
        "div",
        { className: "extensions-pane extensions-pane-right" },
        current
          ? React.createElement(
              "div",
              { className: "extensions-groups" },
              React.createElement(
                "fieldset",
                { key: current.id + ".main" },
                React.createElement(
                  "legend",
                  null,
                  strings.get("TS:Ext.ListTitle"),
                ),
                React.createElement(
                  "div",
                  {
                    className:
                      "extensions-feature-item" +
                      (current.master ? "" : " disabled"),
                    "data-r-tooltip": strings.get("STT:Ext." + current.id),
                    onClick: () => toggleMaster(current.id),
                  },
                  React.createElement(
                    "label",
                    {
                      className: "extensions-feature-row",
                      onClick: (e: any) => e.stopPropagation(),
                    },
                    React.createElement("input", {
                      type: "checkbox",
                      checked: current.master,
                      onChange: () => toggleMaster(current.id),
                    }),
                    React.createElement(
                      "span",
                      { className: "label" },
                      strings.get("TS:Ext.MasterSwitch"),
                    ),
                    React.createElement(
                      "span",
                      {
                        className: "info",
                        title: strings.get("STT:Ext." + current.id),
                      },
                      React.createElement(Image, { src: "info.png" }),
                    ),
                  ),
                ),
                !current.master
                  ? React.createElement(
                      "div",
                      {
                        className: "extensions-feature-note",
                        key: current.id + ".masteroff",
                      },
                      strings.get("TS:Ext.MasterOffHint"),
                    )
                  : null,
                current.features
                  .filter((f: any) => !f.groupKey)
                  .map((f: any) => renderFeature(f)),
              ),
              renderGroups(),
            )
          : null,
      ),
    ),
    React.createElement(
      "p",
      { className: "extension-note" },
      strings.get("TS:ExtensionOptsHint"),
    ),
  );
};
