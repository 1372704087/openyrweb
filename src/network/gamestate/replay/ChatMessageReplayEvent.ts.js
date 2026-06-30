// === Reconstructed SystemJS module: network/gamestate/replay/ChatMessageReplayEvent ===
// deps: ["util/Base64","util/string","network/gamestate/replay/ReplayEvent","network/gamestate/replay/ReplayEventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "network/gamestate/replay/ChatMessageReplayEvent",
  ["util/Base64", "util/string", "network/gamestate/replay/ReplayEvent", "network/gamestate/replay/ReplayEventType"],
  function (e, t) {
    "use strict";
    var r, s, i, a, n;
    t && t.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          a = e;
        },
      ],
      execute: function () {
        ((n = class extends i.ReplayEvent {
          constructor(e) {
            super(a.ReplayEventType.ChatMessage, e);
          }
          serialize() {
            return this.payload.playerId + ":" + r.Base64.encode(s.utf16ToBinaryString(this.payload.message));
          }
          unserialize(e) {
            var [t, i] = e.split(":"),
              t = Number(t),
              i = s.binaryStringToUtf16(r.Base64.decode(i));
            this.payload = { playerId: t, message: i };
          }
        }),
          e("ChatMessageReplayEvent", n));
      },
    };
  },
);
