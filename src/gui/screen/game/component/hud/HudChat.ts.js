// === Reconstructed SystemJS module: gui/screen/game/component/hud/HudChat ===
// deps: ["gui/component/ChatInput","network/gservConfig","react"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/component/hud/HudChat",
  ["gui/component/ChatInput", "network/gservConfig", "react"],
  function (e, t) {
    "use strict";
    var n, o, l;
    t && t.id;
    return {
      setters: [
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
      ],
      execute: function () {
        e("HudChat", ({ messageList: e, chatHistory: t, strings: i, onSubmit: r, onCancel: s }) => {
          if (!e.isComposing) return null;
          var a = e.localPlayer?.color.asHexString() ?? "white";
          return l.default.createElement(n.ChatInput, {
            chatHistory: t,
            channels: [o.RECIPIENT_ALL, o.RECIPIENT_TEAM],
            className: "game-chat-input",
            forceColor: a,
            noCycleHint: !0,
            submitEmpty: !0,
            strings: i,
            onKeyDown: (e) => {
              ("Escape" === e.key && e.preventDefault(), e.stopPropagation(), e.nativeEvent.stopImmediatePropagation());
            },
            onKeyUp: (e) => {
              (e.stopPropagation(), e.nativeEvent.stopImmediatePropagation());
            },
            onSubmit: (e) => {
              e.value.length ? r(e) : s();
            },
            onCancel: s,
            onBlur: s,
          });
        });
      },
    };
  },
);
