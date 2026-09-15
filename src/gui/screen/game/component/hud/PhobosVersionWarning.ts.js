// === Reconstructed SystemJS module: gui/screen/game/component/hud/PhobosVersionWarning ===
// deps: ["react","extensions/ExtensionHost","extensions/phobos/PhobosVersion"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// 对局 HUD 右上角版本警告（对应 Phobos GScreenClass_DrawText 的 VersionDescription 绘制）。

System.register(
  "gui/screen/game/component/hud/PhobosVersionWarning",
  ["react", "extensions/ExtensionHost", "extensions/phobos/PhobosVersion"],
  function (e, t) {
    "use strict";
    var s, h, p;
    t && t.id;
    return {
      setters: [
        function (e) {
          s = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          p = e;
        },
      ],
      execute: function () {
        e(
          "PhobosVersionWarning",
          () =>
            h.ExtensionHost.isEnabled("phobos") && p.shouldShowPhobosVersionWarning()
              ? s.createElement(
                  "div",
                  { className: "phobos-version-overlay" },
                  p.getPhobosVersionDescription(),
                )
              : null,
        );
      },
    };
  },
);
