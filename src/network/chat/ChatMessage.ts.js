// === Reconstructed SystemJS module: network/chat/ChatMessage ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("network/chat/ChatMessage", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("ChatRecipientType", (i = {})))[(e.Channel = 0)] = "Channel"),
        (e[(e.Page = 1)] = "Page"),
        (e[(e.Whisper = 2)] = "Whisper"));
    },
  };
});
