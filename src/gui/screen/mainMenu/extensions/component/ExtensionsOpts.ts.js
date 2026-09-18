// === Reconstructed SystemJS module: gui/screen/mainMenu/extensions/component/ExtensionsOpts ===
// deps: ["react","gui/component/List","gui/component/Image","gui/screen/mainMenu/extensions/component/ExtensionsModel"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// 扩展页左右分栏：左列扩展，右列主开关 + 子功能开关（按子分类分组）。
// Phobos 版本警告画在对局 HUD。

System.register(
  "gui/screen/mainMenu/extensions/component/ExtensionsOpts",
  [
    "react",
    "gui/component/List",
    "gui/component/Image",
    "gui/screen/mainMenu/extensions/component/ExtensionsModel",
  ],
  function (e, t) {
    "use strict";
    var s, l, a, m;
    t && t.id;
    return {
      setters: [
        function (e) {
          s = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          m = e;
        },
      ],
      execute: function () {
        e(
          "ExtensionsOpts",
          ({ strings: t }) => {
            var [i, r] = s.useState(() => m.ExtensionsModel.snapshot()),
              [c, h] = s.useState(() => {
                var e = m.ExtensionsModel.snapshot();
                return e.extensions[0] ? e.extensions[0].id : "";
              });
            let u = i.extensions.find((e) => e.id === c) || i.extensions[0];
            function d(e) {
              (m.ExtensionsModel.setMaster(e, !u.master), r(m.ExtensionsModel.snapshot()));
            }
            // 子功能开关：总开关关闭时置灰不生效（列表内提示行说明）。
            function p(e) {
              u &&
                u.master &&
                (m.ExtensionsModel.setFeature(u.id, e.id, !e.enabled), r(m.ExtensionsModel.snapshot()));
            }
            function v(f) {
              return s.createElement(
                l.ListItem,
                {
                  key: u.id + "." + f.id,
                  disabled: !u.master,
                  tooltip: f.hintKey ? t.get(f.hintKey) : void 0,
                  onClick: () => p(f),
                },
                s.createElement(
                  "label",
                  { className: "extensions-feature-row", onClick: (e) => e.stopPropagation() },
                  s.createElement("input", {
                    type: "checkbox",
                    checked: f.enabled,
                    disabled: !u.master,
                    onChange: () => p(f),
                  }),
                  s.createElement("span", { className: "label" }, t.get(f.labelKey)),
                ),
              );
            }
            // 子分类：按 groupKey 分组渲染（如「新增或增强的逻辑」），无分组的紧跟主开关。
            function g() {
              var o = [],
                k = [];
              for (var f of u.features.filter((f) => f.groupKey)) {
                var q = k.find((x) => x.key === f.groupKey);
                q || k.push((q = { key: f.groupKey, items: [] }));
                q.items.push(f);
              }
              for (var q2 of k) {
                o.push(s.createElement(l.ListHeader, { key: u.id + ".group." + q2.key }, t.get(q2.key)));
                for (var f2 of q2.items) o.push(v(f2));
              }
              return o;
            }
            return s.createElement(
              "div",
              { className: "opts extensions-opts" },
              s.createElement(
                "div",
                { className: "extensions-panes" },
                s.createElement(
                  "div",
                  { className: "extensions-pane extensions-pane-left" },
                  s.createElement(
                    l.List,
                    { title: t.get("TS:Extensions"), className: "extensions-ext-list" },
                    i.extensions.map((e) =>
                      s.createElement(
                        l.ListItem,
                        {
                          key: e.id,
                          selected: !!u && u.id === e.id,
                          onClick: () => h(e.id),
                          tooltip: t.get("STT:Ext." + e.id),
                        },
                        t.get("TS:Ext." + e.id),
                      ),
                    ),
                  ),
                ),
                s.createElement(
                  "div",
                  { className: "extensions-pane extensions-pane-right" },
                  u
                    ? s.createElement(
                        l.List,
                        {
                          title: t.get("TS:Ext.ListTitle"),
                          className: "extensions-feature-list",
                        },
                        s.createElement(
                          l.ListItem,
                          {
                            key: u.id + ".__master",
                            tooltip: t.get("STT:Ext." + u.id),
                            onClick: () => d(u.id),
                          },
                          s.createElement(
                            "label",
                            { className: "extensions-feature-row", onClick: (e) => e.stopPropagation() },
                            s.createElement("input", {
                              type: "checkbox",
                              checked: u.master,
                              onChange: () => d(u.id),
                            }),
                            s.createElement("span", { className: "label" }, t.get("TS:Ext.MasterSwitch")),
                            s.createElement(
                              "span",
                              { className: "info", title: t.get("STT:Ext." + u.id) },
                              s.createElement(a.Image, { src: "info.png" }),
                            ),
                          ),
                        ),
                        !u.master
                          ? s.createElement(
                              l.ListHeader,
                              { key: u.id + ".masteroff" },
                              t.get("TS:Ext.MasterOffHint"),
                            )
                          : null,
                        u.features.filter((f) => !f.groupKey).map((f) => v(f)),
                        g(),
                      )
                    : null,
                ),
              ),
              s.createElement("p", { className: "extension-note" }, t.get("TS:ExtensionOptsHint")),
            );
          },
        );
      },
    };
  },
);
