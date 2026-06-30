// === Reconstructed SystemJS module: network/gamestate/replay/ReplayEventType ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("network/gamestate/replay/ReplayEventType", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("ReplayEventType", (i = {})))[(e.TurnActions = 0)] = "TurnActions"),
        (e[(e.ChatMessage = 1)] = "ChatMessage"),
        (e[(e.Taunt = 2)] = "Taunt"));
    },
  };
});
