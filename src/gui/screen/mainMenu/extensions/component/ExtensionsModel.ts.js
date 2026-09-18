// === Reconstructed SystemJS module: gui/screen/mainMenu/extensions/component/ExtensionsModel ===
// deps: ["extensions/ExtensionHost"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// 设置界面与 ExtensionHost 之间的薄适配：快照/写回。真正状态在 ExtensionConfig。

System.register(
  "gui/screen/mainMenu/extensions/component/ExtensionsModel",
  ["extensions/ExtensionHost"],
  function (e, t) {
    "use strict";
    var h, c;
    t && t.id;
    return {
      setters: [
        function (e) {
          h = e;
        },
      ],
      execute: function () {
        ((c = class {
          static snapshot() {
            var e = h.ExtensionHost.getConfig(),
              t = h.ExtensionHost.getRegistered();
            return {
              extensions: t.map((t) => ({
                id: t.id,
                name: t.name,
                master: e.getMaster(t.id),
                features: t.features.map((t2) => ({
                  id: t2.id,
                  labelKey: t2.labelKey,
                  hintKey: t2.hintKey,
                  groupKey: t2.groupKey,
                  enabled: e.getFeatureRaw(t.id, t2.id),
                })),
              })),
            };
          }
          static setMaster(e, t) {
            h.ExtensionHost.getConfig().setMaster(e, t);
          }
          static setFeature(e, t, i) {
            h.ExtensionHost.getConfig().setFeature(e, t, i);
          }
        }),
          e("ExtensionsModel", c));
      },
    };
  },
);
