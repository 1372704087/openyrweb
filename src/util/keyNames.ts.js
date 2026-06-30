// === Reconstructed SystemJS module: util/keyNames ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("util/keyNames", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return (
    e("getKeyName", function (e) {
      var t = i.get(e);
      return void 0 !== t ? t : String.fromCharCode(e);
    }),
    {
      setters: [],
      execute: function () {
        i = new Map([
          [8, "Backspace"],
          [9, "Tab"],
          [12, "Clear"],
          [13, "Enter"],
          [19, "Pause/Break"],
          [20, "CapsLock"],
          [27, "Esc"],
          [32, "Space"],
          [33, "PageUp"],
          [34, "PageDown"],
          [35, "End"],
          [36, "Home"],
          [37, "ArrowLeft"],
          [38, "ArrowUp"],
          [39, "ArrowRight"],
          [40, "ArrowDown"],
          [44, "PrintScreen"],
          [45, "Insert"],
          [46, "Delete"],
          [91, "LeftWin/⌘"],
          [92, "RightWin/⌘"],
          ...new Array(10).fill(0).map((e, t) => [96 + t, "Num" + t]),
          [106, "Num*"],
          [107, "Num+"],
          [109, "Num-"],
          [110, "NumDel"],
          [111, "Num/"],
          ...new Array(32).fill(0).map((e, t) => [111 + t + 1, "F" + (t + 1)]),
          [144, "NumLock"],
          [145, "ScrollLock"],
          [186, ";"],
          [187, "="],
          [188, ","],
          [189, "-"],
          [190, "."],
          [191, "/"],
          [192, "`"],
          [219, "["],
          [220, "\\"],
          [221, "]"],
          [222, "'"],
        ]);
      },
    }
  );
});
