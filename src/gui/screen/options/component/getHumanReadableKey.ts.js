// === Reconstructed SystemJS module: gui/screen/options/component/getHumanReadableKey ===
// deps: ["util/keyNames","util/userAgent"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/options/component/getHumanReadableKey",
  ["util/keyNames", "util/userAgent"],
  function (e, t) {
    "use strict";
    var r, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        e("getHumanReadableKey", (e) => {
          var t = s.isMac() || s.isIpad();
          let i = [];
          return (
            e.ctrlKey && i.push("Ctrl"),
            e.altKey && i.push(t ? "⌥" : "Alt"),
            e.shiftKey && i.push("Shift"),
            e.metaKey && i.push(t ? "⌘" : "Win"),
            void 0 !== e.keyCode ? (i.push(r.getKeyName(e.keyCode)), i.join("+")) : i.join("+") + "+"
          );
        });
      },
    };
  },
);
